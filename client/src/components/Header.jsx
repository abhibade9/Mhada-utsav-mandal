import React, { useState, useEffect } from "react";
import { 
  Home, Flame, Calendar, Sparkles, Image, Phone, Users,
  LayoutDashboard, LogIn, LogOut, 
  Menu, X, QrCode, Globe, Mail, ChevronRight,
  Trophy, CalendarDays, Table
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useConfig } from "../context/ConfigContext";
import { useLanguage } from "../context/LanguageContext";
import { ExpandableTabs } from "./ui/expandable-tabs";
import { getMediaUrl, handleImageError } from "../utils/mediaUrl";

const Header = ({ 
  onOpenAdminLogin, 
  onOpenAdminDashboard, 
  onOpenSidebar,
  onOpenUpcomingCalendar,
  onOpenVolunteer
}) => {
  const { admin, logout } = useAuth();
  const { config } = useConfig();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top-section");

  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = [
        "top-section",
        "aarti-section",
        "gallery-section",
        "contacts-section",
      ];
      const scrollPosition = window.scrollY + 120;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (id === "top-section") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const cleanId = id.replace("-section", "");
    const el = document.getElementById(id) || document.getElementById(cleanId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const allNavTabs = [
    {
      id: "top-section",
      title: language === "mr" ? "मुख्य पृष्ठ" : "Home",
      icon: Home,
      iconColor: "text-gold-300",
      isActive: activeSection === "top-section",
      onClick: () => scrollToSection("top-section"),
    },
    {
      id: "aarti-section",
      title: language === "mr" ? "दैनिक महाआरती" : "Daily Aarti",
      icon: Flame,
      iconColor: "text-amber-400",
      isActive: activeSection === "aarti-section",
      onClick: () => scrollToSection("aarti-section"),
    },
    {
      id: "schedule-dropdown",
      title: language === "mr" ? "वेळापत्रक व कार्यक्रम" : "Schedule & Events",
      icon: Calendar,
      iconColor: "text-gold-300",
      isActive: false,
      onClick: () => {
        // Direct click opens the 10-day schedule pop-up window
        if (onOpenUpcomingCalendar) onOpenUpcomingCalendar("10days");
      },
      hasDropdown: true,
      dropdownItems: [
        {
          id: "10days",
          title: language === "mr" ? "१० दिवसांचे वेळापत्रक" : "10-Day Festival Schedule",
          subtitle: language === "mr" ? "गणेश चतुर्थी ते अनंत चतुर्दशी दैनिक पूजा व महाआरती" : "Daily pooja and aarti schedule",
          icon: Calendar,
          badge: language === "mr" ? "पॉप-अप" : "POP-UP",
          badgeColor: "bg-amber-400 text-maroon-950",
          onClick: () => {
            if (onOpenUpcomingCalendar) onOpenUpcomingCalendar("10days");
          },
        },
        {
          id: "upcomingModal",
          title: language === "mr" ? "आगामी व वार्षिक कार्यक्रम" : "Upcoming & Yearly Events",
          subtitle: language === "mr" ? "स्पर्धा, हळदी-कुंकू व वर्षभरातील उपक्रम (टेबल)" : "Competitions, sports & initiatives (Table)",
          icon: Sparkles,
          badge: language === "mr" ? "पॉप-अप" : "POP-UP",
          badgeColor: "bg-gold-400 text-maroon-950",
          onClick: () => {
            if (onOpenUpcomingCalendar) onOpenUpcomingCalendar("festival");
          },
        },
      ]
    },
    {
      id: "gallery-section",
      title: language === "mr" ? "छायाचित्रे" : "Photo Gallery",
      icon: Image,
      iconColor: "text-yellow-300",
      isActive: activeSection === "gallery-section",
      onClick: () => scrollToSection("gallery-section"),
    },
    {
      id: "contacts-section",
      title: language === "mr" ? "संपर्क कक्ष" : "Contacts",
      icon: Phone,
      iconColor: "text-emerald-400",
      isActive: activeSection === "contacts-section",
      onClick: () => scrollToSection("contacts-section"),
    },
    {
      id: "volunteer-tab",
      title: language === "mr" ? (config?.tabs?.volunteer?.labelMr || "सहभाग व सेवा") : (config?.tabs?.volunteer?.labelEn || "Volunteer Seva"),
      icon: Users,
      iconColor: "text-amber-400",
      isActive: false,
      onClick: () => {
        if (onOpenVolunteer) onOpenVolunteer();
      },
    },
  ];

  const navTabs = allNavTabs.filter(tab => {
    if (tab.id === "top-section") return true;
    if (tab.id === "aarti-section" && config?.tabs?.aarti?.enabled === false) return false;
    if (tab.id === "schedule-dropdown" && config?.tabs?.schedule?.enabled === false && config?.tabs?.cultural?.enabled === false) return false;
    if (tab.id === "gallery-section" && config?.tabs?.gallery?.enabled === false) return false;
    if (tab.id === "contacts-section" && config?.tabs?.contacts?.enabled === false) return false;
    if (tab.id === "volunteer-tab" && (config?.tabs?.volunteer?.enabled === false || config?.volunteerSeva?.active === false)) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-white shadow-xl border-b-2 border-gold-500/80">
      {/* Top micro gold highlight line */}
      <div className="h-1 bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* 1. Left-aligned Logo & Mandal Title lockup */}
          <div 
            className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group min-w-0 flex-1" 
            onClick={() => scrollToSection("top-section")}
            title="मुख्य पृष्ठावर जा (Scroll to top)"
          >
            <div className="relative flex-shrink-0">
              {/* Gold Ring Aura */}
              <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-600 rounded-full blur-xs opacity-80 group-hover:opacity-100 transition duration-300"></div>
              <img
                src={getMediaUrl("/logo.jpg")}
                alt="म्हाडा टॉवर्स उत्सव मंडळ लोगो"
                className="relative w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-gold-400 shadow-xl"
                onError={handleImageError}
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-xs font-bold tracking-wider uppercase text-gold-300 bg-maroon-800/90 px-2 sm:px-2.5 py-0.5 rounded-full border border-gold-500/40 truncate">
                  {config?.regNo 
                    ? (language === "mr" ? `नोंदणी क्र: ${config.regNo}` : `Reg No: ${config.regNo}`) 
                    : (language === "mr" ? "नोंदणी क्र: १२४३/२०२५ - पुणे" : "Reg No: 1243/2025 - Pune")}
                </span>

                {config?.festivalStatus && (
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs font-black tracking-wide text-emerald-300 bg-emerald-950/90 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-500/50 shadow-xs truncate animate-pulse">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="truncate">
                      {language === "mr" 
                        ? config.festivalStatus 
                        : (config.festivalStatus.includes("Live") ? config.festivalStatus : "Festival Live")}
                    </span>
                  </span>
                )}
              </div>

              <h1 className="text-xs xs:text-sm sm:text-xl md:text-2xl font-black text-gold-300 tracking-tight leading-snug drop-shadow-sm font-heading truncate">
                {language === "mr" 
                  ? (config?.mandalNameMr || "म्हाडा टॉवर्स उत्सव मंडळ")
                  : (config?.mandalNameEn || "MHADA Towers Utsav Mandal")
                }
              </h1>

              <p className="text-[11px] sm:text-xs text-gold-100/90 hidden sm:flex items-center gap-1 font-medium truncate">
                <span>
                  {language === "mr" 
                    ? (config?.addressMr || "पिंपरी वाघेरे, पिंपरी चिंचवड, पुणे - ४११०१७") 
                    : (config?.addressEn || "Pimpri Waghere, Pimpri Chinchwad, Pune - 411017")}
                </span>
              </p>
            </div>
          </div>

          {/* 2. Desktop Navigation Links (Expandable Tabs with Dropdown Menu for Events & Schedule) */}
          <nav className="hidden lg:flex items-center">
            <ExpandableTabs tabs={navTabs} />
          </nav>

          {/* 3. Action Buttons (Language Switcher, Admin) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            
            {/* Language Switcher Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-maroon-950 font-black text-xs sm:text-sm shadow-md transition transform active:scale-95 whitespace-nowrap flex-shrink-0"
              title="Change Language (भाषा बदला)"
            >
              <Globe className="w-3.5 h-3.5 text-maroon-900 flex-shrink-0" />
              <span className="whitespace-nowrap">{language === "mr" ? "English" : "मराठी"}</span>
            </button>

            {/* Admin Dashboard / Login Button */}
            {admin ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={onOpenAdminDashboard}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-maroon-800 hover:bg-maroon-700 text-gold-300 font-bold text-xs border border-gold-500/40 shadow transition whitespace-nowrap"
                  title="व्यवस्थापक डॅशबोर्ड"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                  <span className="hidden lg:inline whitespace-nowrap">{t("adminDashboard")}</span>
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-xl bg-maroon-850 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-500/30 transition flex-shrink-0"
                  title="लॉगआउट"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-maroon-850 hover:bg-maroon-800 text-gold-300 font-bold text-xs border border-gold-500/40 transition whitespace-nowrap flex-shrink-0"
                title="व्यवस्थापक लॉगिन"
              >
                <LogIn className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                <span className="hidden lg:inline whitespace-nowrap">{t("adminLogin")}</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-maroon-850 hover:bg-maroon-800 text-gold-300 border border-gold-500/40 transition flex items-center justify-center"
              aria-label="मेनू उघडा"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* 4. Mobile Slide-down Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-maroon-950/98 border-t border-gold-500/40 backdrop-blur-md px-4 py-4 space-y-3 animate-fadeIn">
          
          {/* Society Email badge on mobile */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-maroon-900/90 border border-gold-500/30 text-xs text-gold-200">
            <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
            <a href={`mailto:${config?.mandalInfo?.email || config?.email || "mhadatowersutsavmandal@gmail.com"}`} className="font-semibold underline truncate">
              {config?.mandalInfo?.email || config?.email || "mhadatowersutsavmandal@gmail.com"}
            </a>
          </div>

          {/* 2 Featured Pop-up Cards on Mobile (Top 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Pop-up 1: 10 Days Schedule */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenUpcomingCalendar) onOpenUpcomingCalendar("10days");
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-900/90 via-maroon-900 to-amber-950/90 border-2 border-gold-400 text-gold-200 shadow-md active:scale-98 transition text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-gold-400 text-maroon-950 font-bold flex-shrink-0 shadow-sm">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-gold-300 font-heading truncate">
                    {language === "mr" ? "१० दिवसांचे वेळापत्रक" : "10-Day Festival Schedule"}
                  </div>
                  <div className="text-[10px] text-gold-100/80 truncate">
                    {language === "mr" ? "दैनिक पूजा व महाआरती (पॉप-अप)" : "Daily Pooja & Aarti (Pop-up)"}
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gold-400 text-maroon-950 flex-shrink-0 ml-1">
                {language === "mr" ? "पॉप-अप" : "Pop-up"}
              </span>
            </button>

            {/* Pop-up 2: Upcoming & Yearly Events */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenUpcomingCalendar) onOpenUpcomingCalendar("festival");
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-maroon-900 via-maroon-850 to-amber-950/90 border-2 border-gold-400 text-gold-200 shadow-md active:scale-98 transition text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-gold-400 text-maroon-950 font-bold flex-shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-gold-300 font-heading truncate">
                    {language === "mr" ? "आगामी व वार्षिक कार्यक्रम" : "Upcoming & Yearly Events"}
                  </div>
                  <div className="text-[10px] text-gold-100/80 truncate">
                    {language === "mr" ? "स्पर्धा व उपक्रम टेबल (पॉप-अप)" : "Competitions & Table (Pop-up)"}
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gold-400 text-maroon-950 flex-shrink-0 ml-1">
                {language === "mr" ? "पॉप-अप" : "Pop-up"}
              </span>
            </button>

            {/* Pop-up 3: Volunteer Registration */}
            {config?.tabs?.volunteer?.enabled !== false && config?.volunteerSeva?.active !== false && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenVolunteer) onOpenVolunteer();
                }}
                className="w-full sm:col-span-2 flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-900/90 via-maroon-900 to-amber-950/90 border-2 border-gold-400 text-gold-200 shadow-md active:scale-98 transition text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-gold-400 text-maroon-950 font-bold flex-shrink-0 shadow-sm">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-gold-300 font-heading truncate">
                      {language === "mr" ? (config?.tabs?.volunteer?.labelMr || "सहभाग व सेवा (Volunteer Seva)") : (config?.tabs?.volunteer?.labelEn || "Volunteer Seva")}
                    </div>
                    <div className="text-[10px] text-gold-100/80 truncate">
                      {language === "mr" ? "स्वयंसेवक सेवा नोंदणी फॉर्म (पॉप-अप)" : "Volunteer Registration Form (Pop-up)"}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gold-400 text-maroon-950 flex-shrink-0 ml-1">
                  {language === "mr" ? "नोंदणी" : "Register"}
                </span>
              </button>
            )}
          </div>

          {/* General Section Links */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "top-section", title: language === "mr" ? "मुख्य पृष्ठ" : "Home", icon: Home },
              { id: "aarti-section", title: language === "mr" ? "दैनिक महाआरती" : "Daily Aarti", icon: Flame },
              { id: "gallery-section", title: language === "mr" ? "छायाचित्रे" : "Photo Gallery", icon: Image },
              { id: "contacts-section", title: language === "mr" ? "संपर्क कक्ष" : "Contacts", icon: Phone },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-bold border transition ${
                    activeSection === item.id
                      ? "bg-maroon-800 text-gold-300 border-gold-500/50 shadow-xs" 
                      : "bg-maroon-900/80 hover:bg-maroon-850 text-gold-200 border-gold-500/20"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 text-gold-400" />
                    <span className="truncate">{item.title}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gold-500/20 flex flex-col sm:flex-row gap-2">
            {admin ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminDashboard();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-maroon-800 text-gold-300 font-bold text-xs border border-gold-500/40"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t("adminDashboard")}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminLogin();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-maroon-800 text-gold-300 font-bold text-xs border border-gold-500/40"
              >
                <LogIn className="w-4 h-4" />
                <span>{t("adminLogin")}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
