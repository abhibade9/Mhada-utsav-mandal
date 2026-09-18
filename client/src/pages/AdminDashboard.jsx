import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, ShieldCheck, Megaphone, Calendar, Phone, Settings, 
  Check, AlertTriangle, Menu, Flame, Sparkles, Building2, LogOut,
  SlidersHorizontal, LayoutDashboard, Newspaper, Image as ImageIcon,
  FileText, BarChart2, Users, Info, Globe, MessageSquare, Send,
  Receipt
} from "lucide-react";
import { useConfig } from "../context/ConfigContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import API from "../services/api";
import { triggerLiveSync } from "../utils/liveSync";
import { getMediaUrl, handleImageError } from "../utils/mediaUrl";

import TabApprovals from "./admin/TabApprovals";
import NewsletterManager from "./admin/NewsletterManager";
import WingsManager from "./admin/WingsManager";
import AartiScheduleManager from "./admin/AartiScheduleManager";
import AnnouncementManager from "./admin/AnnouncementManager";
import EventManager from "./admin/EventManager";
import GalleryManager from "./admin/GalleryManager";
import RulesManager from "./admin/RulesManager";
import PollManager from "./admin/PollManager";
import ContactManager from "./admin/ContactManager";
import MandalInfoManager from "./admin/MandalInfoManager";
import SidebarManager from "./admin/SidebarManager";
import GeneralSettings from "./admin/GeneralSettings";
import ScrollerManager from "./admin/ScrollerManager";
import WhatsAppBroadcastManager from "./admin/WhatsAppBroadcastManager";
import ReceiptManager from "./admin/ReceiptManager";
import VolunteerManager from "./admin/VolunteerManager";
import { FestiveBadge, FestiveButton } from "./admin/FestiveControls";

const AdminDashboard = ({ onClose }) => {
  const { 
    config, 
    refreshConfig, 
    updateTabs, 
    updateGeneral, 
    updateSidebar, 
    updateAartiSchedule,
    updateNewsletter,
    updateWings,
    updateRules,
    updateGallery,
    updatePoll,
    updateVolunteerSeva,
    updateMandalInfo,
    updateFestivalScheduleCard,
    updateScroller
  } = useConfig();
  const { admin, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState("tabs");
  const [notification, setNotification] = useState({ message: "", type: "success" });

  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [volunteersCount, setVolunteersCount] = useState(0);
  const [newVolunteersCount, setNewVolunteersCount] = useState(0);

  const notify = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification({ message: "", type: "success" }), 4000);
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await API.get("/announcements/admin/all");
      if (res.data.success) setAnnouncements(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await API.get("/events");
      if (res.data.success) setEvents(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await API.get("/contacts");
      if (res.data.success) setContacts(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVolunteersCount = async () => {
    try {
      const res = await API.get("/volunteers");
      if (res.data.success) {
        setVolunteersCount(res.data.count || res.data.data?.length || 0);
        const newOnes = (res.data.data || []).filter((v) => v.status === "New").length;
        setNewVolunteersCount(newOnes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchEvents();
    fetchContacts();
    fetchVolunteersCount();
  }, []);

  const handleCloseDashboard = () => {
    triggerLiveSync("all");
    if (onClose) onClose();
  };

  const handleToggleTab = async (tabKey) => {
    if (!config?.tabs || !config.tabs[tabKey]) return;
    const currentTab = config.tabs[tabKey];
    const updatedTabs = {
      ...config.tabs,
      [tabKey]: {
        ...currentTab,
        enabled: !currentTab.enabled,
        approved: !currentTab.enabled
      }
    };

    const res = await updateTabs(updatedTabs);
    if (res.success) {
      notify(`टॅब स्थिती अद्ययावत केली (${currentTab.labelMr})`);
      refreshConfig();
      triggerLiveSync("config");
    } else {
      notify("टॅब अद्ययावत करताना त्रुटी आली", "error");
    }
  };

  const handleSaveGeneral = async (generalData) => {
    const res = await updateGeneral(generalData);
    if (res.success) {
      notify("सर्वसाधारण सेटिंग्ज व स्क्रोलर मजकूर जतन केला!");
      triggerLiveSync("config");
    } else {
      notify("सेटिंग्ज जतन करताना त्रुटी आली", "error");
    }
  };

  // Quick Stats
  const activeTabsCount = config?.tabs 
    ? Object.values(config.tabs).filter(t => t.enabled).length 
    : 0;
  const totalTabsCount = config?.tabs ? Object.keys(config.tabs).length : 0;

  const subTabs = [
    { id: "tabs", label: language === "mr" ? "टॅब मान्यता" : "Tab Approvals", sublabel: language === "mr" ? "Tabs Approval" : "टॅब व्यवस्थापन", icon: ShieldCheck, badge: `${activeTabsCount}/${totalTabsCount}` },
    { id: "broadcast", label: language === "mr" ? "व्हॉट्सॲप ब्रॉडकास्ट" : "WhatsApp Broadcast", sublabel: language === "mr" ? "Broadcast" : "ब्रॉडकास्ट", icon: MessageSquare, badge: language === "mr" ? "थेट शेअर" : "Direct Share" },
    { id: "receipts", label: language === "mr" ? "पावती जनरेटर" : "Receipt Generator", sublabel: language === "mr" ? "Receipts" : "पावती", icon: Receipt, badge: language === "mr" ? "नवीन" : "New" },
    { id: "newsletter", label: language === "mr" ? "दैनिक वृत्तपत्र" : "Daily Newsletter", sublabel: language === "mr" ? "Newsletter" : "वृत्तपत्र", icon: Newspaper },
    { id: "wings", label: language === "mr" ? "सहभागी इमारती" : "Participating Wings", sublabel: language === "mr" ? "Wings" : "विंग्स", icon: Building2, badge: config?.wings?.length || 4 },
    { id: "aartiSchedule", label: language === "mr" ? "वेळापत्रक, फोटो व आरती" : "Festival Schedule & Photo", sublabel: language === "mr" ? "Schedule & Photo" : "वेळापत्रक व फोटो", icon: Flame, badge: language === "mr" ? "फोटो व नियोजन" : "Photo & Event" },
    { id: "scroller", label: language === "mr" ? "महत्वाचे अपडेट स्क्रोलर" : "Important Update Scroller", sublabel: language === "mr" ? "Scroller Ticker" : "स्क्रोलर व्यवस्थापन", icon: Megaphone, badge: config?.marqueeActive === false ? (language === "mr" ? "बंद (OFF)" : "OFF") : `${(config?.scrollerMessages || []).filter(m => m.isActive !== false).length} ${language === "mr" ? "सक्रिय" : "Active"}` },
    { id: "announcements", label: language === "mr" ? "महत्वाच्या सूचना" : "Announcements", sublabel: language === "mr" ? "Announcements" : "सूचना", icon: Megaphone, badge: announcements.length },
    { id: "events", label: language === "mr" ? "कार्यक्रम" : "Events Schedule", sublabel: language === "mr" ? "Events" : "कार्यक्रम", icon: Calendar, badge: events.length },
    { id: "gallery", label: language === "mr" ? "फोटो गॅलरी" : "Photo Gallery", sublabel: language === "mr" ? "Gallery" : "गॅलरी", icon: ImageIcon, badge: config?.gallery?.length || 0 },
    { id: "rules", label: language === "mr" ? "सोसायटी नियमावली" : "Society Rules", sublabel: language === "mr" ? "Rules" : "नियमावली", icon: FileText, badge: config?.rules?.length || 0 },
    { id: "volunteers", label: language === "mr" ? "स्वयंसेवक अर्ज" : "Volunteer Requests", sublabel: language === "mr" ? "Volunteers" : "स्वयंसेवक विनंत्या", icon: Users, badge: newVolunteersCount > 0 ? `${newVolunteersCount} ${language === "mr" ? "नवीन" : "New"}` : (volunteersCount > 0 ? volunteersCount : undefined) },
    { id: "polls", label: language === "mr" ? "मतदान व स्वयंसेवक" : "Polls & Seva", sublabel: language === "mr" ? "Polls & Seva" : "मतदान व सेवा", icon: BarChart2 },
    { id: "contacts", label: language === "mr" ? "विंग प्रतिनिधी व संपर्क" : "Wing Contacts", sublabel: language === "mr" ? "Contacts" : "संपर्क", icon: Phone, badge: contacts.length },
    { id: "mandalInfo", label: language === "mr" ? "मंडळ माहिती व कार्यकारणी" : "Mandal Info & Committee", sublabel: language === "mr" ? "Mandal Info" : "मंडळ माहिती", icon: Info },
    { id: "sidebar", label: language === "mr" ? "साइडबार नियंत्रण" : "Sidebar Control", sublabel: language === "mr" ? "Sidebar" : "साइडबार", icon: SlidersHorizontal },
    { id: "general", label: language === "mr" ? "सर्वसाधारण सेटिंग्ज" : "General Settings", sublabel: language === "mr" ? "General Settings" : "मंडळ सेटिंग्ज", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF5EC] via-[#FFFDF9] to-[#FAF5EC] text-[#260307] font-body">
      
      {/* 1. Top Festive Admin Header (Identical to Website Header) */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-white shadow-xl border-b-2 border-gold-500/80">
        {/* Top micro gold highlight line */}
        <div className="h-1 bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600" />

        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            
            {/* Left Brand Lockup */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                onClick={handleCloseDashboard}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-maroon-950 font-black text-xs sm:text-sm shadow-md transition transform active:scale-95 border border-gold-500/50 whitespace-nowrap flex-shrink-0"
                title={language === "mr" ? "वेबसाईटवर परत जा (Return to Website)" : "Return to Website"}
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-maroon-950 stroke-[2.5]" />
                <span className="hidden xs:inline">{language === "mr" ? "वेबसाईट" : "Website"}</span>
              </button>

              <div className="relative flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-600 rounded-full blur-xs opacity-80" />
                <img
                  src={getMediaUrl("/logo.jpg")}
                  alt="म्हाडा लोगो"
                  onError={handleImageError}
                  className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-gold-400 shadow-md"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-xs xs:text-sm sm:text-lg font-black text-gold-200 tracking-tight font-heading leading-tight truncate">
                    {language === "mr" ? "व्यवस्थापक कक्ष" : "Admin Panel"}{" "}
                    <span className="hidden sm:inline">({language === "mr" ? "Admin Panel" : "व्यवस्थापक"})</span>
                  </h1>
                  <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider text-gold-300 bg-maroon-800/90 px-2 py-0.5 rounded-full border border-gold-500/40">
                    {language === "mr" ? "अधिकृत" : "Official"}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gold-100/80 truncate">
                  <span className="hidden xs:inline">{language === "mr" ? "लॉगिन: " : "Logged in: "}</span>
                  <span className="text-gold-300 font-semibold truncate">{admin?.email}</span>
                </p>
              </div>
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              
              {/* WhatsApp Broadcast Quick Button */}
              <button
                onClick={() => setActiveSubTab("broadcast")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95 whitespace-nowrap flex-shrink-0 ${
                  activeSubTab === "broadcast"
                    ? "bg-emerald-500 text-white ring-2 ring-gold-400"
                    : "bg-emerald-700 hover:bg-emerald-600 text-white"
                }`}
                title={language === "mr" ? "व्हॉट्सॲप ब्रॉडकास्ट केंद्र" : "WhatsApp Broadcast Hub"}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{language === "mr" ? "व्हॉट्सॲप ब्रॉडकास्ट" : "WhatsApp Broadcast"}</span>
              </button>

              {/* Language Switcher Toggle (Matches Website Screen) */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-maroon-950 font-black text-xs sm:text-sm shadow-md transition transform active:scale-95 whitespace-nowrap flex-shrink-0"
                title="Change Language (भाषा बदला)"
              >
                <Globe className="w-3.5 h-3.5 text-maroon-900 flex-shrink-0" />
                <span className="whitespace-nowrap">{language === "mr" ? "English" : "मराठी"}</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-maroon-850 hover:bg-rose-900 text-rose-200 font-bold text-xs border border-rose-500/30 transition shadow-xs active:scale-95 whitespace-nowrap"
                title={language === "mr" ? "व्यवस्थापक खात्यातून बाहेर पडा (Logout)" : "Logout from Admin"}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === "mr" ? "लॉगआउट" : "Logout"}</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. Main Body Container */}
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Notification Toast */}
        {notification.message && (
          <div
            className={`p-3 sm:p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 sm:gap-3 shadow-md border-2 animate-fadeIn transition-all ${
              notification.type === "error"
                ? "bg-rose-50 border-rose-400 text-rose-950"
                : "bg-gradient-to-r from-emerald-50 to-emerald-100/70 border-emerald-400 text-emerald-950"
            }`}
          >
            {notification.type === "error" ? (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-200 flex items-center justify-center flex-shrink-0 text-rose-800">
                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
              </div>
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-200 flex items-center justify-center flex-shrink-0 text-emerald-800">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="font-heading break-words">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Quick Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EC] border-2 border-gold-300 shadow-2xs min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-600 truncate">
                {language === "mr" ? "सक्रिय टॅब्स" : "Active Tabs"}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
            </div>
            <div className="mt-1 flex items-baseline gap-1 truncate">
              <span className="text-lg sm:text-2xl font-black text-maroon-950 font-heading">
                {activeTabsCount}
              </span>
              <span className="text-[10px] sm:text-[11px] text-stone-500 font-bold truncate">
                {language === "mr" ? `/ ${totalTabsCount} सुरू` : `/ ${totalTabsCount} Active`}
              </span>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EC] border-2 border-gold-300 shadow-2xs min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-600 truncate">
                {language === "mr" ? "सूचना" : "Announcements"}
              </span>
              <Megaphone className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
            </div>
            <div className="mt-1 flex items-baseline gap-1 truncate">
              <span className="text-lg sm:text-2xl font-black text-maroon-950 font-heading">
                {announcements.length}
              </span>
              <span className="text-[10px] sm:text-[11px] text-stone-500 font-bold truncate">
                {language === "mr" ? "सक्रिय" : "Active"}
              </span>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EC] border-2 border-gold-300 shadow-2xs min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-600 truncate">
                {language === "mr" ? "कार्यक्रम" : "Events"}
              </span>
              <Calendar className="w-3.5 h-3.5 text-festive-saffron flex-shrink-0" />
            </div>
            <div className="mt-1 flex items-baseline gap-1 truncate">
              <span className="text-lg sm:text-2xl font-black text-maroon-950 font-heading">
                {events.length}
              </span>
              <span className="text-[10px] sm:text-[11px] text-stone-500 font-bold truncate">
                {language === "mr" ? "नोंदवलेले" : "Total Listed"}
              </span>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EC] border-2 border-gold-300 shadow-2xs min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-600 truncate">
                {language === "mr" ? "प्रतिनिधी" : "Representatives"}
              </span>
              <Building2 className="w-3.5 h-3.5 text-maroon-800 flex-shrink-0" />
            </div>
            <div className="mt-1 flex items-baseline gap-1 truncate">
              <span className="text-lg sm:text-2xl font-black text-maroon-950 font-heading">
                {contacts.length}
              </span>
              <span className="text-[10px] sm:text-[11px] text-stone-500 font-bold truncate">
                {language === "mr" ? "समन्वयक" : "Coordinators"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Subtab Navigation: Mobile Dropdown + Responsive Pill Bar */}
        <div className="w-full bg-[#FAF5EB] border-2 border-gold-400/80 rounded-2xl p-1.5 sm:p-2 shadow-sm space-y-2 sm:space-y-0">
          
          {/* Mobile Quick Selector */}
          <div className="sm:hidden relative">
            <select
              value={activeSubTab}
              onChange={(e) => setActiveSubTab(e.target.value)}
              className="w-full appearance-none bg-white text-maroon-950 font-black text-xs px-3 py-2.5 rounded-xl border-2 border-gold-400 focus:border-gold-500 shadow-xs cursor-pointer pr-9 outline-none"
            >
              {subTabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label} {tab.badge !== undefined ? `(${tab.badge})` : ""}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gold-600">
              <Settings className="w-4 h-4" />
            </div>
          </div>

          {/* Horizontal Pill Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border cursor-pointer select-none whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-r from-maroon-900 via-maroon-850 to-maroon-800 text-gold-200 border-gold-500 shadow-md transform scale-[1.02]"
                      : "bg-white text-maroon-950 hover:bg-gold-100/80 border-gold-300/80 shadow-xs"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-gold-300" : "text-maroon-800"}`} />
                  <span className="font-heading whitespace-nowrap">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-black whitespace-nowrap flex-shrink-0 ${
                        isActive
                          ? "bg-gold-400 text-maroon-950"
                          : "bg-gold-100 text-maroon-900 border border-gold-300"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Tab Views Rendered Inside Royal Theme */}
        <div className="space-y-6">
          {activeSubTab === "tabs" && (
            <TabApprovals config={config} onToggleTab={handleToggleTab} />
          )}

          {activeSubTab === "broadcast" && (
            <WhatsAppBroadcastManager
              config={config}
              announcements={announcements}
              events={events}
              onNotify={notify}
            />
          )}

          {activeSubTab === "newsletter" && (
            <NewsletterManager
              config={config}
              onSaveNewsletter={updateNewsletter}
              onNotify={notify}
            />
          )}

          {activeSubTab === "wings" && (
            <WingsManager
              config={config}
              onSaveWings={updateWings}
              onNotify={notify}
            />
          )}

          {activeSubTab === "aartiSchedule" && (
            <AartiScheduleManager
              config={config}
              onSaveAartiSchedule={updateAartiSchedule}
              onSaveFestivalScheduleCard={updateFestivalScheduleCard}
              onNotify={notify}
            />
          )}

          {activeSubTab === "scroller" && (
            <ScrollerManager
              config={config}
              onSaveScroller={updateScroller}
              onNotify={notify}
            />
          )}

          {activeSubTab === "announcements" && (
            <AnnouncementManager
              announcements={announcements}
              onRefresh={fetchAnnouncements}
              onNotify={notify}
              config={config}
            />
          )}

          {activeSubTab === "events" && (
            <EventManager
              events={events}
              onRefresh={fetchEvents}
              onNotify={notify}
              config={config}
            />
          )}

          {activeSubTab === "gallery" && (
            <GalleryManager
              config={config}
              onSaveGallery={updateGallery}
              onNotify={notify}
            />
          )}

          {activeSubTab === "rules" && (
            <RulesManager
              config={config}
              onSaveRules={updateRules}
              onNotify={notify}
            />
          )}

          {activeSubTab === "volunteers" && (
            <VolunteerManager
              onNotify={notify}
            />
          )}

          {activeSubTab === "polls" && (
            <PollManager
              config={config}
              onSavePoll={updatePoll}
              onSaveVolunteer={updateVolunteerSeva}
              onNotify={notify}
              onSwitchTab={setActiveSubTab}
            />
          )}

          {activeSubTab === "contacts" && (
            <ContactManager
              contacts={contacts}
              onRefresh={fetchContacts}
              onNotify={notify}
            />
          )}

          {activeSubTab === "mandalInfo" && (
            <MandalInfoManager
              config={config}
              onSaveMandalInfo={updateMandalInfo}
              onNotify={notify}
            />
          )}

          {activeSubTab === "sidebar" && (
            <SidebarManager
              config={config}
              onSaveSidebar={updateSidebar}
              onNotify={notify}
            />
          )}

          {activeSubTab === "receipts" && (
            <ReceiptManager
              config={config}
              onNotify={notify}
            />
          )}

          {activeSubTab === "general" && (
            <GeneralSettings
              config={config}
              onSaveGeneral={handleSaveGeneral}
              onSwitchTab={setActiveSubTab}
            />
          )}
        </div>

      </main>

    </div>
  );
};

export default AdminDashboard;
