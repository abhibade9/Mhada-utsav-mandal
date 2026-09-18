import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";
import { triggerLiveSync, subscribeLiveSync } from "../utils/liveSync";

const ConfigContext = createContext();

const DEFAULT_CONFIG = {
  mandalNameMr: "म्हाडा टॉवर्स उत्सव मंडळ",
  mandalNameEn: "MHADA Towers Utsav Mandal",
  addressMr: "पिंपरी वाघेरे, पिंपरी चिंचवड, पुणे - ४११०१७",
  regNo: "१२४३/२०२५ - पुणे",
  festivalYear: "२०२६",
  festivalStatus: "उत्सव सुरू आहे (Festival Live)",
  marqueeText: "गणपती बाप्पा मोरया! दैनिक महाआरती सकाळी ८:३० व रात्री ८:०० वाजता | सर्व भाविकांनी आरतीला उपस्थित राहावे.",
  marqueeActive: true,
  scrollerMessages: [
    {
      id: "msg_1",
      text: "7:30 PM. Kindly arrive 10 minutes earlier.",
      textMr: "संध्या. ७:३० वाजता. कृपया १० मिनिटे आधी यावे.",
      textEn: "7:30 PM. Kindly arrive 10 minutes earlier.",
      isActive: true,
      order: 1
    },
    {
      id: "msg_2",
      text: "All 5 Buildings (G • H • J • K • I) • MHADA Towers",
      textMr: "सर्व ५ इमारती (G • H • J • K • I) • म्हाडा टॉवर्स",
      textEn: "All 5 Buildings (G • H • J • K • I) • MHADA Towers",
      isActive: true,
      order: 2
    },
    {
      id: "msg_3",
      text: "Daily Maha Aarti: 08:30 AM & 08:00 PM",
      textMr: "दैनिक महाआरती: सकाळी ८:३० व रात्री ८:०० वाजता",
      textEn: "Daily Maha Aarti: 08:30 AM & 08:00 PM",
      isActive: true,
      order: 3
    },
    {
      id: "msg_4",
      text: "Shree Ganeshotsav 2026 • Digital Information Center",
      textMr: "श्री गणेशोत्सव २०२६ • डिजिटल माहिती केंद्र",
      textEn: "Shree Ganeshotsav 2026 • Digital Information Center",
      isActive: true,
      order: 4
    }
  ],
  participatingWings: ["G", "H", "J", "K"],
  whatsAppCommunityLink: "https://chat.whatsapp.com/sample-mhada-ganpati-community",
  emergencyHelpline: "+91 98220 11223",
  email: "mhadatowersutsavmandal@gmail.com",
  tabs: {
    arrival: { enabled: true, approved: true, labelMr: "श्रींचे आगमन", labelEn: "Ganpati Arrival", order: 1 },
    aarti: { enabled: true, approved: true, labelMr: "दैनिक महाआरती", labelEn: "Aarti Timings", order: 2 },
    schedule: { enabled: true, approved: true, labelMr: "१० दिवसांचे वेळापत्रक", labelEn: "10-Day Schedule", order: 3 },
    cultural: { enabled: true, approved: true, labelMr: "आगामी कार्यक्रम", labelEn: "Upcoming Events", order: 4 },
    gallery: { enabled: true, approved: true, labelMr: "छायाचित्रे", labelEn: "Photo Gallery", order: 5 },
    prasad: { enabled: false, approved: false, labelMr: "महाप्रसाद", labelEn: "Maha Prasad", order: 6 },
    visarjan: { enabled: false, approved: false, labelMr: "विसर्जन सोहळा", labelEn: "Visarjan Timings", order: 7 },
    announcements: { enabled: true, approved: true, labelMr: "महत्वाच्या सूचना", labelEn: "Announcements", order: 8 },
    ownersNotice: { enabled: false, approved: false, labelMr: "वर्गणी व सभा अपडेट", labelEn: "Owners & Mandal Info", order: 9 },
    rules: { enabled: true, approved: true, labelMr: "मंडळ नियमावली", labelEn: "Society Rules", order: 10 },
    whatsapp: { enabled: true, approved: true, labelMr: "व्हॉट्सॲप कम्युनिटी", labelEn: "WhatsApp Group QR", order: 11 },
    contacts: { enabled: true, approved: true, labelMr: "संपर्क व मदत केंद्र", labelEn: "Emergency & Committee", order: 12 },
    newsletter: { enabled: true, approved: true, labelMr: "दैनिक वृत्तपत्र", labelEn: "Daily Bulletin", order: 13 },
    wings: { enabled: true, approved: true, labelMr: "इमारती (४ विंग्ज)", labelEn: "4 Buildings", order: 14 },
    polls: { enabled: true, approved: true, labelMr: "रहिवासी मतदान", labelEn: "Resident Polls", order: 15 },
    volunteer: { enabled: true, approved: true, labelMr: "सहभाग व सेवा", labelEn: "Volunteer Seva", order: 16 },
    mandalInfo: { enabled: true, approved: true, labelMr: "मंडळ माहिती व सुरक्षा", labelEn: "Mandal Info", order: 17 }
  },
  sidebarMenu: [],
  sidebarSettings: {
    showFloatingTrigger: true,
    bottomCardTitle: "All 4 Buildings",
    bottomCardSubtitle: "Wings G, H, J, K",
    bottomCardTagline: "❤️ ४ विंग्स, एकच परिवार",
    bottomCardSubtag: "सहकार्य • शिस्त • अखंड भक्ती"
  },
  dailyAartiSection: {
    enabled: true,
    badgeMr: "दैनिक महाआरती व यजमान",
    badgeEn: "Daily Maha Aarti & Host Wings",
    titleMr: "दैनिक महाआरती व विंग यजमान",
    titleEn: "Daily Maha Aarti & Host Wings",
    subtitleMr: "दररोज सकाळी ०८:३० व रात्री ०८:०० वाजता मुख्य मंडपात महाआरती",
    subtitleEn: "Every day at 08:30 AM and 08:00 PM at Central Festive Pandal",
    countdownLabelMr: "पुढील महाआरतीसाठी शिल्लक वेळ",
    countdownLabelEn: "Time Remaining Until Next Aarti"
  },
  dailyAartiSchedule: [],
  newsletter: {
    enabled: true,
    startDate: "2026-09-07",
    endDate: "2026-09-16",
    showSelectDay: true,
    showTodayBadge: true,
    showCurrentDay: true,
    edition: "",
    dateStr: "",
    headline: "",
    subheadline: "",
    bappaDarshanQuote: "",
    darshanPhotoUrl: "",
    darshanPhotoCaption: "",
    todaysHighlights: [],
    yesterdayHighlights: [],
    todaysHostWing: "",
    hostLead: "",
    prasadSpecial: "",
    specialNote: ""
  },
  festivalScheduleCard: {
    eventNameMr: "श्री गणेशोत्सव २०२६ (१० दिवसीय भव्य उत्सव)",
    eventNameEn: "Shree Ganeshotsav 2026 (10-Day Grand Celebration)",
    eventDescriptionMr: "म्हाडा टॉवर्स संकुलातील सर्व ४ विंग्ज (G, H, J, K) संयुक्त विद्यमाने आयोजित १० दिवसीय अखंड गणेशोत्सव सोहळा.",
    eventDescriptionEn: "10-day grand festival celebration organized jointly by all 4 buildings (Wings G, H, J, K) of MHADA Towers.",
    plannerMr: "म्हाडा टॉवर्स उत्सव मंडळ व मध्यवर्ती सोसायटी समिती",
    plannerEn: "MHADA Towers Utsav Mandal & Central Society Committee",
    plannerDetailsMr: "सर्व ४ इमारतींचे विंग प्रमुख व स्वयंसेवक दल (विंग G, H, J, K)",
    plannerDetailsEn: "All 4 Building Wing Leads & Volunteer Squad (Wings G, H, J, K)",
    imageUrl: "",
    imageCaptionMr: "उत्सव वेळापत्रक व संपूर्ण कार्यक्रम रूपरेषा",
    imageCaptionEn: "Festival Schedule & Complete Event Blueprint"
  },
  wings: [],
  rules: [],
  gallery: [],
  poll: {
    active: true,
    question: "",
    options: [],
    totalVotes: 0
  },
  volunteerSeva: {
    active: true,
    title: "",
    description: "",
    roles: []
  },
  mandalInfo: {
    historyMr: "",
    historyEn: "",
    establishedYear: "२०२४",
    regDetails: "",
    mottoMr: "४ विंग्स, एकच परिवार (सहकार्य • शिस्त • अखंड भक्ती)",
    officeAddressMr: "",
    helpline: "",
    email: "mhadatowersutsavmandal@gmail.com",
    bankDetails: {
      accountName: "",
      bankName: "",
      accountNo: "",
      ifsc: "",
      upiId: ""
    },
    pillars: [],
    committeeMembers: [
      { roleMr: "अध्यक्षा", roleEn: "President", nameMr: "सौ. प्रियांका मयूर देशपांडे", nameEn: "Mrs. Priyanka Mayur Deshpande", wing: "जे – १५०३ (J-1503)", phone: "" },
      { roleMr: "उपाध्यक्षा", roleEn: "Vice President", nameMr: "सौ. हर्षानी निकुंभ", nameEn: "Mrs. Harshani Nikumbh", wing: "के – १००१ (K-1001)", phone: "" },
      { roleMr: "सचिव", roleEn: "Secretary", nameMr: "सौ. अर्चना सुधींद्र मठड", nameEn: "Mrs. Archana Sudhindra Mathad", wing: "जी – २२०४, जे – ५०३ (G-2204, J-503)", phone: "" },
      { roleMr: "खजिनदार", roleEn: "Treasurer", nameMr: "श्री. अनुराग माळी", nameEn: "Mr. Anurag Mali", wing: "के – १५०३ (K-1503)", phone: "" },
      { roleMr: "सदस्या", roleEn: "Committee Member", nameMr: "श्रीमती कल्पना अविनाश गाजरे", nameEn: "Mrs. Kalpana Avinash Gajare", wing: "के – १००२-१८०२ (K-1002-1802)", phone: "" },
      { roleMr: "सदस्या", roleEn: "Committee Member", nameMr: "सौ. शीतल प्रफुल साठे", nameEn: "Mrs. Sheetal Praful Sathe", wing: "जी – ११०४ (G-1104)", phone: "" },
      { roleMr: "सदस्या", roleEn: "Committee Member", nameMr: "सौ. कुंदा राजेंद्र सौंदणकर", nameEn: "Mrs. Kunda Rajendra Saundankar", wing: "एच – १०३ (H-103)", phone: "" },
      { roleMr: "सदस्य", roleEn: "Committee Member", nameMr: "श्री. सतीश बालकु फडके", nameEn: "Mr. Satish Balku Phadke", wing: "के – १५०१ (K-1501)", phone: "" },
      { roleMr: "सदस्या", roleEn: "Committee Member", nameMr: "सौ. आदिती साबू", nameEn: "Mrs. Aditi Sabu", wing: "जे – ११०२ (J-1102)", phone: "" },
      { roleMr: "सदस्य", roleEn: "Committee Member", nameMr: "श्री. तेजस माळी", nameEn: "Mr. Tejas Mali", wing: "जी – १००१ (G-1001)", phone: "" },
      { roleMr: "सदस्या", roleEn: "Committee Member", nameMr: "सौ. प्रतिमा प्रशांत कुलकर्णी", nameEn: "Mrs. Pratima Prashant Kulkarni", wing: "एच – १६०४ (H-1604)", phone: "" },
      { roleMr: "सदस्य", roleEn: "Committee Member", nameMr: "श्री. चेतनकुमार उत्तमराव सौंदाणे", nameEn: "Mr. Chetankumar Uttamrao Soundane", wing: "के – १०३ (K-103)", phone: "" }
    ]
  }
};

const sanitizeField = (val, fallback) => {
  if (typeof val === "string" && (val.includes("??") || val.includes("\ufffd"))) {
    return fallback;
  }
  return val || fallback;
};

const cleanFestivalScheduleCard = (card) => {
  if (!card) return DEFAULT_CONFIG.festivalScheduleCard;
  return {
    ...DEFAULT_CONFIG.festivalScheduleCard,
    ...card,
    eventNameMr: sanitizeField(card.eventNameMr, DEFAULT_CONFIG.festivalScheduleCard.eventNameMr),
    eventDescriptionMr: sanitizeField(card.eventDescriptionMr, DEFAULT_CONFIG.festivalScheduleCard.eventDescriptionMr),
    plannerMr: sanitizeField(card.plannerMr, DEFAULT_CONFIG.festivalScheduleCard.plannerMr),
    plannerDetailsMr: sanitizeField(card.plannerDetailsMr, DEFAULT_CONFIG.festivalScheduleCard.plannerDetailsMr),
    imageCaptionMr: sanitizeField(card.imageCaptionMr, DEFAULT_CONFIG.festivalScheduleCard.imageCaptionMr)
  };
};

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    try {
      const cached = localStorage.getItem("mhada_utsav_config");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.email === "mhadatowersutsav@gmail.com") parsed.email = "mhadatowersutsavmandal@gmail.com";
        if (parsed.mandalInfo?.email === "mhadatowersutsav@gmail.com") parsed.mandalInfo.email = "mhadatowersutsavmandal@gmail.com";
        if (!parsed.mandalInfo?.committeeMembers || parsed.mandalInfo.committeeMembers.length <= 5) {
          if (!parsed.mandalInfo) parsed.mandalInfo = {};
          parsed.mandalInfo.committeeMembers = DEFAULT_CONFIG.mandalInfo.committeeMembers;
        }
        const cleaned = {
          ...DEFAULT_CONFIG,
          ...parsed,
          scrollerMessages: (parsed.scrollerMessages && Array.isArray(parsed.scrollerMessages) && parsed.scrollerMessages.length > 0)
            ? parsed.scrollerMessages
            : DEFAULT_CONFIG.scrollerMessages,
          festivalScheduleCard: cleanFestivalScheduleCard(parsed.festivalScheduleCard)
        };
        return cleaned;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CONFIG;
  });
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const res = await API.get("/config");
      if (res.data?.success && res.data.config) {
        const serverConfig = res.data.config;
        const merged = {
          ...DEFAULT_CONFIG,
          ...serverConfig,
          scrollerMessages: (serverConfig.scrollerMessages && Array.isArray(serverConfig.scrollerMessages) && serverConfig.scrollerMessages.length > 0)
            ? serverConfig.scrollerMessages
            : DEFAULT_CONFIG.scrollerMessages,
          tabs: { ...DEFAULT_CONFIG.tabs, ...(serverConfig.tabs || {}) },
          sidebarSettings: { ...DEFAULT_CONFIG.sidebarSettings, ...(serverConfig.sidebarSettings || {}) },
          festivalScheduleCard: cleanFestivalScheduleCard(serverConfig.festivalScheduleCard),
          mandalInfo: {
            ...DEFAULT_CONFIG.mandalInfo,
            ...(serverConfig.mandalInfo || {}),
            bankDetails: {
              ...DEFAULT_CONFIG.mandalInfo.bankDetails,
              ...(serverConfig.mandalInfo?.bankDetails || {})
            }
          }
        };
        setConfig(merged);
        localStorage.setItem("mhada_utsav_config", JSON.stringify(merged));
      }
    } catch (err) {
      console.warn("Using cached/default festival config:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();

    const unsubscribe = subscribeLiveSync((payload) => {
      if (payload?.entity === "config" || payload?.entity === "all") {
        fetchConfig();
      }
    });

    return () => unsubscribe();
  }, []);

  const saveLocal = (newConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem("mhada_utsav_config", JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
    triggerLiveSync("config", newConfig);
  };

  const updateTabs = async (tabs) => {
    try {
      const res = await API.put("/config/tabs", { tabs });
      if (res.data.success) {
        const updated = { ...config, tabs: res.data.tabs };
        saveLocal(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const updated = { ...config, tabs };
      saveLocal(updated);
      return { success: true, message: "स्थानिकरित्या जतन झाले" };
    }
  };

  const updateGeneral = async (generalData) => {
    try {
      const res = await API.put("/config/general", generalData);
      if (res.data.success) {
        const updated = { ...config, ...res.data.config };
        saveLocal(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const updated = { ...config, ...generalData };
      saveLocal(updated);
      return { success: true, message: "स्थानिकरित्या जतन झाले" };
    }
  };

  const updateNewsletter = async (newsletter) => {
    try {
      const res = await API.put("/config/newsletter", { newsletter });
      if (res.data.success) {
        const updated = { ...config, newsletter: res.data.newsletter };
        saveLocal(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const updated = { ...config, newsletter };
      saveLocal(updated);
      return { success: true, message: "स्थानिकरित्या जतन झाले" };
    }
  };

  const updateWings = async (wings) => {
    try {
      const res = await API.put("/config/wings", { wings });
      if (res.data.success) {
        const updated = { ...config, wings: res.data.wings, participatingWings: res.data.wings.map(w => w.code) };
        saveLocal(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const updated = { ...config, wings, participatingWings: wings.map(w => w.code) };
      saveLocal(updated);
      return { success: true, message: "स्थानिकरित्या जतन झाले" };
    }
  };

  const updateRules = async (rules) => {
    try {
      const res = await API.put("/config/rules", { rules });
      if (res.data.success) {
        const updated = { ...config, rules: res.data.rules };
        saveLocal(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const updated = { ...config, rules };
      saveLocal(updated);
      return { success: true, message: "स्थानिकरित्या जतन झाले" };
    }
  };

  const updateGallery = async (gallery) => {
    try {
      const res = await API.put("/config/gallery", { gallery });
      if (res.data.success) {
        const updated = { ...config, gallery: res.data.gallery };
        saveLocal(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const updated = { ...config, gallery };
      saveLocal(updated);
      return { success: true, message: "स्थानिकरित्या जतन झाले" };
    }
  };

  const updatePoll = async (poll) => {
    try {
      const res = await API.put("/config/poll", { poll });
      if (res.data.success) {
        const updated = { ...config, poll: res.data.poll };
        saveLocal(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const updated = { ...config, poll };
      saveLocal(updated);
      return { success: true, message: "स्थानिकरित्या जतन झाले" };
    }
  };

  const castVote = async (optionId) => {
    try {
      const res = await API.post("/config/poll/vote", { optionId });
      if (res.data.success) {
        const updated = { ...config, poll: res.data.poll };
        saveLocal(updated);
        return { success: true, poll: res.data.poll };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      // Optimistic local update
      if (config.poll && config.poll.options) {
        const newOpts = config.poll.options.map(opt => 
          opt.id === Number(optionId) ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
        );
        const updatedPoll = { ...config.poll, options: newOpts, totalVotes: (config.poll.totalVotes || 0) + 1 };
        const updated = { ...config, poll: updatedPoll };
        saveLocal(updated);
        return { success: true, poll: updatedPoll };
      }
      return { success: false, message: "मत नोंदवता आले नाही" };
    }
  };

  const updateVolunteerSeva = async (volunteerSeva) => {
    try {
      const res = await API.put("/config/volunteer", { volunteerSeva });
      if (res.data.success) {
        const updated = { ...config, volunteerSeva: res.data.volunteerSeva };
        saveLocal(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const updated = { ...config, volunteerSeva };
      saveLocal(updated);
      return { success: true, message: "स्थानिकरित्या जतन झाले" };
    }
  };

  const updateSidebar = async (sidebarData) => {
    try {
      const res = await API.put("/config/sidebar", sidebarData);
      if (res.data.success) {
        const updated = {
          ...config,
          sidebarMenu: res.data.sidebarMenu || sidebarData.sidebarMenu,
          sidebarSettings: res.data.sidebarSettings || sidebarData.sidebarSettings
        };
        saveLocal(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const updated = {
        ...config,
        ...(sidebarData.sidebarMenu ? { sidebarMenu: sidebarData.sidebarMenu } : {}),
        ...(sidebarData.sidebarSettings ? { sidebarSettings: sidebarData.sidebarSettings } : {})
      };
      saveLocal(updated);
      return { success: true, message: "स्थानिकरित्या जतन झाले" };
    }
  };

  const updateAartiSchedule = async (dailyAartiSchedule, extraConfig = {}) => {
    try {
      const payload = { dailyAartiSchedule, ...extraConfig };
      const res = await API.put("/config/aarti-schedule", payload);
      if (res.data.success) {
        const updated = { 
          ...config, 
          dailyAartiSchedule: res.data.dailyAartiSchedule,
          ...(res.data.dailyAartiSection ? { dailyAartiSection: res.data.dailyAartiSection } : {}),
          ...(res.data.festivalScheduleCard ? { festivalScheduleCard: res.data.festivalScheduleCard } : {}),
          ...(res.data.tabs ? { tabs: res.data.tabs } : {})
        };
        saveLocal(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const updated = { 
        ...config, 
        dailyAartiSchedule,
        ...(extraConfig.dailyAartiSection ? { dailyAartiSection: extraConfig.dailyAartiSection } : {}),
        ...(extraConfig.aartiTabEnabled !== undefined && config?.tabs?.aarti ? {
          tabs: {
            ...config.tabs,
            aarti: { ...config.tabs.aarti, enabled: extraConfig.aartiTabEnabled, approved: extraConfig.aartiTabEnabled }
          }
        } : {})
      };
      saveLocal(updated);
      return { success: true, message: "स्थानिकरित्या जतन झाले" };
    }
  };

  const updateMandalInfo = async (mandalInfo) => {
    try {
      const res = await API.put("/config/mandal-info", { mandalInfo });
      if (res.data.success) {
        const updated = { ...config, mandalInfo: res.data.mandalInfo };
        saveLocal(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const updated = { ...config, mandalInfo };
      saveLocal(updated);
      return { success: true, message: "स्थानिकरित्या जतन झाले" };
    }
  };

  const updateFestivalScheduleCard = async (festivalScheduleCard) => {
    try {
      const res = await API.put("/config/festival-schedule-card", { festivalScheduleCard });
      if (res.data.success) {
        const updated = {
          ...config,
          festivalScheduleCard: res.data.festivalScheduleCard || festivalScheduleCard
        };
        saveLocal(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const updated = {
        ...config,
        festivalScheduleCard: {
          ...(config.festivalScheduleCard || {}),
          ...festivalScheduleCard
        }
      };
      saveLocal(updated);
      return { success: true, message: "स्थानिकरित्या जतन झाले" };
    }
  };

  const updateScroller = async (scrollerData) => {
    try {
      const res = await API.put("/config/scroller", scrollerData);
      if (res.data?.success) {
        const updated = {
          ...config,
          marqueeActive: res.data.marqueeActive !== undefined ? res.data.marqueeActive : config.marqueeActive,
          scrollerMessages: res.data.scrollerMessages || config.scrollerMessages
        };
        saveLocal(updated);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || "Failed to update scroller settings" };
    } catch (err) {
      const updated = {
        ...config,
        ...(scrollerData.marqueeActive !== undefined ? { marqueeActive: scrollerData.marqueeActive } : {}),
        ...(scrollerData.scrollerMessages ? { scrollerMessages: scrollerData.scrollerMessages } : {})
      };
      saveLocal(updated);
      return { success: true, message: "स्थानिकरित्या जतन झाले (Saved locally)" };
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        loading,
        refreshConfig: fetchConfig,
        updateTabs,
        updateGeneral,
        updateNewsletter,
        updateWings,
        updateRules,
        updateGallery,
        updatePoll,
        castVote,
        updateVolunteerSeva,
        updateSidebar,
        updateAartiSchedule,
        updateMandalInfo,
        updateFestivalScheduleCard,
        updateScroller
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
