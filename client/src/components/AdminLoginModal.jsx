import React, { useState } from "react";
import { X, Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2, ArrowLeft, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminLoginModal = ({ isOpen, onClose, onSuccess }) => {
  const { login, forgotPassword } = useAuth();
  
  // Modes: "login" | "forgot"
  const [mode, setMode] = useState("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.message || "लॉगिन अयशस्वी झाले. कृपया ईमेल व पासवर्ड तपासा.");
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    setIsForgotLoading(true);

    const res = await forgotPassword(forgotEmail);
    setIsForgotLoading(false);

    if (res.success) {
      setForgotSuccess(res.message);
    } else {
      setForgotError(res.message || "विनंती प्रक्रिया करताना त्रुटी आली.");
    }
  };

  const switchToForgot = () => {
    setError("");
    setForgotError("");
    setForgotSuccess("");
    setForgotEmail(email || "");
    setMode("forgot");
  };

  const switchToLogin = () => {
    setError("");
    setForgotError("");
    setForgotSuccess("");
    setMode("login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full border-2 border-gold-500 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-850 text-white p-5 flex items-center justify-between border-b-2 border-gold-400">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-maroon-800 rounded-xl border border-gold-500/40">
              {mode === "login" ? (
                <Lock className="w-5 h-5 text-gold-300" />
              ) : (
                <KeyRound className="w-5 h-5 text-gold-300" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-gold-200">
                {mode === "login" 
                  ? "व्यवस्थापक प्रवेशद्वार (Admin Login)" 
                  : "पासवर्ड रीसेट विनंती (Forgot Password)"}
              </h3>
              <p className="text-xs text-gold-100/80">
                म्हाडा टॉवर्स उत्सव मंडळ अधिकृत व्यवस्थापन
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gold-200 hover:text-white hover:bg-maroon-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          
          {/* MODE 1: LOGIN FORM */}
          {mode === "login" && (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    सोसायटी अधिकृत ईमेल / युझरनेम (Society Email / Username)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mhadatowersutsavmandal@gmail.com"
                      required
                      autoComplete="username"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      पासवर्ड (Password)
                    </label>
                    <button
                      type="button"
                      onClick={switchToForgot}
                      className="text-[11px] font-bold text-maroon-800 hover:text-maroon-950 hover:underline cursor-pointer"
                    >
                      पासवर्ड विसरलात? (Forgot Password?)
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-maroon-850 to-maroon-700 hover:from-maroon-800 hover:to-maroon-600 text-gold-300 font-bold text-xs sm:text-sm rounded-xl border border-gold-500/50 shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <span>पडताळणी सुरू आहे...</span>
                  ) : (
                    <>
                      <span>व्यवस्थापक लॉगिन करा</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* MODE 2: FORGOT PASSWORD FORM */}
          {mode === "forgot" && (
            <>
              {forgotError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">{forgotSuccess}</p>
                      <p className="text-xs text-emerald-700 mt-1.5">
                        कृपया तुमचा ईमेल इनबॉक्स तपासा आणि दिलेल्या सुरक्षित लिंकवर क्लिक करून नवीन पासवर्ड सेट करा. (Link expires in 15 minutes).
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={switchToLogin}
                    className="w-full py-2.5 px-4 bg-maroon-900 hover:bg-maroon-850 text-gold-300 font-bold text-xs sm:text-sm rounded-xl border border-gold-500/40 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>लॉगिन पृष्ठावर परत जा (Back to Login)</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-stone-600">
                    तुमचा नोंदणीकृत व्यवस्थापक ईमेल प्रविष्ट करा. आम्ही तुम्हाला पासवर्ड रीसेट करण्यासाठी एक सुरक्षित, मर्यादित वेळेची लिंक पाठवू.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      नोंदणीकृत ईमेल (Registered Admin Email)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="mhadatowersutsavmandal@gmail.com"
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                      />
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-maroon-850 to-maroon-700 hover:from-maroon-800 hover:to-maroon-600 text-gold-300 font-bold text-xs sm:text-sm rounded-xl border border-gold-500/50 shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isForgotLoading ? (
                      <span>लिंक पाठवत आहे...</span>
                    ) : (
                      <>
                        <span>रीसेट लिंक पाठवा (Send Reset Link)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={switchToLogin}
                      className="text-xs text-stone-600 hover:text-maroon-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>लॉगिन पृष्ठावर परत जा (Back to Login)</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminLoginModal;
