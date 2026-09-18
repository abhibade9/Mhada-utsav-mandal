import React, { useState, useEffect, useRef } from "react";
import { 
  X, Calendar, Clock, MapPin, Building, Sparkles, 
  Trophy, HeartHandshake, Search, Table, LayoutGrid, CheckCircle2, 
  CalendarDays, Award, Users, Filter, ChevronRight, Flame,
  Plus, Edit, Trash2, Camera, Upload, Download, Eye, AlertCircle
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { triggerLiveSync, subscribeLiveSync } from "../utils/liveSync";
import { getAllWingsLabel } from "../utils/wingUtils";
import { getMediaUrl, handleImageError } from "../utils/mediaUrl";

// Local image compression helper for uploading photos from device
const compressImageFile = (file, maxWidth = 1000, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const UpcomingEventsCalendarModal = ({ isOpen, onClose, defaultTab = "festival" }) => {
  const { language } = useLanguage();
  const { config } = useConfig();
  const { admin } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState(defaultTab); // "10days" | "festival" | "yearly" | "all"
  const [viewMode, setViewMode] = useState("table"); // "table" | "card"
  const [selectedDay, setSelectedDay] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [allEvents, setAllEvents] = useState([]);

  // Admin In-Modal CRUD State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [actionToast, setActionToast] = useState(null);

  const [eventFormData, setEventFormData] = useState({
    eventType: "festival",
    category: "cultural",
    categoryEn: "",
    titleMr: "",
    titleEn: "",
    time: "",
    dateStr: "",
    dateStrEn: "",
    dayNumber: 1,
    venue: "मुख्य मंडप, म्हाडा टॉवर्स",
    venueEn: "Main Pandal, MHADA Towers",
    hostWing: "",
    hostWingEn: "",
    descriptionMr: "",
    descriptionEn: "",
    imageUrl: "",
    isHighlight: false,
    status: "upcoming"
  });

  const showToast = (message, type = "success") => {
    setActionToast({ message, type });
    setTimeout(() => setActionToast(null), 3500);
  };

  // Fetch all events dynamically from API
  const fetchEvents = () => {
    API.get("/events")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setAllEvents(res.data.data);
        }
      })
      .catch((err) => console.error("Error loading events for modal:", err));
  };

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
      const unsub = subscribeLiveSync(({ entity }) => {
        if (entity === "events" || entity === "all") {
          fetchEvents();
        }
      });
      return () => unsub();
    }
  }, [isOpen]);

  // Sync defaultTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab || "10days");
      setSearchQuery("");
      setSelectedCategory("all");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, defaultTab]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const raw10Days = config?.dailyAartiSchedule || [];
  const normalized10Days = raw10Days.map((d, i) => ({
    day: d.dayNumber || d.day || (i + 1),
    date: d.dateStr || d.date || "",
    dateEn: d.dateStrEn || d.dateStr || d.date || "",
    tithi: d.tithi || "दैनिक महापूजा व आरती",
    tithiEn: d.tithiEn || "Daily Mahapooja & Aarti",
    morningTime: d.morningTime || "०८:३० AM",
    eveningTime: d.eveningTime || "०८:०० PM",
    hostWing: d.hostWing || "",
    hostWingEn: d.hostWingEn || d.hostWing || "",
    hostLead: d.hostLead || "",
    hostLeadEn: d.hostLeadEn || d.hostLead || "",
    ritual: d.ritual || d.morningRitual || "",
    ritualEn: d.ritualEn || d.morningRitualEn || "",
    cultural: d.cultural || d.eveningRitual || "",
    culturalEn: d.culturalEn || d.eveningRitualEn || ""
  }));

  const festivalEvents = allEvents
    .filter((e) => e.eventType === "festival" || !e.eventType)
    .map((e) => ({
      ...e,
      id: e._id || e.id,
      titleMr: e.titleMr,
      titleEn: e.titleEn || e.titleMr,
      descMr: e.descriptionMr || e.descMr || "",
      descEn: e.descriptionEn || e.descEn || e.descriptionMr || "",
      dateMr: e.dateStr || e.dateMr || e.time || "",
      dateEn: e.dateStrEn || e.dateEn || e.time || "",
      venueMr: e.venueMr || e.venue || "",
      venueEn: e.venueEn || e.venue || "",
      category: e.category || "इतर",
      categoryEn: e.categoryEn || e.category || "Other",
      hostWing: e.hostWing || e.targetWing || "",
      hostWingEn: e.hostWingEn || e.hostWing || e.targetWing || "",
      imageUrl: e.imageUrl || "",
      type: "festival"
    }));

  const yearlyEvents = allEvents
    .filter((e) => e.eventType === "yearly")
    .map((e) => ({
      ...e,
      id: e._id || e.id,
      titleMr: e.titleMr,
      titleEn: e.titleEn || e.titleMr,
      descMr: e.descriptionMr || e.descMr || "",
      descEn: e.descriptionEn || e.descEn || e.descriptionMr || "",
      dateMr: e.dateStr || e.dateMr || e.time || "",
      dateEn: e.dateStrEn || e.dateEn || e.time || "",
      venueMr: e.venueMr || e.venue || "",
      venueEn: e.venueEn || e.venue || "",
      category: e.category || "वार्षिक",
      categoryEn: e.categoryEn || e.category || "Yearly",
      hostWing: e.hostWing || e.targetWing || "",
      hostWingEn: e.hostWingEn || e.hostWing || e.targetWing || "",
      imageUrl: e.imageUrl || "",
      type: "yearly"
    }));

  // Handle opening the Add Event Dialog
  const handleOpenAdd = () => {
    setEditingEvent(null);
    setEventFormData({
      eventType: activeTab === "yearly" ? "yearly" : "festival",
      category: "cultural",
      categoryEn: "",
      titleMr: "",
      titleEn: "",
      time: "",
      dateStr: "",
      dateStrEn: "",
      dayNumber: 1,
      venue: "मुख्य मंडप, म्हाडा टॉवर्स",
      venueEn: "Main Pandal, MHADA Towers",
      hostWing: "सर्व विंग्ज (G, H, J, K)",
      hostWingEn: "All Wings (G, H, J, K)",
      descriptionMr: "",
      descriptionEn: "",
      imageUrl: "",
      isHighlight: false,
      status: "upcoming"
    });
    setIsFormOpen(true);
  };

  // Handle opening the Edit Event Dialog
  const handleOpenEdit = (ev) => {
    setEditingEvent(ev);
    setEventFormData({
      eventType: ev.eventType || ev.type || "festival",
      category: ev.category || "cultural",
      categoryEn: ev.categoryEn || "",
      titleMr: ev.titleMr || "",
      titleEn: ev.titleEn || "",
      time: ev.time || "",
      dateStr: ev.dateStr || ev.dateMr || "",
      dateStrEn: ev.dateStrEn || ev.dateEn || "",
      dayNumber: ev.dayNumber || 1,
      venue: ev.venue || ev.venueMr || "मुख्य मंडप, म्हाडा टॉवर्स",
      venueEn: ev.venueEn || "Main Pandal, MHADA Towers",
      hostWing: ev.hostWing || "सर्व विंग्ज (G, H, J, K)",
      hostWingEn: ev.hostWingEn || "All Wings (G, H, J, K)",
      descriptionMr: ev.descriptionMr || ev.descMr || "",
      descriptionEn: ev.descriptionEn || ev.descEn || "",
      imageUrl: ev.imageUrl || "",
      isHighlight: Boolean(ev.isHighlight),
      status: ev.status || "upcoming"
    });
    setIsFormOpen(true);
  };

  // Handle saving (Create or Update) Event
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventFormData.titleMr && !eventFormData.titleEn) {
      alert(language === "mr" ? "कृपया कार्यक्रमाचे शीर्षक प्रविष्ट करा" : "Please enter event title");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...eventFormData,
        titleMr: eventFormData.titleMr || eventFormData.titleEn,
        titleEn: eventFormData.titleEn || eventFormData.titleMr
      };
      if (editingEvent && (editingEvent.id || editingEvent._id)) {
        const id = editingEvent.id || editingEvent._id;
        const res = await API.put(`/events/${id}`, payload);
        if (res.data?.success) {
          showToast(language === "mr" ? "कार्यक्रम यशस्वीरीत्या अद्ययावत केला!" : "Event updated successfully!", "success");
          setIsFormOpen(false);
          fetchEvents();
          triggerLiveSync("events");
        }
      } else {
        const res = await API.post("/events", payload);
        if (res.data?.success) {
          showToast(language === "mr" ? "नवीन कार्यक्रम कॅलेंडरमध्ये जोडला गेला!" : "New event added to calendar!", "success");
          setIsFormOpen(false);
          fetchEvents();
          triggerLiveSync("events");
        }
      }
    } catch (err) {
      console.error("Save event error:", err);
      const msg = err.response?.data?.message || err.message || (language === "mr" ? "कार्यक्रम जतन करताना त्रुटी आली" : "Failed to save event");
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting Event
  const handleDeleteEvent = async (id, title) => {
    const confirmMsg = language === "mr" 
      ? `तुम्हाला '${title || "हा कार्यक्रम"}' नक्की हटवायचा आहे का?` 
      : `Are you sure you want to delete '${title || "this event"}'?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await API.delete(`/events/${id}`);
      if (res.data?.success) {
        showToast(language === "mr" ? "कार्यक्रम दिनदर्शिकेतून हटवला गेला!" : "Event removed from calendar!", "success");
        fetchEvents();
        triggerLiveSync("events");
      }
    } catch (err) {
      console.error("Delete event error:", err);
      showToast(language === "mr" ? "कार्यक्रम हटवताना त्रुटी आली" : "Failed to delete event", "error");
    }
  };

  // Handle selecting photo from device inside modal (uploaded to server/uploads/)
  const handleImagePickerInModal = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert(language === "mr" ? "कृपया वैध फोटो निवडा (JPG, PNG, WebP)" : "Please select an image file (JPG, PNG, WebP)");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("category", "event");

      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data.imageUrl) {
        setEventFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
      } else {
        throw new Error(res.data?.message || "Upload failed");
      }
    } catch (err) {
      console.warn("Server upload fallback:", err);
      try {
        const compressed = await compressImageFile(file);
        setEventFormData(prev => ({ ...prev, imageUrl: compressed }));
      } catch (fallbackErr) {
        console.error(fallbackErr);
        alert(language === "mr" ? "फोटो वाचताना त्रुटी आली" : "Failed to load photo");
      }
    }
  };

  // Handle importing JSON / CSV calendar from device
  const handleImportFileInModal = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target.result;
        let parsedEvents = [];
        if (file.name.endsWith(".json")) {
          const json = JSON.parse(content);
          parsedEvents = Array.isArray(json) ? json : (json.events || []);
        } else if (file.name.endsWith(".csv")) {
          const lines = content.split(/\r?\n/).filter(line => line.trim());
          if (lines.length > 1) {
            const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
              if (cols.length >= 3) {
                const item = {};
                headers.forEach((h, idx) => {
                  item[h] = cols[idx] || "";
                });
                parsedEvents.push(item);
              }
            }
          }
        }

        if (parsedEvents.length === 0) {
          showToast(language === "mr" ? "फाइलमध्ये वैध कार्यक्रम आढळले नाहीत" : "No valid events found in file", "error");
          return;
        }

        const res = await API.post("/events/bulk", { events: parsedEvents });
        if (res.data?.success) {
          showToast(
            language === "mr" ? `${res.data.count} कार्यक्रम फाइलमधून आयात केले!` : `Successfully imported ${res.data.count} events!`,
            "success"
          );
          fetchEvents();
        }
      } catch (err) {
        console.error(err);
        showToast(language === "mr" ? "फाइल आयात करताना त्रुटी आली" : "Import failed", "error");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Handle exporting current calendar events as JSON to device
  const handleExportCalendar = () => {
    if (!allEvents || allEvents.length === 0) {
      showToast(language === "mr" ? "डाउनलोड करण्यासाठी कोणतेही कार्यक्रम नाहीत" : "No events to export", "error");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allEvents, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mhada_events_calendar_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(language === "mr" ? "दिनदर्शिका बॅकअप डाउनलोड झाला!" : "Calendar downloaded to device!", "success");
  };

  if (!isOpen) return null;

  // Prepare events list for Upcoming / Yearly tabs
  let sourceEvents = [];
  if (activeTab === "festival") {
    sourceEvents = festivalEvents;
  } else if (activeTab === "yearly") {
    sourceEvents = yearlyEvents;
  } else if (activeTab === "all") {
    sourceEvents = [...festivalEvents, ...yearlyEvents];
  }

  // Filter events by search query and category (for upcoming / yearly)
  const filteredEvents = sourceEvents.filter((ev) => {
    const title = (language === "mr" ? ev.titleMr : ev.titleEn).toLowerCase();
    const desc = (language === "mr" ? ev.descMr : ev.descEn).toLowerCase();
    const venue = (language === "mr" ? (ev.venueMr || "") : (ev.venueEn || "")).toLowerCase();
    const cat = (ev.category || "").toLowerCase();
    const q = searchQuery.trim().toLowerCase();

    const matchesQuery = !q || title.includes(q) || desc.includes(q) || venue.includes(q) || cat.includes(q);
    const matchesCategory = selectedCategory === "all" || ev.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  // Filter 10-days schedule by search query
  const filtered10Days = normalized10Days.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const tithi = (language === "mr" ? item.tithi : item.tithiEn).toLowerCase();
    const wing = (language === "mr" ? item.hostWing : item.hostWingEn).toLowerCase();
    const ritual = (language === "mr" ? item.ritual : item.ritualEn).toLowerCase();
    const cult = (language === "mr" ? item.cultural : item.culturalEn).toLowerCase();
    const lead = (item.hostLead || "").toLowerCase();
    return tithi.includes(q) || wing.includes(q) || ritual.includes(q) || cult.includes(q) || lead.includes(q);
  });

  // Active day item for 10-days single view
  const activeDayItem = normalized10Days.find((d) => d.day === selectedDay) || normalized10Days[0] || {};

  // Extract unique categories for upcoming/yearly filter
  const categories = ["all", ...new Set(sourceEvents.map(e => e.category))];

  const getCategoryColor = (category) => {
    switch (category) {
      case "सांस्कृतिक":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "महिला विशेष":
        return "bg-rose-100 text-rose-900 border-rose-300";
      case "भक्तिसंगीत":
        return "bg-purple-100 text-purple-900 border-purple-300";
      case "सत्कार सोहळा":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "ऐतिहासिक":
        return "bg-orange-100 text-orange-900 border-orange-300";
      case "सामाजिक सेवा":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "पर्यावरण":
        return "bg-teal-100 text-teal-900 border-teal-300";
      case "स्नेहसंमेलन":
        return "bg-yellow-100 text-yellow-900 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-900 border-gray-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div 
        className="bg-[#FFFDF9] rounded-3xl border-2 border-gold-400 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-calendar-modal-title"
      >
        {/* Top Gold Accent Line */}
        <div className="h-1.5 bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600 w-full flex-shrink-0" />

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-white px-4 sm:px-6 py-4 flex-shrink-0 border-b-2 border-gold-500/60">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black uppercase text-gold-200 bg-maroon-850 px-2.5 py-0.5 rounded-full border border-gold-400/50">
                  <CalendarDays className="w-3.5 h-3.5 text-gold-300" />
                  <span>
                    {activeTab === "10days" 
                      ? (language === "mr" ? "१० दिवसांचे वेळापत्रक" : "10-Day Festival Schedule")
                      : (language === "mr" ? "आगामी व वार्षिक कार्यक्रम पत्रिका" : "Upcoming & Yearly Events Calendar")}
                  </span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold text-gold-300/80 bg-maroon-800/80 px-2 py-0.5 rounded-md border border-gold-500/30">
                  {language === "mr" ? "सहभागी ४ इमारती (G • H • J • K)" : "4 Buildings: G, H, J, K"}
                </span>
              </div>

              <h2 id="schedule-calendar-modal-title" className="text-lg sm:text-2xl font-black text-gold-300 font-heading tracking-tight drop-shadow-xs truncate">
                {activeTab === "10days"
                  ? (language === "mr" ? "१० दिवसांचे तारीखनिहाय वेळापत्रक" : "10-Day Date-Wise Festival Schedule")
                  : (language === "mr" ? "आगामी व वार्षिक कार्यक्रम कॅलेंडर" : "Upcoming & Yearly Events Calendar")}
              </h2>
              <p className="text-[11px] sm:text-xs text-gold-100/90 font-medium line-clamp-1">
                {activeTab === "10days"
                  ? (language === "mr" 
                      ? "गणेश चतुर्थी ते अनंत चतुर्दशी दैनिक पूजा, महाआरती व विंग यजमान" 
                      : "Daily rituals, morning/evening maha aarti, and building host coordinators")
                  : (language === "mr"
                      ? "गणेशोत्सवातील विविध स्पर्धा आणि मंडळाचे वर्षभरातील उपक्रम"
                      : "Festival cultural competitions and year-round Mandal initiatives")}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gold-300 hover:text-white bg-maroon-850 hover:bg-maroon-800 border border-gold-500/40 transition-transform active:scale-95 flex-shrink-0"
              aria-label="पॉप-अप बंद करा"
              title="बंद करा (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Quick Action Strip */}
          {admin && (
            <div className="mt-3 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-transparent border border-gold-400/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-gold-400 text-maroon-950 font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-maroon-950" />
                  <span>{language === "mr" ? "ॲडमिन मोड" : "Admin Mode"}</span>
                </span>
                <span className="text-[11px] font-bold text-gold-200 hidden sm:inline">
                  {language === "mr" ? "थेट कार्यक्रम जोडा, संपादन करा किंवा फाईल आयात करा" : "Manage calendar events or import from local device"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-maroon-950 font-black text-xs transition shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === "mr" ? "+ नवीन कार्यक्रम जोडा" : "+ Add Event"}</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-maroon-850 hover:bg-maroon-800 text-gold-200 border border-gold-400/50 font-bold text-xs transition active:scale-95 whitespace-nowrap cursor-pointer"
                  title={language === "mr" ? "डिव्हाइसवरून JSON/CSV फाईल आयात करा" : "Import JSON/CSV from device"}
                >
                  <Upload className="w-3.5 h-3.5 text-gold-300" />
                  <span>{language === "mr" ? "फाईल आयात करा" : "Import File"}</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,.csv"
                  className="hidden"
                  onChange={handleImportFileInModal}
                />

                <button
                  onClick={handleExportCalendar}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-maroon-850 hover:bg-maroon-800 text-gold-200 border border-gold-400/50 font-bold text-xs transition active:scale-95 whitespace-nowrap cursor-pointer"
                  title={language === "mr" ? "दिनदर्शिका JSON फाईल डाउनलोड करा" : "Download calendar backup"}
                >
                  <Download className="w-3.5 h-3.5 text-gold-300" />
                  <span>{language === "mr" ? "बॅकअप डाऊनलोड" : "Export"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Category Switcher Tabs */}
          <div className="mt-3.5 pt-3 border-t border-gold-500/30 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
              
              {/* Tab 1: 10-Days Schedule */}
              <button
                onClick={() => setActiveTab("10days")}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "10days"
                    ? "bg-gold-400 text-maroon-950 font-black shadow-md border border-gold-300"
                    : "bg-maroon-850/80 text-gold-200 hover:bg-maroon-800 border border-gold-500/30"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{language === "mr" ? "१० दिवसांचे वेळापत्रक" : "10-Day Schedule"}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-maroon-950 text-gold-300">
                  १०
                </span>
              </button>

              {/* Tab 2: Festival Competitions */}
              <button
                onClick={() => setActiveTab("festival")}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "festival"
                    ? "bg-gold-400 text-maroon-950 font-black shadow-md border border-gold-300"
                    : "bg-maroon-850/80 text-gold-200 hover:bg-maroon-800 border border-gold-500/30"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{language === "mr" ? "उत्सव स्पर्धा व कार्यक्रम" : "Festival Competitions"}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-maroon-950 text-gold-300">
                  {festivalEvents.length}
                </span>
              </button>

              {/* Tab 3: Yearly Calendar */}
              <button
                onClick={() => setActiveTab("yearly")}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "yearly"
                    ? "bg-gold-400 text-maroon-950 font-black shadow-md border border-gold-300"
                    : "bg-maroon-850/80 text-gold-200 hover:bg-maroon-800 border border-gold-500/30"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{language === "mr" ? "मंडळाचे वार्षिक उपक्रम" : "Yearly Calendar"}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-maroon-950 text-gold-300">
                  {yearlyEvents.length}
                </span>
              </button>

            </div>

            {/* View Mode Switcher (Table vs Cards) */}
            <div className="flex items-center gap-1 bg-maroon-950 p-1 rounded-xl border border-gold-500/40">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  viewMode === "table"
                    ? "bg-gold-400 text-maroon-950 font-black shadow-xs"
                    : "text-gold-200 hover:text-white"
                }`}
                title="टेबल रचना (Structured Table View)"
              >
                <Table className="w-3.5 h-3.5" />
                <span>{language === "mr" ? "टेबल" : "Table"}</span>
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  viewMode === "card"
                    ? "bg-gold-400 text-maroon-950 font-black shadow-xs"
                    : "text-gold-200 hover:text-white"
                }`}
                title="कार्ड रचना (Card View)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{language === "mr" ? "कार्ड" : "Card"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#FAF5EB] px-4 sm:px-6 py-2.5 border-b border-gold-300/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-maroon-800 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "10days"
                  ? (language === "mr" ? "तिथी, विंग किंवा विधी शोधा..." : "Search tithi, wing, ritual...")
                  : (language === "mr" ? "कार्यक्रम, स्पर्धा किंवा ठिकाण शोधा..." : "Search event, competition, venue...")
              }
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-gold-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder:text-gray-400 text-maroon-950 font-medium"
            />
          </div>

          {activeTab !== "10days" && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-maroon-900 flex items-center gap-1 whitespace-nowrap">
                <Filter className="w-3 h-3 text-amber-700" />
                <span>{language === "mr" ? "वर्ग:" : "Category:"}</span>
              </span>
              <div className="flex items-center gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap border ${
                      selectedCategory === cat
                        ? "bg-maroon-850 text-gold-200 border-gold-500 shadow-2xs"
                        : "bg-white text-gray-700 hover:bg-gold-50 border-gold-200"
                    }`}
                  >
                    {cat === "all" ? (language === "mr" ? "सर्व" : "All") : cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "10days" && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-maroon-900">
              <Building className="w-3.5 h-3.5 text-maroon-800" />
              <span>G (नंदादेवी) • H (निलगिरी) • J (पूर्वांचल) • K (गोवर्धन)</span>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-4">
          
          {/* ======================================================== */}
          {/* SECTION A: 10-DAY FESTIVAL SCHEDULE                      */}
          {/* ======================================================== */}
          {activeTab === "10days" && (
            <>
              {/* Day Quick Selector */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {normalized10Days.map((item) => {
                  const isSelected = item.day === selectedDay;
                  return (
                    <button
                      key={item.day}
                      onClick={() => setSelectedDay(item.day)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border text-center ${
                        isSelected
                          ? "bg-maroon-850 text-gold-200 border-gold-500 shadow-md transform scale-105"
                          : "bg-white text-maroon-900 hover:bg-gold-100 border-gold-300"
                      }`}
                    >
                      <span className="block text-[10px] opacity-80 uppercase">
                        {language === "mr" ? `दिवस ${item.day}` : `Day ${item.day}`}
                      </span>
                      <span className="block font-extrabold whitespace-nowrap text-[11px]">
                        {item.date.split(" ")[0]} {item.date.split(" ")[1]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 1. TABLE VIEW FOR 10 DAYS SCHEDULE (DESKTOP & TABLET) */}
              {viewMode === "table" && (
                <div className="hidden md:block bg-white rounded-2xl border-2 border-gold-300 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-gold-200 text-xs font-heading tracking-wide border-b-2 border-gold-400">
                        <th className="py-3 px-4 w-[16%] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gold-400" />
                            <span>{language === "mr" ? "दिवस व तारीख" : "Day & Date"}</span>
                          </div>
                        </th>
                        <th className="py-3 px-4 w-[24%]">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                            <span>{language === "mr" ? "तिथी व विशेष विधी" : "Tithi & Ritual"}</span>
                          </div>
                        </th>
                        <th className="py-3 px-4 w-[22%]">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-gold-400" />
                            <span>{language === "mr" ? "यजमान विंग व प्रमुख" : "Host Wing & Lead"}</span>
                          </div>
                        </th>
                        <th className="py-3 px-4 w-[16%] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                            <span>{language === "mr" ? "आरती वेळा" : "Aarti Timings"}</span>
                          </div>
                        </th>
                        <th className="py-3 px-4 w-[22%]">
                          <div className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-gold-400" />
                            <span>{language === "mr" ? "सांस्कृतिक कार्यक्रम" : "Cultural Program"}</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-200 text-xs text-gray-800">
                      {filtered10Days.map((item, idx) => (
                        <tr
                          key={item.day}
                          className={`hover:bg-amber-50/60 transition-colors ${
                            item.day === selectedDay 
                              ? "bg-amber-50/90 font-medium" 
                              : (idx % 2 === 0 ? "bg-white" : "bg-[#FFFDF9]")
                          }`}
                        >
                          {/* Day & Date */}
                          <td className="py-3 px-4 align-top">
                            <div className="space-y-1">
                              <span className="inline-block text-[10px] font-black uppercase text-maroon-950 bg-gold-200/90 px-2 py-0.5 rounded-md border border-gold-400">
                                {language === "mr" ? `दिवस ${item.day}` : `Day ${item.day}`}
                              </span>
                              <div className="font-bold text-xs text-maroon-950 leading-tight">
                                {language === "mr" ? item.date : item.dateEn}
                              </div>
                            </div>
                          </td>

                          {/* Tithi & Ritual */}
                          <td className="py-3 px-4 align-top">
                            <div className="space-y-1">
                              <div className="font-bold text-xs text-maroon-950 font-heading">
                                {language === "mr" ? item.tithi : item.tithiEn}
                              </div>
                              <p className="text-[11px] text-gray-700 leading-relaxed">
                                {language === "mr" ? item.ritual : item.ritualEn}
                              </p>
                            </div>
                          </td>

                          {/* Host Wing & Lead */}
                          <td className="py-3 px-4 align-top">
                            <div className="space-y-1">
                              <div className="inline-flex items-center gap-1 font-bold text-maroon-900 bg-maroon-50 px-2 py-0.5 rounded border border-maroon-200 text-[11px]">
                                <Building className="w-3 h-3 text-maroon-700 flex-shrink-0" />
                                <span>{language === "mr" ? item.hostWing : item.hostWingEn}</span>
                              </div>
                              <div className="text-[11px] text-gray-600 font-medium">
                                प्रमुख: {item.hostLead}
                              </div>
                            </div>
                          </td>

                          {/* Aarti Timings */}
                          <td className="py-3 px-4 align-top whitespace-nowrap">
                            <div className="space-y-1 text-[11px]">
                              <div className="flex items-center gap-1 font-semibold text-gray-700">
                                <span className="text-amber-700">सकाळ:</span>
                                <span className="font-bold text-maroon-950">{item.morningTime}</span>
                              </div>
                              <div className="flex items-center gap-1 font-semibold text-gray-700">
                                <span className="text-amber-700">संध्या:</span>
                                <span className="font-bold text-maroon-950">{item.eveningTime}</span>
                              </div>
                            </div>
                          </td>

                          {/* Cultural Program */}
                          <td className="py-3 px-4 align-top">
                            <p className="text-[11px] text-indigo-950 bg-indigo-50/60 p-2 rounded-xl border border-indigo-200/80 leading-relaxed font-medium">
                              {language === "mr" ? item.cultural : item.culturalEn}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 2. MOBILE-FIRST CARDS FOR 10 DAYS SCHEDULE */}
              <div className={`${viewMode === "table" ? "block md:hidden" : "block"} space-y-3`}>
                {filtered10Days.map((item) => (
                  <div
                    key={item.day}
                    className="bg-white rounded-2xl border-2 border-gold-300 p-4 shadow-sm hover:border-gold-500 transition space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-gold-100 pb-2">
                      <span className="text-[10px] font-black uppercase text-maroon-950 bg-gold-200 px-2.5 py-0.5 rounded-full border border-gold-400">
                        {language === "mr" ? `दिवस ${item.day}` : `Day ${item.day}`} • {language === "mr" ? item.date : item.dateEn}
                      </span>
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-maroon-900 bg-maroon-50 px-2 py-0.5 rounded-md border border-maroon-200">
                        <Building className="w-3 h-3 text-maroon-700 flex-shrink-0" />
                        <span>{language === "mr" ? item.hostWing : item.hostWingEn}</span>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-sm text-maroon-950 font-heading">
                      {language === "mr" ? item.tithi : item.tithiEn}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 bg-[#FAF5EB] p-2.5 rounded-xl border border-gold-200 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block uppercase">सकाळ महाआरती</span>
                        <span className="font-bold text-maroon-950">{item.morningTime}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block uppercase">संध्याकाळ महाआरती</span>
                        <span className="font-bold text-maroon-950">{item.eveningTime}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="p-2 bg-amber-50/80 rounded-xl border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-900 uppercase block">विशेष पूजा व विधी:</span>
                        <p className="text-gray-800 text-[11px] mt-0.5">{language === "mr" ? item.ritual : item.ritualEn}</p>
                      </div>

                      <div className="p-2 bg-indigo-50/80 rounded-xl border border-indigo-200">
                        <span className="text-[10px] font-bold text-indigo-900 uppercase block">सांस्कृतिक कार्यक्रम:</span>
                        <p className="text-gray-800 text-[11px] mt-0.5">{language === "mr" ? item.cultural : item.culturalEn}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-gold-100">
                      <span className="text-[11px] text-gray-600 font-medium">समन्वयक: <strong>{item.hostLead}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* SECTION B: UPCOMING & YEARLY FESTIVAL EVENTS             */}
          {/* ======================================================== */}
          {activeTab !== "10days" && (
            <>
              {filteredEvents.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-gold-300">
                  <Calendar className="w-10 h-10 text-gold-400 mx-auto mb-2 opacity-80" />
                  <h3 className="text-sm font-bold text-maroon-950 font-heading">
                    {language === "mr" ? "कोणताही कार्यक्रम सापडला नाही" : "No Events Found"}
                  </h3>
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                    className="mt-3 px-3 py-1.5 text-xs font-bold text-maroon-900 bg-gold-200 hover:bg-gold-300 rounded-xl transition"
                  >
                    {language === "mr" ? "सर्व फिल्टर रीसेट करा" : "Reset Filters"}
                  </button>
                </div>
              ) : (
                <>
                  {/* 1. TABLE VIEW FOR UPCOMING & YEARLY EVENTS */}
                  {viewMode === "table" && (
                    <div className="hidden md:block bg-white rounded-2xl border-2 border-gold-300 shadow-sm overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-gold-200 text-xs font-heading tracking-wide border-b-2 border-gold-400">
                            <th className="py-3 px-3 text-center w-[60px] whitespace-nowrap">
                              <Camera className="w-3.5 h-3.5 text-gold-400 mx-auto" />
                            </th>
                            <th className="py-3 px-4 w-[20%] whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gold-400" />
                                <span>{language === "mr" ? "दिनांक व वेळ" : "Date & Time"}</span>
                              </div>
                            </th>
                            <th className="py-3 px-4 w-[26%]">
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                                <span>{language === "mr" ? "कार्यक्रमाचे नाव व वर्ग" : "Event Name & Category"}</span>
                              </div>
                            </th>
                            <th className="py-3 px-4 w-[20%]">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gold-400" />
                                <span>{language === "mr" ? "ठिकाण व यजमान विंग" : "Venue & Host Wing"}</span>
                              </div>
                            </th>
                            <th className="py-3 px-4 w-[24%]">
                              <div className="flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-gold-400" />
                                <span>{language === "mr" ? "तपशील व नियमावली" : "Details & Guidelines"}</span>
                              </div>
                            </th>
                            {admin && (
                              <th className="py-3 px-3 text-center whitespace-nowrap">
                                <span className="text-[10px] font-black text-amber-300 uppercase">{language === "mr" ? "ॲडमिन कृती" : "Admin"}</span>
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-200 text-xs text-gray-800">
                          {filteredEvents.map((ev, idx) => (
                            <tr
                              key={ev.id || idx}
                              className={`hover:bg-amber-50/60 transition-colors ${
                                idx % 2 === 0 ? "bg-white" : "bg-[#FFFDF9]"
                              }`}
                            >
                              {/* Photo / Poster thumbnail */}
                              <td className="py-3 px-2 text-center align-top">
                                {ev.imageUrl ? (
                                  <button
                                    onClick={() => setLightboxImg(ev.imageUrl)}
                                    className="w-10 h-10 rounded-lg overflow-hidden border border-gold-300 hover:scale-105 transition shadow-2xs inline-block bg-stone-100 cursor-pointer"
                                    title={language === "mr" ? "फोटो पहा" : "View photo"}
                                  >
                                    <img 
                                      src={getMediaUrl(ev.imageUrl)} 
                                      alt={ev.titleMr} 
                                      onError={handleImageError}
                                      className="w-full h-full object-cover" 
                                    />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-stone-300">-</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 align-top">
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 font-black text-maroon-950 text-xs bg-gold-100/90 px-2 py-0.5 rounded-md border border-gold-300 leading-snug">
                                    <Calendar className="w-3 h-3 text-amber-700 flex-shrink-0" />
                                    <span>{language === "mr" ? ev.dateMr : ev.dateEn}</span>
                                  </span>
                                  {ev.type === "yearly" && (
                                    <span className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider pl-1">
                                      {language === "mr" ? "• दरवर्षी आयोजित" : "• Annual Mandal Event"}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 align-top">
                                <div className="space-y-1.5">
                                  <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getCategoryColor(ev.category)}`}>
                                    {language === "mr" ? ev.category : ev.categoryEn}
                                  </span>
                                  <h4 className="font-extrabold text-sm text-maroon-950 font-heading leading-tight">
                                    {language === "mr" ? ev.titleMr : ev.titleEn}
                                  </h4>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 align-top">
                                <div className="space-y-1 text-gray-700">
                                  <div className="flex items-start gap-1 font-semibold text-xs">
                                    <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                                    <span>{language === "mr" ? ev.venueMr : ev.venueEn}</span>
                                  </div>
                                  {ev.hostWing && (
                                    <div className="flex items-start gap-1 text-[11px] text-maroon-800 font-medium bg-maroon-50 px-2 py-0.5 rounded border border-maroon-200">
                                      <Building className="w-3 h-3 text-maroon-700 flex-shrink-0 mt-0.5" />
                                      <span>{language === "mr" ? ev.hostWing : ev.hostWingEn}</span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 align-top">
                                <p className="text-xs text-gray-700 leading-relaxed font-normal">
                                  {language === "mr" ? ev.descMr : ev.descEn}
                                </p>
                              </td>

                              {admin && (
                                <td className="py-3.5 px-3 align-top text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleOpenEdit(ev)}
                                      className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition active:scale-95 shadow-2xs cursor-pointer"
                                      title={language === "mr" ? "कार्यक्रम संपादन करा" : "Edit Event"}
                                    >
                                      <Edit className="w-3.5 h-3.5 text-amber-800" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEvent(ev.id || ev._id, ev.titleMr)}
                                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition active:scale-95 shadow-2xs cursor-pointer"
                                      title={language === "mr" ? "कार्यक्रम हटवा" : "Delete Event"}
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 2. MOBILE-FIRST CARDS FOR UPCOMING & YEARLY EVENTS */}
                  <div className={`${viewMode === "table" ? "block md:hidden" : "block"} space-y-3`}>
                    {filteredEvents.map((ev, idx) => (
                      <div
                        key={ev.id || idx}
                        className="bg-white rounded-2xl border-2 border-gold-300 p-3.5 sm:p-4 shadow-sm hover:border-gold-500 transition space-y-2.5"
                      >
                        {/* Event Poster / Flyer Banner if present */}
                        {ev.imageUrl && (
                          <div 
                            onClick={() => setLightboxImg(ev.imageUrl)}
                            className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden cursor-pointer group border border-gold-300 shadow-2xs bg-stone-100"
                            title={language === "mr" ? "फोटो मोठा पहा" : "View photo"}
                          >
                            <img 
                              src={getMediaUrl(ev.imageUrl)} 
                              alt={ev.titleMr} 
                              onError={handleImageError}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            />
                            <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-1.5 font-bold text-xs">
                              <Eye className="w-4 h-4" />
                              <span>{language === "mr" ? "फोटो पहा" : "View Flyer"}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 border-b border-gold-100 pb-2 flex-wrap">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getCategoryColor(ev.category)}`}>
                            {language === "mr" ? ev.category : ev.categoryEn}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-gold-100/90 px-2 py-0.5 rounded-md border border-gold-300">
                            <Clock className="w-3 h-3 text-amber-700 flex-shrink-0" />
                            <span>{language === "mr" ? ev.dateMr : ev.dateEn}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base text-maroon-950 font-heading leading-snug">
                            {language === "mr" ? ev.titleMr : ev.titleEn}
                          </h4>
                        </div>

                        <div className="bg-[#FAF5EB]/70 rounded-xl p-2.5 border border-gold-200 text-xs space-y-1.5">
                          <div className="grid grid-cols-[70px_1fr] sm:grid-cols-[90px_1fr] gap-1.5 items-start">
                            <span className="font-bold text-gray-500 uppercase text-[10px]">ठिकाण:</span>
                            <span className="font-semibold text-maroon-950 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-rose-600 flex-shrink-0" />
                              <span>{language === "mr" ? ev.venueMr : ev.venueEn}</span>
                            </span>
                          </div>

                          {ev.hostWing && (
                            <div className="grid grid-cols-[70px_1fr] sm:grid-cols-[90px_1fr] gap-1.5 items-start">
                              <span className="font-bold text-gray-500 uppercase text-[10px]">यजमान:</span>
                              <span className="font-medium text-maroon-900 flex items-center gap-1">
                                <Building className="w-3 h-3 text-maroon-700 flex-shrink-0" />
                                <span>{language === "mr" ? ev.hostWing : ev.hostWingEn}</span>
                              </span>
                            </div>
                          )}

                          <div className="grid grid-cols-[70px_1fr] sm:grid-cols-[90px_1fr] gap-1.5 items-start pt-1 border-t border-gold-200/60">
                            <span className="font-bold text-gray-500 uppercase text-[10px]">तपशील:</span>
                            <p className="font-normal text-gray-700 leading-relaxed">
                              {language === "mr" ? ev.descMr : ev.descEn}
                            </p>
                          </div>
                        </div>

                        {admin && (
                          <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleOpenEdit(ev)}
                              className="inline-flex items-center gap-1 py-1.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 transition active:scale-95 cursor-pointer shadow-2xs"
                              title={language === "mr" ? "कार्यक्रम संपादन करा" : "Edit Event"}
                            >
                              <Edit className="w-3.5 h-3.5 text-amber-800" />
                              <span>{language === "mr" ? "संपादन" : "Edit"}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(ev.id || ev._id, ev.titleMr)}
                              className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-300 transition active:scale-95 cursor-pointer shadow-2xs"
                              title={language === "mr" ? "कार्यक्रम हटवा" : "Delete Event"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{language === "mr" ? "हटवा" : "Delete"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF5EB] px-4 sm:px-6 py-3 border-t-2 border-gold-300/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-maroon-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              {language === "mr"
                ? "सर्व कार्यक्रमांमध्ये सर्व ४ इमारतींच्या (G, H, J, K) रहिवाशांचा सहभाग अनिवार्य व आग्रहाचा आहे."
                : "Residents of all 4 buildings (G, H, J, K) are cordially invited."}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-maroon-850 hover:bg-maroon-800 text-gold-200 font-bold text-xs border border-gold-500/40 shadow transition active:scale-95 cursor-pointer"
            >
              {language === "mr" ? "बंद करा" : "Close"}
            </button>
          </div>
        </div>

        {/* Add / Edit Event Dialog (Admin Only) */}
        {isFormOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-fadeIn">
            <div className="bg-[#FFFDF9] rounded-3xl border-2 border-gold-400 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn">
              <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-gold-400 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold-300" />
                  <h3 className="font-heading font-black text-gold-200 text-base sm:text-lg">
                    {editingEvent 
                      ? (language === "mr" ? "कार्यक्रम संपादन करा" : "Edit Calendar Event") 
                      : (language === "mr" ? "नवीन कार्यक्रम जोडा" : "Add New Calendar Event")}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 rounded-full text-gold-300 hover:text-white bg-maroon-850 hover:bg-maroon-800 border border-gold-500/40 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
                {/* Section & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-maroon-950 mb-1">
                      {language === "mr" ? "दिनदर्शिका विभाग (Section) *" : "Calendar Section *"}
                    </label>
                    <select
                      value={eventFormData.eventType}
                      onChange={e => setEventFormData({ ...eventFormData, eventType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gold-300 text-xs font-bold text-maroon-950 focus:border-amber-500 outline-none"
                    >
                      <option value="festival">{language === "mr" ? "उत्सव विशेष कार्यक्रम (Festival Events)" : "Festival Special Events"}</option>
                      <option value="yearly">{language === "mr" ? "वार्षिक दिनदर्शिका (Yearly Events Calendar)" : "Yearly Events Calendar"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-maroon-950 mb-1">
                      {language === "mr" ? "वर्गवारी (Category)" : "Category"}
                    </label>
                    <select
                      value={eventFormData.category}
                      onChange={e => setEventFormData({ ...eventFormData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gold-300 text-xs font-bold text-maroon-950 focus:border-amber-500 outline-none"
                    >
                      <option value="cultural">{language === "mr" ? "सांस्कृतिक कार्यक्रम" : "Cultural Event"}</option>
                      <option value="competition">{language === "mr" ? "स्पर्धा व खेळ" : "Sports & Contests"}</option>
                      <option value="aarti">{language === "mr" ? "दैनिक आरती" : "Daily Aarti"}</option>
                      <option value="arrival">{language === "mr" ? "श्रींचे आगमन" : "Lord's Arrival"}</option>
                      <option value="prasad">{language === "mr" ? "महाप्रसाद" : "Mahaprasad Feast"}</option>
                      <option value="visarjan">{language === "mr" ? "विसर्जन मिरवणूक" : "Visarjan Immersion"}</option>
                      <option value="health">{language === "mr" ? "आरोग्य व रक्तदान" : "Health Camp"}</option>
                      <option value="national">{language === "mr" ? "राष्ट्रीय सण" : "National Celebration"}</option>
                    </select>
                  </div>
                </div>

                {/* Title Mr & En */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-maroon-950 mb-1">
                      {language === "mr" ? "कार्यक्रमाचे नाव (मराठी) *" : "Event Title (Marathi) *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={eventFormData.titleMr}
                      onChange={e => setEventFormData({ ...eventFormData, titleMr: e.target.value })}
                      placeholder="उदा. रांगोळी स्पर्धा / भजन संध्या"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gold-300 text-xs text-maroon-950 font-medium focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-maroon-950 mb-1">
                      {language === "mr" ? "कार्यक्रमाचे नाव (English)" : "Event Title (English)"}
                    </label>
                    <input
                      type="text"
                      value={eventFormData.titleEn}
                      onChange={e => setEventFormData({ ...eventFormData, titleEn: e.target.value })}
                      placeholder="e.g. Rangoli Contest / Bhajan Sandhya"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gold-300 text-xs text-maroon-950 font-medium focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Date, Time */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-maroon-950 mb-1">
                      {language === "mr" ? "वेळ (Time) *" : "Time *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={eventFormData.time}
                      onChange={e => setEventFormData({ ...eventFormData, time: e.target.value })}
                      placeholder="उदा. संध्या. ०६:०० किंवा 06:00 PM"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gold-300 text-xs text-maroon-950 font-medium focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-maroon-950 mb-1">
                      {language === "mr" ? "दिनांक (मराठी) *" : "Date (Marathi) *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={eventFormData.dateStr}
                      onChange={e => setEventFormData({ ...eventFormData, dateStr: e.target.value })}
                      placeholder="उदा. ८ सप्टेंबर किंवा दररोज"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gold-300 text-xs text-maroon-950 font-medium focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-maroon-950 mb-1">
                      {language === "mr" ? "Date (English)" : "Date (English)"}
                    </label>
                    <input
                      type="text"
                      value={eventFormData.dateStrEn}
                      onChange={e => setEventFormData({ ...eventFormData, dateStrEn: e.target.value })}
                      placeholder="e.g. 8 September or Daily"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gold-300 text-xs text-maroon-950 font-medium focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Host Wing & Venue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-maroon-950 mb-1">
                      {language === "mr" ? "यजमान विंग" : "Host Wing"}
                    </label>
                    <input
                      type="text"
                      value={eventFormData.hostWing}
                      onChange={e => setEventFormData({ ...eventFormData, hostWing: e.target.value })}
                      placeholder={`उदा. ${getAllWingsLabel(config, language)}`}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gold-300 text-xs text-maroon-950 font-medium focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-maroon-950 mb-1">
                      {language === "mr" ? "ठिकाण (Venue)" : "Venue"}
                    </label>
                    <input
                      type="text"
                      value={eventFormData.venue}
                      onChange={e => setEventFormData({ ...eventFormData, venue: e.target.value })}
                      placeholder="उदा. मुख्य मंडप, म्हाडा टॉवर्स"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gold-300 text-xs text-maroon-950 font-medium focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-maroon-950 mb-1">
                    {language === "mr" ? "कार्यक्रमाचा सविस्तर तपशील (मराठी)" : "Description"}
                  </label>
                  <textarea
                    rows={2}
                    value={eventFormData.descriptionMr}
                    onChange={e => setEventFormData({ ...eventFormData, descriptionMr: e.target.value })}
                    placeholder="कार्यक्रमाची रूपरेषा, नियम किंवा वयोगट..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gold-300 text-xs text-maroon-950 font-medium focus:border-amber-500 outline-none"
                  />
                </div>

                {/* Photo / Poster Upload from Local Device */}
                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-gold-300 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-maroon-950 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-amber-700" />
                      <span>{language === "mr" ? "स्थानिक डिव्हाइसवरून फोटो / पोस्टर निवडा" : "Upload Poster / Photo from Device"}</span>
                    </span>
                    {eventFormData.imageUrl && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        {language === "mr" ? "फोटो जोडला गेला" : "Photo Attached"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {eventFormData.imageUrl ? (
                      <div className="relative group w-24 h-16 rounded-xl overflow-hidden border border-gold-400 flex-shrink-0 bg-stone-100">
                        <img 
                          src={getMediaUrl(eventFormData.imageUrl)} 
                          alt="Attached" 
                          onError={handleImageError}
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => setEventFormData(prev => ({ ...prev, imageUrl: "" }))}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-300 text-xs font-bold transition cursor-pointer"
                          title={language === "mr" ? "फोटो हटवा" : "Remove photo"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gold-50 border border-gold-400 text-maroon-900 font-bold text-xs transition shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-amber-700" />
                        <span>{language === "mr" ? "डिव्हाइसवरून फोटो निवडा (JPG/PNG)" : "Choose Image (JPG/PNG)"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImagePickerInModal}
                        />
                      </label>
                    )}

                    {eventFormData.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setEventFormData(prev => ({ ...prev, imageUrl: "" }))}
                        className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                      >
                        {language === "mr" ? "फोटो काढून टाका" : "Remove photo"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Highlight checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="modal-highlight-chk"
                    checked={eventFormData.isHighlight}
                    onChange={e => setEventFormData({ ...eventFormData, isHighlight: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 border-gold-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="modal-highlight-chk" className="text-xs font-bold text-maroon-950 cursor-pointer">
                    {language === "mr" ? "विशेष आकर्षण (Highlight Event)" : "Special Attraction / Highlight Event"}
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gold-200">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition cursor-pointer"
                  >
                    {language === "mr" ? "रद्द करा" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-maroon-850 to-maroon-950 text-gold-200 hover:text-white font-bold text-xs border border-gold-400 shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting 
                      ? (language === "mr" ? "जतन करत आहे..." : "Saving...") 
                      : (editingEvent 
                          ? (language === "mr" ? "बदल जतन करा" : "Save Changes") 
                          : (language === "mr" ? "कार्यक्रम जोडा" : "Add Event"))}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lightbox Modal for Photo Preview */}
        {lightboxImg && (
          <div 
            className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn"
            onClick={() => setLightboxImg(null)}
          >
            <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 border-2 border-gold-400 shadow-2xl" onClick={e => e.stopPropagation()}>
              <img 
                src={getMediaUrl(lightboxImg)} 
                alt="Preview" 
                onError={handleImageError}
                className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto" 
              />
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Floating Action Toast Notification */}
        {actionToast && (
          <div className="absolute top-4 right-4 z-70 animate-bounce">
            <div className={`px-4 py-2.5 rounded-2xl shadow-xl border-2 flex items-center gap-2 text-xs font-bold ${
              actionToast.type === "error" 
                ? "bg-rose-50 border-rose-500 text-rose-950" 
                : "bg-amber-50 border-amber-400 text-amber-950"
            }`}>
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{actionToast.message}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UpcomingEventsCalendarModal;
