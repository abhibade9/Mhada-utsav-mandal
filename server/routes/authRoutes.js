import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import { generateToken, protectAdmin } from "../middleware/authMiddleware.js";
import { isDatabaseConnected } from "../config/db.js";
import localStore from "../config/localStore.js";
import emailService from "../services/emailService.js";

const router = express.Router();

// In-memory rate limiting helpers (IP-based window)
const loginAttemptMap = new Map();
const forgotAttemptMap = new Map();

const checkRateLimit = (map, key, limit = 10, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry || now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count += 1;
  return true;
};

// Clean up stale rate limits every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of loginAttemptMap.entries()) {
    if (now > v.resetAt) loginAttemptMap.delete(k);
  }
  for (const [k, v] of forgotAttemptMap.entries()) {
    if (now > v.resetAt) forgotAttemptMap.delete(k);
  }
}, 30 * 60 * 1000);

/**
 * @route   POST /api/auth/login
 * @desc    Admin Login with MongoDB & bcrypt passwordHash verification
 * @access  Public (Rate limited & Protected against brute force)
 */
router.post("/login", async (req, res) => {
  try {
    const clientIp = req.ip || req.headers["x-forwarded-for"] || "client-ip";
    if (!checkRateLimit(loginAttemptMap, clientIp, 15, 15 * 60 * 1000)) {
      return res.status(429).json({
        success: false,
        message: "खूप जास्त अयशस्वी प्रयत्न. कृपया १५ मिनिटांनी पुन्हा प्रयत्न करा. (Too many requests. Please try again in 15 minutes.)"
      });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "कृपया ईमेल व पासवर्ड प्रविष्ट करा (Please provide email and password)" 
      });
    }

    const cleanIdentifier = (email || "").toLowerCase().trim();
    const cleanPassword = (password || "").trim();

    let user = null;
    let isFromMongo = false;

    // 1. Check MongoDB if connected
    if (isDatabaseConnected()) {
      try {
        user = await User.findOne({
          $or: [
            { email: cleanIdentifier },
            { username: cleanIdentifier }
          ]
        });
        if (user) isFromMongo = true;
      } catch (dbError) {
        console.warn("[Auth] Mongo lookup failed, checking local store:", dbError.message);
      }
    }

    // 2. Check local JSON store fallback
    if (!user) {
      const localUser = localStore.getUserByEmail(cleanIdentifier);
      if (localUser) {
        user = localUser;
        isFromMongo = false;
      }
    }

    // Generic rejection if user does not exist
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "चुकीचा ईमेल किंवा पासवर्ड (Invalid credentials. Please try again.)" 
      });
    }

    // Check if account is inactive
    if (user.isActive === false) {
      return res.status(401).json({ 
        success: false, 
        message: "हे खाते निष्क्रिय आहे. कृपया व्यवस्थापकांशी संपर्क साधा. (Account is inactive. Please contact administrator.)" 
      });
    }

    // Check if account is temporarily locked
    const now = Date.now();
    if (user.lockUntil && new Date(user.lockUntil).getTime() > now) {
      const remainingMinutes = Math.ceil((new Date(user.lockUntil).getTime() - now) / (60 * 1000));
      return res.status(423).json({
        success: false,
        message: `वारंवार चुकीचे प्रयत्न झाल्यामुळे खाते तात्पुरते लॉक केले आहे. कृपया ${remainingMinutes} मिनिटांनी पुन्हा प्रयत्न करा. (Account temporarily locked. Please try again in ${remainingMinutes} minutes.)`
      });
    }

    // Verify password using bcrypt against passwordHash
    const passwordHash = user.passwordHash;
    const isMatch = passwordHash
      ? await bcrypt.compare(cleanPassword, passwordHash)
      : (user.password ? user.password === cleanPassword : false);

    if (!isMatch) {
      // Increment failed login attempts
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const updates = { failedLoginAttempts: attempts };

      // Temporary lockout after 5 consecutive failed attempts
      if (attempts >= 5) {
        updates.lockUntil = new Date(now + 15 * 60 * 1000); // 15 min lockout
      }

      if (isFromMongo) {
        await User.findByIdAndUpdate(user._id, updates);
      } else {
        localStore.updateUser(user._id, updates);
      }

      if (attempts >= 5) {
        return res.status(423).json({
          success: false,
          message: "५ पेक्षा जास्त चुकीचे प्रयत्न झाल्यामुळे खाते १५ मिनिटांसाठी लॉक झाले आहे. (Account temporarily locked for 15 minutes due to too many failed attempts.)"
        });
      }

      return res.status(401).json({ 
        success: false, 
        message: "चुकीचा ईमेल किंवा पासवर्ड (Invalid credentials. Please try again.)" 
      });
    }

    // Successful login: Reset failed attempts & unlock
    const successUpdates = {
      failedLoginAttempts: 0,
      lockUntil: null
    };

    if (isFromMongo) {
      await User.findByIdAndUpdate(user._id, successUpdates);
    } else {
      localStore.updateUser(user._id, successUpdates);
    }

    // Generate secure session token (24h)
    const token = generateToken(user._id, { email: user.email, role: user.role || "admin" });

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name || "म्हाडा उत्सव समिती अध्यक्ष (Admin)",
        email: user.email,
        role: user.role || "admin"
      }
    });
  } catch (error) {
    console.error("[Auth] Login error:", error.message);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate cryptographically secure single-use reset token and send email
 * @access  Public (Rate limited)
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const clientIp = req.ip || req.headers["x-forwarded-for"] || "client-ip";
    if (!checkRateLimit(forgotAttemptMap, clientIp, 5, 15 * 60 * 1000)) {
      return res.status(429).json({
        success: false,
        message: "खूप जास्त विनंत्या पाठवल्या आहेत. कृपया १५ मिनिटांनी पुन्हा प्रयत्न करा. (Too many requests. Please try again later.)"
      });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "कृपया नोंदणीकृत ईमेल प्रविष्ट करा (Please provide registered email)"
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;
    let isFromMongo = false;

    if (isDatabaseConnected()) {
      try {
        user = await User.findOne({ email: cleanEmail, role: "admin" });
        if (user) isFromMongo = true;
      } catch (dbErr) {
        console.warn("[Auth] Forgot password lookup failed in Mongo:", dbErr.message);
      }
    }

    if (!user) {
      const localUser = localStore.getUserByEmail(cleanEmail);
      if (localUser && localUser.role === "admin") {
        user = localUser;
        isFromMongo = false;
      }
    }

    // Only generate reset token if active admin account exists
    if (user && user.isActive !== false) {
      // 1. Generate 32-byte cryptographically secure random token
      const rawToken = crypto.randomBytes(32).toString("hex");

      // 2. Store only a SHA-256 hash in the database (never the raw token)
      const resetTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute expiration

      const updates = {
        resetTokenHash,
        resetTokenExpiresAt
      };

      if (isFromMongo) {
        await User.findByIdAndUpdate(user._id, updates);
      } else {
        localStore.updateUser(user._id, updates);
      }

      // 3. Build reset URL from APP_URL
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
      const resetUrl = `${appUrl}/admin/reset-password?token=${rawToken}`;

      // 4. Send email (dispatches real email or logs simulation in dev)
      try {
        await emailService.sendPasswordResetEmail({
          to: user.email,
          resetUrl,
          adminName: user.name || "Admin"
        });
      } catch (mailErr) {
        console.error("[Auth] Failed to dispatch password reset email:", mailErr.message);
      }
    }

    // Anti-enumeration: Always return the identical generic response
    return res.json({
      success: true,
      message: "जर हा ईमेल नोंदणीकृत असेल, तर पासवर्ड रिसेट करण्याची लिंक ईमेलवर पाठवली गेली आहे. (If an account exists for this email, a password reset link has been sent.)"
    });
  } catch (error) {
    console.error("[Auth] Forgot password error:", error.message);
    res.status(500).json({ success: false, message: "Server error processing password reset request" });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Validate reset token, hash new password, and invalidate token
 * @access  Public
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "टोकन आणि नवीन पासवर्ड आवश्यक आहे (Token and new password are required)"
      });
    }

    const cleanToken = token.trim();
    const cleanNewPass = newPassword.trim();

    if (cleanNewPass.length < 8) {
      return res.status(400).json({
        success: false,
        message: "पासवर्ड किमान ८ वर्णांचा असणे आवश्यक आहे (Password must be at least 8 characters long)"
      });
    }

    // Hash incoming token with SHA-256 to compare against stored hash
    const hashedToken = crypto.createHash("sha256").update(cleanToken).digest("hex");
    const now = new Date();

    let user = null;
    let isFromMongo = false;

    if (isDatabaseConnected()) {
      try {
        user = await User.findOne({
          resetTokenHash: hashedToken,
          resetTokenExpiresAt: { $gt: now }
        });
        if (user) isFromMongo = true;
      } catch (dbErr) {
        console.warn("[Auth] Reset token lookup failed in Mongo:", dbErr.message);
      }
    }

    if (!user) {
      const localUser = localStore.getUserByResetTokenHash(hashedToken);
      if (localUser && localUser.resetTokenExpiresAt && new Date(localUser.resetTokenExpiresAt).getTime() > Date.now()) {
        user = localUser;
        isFromMongo = false;
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "पासवर्ड रिसेट लिंक अवैध किंवा कालबाह्य झाली आहे (Password reset link is invalid or has expired)"
      });
    }

    // Hash the new password with bcrypt (salt factor 10)
    const newPasswordHash = await bcrypt.hash(cleanNewPass, 10);

    const updates = {
      passwordHash: newPasswordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0,
      lockUntil: null
    };

    if (isFromMongo) {
      await User.findByIdAndUpdate(user._id, updates);
    } else {
      localStore.updateUser(user._id, updates);
    }

    return res.json({
      success: true,
      message: "पासवर्ड यशस्वीरित्या बदलला आहे. कृपया नवीन पासवर्डने लॉगिन करा. (Password has been reset successfully. Please log in with your new password.)"
    });
  } catch (error) {
    console.error("[Auth] Reset password error:", error.message);
    res.status(500).json({ success: false, message: "Server error resetting password" });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get Current Logged In Admin Profile
 * @access  Private (Admin only)
 */
router.get("/me", protectAdmin, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Admin Logout endpoint
 * @access  Public
 */
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

export default router;
