import React, { useState } from "react";
import { 
  Plus, Trash2, Calendar, Clock, MapPin, 
  Building2, Sparkles, Tag, Flame, Edit2, X, Check, Globe,
  Upload, Image as ImageIcon, Download, FolderUp, Camera, Eye, Loader2, Share2,
  Users, CheckCircle2, AlertCircle
} from "lucide-react";
import API from "../../services/api";
import { 
  FestiveCard, FestiveInput, FestiveTextarea, 
  FestiveSelect, FestiveButton, FestiveBadge, FestiveToggle 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";
import { formatEventsScheduleBroadcast, formatSingleEvent, openWhatsApp } from "../../utils/whatsappFormatter";
import { triggerLiveSync } from "../../utils/liveSync";
import { getMediaUrl, handleImageError } from "../../utils/mediaUrl";

const EVENT_CATEGORIES_MR = [
  { value: "cultural", label: "सांस्कृतिक कार्यक्रम (Cultural)" },
  { value: "arrival", label: "श्रींचे आगमन (Arrival)" },
  { value: "aarti", label: "दैनिक आरती (Aarti)" },
  { value: "prasad", label: "महाप्रसाद (Maha Prasad)" },
  { value: "visarjan", label: "विसर्जन (Visarjan)" },
  { value: "competition", label: "स्पर्धा व खेळ (Competition)" },
  { value: "health", label: "आरोग्य व रक्तदान (Health Camp)" },
  { value: "national", label: "राष्ट्रीय सण (National Celebration)" }
];

const EVENT_CATEGORIES_EN = [
  { value: "cultural", label: "Cultural Event" },
  { value: "arrival", label: "Lord's Arrival & Sthapana" },
  { value: "aarti", label: "Daily Aarti" },
  { value: "prasad", label: "Mahaprasad Feast" },
  { value: "visarjan", label: "Visarjan Immersion" },
  { value: "competition", label: "Sports & Contests" },
  { value: "health", label: "Health / Blood Donation Camp" },
  { value: "national", label: "National Celebration" }
];

// Helper to compress images selected from local device
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

const DEFAULT_FORM_STATE = {
  eventType: "festival", // "festival" or "yearly"
  category: "cultural",
  categoryEn: "",
  titleMr: "",
  titleEn: "",
  startDate: "2026-09-16",
  startTime: "16:00",
  endDate: "2026-09-16",
  endTime: "20:00",
  time: "",
  dateStr: "",
  dateStrEn: "",
  dayNumber: 1,
  venue: "मुख्य मंडप, म्हाडा टॉवर्स",
  venueEn: "Main Pandal, MHADA Towers",
  hostWing: "सर्व विंग्ज (G, H, J, K)",
  hostWingEn: "All Wings (G, H, J, K)",
  targetAudience: "सर्व विंग्ज (G, H, J, K)",
  targetAudienceEn: "All Wings (G, H, J, K)",
  descriptionMr: "",
  descriptionEn: "",
  status: "upcoming",
  imageUrl: "",
  isHighlight: false,
  isPublished: true
};

const EventManager = ({ events, onRefresh, onNotify, config }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM_STATE);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleStartEdit = (ev) => {
    setEditingId(ev._id || ev.id);
    setForm({
      eventType: ev.eventType || "festival",
      category: ev.category || "cultural",
      categoryEn: ev.categoryEn || "",
      titleMr: ev.titleMr || "",
      titleEn: ev.titleEn || "",
      startDate: ev.startDate || (ev.startDateTime ? new Date(ev.startDateTime).toISOString().slice(0, 10) : ""),
      startTime: ev.startTime || "",
      endDate: ev.endDate || (ev.endDateTime ? new Date(ev.endDateTime).toISOString().slice(0, 10) : ""),
      endTime: ev.endTime || "",
      time: ev.time || "",
      dateStr: ev.dateStr || "",
      dateStrEn: ev.dateStrEn || "",
      dayNumber: ev.dayNumber || 1,
      venue: ev.venue || "मुख्य मंडप, म्हाडा टॉवर्स",
      venueEn: ev.venueEn || "Main Pandal, MHADA Towers",
      hostWing: ev.hostWing || ev.targetAudience || "सर्व विंग्ज (G, H, J, K)",
      hostWingEn: ev.hostWingEn || ev.targetAudienceEn || "All Wings (G, H, J, K)",
      targetAudience: ev.targetAudience || ev.hostWing || "सर्व विंग्ज (G, H, J, K)",
      targetAudienceEn: ev.targetAudienceEn || ev.hostWingEn || "All Wings (G, H, J, K)",
      descriptionMr: ev.descriptionMr || "",
      descriptionEn: ev.descriptionEn || "",
      status: ev.status || "upcoming",
      imageUrl: ev.imageUrl || "",
      isHighlight: Boolean(ev.isHighlight),
      isPublished: ev.isPublished !== false
    });
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM_STATE);
  };

  // Upload image to server/uploads/
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onNotify(isEn ? "Please select an image file (JPG, PNG, WebP)" : "कृपया वैध फोटो फाइल निवडा (JPG, PNG, WebP)", "error");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      onNotify(isEn ? "Image exceeds 20MB limit" : "फोटो २०MB पेक्षा लहान असावा", "error");
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("category", "event");

      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data.imageUrl) {
        setForm(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
        onNotify(isEn ? "Photo uploaded successfully!" : "फोटो यशस्वीरित्या सर्व्हरवर अपलोड झाला!", "success");
      } else {
        throw new Error(res.data?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      // Fallback to local compression if server encountered error
      try {
        const compressed = await compressImageFile(file);
        setForm(prev => ({ ...prev, imageUrl: compressed }));
        onNotify(isEn ? "Photo attached locally" : "स्थानिक फोटो जोडला गेला", "info");
      } catch (fallbackErr) {
        onNotify(isEn ? "Failed to read image file" : "फोटो लोड करताना त्रुटी आली", "error");
      }
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  // Import events from local JSON / CSV file
  const handleImportFile = (e) => {
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
              if (cols.length >= 2) {
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
          onNotify(isEn ? "No valid events found in selected file" : "निवडलेल्या फाइलमध्ये वैध कार्यक्रम आढळले नाहीत", "error");
          return;
        }

        const res = await API.post("/events/bulk", { events: parsedEvents });
        if (res.data?.success) {
          onNotify(isEn ? `Successfully imported ${res.data.count} events!` : `${res.data.count} कार्यक्रम फाइलमधून यशस्वीरीत्या आयात केले!`, "success");
          onRefresh();
          triggerLiveSync("events");
        }
      } catch (err) {
        console.error("Import error:", err);
        onNotify(isEn ? "Invalid file format or failed to import" : "फाइल फॉरमॅट अमान्य आहे किंवा आयात करताना त्रुटी आली", "error");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Export current calendar events to JSON backup
  const handleExportCalendar = () => {
    if (!events || events.length === 0) {
      onNotify(isEn ? "No events to export" : "डाउनलोड करण्यासाठी कोणतेही कार्यक्रम नाहीत", "error");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mhada_events_calendar_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onNotify(isEn ? "Calendar exported to your device!" : "दिनदर्शिका तुमच्या डिव्हाइसवर डाउनलोड झाली!", "success");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titleMr && !form.titleEn) {
      onNotify(isEn ? "Please enter Event Title" : "कार्यक्रमाचे शीर्षक आवश्यक आहे", "error");
      return;
    }

    if (!form.startDate && !form.dateStr) {
      onNotify(isEn ? "Please provide Event Date" : "कार्यक्रमाची तारीख आवश्यक आहे", "error");
      return;
    }

    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      onNotify(isEn ? "End date must be after start date" : "समाप्ती दिनांक प्रारंभ दिनांकापेक्षा पुढे असावा", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        eventType: form.eventType,
        category: form.category,
        categoryEn: form.categoryEn || form.category,
        titleMr: form.titleMr || form.titleEn,
        titleEn: form.titleEn || form.titleMr,
        startDate: form.startDate,
        startTime: form.startTime,
        endDate: form.endDate || form.startDate,
        endTime: form.endTime,
        time: form.time,
        dateStr: form.dateStr,
        dateStrEn: form.dateStrEn || form.dateStr,
        dayNumber: Number(form.dayNumber) || 1,
        venue: form.venue,
        venueEn: form.venueEn || form.venue,
        hostWing: form.hostWing || form.targetAudience,
        hostWingEn: form.hostWingEn || form.targetAudienceEn || form.hostWing,
        targetAudience: form.targetAudience || form.hostWing,
        targetAudienceEn: form.targetAudienceEn || form.hostWingEn || form.targetAudience,
        descriptionMr: form.descriptionMr,
        descriptionEn: form.descriptionEn || form.descriptionMr,
        status: form.status,
        imageUrl: form.imageUrl || "",
        isHighlight: Boolean(form.isHighlight),
        isPublished: form.isPublished !== false
      };

      if (editingId) {
        const res = await API.put(`/events/${editingId}`, payload);
        if (res.data?.success) {
          onNotify(isEn ? "Event updated successfully!" : "कार्यक्रम यशस्वीरीत्या अद्ययावत केला!", "success");
          handleCancelEdit();
          onRefresh();
          triggerLiveSync("events");
        } else {
          throw new Error(res.data?.message || "Failed to update event");
        }
      } else {
        const res = await API.post("/events", payload);
        if (res.data?.success) {
          onNotify(isEn ? "New event added to calendar!" : "नवीन कार्यक्रम दिनदर्शिकेत जोडला!", "success");
          handleCancelEdit();
          onRefresh();
          triggerLiveSync("events");
        } else {
          throw new Error(res.data?.message || "Failed to add event");
        }
      }
    } catch (err) {
      console.error("Save event error:", err);
      const errorMsg = err.response?.data?.message || err.message || (isEn ? "Error saving event" : "कार्यक्रम जतन करताना त्रुटी आली");
      onNotify(errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(isEn ? "Are you sure you want to delete this event?" : "हा कार्यक्रम नक्की हटवायचा आहे का?")) return;
    try {
      const res = await API.delete(`/events/${id}`);
      if (res.data?.success) {
        onNotify(isEn ? "Event removed from calendar" : "कार्यक्रम हटवला गेला", "success");
        if (editingId === id) handleCancelEdit();
        onRefresh();
        triggerLiveSync("events");
      } else {
        throw new Error(res.data?.message || "Failed to delete");
      }
    } catch (err) {
      onNotify(isEn ? "Failed to delete event" : "हटवताना त्रुटी आली", "error");
    }
  };

  const categoryOptions = isEn ? EVENT_CATEGORIES_EN : EVENT_CATEGORIES_MR;

  return (
    <div className="space-y-6">

      {/* 0. Local Device Calendar Sync (Import & Export) */}
      <div className="p-4 bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 rounded-2xl border-2 border-gold-400 shadow-md text-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-maroon-850 border border-gold-400/40 text-gold-300">
            <FolderUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-gold-200 font-heading">
              {isEn ? "Local Device Calendar Sync (Import / Export)" : "स्थानिक डिव्हाइसवरून दिनदर्शिका समन्वय (Import / Export)"}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-gold-100/80">
              {isEn 
                ? "Upload event schedule file (.json or .csv) directly from your computer/phone, or download a backup." 
                : "आपल्या संगणक किंवा फोनवरून JSON/CSV फाईल थेट अपलोड करून कार्यक्रम जोडा, किंवा दिनदर्शिकेचा बॅकअप डाउनलोड करा."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold-400 hover:bg-gold-300 text-maroon-950 font-black text-xs transition shadow-md active:scale-95 whitespace-nowrap">
            <Upload className="w-3.5 h-3.5" />
            <span>{isEn ? "Import JSON / CSV" : "डिव्हाइसवरून फाईल आयात करा"}</span>
            <input
              type="file"
              accept=".json,.csv"
              className="hidden"
              onChange={handleImportFile}
            />
          </label>

          <button
            type="button"
            onClick={handleExportCalendar}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-maroon-850 hover:bg-maroon-800 text-gold-200 border border-gold-400/50 font-bold text-xs transition shadow-2xs active:scale-95 whitespace-nowrap"
            title={isEn ? "Export current calendar events as JSON" : "सर्व कार्यक्रम JSON फाईल म्हणून डाउनलोड करा"}
          >
            <Download className="w-3.5 h-3.5 text-gold-300" />
            <span>{isEn ? "Export Backup" : "बॅकअप डाऊनलोड"}</span>
          </button>
        </div>
      </div>
      
      {/* 1. Add / Edit Event Form */}
      <FestiveCard
        title={
          editingId 
            ? (isEn ? "Edit Event" : "कार्यक्रम संपादन करा (Edit Event)") 
            : (isEn ? "Add New Festival or Yearly Event" : "नवीन कार्यक्रम / आरती वेळ जोडा")
        }
        subtitle={
          editingId 
            ? (isEn 
                ? "You are currently editing an existing event. Changes will immediately update on the website and calendar."
                : "आपण विद्यमान कार्यक्रमामध्ये बदल करत आहात. बदल जतन करताच ते वेबसाईटवरील 'आगामी कार्यक्रम' आणि कॅलेंडरमध्ये त्वरित अपडेट होतील.") 
            : (isEn 
                ? "Add events to appear under 'Upcoming Festival Events' or the 'Yearly Events Calendar'."
                : "वेबसाईटवरील 'आगामी कार्यक्रम' (Festival Events) व 'वार्षिक दिनदर्शिका' (Yearly Calendar) मध्ये दर्शवण्यासाठी कार्यक्रम जोडा.")
        }
        icon={Calendar}
        badge={
          editingId 
            ? (isEn ? "Edit Mode" : "संपादन मोड (Edit Mode)") 
            : (isEn ? "Event Manager" : "कार्यक्रम व्यवस्थापन")
        }
      >
        {/* Active Edit Alert Bar */}
        {editingId && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border-2 border-amber-400 flex items-center justify-between gap-2 text-amber-950 text-xs font-bold animate-fadeIn">
            <div className="flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                {isEn 
                  ? "Editing in progress. When done, click 'Save Changes' below."
                  : "कार्यक्रम संपादन सुरू आहे. बदल पूर्ण झाल्यावर 'बदल जतन करा' वर क्लिक करा."}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-400 hover:bg-amber-100 text-stone-800 text-[11px] font-black transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isEn ? "Cancel" : "रद्द करा"}</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          
          {/* Event Type (Festival vs Yearly) & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FestiveSelect
              label={isEn ? "Calendar Section *" : "कॅलेंडर प्रकार (Calendar Section) *"}
              icon={Calendar}
              value={form.eventType}
              onChange={(e) => setForm({ ...form, eventType: e.target.value })}
            >
              <option value="festival">{isEn ? "Festival Special Events (उत्सव विशेष)" : "उत्सव विशेष कार्यक्रम (Festival Events)"}</option>
              <option value="yearly">{isEn ? "Yearly Events Calendar (वार्षिक दिनदर्शिका)" : "वार्षिक दिनदर्शिका (Yearly Events Calendar)"}</option>
            </FestiveSelect>

            <FestiveSelect
              label={isEn ? "Category" : "वर्गवारी (Category)"}
              icon={Tag}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categoryOptions.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </FestiveSelect>

            <FestiveSelect
              label={isEn ? "Event Status" : "सद्यस्थिती (Event Status)"}
              icon={Sparkles}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="upcoming">{isEn ? "Upcoming (Starts in...)" : "आगामी (Upcoming)"}</option>
              <option value="live">{isEn ? "Live / Ongoing (Ends in...)" : "सध्या सुरू आहे (Live / Ongoing)"}</option>
              <option value="completed">{isEn ? "Completed (Event Ended)" : "संपन्न झाले (Completed)"}</option>
            </FestiveSelect>
          </div>

          {/* Bilingual Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveInput
              label={isEn ? "Event Title (Marathi) *" : "कार्यक्रमाचे नाव (मराठी) *"}
              icon={Sparkles}
              value={form.titleMr}
              onChange={(e) => setForm({ ...form, titleMr: e.target.value })}
              placeholder="उदा. भव्य आगमन सोहळा / चित्रकला स्पर्धा / सत्यनारायण महापूजा"
              required
            />
            <FestiveInput
              label={isEn ? "Event Title (English)" : "कार्यक्रमाचे नाव (English)"}
              icon={Globe}
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              placeholder="e.g. Grand Arrival Ceremony / Children's Drawing Competition"
            />
          </div>

          {/* Start Date, Start Time, End Date, End Time (Structured for IST Timer) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 p-3.5 bg-[#FAF5EB]/70 rounded-2xl border border-gold-300">
            <div>
              <label className="block text-xs font-bold text-maroon-950 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>{isEn ? "Start Date *" : "प्रारंभ दिनांक *"}</span>
              </label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm(prev => ({
                    ...prev,
                    startDate: val,
                    endDate: (!prev.endDate || prev.endDate < val) ? val : prev.endDate
                  }));
                }}
                className="w-full px-3 py-2 rounded-xl bg-white border border-gold-300 text-xs font-bold text-maroon-950 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-maroon-950 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>{isEn ? "Start Time *" : "प्रारंभ वेळ *"}</span>
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-gold-300 text-xs font-bold text-maroon-950 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-maroon-950 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>{isEn ? "End Date" : "समाप्ती दिनांक"}</span>
              </label>
              <input
                type="date"
                value={form.endDate}
                min={form.startDate}
                onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-gold-300 text-xs font-bold text-maroon-950 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-maroon-950 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>{isEn ? "End Time" : "समाप्ती वेळ"}</span>
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-gold-300 text-xs font-bold text-maroon-950 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Custom Display Date Strings, Time & Day Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FestiveInput
              label={isEn ? "Custom Display Time (Optional)" : "दर्शनी वेळ (पर्यायी)"}
              icon={Clock}
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              placeholder={isEn ? "Auto-generated from Start/End Time if empty" : "रिकामी ठेवल्यास वेळेनुसार स्वयंचलित तयार होईल"}
            />
            <FestiveInput
              label={isEn ? "Display Date / Period (Marathi)" : "दिनांक / कालावधी (मराठी)"}
              icon={Calendar}
              value={form.dateStr}
              onChange={(e) => setForm({ ...form, dateStr: e.target.value })}
              placeholder="उदा. ७ सप्टेंबर किंवा दररोज"
            />
            <FestiveInput
              label={isEn ? "Display Date / Period (English)" : "दिनांक / कालावधी (English)"}
              icon={Globe}
              value={form.dateStrEn}
              onChange={(e) => setForm({ ...form, dateStrEn: e.target.value })}
              placeholder="e.g. 7 September or Daily"
            />
          </div>

          {/* Host Wing & Target Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveInput
              label={isEn ? "Target Audience / Host Wing (Marathi)" : "लक्षित रहिवासी / यजमान विंग (मराठी)"}
              icon={Building2}
              value={form.hostWing}
              onChange={(e) => setForm({ ...form, hostWing: e.target.value, targetAudience: e.target.value })}
              placeholder="उदा. सर्व विंग्ज (G, H, J, K) / महिला मंडळ / लहान मुले"
            />
            <FestiveInput
              label={isEn ? "Target Audience / Host Wing (English)" : "Target Audience / Host Wing (English)"}
              icon={Globe}
              value={form.hostWingEn}
              onChange={(e) => setForm({ ...form, hostWingEn: e.target.value, targetAudienceEn: e.target.value })}
              placeholder="e.g. All Wings (G, H, J, K) / Kids / Women"
            />
          </div>

          {/* Venue / Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveInput
              label={isEn ? "Venue / Location (Marathi)" : "स्थळ / ठिकाण (मराठी)"}
              icon={MapPin}
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="उदा. मुख्य उत्सव मंडप, म्हाडा टॉवर्स"
            />
            <FestiveInput
              label={isEn ? "Venue / Location (English)" : "Venue / Location (English)"}
              icon={Globe}
              value={form.venueEn}
              onChange={(e) => setForm({ ...form, venueEn: e.target.value })}
              placeholder="e.g. Main Pandal, MHADA Towers"
            />
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveTextarea
              label={isEn ? "Description (Marathi)" : "कार्यक्रमाचा सविस्तर तपशील (मराठी)"}
              rows={2}
              value={form.descriptionMr}
              onChange={(e) => setForm({ ...form, descriptionMr: e.target.value })}
              placeholder="कार्यक्रमाची रूपरेषा, नियम किंवा वयोगट येथे लिहा..."
            />
            <FestiveTextarea
              label={isEn ? "Description (English)" : "Detailed Description (English)"}
              rows={2}
              value={form.descriptionEn}
              onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              placeholder="Event description, rules, eligibility..."
            />
          </div>

          {/* Local Device Photo / Poster Attachment */}
          <div className="p-4 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 rounded-2xl border border-gold-300 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-700" />
                <span className="font-bold text-xs sm:text-sm text-maroon-950">
                  {isEn ? "Event Poster / Photo (Upload from Local Device)" : "कार्यक्रमाचे पोस्टर / फोटो (स्थानिक डिव्हाइसवरून निवडा)"}
                </span>
              </div>
              {form.imageUrl && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  {isEn ? "Photo Attached" : "फोटो जोडला गेला"}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {form.imageUrl ? (
                <div className="relative group w-36 h-24 rounded-xl overflow-hidden border-2 border-gold-400 shadow-sm flex-shrink-0 bg-stone-100">
                  <img 
                    src={getMediaUrl(form.imageUrl)} 
                    alt="Event poster preview" 
                    onError={handleImageError}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition">
                    <button
                      type="button"
                      onClick={() => setPreviewModalImg(form.imageUrl)}
                      className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-stone-900 transition"
                      title={isEn ? "Preview image" : "फोटो मोठा पहा"}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, imageUrl: "" }))}
                      className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition"
                      title={isEn ? "Remove image" : "फोटो हटवा"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center w-full sm:w-52 h-24 border-2 border-dashed border-gold-400 hover:border-gold-600 rounded-xl cursor-pointer bg-white hover:bg-gold-50/50 transition px-3 py-2 text-center group ${isUploadingImage ? "opacity-60 cursor-not-allowed" : ""}`}>
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-5 h-5 text-amber-700 animate-spin mb-1" />
                      <span className="text-[11px] font-bold text-maroon-900 leading-tight">
                        {isEn ? "Uploading to server..." : "सर्व्हरवर सेव्ह होत आहे..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-amber-700 group-hover:scale-110 transition-transform mb-1" />
                      <span className="text-[11px] font-bold text-maroon-900 leading-tight">
                        {isEn ? "Select Photo / Poster" : "डिव्हाइसवरून फोटो निवडा"}
                      </span>
                      <span className="text-[9px] text-stone-500 mt-0.5">JPG, PNG, WebP (Max 20MB)</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                </label>
              )}

              <div className="flex-1 min-w-0 space-y-1.5 w-full">
                <p className="text-[11px] text-stone-600 font-medium leading-relaxed">
                  {isEn 
                    ? "Upload an official flyer, invitation, or photo. It will automatically upload to the server and appear in the upcoming events popup/card." 
                    : "आपल्या संगणक किंवा मोबाईलवरून कार्यक्रमाचे निमंत्रण पत्रिका, पोस्टर किंवा छायाचित्र निवडा. ते सर्व्हरवर सेव्ह होऊन आगामी कार्यक्रमाच्या पॉप-अपमध्ये दिसेल."}
                </p>
                {form.imageUrl && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewModalImg(form.imageUrl)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isEn ? "Preview Photo" : "फोटो पहा"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, imageUrl: "" }))}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{isEn ? "Remove photo" : "फोटो काढून टाका"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Highlight & Published Visibility Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gradient-to-r from-amber-50 to-[#FFFDF9] rounded-2xl border border-gold-300">
            <div className="flex items-center justify-between">
              <FestiveToggle
                checked={form.isHighlight}
                onChange={(val) => setForm({ ...form, isHighlight: val })}
                label={isEn ? "Special Attraction / Highlight" : "विशेष आकर्षण (Highlight Event)"}
                sublabel={isEn ? "Give prominent highlight badge" : "कार्यक्रमाला विशेष हायलाइट बॅज मिळेल"}
                activeText={isEn ? "YES" : "होय"}
                inactiveText={isEn ? "NO" : "नाही"}
              />
              {form.isHighlight && (
                <FestiveBadge variant="gold" icon={Sparkles}>
                  {isEn ? "Highlight Active" : "विशेष आकर्षण"}
                </FestiveBadge>
              )}
            </div>

            <div className="flex items-center justify-between border-t sm:border-t-0 sm:border-l border-gold-200 pt-2 sm:pt-0 sm:pl-3">
              <FestiveToggle
                checked={form.isPublished}
                onChange={(val) => setForm({ ...form, isPublished: val })}
                label={isEn ? "Publish on Website" : "वेबसाईटवर प्रकाशित करा (Publish)"}
                sublabel={isEn ? "Make visible on events page" : "कॅलेंडर व आगामी कार्यक्रमात दाखवा"}
                activeText={isEn ? "PUBLISHED" : "सक्रिय / प्रकाशित"}
                inactiveText={isEn ? "HIDDEN" : "अप्रकाशित"}
              />
              <FestiveBadge variant={form.isPublished ? "gold" : "maroon"}>
                {form.isPublished ? (isEn ? "Live on Site" : "सक्रिय") : (isEn ? "Draft / Hidden" : "अप्रकाशित")}
              </FestiveBadge>
            </div>
          </div>

          {/* Form Submit & Cancel Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            {editingId && (
              <FestiveButton
                type="button"
                onClick={handleCancelEdit}
                variant="secondary"
                size="md"
                icon={X}
              >
                {isEn ? "Cancel Edit" : "रद्द करा (Cancel)"}
              </FestiveButton>
            )}

            <FestiveButton
              type="submit"
              icon={editingId ? Check : Plus}
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              disabled={isSubmitting || isUploadingImage}
            >
              {isSubmitting 
                ? (editingId ? (isEn ? "Saving changes..." : "बदल जतन करत आहे...") : (isEn ? "Adding event..." : "कार्यक्रम जतन करत आहे...")) 
                : (editingId ? (isEn ? "Save Changes" : "बदल जतन करा (Save Changes)") : (isEn ? "Save Event" : "कार्यक्रम जतन करा (Save Event)"))
              }
            </FestiveButton>
          </div>
        </form>
      </FestiveCard>

      {/* 2. Events List with Edit & Delete */}
      <FestiveCard
        title={isEn ? `Scheduled Events & Aarti Timetable (${events.length})` : `नोंदवलेले कार्यक्रम व आरती सूची (${events.length})`}
        subtitle={
          isEn
            ? "All active events displayed on the website. You can edit or remove any event anytime."
            : "वेबसाईटवर दर्शवले जाणारे सर्व सक्रिय कार्यक्रम. येथून आपण कोणत्याही कार्यक्रमामध्ये संपादन (Edit) करू शकता किंवा तो काढून टाकू शकता."
        }
        icon={Clock}
        action={
          events.length > 0 ? (
            <FestiveButton
              onClick={() => {
                const text = formatEventsScheduleBroadcast(events, config, isEn);
                openWhatsApp(text);
              }}
              icon={Share2}
              variant="gold"
              size="sm"
              title={isEn ? "Share All Events on WhatsApp" : "सर्व कार्यक्रम व्हॉट्सॲपवर शेअर करा"}
            >
              {isEn ? "Share All on WhatsApp" : "सर्व कार्यक्रम शेअर करा"}
            </FestiveButton>
          ) : null
        }
      >
        {events.length === 0 ? (
          <p className="text-center py-6 text-xs text-stone-500 font-medium">
            {isEn ? "No events recorded yet. Add a new event above." : "कोणताही कार्यक्रम नोंदवलेला नाही. वरून नवीन कार्यक्रम जोडा."}
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => {
              const isCurrentEditing = editingId === (ev._id || ev.id);

              return (
                <div
                  key={ev._id || ev.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                    isCurrentEditing
                      ? "bg-amber-100/60 border-amber-500 ring-2 ring-amber-400/40"
                      : "border-gold-300/80 bg-white hover:border-gold-400"
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Event Flyer / Photo Thumbnail */}
                    {ev.imageUrl && (
                      <div 
                        onClick={() => setPreviewModalImg(ev.imageUrl)} 
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-gold-300 shadow-2xs cursor-pointer flex-shrink-0 group relative bg-stone-100 mt-0.5"
                        title={isEn ? "Click to view full photo" : "फोटो मोठा पाहण्यासाठी क्लिक करा"}
                      >
                        <img 
                          src={getMediaUrl(ev.imageUrl)} 
                          alt={ev.titleMr} 
                          onError={handleImageError}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <FestiveBadge variant={ev.eventType === "yearly" ? "maroon" : "gold"}>
                          {ev.eventType === "yearly" ? (isEn ? "Yearly Calendar" : "वार्षिक दिनदर्शिका") : (isEn ? "Festival Event" : "उत्सव विशेष")}
                        </FestiveBadge>
                        <FestiveBadge variant="gold">
                          {ev.category}
                        </FestiveBadge>
                        {ev.isHighlight && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-maroon-950">
                            {isEn ? "Highlight" : "विशेष आकर्षण"}
                          </span>
                        )}
                        {ev.isPublished === false && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 border border-stone-300">
                            {isEn ? "Hidden" : "अप्रकाशित"}
                          </span>
                        )}
                        <span className="text-xs font-bold text-maroon-900 bg-gold-100 px-2.5 py-0.5 rounded-lg border border-gold-300 flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3 h-3 text-maroon-800 flex-shrink-0" />
                          {ev.time || (ev.startTime ? `${ev.startTime} ${ev.endTime ? `- ${ev.endTime}` : ""}` : "")}
                        </span>
                        <span className="text-xs text-stone-500 font-medium whitespace-nowrap">
                          • {isEn ? (ev.dateStrEn || ev.dateStr || ev.startDate) : (ev.dateStr || ev.startDate)}
                        </span>
                      </div>

                      <h5 className="font-heading font-black text-xs sm:text-sm text-maroon-950 pt-0.5">
                        {isEn ? (ev.titleEn || ev.titleMr) : ev.titleMr} {isEn && ev.titleMr ? <span className="text-stone-500 font-normal text-xs">({ev.titleMr})</span> : (ev.titleEn ? <span className="text-stone-500 font-normal text-xs">({ev.titleEn})</span> : null)}
                      </h5>

                      <p className="text-xs text-stone-700 leading-relaxed line-clamp-1">
                        {isEn ? (ev.descriptionEn || ev.descriptionMr) : ev.descriptionMr}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600 font-medium">
                        {(ev.hostWing || ev.hostWingEn || ev.targetAudience) && (
                          <span className="flex items-center gap-1 min-w-0">
                            <Building2 className="w-3.5 h-3.5 text-maroon-800 flex-shrink-0" />
                            <span className="truncate">{isEn ? (ev.hostWingEn || ev.targetAudienceEn || ev.hostWing) : (ev.hostWing || ev.targetAudience)}</span>
                          </span>
                        )}
                        {(ev.hostWing || ev.hostWingEn) && (ev.venue || ev.venueEn) && <span className="text-stone-300">•</span>}
                        {(ev.venue || ev.venueEn) && (
                          <span className="flex items-center gap-1 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                            <span className="truncate">{isEn ? (ev.venueEn || ev.venue) : ev.venue}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: WhatsApp, Edit & Delete */}
                  <div className="flex items-center gap-2 justify-end flex-shrink-0 pt-2 sm:pt-0 w-full sm:w-auto">
                    <FestiveButton
                      onClick={() => {
                        const text = formatSingleEvent(ev, config, isEn);
                        openWhatsApp(text);
                      }}
                      variant="gold"
                      size="sm"
                      icon={Share2}
                      className="w-full sm:w-auto"
                      title={isEn ? "Share Event on WhatsApp" : "कार्यक्रम व्हॉट्सॲपवर शेअर करा"}
                    >
                      {isEn ? "WhatsApp" : "व्हॉट्सॲप"}
                    </FestiveButton>

                    <FestiveButton
                      onClick={() => handleStartEdit(ev)}
                      variant={isCurrentEditing ? "primary" : "secondary"}
                      size="sm"
                      icon={Edit2}
                      className="w-full sm:w-auto"
                      title={isEn ? "Edit Event" : "कार्यक्रम संपादन करा"}
                    >
                      {isCurrentEditing ? (isEn ? "Editing" : "संपादन चालू") : (isEn ? "Edit" : "संपादन करा")}
                    </FestiveButton>

                    <FestiveButton
                      onClick={() => handleDelete(ev._id || ev.id)}
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      className="w-full sm:w-auto"
                      title={isEn ? "Delete Event" : "कार्यक्रम हटवा"}
                    >
                      {isEn ? "Delete" : "हटवा"}
                    </FestiveButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </FestiveCard>

      {/* Lightbox Modal for Photo Preview */}
      {previewModalImg && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 border-2 border-gold-400 shadow-2xl" onClick={e => e.stopPropagation()}>
            <img 
              src={getMediaUrl(previewModalImg)} 
              alt="Preview" 
              onError={handleImageError}
              className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto" 
            />
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManager;
