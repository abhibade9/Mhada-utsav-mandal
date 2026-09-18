import React from "react";
import { Flame } from "lucide-react";
import { useConfig } from "../context/ConfigContext";
import { useLanguage } from "../context/LanguageContext";
import { getAllWingsLabel } from "../utils/wingUtils";

const DEFAULT_MESSAGES = [
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
];

const MarqueeTicker = ({ latestAnnouncement, onSelectAnnouncement, onOpenSidebar }) => {
  const { config } = useConfig();
  const { language } = useLanguage();

  // If master scroller is turned OFF by admin, hide completely (no empty blank bar)
  if (config?.marqueeActive === false) return null;

  // Retrieve messages from backend config or fallback to seed defaults
  const allMessages = Array.isArray(config?.scrollerMessages) && config.scrollerMessages.length > 0
    ? config.scrollerMessages
    : DEFAULT_MESSAGES;

  // Filter active messages including optional start/end scheduling
  const now = Date.now();
  const activeMessages = allMessages
    .filter(msg => {
      if (!msg.isActive) return false;
      if (msg.startDate) {
        const start = new Date(msg.startDate).getTime();
        if (!isNaN(start) && now < start) return false;
      }
      if (msg.endDate) {
        const end = new Date(msg.endDate).getTime();
        if (!isNaN(end) && now > end) return false;
      }
      return true;
    })
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  // If no messages are active, do not render an empty bar
  if (activeMessages.length === 0) return null;

  // Render content items helper so Track 1 and Track 2 are 100% mathematically identical
  const renderTickerContent = (keyPrefix = "track") => (
    <div className="flex shrink-0 items-center gap-4 sm:gap-6 pr-4 sm:pr-6 whitespace-nowrap text-xs sm:text-sm font-medium text-gold-100">
      {activeMessages.map((msg, idx) => {
        const displayText = language === "mr" 
          ? (msg.textMr || msg.text) 
          : (msg.textEn || msg.text);
        return (
          <React.Fragment key={`${keyPrefix}_${msg.id || idx}`}>
            <span className="hover:text-gold-300 transition-colors font-semibold">{displayText}</span>
            <span className="text-gold-400/80">❖</span>
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 border-b border-gold-500/40 shadow-inner py-1.5 sm:py-2 px-3">
      <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">

        {/* Left Badge with Animated Diya */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-gold-500 to-amber-500 text-maroon-950 font-bold px-2.5 sm:px-3 py-1 rounded-full text-xs shadow-md z-20">
          <Flame className="w-3.5 h-3.5 text-amber-900 animate-diya-flicker fill-amber-300" />
          <span className="hidden sm:inline font-heading">{language === "mr" ? "महत्वाचे अपडेट:" : "Important Update:"}</span>
          <span className="sm:hidden font-heading">{language === "mr" ? "अपडेट:" : "Update:"}</span>
        </div>

        {/* Marquee Content - Continuous Infinite Stream without Mouse Fluctuation */}
        <div
          className="relative flex-1 overflow-hidden group cursor-pointer"
          onClick={() => latestAnnouncement && onSelectAnnouncement && onSelectAnnouncement(latestAnnouncement)}
          title={latestAnnouncement ? (language === "mr" ? "तपशील पाहण्यासाठी क्लिक करा" : "Click to view details") : (language === "mr" ? "महत्वाचे अपडेट" : "Important Update")}
        >
          {/* Edge fade masks for smooth entrance/exit blend */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-maroon-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-maroon-950 to-transparent z-10 pointer-events-none" />

          {/* Seamless infinite double-track with hardware accelerated CSS animation */}
          <div className="flex w-max animate-marquee-continuous group-hover:[animation-play-state:paused]">
            {/* Track 1 */}
            {renderTickerContent("track1")}
            {/* Track 2 (exact clone for 100% seamless infinite loop with zero jump cuts) */}
            {renderTickerContent("track2")}
          </div>
        </div>

        {/* Action button if announcement clickable */}
        {latestAnnouncement && (
          <button
            onClick={() => onSelectAnnouncement && onSelectAnnouncement(latestAnnouncement)}
            className="flex-shrink-0 hidden md:inline-flex items-center text-[11px] text-gold-300 hover:text-white underline decoration-gold-400 font-semibold z-20"
          >
            {language === "mr" ? "पूर्ण वाचा →" : "Read More →"}
          </button>
        )}
      </div>
    </div>
  );
};

export default MarqueeTicker;
