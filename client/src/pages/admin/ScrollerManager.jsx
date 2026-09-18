import React, { useState, useEffect } from "react";
import { 
  Megaphone, Flame, Save, Plus, Trash2, Edit3, ArrowUp, ArrowDown, 
  Check, X, Calendar, Clock, AlertCircle, Eye, EyeOff, Sparkles, AlertTriangle
} from "lucide-react";
import { 
  FestiveCard, FestiveToggle, FestiveInput, FestiveTextarea, 
  FestiveButton, FestiveBadge 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";

const ScrollerManager = ({ config, onSaveScroller, onNotify }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isSaving, setIsSaving] = useState(false);
  const [marqueeActive, setMarqueeActive] = useState(true);
  const [messages, setMessages] = useState([]);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formText, setFormText] = useState("");
  const [formTextMr, setFormTextMr] = useState("");
  const [formTextEn, setFormTextEn] = useState("");
  const [formOrder, setFormOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formError, setFormError] = useState("");

  // Sync with incoming config
  useEffect(() => {
    if (config) {
      setMarqueeActive(config.marqueeActive !== false);
      if (Array.isArray(config.scrollerMessages)) {
        const sorted = [...config.scrollerMessages].sort(
          (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)
        );
        setMessages(sorted);
      }
    }
  }, [config]);

  // Master Toggle
  const handleToggleMaster = (val) => {
    setMarqueeActive(val);
  };

  // Toggle individual message
  const handleToggleMessage = (id) => {
    setMessages(prev =>
      prev.map(m => (m.id === id ? { ...m, isActive: !m.isActive } : m))
    );
  };

  // Reorder Up
  const handleMoveUp = (index) => {
    if (index <= 0) return;
    setMessages(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      // Re-assign order numbers
      return updated.map((m, idx) => ({ ...m, order: idx + 1 }));
    });
  };

  // Reorder Down
  const handleMoveDown = (index) => {
    if (index >= messages.length - 1) return;
    setMessages(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      // Re-assign order numbers
      return updated.map((m, idx) => ({ ...m, order: idx + 1 }));
    });
  };

  // Delete message
  const handleDelete = (id) => {
    const target = messages.find(m => m.id === id);
    const label = target?.text || "this message";
    if (window.confirm(isEn ? `Are you sure you want to delete:\n"${label}"?` : `तुम्हाला हा संदेश हटवायचा आहे का?\n"${label}"`)) {
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== id);
        return filtered.map((m, idx) => ({ ...m, order: idx + 1 }));
      });
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormText("");
    setFormTextMr("");
    setFormTextEn("");
    setFormOrder(messages.length + 1);
    setFormIsActive(true);
    setFormStartDate("");
    setFormEndDate("");
    setFormError("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (msg) => {
    setEditingId(msg.id);
    setFormText(msg.text || "");
    setFormTextMr(msg.textMr || msg.text || "");
    setFormTextEn(msg.textEn || msg.text || "");
    setFormOrder(Number(msg.order) || messages.findIndex(m => m.id === msg.id) + 1);
    setFormIsActive(msg.isActive !== false);
    setFormStartDate(msg.startDate || "");
    setFormEndDate(msg.endDate || "");
    setFormError("");
    setIsModalOpen(true);
  };

  // Save Modal Form
  const handleSaveModal = (e) => {
    e.preventDefault();
    const trimmed = formText.trim();
    if (!trimmed) {
      setFormError(isEn ? "Message text is required." : "कृपया संदेश मजकूर प्रविष्ट करा.");
      return;
    }

    if (formStartDate && formEndDate) {
      if (new Date(formStartDate) >= new Date(formEndDate)) {
        setFormError(
          isEn 
            ? "End date/time must be after start date/time." 
            : "समाप्ती वेळ सुरुवातीच्या वेळेनंतरची असणे आवश्यक आहे."
        );
        return;
      }
    }

    if (editingId) {
      // Editing existing
      setMessages(prev => {
        const updated = prev.map(m => {
          if (m.id === editingId) {
            return {
              ...m,
              text: trimmed,
              textMr: (formTextMr || trimmed).trim(),
              textEn: (formTextEn || trimmed).trim(),
              order: Number(formOrder) || m.order,
              isActive: Boolean(formIsActive),
              startDate: formStartDate ? formStartDate.trim() : "",
              endDate: formEndDate ? formEndDate.trim() : ""
            };
          }
          return m;
        });
        return updated.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      });
    } else {
      // Creating new
      const newMsg = {
        id: `msg_${Date.now()}`,
        text: trimmed,
        textMr: (formTextMr || trimmed).trim(),
        textEn: (formTextEn || trimmed).trim(),
        order: Number(formOrder) || messages.length + 1,
        isActive: Boolean(formIsActive),
        startDate: formStartDate ? formStartDate.trim() : "",
        endDate: formEndDate ? formEndDate.trim() : "",
        createdAt: new Date().toISOString()
      };
      setMessages(prev => {
        const updated = [...prev, newMsg];
        return updated.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      });
    }

    setIsModalOpen(false);
  };

  // Submit all to backend
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await onSaveScroller({
        marqueeActive,
        scrollerMessages: messages
      });
      if (res?.success) {
        if (onNotify) {
          onNotify(isEn ? "Important Update scroller saved successfully!" : "महत्वाचे अपडेट स्क्रोलर सेटिंग्ज जतन झाल्या!");
        }
      } else {
        if (onNotify) {
          onNotify(res?.message || (isEn ? "Failed to save scroller settings" : "सेटिंग्ज जतन करताना त्रुटी आली"), "error");
        }
      }
    } catch (err) {
      if (onNotify) {
        onNotify(err.message || "Error saving scroller", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to check scheduling status
  const getScheduleStatus = (msg) => {
    if (!msg.startDate && !msg.endDate) return null;
    const now = Date.now();
    const start = msg.startDate ? new Date(msg.startDate).getTime() : null;
    const end = msg.endDate ? new Date(msg.endDate).getTime() : null;

    if (start && now < start) {
      return { status: "upcoming", label: isEn ? "Upcoming" : "नियोजित (येणारा)", color: "bg-blue-100 text-blue-800 border-blue-300" };
    }
    if (end && now > end) {
      return { status: "expired", label: isEn ? "Expired" : "कालबाह्य (Expired)", color: "bg-stone-100 text-stone-600 border-stone-300" };
    }
    return { status: "running", label: isEn ? "Scheduled (Active Now)" : "नियोजित (सध्या सुरू)", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  };

  // Active messages count for badge
  const activeCount = messages.filter(m => {
    if (!m.isActive) return false;
    const schedule = getScheduleStatus(m);
    if (schedule && (schedule.status === "upcoming" || schedule.status === "expired")) return false;
    return true;
  }).length;

  return (
    <div className="space-y-6">
      
      {/* 1. Main Scroller Settings Card */}
      <FestiveCard
        title={isEn ? "Important Update Scroller Settings" : "महत्वाचे अपडेट स्क्रोलर व्यवस्थापक"}
        subtitle={
          isEn
            ? "Manage the horizontal announcements bar shown below the website header. Control scroller status, add/edit messages, change order, and set optional schedules."
            : "वेबसाईटच्या हेडर खाली धावणारी महत्वाच्या अपडेट्सची पट्टी व्यवस्थापित करा. स्क्रोलर सुरू/बंद करा, संदेश जोडा/संपादित करा आणि क्रम ठरवा."
        }
        icon={Flame}
        badge={
          marqueeActive 
            ? (isEn ? `ON • ${activeCount} Active` : `सुरू • ${activeCount} सक्रिय`) 
            : (isEn ? "OFF • Hidden" : "बंद • अदृश्य")
        }
        action={
          <FestiveButton
            onClick={handleSaveAll}
            icon={Save}
            variant="primary"
            size="md"
            disabled={isSaving}
          >
            {isSaving 
              ? (isEn ? "Saving..." : "जतन करत आहे...") 
              : (isEn ? "Save Scroller (बदल जतन करा)" : "बदल जतन करा (Save Scroller)")}
          </FestiveButton>
        }
      >
        <div className="space-y-6">
          
          {/* Section A: Global Master ON / OFF Control */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EC] to-white rounded-2xl border-2 border-gold-300/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Flame className={`w-5 h-5 ${marqueeActive ? "text-amber-600 animate-diya-flicker fill-amber-300" : "text-stone-400"}`} />
                <h3 className="text-sm sm:text-base font-black text-maroon-950 font-heading">
                  {isEn ? "Important Update Scroller Master Control" : "महत्वाचे अपडेट स्क्रोलर मुख्य नियंत्रण (ON / OFF)"}
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                {marqueeActive ? (
                  isEn 
                    ? "The scroller is currently ON and actively displayed on the public website." 
                    : "स्क्रोलर सध्या सुरू आहे आणि मुख्य वेबसाईटवर भाविकांना दिसत आहे."
                ) : (
                  isEn 
                    ? "The entire scroller is completely hidden from the public website (no blank bar). All messages remain safely stored." 
                    : "संपूर्ण स्क्रोलर मुख्य वेबसाईटवरून पूर्णपणे लपवलेला आहे (कोणतीही रिकामी पट्टी राहत नाही). तुमचे सर्व संदेश सुरक्षित आहेत."
                )}
              </p>
            </div>

            <div className="flex-shrink-0">
              <FestiveToggle
                checked={marqueeActive}
                onChange={handleToggleMaster}
                activeText={isEn ? "ON (सुरू)" : "सुरू (ON)"}
                inactiveText={isEn ? "OFF (बंद)" : "बंद (OFF)"}
                size="md"
              />
            </div>
          </div>

          {/* Section B: Live Website Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-maroon-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {isEn ? "Live Public Scroller Preview:" : "वेबसाईटवरील थेट पूर्वावलोकन (Live Preview):"}
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                {marqueeActive 
                  ? (isEn ? "Hover to pause • Matches live website 100%" : "माऊस फिरवल्यास थांबेल • थेट वेबसाईटसारखेच") 
                  : (isEn ? "Currently Hidden from Public" : "सध्या वेबसाईटवरून लपवलेले आहे")}
              </span>
            </div>

            {/* Preview Box Styled 100% Identical to Public Scroller */}
            <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
              marqueeActive ? "ring-2 ring-gold-400/80 shadow-md" : "opacity-60 ring-1 ring-stone-300"
            }`}>
              {marqueeActive ? (
                <div className="relative overflow-hidden bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 border-y border-gold-500/40 py-2 px-3">
                  <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
                    {/* Badge */}
                    <div className="flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-gold-500 to-amber-500 text-maroon-950 font-bold px-2.5 py-1 rounded-full text-xs shadow-md z-20">
                      <Flame className="w-3.5 h-3.5 text-amber-900 animate-diya-flicker fill-amber-300" />
                      <span className="font-heading">{isEn ? "Important Update:" : "महत्वाचे अपडेट:"}</span>
                    </div>

                    {/* Infinite Marquee Stream */}
                    <div className="relative flex-1 overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-maroon-950 to-transparent z-10 pointer-events-none" />
                      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-maroon-950 to-transparent z-10 pointer-events-none" />
                      
                      {activeCount > 0 ? (
                        <div className="flex w-max animate-marquee-continuous group-hover:[animation-play-state:paused]">
                          {/* Track 1 */}
                          <div className="flex shrink-0 items-center gap-4 sm:gap-6 pr-4 sm:pr-6 whitespace-nowrap text-xs sm:text-sm font-medium text-gold-100">
                            {messages.filter(m => {
                              if (!m.isActive) return false;
                              const s = getScheduleStatus(m);
                              if (s && (s.status === "upcoming" || s.status === "expired")) return false;
                              return true;
                            }).map(m => (
                              <React.Fragment key={m.id}>
                                <span className="font-semibold text-gold-100 hover:text-gold-300 transition-colors">
                                  {isEn ? (m.textEn || m.text) : (m.textMr || m.text)}
                                </span>
                                <span className="text-gold-400/80">❖</span>
                              </React.Fragment>
                            ))}
                          </div>
                          {/* Track 2 Clone */}
                          <div className="flex shrink-0 items-center gap-4 sm:gap-6 pr-4 sm:pr-6 whitespace-nowrap text-xs sm:text-sm font-medium text-gold-100">
                            {messages.filter(m => {
                              if (!m.isActive) return false;
                              const s = getScheduleStatus(m);
                              if (s && (s.status === "upcoming" || s.status === "expired")) return false;
                              return true;
                            }).map(m => (
                              <React.Fragment key={`clone_${m.id}`}>
                                <span className="font-semibold text-gold-100 hover:text-gold-300 transition-colors">
                                  {isEn ? (m.textEn || m.text) : (m.textMr || m.text)}
                                </span>
                                <span className="text-gold-400/80">❖</span>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="py-0.5 text-xs text-amber-200/70 italic px-2">
                          {isEn ? "No active messages to display." : "प्रदर्शित करण्यासाठी कोणतेही सक्रिय संदेश नाहीत."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-stone-100 text-stone-600 text-center text-xs font-semibold flex items-center justify-center gap-2">
                  <EyeOff className="w-4 h-4 text-stone-500" />
                  <span>
                    {isEn 
                      ? "Scroller is currently OFF. It will be completely hidden from the public website." 
                      : "स्क्रोलर सध्या बंद आहे. हे मुख्य वेबसाईटवर अजिबात दिसणार नाही."}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section C: Messages List Header & Add Button */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b-2 border-gold-300/50">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-maroon-950 uppercase tracking-wider font-heading flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-maroon-800" />
                  {isEn ? "Scrolling Messages List" : "स्क्रोलिंग संदेश यादी (Messages List)"}
                  <span className="text-[11px] font-bold text-maroon-800 bg-gold-200 px-2 py-0.5 rounded-full border border-gold-400">
                    {messages.length}
                  </span>
                </h4>
                <p className="text-[11px] text-stone-500">
                  {isEn
                    ? "Control the display order, individual visibility, edit text, or add scheduled announcements."
                    : "संदेशांचा क्रम बदला, वैयक्तिक संदेश सुरू/बंद करा, मजकूर संपादित करा किंवा वेळ ठरवा."}
                </p>
              </div>

              <FestiveButton
                onClick={handleOpenAdd}
                icon={Plus}
                variant="secondary"
                size="sm"
              >
                {isEn ? "+ Add New Message" : "+ नवीन संदेश जोडा"}
              </FestiveButton>
            </div>

            {/* Message Items Table/Cards */}
            {messages.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF5EC]/60 rounded-2xl border-2 border-dashed border-gold-300">
                <Megaphone className="w-8 h-8 text-gold-600/60 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-bold text-maroon-900 font-heading">
                  {isEn ? "No Scrolling Messages Found" : "कोणतेही स्क्रोलिंग संदेश उपलब्ध नाहीत"}
                </p>
                <p className="text-xs text-stone-500 mt-1 mb-4">
                  {isEn 
                    ? "Add messages that will scroll across the top ribbon of the website." 
                    : "वेबसाईटच्या शीर्षस्थ पट्टीवर धावणारे संदेश जोडा."}
                </p>
                <FestiveButton onClick={handleOpenAdd} icon={Plus} variant="primary" size="sm">
                  {isEn ? "Add First Message" : "पहिला संदेश जोडा"}
                </FestiveButton>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => {
                  const schedule = getScheduleStatus(msg);
                  return (
                    <div
                      key={msg.id}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        msg.isActive
                          ? "bg-white border-gold-300 hover:border-gold-400 shadow-xs"
                          : "bg-stone-50 border-stone-200 opacity-75"
                      }`}
                    >
                      {/* Left: Order Badge & Reorder Controls */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            title={isEn ? "Move Up in Order" : "वर हलवा"}
                            className="p-1 rounded hover:bg-gold-200 text-maroon-900 disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-amber-500 text-maroon-950 font-black text-xs flex items-center justify-center shadow-xs border border-gold-500 font-heading">
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === messages.length - 1}
                            title={isEn ? "Move Down in Order" : "खाली हलवा"}
                            className="p-1 rounded hover:bg-gold-200 text-maroon-900 disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Middle: Message Text & Details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-maroon-950 leading-snug">
                            {isEn ? (msg.textEn || msg.text) : (msg.textMr || msg.text)}
                          </span>
                          
                          {/* Schedule badge if applicable */}
                          {schedule && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${schedule.color} flex items-center gap-1`}>
                              <Calendar className="w-2.5 h-2.5" />
                              {schedule.label}
                            </span>
                          )}

                          {!msg.isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                              {isEn ? "OFF (Disabled)" : "बंद (अक्रिय)"}
                            </span>
                          )}
                        </div>

                        {/* Secondary text preview if different */}
                        {msg.textMr && msg.textEn && msg.textMr !== msg.textEn && (
                          <p className="text-[11px] text-stone-500 truncate">
                            <span className="font-semibold">{isEn ? "मराठी: " : "English: "}</span>
                            {isEn ? msg.textMr : msg.textEn}
                          </p>
                        )}

                        {/* Scheduling window text */}
                        {(msg.startDate || msg.endDate) && (
                          <div className="flex items-center gap-2 text-[10px] text-stone-500 pt-0.5">
                            <Clock className="w-3 h-3 text-stone-400 flex-shrink-0" />
                            <span>
                              {msg.startDate ? `From: ${new Date(msg.startDate).toLocaleString()}` : "Anytime"} 
                              {" → "}
                              {msg.endDate ? `Until: ${new Date(msg.endDate).toLocaleString()}` : "No expiry"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions & Individual Toggle */}
                      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200 w-full sm:w-auto justify-end">
                        
                        {/* Individual Status Toggle */}
                        <div className="mr-1">
                          <FestiveToggle
                            checked={msg.isActive}
                            onChange={() => handleToggleMessage(msg.id)}
                            activeText={isEn ? "ON" : "सुरू"}
                            inactiveText={isEn ? "OFF" : "बंद"}
                            size="sm"
                          />
                        </div>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(msg)}
                          className="px-2.5 py-1.5 rounded-lg bg-gold-100 hover:bg-gold-200 text-maroon-900 border border-gold-300 font-bold text-xs flex items-center gap-1 transition active:scale-95 shadow-2xs cursor-pointer"
                          title={isEn ? "Edit Message" : "संदेश संपादित करा"}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">{isEn ? "Edit" : "संपादित करा"}</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(msg.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center gap-1 transition active:scale-95 shadow-2xs cursor-pointer"
                          title={isEn ? "Delete Message" : "संदेश हटवा"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">{isEn ? "Delete" : "हटवा"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t-2 border-gold-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-stone-500 text-center sm:text-left">
              {isEn 
                ? "💡 Changes are updated in real-time on the public website when you click Save." 
                : "💡 'बदल जतन करा' बटणावर क्लिक केल्यावर वेबसाईटवरील स्क्रोलर लगेच अपडेट होईल."}
            </div>

            <FestiveButton
              onClick={handleSaveAll}
              icon={Save}
              variant="primary"
              size="md"
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving 
                ? (isEn ? "Saving..." : "जतन करत आहे...") 
                : (isEn ? "Save All Changes (सर्व बदल जतन करा)" : "सर्व बदल जतन करा (Save All)")}
            </FestiveButton>
          </div>

        </div>
      </FestiveCard>

      {/* 2. Modal for Add / Edit Message */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="bg-[#FFFDF9] w-full max-w-lg rounded-2xl border-2 border-gold-400 shadow-2xl overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b-2 border-gold-500">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-gold-400" />
                <h3 className="text-sm sm:text-base font-black text-gold-200 font-heading">
                  {editingId 
                    ? (isEn ? "Edit Scrolling Message" : "स्क्रोलिंग संदेश संपादित करा") 
                    : (isEn ? "Add New Scrolling Message" : "नवीन स्क्रोलिंग संदेश जोडा")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gold-300 hover:text-white hover:bg-maroon-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm max-h-[80vh] overflow-y-auto">
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Message Text (Primary) */}
              <FestiveTextarea
                label={isEn ? "Message Text (Primary) *" : "संदेश मजकूर (मुख्य) *"}
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder={
                  isEn 
                    ? "e.g. 7:30 PM. Kindly arrive 10 minutes earlier." 
                    : "उदा. दैनिक महाआरती सकाळी ८:३० व रात्री ८:०० वाजता."
                }
                rows={2}
                required
                helperText={isEn ? "This is the main text displayed in the scroller." : "हा मुख्य मजकूर स्क्रोलरवर धावेल."}
              />

              {/* Optional Marathi & English translations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <FestiveInput
                  label={isEn ? "Marathi Text (Optional)" : "मराठी मजकूर (पर्यायी)"}
                  value={formTextMr}
                  onChange={(e) => setFormTextMr(e.target.value)}
                  placeholder="मराठीत भाषांतर (पर्यायी)"
                  helperText={isEn ? "Shown when user selects Marathi language." : "मराठी भाषेत हा मजकूर दिसेल."}
                />

                <FestiveInput
                  label={isEn ? "English Text (Optional)" : "English Text (Optional)"}
                  value={formTextEn}
                  onChange={(e) => setFormTextEn(e.target.value)}
                  placeholder="English text (optional)"
                  helperText={isEn ? "Shown when user selects English language." : "इंग्रजी भाषेत हा मजकूर दिसेल."}
                />
              </div>

              {/* Order and Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 p-3 bg-stone-50 rounded-xl border border-gold-200">
                <div>
                  <FestiveInput
                    label={isEn ? "Display Order Number" : "प्रदर्शन क्रम क्रमांक (Display Order)"}
                    type="number"
                    min="1"
                    value={formOrder}
                    onChange={(e) => setFormOrder(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col justify-center pt-2 sm:pt-4">
                  <FestiveToggle
                    checked={formIsActive}
                    onChange={(val) => setFormIsActive(val)}
                    label={isEn ? "Message Visibility Status" : "संदेश स्थिती"}
                    activeText={isEn ? "ON (Active in Scroller)" : "सुरू (स्क्रोलरवर दिसेल)"}
                    inactiveText={isEn ? "OFF (Hidden)" : "बंद (लपवलेला)"}
                    size="sm"
                  />
                </div>
              </div>

              {/* Scheduling Section (Optional) */}
              <div className="p-3.5 bg-gradient-to-br from-amber-50/60 to-orange-50/30 rounded-xl border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs uppercase font-heading">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isEn ? "Schedule Display Window (Optional)" : "वेळ व दिनांक नियोजन (पर्यायी - Scheduling)"}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-tight">
                  {isEn 
                    ? "Leave blank for always visible. Or set start/end times to automatically show and hide this announcement." 
                    : "संदेश कायम दिसण्यासाठी रिकामा ठेवा. किंवा ठरवून दिलेल्या वेळेतच संदेश दिसण्यासाठी वेळ निवडा."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-maroon-900 mb-1 font-heading">
                      {isEn ? "Start Date & Time" : "सुरू होण्याची तारीख व वेळ"}
                    </label>
                    <input
                      type="datetime-local"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full bg-white text-maroon-950 text-xs font-semibold rounded-lg border border-gold-300 p-2 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-maroon-900 mb-1 font-heading">
                      {isEn ? "End Date & Time" : "समाप्ती तारीख व वेळ"}
                    </label>
                    <input
                      type="datetime-local"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full bg-white text-maroon-950 text-xs font-semibold rounded-lg border border-gold-300 p-2 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-400"
                    />
                  </div>
                </div>

                {(formStartDate || formEndDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormStartDate("");
                      setFormEndDate("");
                    }}
                    className="text-[10px] text-rose-700 hover:text-rose-900 underline font-semibold"
                  >
                    {isEn ? "Clear Schedule (Make Always Visible)" : "वेळापत्रक काढून टाका (कायम दाखवा)"}
                  </button>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gold-200">
                <FestiveButton
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  size="sm"
                >
                  {isEn ? "Cancel" : "रद्द करा"}
                </FestiveButton>

                <FestiveButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={Check}
                >
                  {editingId 
                    ? (isEn ? "Update Message" : "बदल जतन करा") 
                    : (isEn ? "Add Message" : "संदेश जोडा")}
                </FestiveButton>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ScrollerManager;
