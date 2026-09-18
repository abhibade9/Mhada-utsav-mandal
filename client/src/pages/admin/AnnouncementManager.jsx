import React, { useState } from "react";
import { 
  Plus, Trash2, Megaphone, Pin, Tag, AlertCircle, 
  Edit2, X, Check, Globe, Sparkles, Share2 
} from "lucide-react";
import API from "../../services/api";
import { 
  FestiveCard, FestiveInput, FestiveTextarea, 
  FestiveSelect, FestiveToggle, FestiveButton, 
  FestiveBadge 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";
import { formatAnnouncementsBroadcast, formatSingleAnnouncement, openWhatsApp } from "../../utils/whatsappFormatter";
import { triggerLiveSync } from "../../utils/liveSync";

const CATEGORY_MAP_MR = {
  general: "सर्वसाधारण (General)",
  aarti: "आरती विषयक (Aarti)",
  prasad: "महाप्रसाद (Prasad)",
  cultural: "सांस्कृतिक (Cultural)",
  visarjan: "विसर्जन (Visarjan)",
  urgent: "तातडीचे (Urgent Alert)",
  owners: "सभासद/फ्लॅटधारक (Owners)"
};

const CATEGORY_MAP_EN = {
  general: "General Notice",
  aarti: "Aarti Timings",
  prasad: "Mahaprasad",
  cultural: "Cultural Program",
  visarjan: "Visarjan",
  urgent: "Urgent Alert",
  owners: "Residents / Owners"
};

const AnnouncementManager = ({ announcements, onRefresh, onNotify }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    titleMr: "",
    titleEn: "",
    descriptionMr: "",
    descriptionEn: "",
    category: "general",
    priority: "normal",
    isPinned: false,
    badgeText: "नवीन सूचना (New)",
    targetWings: ["All"]
  });

  const handleStartEdit = (ann) => {
    setEditingId(ann._id);
    setForm({
      titleMr: ann.titleMr || "",
      titleEn: ann.titleEn || "",
      descriptionMr: ann.descriptionMr || "",
      descriptionEn: ann.descriptionEn || "",
      category: ann.category || "general",
      priority: ann.priority || "normal",
      isPinned: Boolean(ann.isPinned),
      badgeText: ann.badgeText || (isEn ? "New Notice" : "नवीन सूचना (New)"),
      targetWings: ann.targetWings || ["All"]
    });
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      titleMr: "",
      titleEn: "",
      descriptionMr: "",
      descriptionEn: "",
      category: "general",
      priority: "normal",
      isPinned: false,
      badgeText: isEn ? "New Notice" : "नवीन सूचना (New)",
      targetWings: ["All"]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titleMr || !form.descriptionMr) {
      if (onNotify) onNotify(isEn ? "Marathi title and description are required!" : "कृपया मराठी शीर्षक व सविस्तर माहिती भरा!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        titleMr: form.titleMr,
        titleEn: form.titleEn || form.titleMr,
        descriptionMr: form.descriptionMr,
        descriptionEn: form.descriptionEn || form.descriptionMr,
        category: form.category,
        priority: form.priority,
        isPinned: form.isPinned,
        badgeText: form.badgeText,
        targetWings: form.targetWings
      };

      if (editingId) {
        const res = await API.put(`/announcements/${editingId}`, payload);
        if (res.data.success) {
          if (onNotify) onNotify(isEn ? "Notice updated successfully!" : "सूचना यशस्वीरीत्या अद्ययावत केली!", "success");
          handleCancelEdit();
          onRefresh();
          triggerLiveSync("announcements");
        }
      } else {
        const res = await API.post("/announcements", payload);
        if (res.data.success) {
          if (onNotify) onNotify(isEn ? "New notice published to website!" : "नवीन सूचना यशस्वीरीत्या प्रसिद्ध केली!", "success");
          setForm({
            titleMr: "",
            titleEn: "",
            descriptionMr: "",
            descriptionEn: "",
            category: "general",
            priority: "normal",
            isPinned: false,
            badgeText: isEn ? "New Notice" : "नवीन सूचना (New)",
            targetWings: ["All"]
          });
          onRefresh();
          triggerLiveSync("announcements");
        }
      }
    } catch (err) {
      if (onNotify) onNotify(err.response?.data?.message || (isEn ? "Error saving notice" : "सूचना जतन करताना त्रुटी आली"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(isEn ? "Are you sure you want to delete this notice?" : "आपणास ही सूचना नक्की काढून टाकायची आहे का?")) return;
    try {
      await API.delete(`/announcements/${id}`);
      if (onNotify) onNotify(isEn ? "Notice removed from website" : "सूचना काढून टाकण्यात आली", "success");
      if (editingId === id) handleCancelEdit();
      onRefresh();
      triggerLiveSync("announcements");
    } catch (err) {
      if (onNotify) onNotify(isEn ? "Failed to delete notice" : "सूचना काढताना त्रुटी आली", "error");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Create / Edit Announcement Card */}
      <FestiveCard
        title={
          editingId 
            ? (isEn ? "Edit Announcement" : "सूचना संपादन करा (Edit Announcement)") 
            : (isEn ? "Publish New Announcement" : "नवीन महत्वाची सूचना प्रसिद्ध करा")
        }
        subtitle={
          editingId 
            ? (isEn 
                ? "You are currently modifying an existing notice. Once saved, changes will immediately appear on the website."
                : "आपण विद्यमान सूचनेत बदल करत आहात. जतन करताच हा बदल तात्काळ वेबसाईटवर सर्वांना दिसेल.") 
            : (isEn 
                ? "Create notices that will be prominently displayed on the website homepage, ticker, and alert popups."
                : "वेबसाईटच्या मुख्य पृष्ठावर, स्क्रोलर टिकरवर आणि पॉप-अपमध्ये दिसणारी सूचना येथे तयार करा.")
        }
        icon={Megaphone}
        badge={
          editingId 
            ? (isEn ? "Edit Mode" : "संपादन मोड (Edit Mode)") 
            : (isEn ? "New Notice" : "नवीन प्रसिद्धी")
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
                  : "संपादन सुरू आहे. बदल पूर्ण झाल्यावर खालील 'बदल जतन करा' बटणावर क्लिक करा."}
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
          
          {/* Bilingual Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveInput
              label={isEn ? "Marathi Title *" : "मराठी शीर्षक (Marathi Title) *"}
              icon={Megaphone}
              value={form.titleMr}
              onChange={(e) => setForm({ ...form, titleMr: e.target.value })}
              placeholder="उदा. आरतीच्या वेळेत बदल / महाप्रसाद टोकन वाटप"
              required
            />

            <FestiveInput
              label={isEn ? "English Title" : "English Title (इंग्रजी शीर्षक)"}
              icon={Globe}
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              placeholder="e.g. Aarti Timings Update / Prasad Token Distribution"
            />
          </div>

          {/* Bilingual Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveTextarea
              label={isEn ? "Detailed Information (Marathi) *" : "सविस्तर माहिती (मराठी) *"}
              rows={3}
              value={form.descriptionMr}
              onChange={(e) => setForm({ ...form, descriptionMr: e.target.value })}
              placeholder="सूचनेचे संपूर्ण तपशील प्रविष्ट करा..."
              required
            />

            <FestiveTextarea
              label={isEn ? "Detailed Information (English)" : "Detailed Information (English)"}
              rows={3}
              value={form.descriptionEn}
              onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              placeholder="Enter full notice description in English..."
            />
          </div>

          {/* Category, Priority, Badge Text */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FestiveSelect
              label={isEn ? "Category" : "वर्गवारी (Category)"}
              icon={Tag}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="general">{isEn ? "General Notice" : "सर्वसाधारण (General)"}</option>
              <option value="aarti">{isEn ? "Aarti Timings" : "आरती विषयक (Aarti)"}</option>
              <option value="prasad">{isEn ? "Mahaprasad" : "महाप्रसाद (Prasad)"}</option>
              <option value="cultural">{isEn ? "Cultural Program" : "सांस्कृतिक (Cultural)"}</option>
              <option value="visarjan">{isEn ? "Visarjan" : "विसर्जन (Visarjan)"}</option>
              <option value="urgent">{isEn ? "Urgent Alert" : "तातडीचे (Urgent Alert)"}</option>
              <option value="owners">{isEn ? "Residents / Owners" : "सभासद/फ्लॅटधारक (Owners)"}</option>
            </FestiveSelect>

            <FestiveSelect
              label={isEn ? "Priority" : "प्राधान्य (Priority)"}
              icon={AlertCircle}
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="normal">{isEn ? "Normal" : "सामान्य (Normal)"}</option>
              <option value="medium">{isEn ? "Medium" : "मध्यम (Medium)"}</option>
              <option value="high">{isEn ? "High Priority" : "अति महत्वाचे (High Priority)"}</option>
            </FestiveSelect>

            <FestiveInput
              label={isEn ? "Badge Tag" : "बॅज मजकूर (Badge Text)"}
              icon={Sparkles}
              value={form.badgeText}
              onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
              placeholder={isEn ? "e.g. New Notice" : "उदा. नवीन सूचना (New Notice)"}
            />
          </div>

          {/* Pin to Top Ticker Toggle */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50 to-[#FFFDF9] rounded-2xl border border-gold-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <FestiveToggle
              checked={form.isPinned}
              onChange={(val) => setForm({ ...form, isPinned: val })}
              label={isEn ? "Pin to Top & Homepage Ticker" : "स्क्रोलर व सर्वात वर पिन करा (Pin to Top & Ticker)"}
              sublabel={isEn ? "This notice will be pinned at the top and continuously scrolled on the ticker" : "ही सूचना मुख्य पृष्ठावर सर्वात वर दिसेल आणि टिकरवर फिरवली जाईल"}
              activeText={isEn ? "PINNED" : "पिन केली जाईल"}
              inactiveText={isEn ? "NORMAL" : "सामान्य"}
            />
            {form.isPinned && (
              <FestiveBadge variant="gold" icon={Pin} className="self-start sm:self-auto">
                {isEn ? "Pinned Active" : "पिन सक्रिय"}
              </FestiveBadge>
            )}
          </div>

          {/* Form Action Buttons */}
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
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (editingId ? (isEn ? "Saving..." : "बदल जतन करत आहे...") : (isEn ? "Publishing..." : "प्रसिद्ध करत आहे...")) 
                : (editingId ? (isEn ? "Save Changes" : "बदल जतन करा (Save Changes)") : (isEn ? "Publish Notice" : "सूचना प्रसिद्ध करा (Publish)"))
              }
            </FestiveButton>
          </div>
        </form>
      </FestiveCard>

      {/* 2. Active Announcements List with Edit & Delete */}
      <FestiveCard
        title={isEn ? `Active Announcements (${announcements.length})` : `सध्या सक्रिय असलेल्या सूचना (${announcements.length})`}
        subtitle={
          isEn
            ? "List of notices currently visible to residents. You can edit or remove any notice at any time."
            : "वेबसाईटवर सध्या प्रसिद्ध असलेल्या सूचनांची यादी. येथून आपण कोणत्याही सूचनेत तत्काळ संपादन (Edit) किंवा ती रद्द (Delete) करू शकता."
        }
        icon={Tag}
        action={
          announcements.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const txt = formatAnnouncementsBroadcast(announcements, config);
                openWhatsApp(txt);
                if (onNotify) onNotify(isEn ? "Opening WhatsApp with all announcements..." : "सर्व सूचना व्हॉट्सॲपवर पाठवण्यासाठी तयार!", "success");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition cursor-pointer"
              title="सर्व सूचना व्हॉट्सॲपवर पाठवा"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isEn ? "Share All on WhatsApp" : "सर्व सूचना व्हॉट्सॲपवर पाठवा"}</span>
            </button>
          )
        }
      >
        {announcements.length === 0 ? (
          <p className="text-center py-6 text-xs text-stone-500 font-medium">
            {isEn ? "No active notices found. Publish a new notice above." : "कोणतीही सक्रिय सूचना नाही. वरून नवीन सूचना प्रसिद्ध करा."}
          </p>
        ) : (
          <div className="space-y-3">
            {announcements.map((ann) => {
              const isCurrentEditing = editingId === ann._id;
              const catMap = isEn ? CATEGORY_MAP_EN : CATEGORY_MAP_MR;

              return (
                <div
                  key={ann._id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                    isCurrentEditing
                      ? "bg-amber-100/60 border-amber-500 shadow-md ring-2 ring-amber-400/40"
                      : ann.isPinned
                        ? "bg-gradient-to-br from-amber-50/70 to-white border-gold-400 shadow-2xs"
                        : "bg-white border-gold-200 hover:border-gold-300"
                  }`}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ann.isPinned && (
                        <FestiveBadge variant="gold" icon={Pin}>
                          {isEn ? "Pinned" : "पिन केलेली"}
                        </FestiveBadge>
                      )}
                      <FestiveBadge variant="maroon">
                        {catMap[ann.category] || ann.category}
                      </FestiveBadge>
                      {ann.priority === "high" && (
                        <FestiveBadge variant="red">
                          {isEn ? "High Priority" : "अति महत्वाचे"}
                        </FestiveBadge>
                      )}
                      {ann.badgeText && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-200 text-maroon-900 border border-gold-400">
                          {ann.badgeText}
                        </span>
                      )}
                    </div>

                    <h5 className="font-heading font-black text-xs sm:text-sm text-maroon-950 pt-1">
                      {isEn ? (ann.titleEn || ann.titleMr) : ann.titleMr} {isEn && ann.titleMr ? <span className="text-stone-500 font-normal text-xs">({ann.titleMr})</span> : (ann.titleEn ? <span className="text-stone-500 font-normal text-xs">({ann.titleEn})</span> : null)}
                    </h5>

                    <p className="text-xs text-stone-700 leading-relaxed line-clamp-2">
                      {isEn ? (ann.descriptionEn || ann.descriptionMr) : ann.descriptionMr}
                    </p>

                    {isEn ? (
                      ann.descriptionMr && (
                        <p className="text-[11px] text-stone-500 italic line-clamp-1">
                          MR: {ann.descriptionMr}
                        </p>
                      )
                    ) : (
                      ann.descriptionEn && (
                        <p className="text-[11px] text-stone-500 italic line-clamp-1">
                          EN: {ann.descriptionEn}
                        </p>
                      )
                    )}
                  </div>

                  {/* Actions: WhatsApp Share, Edit & Delete */}
                  <div className="flex items-center gap-2 justify-end flex-shrink-0 pt-2 sm:pt-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const txt = formatSingleAnnouncement(ann, config);
                        openWhatsApp(txt);
                        if (onNotify) onNotify(isEn ? "Opening WhatsApp with notice..." : "सूचना व्हॉट्सॲपवर पाठवण्यासाठी तयार!", "success");
                      }}
                      className="p-2 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-300 transition cursor-pointer shadow-xs"
                      title={isEn ? "Share this notice on WhatsApp" : "ही सूचना व्हॉट्सॲपवर पाठवा"}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <FestiveButton
                      onClick={() => handleStartEdit(ann)}
                      variant={isCurrentEditing ? "primary" : "secondary"}
                      size="sm"
                      icon={Edit2}
                      className="w-full sm:w-auto"
                      title={isEn ? "Edit Notice" : "सूचना संपादन करा"}
                    >
                      {isCurrentEditing ? (isEn ? "Editing" : "संपादन चालू") : (isEn ? "Edit" : "संपादन करा")}
                    </FestiveButton>

                    <FestiveButton
                      onClick={() => handleDelete(ann._id)}
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      className="w-full sm:w-auto"
                      title={isEn ? "Delete Notice" : "सूचना हटवा"}
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
    </div>
  );
};

export default AnnouncementManager;
