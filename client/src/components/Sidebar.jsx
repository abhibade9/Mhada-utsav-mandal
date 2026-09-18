import React, { useEffect } from "react";
import { 
  X, LayoutDashboard, Sparkles, Bell, Calendar, Flame,
  BarChart2, Users, Building2, ShieldCheck, Info, Image, 
  PhoneCall, Shield, LogIn
} from "lucide-react";
import { useConfig } from "../context/ConfigContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getAllWingsShortLabel, getWingCodesText } from "../utils/wingUtils";

const ICON_MAP = {
  LayoutDashboard,
  Sparkles,
  Bell,
  Calendar,
  Flame,
  BarChart2,
  Users,
  Building2,
  ShieldCheck,
  Info,
  Image,
  PhoneCall,
  Shield,
  LogIn
};

const Sidebar = ({
  isOpen,
  onClose,
  activeItem = "dashboard",
  onSelectAction,
  onOpenAdminLogin,
  onOpenAdminDashboard
}) => {
  const { config } = useConfig();
  const { admin } = useAuth();
  const { language } = useLanguage();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter sidebar items dynamically based on enabled flags and tab approvals
  const rawItems = config?.sidebarMenu || [];
  const sidebarItems = rawItems.filter((item) => {
    if (item.enabled === false) return false;
    if (item.id === "aartiSchedule" && config?.tabs?.aarti?.enabled === false) return false;
    if (item.id === "schedule" && config?.tabs?.schedule?.enabled === false) return false;
    if (item.id === "upcoming" && config?.tabs?.cultural?.enabled === false && config?.tabs?.upcoming?.enabled === false) return false;
    if (item.id === "wings" && config?.tabs?.wings?.enabled === false) return false;
    if (item.id === "polls" && config?.tabs?.polls?.enabled === false) return false;
    if (item.id === "volunteer" && config?.tabs?.volunteer?.enabled === false) return false;
    if (item.id === "gallery" && config?.tabs?.gallery?.enabled === false) return false;
    if (item.id === "contacts" && config?.tabs?.contacts?.enabled === false) return false;
    if (item.id === "mandalInfo" && config?.tabs?.mandalInfo?.enabled === false) return false;
    return true;
  });

  const handleItemClick = (item) => {
    onClose();
    if (item.id === "adminLogin") {
      if (admin) {
        onOpenAdminDashboard();
      } else {
        onOpenAdminLogin();
      }
      return;
    }
    if (onSelectAction) {
      onSelectAction(item.id, item.targetSection);
    }
  };

  const settings = config?.sidebarSettings || {};
  const wingsCodes = config?.wings && config.wings.length > 0 
    ? config.wings.map(w => (language === "mr" ? (w.nameMr || `${w.code} विंग`) : (w.nameEn || `${w.code} Wing`))).join(" • ")
    : (config?.participatingWings || ["G", "H", "J", "K"]).map(w => (language === "mr" ? `${w} विंग` : `${w} Wing`)).join(" • ");

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dark semi-transparent backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      {/* Sidebar Drawer Panel */}
      <aside className="relative z-10 w-72 sm:w-80 max-w-[85vw] h-full bg-[#FAF5EB] border-r-2 border-gold-400 shadow-2xl flex flex-col justify-between animate-slideRight">
        
        {/* Drawer Top Header */}
        <div className="p-4 border-b border-[#E8DFC8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-maroon-850 border border-gold-400 flex items-center justify-center text-gold-300 font-black text-sm shadow-sm">
              ॐ
            </div>
            <div>
              <h2 className="font-heading font-black text-xs sm:text-sm text-[#2C1810] leading-tight">
                {language === "mr" ? (config?.mandalNameMr || "म्हाडा टॉवर्स उत्सव मंडळ") : (config?.mandalNameEn || "MHADA Towers Mandal")}
              </h2>
              <p className="text-[10px] text-maroon-800 font-bold uppercase tracking-wider">
                {language === "mr" ? "अधिकृत सूची" : "Navigation"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7A6B5D] hover:text-[#2C1810] hover:bg-[#F3EFE6] transition-colors"
            aria-label="मेनू बंद करा"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = ICON_MAP[item.icon] || Sparkles;
            const isCurrent = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-bold transition-all ${
                  isCurrent
                    ? "bg-maroon-850 text-gold-200 font-extrabold shadow-sm"
                    : "text-[#2C1810] hover:bg-[#F3EFE6]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isCurrent ? "text-gold-300" : "text-[#780C1E]"}`} />
                  <span>{language === "mr" ? item.labelMr : item.labelEn}</span>
                </div>

                {/* Badge rendering */}
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      item.badgeType === "pill-red"
                        ? "bg-red-700 text-white animate-pulse"
                        : item.badgeType === "badge-gold"
                        ? "bg-gold-200 text-maroon-900 border border-gold-400"
                        : "bg-[#E8DFC8] text-[#2C1810]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Card for Participating Buildings */}
        <div className="p-4 border-t border-[#E8DFC8] bg-white">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFFDF9] to-[#FAF5EC] border border-gold-300 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-maroon-800 flex-shrink-0" />
              <span className="font-heading font-extrabold text-xs text-maroon-950">
                {language === "mr" ? (settings.bottomCardTitle || "सहभागी इमारती") : (settings.bottomCardSubtitle || "Participating Buildings")}
              </span>
            </div>
            <p className="text-[11px] font-bold text-maroon-900 mt-1 truncate">
              {wingsCodes}
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5">
              {language === "mr" 
                ? (settings.bottomCardTagline || `॥ ${getAllWingsShortLabel(config, "mr")} - सहकार्य • शिस्त • अखंड भक्ती ॥`)
                : (settings.bottomCardTagline || `॥ ${getAllWingsShortLabel(config, "en")} - Cooperation • Discipline • Devotion ॥`)}
            </p>
          </div>
        </div>

      </aside>
    </div>
  );
};

export default Sidebar;
