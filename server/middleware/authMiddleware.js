import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isDatabaseConnected } from "../config/db.js";
import localStore from "../config/localStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "mhada_utsav_mandal_secret_key_2025_pune";

export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      if (!token || token.trim() === "" || token === "null" || token === "undefined") {
        return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      let user = null;

      // 1. If MongoDB is connected, load from MongoDB
      if (isDatabaseConnected()) {
        try {
          user = await User.findById(decoded.id).select("-passwordHash -password -resetTokenHash");
        } catch (dbErr) {
          console.warn("[Auth] Mongo lookup failed, checking local store:", dbErr.message);
        }
      }

      // 2. Fallback to local store
      if (!user) {
        const localUser = localStore.getUserById(decoded.id) || localStore.getUserByEmail(decoded.email);
        if (localUser) {
          user = {
            _id: localUser._id,
            id: localUser._id,
            name: localUser.name,
            email: localUser.email,
            role: localUser.role,
            isActive: localUser.isActive !== false,
            lockUntil: localUser.lockUntil,
            passwordChangedAt: localUser.passwordChangedAt
          };
        }
      }

      // Check if user exists
      if (!user) {
        return res.status(401).json({ success: false, message: "Not authorized, user account not found" });
      }

      // Check if account is active
      if (user.isActive === false) {
        return res.status(401).json({ success: false, message: "Account is inactive. Please contact system administrator." });
      }

      // Check if role is admin
      if (user.role !== "admin" && user.role !== "superadmin") {
        return res.status(403).json({ success: false, message: "Access forbidden. Admin role required." });
      }

      // Check if account is locked
      if (user.lockUntil && new Date(user.lockUntil).getTime() > Date.now()) {
        return res.status(423).json({ 
          success: false, 
          message: "Account temporarily locked due to repeated failed login attempts. Please try again later." 
        });
      }

      // Invalidate token if password was changed after this token was issued
      if (user.passwordChangedAt && decoded.iat) {
        const changedTimestamp = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
        if (decoded.iat < changedTimestamp) {
          return res.status(401).json({ 
            success: false, 
            message: "Password was recently changed. Please log in again with your new password." 
          });
        }
      }

      req.user = {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      return next();
    } catch (error) {
      console.error("[Auth] Token verification failed:", error.message);
      return res.status(401).json({ success: false, message: "Not authorized, session expired or invalid" });
    }
  }

  return res.status(401).json({ success: false, message: "Not authorized, no session token provided" });
};

export const generateToken = (id, extra = {}) => {
  return jwt.sign({ id, ...extra }, JWT_SECRET, {
    expiresIn: "24h" // Secure 24-hour expiration for admin sessions
  });
};
