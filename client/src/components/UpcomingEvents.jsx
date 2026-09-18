import React, { useState, useEffect } from "react";
import { 
  Calendar, Clock, MapPin, 
  Building, Table, Plus, Edit, Trash2, Eye, X, Sparkles, CheckCircle2, AlertCircle
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { subscribeLiveSync } from "../utils/liveSync";
import { getMediaUrl, handleImageError } from "../utils/mediaUrl";

export const UPCOMING_FESTIVAL_EVENTS = [];
export const YEARLY_EVENTS = [];

// Helper to compute live timer status and countdown in IST
const getEventTimerInfo = (ev, nowMs) => {
  let startMs = null;
  let endMs = null;

  if (ev.startDateTime) {
    startMs = new Date(ev.startDateTime).getTime();
  } else if (ev.startDate && ev.startTime) {
    const pad = (n) => String(n).padStart(2, "0");
    const [y, m, d] = ev.startDate.split("-");
    const [h, min] = ev.startTime.split(":");
    startMs = new Date(`${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}:00+05:30`).getTime();
  }

  if (ev.endDateTime) {
    endMs = new Date(ev.endDateTime).getTime();
  } else if (ev.endDate && ev.endTime) {
    const pad = (n) => String(n).padStart(2, "0");
    const [y, m, d] = ev.endDate.split("-");
    const [h, min] = ev.endTime.split(":");
    endMs = new Date(`${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}:00+05:30`).getTime();
  } else if (startMs) {
    endMs = startMs + 3 * 3600 * 1000; // default 3 hours
  }

  if (!startMs || isNaN(startMs)) {
    if (ev.status === "completed") return { state: "completed", timerText: "" };
    if (ev.status === "live") return { state: "ongoing", timerText: "" };
    return { state: "upcoming", timerText: "" };
  }

  const pad = (num) => String(num).padStart(2, "0");

  if (nowMs < startMs) {
    const diff = startMs - nowMs;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const timerText = days > 0
      ? `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
      : `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

    return { state: "upcoming", timerText, diff };
  } else if (nowMs <= endMs) {
    const diff = endMs - nowMs;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const timerText = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    return { state: "ongoing", timerText, diff };
  } else {
    return { state: "completed", timerText: "" };
  }
};

const UpcomingEvents = ({ onOpenUpcomingCalendar }) => {
  const { language, t } = useLanguage();
  const { config } = useConfig();
  const { admin } = useAuth();
  const [activeTab, setActiveTab] = useState("festival"); // "festival" or "yearly"
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [selectedEventModal, setSelectedEventModal] = useState(null);

  // Synchronized 1-second live ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedEventModal) {
        setSelectedEventModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEventModal]);

  // If upcoming/cultural tab is disabled by admin, return null
  const isEnabled = config?.tabs?.cultural?.enabled !== false && config?.tabs?.upcoming?.enabled !== false;
  if (!isEnabled) {
    return null;
  }

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get("/events", {
        params: { eventType: activeTab }
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setEventsList(res.data.data);
      } else {
        setEventsList([]);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setEventsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const unsub = subscribeLiveSync(({ entity }) => {
      if (entity === "events" || entity === "all") {
        fetchEvents();
      }
    });
    return () => unsub();
  }, [activeTab]);

  const handleDeleteCardEvent = async (id, title) => {
    const confirmMsg = language === "mr" 
      ? `तुम्हाला '${title || "हा कार्यक्रम"}' नक्की हटवायचा आहे का?` 
      : `Are you sure you want to delete '${title || "this event"}'?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await API.delete(`/events/${id}`);
      if (res.data?.success) {
        fetchEvents();
      }
    } catch (err) {
      alert(language === "mr" ? "कार्यक्रम हटवताना त्रुटी आली" : "Failed to delete event");
    }
  };

  return (
    <section id="upcoming" className="scroll-mt-20 my-8">
      <div className="bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EB] rounded-3xl border-2 border-gold-400 shadow-xl overflow-hidden p-4 sm:p-7 md:p-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-gold-300/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-maroon-900 bg-gold-200/90 px-3 py-1 rounded-full border border-gold-400">
              <Calendar className="w-4 h-4 text-maroon-800" />
              <span>{t("upcomingTitle")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-maroon-950 font-heading mt-1.5">
              {language === "mr" ? "आगामी व वार्षिक कार्यक्रम पत्रिका" : "Upcoming & Yearly Events Calendar"}
            </h2>
            <p className="text-xs sm:text-sm text-maroon-800 font-medium">
              {t("upcomingSubtitle")}
            </p>
          </div>

          {/* Action and Tab Switcher Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {admin && onOpenUpcomingCalendar && (
              <button
                onClick={() => onOpenUpcomingCalendar(activeTab)}
                className="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-gold-400 hover:bg-gold-300 text-maroon-950 font-black text-xs transition active:scale-95 shadow-sm whitespace-nowrap cursor-pointer"
                title="कॅलेंडरमध्ये नवीन कार्यक्रम जोडा किंवा व्यवस्थापित करा"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === "mr" ? "+ नवीन कार्यक्रम जोडा" : "+ Add Event"}</span>
              </button>
            )}

            {onOpenUpcomingCalendar && (
              <button
                onClick={() => onOpenUpcomingCalendar(activeTab)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-900 via-maroon-850 to-amber-950 text-gold-200 hover:text-white border border-gold-400/80 shadow-sm font-bold text-xs transition active:scale-95 whitespace-nowrap cursor-pointer"
                title="टेबल स्वरूपात संपूर्ण कॅलेंडर पॉप-अप उघडा"
              >
                <Table className="w-3.5 h-3.5 text-gold-400" />
                <span>{language === "mr" ? "टेबल पॉप-अप उघडा" : "Open Table Pop-up"}</span>
              </button>
            )}

            <div className="grid grid-cols-2 sm:flex items-center gap-1.5 sm:gap-2 bg-maroon-950 p-1.5 rounded-2xl border border-gold-500/40 w-full sm:w-auto text-center">
              <button
                onClick={() => setActiveTab("festival")}
                className={`px-3 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all text-center justify-center ${
                  activeTab === "festival"
                    ? "bg-gold-400 text-maroon-950 shadow-md font-black"
                    : "text-gold-200 hover:text-white"
                }`}
              >
                {t("festivalEventsTab")}
              </button>
              <button
                onClick={() => setActiveTab("yearly")}
                className={`px-3 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all text-center justify-center ${
                  activeTab === "yearly"
                    ? "bg-gold-400 text-maroon-950 shadow-md font-black"
                    : "text-gold-200 hover:text-white"
                }`}
              >
                {t("yearlyEventsTab")}
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-8 text-maroon-800 text-sm font-semibold">
            {language === "mr" ? "कार्यक्रम लोड होत आहेत..." : "Loading events..."}
          </div>
        )}

        {/* Empty state */}
        {!loading && eventsList.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm font-semibold">
            {language === "mr" ? "सध्या कोणतेही कार्यक्रम उपलब्ध नाहीत." : "No events scheduled currently."}
          </div>
        )}

        {/* Events Grid */}
        {!loading && eventsList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {eventsList.map((ev) => {
              const timerInfo = getEventTimerInfo(ev, currentTime);

              return (
                <div
                  key={ev._id || ev.id}
                  className="bg-white rounded-2xl border-2 border-gold-300 p-5 shadow-sm hover:border-gold-500 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Event Flyer / Photo Banner if present */}
                    {ev.imageUrl && (
                      <div 
                        onClick={() => setSelectedEventModal(ev)}
                        className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden cursor-pointer group border border-gold-300 shadow-2xs mb-3 bg-stone-100"
                        title={language === "mr" ? "फोटो व सविस्तर माहिती पहा" : "View Photo & Details"}
                      >
                        <img 
                          src={getMediaUrl(ev.imageUrl)} 
                          alt={ev.titleMr} 
                          onError={handleImageError}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-2 font-bold text-xs">
                          <Eye className="w-4 h-4 text-gold-300" />
                          <span>{language === "mr" ? "फोटो व तपशील पहा" : "View Photo & Details"}</span>
                        </div>
                      </div>
                    )}

                    {/* Top Row: Category Badge & Date/Day Info */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-black uppercase text-maroon-900 bg-gold-100 px-2.5 py-0.5 rounded-md border border-gold-300">
                          {language === "mr" ? (ev.categoryMr || ev.category) : (ev.categoryEn || ev.category)}
                        </span>
                        {ev.isHighlight && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-400 text-maroon-950 shadow-2xs">
                            {language === "mr" ? "विशेष आकर्षण" : "Highlight"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === "mr" ? (ev.dateStr || ev.dateMr || ev.time) : (ev.dateStrEn || ev.dateEn || ev.time)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => ev.imageUrl && setSelectedEventModal(ev)}
                      className={`text-base sm:text-lg font-bold text-maroon-950 font-heading mb-2 leading-snug ${ev.imageUrl ? "cursor-pointer hover:text-amber-800 transition" : ""}`}
                    >
                      {language === "mr" ? ev.titleMr : (ev.titleEn || ev.titleMr)}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-3">
                      {language === "mr" ? (ev.descriptionMr || ev.descMr) : (ev.descriptionEn || ev.descEn || ev.descriptionMr)}
                    </p>

                    {/* Live Dynamic Countdown & Status Timer */}
                    <div className="mb-3">
                      {timerInfo.state === "upcoming" && (
                        <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-[#FFFDF9] border border-gold-300 flex items-center justify-between gap-2 shadow-2xs">
                          <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-amber-900">
                            <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse flex-shrink-0" />
                            <span>{language === "mr" ? "सुरू होण्यास बाकी" : "Starts in"}</span>
                          </span>
                          <span className="font-mono font-black text-xs sm:text-sm text-maroon-950 tracking-wider bg-white/80 px-2 py-0.5 rounded-lg border border-gold-200">
                            {timerInfo.timerText || "00:00:00"}
                          </span>
                        </div>
                      )}

                      {timerInfo.state === "ongoing" && (
                        <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-50 via-amber-50 to-red-50 border-2 border-red-400 flex items-center justify-between gap-2 shadow-2xs animate-pulse">
                          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase text-red-700">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping flex-shrink-0" />
                            <span>{language === "mr" ? "सध्या सुरू आहे • समाप्ती" : "ONGOING • Ends in"}</span>
                          </span>
                          <span className="font-mono font-black text-xs sm:text-sm text-red-950 tracking-wider bg-white px-2 py-0.5 rounded-lg border border-red-300">
                            {timerInfo.timerText || "00:00:00"}
                          </span>
                        </div>
                      )}

                      {timerInfo.state === "completed" && (
                        <div className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-between gap-2 text-stone-600">
                          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-stone-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                            <span>{language === "mr" ? "कार्यक्रम संपन्न झाला" : "EVENT ENDED"}</span>
                          </span>
                          <span className="text-[10px] font-bold text-stone-500">
                            {language === "mr" ? "यशस्वीरीत्या संपन्न" : "Finished"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Venue and Target Wing / Audience */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                        <span>{language === "mr" ? (ev.venueMr || ev.venue) : (ev.venueEn || ev.venue || ev.venueMr)}</span>
                      </span>
                      {(ev.hostWing || ev.targetWing || ev.targetAudience) && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-maroon-700 flex-shrink-0" />
                          <span>{language === "mr" ? (ev.hostWing || ev.targetAudience || ev.targetWing) : (ev.hostWingEn || ev.targetAudienceEn || ev.hostWing || ev.targetAudience || ev.targetWing)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-gold-100 flex items-center justify-between gap-2 flex-wrap">
                    {ev.imageUrl ? (
                      <button
                        onClick={() => setSelectedEventModal(ev)}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-gold-100 hover:bg-gold-200 text-maroon-950 font-bold text-xs border border-gold-300 transition active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-800" />
                        <span>{language === "mr" ? "फोटो व माहिती पहा" : "View Photo & Details"}</span>
                      </button>
                    ) : <div />}

                    {admin && (
                      <div className="flex items-center gap-1.5">
                        {onOpenUpcomingCalendar && (
                          <button
                            onClick={() => onOpenUpcomingCalendar(activeTab)}
                            className="inline-flex items-center gap-1 py-1.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 transition active:scale-95 cursor-pointer shadow-2xs"
                            title={language === "mr" ? "कार्यक्रम संपादन करा" : "Edit Event"}
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-800" />
                            <span>{language === "mr" ? "संपादन" : "Edit"}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCardEvent(ev._id || ev.id, ev.titleMr)}
                          className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-300 transition active:scale-95 cursor-pointer shadow-2xs"
                          title={language === "mr" ? "कार्यक्रम हटवा" : "Delete Event"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === "mr" ? "हटवा" : "Delete"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Section 5: Upcoming Festival Image & Details Popup Modal */}
        {selectedEventModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-fadeIn"
            onClick={() => setSelectedEventModal(null)}
            role="dialog"
            aria-modal="true"
          >
            <div 
              className="relative w-full max-w-2xl max-h-[92vh] bg-[#FFFDF9] rounded-3xl overflow-hidden border-2 border-gold-400 shadow-2xl flex flex-col animate-scaleIn"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Top Accent Line */}
              <div className="h-1.5 bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600 w-full flex-shrink-0" />

              {/* Modal Header */}
              <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-gold-500/50 flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="w-5 h-5 text-gold-300 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-gold-300 tracking-wider block">
                      {language === "mr" ? (selectedEventModal.categoryMr || selectedEventModal.category) : (selectedEventModal.categoryEn || selectedEventModal.category)}
                    </span>
                    <h3 className="font-heading font-black text-gold-200 text-sm sm:text-base truncate">
                      {language === "mr" ? selectedEventModal.titleMr : (selectedEventModal.titleEn || selectedEventModal.titleMr)}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEventModal(null)}
                  className="p-1.5 rounded-full text-gold-300 hover:text-white bg-maroon-850 hover:bg-maroon-800 border border-gold-500/40 transition cursor-pointer flex-shrink-0"
                  title="Close (बंद करा)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
                
                {/* Event Image */}
                {selectedEventModal.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border-2 border-gold-300 shadow-md bg-stone-100 max-h-[50vh] flex items-center justify-center">
                    <img 
                      src={getMediaUrl(selectedEventModal.imageUrl)} 
                      alt={selectedEventModal.titleMr} 
                      onError={handleImageError}
                      className="w-full max-h-[50vh] object-contain rounded-xl"
                    />
                  </div>
                )}

                {/* Live Status & Timer Banner inside Modal */}
                {(() => {
                  const mTimer = getEventTimerInfo(selectedEventModal, currentTime);
                  return (
                    <div className="p-3 rounded-2xl bg-[#FAF5EB] border-2 border-gold-300 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {mTimer.state === "upcoming" && (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping flex-shrink-0" />
                            <span className="font-extrabold text-amber-900 uppercase text-xs">
                              {language === "mr" ? "आगामी कार्यक्रम (Upcoming)" : "Upcoming Event"}
                            </span>
                          </>
                        )}
                        {mTimer.state === "ongoing" && (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping flex-shrink-0" />
                            <span className="font-black text-red-700 uppercase text-xs">
                              {language === "mr" ? "सध्या सुरू आहे (ONGOING)" : "ONGOING EVENT"}
                            </span>
                          </>
                        )}
                        {mTimer.state === "completed" && (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-stone-600 flex-shrink-0" />
                            <span className="font-bold text-stone-600 uppercase text-xs">
                              {language === "mr" ? "कार्यक्रम संपन्न झाला (EVENT ENDED)" : "EVENT ENDED"}
                            </span>
                          </>
                        )}
                      </div>

                      {mTimer.timerText && (
                        <div className="flex items-center gap-1.5 font-mono font-black text-xs sm:text-sm text-maroon-950 bg-white px-2.5 py-1 rounded-xl border border-gold-300 shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                          <span>{mTimer.timerText}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-white rounded-2xl border border-gold-200 text-stone-700">
                  <div className="space-y-1">
                    <span className="font-bold text-[11px] text-gray-500 uppercase block">
                      {language === "mr" ? "दिनांक व वेळ:" : "Date & Time:"}
                    </span>
                    <span className="font-black text-maroon-950 flex items-center gap-1 text-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                      <span>{language === "mr" ? (selectedEventModal.dateStr || selectedEventModal.time) : (selectedEventModal.dateStrEn || selectedEventModal.time)}</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-[11px] text-gray-500 uppercase block">
                      {language === "mr" ? "स्थळ / ठिकाण:" : "Venue / Location:"}
                    </span>
                    <span className="font-bold text-maroon-950 flex items-center gap-1 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                      <span>{language === "mr" ? (selectedEventModal.venueMr || selectedEventModal.venue) : (selectedEventModal.venueEn || selectedEventModal.venue)}</span>
                    </span>
                  </div>

                  {(selectedEventModal.hostWing || selectedEventModal.targetAudience) && (
                    <div className="space-y-1 sm:col-span-2 pt-2 border-t border-gold-100">
                      <span className="font-bold text-[11px] text-gray-500 uppercase block">
                        {language === "mr" ? "लक्षित रहिवासी / यजमान विंग:" : "Target Audience / Host Wing:"}
                      </span>
                      <span className="font-bold text-maroon-900 flex items-center gap-1 text-xs">
                        <Building className="w-3.5 h-3.5 text-maroon-700 flex-shrink-0" />
                        <span>{language === "mr" ? (selectedEventModal.hostWing || selectedEventModal.targetAudience) : (selectedEventModal.hostWingEn || selectedEventModal.targetAudienceEn || selectedEventModal.hostWing)}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Short Description */}
                {(selectedEventModal.descriptionMr || selectedEventModal.descriptionEn) && (
                  <div className="space-y-1.5 p-3.5 bg-white rounded-2xl border border-gold-200">
                    <h4 className="font-bold text-xs text-maroon-950 uppercase tracking-wider">
                      {language === "mr" ? "कार्यक्रमाची रूपरेषा व तपशील" : "Description & Highlights"}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal whitespace-pre-line">
                      {language === "mr" ? (selectedEventModal.descriptionMr || selectedEventModal.descriptionEn) : (selectedEventModal.descriptionEn || selectedEventModal.descriptionMr)}
                    </p>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="bg-[#FAF5EB] px-5 py-3 border-t-2 border-gold-300 flex items-center justify-end gap-2 flex-shrink-0">
                <button
                  onClick={() => setSelectedEventModal(null)}
                  className="px-5 py-2 rounded-xl bg-maroon-850 hover:bg-maroon-800 text-gold-200 font-bold text-xs border border-gold-400/50 shadow transition active:scale-95 cursor-pointer"
                >
                  {language === "mr" ? "बंद करा (Close)" : "Close"}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default UpcomingEvents;
