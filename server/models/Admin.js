import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    lowercase: true,
    default: "admin"
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: "म्हाडा उत्सव समिती अध्यक्ष (Admin)"
  },
  role: {
    type: String,
    enum: ["admin", "superadmin"],
    default: "admin"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  passwordChangedAt: {
    type: Date,
    default: null
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  resetTokenHash: {
    type: String,
    default: null
  },
  resetTokenExpiresAt: {
    type: Date,
    default: null
  },
  googleId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compare entered password with stored passwordHash
adminSchema.methods.matchPassword = async function(enteredPassword) {
  if (this.passwordHash) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
  }
  // Fallback for legacy plain password if ever present
  if (this.password) {
    return enteredPassword === this.password;
  }
  return false;
};

// Check if account is temporarily locked
adminSchema.methods.isLocked = function() {
  return Boolean(this.lockUntil && new Date(this.lockUntil).getTime() > Date.now());
};

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema, "users");

export default Admin;
