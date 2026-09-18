import React, { useState, useEffect, useRef } from "react";
import { 
  Flame, Save, Calendar, Clock, Building2, 
  Sparkles, Check, CheckCircle2, Star, Globe, Info, Share2,
  Upload, Image as ImageIcon, Trash2, Eye, X, ChevronDown, ChevronUp,
  Link as LinkIcon, Users, Plus, ArrowUp, ArrowDown, Power, Edit3, Tag,
  AlertCircle, Timer
} from "lucide-react";
import { 
  FestiveCard, FestiveInput, FestiveTextarea, FestiveButton, 
  FestiveBadge 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";
import { formatAartiScheduleBroadcast, formatSingleAartiDay, openWhatsApp } from "../../utils/whatsappFormatter";
import API from "../../services/api";
import { getMediaUrl, handleImageError } from "../../utils/mediaUrl";
import { 
  calculateFestivalDay, 
  calculateAartiCountdown, 
  diffInDays, 
  getKolkataDate,
  format24hTo12h,
  parseTimeTo24h
} from "../../utils/aartiDateUtils";

import { 
  getWings, 
  getWingCodesText, 
  getAllWingsLabel, 
  getAllWingsShortLabel 
} from "../../utils/wingUtils";

const AartiScheduleManager = ({ 
  config, 
  onSaveAartiSchedule, 
  onSaveFestivalScheduleCard, 
  onNotify 
}) => {
  const { language, setLanguage } = useLanguage();
  const isEn = language === "en";

  const [schedule, setSchedule] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDailyAartiSection, setShowDailyAartiSection] = useState(true);
  const [isSectionEnabled, setIsSectionEnabled] = useState(true);
  const [showSectionHeaders, setShowSectionHeaders] = useState(false);
  const [sectionHeaders, setSectionHeaders] = useState({
    badgeMr: "दैनिक महाआरती व यजमान",
    badgeEn: "Daily Maha Aarti & Host Wings",
    titleMr: "दैनिक महाआरती व विंग यजमान",
    titleEn: "Daily Maha Aarti & Host Wings",
    subtitleMr: "दररोज सकाळी ०८:३० व रात्री ०८:०० वाजता मुख्य मंडपात महाआरती",
    subtitleEn: "Every day at 08:30 AM and 07:30 PM near G wing",
    countdownLabelMr: "पुढील महाआरतीसाठी शिल्लक वेळ",
    countdownLabelEn: "Time Remaining Until Next Aarti",
    startDate: "2026-09-07",
    endDate: "2026-09-16",
    morningTime: "सकाळी ०८:३० वाजता",
    morningTimeEn: "08:30 AM",
    eveningTime: "रात्री ०७:३० वाजता",
    eveningTimeEn: "07:30 PM"
  });

  // Admin Live Preview State
  const [livePreview, setLivePreview] = useState(() => 
    calculateAartiCountdown({
      startDate: "2026-09-07",
      endDate: "2026-09-16",
      morningTime: "08:30 AM",
      eveningTime: "07:30 PM",
      language
    })
  );

  useEffect(() => {
    const updatePreview = () => {
      setLivePreview(calculateAartiCountdown({
        startDate: sectionHeaders.startDate || "2026-09-07",
        endDate: sectionHeaders.endDate || "2026-09-16",
        morningTime: sectionHeaders.morningTimeEn || "08:30 AM",
        eveningTime: sectionHeaders.eveningTimeEn || "07:30 PM",
        language
      }));
    };
    updatePreview();
    const interval = setInterval(updatePreview, 1000);
    return () => clearInterval(interval);
  }, [sectionHeaders.startDate, sectionHeaders.endDate, sectionHeaders.morningTimeEn, sectionHeaders.eveningTimeEn, language]);

  const normalizeDayForAdmin = (day, idx) => {
    let events = Array.isArray(day.events) && day.events.length > 0 ? day.events : null;
    if (!events) {
      events = [
        {
          id: `evt_${day.dayNumber || idx + 1}_m`,
          type: "morning",
          categoryMr: "सकाळची महाआरती",
          categoryEn: "Morning Maha Aarti",
          titleMr: day.morningRitual || "मूर्ती प्राणप्रतिष्ठा पूजा व महाआरती",
          titleEn: day.morningRitualEn || day.morningRitual || "Morning Maha Aarti",
          time: day.morningTime || "सकाळी ०८:३० वाजता",
          timeEn: day.morningTimeEn || "08:30 AM",
          startTime: "08:30",
          endTime: "09:30",
          hostWing: day.hostWing || "सर्व इमारती संयुक्त",
          hostWingEn: day.hostWingEn || "All Buildings Joint",
          hostCoordinator: day.hostLead || "",
          hostCoordinatorEn: day.hostLeadEn || "",
          prasad: day.specialPrasad || "",
          prasadEn: day.specialPrasadEn || "",
          descriptionMr: "",
          descriptionEn: "",
          active: true
        },
        {
          id: `evt_${day.dayNumber || idx + 1}_e`,
          type: "evening",
          categoryMr: "संध्याकाळची महाआरती",
          categoryEn: "Evening Maha Aarti",
          titleMr: day.eveningRitual || "धूपारती, अथर्वशीर्ष व महाआरती",
          titleEn: day.eveningRitualEn || day.eveningRitual || "Evening Maha Aarti",
          time: day.eveningTime || "रात्री ०८:०० वाजता",
          timeEn: day.eveningTimeEn || "08:00 PM",
          startTime: "20:00",
          endTime: "21:00",
          hostWing: day.hostWing || "सर्व इमारती संयुक्त",
          hostWingEn: day.hostWingEn || "All Buildings Joint",
          hostCoordinator: day.hostLead || "",
          hostCoordinatorEn: day.hostLeadEn || "",
          prasad: day.specialPrasad || "",
          prasadEn: day.specialPrasadEn || "",
          descriptionMr: "",
          descriptionEn: "",
          active: true
        }
      ];
    }
    return {
      ...day,
      dayNumber: day.dayNumber || idx + 1,
      date: day.date || "",
      events
    };
  };

  // Festival Schedule Card Form State
  const [cardForm, setCardForm] = useState({
    eventNameMr: "",
    eventNameEn: "",
    eventDescriptionMr: "",
    eventDescriptionEn: "",
    plannerMr: "",
    plannerEn: "",
    plannerDetailsMr: "",
    plannerDetailsEn: "",
    imageUrl: "",
    imageCaptionMr: "",
    imageCaptionEn: ""
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const tabEnabled = config?.tabs?.aarti?.enabled !== false;
    const secEnabled = config?.dailyAartiSection?.enabled !== false;
    setIsSectionEnabled(tabEnabled && secEnabled);

    if (config?.dailyAartiSection) {
      setSectionHeaders(prev => ({
        badgeMr: config.dailyAartiSection.badgeMr || prev.badgeMr,
        badgeEn: config.dailyAartiSection.badgeEn || prev.badgeEn,
        titleMr: config.dailyAartiSection.titleMr || prev.titleMr,
        titleEn: config.dailyAartiSection.titleEn || prev.titleEn,
        subtitleMr: config.dailyAartiSection.subtitleMr || prev.subtitleMr,
        subtitleEn: config.dailyAartiSection.subtitleEn || prev.subtitleEn,
        countdownLabelMr: config.dailyAartiSection.countdownLabelMr || prev.countdownLabelMr,
        countdownLabelEn: config.dailyAartiSection.countdownLabelEn || prev.countdownLabelEn,
        startDate: config.dailyAartiSection.startDate || prev.startDate || "2026-09-07",
        endDate: config.dailyAartiSection.endDate || prev.endDate || "2026-09-16",
        morningTime: config.dailyAartiSection.morningTime || prev.morningTime || "सकाळी ०८:३० वाजता",
        morningTimeEn: config.dailyAartiSection.morningTimeEn || prev.morningTimeEn || "08:30 AM",
        eveningTime: config.dailyAartiSection.eveningTime || prev.eveningTime || "रात्री ०७:३० वाजता",
        eveningTimeEn: config.dailyAartiSection.eveningTimeEn || prev.eveningTimeEn || "07:30 PM"
      }));
    }

    if (config?.dailyAartiSchedule?.length) {
      const cloned = JSON.parse(JSON.stringify(config.dailyAartiSchedule));
      setSchedule(cloned.map(normalizeDayForAdmin));
    }
    if (config?.festivalScheduleCard) {
      const clean = (val, fb) => (typeof val === "string" && val.trim() && !val.includes("??") && !val.includes("\ufffd") ? val : fb);
      setCardForm({
        eventNameMr: clean(config.festivalScheduleCard.eventNameMr, "श्री गणेशोत्सव २०२६ (१० दिवसीय भव्य सोहळा)"),
        eventNameEn: clean(config.festivalScheduleCard.eventNameEn, "Shree Ganeshotsav 2026 (10-Day Grand Celebration)"),
        eventDescriptionMr: clean(config.festivalScheduleCard.eventDescriptionMr, "म्हाडा टॉवर्स संकुलातील सर्व ४ विंग्ज (G, H, J, K) संयुक्त विद्यमाने आयोजित १० दिवसीय अखंड गणेशोत्सव सोहळा."),
        eventDescriptionEn: clean(config.festivalScheduleCard.eventDescriptionEn, "10-day grand festival celebration organized jointly by all 4 buildings (Wings G, H, J, K) of MHADA Towers."),
        plannerMr: clean(config.festivalScheduleCard.plannerMr, "म्हाडा टॉवर्स उत्सव मंडळ व मध्यवर्ती सोसायटी समिती"),
        plannerEn: clean(config.festivalScheduleCard.plannerEn, "MHADA Towers Utsav Mandal & Central Society Committee"),
        plannerDetailsMr: clean(config.festivalScheduleCard.plannerDetailsMr, "सर्व ४ इमारतींचे विंग प्रमुख व स्वयंसेवक दल (विंग G, H, J, K)"),
        plannerDetailsEn: clean(config.festivalScheduleCard.plannerDetailsEn, "All 4 Building Wing Leads & Volunteer Squad (Wings G, H, J, K)"),
        imageUrl: config.festivalScheduleCard.imageUrl || "",
        imageCaptionMr: clean(config.festivalScheduleCard.imageCaptionMr, "उत्सव वेळापत्रक व संपूर्ण कार्यक्रम रूपरेषा"),
        imageCaptionEn: clean(config.festivalScheduleCard.imageCaptionEn, "Festival Schedule & Complete Event Blueprint")
      });
    }
  }, [config]);

  // Handle Photo Upload (Accepts any image extension: JPG, PNG, WEBP, GIF, SVG, AVIF, BMP, TIFF, etc.)
  const handleImageUpload = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    // Accept any image extension or MIME type
    const isImage = Boolean(
      (file.type && file.type.startsWith("image/")) || 
      /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|tiff|tif|ico|heic|heif|jfif|raw|eps)$/i.test(file.name || "")
    );
    if (!isImage) {
      onNotify(isEn ? "Please select a valid image file" : "कृपया वैध फोटो फाइल निवडा", "error");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("category", "schedule");

      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && (res.data.imageUrl || res.data.url)) {
        const uploadedUrl = res.data.imageUrl || res.data.url;
        setCardForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
        onNotify(
          isEn 
            ? "Festival schedule photo uploaded successfully!" 
            : "उत्सव वेळापत्रक फोटो यशस्वीरीत्या अपलोड झाला!", 
          "success"
        );
      } else {
        throw new Error(res.data?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      // Fallback: Read locally via FileReader as DataURL
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setCardForm(prev => ({ ...prev, imageUrl: loadEvent.target.result }));
        onNotify(
          isEn ? "Photo attached locally" : "स्थानिक फोटो जोडला गेला", 
          "info"
        );
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = "";
    }
  };

  // Save Festival Schedule Card
  const handleSaveCard = async (e) => {
    if (e) e.preventDefault();
    setIsSavingCard(true);
    let res;
    if (onSaveFestivalScheduleCard) {
      res = await onSaveFestivalScheduleCard(cardForm);
    } else if (onSaveAartiSchedule) {
      res = await onSaveAartiSchedule(schedule);
    }
    setIsSavingCard(false);
    if (res?.success) {
      onNotify(
        isEn 
          ? "Festival event, planner and photo saved successfully!" 
          : "उत्सव कार्यक्रम, नियोजन व वेळापत्रक फोटो यशस्वीरीत्या जतन केले!", 
        "success"
      );
    } else {
      onNotify(
        res?.message || (isEn ? "Failed to save festival card" : "जतन करताना त्रुटी आली"), 
        "error"
      );
    }
  };

  const handleToggleMasterSection = async () => {
    const nextState = !isSectionEnabled;
    setIsSectionEnabled(nextState);
    if (onSaveAartiSchedule) {
      setIsSaving(true);
      const res = await onSaveAartiSchedule(schedule, {
        dailyAartiSection: { ...sectionHeaders, enabled: nextState },
        aartiTabEnabled: nextState
      });
      setIsSaving(false);
      if (res?.success) {
        onNotify(
          nextState
            ? (isEn ? "Daily Maha Aarti section turned ON and LIVE on home screen!" : "दैनिक महाआरती विभाग सुरू (ON) केला व मुख्य पानावर सक्रिय झाला!")
            : (isEn ? "Daily Maha Aarti section turned OFF and hidden from visitors!" : "दैनिक महाआरती विभाग बंद (OFF) केला व रहिवाशांपासून लपवला!"),
          "success"
        );
      } else {
        onNotify(res?.message || (isEn ? "Failed to update section status" : "स्थिती बदलताना त्रुटी आली"), "error");
      }
    }
  };

  const handleAddDay = () => {
    const nextNum = schedule.length + 1;
    const newDay = {
      dayNumber: nextNum,
      dateStr: `दिवस ${nextNum}`,
      dateStrEn: `Day ${nextNum}`,
      date: "",
      tithi: "",
      tithiEn: "",
      hostWing: "सर्व इमारती संयुक्त",
      hostWingEn: "All Buildings Joint",
      hostLead: "",
      hostLeadEn: "",
      isCurrentDay: schedule.length === 0,
      events: [
        {
          id: `evt_${nextNum}_m_${Date.now()}`,
          type: "morning",
          categoryMr: "सकाळची महाआरती",
          categoryEn: "Morning Maha Aarti",
          titleMr: "प्रभात महाआरती व विधी",
          titleEn: "Morning Maha Aarti & Ritual",
          time: "सकाळी ०८:३० वाजता",
          timeEn: "08:30 AM",
          startTime: "08:30",
          endTime: "09:30",
          hostWing: "सर्व इमारती संयुक्त",
          hostWingEn: "All Buildings Joint",
          hostCoordinator: "",
          hostCoordinatorEn: "",
          prasad: "",
          prasadEn: "",
          descriptionMr: "",
          descriptionEn: "",
          active: true
        },
        {
          id: `evt_${nextNum}_e_${Date.now()}`,
          type: "evening",
          categoryMr: "संध्याकाळची महाआरती",
          categoryEn: "Evening Maha Aarti",
          titleMr: "संध्याकाळची महाआरती व मंत्रपुष्पांजली",
          titleEn: "Evening Maha Aarti & Mantrapushpanjali",
          time: "रात्री ०८:०० वाजता",
          timeEn: "08:00 PM",
          startTime: "20:00",
          endTime: "21:00",
          hostWing: "सर्व इमारती संयुक्त",
          hostWingEn: "All Buildings Joint",
          hostCoordinator: "",
          hostCoordinatorEn: "",
          prasad: "",
          prasadEn: "",
          descriptionMr: "",
          descriptionEn: "",
          active: true
        }
      ]
    };
    setSchedule([...schedule, newDay]);
    onNotify(isEn ? `Day ${nextNum} added!` : `दिवस ${nextNum} जोडला गेला!`, "success");
  };

  const handleDeleteDay = (index) => {
    const isConfirmed = window.confirm(
      isEn 
        ? `Are you sure you want to delete Day ${schedule[index]?.dayNumber || index + 1}?`
        : `तुम्हाला खात्री आहे की दिवस ${schedule[index]?.dayNumber || index + 1} हटवायचा आहे?`
    );
    if (!isConfirmed) return;

    const updated = schedule.filter((_, idx) => idx !== index);
    setSchedule(updated);
    onNotify(isEn ? "Day removed from schedule" : "दिवस वेळापत्रकातून काढला गेला", "info");
  };

  const handleMoveDay = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= schedule.length) return;
    const updated = [...schedule];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSchedule(updated);
  };

  const handleDayFieldChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  const handleSetCurrentDay = (index) => {
    const updated = schedule.map((item, idx) => ({
      ...item,
      isCurrentDay: idx === index
    }));
    setSchedule(updated);
  };

  const handleAddEvent = (dayIndex) => {
    const updated = [...schedule];
    const targetDay = updated[dayIndex];
    if (!targetDay.events) targetDay.events = [];
    const eventNum = targetDay.events.length + 1;
    targetDay.events.push({
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: "special",
      categoryMr: "विशेष महाआरती",
      categoryEn: "Special Maha Aarti",
      titleMr: `विशेष पूजा व आरती ${eventNum}`,
      titleEn: `Special Pooja & Aarti ${eventNum}`,
      time: "दुपारी १२:०० वाजता",
      timeEn: "12:00 PM",
      startTime: "12:00",
      endTime: "13:00",
      hostWing: targetDay.hostWing || "सर्व इमारती संयुक्त",
      hostWingEn: targetDay.hostWingEn || "All Buildings Joint",
      hostCoordinator: targetDay.hostLead || "",
      hostCoordinatorEn: targetDay.hostLeadEn || "",
      prasad: "",
      prasadEn: "",
      descriptionMr: "",
      descriptionEn: "",
      active: true
    });
    setSchedule(updated);
    onNotify(isEn ? "New event added to schedule!" : "वेळापत्रकात नवीन कार्यक्रम जोडला!", "info");
  };

  const handleDeleteEvent = (dayIndex, eventIndex) => {
    const isConfirmed = window.confirm(
      isEn 
        ? "Are you sure you want to delete this event from the day's schedule?"
        : "तुम्हाला खात्री आहे की हा कार्यक्रम दिवसाच्या वेळापत्रकातून काढायचा आहे?"
    );
    if (!isConfirmed) return;

    const updated = [...schedule];
    updated[dayIndex].events = updated[dayIndex].events.filter((_, eIdx) => eIdx !== eventIndex);
    setSchedule(updated);
    onNotify(isEn ? "Event deleted" : "कार्यक्रम काढला गेला", "info");
  };

  const handleMoveEvent = (dayIndex, eventIndex, direction) => {
    const updated = [...schedule];
    const events = [...(updated[dayIndex].events || [])];
    const targetIdx = eventIndex + direction;
    if (targetIdx < 0 || targetIdx >= events.length) return;
    const temp = events[eventIndex];
    events[eventIndex] = events[targetIdx];
    events[targetIdx] = temp;
    updated[dayIndex].events = events;
    setSchedule(updated);
  };

  const handleEventFieldChange = (dayIndex, eventIndex, field, value) => {
    const updated = [...schedule];
    const evt = updated[dayIndex].events[eventIndex];
    evt[field] = value;
    
    // Auto-update display time if 24h start time changes and display time is default
    if (field === "startTime" && value && value.includes(":")) {
      const [h, m] = value.split(":").map(Number);
      const isPM = h >= 12;
      const h12 = h % 12 || 12;
      const formattedEn = `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
      evt.timeEn = formattedEn;
      const marathiPeriod = isPM ? (h >= 17 ? "रात्री" : "दुपारी") : (h < 12 ? "सकाळी" : "दुपारी");
      evt.time = `${marathiPeriod} ${formattedEn}`;
    }

    setSchedule(updated);
  };

  const handleSaveAarti = async (e) => {
    if (e) e.preventDefault();

    // 1. Validation for Active Period & Aarti Timings
    const { startDate, endDate, morningTimeEn, eveningTimeEn } = sectionHeaders;
    if (!startDate) {
      onNotify(isEn ? "Start Date is required" : "सुरू होणारा दिनांक आवश्यक आहे", "error");
      return;
    }
    if (!endDate) {
      onNotify(isEn ? "End Date is required" : "समाप्त होणारा दिनांक आवश्यक आहे", "error");
      return;
    }
    if (endDate < startDate) {
      onNotify(
        isEn 
          ? "End date must be on or after the start date." 
          : "समाप्ती तारीख ही सुरू होणाऱ्या तारखेच्या नंतरची किंवा तीच असावी.",
        "error"
      );
      return;
    }
    if (!morningTimeEn || !morningTimeEn.trim()) {
      onNotify(isEn ? "Morning Aarti time is required" : "सकाळची आरती वेळ आवश्यक आहे", "error");
      return;
    }
    if (!eveningTimeEn || !eveningTimeEn.trim()) {
      onNotify(isEn ? "Evening Aarti time is required" : "संध्याकाळची आरती वेळ आवश्यक आहे", "error");
      return;
    }

    setIsSaving(true);

    // Sync top-level fields for backwards compatibility
    const syncedSchedule = schedule.map((day) => {
      const evts = day.events || [];
      const mEvt = evts.find((e) => e.type === "morning") || evts[0];
      const eEvt = evts.find((e) => e.type === "evening") || evts[1] || evts[0];

      return {
        ...day,
        morningTime: mEvt?.time || day.morningTime || "सकाळी ०८:३० वाजता",
        morningTimeEn: mEvt?.timeEn || day.morningTimeEn || "08:30 AM",
        eveningTime: eEvt?.time || day.eveningTime || "रात्री ०८:०० वाजता",
        eveningTimeEn: eEvt?.timeEn || day.eveningTimeEn || "08:00 PM",
        morningRitual: mEvt?.titleMr || day.morningRitual || "",
        morningRitualEn: mEvt?.titleEn || day.morningRitualEn || "",
        eveningRitual: eEvt?.titleMr || day.eveningRitual || "",
        eveningRitualEn: eEvt?.titleEn || day.eveningRitualEn || "",
        hostWing: mEvt?.hostWing || day.hostWing || "सर्व इमारती संयुक्त",
        hostWingEn: mEvt?.hostWingEn || day.hostWingEn || "All Buildings Joint",
        hostLead: mEvt?.hostCoordinator || day.hostLead || "",
        hostLeadEn: mEvt?.hostCoordinatorEn || day.hostLeadEn || "",
        specialPrasad: mEvt?.prasad || eEvt?.prasad || day.specialPrasad || "",
        specialPrasadEn: mEvt?.prasadEn || eEvt?.prasadEn || day.specialPrasadEn || ""
      };
    });

    const res = await onSaveAartiSchedule(syncedSchedule, {
      dailyAartiSection: {
        ...sectionHeaders,
        enabled: isSectionEnabled
      },
      aartiTabEnabled: isSectionEnabled
    });

    setIsSaving(false);
    if (res?.success) {
      onNotify(
        isEn 
          ? "Daily Aarti and Host Wings schedule saved successfully!" 
          : "दैनिक आरती व यजमान इमारत वेळापत्रक यशस्वीरीत्या जतन केले!",
        "success"
      );
    } else {
      onNotify(
        res?.message || (isEn ? "Failed to save schedule" : "जतन करताना त्रुटी आली"),
        "error"
      );
    }
  };

  const activeWingsList = getWings(config);
  const currentQuickWings = [
    ...activeWingsList.map(w => isEn ? `${w.code} Wing - ${w.nameEn || w.sacredNameEn || w.code}` : `${w.code} WING - ${w.nameMr || w.sacredNameMr || w.code}`),
    getAllWingsLabel(config, language)
  ];

  // Delete / Clear Photo Handler
  const handleDeletePhoto = async () => {
    const isConfirmed = window.confirm(
      isEn 
        ? "Are you sure you want to remove the festival schedule photo from the home page?" 
        : "तुम्हाला खात्री आहे की मुख्य पानावरील उत्सव वेळापत्रक फोटो काढायचा आहे?"
    );
    if (!isConfirmed) return;

    const updated = { ...cardForm, imageUrl: "" };
    setCardForm(updated);
    if (onSaveFestivalScheduleCard) {
      const res = await onSaveFestivalScheduleCard(updated);
      if (res?.success) {
        onNotify(
          isEn 
            ? "Festival schedule photo removed and updated on home screen!" 
            : "उत्सव वेळापत्रक फोटो यशस्वीरीत्या काढला व मुख्य पानावर अपडेट झाला!", 
          "success"
        );
      }
    }
  };

  const detectedFormat = cardForm.imageUrl 
    ? (cardForm.imageUrl.startsWith("data:image/") 
        ? cardForm.imageUrl.split(";")[0].replace("data:image/", "").toUpperCase()
        : cardForm.imageUrl.split(".").pop().split(/[?#]/)[0].toUpperCase())
    : "";

  return (
    <div className="space-y-8">
      
      {/* 1. PRIMARY SECTION: FESTIVAL EVENT, PLANNER & SCHEDULE PHOTO */}
      <FestiveCard
        title={
          isEn 
            ? "Festival Event, Planner & Schedule Photo" 
            : "उत्सव रूपरेषा, नियोजन व वेळापत्रक फोटो"
        }
        subtitle={
          isEn
            ? "Upload the official schedule photo (accepts any image format), enter what the event actually is, and specify its organizing planners for the Home page."
            : "मुख्य पानावर दर्शवण्यासाठी अधिकृत वेळापत्रक फोटो (कोणत्याही इमेज फॉरमॅटमध्ये) अपलोड करा, काय कार्यक्रम आहे आणि नियोजन व आयोजक तपशील येथे प्रविष्ट करा."
        }
        icon={Calendar}
        badge={isEn ? "Rank #1 Home Page Schedule Card" : "क्रमांक १ मुख्य पान वेळापत्रक कार्ड"}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <FestiveButton
              onClick={handleSaveCard}
              icon={Save}
              variant="primary"
              size="md"
              disabled={isSavingCard}
            >
              {isSavingCard 
                ? (isEn ? "Saving..." : "जतन करत आहे...") 
                : (isEn ? "Save Festival Details & Photo" : "उत्सव तपशील व फोटो जतन करा")
              }
            </FestiveButton>
          </div>
        }
      >
        {/* Language Switcher Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-50/70 border-2 border-gold-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-maroon-900 text-gold-300 flex items-center justify-center border border-gold-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-maroon-950 font-heading block">
                {isEn ? "Editing Language Mode:" : "संपादन भाषा मोड:"}
              </span>
              <span className="text-[11px] text-stone-600 font-medium">
                {isEn
                  ? "Editing English fields. Visitors see this when switching website to English."
                  : "सध्या मराठी भाषेतील माहिती संपादित करत आहात. इंग्रजीसाठी 'English' निवडा."}
              </span>
            </div>
          </div>

          <div className="inline-flex items-center p-1 rounded-xl bg-gold-100/90 border border-gold-300 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setLanguage("mr")}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                !isEn 
                  ? "bg-maroon-900 text-gold-200 shadow-xs" 
                  : "text-maroon-950 hover:bg-gold-200/60"
              }`}
            >
              🚩 मराठी (Marathi)
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                isEn 
                  ? "bg-maroon-900 text-gold-200 shadow-xs" 
                  : "text-maroon-950 hover:bg-gold-200/60"
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* ACTIVE LIVE RECORD & CRUD OPERATIONS SUMMARY BANNER */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white via-[#FFFDF9] to-amber-50/50 border-2 border-gold-400 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gold-200 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-gold-200 text-maroon-900 border border-gold-300">
                <Star className="w-4 h-4 text-amber-700 fill-amber-500" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-maroon-950 font-heading">
                  {isEn ? "Current Live Home Page Record & Photo" : "सध्याचा मुख्य पान रेकॉर्ड व वेळापत्रक फोटो"}
                </h4>
                <p className="text-[11px] text-stone-600">
                  {isEn 
                    ? "Displays Rank #1 on top of website. All changes reflect live across visitors instantly." 
                    : "वेबसाइटवर क्रमांक १ (Rank #1) वर दिसते. केलेले बदल थेट मुख्य स्क्रीनवर त्वरित दिसतात."}
                </p>
              </div>
            </div>

            {/* Live Status Badge */}
            <div className="flex items-center gap-2">
              {cardForm.imageUrl ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>{isEn ? "Live on Home Screen" : "थेट मुख्य पानावर सक्रिय"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-700 bg-stone-100 border border-stone-300 px-3 py-1 rounded-full">
                  <span>{isEn ? "No Photo Attached (Text Only)" : "फोटो जोडलेला नाही (केवळ मजकूर)"}</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Live Thumbnail Preview */}
            <div className="md:col-span-3 flex flex-col items-center">
              {cardForm.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-gold-300 shadow-sm bg-stone-900 w-full max-w-[200px] h-32 flex items-center justify-center group cursor-pointer"
                  onClick={() => setPreviewModalImg(cardForm.imageUrl)}
                  title={isEn ? "Click to view full image pop-up" : "पूर्ण फोटो पॉपअप पाहण्यासाठी क्लिक करा"}
                >
                  <img 
                    src={getMediaUrl(cardForm.imageUrl)} 
                    alt="Schedule Photo" 
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[11px] font-bold flex items-center gap-1 bg-maroon-900/90 px-2 py-1 rounded-lg border border-gold-300">
                      <Eye className="w-3.5 h-3.5" />
                      {isEn ? "View Pop-up" : "पॉपअप पहा"}
                    </span>
                  </div>
                  {detectedFormat && (
                    <span className="absolute top-1 right-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-black/80 text-gold-300 border border-gold-400">
                      {detectedFormat}
                    </span>
                  )}
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-gold-300 bg-amber-50/60 p-4 text-center cursor-pointer hover:bg-amber-100/60 transition w-full max-w-[200px] h-32 flex flex-col items-center justify-center"
                >
                  <Upload className="w-6 h-6 text-amber-700 mb-1" />
                  <span className="text-[11px] font-bold text-maroon-950">
                    {isEn ? "Click to Add Photo" : "फोटो जोडण्यासाठी क्लिक करा"}
                  </span>
                  <span className="text-[9px] text-stone-500">
                    {isEn ? "Any extension" : "सर्व इमेज फॉरमॅट्स"}
                  </span>
                </div>
              )}
            </div>

            {/* Live Record Text Summary */}
            <div className="md:col-span-6 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-500">{isEn ? "Event Title:" : "कार्यक्रम शीर्षक:"}</span>
                <span className="font-extrabold text-maroon-950 truncate">
                  {isEn ? (cardForm.eventNameEn || cardForm.eventNameMr) : (cardForm.eventNameMr || cardForm.eventNameEn)}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-stone-500 flex-shrink-0">{isEn ? "Planner:" : "नियोजक मंडळ:"}</span>
                <span className="font-semibold text-stone-800 line-clamp-1">
                  {isEn ? (cardForm.plannerEn || cardForm.plannerMr) : (cardForm.plannerMr || cardForm.plannerEn)}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-stone-500 flex-shrink-0">{isEn ? "Wings Squad:" : "सहभागी विंग्स:"}</span>
                <span className="text-stone-700 line-clamp-1">
                  {isEn ? (cardForm.plannerDetailsEn || cardForm.plannerDetailsMr) : (cardForm.plannerDetailsMr || cardForm.plannerDetailsEn)}
                </span>
              </div>
              {cardForm.imageUrl && (
                <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-0.5 truncate">
                  <span className="font-bold">{isEn ? "Source:" : "फोटो स्त्रोत:"}</span>
                  <span className="font-mono text-emerald-800 truncate">{cardForm.imageUrl}</span>
                </div>
              )}
            </div>

            {/* CRUD Action Buttons */}
            <div className="md:col-span-3 flex flex-col gap-2 justify-center">
              {/* [C - Create / Upload] */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-maroon-900 to-maroon-850 hover:from-maroon-850 hover:to-maroon-800 text-gold-200 text-xs font-bold border border-gold-400 flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-gold-300" />
                <span>{cardForm.imageUrl ? (isEn ? "Change/Upload Photo" : "फोटो बदला / अपलोड करा") : (isEn ? "Upload Photo" : "फोटो अपलोड करा")}</span>
              </button>

              {/* [R - Read / View Pop-Up] */}
              {cardForm.imageUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewModalImg(cardForm.imageUrl)}
                  className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  title={isEn ? "Open popup modal with single close button" : "सिंगल क्लोज बटणासह पॉपअप उघडा"}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isEn ? "View Pop-up Modal" : "पॉपअप फोटो पहा"}</span>
                </button>
              )}

              {/* [D - Delete / Remove Photo] */}
              {cardForm.imageUrl && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title={isEn ? "Delete photo from home page" : "मुख्य पानावरील फोटो काढा"}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                  <span>{isEn ? "Delete Photo" : "फोटो हटवा"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Form Grid: Image Upload (Left) + Event & Planner Inputs (Right) */}
        <form onSubmit={handleSaveCard} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Box: Photo View & Upload Option (Accepts Any Image Extension) */}
            <div className="lg:col-span-5 bg-[#FFFDF9] rounded-2xl border-2 border-gold-300 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-gold-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-black text-maroon-950 uppercase tracking-wider font-heading">
                    {isEn ? "Festival Schedule Photo" : "उत्सव वेळापत्रक फोटो"}
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  {isEn ? "Any Image Extension" : "सर्व फॉरमॅट"}
                </span>
              </div>

              {/* Upload Input Area */}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.svg,.avif,.bmp,.tiff,.tif,.ico,.jfif,.heic,.heif,.raw,.eps"
                onChange={handleImageUpload} 
                className="hidden" 
              />

              {cardForm.imageUrl ? (
                <div className="space-y-3">
                  {/* Photo Thumbnail */}
                  <div className="relative rounded-xl overflow-hidden border-2 border-gold-300 bg-stone-900 group">
                    <img 
                      src={getMediaUrl(cardForm.imageUrl)} 
                      alt="Festival Schedule Preview" 
                      onError={handleImageError}
                      className="w-full h-48 sm:h-56 object-contain bg-stone-900" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewModalImg(cardForm.imageUrl)}
                        className="px-3 py-1.5 bg-maroon-900/90 text-gold-200 rounded-lg text-xs font-bold border border-gold-400 flex items-center gap-1.5 shadow"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isEn ? "Test Pop-up" : "पॉपअप पहा"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Image Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="flex-1 py-2 px-3 bg-gold-100 hover:bg-gold-200 text-maroon-950 border border-gold-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-maroon-800" />
                      <span>{isUploadingPhoto ? (isEn ? "Uploading..." : "अपलोड होत आहे...") : (isEn ? "Change Photo" : "फोटो बदला")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewModalImg(cardForm.imageUrl)}
                      className="py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                      title={isEn ? "Preview popup modal with single close button" : "सिंगल क्लोज बटणासह पॉपअप तपासा"}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isEn ? "Preview" : "पहा"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCardForm(prev => ({ ...prev, imageUrl: "" }))}
                      className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      title={isEn ? "Remove photo" : "फोटो काढा"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isEn ? "Remove" : "काढा"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gold-400/80 hover:border-gold-500 bg-amber-50/50 hover:bg-amber-50/80 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold-100 text-maroon-900 border border-gold-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-amber-700" />
                  </div>
                  <span className="text-xs font-black text-maroon-950 font-heading block">
                    {isUploadingPhoto 
                      ? (isEn ? "Uploading Photo..." : "फोटो अपलोड होत आहे...") 
                      : (isEn ? "Click to Insert/Upload Photo" : "फोटो अपलोड करण्यासाठी येथे क्लिक करा")
                    }
                  </span>
                  <p className="text-[11px] text-stone-500 mt-1 max-w-xs leading-relaxed">
                    {isEn 
                      ? "Accepts JPG, PNG, WEBP, GIF, SVG, AVIF, BMP, TIFF, and all other image extensions" 
                      : "JPG, PNG, WEBP, GIF, SVG, AVIF, BMP, TIFF व सर्व फॉरमॅट्स स्वीकारले जातात"}
                  </p>
                </div>
              )}

              {/* Direct Image URL fallback input */}
              <div className="pt-2">
                <FestiveInput
                  label={isEn ? "Or Paste Image URL directly:" : "किंवा थेट इमेज URL पेस्ट करा:"}
                  icon={LinkIcon}
                  value={cardForm.imageUrl || ""}
                  onChange={(e) => setCardForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://... or /uploads/..."
                />
              </div>

              {/* Image Caption */}
              <div>
                <FestiveInput
                  label={isEn ? "Image Caption / Blueprint Note:" : "फोटो मथळा / रूपरेषा टीप:"}
                  icon={Sparkles}
                  value={isEn ? (cardForm.imageCaptionEn || "") : (cardForm.imageCaptionMr || "")}
                  onChange={(e) => setCardForm(prev => ({
                    ...prev,
                    [isEn ? "imageCaptionEn" : "imageCaptionMr"]: e.target.value
                  }))}
                  placeholder={isEn ? "e.g. Festival Schedule & Complete Event Blueprint" : "उदा. उत्सव वेळापत्रक व संपूर्ण कार्यक्रम रूपरेषा"}
                />
              </div>
            </div>

            {/* Right Box: Event Details ("what the event actually is") & Planner ("its planner") */}
            <div className="lg:col-span-7 bg-[#FFFDF9] rounded-2xl border-2 border-gold-300 p-5 space-y-4 shadow-xs">
              
              <div className="border-b border-gold-200 pb-2.5">
                <span className="text-xs font-black text-maroon-950 uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>{isEn ? "Event Details & Organizing Planners" : "कार्यक्रम तपशील व उत्सव नियोजन"}</span>
                </span>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {isEn 
                    ? "These details will be displayed on the Home page card instead of the previous date-wise subcards."
                    : "ही माहिती मुख्य पानावरील कार्डवर पूर्वीच्या सबकार्ड्सच्या ऐवजी स्पष्टपणे दिसेल."}
                </p>
              </div>

              {/* 1. What the actual event is (Name) */}
              <div>
                <FestiveInput
                  label={isEn ? "What the Event actually is (Event Title) *" : "काय कार्यक्रम आहे (उत्सव / कार्यक्रम शीर्षक) *"}
                  icon={Calendar}
                  value={isEn ? (cardForm.eventNameEn || "") : (cardForm.eventNameMr || "")}
                  onChange={(e) => setCardForm(prev => ({
                    ...prev,
                    [isEn ? "eventNameEn" : "eventNameMr"]: e.target.value
                  }))}
                  placeholder={
                    isEn 
                      ? "e.g. Shree Ganeshotsav 2026 (10-Day Grand Celebration)" 
                      : "उदा. श्री गणेशोत्सव २०२६ (१० दिवसीय भव्य सोहळा)"
                  }
                  required
                />
                <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 truncate">
                  <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                  <span className="truncate">
                    {isEn ? `Marathi: ${cardForm.eventNameMr || "(not set)"}` : `English: ${cardForm.eventNameEn || "(सेट नाही)"}`}
                  </span>
                </div>
              </div>

              {/* 2. Detailed Event Description */}
              <div>
                <FestiveTextarea
                  label={isEn ? "Detailed Event Description (What actually happens during this event):" : "कार्यक्रमाचे सविस्तर वर्णन (कार्यक्रमाचे स्वरूप व माहिती):"}
                  rows={3}
                  value={isEn ? (cardForm.eventDescriptionEn || "") : (cardForm.eventDescriptionMr || "")}
                  onChange={(e) => setCardForm(prev => ({
                    ...prev,
                    [isEn ? "eventDescriptionEn" : "eventDescriptionMr"]: e.target.value
                  }))}
                  placeholder={
                    isEn 
                      ? "e.g. 10-day grand festival celebration and cultural programs organized jointly by all 4 buildings (Wings G, H, J, K) of MHADA Towers." 
                      : "उदा. म्हाडा टॉवर्स संकुलातील सर्व ४ विंग्ज (G-नंदादेवी, H-निलगिरी, J-पूर्वांचल, K-गोवर्धन) संयुक्त विद्यमाने आयोजित १० दिवसीय अखंड गणेशोत्सव व सांस्कृतिक सोहळा."
                  }
                />
              </div>

              {/* 3. Its Planner / Organizing Committee */}
              <div className="pt-2 border-t border-gold-200">
                <FestiveInput
                  label={isEn ? "Its Planner / Organizing Committee *" : "उत्सव नियोजन / मुख्य आयोजक मंडळ *"}
                  icon={Users}
                  value={isEn ? (cardForm.plannerEn || "") : (cardForm.plannerMr || "")}
                  onChange={(e) => setCardForm(prev => ({
                    ...prev,
                    [isEn ? "plannerEn" : "plannerMr"]: e.target.value
                  }))}
                  placeholder={
                    isEn 
                      ? "e.g. MHADA Towers Utsav Mandal & Central Society Committee" 
                      : "उदा. म्हाडा टॉवर्स उत्सव मंडळ व मध्यवर्ती सोसायटी समिती"
                  }
                  required
                />
                <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 truncate">
                  <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
                  <span className="truncate">
                    {isEn ? `Marathi: ${cardForm.plannerMr || "(not set)"}` : `English: ${cardForm.plannerEn || "(सेट नाही)"}`}
                  </span>
                </div>
              </div>

              {/* 4. Planner Coordinating Wings / Details */}
              <div>
                <FestiveInput
                  label={isEn ? "Planner Details / Coordinating Wings:" : "नियोजन तपशील / सहभागी विंग्स व समन्वय पथक:"}
                  icon={Building2}
                  value={isEn ? (cardForm.plannerDetailsEn || "") : (cardForm.plannerDetailsMr || "")}
                  onChange={(e) => setCardForm(prev => ({
                    ...prev,
                    [isEn ? "plannerDetailsEn" : "plannerDetailsMr"]: e.target.value
                  }))}
                  placeholder={
                    isEn 
                      ? "e.g. All 4 Building Wing Leads, Women's Wing & Volunteer Squad (Wings G, H, J, K)" 
                      : "उदा. सर्व ४ इमारतींचे विंग प्रमुख, महिला मंडळ व स्वयंसेवक दल (विंग G, H, J, K)"
                  }
                />
              </div>

            </div>

          </div>

          {/* Bottom Save Button for Festival Card */}
          <div className="pt-3 border-t border-gold-200 flex justify-end">
            <FestiveButton
              type="submit"
              icon={Save}
              variant="primary"
              size="md"
              disabled={isSavingCard}
            >
              {isSavingCard 
                ? (isEn ? "Saving Festival Details..." : "जतन करत आहे...") 
                : (isEn ? "Save Festival Details & Photo (जतन करा)" : "उत्सव तपशील व फोटो जतन करा (Save)")
              }
            </FestiveButton>
          </div>
        </form>
      </FestiveCard>

      {/* 2. SECONDARY / FULLY DYNAMIC SECTION: DAILY MAHA AARTI & HOST WINGS */}
      <div className="bg-white rounded-3xl border-2 border-gold-300 p-5 sm:p-6 shadow-xs space-y-5">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gold-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-maroon-900 text-gold-300 flex items-center justify-center border border-gold-400 shadow-xs">
              <Flame className="w-5 h-5 text-gold-300 animate-diya" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-maroon-950 font-heading">
                {isEn ? "Daily Maha Aarti Timings & Host Wings" : "दैनिक महाआरती वेळा व यजमान इमारत वेळापत्रक"}
              </h3>
              <p className="text-xs text-stone-600">
                {isEn 
                  ? "Fully manage daily events, timings, host buildings, prasad, countdown, and active status." 
                  : "दैनिक महाआरती, वेळा, यजमान इमारत, नैवेद्य व काउंटडाऊनचे संपूर्ण व्यवस्थापन येथून करा."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const txt = formatAartiScheduleBroadcast(schedule, config);
                openWhatsApp(txt);
                if (onNotify) onNotify(isEn ? "Opening WhatsApp with schedule..." : "आरती वेळापत्रक व्हॉट्सॲपवर पाठवण्यासाठी तयार!", "success");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isEn ? "Share Aarti" : "आरती वेळ पाठवा"}</span>
            </button>

            <button
              type="button"
              onClick={handleAddDay}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-maroon-900 to-maroon-850 hover:from-maroon-850 hover:to-maroon-800 text-gold-200 font-bold text-xs border border-gold-400 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-gold-300" />
              <span>{isEn ? "Add Day" : "नवीन दिवस जोडा"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDailyAartiSection(!showDailyAartiSection)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-100 hover:bg-gold-200 text-maroon-950 font-black text-xs border border-gold-300 shadow-2xs transition cursor-pointer"
            >
              <span>{showDailyAartiSection ? (isEn ? "Hide Editor" : "संपादक लपवा") : (isEn ? "Show Editor" : "संपादक उघडा")}</span>
              {showDailyAartiSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* MASTER ON / OFF TOGGLE BANNER */}
        <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
          isSectionEnabled 
            ? "bg-gradient-to-r from-emerald-50 via-white to-emerald-50/60 border-emerald-400 shadow-xs" 
            : "bg-stone-100 border-stone-300 text-stone-600"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${
              isSectionEnabled 
                ? "bg-emerald-600 text-white border-emerald-500" 
                : "bg-stone-300 text-stone-600 border-stone-400"
            }`}>
              <Power className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-stone-800">
                  {isEn ? "Daily Maha Aarti Section Status:" : "दैनिक महाआरती विभाग स्थिती:"}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  isSectionEnabled 
                    ? "bg-emerald-600 text-white shadow-xs" 
                    : "bg-stone-500 text-white"
                }`}>
                  <span className={`w-2 h-2 rounded-full bg-white ${isSectionEnabled ? "animate-pulse" : ""}`} />
                  {isSectionEnabled 
                    ? (isEn ? "LIVE ON HOME SCREEN (ON)" : "मुख्य पानावर सक्रिय (चालू)") 
                    : (isEn ? "HIDDEN FROM RESIDENTS (OFF)" : "रहिवाशांपासून लपवले (बंद)")}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5">
                {isSectionEnabled 
                  ? (isEn ? "The section and live countdown are active and visible to all residents." : "हा विभाग व लाइव्ह काउंटडाऊन मुख्य स्क्रीनवर सर्व भाविकांना सक्रिय दिसेल.") 
                  : (isEn ? "Section is switched OFF. No content or timers are shown on the website." : "हा विभाग बंद आहे. वेबसाइटवर कोणतेही जुने काउंटडाऊन किंवा कार्ड्स दिसणार नाहीत.")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleMasterSection}
            className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              isSectionEnabled 
                ? "bg-rose-600 hover:bg-rose-700 text-white" 
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            <Power className="w-4 h-4" />
            <span>
              {isSectionEnabled 
                ? (isEn ? "Turn Section OFF" : "विभाग बंद करा (Turn OFF)") 
                : (isEn ? "Turn Section ON" : "विभाग सुरू करा (Turn ON)")}
            </span>
          </button>
        </div>

        {/* Collapsible Content Area */}
        {showDailyAartiSection && (
          <form onSubmit={handleSaveAarti} className="space-y-6 animate-fadeIn">
            
            {/* 0. PRIMARY CONTROL: DAILY MAHA AARTI ACTIVE PERIOD & TIMINGS */}
            <div className="rounded-2xl border-2 border-gold-400 bg-gradient-to-br from-white via-[#FFFDF9] to-amber-50/50 p-5 sm:p-6 shadow-sm space-y-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gold-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-maroon-900 text-gold-300 flex items-center justify-center border border-gold-400 shadow-xs flex-shrink-0">
                    <Calendar className="w-5 h-5 text-gold-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-black text-maroon-950 font-heading">
                        {isEn ? "Daily Maha Aarti Active Period & Timings" : "दैनिक महाआरती सक्रिय कालावधी व वेळा"}
                      </h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gold-200 text-maroon-900 border border-gold-400">
                        {isEn ? "Auto Day & Timer" : "स्वयंचलित दिवस व टाइमर"}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {isEn 
                        ? "Configure the festival active date range and Aarti timings. Public site automatically calculates today's day (Day 1..10) and next Aarti countdown."
                        : "उत्सवाचा सक्रिय कालावधी व आरत्यांच्या वेळा येथे सेट करा. मुख्य संकेतस्थळावर दिवस (Day 1..10) व काउंटडाऊन आपोआप अपडेट होईल."}
                    </p>
                  </div>
                </div>

                <FestiveButton
                  type="submit"
                  icon={Save}
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                >
                  {isSaving ? (isEn ? "Saving..." : "जतन करत आहे...") : (isEn ? "Save Settings" : "सेटिंग्ज जतन करा")}
                </FestiveButton>
              </div>

              {/* Date Pickers and Timings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Start Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-maroon-950 font-heading">
                    {isEn ? "Start Date *" : "सुरू होणारा दिनांक (Start Date) *"}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={sectionHeaders.startDate || "2026-09-07"}
                      onChange={(e) => setSectionHeaders(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                      className="w-full px-3.5 py-2 rounded-xl text-xs font-bold border-2 border-gold-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40 bg-white text-maroon-950 shadow-2xs outline-none transition"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500 block">
                    {isEn ? "Festival Day 1 starts here" : "येथून उत्सव दिवस १ सुरू होईल"}
                  </span>
                </div>

                {/* 2. End Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-maroon-950 font-heading">
                    {isEn ? "End Date *" : "समाप्त होणारा दिनांक (End Date) *"}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={sectionHeaders.endDate || "2026-09-16"}
                      min={sectionHeaders.startDate || undefined}
                      onChange={(e) => setSectionHeaders(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold border-2 focus:ring-2 bg-white text-maroon-950 shadow-2xs outline-none transition ${
                        sectionHeaders.endDate && sectionHeaders.startDate && sectionHeaders.endDate < sectionHeaders.startDate
                          ? "border-red-500 focus:border-red-600 focus:ring-red-300"
                          : "border-gold-300 focus:border-gold-500 focus:ring-gold-400/40"
                      }`}
                    />
                  </div>
                  {sectionHeaders.endDate && sectionHeaders.startDate && sectionHeaders.endDate < sectionHeaders.startDate ? (
                    <span className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span>{isEn ? "End date must be on or after the start date." : "समाप्ती तारीख ही सुरू होणाऱ्या तारखेच्या नंतरची किंवा तीच असावी."}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500 block">
                      {isEn 
                        ? `Total Duration: ${Math.max(0, diffInDays(sectionHeaders.endDate, sectionHeaders.startDate) + 1)} Days (Inclusive)` 
                        : `एकूण कालावधी: ${Math.max(0, diffInDays(sectionHeaders.endDate, sectionHeaders.startDate) + 1)} दिवस (समावेशक)`}
                    </span>
                  )}
                </div>

                {/* 3. Morning Maha Aarti Time */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-maroon-950 font-heading">
                    {isEn ? "Morning Maha Aarti *" : "सकाळची महाआरती वेळ *"}
                  </label>
                  <input
                    type="text"
                    value={sectionHeaders.morningTimeEn || "08:30 AM"}
                    onChange={(e) => {
                      const val = e.target.value;
                      const time24 = parseTimeTo24h(val, "08:30");
                      setSectionHeaders(prev => ({
                        ...prev,
                        morningTimeEn: val,
                        morningTime: format24hTo12h(time24, "mr")
                      }));
                    }}
                    placeholder="08:30 AM"
                    required
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-bold border-2 border-gold-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40 bg-white text-maroon-950 shadow-2xs outline-none transition"
                  />
                  <span className="text-[10px] text-stone-500 block">
                    {isEn ? `Marathi: ${sectionHeaders.morningTime || "सकाळी ०८:३० वाजता"}` : `इंग्रजी: ${sectionHeaders.morningTimeEn || "08:30 AM"}`}
                  </span>
                </div>

                {/* 4. Evening Maha Aarti Time */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-maroon-950 font-heading">
                    {isEn ? "Evening Maha Aarti *" : "संध्याकाळची महाआरती वेळ *"}
                  </label>
                  <input
                    type="text"
                    value={sectionHeaders.eveningTimeEn || "07:30 PM"}
                    onChange={(e) => {
                      const val = e.target.value;
                      const time24 = parseTimeTo24h(val, "19:30");
                      setSectionHeaders(prev => ({
                        ...prev,
                        eveningTimeEn: val,
                        eveningTime: format24hTo12h(time24, "mr")
                      }));
                    }}
                    placeholder="07:30 PM"
                    required
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-bold border-2 border-gold-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40 bg-white text-maroon-950 shadow-2xs outline-none transition"
                  />
                  <span className="text-[10px] text-stone-500 block">
                    {isEn ? `Marathi: ${sectionHeaders.eveningTime || "रात्री ०७:३० वाजता"}` : `इंग्रजी: ${sectionHeaders.eveningTimeEn || "07:30 PM"}`}
                  </span>
                </div>

              </div>

              {/* Requirement 17: Live Admin Preview Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-white border border-gold-400/80 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gold-300 bg-maroon-800 px-2 py-0.5 rounded-full border border-gold-500/30">
                      {isEn ? "Live Public Website Preview (Asia/Kolkata)" : "थेट मुख्य पान पूर्वावलोकन (IST)"}
                    </span>
                    <div className="mt-1.5 text-xs text-gold-100 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span><strong>{isEn ? "Configured Period:" : "कालावधी:"}</strong> {sectionHeaders.startDate} → {sectionHeaders.endDate} ({Math.max(0, diffInDays(sectionHeaders.endDate, sectionHeaders.startDate) + 1)} {isEn ? "Days" : "दिवस"})</span>
                      <span><strong>{isEn ? "Today's Festival Day:" : "आजचा उत्सव दिवस:"}</strong> {
                        livePreview.festivalStatus === "active" 
                          ? (isEn ? `Day ${livePreview.currentDay} (Today)` : `दिवस ${livePreview.currentDay} (आज)`)
                          : livePreview.festivalStatus === "upcoming" 
                            ? (isEn ? "Upcoming" : "आगामी") 
                            : (isEn ? "Concluded" : "संपन्न")
                      }</span>
                    </div>
                    <div className="mt-1 text-sm font-bold text-gold-200">
                      {livePreview.targetName} • <span className="text-gold-300">{livePreview.targetTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gold-300/80 font-bold uppercase">{isEn ? "Countdown:" : "काउंटडाऊन:"}</span>
                    <div className="flex items-center gap-1 font-mono font-black text-gold-300 text-lg bg-maroon-800/90 px-3 py-1 rounded-xl border border-gold-400/60 shadow-inner">
                      <span>{livePreview.hours}</span>:<span>{livePreview.minutes}</span>:<span>{livePreview.seconds}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 1. SECTION TITLES & DISPLAY TEXTS ACCORDION */}
            <div className="rounded-2xl border-2 border-gold-300 bg-[#FFFDF9] overflow-hidden shadow-xs">
              <div 
                onClick={() => setShowSectionHeaders(!showSectionHeaders)}
                className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-50 to-white flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition"
              >
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-800" />
                  <span className="text-xs font-black text-maroon-950 uppercase tracking-wider font-heading">
                    {isEn ? "Customize Section Display Titles & Banner Texts" : "विभाग शीर्षक व काउंटडाऊन बॅनर मजकूर सानुकूलित करा"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                  <span>{showSectionHeaders ? (isEn ? "Hide" : "लपवा") : (isEn ? "Customize" : "बदला")}</span>
                  {showSectionHeaders ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {showSectionHeaders && (
                <div className="p-4 sm:p-5 border-t border-gold-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-fadeIn">
                  <div>
                    <FestiveInput
                      label={isEn ? "Section Badge (Pill at top):" : "विभाग बॅज (सर्वात वरील बॅज):"}
                      value={isEn ? (sectionHeaders.badgeEn || "") : (sectionHeaders.badgeMr || "")}
                      onChange={(e) => setSectionHeaders(prev => ({
                        ...prev,
                        [isEn ? "badgeEn" : "badgeMr"]: e.target.value
                      }))}
                      placeholder={isEn ? "Daily Maha Aarti & Host Wings" : "दैनिक महाआरती व यजमान"}
                    />
                  </div>

                  <div>
                    <FestiveInput
                      label={isEn ? "Section Title (Main heading):" : "विभाग मुख्य शीर्षक (Heading):"}
                      value={isEn ? (sectionHeaders.titleEn || "") : (sectionHeaders.titleMr || "")}
                      onChange={(e) => setSectionHeaders(prev => ({
                        ...prev,
                        [isEn ? "titleEn" : "titleMr"]: e.target.value
                      }))}
                      placeholder={isEn ? "Daily Maha Aarti & Host Wings" : "दैनिक महाआरती व विंग यजमान"}
                    />
                  </div>

                  <div>
                    <FestiveInput
                      label={isEn ? "Section Subtitle / Daily Timing text:" : "विभाग उपशीर्षक / नियमित वेळ माहिती:"}
                      value={isEn ? (sectionHeaders.subtitleEn || "") : (sectionHeaders.subtitleMr || "")}
                      onChange={(e) => setSectionHeaders(prev => ({
                        ...prev,
                        [isEn ? "subtitleEn" : "subtitleMr"]: e.target.value
                      }))}
                      placeholder={isEn ? "Every day at 08:30 AM and 08:00 PM at Central Festive Pandal" : "दररोज सकाळी ०८:३० व रात्री ०८:०० वाजता मुख्य मंडपात महाआरती"}
                    />
                  </div>

                  <div>
                    <FestiveInput
                      label={isEn ? "Countdown Box Header Label:" : "काउंटडाऊन बॉक्स वरील लेबल:"}
                      value={isEn ? (sectionHeaders.countdownLabelEn || "") : (sectionHeaders.countdownLabelMr || "")}
                      onChange={(e) => setSectionHeaders(prev => ({
                        ...prev,
                        [isEn ? "countdownLabelEn" : "countdownLabelMr"]: e.target.value
                      }))}
                      placeholder={isEn ? "Time Remaining Until Next Aarti" : "पुढील महाआरतीसाठी शिल्लक वेळ"}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. DAY-WISE SCHEDULES LIST */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-maroon-950 font-heading">
                    {isEn ? `Scheduled Days (${schedule.length} Total)` : `नियोजित दिवस (एकूण ${schedule.length})`}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {isEn ? "— Reorder, add or remove days" : "— दिवस जोडा, क्रम बदला किंवा काढा"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddDay}
                  className="px-3 py-1.5 rounded-xl bg-gold-100 hover:bg-gold-200 text-maroon-950 text-xs font-black border border-gold-300 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-maroon-800" />
                  <span>{isEn ? "+ Add Another Day" : "+ नवीन दिवस जोडा"}</span>
                </button>
              </div>

              {schedule.map((dayItem, dIdx) => {
                const isToday = Boolean(dayItem.isCurrentDay);
                const dayDisplayTitle = isEn 
                  ? (dayItem.dateStrEn || dayItem.dateStr || `Day ${dayItem.dayNumber || dIdx + 1}`) 
                  : (dayItem.dateStr || `दिवस ${dayItem.dayNumber || dIdx + 1}`);

                const events = dayItem.events || [];

                return (
                  <div
                    key={dayItem.id || dayItem.dayNumber || dIdx}
                    className={`rounded-2xl border-2 transition-all p-4 sm:p-5 shadow-xs space-y-4 ${
                      isToday 
                        ? "bg-amber-50/80 border-gold-500 ring-2 ring-gold-400/50" 
                        : "bg-[#FFFDF9] border-gold-300 hover:border-gold-400"
                    }`}
                  >
                    {/* Day Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gold-200">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-maroon-900 text-gold-300 font-black flex items-center justify-center text-xs shadow-xs border border-gold-400">
                          {dayItem.dayNumber || dIdx + 1}
                        </span>
                        <div>
                          <span className="font-heading font-black text-sm sm:text-base text-maroon-950 block">
                            {dayDisplayTitle}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {events.length} {events.length === 1 ? "Event / Aarti" : "Events / Aartis"}
                          </span>
                        </div>
                        {isToday && (
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-xs ml-1">
                            {isEn ? "Today / Active" : "आज (सक्रिय)"}
                          </span>
                        )}
                      </div>

                      {/* Day Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleSetCurrentDay(dIdx)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            isToday
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-white text-maroon-900 hover:bg-gold-100 border-gold-300"
                          }`}
                        >
                          {isToday ? (isEn ? "✓ Active Today" : "✓ आजचा सक्रिय दिवस") : (isEn ? "Set as Today" : "आजचा दिवस बनवा")}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMoveDay(dIdx, -1)}
                          disabled={dIdx === 0}
                          title={isEn ? "Move Day Up" : "दिवस वर घ्या"}
                          className="p-1.5 rounded-xl bg-white hover:bg-gold-100 border border-gold-300 text-stone-700 disabled:opacity-40 transition cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMoveDay(dIdx, 1)}
                          disabled={dIdx === schedule.length - 1}
                          title={isEn ? "Move Day Down" : "दिवस खाली घ्या"}
                          className="p-1.5 rounded-xl bg-white hover:bg-gold-100 border border-gold-300 text-stone-700 disabled:opacity-40 transition cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDay(dIdx)}
                          title={isEn ? "Delete Day" : "दिवस हटवा"}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Day Core Info Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <FestiveInput
                          label={isEn ? "Day & Date Label (English):" : "दिवस व तारीख लेबल (इंग्रजी):"}
                          value={dayItem.dateStrEn || ""}
                          onChange={(e) => handleDayFieldChange(dIdx, "dateStrEn", e.target.value)}
                          placeholder="e.g. Day 1 (Ganesh Chaturthi - 14 Sep)"
                        />
                      </div>
                      <div>
                        <FestiveInput
                          label={isEn ? "Day & Date Label (Marathi):" : "दिवस व तारीख लेबल (मराठी):"}
                          value={dayItem.dateStr || ""}
                          onChange={(e) => handleDayFieldChange(dIdx, "dateStr", e.target.value)}
                          placeholder="उदा. दिवस १ (गणेश चतुर्थी - ७ सप्टेंबर)"
                        />
                      </div>
                      <div>
                        <FestiveInput
                          label={isEn ? "Calendar Date (for IST Countdown):" : "कॅलेंडर तारीख (काउंटडाऊन अचूकतेसाठी):"}
                          type="date"
                          value={dayItem.date || ""}
                          onChange={(e) => handleDayFieldChange(dIdx, "date", e.target.value)}
                        />
                      </div>
                      <div>
                        <FestiveInput
                          label={isEn ? "Day Number:" : "दिवस क्रमांक:"}
                          type="number"
                          value={dayItem.dayNumber || dIdx + 1}
                          onChange={(e) => handleDayFieldChange(dIdx, "dayNumber", parseInt(e.target.value, 10) || 1)}
                        />
                      </div>
                    </div>

                    {/* EVENTS / AARTI SCHEDULE FOR THIS DAY */}
                    <div className="mt-3 pt-3 border-t border-gold-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-black text-maroon-950 uppercase tracking-wide">
                            {isEn ? "Scheduled Events for this Day:" : "या दिवसाच्या आरत्या व कार्यक्रम:"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddEvent(dIdx)}
                          className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-maroon-900 to-maroon-850 hover:from-maroon-850 hover:to-maroon-800 text-gold-200 text-xs font-bold border border-gold-400 flex items-center gap-1 shadow-2xs transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-gold-300" />
                          <span>{isEn ? "Add Event" : "आरती / पूजा जोडा"}</span>
                        </button>
                      </div>

                      {events.length === 0 ? (
                        <div className="p-4 bg-amber-50/50 rounded-xl border border-dashed border-gold-300 text-center text-xs text-stone-500">
                          {isEn ? "No events configured for this day. Click \"Add Event\" to create an aarti schedule." : "या दिवसासाठी कोणतीही आरती जोडलेली नाही. नवीन आरती जोडण्यासाठी वरील \"आरती / पूजा जोडा\" वर क्लिक करा."}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {events.map((evt, eIdx) => {
                            const isEvtActive = evt.active !== false;

                            return (
                              <div
                                key={evt.id || eIdx}
                                className={`p-3.5 rounded-xl border-2 transition-all space-y-3 ${
                                  isEvtActive 
                                    ? "bg-white border-gold-300 shadow-2xs" 
                                    : "bg-stone-50 border-stone-300 opacity-60"
                                }`}
                              >
                                {/* Event Header Bar */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gold-200">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-lg bg-gold-200 text-maroon-900 border border-gold-300">
                                      #{eIdx + 1} {isEn ? (evt.categoryEn || evt.categoryMr || "Aarti") : (evt.categoryMr || evt.categoryEn || "आरती")}
                                    </span>
                                    <span className="font-bold text-xs text-maroon-950 truncate max-w-[200px]">
                                      {isEn ? (evt.titleEn || evt.titleMr) : (evt.titleMr || evt.titleEn)}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleEventFieldChange(dIdx, eIdx, "active", !isEvtActive)}
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                        isEvtActive 
                                          ? "bg-emerald-100 text-emerald-900 border-emerald-300" 
                                          : "bg-stone-200 text-stone-700 border-stone-300"
                                      }`}
                                    >
                                      {isEvtActive ? (isEn ? "Active (सक्रिय)" : "सक्रिय") : (isEn ? "Inactive (बंद)" : "बंद")}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleMoveEvent(dIdx, eIdx, -1)}
                                      disabled={eIdx === 0}
                                      title={isEn ? "Move Event Up" : "वर घ्या"}
                                      className="p-1 rounded-lg bg-white hover:bg-gold-100 border border-gold-300 text-stone-700 disabled:opacity-30 transition cursor-pointer"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleMoveEvent(dIdx, eIdx, 1)}
                                      disabled={eIdx === events.length - 1}
                                      title={isEn ? "Move Event Down" : "खाली घ्या"}
                                      className="p-1 rounded-lg bg-white hover:bg-gold-100 border border-gold-300 text-stone-700 disabled:opacity-30 transition cursor-pointer"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteEvent(dIdx, eIdx)}
                                      title={isEn ? "Delete Event" : "कार्यक्रम काढा"}
                                      className="p-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Event Detailed Fields Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                                  {/* 1. Category / Badge */}
                                  <div>
                                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                                      {isEn ? "Event Category / Badge:" : "आरती / कार्यक्रम प्रकार:"}
                                    </label>
                                    <select
                                      value={evt.categoryEn || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        let mrVal = "महाआरती";
                                        if (val === "Morning Maha Aarti") mrVal = "सकाळची महाआरती";
                                        else if (val === "Evening Maha Aarti") mrVal = "संध्याकाळची महाआरती";
                                        else if (val === "Special Aarti") mrVal = "विशेष महाआरती";
                                        else if (val === "Ganpati Aarti") mrVal = "गणपती महाआरती";
                                        else if (val === "Dhupaarti") mrVal = "धूपारती व मंत्रपुष्पांजली";
                                        else if (val === "Cultural Event") mrVal = "सांस्कृतिक कार्यक्रम";
                                        else mrVal = val;
                                        
                                        handleEventFieldChange(dIdx, eIdx, "categoryEn", val);
                                        handleEventFieldChange(dIdx, eIdx, "categoryMr", mrVal);
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded-xl border border-gold-300 bg-white text-xs font-semibold text-maroon-950 focus:outline-none focus:ring-1 focus:ring-gold-500"
                                    >
                                      <option value="Morning Maha Aarti">🔥 Morning Maha Aarti (सकाळची महाआरती)</option>
                                      <option value="Evening Maha Aarti">✨ Evening Maha Aarti (संध्याकाळची महाआरती)</option>
                                      <option value="Special Aarti">🌟 Special Aarti (विशेष महाआरती)</option>
                                      <option value="Ganpati Aarti">🪔 Ganpati Aarti (गणपती महाआरती)</option>
                                      <option value="Dhupaarti">🕯️ Dhupaarti (धूपारती)</option>
                                      <option value="Cultural Event">🎭 Cultural Event (सांस्कृतिक कार्यक्रम)</option>
                                      <option value="Custom">📝 Custom Badge</option>
                                    </select>
                                  </div>

                                  {/* Custom Badge Text Override */}
                                  <div>
                                    <FestiveInput
                                      label={isEn ? "Custom Badge Text:" : "कस्टम बॅज मजकूर:"}
                                      value={isEn ? (evt.categoryEn || "") : (evt.categoryMr || "")}
                                      onChange={(e) => handleEventFieldChange(dIdx, eIdx, isEn ? "categoryEn" : "categoryMr", e.target.value)}
                                      placeholder={isEn ? "e.g. Morning Maha Aarti" : "उदा. सकाळची महाआरती"}
                                    />
                                  </div>

                                  {/* 2. Start Time & End Time (24-hour) */}
                                  <div>
                                    <FestiveInput
                                      label={isEn ? "Start Time (Countdown schedule):" : "सुरू वेळ (२४ तास फॉरमॅट):"}
                                      type="time"
                                      value={evt.startTime || "08:30"}
                                      onChange={(e) => handleEventFieldChange(dIdx, eIdx, "startTime", e.target.value)}
                                    />
                                  </div>

                                  <div>
                                    <FestiveInput
                                      label={isEn ? "End Time (Auto Completed state):" : "समाप्ती वेळ:"}
                                      type="time"
                                      value={evt.endTime || "09:30"}
                                      onChange={(e) => handleEventFieldChange(dIdx, eIdx, "endTime", e.target.value)}
                                    />
                                  </div>

                                  {/* 3. Event Title (English & Marathi) */}
                                  <div className="sm:col-span-2">
                                    <FestiveInput
                                      label={isEn ? "Event Title (English):" : "कार्यक्रम शीर्षक (इंग्रजी):"}
                                      value={evt.titleEn || ""}
                                      onChange={(e) => handleEventFieldChange(dIdx, eIdx, "titleEn", e.target.value)}
                                      placeholder="e.g. Murti Pranpratishtha Pooja & Maha Aarti"
                                      required
                                    />
                                  </div>

                                  <div className="sm:col-span-2">
                                    <FestiveInput
                                      label={isEn ? "Event Title (Marathi):" : "कार्यक्रम शीर्षक (मराठी):"}
                                      value={evt.titleMr || ""}
                                      onChange={(e) => handleEventFieldChange(dIdx, eIdx, "titleMr", e.target.value)}
                                      placeholder="उदा. मूर्ती प्राणप्रतिष्ठा पूजा व महाआरती"
                                      required
                                    />
                                  </div>

                                  {/* 4. Display Time String */}
                                  <div>
                                    <FestiveInput
                                      label={isEn ? "Display Time (English):" : "दर्शवलेली वेळ (इंग्रजी):"}
                                      value={evt.timeEn || ""}
                                      onChange={(e) => handleEventFieldChange(dIdx, eIdx, "timeEn", e.target.value)}
                                      placeholder="08:30 AM"
                                    />
                                  </div>

                                  <div>
                                    <FestiveInput
                                      label={isEn ? "Display Time (Marathi):" : "दर्शवलेली वेळ (मराठी):"}
                                      value={evt.time || ""}
                                      onChange={(e) => handleEventFieldChange(dIdx, eIdx, "time", e.target.value)}
                                      placeholder="सकाळी ०८:३० वाजता"
                                    />
                                  </div>

                                  {/* 5. Host Building & Quick Buttons */}
                                  <div>
                                    <FestiveInput
                                      label={isEn ? "Host Building (English):" : "यजमान इमारत (इंग्रजी):"}
                                      value={evt.hostWingEn || ""}
                                      onChange={(e) => handleEventFieldChange(dIdx, eIdx, "hostWingEn", e.target.value)}
                                      placeholder="e.g. All 5 Buildings Joint (G, H, I, J, K)"
                                    />
                                  </div>

                                  <div>
                                    <FestiveInput
                                      label={isEn ? "Host Building (Marathi):" : "यजमान इमारत (मराठी):"}
                                      value={evt.hostWing || ""}
                                      onChange={(e) => handleEventFieldChange(dIdx, eIdx, "hostWing", e.target.value)}
                                      placeholder="उदा. सर्व इमारती संयुक्त (G, H, J, K)"
                                    />
                                  </div>

                                  {/* 6. Host Coordinator / Representative */}
                                  <div>
                                    <FestiveInput
                                      label={isEn ? "Host Coordinator (English):" : "यजमान समन्वयक (इंग्रजी):"}
                                      value={evt.hostCoordinatorEn || ""}
                                      onChange={(e) => handleEventFieldChange(dIdx, eIdx, "hostCoordinatorEn", e.target.value)}
                                      placeholder="All Committee Members & Senior Residents"
                                    />
                                  </div>

                                  <div>
                                    <FestiveInput
                                      label={isEn ? "Host Coordinator (Marathi):" : "यजमान समन्वयक (मराठी):"}
                                      value={evt.hostCoordinator || ""}
                                      onChange={(e) => handleEventFieldChange(dIdx, eIdx, "hostCoordinator", e.target.value)}
                                      placeholder="म्हाडा उत्सव कमिटी पदाधिकारी"
                                    />
                                  </div>

                                  {/* 7. Offering / Prasad */}
                                  <div>
                                    <FestiveInput
                                      label={isEn ? "Offering / Prasad (English):" : "नैवेद्य / प्रसाद (इंग्रजी):"}
                                      value={evt.prasadEn || ""}
                                      onChange={(e) => handleEventFieldChange(dIdx, eIdx, "prasadEn", e.target.value)}
                                      placeholder="Steamed Ukadiche Modak"
                                    />
                                  </div>

                                  <div>
                                    <FestiveInput
                                      label={isEn ? "Offering / Prasad (Marathi):" : "नैवेद्य / प्रसाद (मराठी):"}
                                      value={evt.prasad || ""}
                                      onChange={(e) => handleEventFieldChange(dIdx, eIdx, "prasad", e.target.value)}
                                      placeholder="उकडीचे मोदक"
                                    />
                                  </div>

                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Bottom Action Bar */}
            <div className="pt-4 border-t-2 border-gold-300 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleAddDay}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gold-100 hover:bg-gold-200 text-maroon-950 font-black text-xs border border-gold-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-maroon-800" />
                <span>{isEn ? "+ Add New Day" : "+ नवीन दिवस जोडा"}</span>
              </button>

              <FestiveButton
                type="submit"
                icon={Save}
                variant="primary"
                size="md"
                disabled={isSaving}
              >
                {isSaving 
                  ? (isEn ? "Saving Schedule..." : "जतन करत आहे...") 
                  : (isEn ? "Save Daily Aarti Schedule & Timings" : "दैनिक आरती वेळापत्रक जतन करा (Save)")
                }
              </FestiveButton>
            </div>

          </form>
        )}
      </div>

      {/* 3. Pop-Up Image Modal with Single Close Button (Admin Preview) */}
      {previewModalImg && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-fadeIn"
          onClick={() => setPreviewModalImg(null)}
        >
          <div 
            className="relative max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Single Close Button */}
            <button
              type="button"
              onClick={() => setPreviewModalImg(null)}
              aria-label="Close"
              className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 z-20 w-11 h-11 sm:w-12 sm:h-12 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-full flex items-center justify-center shadow-2xl border-2 border-white transition-transform transform hover:scale-110 cursor-pointer"
              title="Close / बंद करा"
            >
              <X className="w-6 h-6 stroke-[3]" />
            </button>

            {/* High-Resolution Display Image */}
            <div className="w-full flex justify-center overflow-hidden rounded-2xl border-2 border-gold-400/90 shadow-2xl bg-black/60">
              <img 
                src={getMediaUrl(previewModalImg)} 
                alt="Schedule Preview" 
                onError={handleImageError}
                className="max-w-full max-h-[82vh] object-contain rounded-2xl" 
              />
            </div>

            {/* Single Close Action Bar */}
            <div className="mt-3 w-full flex items-center justify-between px-2 text-white">
              <span className="text-xs sm:text-sm font-bold text-gold-300 truncate">
                {isEn ? (cardForm.eventNameEn || cardForm.eventNameMr) : (cardForm.eventNameMr || "Schedule Preview")}
              </span>

              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="flex-shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md border border-white/40 flex items-center gap-1.5 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isEn ? "Close" : "बंद करा (Close)"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AartiScheduleManager;
