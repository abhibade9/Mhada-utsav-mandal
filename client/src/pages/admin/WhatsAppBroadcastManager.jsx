import React, { useState } from "react";
import { 
  MessageSquare, Send, Copy, Check, Sparkles, Flame, 
  Calendar, Megaphone, FileText, Newspaper, Share2, CheckCircle2 
} from "lucide-react";
import { FestiveCard, FestiveButton, FestiveSelect } from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";
import { 
  formatNewsletterBroadcast,
  formatAartiScheduleBroadcast,
  formatSingleAartiDay,
  formatAnnouncementsBroadcast,
  formatSingleAnnouncement,
  formatEventsScheduleBroadcast,
  formatSingleEvent,
  formatSocietyRulesBroadcast,
  openWhatsApp,
  openWhatsAppDirect,
  copyToClipboard
} from "../../utils/whatsappFormatter";

const WhatsAppBroadcastManager = ({ config, announcements = [], events = [], onNotify }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState("newsletter");
  const [selectedDayIdx, setSelectedDayIdx] = useState("all");
  const [selectedAnnId, setSelectedAnnId] = useState("all");
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [copiedKey, setCopiedKey] = useState(null);

  const aartiList = config?.dailyAartiSchedule || config?.tenDaysAartiSchedule || [];

  // Generate formatted text based on current active tab and subselection
  const getFormattedMessage = () => {
    switch (activeTab) {
      case "newsletter":
        return formatNewsletterBroadcast(config?.newsletter, config);

      case "aarti":
        if (selectedDayIdx === "all") {
          return formatAartiScheduleBroadcast(aartiList, config);
        }
        const dayItem = aartiList[parseInt(selectedDayIdx, 10)] || aartiList[0];
        return formatSingleAartiDay(dayItem, config);

      case "announcements":
        if (selectedAnnId === "all") {
          return formatAnnouncementsBroadcast(announcements, config);
        }
        const annItem = announcements.find(a => (a._id || a.id) === selectedAnnId) || announcements[0];
        return formatSingleAnnouncement(annItem, config);

      case "events":
        if (selectedEventId === "all") {
          return formatEventsScheduleBroadcast(events, config);
        }
        const evItem = events.find(e => (e._id || e.id) === selectedEventId) || events[0];
        return formatSingleEvent(evItem, config);

      case "rules":
        return formatSocietyRulesBroadcast(config?.rules, config);

      default:
        return "";
    }
  };

  const messageText = getFormattedMessage();

  const handleShare = () => {
    openWhatsApp(messageText);
    if (onNotify) {
      onNotify(
        isEn ? "Opening WhatsApp with formatted broadcast..." : "व्हॉट्सॲपवर संदेश पाठवण्यासाठी तयार केला!",
        "success"
      );
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(messageText);
    if (ok) {
      setCopiedKey(activeTab);
      setTimeout(() => setCopiedKey(null), 2500);
      if (onNotify) {
        onNotify(
          isEn ? "Formatted message copied to clipboard!" : "सुबक फॉरमॅट केलेला संदेश क्लिपबोर्डवर कॉपी केला!",
          "success"
        );
      }
    }
  };

  const categories = [
    {
      id: "newsletter",
      titleMr: "दैनिक वृत्तपत्र",
      titleEn: "Daily Newsletter",
      icon: Newspaper,
      descMr: "आजचा दिवस, ठळक बातमी, आजची महाआरती व यजमान इमारत",
      descEn: "Today's edition, highlights, evening aarti timing & host wing",
      badge: "दैनंदिन"
    },
    {
      id: "aarti",
      titleMr: "१० दिवस आरती वेळापत्रक",
      titleEn: "10-Day Aarti Schedule",
      icon: Flame,
      descMr: "सर्व १० दिवसांचे तारीखनिहाय आरती वेळा व यजमान विंग प्रमुख",
      descEn: "Complete date-wise aarti timings and host wing coordinators",
      badge: "आरती"
    },
    {
      id: "announcements",
      titleMr: "महत्त्वाच्या सूचना",
      titleEn: "Announcements",
      icon: Megaphone,
      descMr: "तातडीच्या व सामान्य सूचना, इमारती व रहिवाशांसाठी माहिती",
      descEn: "Urgent/general notices and committee updates for residents",
      badge: `${announcements.length} सूचना`
    },
    {
      id: "events",
      titleMr: "कार्यक्रम वेळापत्रक",
      titleEn: "Event Schedule",
      icon: Calendar,
      descMr: "सांस्कृतिक कार्यक्रम, स्पर्धा व मिरवणूक तपशील",
      descEn: "Festival cultural events, competitions & timings",
      badge: `${events.length} कार्यक्रम`
    },
    {
      id: "rules",
      titleMr: "सोसायटी नियमावली",
      titleEn: "Society Rules",
      icon: FileText,
      descMr: "ध्वनी, स्वच्छता, पार्किंग व सुरक्षेची अधिकृत नियमावली",
      descEn: "Noise control, cleanliness, security & parking guidelines",
      badge: "नियमावली"
    }
  ];

  return (
    <FestiveCard
      title={isEn ? "WhatsApp Broadcast & Share Hub" : "व्हॉट्सॲप ब्रॉडकास्ट व थेट संदेश केंद्र"}
      subtitle={
        isEn
          ? "Directly broadcast refined festival notices to WhatsApp without manual typing. Select any category, preview, and share with 1-click."
          : "टाईप न करता एका क्लिकवर दैनिक वृत्तपत्र, १० दिवस आरती, सूचना, कार्यक्रम व नियम थेट व्हॉट्सॲपवर पाठवा."
      }
      icon={MessageSquare}
      badge={isEn ? "Direct Broadcast" : "थेट ब्रॉडकास्ट"}
    >
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-4 border-b border-gold-300/60">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                isActive
                  ? "bg-gradient-to-r from-emerald-700 to-emerald-800 text-white border-emerald-500 shadow-md scale-[1.02]"
                  : "bg-white text-maroon-950 hover:bg-gold-50 border-gold-300"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-gold-300" : "text-amber-700"}`} />
              <span>{isEn ? cat.titleEn : cat.titleMr}</span>
              {cat.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isActive ? "bg-white/20 text-white" : "bg-gold-100 text-maroon-900"
                }`}>
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-selectors for granular sharing */}
      <div className="mb-4 bg-white p-3.5 rounded-2xl border border-gold-300/80 shadow-2xs space-y-3">
        {activeTab === "aarti" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-maroon-950 block">
                {isEn ? "Choose Aarti Broadcast Scope:" : "आरती संदेशाची व्याप्ती निवडा:"}
              </label>
              <p className="text-[11px] text-gray-600">
                {isEn ? "Share the entire 10-day schedule or a specific day's timings." : "संपूर्ण १० दिवसांचे वेळापत्रक किंवा फक्त एका दिवसाची आरती वेळ निवडा."}
              </p>
            </div>
            <select
              value={selectedDayIdx}
              onChange={(e) => setSelectedDayIdx(e.target.value)}
              className="p-2 text-xs font-bold rounded-xl border border-gold-400 bg-gold-50/50 text-maroon-950 focus:border-emerald-600 outline-none w-full sm:w-64"
            >
              <option value="all">
                {isEn ? "🌟 Complete 10-Day Schedule" : "🌟 संपूर्ण १० दिवसांचे वेळापत्रक"}
              </option>
              {aartiList.map((item, idx) => (
                <option key={idx} value={idx}>
                  {`दिवस ${item.dayNumber || idx + 1} (${item.dateStr || ""}) - ${item.hostWing || ""}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab === "announcements" && announcements.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-maroon-950 block">
                {isEn ? "Choose Announcements Scope:" : "सूचनेची व्याप्ती निवडा:"}
              </label>
              <p className="text-[11px] text-gray-600">
                {isEn ? "Share all active announcements or a single specific notice." : "सर्व सक्रिय सूचना एकत्र किंवा कोणतीही एक विशिष्ट सूचना निवडा."}
              </p>
            </div>
            <select
              value={selectedAnnId}
              onChange={(e) => setSelectedAnnId(e.target.value)}
              className="p-2 text-xs font-bold rounded-xl border border-gold-400 bg-gold-50/50 text-maroon-950 focus:border-emerald-600 outline-none w-full sm:w-72"
            >
              <option value="all">
                {isEn ? `📢 All Active Announcements (${announcements.length})` : `📢 सर्व चालू सूचना (${announcements.length})`}
              </option>
              {announcements.map((a) => (
                <option key={a._id || a.id} value={a._id || a.id}>
                  {a.titleMr || a.titleEn}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab === "events" && events.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-maroon-950 block">
                {isEn ? "Choose Event Scope:" : "कार्यक्रमाची व्याप्ती निवडा:"}
              </label>
              <p className="text-[11px] text-gray-600">
                {isEn ? "Share all festival events or a single event flyer." : "सर्व कार्यक्रमांचे वेळापत्रक किंवा एका विशिष्ट कार्यक्रमाचे निमंत्रण निवडा."}
              </p>
            </div>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="p-2 text-xs font-bold rounded-xl border border-gold-400 bg-gold-50/50 text-maroon-950 focus:border-emerald-600 outline-none w-full sm:w-72"
            >
              <option value="all">
                {isEn ? `🎉 All Events Schedule (${events.length})` : `🎉 संपूर्ण कार्यक्रम वेळापत्रक (${events.length})`}
              </option>
              {events.map((ev) => (
                <option key={ev._id || ev.id} value={ev._id || ev.id}>
                  {ev.titleMr || ev.titleEn}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab === "newsletter" && (
          <div className="text-xs text-maroon-900">
            <span className="font-bold">
              {isEn ? "Today's Edition:" : "आजचा अंक:"}
            </span>{" "}
            {config?.newsletter?.edition || "दैनिक डिजिटल उत्सव बुलेटिन"} •{" "}
            <span className="font-bold">
              {isEn ? "Headline:" : "मथळा:"}
            </span>{" "}
            {config?.newsletter?.headline || "आजचा वृत्तांत"}
          </div>
        )}

        {activeTab === "rules" && (
          <div className="text-xs text-maroon-900">
            <span className="font-bold">
              {isEn ? "Official Society Rules:" : "अधिकृत सोसायटी नियमावली:"}
            </span>{" "}
            {config?.rules?.length || 0} {isEn ? "rules configured for resident safety and discipline." : "नियम रहिवाशांच्या शिस्तीसाठी व सुरक्षेसाठी समाविष्ट आहेत."}
          </div>
        )}
      </div>

      {/* Live WhatsApp Message Preview Container */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-maroon-950 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{isEn ? "Refined WhatsApp Preview (No typing needed):" : "तयार संदेश पूर्वावलोकन (टाईप करण्याची गरज नाही):"}</span>
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-gold-200 hover:bg-gold-300 text-maroon-950 transition cursor-pointer"
              title={isEn ? "Copy formatted message to clipboard" : "फॉरमॅट केलेला मजकूर क्लिपबोर्डवर कॉपी करा"}
            >
              {copiedKey === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-emerald-800">{isEn ? "Copied!" : "कॉपी केले!"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isEn ? "Copy Text" : "कॉपी करा"}</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-black px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition cursor-pointer active:scale-95"
              title={isEn ? "Instantly share on WhatsApp" : "थेट व्हॉट्सॲपवर पाठवा (फास्ट)"}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isEn ? "Share on WhatsApp" : "व्हॉट्सॲपवर पाठवा"}</span>
            </button>
          </div>
        </div>

        {/* WhatsApp-themed Chat Bubble Preview */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#ECE5DD] border-2 border-[#D1C7BD] shadow-inner font-sans">
          <div className="bg-[#E7FFDB] text-[#111B21] rounded-2xl p-4 shadow-sm border border-[#C6E6B8] max-w-2xl mx-auto space-y-2 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed font-sans select-all">
            {messageText}
          </div>
          <div className="text-center pt-2 text-[11px] text-gray-600 font-medium">
            {isEn 
              ? "Tip: Click 'Share to WhatsApp' to instantly broadcast to society WhatsApp groups, flats, or committee members." 
              : "टीप: 'व्हॉट्सॲपवर पाठवा' वर क्लिक केल्यास हा संदेश थेट व्हॉट्सॲप ग्रुप्स किंवा रहिवाशांना फॉरवर्ड करता येईल."}
          </div>
        </div>
      </div>
    </FestiveCard>
  );
};

export default WhatsAppBroadcastManager;
