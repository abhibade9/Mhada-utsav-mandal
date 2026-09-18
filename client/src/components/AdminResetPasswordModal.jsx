import React, { useState } from "react";
import { X, Lock, KeyRound, ShieldAlert, CheckCircle2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminResetPasswordModal = ({ isOpen, token, onClose, onSuccess }) => {
  const { resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("रिसेट टोकन उपलब्ध नाही. कृपया ईमेलमधील लिंक पुन्हा तपासा.");
      return;
    }

    if (newPassword.length < 8) {
      setError("पासवर्ड किमान ८ वर्णांचा असणे आवश्यक आहे (Minimum 8 characters).");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("नवीन पासवर्ड आणि पुष्टी पासवर्ड जुळत नाहीत (Passwords do not match).");
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(token, newPassword);
    setIsLoading(false);

    if (res.success) {
      setSuccess(res.message);
    } else {
      setError(res.message || "पासवर्ड रीसेट अयशस्वी झाला.");
    }
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  // Basic strength calculation
  const hasMinLen = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const strengthScore = [hasMinLen, hasNumber, hasUpper, hasSpecial].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full border-2 border-gold-500 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-850 text-white p-5 flex items-center justify-between border-b-2 border-gold-400">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-maroon-800 rounded-xl border border-gold-500/40">
              <KeyRound className="w-5 h-5 text-gold-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-gold-200">
                नवीन पासवर्ड तयार करा (Reset Password)
              </h3>
              <p className="text-xs text-gold-100/80">
                व्यवस्थापक सुरक्षितता प्रणाली
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

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{success}</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    तुमचा नवीन पासवर्ड सक्रिय झाला आहे. आता तुम्ही नवीन पासवर्डने सुरक्षित लॉगिन करू शकता.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-maroon-850 to-maroon-700 hover:from-maroon-800 hover:to-maroon-600 text-gold-300 font-bold text-xs sm:text-sm rounded-xl border border-gold-500/50 shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>आता लॉगिन करा (Proceed to Login)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  नवीन पासवर्ड (New Password) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="किमान ८ वर्ण (Min 8 chars)"
                    required
                    autoComplete="new-password"
                    className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  नवीन पासवर्डची पुष्टी करा (Confirm Password) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="पुन्हा पासवर्ड प्रविष्ट करा"
                    required
                    autoComplete="new-password"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Password strength meter */}
              {newPassword && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>पासवर्ड क्षमता (Strength):</span>
                    <span className="font-bold">
                      {strengthScore <= 1 && <span className="text-red-600">असुरक्षित (Weak)</span>}
                      {strengthScore === 2 && <span className="text-amber-600">मध्यम (Fair)</span>}
                      {strengthScore >= 3 && <span className="text-emerald-600">मजबूत (Strong)</span>}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full ${strengthScore >= 1 ? (strengthScore === 1 ? "bg-red-500" : strengthScore === 2 ? "bg-amber-500" : "bg-emerald-500") : "bg-gray-200"}`} />
                    <div className={`h-full flex-1 rounded-full ${strengthScore >= 2 ? (strengthScore === 2 ? "bg-amber-500" : "bg-emerald-500") : "bg-gray-200"}`} />
                    <div className={`h-full flex-1 rounded-full ${strengthScore >= 3 ? "bg-emerald-500" : "bg-gray-200"}`} />
                    <div className={`h-full flex-1 rounded-full ${strengthScore >= 4 ? "bg-emerald-600" : "bg-gray-200"}`} />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-maroon-850 to-maroon-700 hover:from-maroon-800 hover:to-maroon-600 text-gold-300 font-bold text-xs sm:text-sm rounded-xl border border-gold-500/50 shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span>पासवर्ड सेव्ह करत आहे...</span>
                ) : (
                  <>
                    <span>पासवर्ड रीसेट करा (Save New Password)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminResetPasswordModal;
