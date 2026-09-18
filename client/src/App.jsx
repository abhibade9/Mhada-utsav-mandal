import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ConfigProvider, useConfig } from "./context/ConfigContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginModal from "./components/AdminLoginModal";
import AdminResetPasswordModal from "./components/AdminResetPasswordModal";
import Sidebar from "./components/Sidebar";
import UpcomingEventsCalendarModal from "./components/UpcomingEventsCalendarModal";
import { 
  ResidentPollsModal, 
  VolunteerSevaModal, 
  WingInfoModal, 
  FestivalGalleryModal 
} from "./components/InteractiveModals";

const MainApp = () => {
  const { admin } = useAuth();
  const { config, loading } = useConfig();
  const { language } = useLanguage();

  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const hasToken = Boolean(localStorage.getItem("mhada_admin_token"));
      return (path === "/admin" || path === "/admin/" || hash === "#admin") && hasToken;
    }
    return false;
  });

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const hasToken = Boolean(localStorage.getItem("mhada_admin_token"));
      const isReset = path.includes("reset-password") || window.location.search.includes("token=");
      return (path === "/admin" || path === "/admin/" || hash === "#admin") && !hasToken && !isReset;
    }
    return false;
  });

  // Password reset modal state
  const [resetToken, setResetToken] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("token") || "";
    }
    return "";
  });

  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      return path.includes("reset-password") || Boolean(params.get("token"));
    }
    return false;
  });

  // Upcoming & Yearly Events Calendar Modal State
  const [isUpcomingCalendarOpen, setIsUpcomingCalendarOpen] = useState(false);
  const [upcomingCalendarTab, setUpcomingCalendarTab] = useState("festival");

  // Sidebar & Interactive Feature Modals State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPollsOpen, setIsPollsOpen] = useState(false);
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  const [isWingsOpen, setIsWingsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Sync state with browser URL on popstate (Back/Forward button)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const hasToken = Boolean(localStorage.getItem("mhada_admin_token"));

      if (path === "/admin" || path === "/admin/" || hash === "#admin") {
        if (hasToken) {
          setIsAdminDashboardOpen(true);
          setIsAdminLoginModalOpen(false);
        } else {
          setIsAdminDashboardOpen(false);
          setIsAdminLoginModalOpen(true);
        }
      } else {
        setIsAdminDashboardOpen(false);
        setIsAdminLoginModalOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Handle section hash on initial load (e.g. #schedule, #aarti, #volunteer)
  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === "#volunteer" || hash === "#seva") {
      setIsVolunteerOpen(true);
    } else if (hash && hash !== "#admin" && hash.length > 1) {
      const targetId = hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(targetId) || document.getElementById(`${targetId}-section`);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 350);
    }
  }, []);

  const handleOpenAdminDashboard = () => {
    setIsAdminDashboardOpen(true);
    setIsAdminLoginModalOpen(false);
    if (window.location.pathname !== "/admin") {
      window.history.pushState({ page: "admin" }, "", "/admin");
    }
  };

  const handleCloseAdminDashboard = () => {
    setIsAdminDashboardOpen(false);
    if (window.location.pathname === "/admin") {
      window.history.pushState({ page: "home" }, "", "/");
    }
  };

  const handleOpenUpcomingCalendar = (tab = "festival") => {
    setUpcomingCalendarTab(tab);
    setIsUpcomingCalendarOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center text-maroon-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gold-300 border-t-maroon-800 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-maroon-850">
            ॐ
          </div>
        </div>
        <p className="mt-4 font-heading font-bold text-sm tracking-wide">
          {language === "mr" 
            ? "म्हाडा टॉवर्स उत्सव मंडळ माहिती केंद्र लोड होत आहे..." 
            : "Loading MHADA Towers Festival Portal..."}
        </p>
      </div>
    );
  }

  // If Admin opened dashboard view
  if (isAdminDashboardOpen && admin) {
    return (
      <AdminDashboard
        onClose={handleCloseAdminDashboard}
      />
    );
  }

  const handleSidebarAction = (itemId, targetSection) => {
    if (itemId === "schedule" || targetSection === "schedule") {
      const el = document.getElementById("schedule") || document.getElementById("schedule-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
      handleOpenUpcomingCalendar("10days");
      return;
    }
    if (itemId === "upcoming") {
      handleOpenUpcomingCalendar("festival");
      return;
    }
    if (itemId === "polls") {
      setIsPollsOpen(true);
      return;
    }
    if (itemId === "volunteer") {
      setIsVolunteerOpen(true);
      return;
    }
    if (itemId === "wings") {
      setIsWingsOpen(true);
      return;
    }
    if (itemId === "gallery") {
      setIsGalleryOpen(true);
      return;
    }
    if (itemId === "adminLogin") {
      if (admin) handleOpenAdminDashboard();
      else setIsAdminLoginModalOpen(true);
      return;
    }

    // Smooth scroll to target section
    let elementId = null;
    if (targetSection === "top") elementId = "top-section";
    else if (targetSection === "marquee") elementId = "marquee-section";
    else if (targetSection === "announcements") elementId = "marquee-section";
    else if (targetSection === "events") elementId = "events-section";
    else if (targetSection === "aarti") elementId = "aarti";
    else if (targetSection === "schedule") elementId = "schedule";
    else if (targetSection === "upcoming") elementId = "upcoming-section";
    else if (targetSection === "gallery") elementId = "gallery-section";
    else if (targetSection === "contacts") elementId = "contacts-section";
    else if (targetSection === "mandal-info") elementId = "mandal-info-section";

    if (elementId) {
      const el = document.getElementById(elementId) || document.getElementById(`${elementId}-section`) || document.getElementById(elementId.replace("-section", ""));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else if (targetSection === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] relative">
      
      {/* Off-canvas Festive Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectAction={handleSidebarAction}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onOpenAdminDashboard={handleOpenAdminDashboard}
      />

      {/* Top Header with Logo, Navigation Links, Society Email, Language Switcher, and Admin Access */}
      <Header
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onOpenAdminDashboard={handleOpenAdminDashboard}
        onOpenUpcomingCalendar={handleOpenUpcomingCalendar}
        onOpenVolunteer={() => setIsVolunteerOpen(true)}
      />

      {/* Main Public Festival Portal */}
      <main className="flex-1">
        <Home
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenUpcomingCalendar={handleOpenUpcomingCalendar}
        />
      </main>

      {/* Official Footer with 4 Building Names & Society Email */}
      <Footer
        onOpenAdminLogin={() => {
          if (admin) handleOpenAdminDashboard();
          else setIsAdminLoginModalOpen(true);
        }}
      />


      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => {
          setIsAdminLoginModalOpen(false);
          if (window.location.pathname === "/admin") {
            window.history.pushState({ page: "home" }, "", "/");
          }
        }}
        onSuccess={() => {
          setIsAdminLoginModalOpen(false);
          handleOpenAdminDashboard();
        }}
      />

      {/* Admin Reset Password Modal */}
      <AdminResetPasswordModal
        isOpen={isResetPasswordOpen}
        token={resetToken}
        onClose={() => {
          setIsResetPasswordOpen(false);
          setResetToken("");
          if (window.location.search.includes("token")) {
            window.history.pushState({}, "", "/");
          }
        }}
        onSuccess={() => {
          setIsResetPasswordOpen(false);
          setResetToken("");
          if (window.location.search.includes("token")) {
            window.history.pushState({}, "", "/");
          }
          setIsAdminLoginModalOpen(true);
        }}
      />

      {/* Upcoming & Yearly Events Calendar Structured Pop-Up Modal */}
      <UpcomingEventsCalendarModal
        isOpen={isUpcomingCalendarOpen}
        onClose={() => setIsUpcomingCalendarOpen(false)}
        defaultTab={upcomingCalendarTab}
      />

      {/* Interactive Feature Modals */}
      <ResidentPollsModal
        isOpen={isPollsOpen}
        onClose={() => setIsPollsOpen(false)}
      />

      <VolunteerSevaModal
        isOpen={isVolunteerOpen}
        onClose={() => setIsVolunteerOpen(false)}
      />

      <WingInfoModal
        isOpen={isWingsOpen}
        onClose={() => setIsWingsOpen(false)}
      />

      <FestivalGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ConfigProvider>
        <LanguageProvider>
          <MainApp />
        </LanguageProvider>
      </ConfigProvider>
    </AuthProvider>
  );
};

export default App;
