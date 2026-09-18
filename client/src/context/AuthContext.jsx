import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem("mhada_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem("mhada_admin_token") || null);
  const [loading, setLoading] = useState(true);

  // Validate session on token change or initial mount
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await API.get("/auth/me");
          if (res.data?.success && res.data.user) {
            if (isMounted) {
              setAdmin(res.data.user);
              localStorage.setItem("mhada_admin_user", JSON.stringify(res.data.user));
            }
          } else {
            if (isMounted) logout();
          }
        } catch (err) {
          // If token is invalid, expired, or rejected with 401/403/423
          if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 423) {
            console.warn("[Auth] Session expired or invalid, logging out:", err.response?.data?.message || err.message);
            if (isMounted) logout();
          } else {
            // Transient network failure: keep current session state without setting hardcoded passwords
            console.warn("[Auth] Backend unreachable, keeping existing session state:", err.message);
          }
        }
      } else {
        if (isMounted) {
          setAdmin(null);
        }
      }
      if (isMounted) setLoading(false);
    };

    checkAuth();
    return () => { isMounted = false; };
  }, [token]);

  /**
   * Server-side login verifying MongoDB bcrypt hash
   */
  const login = async (emailOrUsername, password) => {
    const cleanIdentifier = (emailOrUsername || "").toLowerCase().trim();
    const cleanPassword = (password || "").trim();

    if (!cleanIdentifier || !cleanPassword) {
      return {
        success: false,
        message: "कृपया ईमेल व पासवर्ड प्रविष्ट करा (Please provide email and password)"
      };
    }

    try {
      const res = await API.post("/auth/login", { 
        email: cleanIdentifier, 
        password: cleanPassword 
      });

      if (res.data?.success && res.data.token) {
        localStorage.setItem("mhada_admin_token", res.data.token);
        localStorage.setItem("mhada_admin_user", JSON.stringify(res.data.user));
        setToken(res.data.token);
        setAdmin(res.data.user);
        return { success: true };
      }

      return { 
        success: false, 
        message: res.data?.message || "लॉगिन अयशस्वी झाले (Login failed)" 
      };
    } catch (err) {
      const msg = err.response?.data?.message || "लॉगिन अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा. (Login failed. Please try again.)";
      return { success: false, message: msg };
    }
  };

  /**
   * Request password reset link (anti-enumeration)
   */
  const forgotPassword = async (email) => {
    const cleanEmail = (email || "").toLowerCase().trim();
    if (!cleanEmail) {
      return {
        success: false,
        message: "कृपया नोंदणीकृत ईमेल प्रविष्ट करा (Please enter registered email)"
      };
    }

    try {
      const res = await API.post("/auth/forgot-password", { email: cleanEmail });
      return {
        success: true,
        message: res.data?.message || "पासवर्ड रीसेट लिंक ईमेलवर पाठवली आहे."
      };
    } catch (err) {
      const msg = err.response?.data?.message || "विनंती पाठवण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.";
      return { success: false, message: msg };
    }
  };

  /**
   * Submit new password using secure single-use reset token
   */
  const resetPassword = async (tokenString, newPassword) => {
    const cleanToken = (tokenString || "").trim();
    const cleanNewPass = (newPassword || "").trim();

    if (!cleanToken || !cleanNewPass) {
      return {
        success: false,
        message: "टोकन आणि नवीन पासवर्ड आवश्यक आहे."
      };
    }

    if (cleanNewPass.length < 8) {
      return {
        success: false,
        message: "पासवर्ड किमान ८ वर्णांचा असणे आवश्यक आहे (Minimum 8 characters)."
      };
    }

    try {
      const res = await API.post("/auth/reset-password", {
        token: cleanToken,
        newPassword: cleanNewPass
      });

      return {
        success: true,
        message: res.data?.message || "पासवर्ड यशस्वीरित्या बदलला आहे."
      };
    } catch (err) {
      const msg = err.response?.data?.message || "पासवर्ड रीसेट अयशस्वी. लिंक अवैध किंवा कालबाह्य झाली असावी.";
      return { success: false, message: msg };
    }
  };

  /**
   * Secure Logout
   */
  const logout = () => {
    try {
      API.post("/auth/logout").catch(() => {});
    } catch {}
    localStorage.removeItem("mhada_admin_token");
    localStorage.removeItem("mhada_admin_user");
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ 
      admin, 
      token, 
      loading, 
      login, 
      forgotPassword, 
      resetPassword, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
