import React, { useState, useEffect, useMemo } from "react";
import { 
  Newspaper, Building, Flame, ShieldCheck, 
  Sparkles, Clock, Calendar, Check, Copy, 
  UserCheck, UtensilsCrossed, Trophy, Megaphone,
  Car, Info, Music
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";
import { formatNewsletterBroadcast, copyToClipboard } from "../utils/whatsappFormatter";
import { getWingsCount, getAllWingsLabel } from "../utils/wingUtils";
import { 
  getKolkataDate, 
  calculateFestivalDay, 
  addDaysToDateStr, 
  diffInDays, 
  formatKolkataDateString, 
  toMarathiNumeral 
} from "../utils/aartiDateUtils";

// Category icon and festive styling mapping
const getCategoryMeta = (category) => {
  switch (category?.toLowerCase()) {
    case "aarti":
      return { icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", labelMr: "महाआरती", labelEn: "Aarti" };
    case "host":
      return { icon: Building, color: "text-gold-400", bg: "bg-amber-500/10", border: "border-gold-500/30", labelMr: "यजमान", labelEn: "Host" };
    case "prasad":
      return { icon: UtensilsCrossed, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", labelMr: "प्रसाद", labelEn: "Prasad" };
    case "event":
      return { icon: Calendar, color: "text-gold-300", bg: "bg-gold-500/10", border: "border-gold-500/30", labelMr: "कार्यक्रम", labelEn: "Event" };
    case "cultural":
      return { icon: Music, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", labelMr: "सांस्कृतिक", labelEn: "Cultural" };
    case "competition":
      return { icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", labelMr: "स्पर्धा", labelEn: "Competition" };
    case "announcement":
      return { icon: Megaphone, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", labelMr: "सूचना", labelEn: "Notice" };
    case "parking":
      return { icon: Car, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30", labelMr: "पार्किंग", labelEn: "Parking" };
    case "safety":
      return { icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", labelMr: "सुरक्षा", labelEn: "Safety" };
    default:
      return { icon: Info, color: "text-gold-300", bg: "bg-gold-500/10", border: "border-gold-500/30", labelMr: "माहिती", labelEn: "Info" };
  }
};

const DailyNewsletter = ({ onOpenUpcomingCalendar }) => {
  const { language, t } = useLanguage();
  const { config } = useConfig();
  const [copied, setCopied] = useState(false);

  // 1. Master ON/OFF check: if disabled by admin, return null (completely hidden, no empty container)
  if (config?.tabs?.newsletter?.enabled === false || config?.newsletter?.enabled === false) {
    return null;
  }

  const nl = config?.newsletter || {};
  const startDate = nl.startDate || "2026-09-07";
  const endDate = nl.endDate || "2026-09-16";
  const showSelectDay = nl.showSelectDay !== false;
  const showTodayBadge = nl.showTodayBadge !== false;
  const showCurrentDay = nl.showCurrentDay !== false;

  const wingsCount = getWingsCount(config);
  const allWingsLabel = getAllWingsLabel(config, language);

  // 2. Automatic Date / Day calculation in Asia/Kolkata timezone
  const todayKolkata = getKolkataDate();
  const festivalInfo = calculateFestivalDay(startDate, endDate, todayKolkata);
  const totalDays = festivalInfo.totalDays > 0 ? festivalInfo.totalDays : 10;
  const activeFestivalDay = festivalInfo.status === "active" ? festivalInfo.currentDay : null;

  // 3. Resolve Dynamic Days list for the configured period
  const resolvedDays = useMemo(() => {
    const rawDays = (nl.days && Array.isArray(nl.days) && nl.days.length > 0)
      ? nl.days.filter(d => d && d.isActive !== false)
      : (config?.dailyAartiSchedule || config?.tenDaysAartiSchedule || []);

    const daysCount = totalDays > 0 ? totalDays : (rawDays.length > 0 ? rawDays.length : 10);
    const result = [];
    const templateDay = rawDays[0] || {};

    for (let n = 1; n <= daysCount; n++) {
      const dayDateStr = addDaysToDateStr(startDate, n - 1);
      const shortDateEn = formatKolkataDateString(dayDateStr, "en", false);
      const fullDateEn = formatKolkataDateString(dayDateStr, "en", true);
      const shortDateMr = formatKolkataDateString(dayDateStr, "mr", false);
      const fullDateMr = formatKolkataDateString(dayDateStr, "mr", true);
      const nMr = toMarathiNumeral(n);

      const existing = rawDays.find(d => Number(d.dayNumber) === n) 
        || (rawDays.length === 1 ? rawDays[0] : (rawDays[n - 1] || templateDay));

      const isToday = (activeFestivalDay !== null && activeFestivalDay === n);
      const festivalNameEn = nl.festivalName || "Ganesh Utsav";
      const festivalNameMr = nl.festivalNameMr || "गणेश उत्सव";

      result.push({
        ...existing,
        id: existing.id || `day_${n}`,
        dayNumber: n,
        isCurrentDay: isToday,
        dateStr: shortDateEn,
        dateStrEn: fullDateEn,
        dateStrMr: fullDateMr,
        festivalDayLabel: `Day ${n} (${festivalNameEn} - ${shortDateEn})`,
        festivalDayLabelMr: `दिवस ${nMr} (${festivalNameMr} - ${shortDateMr})`,
        headline: existing.headline || nl.headline || "Ganpati Festival Live",
        headlineMr: existing.headlineMr || nl.headlineMr || "गणपती उत्सव थेट (लाइव्ह)",
        subtitle: existing.subtitle || nl.subtitle || `All ${wingsCount} wings are participated`,
        subtitleMr: existing.subtitleMr || nl.subtitleMr || `सर्व ${wingsCount} इमारतींचा संयुक्त सहभाग`,
        blocks: (existing.blocks && existing.blocks.length > 0) ? existing.blocks : (templateDay.blocks || [])
      });
    }
    return result;
  }, [startDate, endDate, totalDays, activeFestivalDay, nl.days, nl.festivalName, nl.festivalNameMr, nl.headline, nl.headlineMr, nl.subtitle, nl.subtitleMr, config?.dailyAartiSchedule, wingsCount]);

  // Default selected day index: matches current active day, or 0 if upcoming / concluded
  const defaultIdx = useMemo(() => {
    if (activeFestivalDay !== null) {
      const foundIdx = resolvedDays.findIndex(d => d.dayNumber === activeFestivalDay);
      if (foundIdx !== -1) return foundIdx;
    }
    return 0;
  }, [activeFestivalDay, resolvedDays]);

  const [selectedDayIdx, setSelectedDayIdx] = useState(defaultIdx);

  // Auto-sync selected day when activeFestivalDay or period changes
  useEffect(() => {
    setSelectedDayIdx(defaultIdx);
  }, [defaultIdx]);

  const activeDay = resolvedDays[selectedDayIdx] || resolvedDays[defaultIdx] || resolvedDays[0] || {};
  const dayNum = activeDay.dayNumber || (selectedDayIdx + 1);

  // 4. Dynamic Header & General Values
  const bulletinTitle = language === "mr"
    ? (nl.bulletinTitleMr || nl.bulletinTitle || "दैनिक डिजिटल वृत्तपत्र")
    : (nl.bulletinTitle || "DAILY DIGITAL BULLETIN");

  const eventDuration = language === "mr"
    ? (nl.eventDurationMr || nl.eventDuration || `${toMarathiNumeral(totalDays)} दिवसीय सोहळा`)
    : (nl.eventDuration || `${totalDays} day event`);

  // Resolve header day label based on festival status
  let dynamicDayLabel = "";
  if (festivalInfo.status === "upcoming") {
    const daysUntil = festivalInfo.daysUntil || 1;
    const startFormatted = formatKolkataDateString(startDate, language === "mr" ? "mr" : "en", false);
    dynamicDayLabel = language === "mr"
      ? `आगामी • ${startFormatted} पासून (${toMarathiNumeral(daysUntil)} दिवसांत सुरू)`
      : `Upcoming • Starts ${startFormatted} (in ${daysUntil} ${daysUntil === 1 ? "day" : "days"})`;
  } else if (festivalInfo.status === "concluded") {
    dynamicDayLabel = language === "mr"
      ? "उत्सव सांगता संपन्न"
      : "Festival Concluded";
  } else {
    // Active festival period
    dynamicDayLabel = language === "mr"
      ? (activeDay.festivalDayLabelMr || `दिवस ${toMarathiNumeral(dayNum)}`)
      : (activeDay.festivalDayLabel || `Day ${dayNum}`);
  }

  const dayLabel = showCurrentDay
    ? dynamicDayLabel
    : (language === "mr" ? (activeDay.festivalDayLabelMr || `दिवस ${toMarathiNumeral(dayNum)}`) : (activeDay.festivalDayLabel || `Day ${dayNum}`));

  const headline = language === "mr"
    ? (activeDay.headlineMr || activeDay.headline || nl.headlineMr || nl.headline || activeDay.tithi || "गणपती उत्सव थेट (लाइव्ह)")
    : (activeDay.headline || activeDay.headlineMr || nl.headline || activeDay.tithiEn || activeDay.tithi || "Ganpati Festival Live");

  const summary = language === "mr"
    ? (activeDay.subtitleMr || activeDay.subtitle || nl.subtitleMr || nl.subtitle || activeDay.morningRitual || `सर्व ${wingsCount} विंग्समधील रहिवाशांचे हार्दिक स्वागत!`)
    : (activeDay.subtitle || activeDay.subtitleMr || nl.subtitle || activeDay.morningRitualEn || activeDay.morningRitual || `All ${wingsCount} wings are participated`);

  const safetyTip = language === "mr"
    ? (nl.safetyTipMr || nl.safetyTip || "कृपया वाहने नियुक्त पार्किंगमध्येच लावावीत. संकुल २४x७ सीसीटीव्ही निगराणीखाली आहे.")
    : (nl.safetyTip || "Please park vehicles only in designated spots.");

  const displayStyle = nl.displayStyle || "classic";

  // 4. Resolve Information Blocks for Active Day
  let activeBlocks = [];
  if (Array.isArray(activeDay.blocks) && activeDay.blocks.length > 0) {
    const now = new Date();
    activeBlocks = activeDay.blocks
      .filter((b) => {
        if (b.isActive === false) return false;
        if (b.endTime) {
          const endD = new Date(b.endTime);
          if (!isNaN(endD) && endD < now) return false;
        }
        if (b.startTime) {
          const startD = new Date(b.startTime);
          if (!isNaN(startD) && startD > now) return false;
        }
        return true;
      })
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  } else {
    // Backwards-compatible synthesis matching the screenshot
    const morningTime = language === "mr" ? (activeDay.morningTime || "सकाळी ०८:३०") : (activeDay.morningTimeEn || activeDay.morningTime || "08:30 AM");
    const morningRitual = language === "mr" ? (activeDay.morningRitual || "मूर्ती प्राणप्रतिष्ठा पूजा व महाआरती") : (activeDay.morningRitualEn || activeDay.morningRitual || "Murti Pranpratishtha Pooja & Maha Aarti");
    const eveningTime = language === "mr" ? (activeDay.eveningTime || "रात्री ०७:३०") : (activeDay.eveningTimeEn || activeDay.eveningTime || "07:30 PM");
    const eveningRitual = language === "mr" ? (activeDay.eveningRitual || "धूप आरती, सामूहिक अथर्वशीर्ष पठण व महाआरती") : (activeDay.eveningRitualEn || activeDay.eveningRitual || "Dhupaarti, Atharvashirsha & Maha Aarti");
    const hostWing = language === "mr" ? (activeDay.hostWing || nl.todaysHostWing || allWingsLabel) : (activeDay.hostWingEn || activeDay.hostWing || nl.todaysHostWing || allWingsLabel);
    const hostLead = language === "mr" ? (activeDay.hostLead || "सर्व कमिटी सदस्य व ज्येष्ठ नागरिक") : (activeDay.hostLeadEn || activeDay.hostLead || "All Committee Members & Senior Residents");

    activeBlocks = [
      {
        id: "synth_aarti",
        category: "aarti",
        title: language === "mr" ? "दैनिक महाआरती व विंग यजमान" : "DAILY MAHA AARTI & HOST WINGS",
        subtitle: morningRitual,
        items: [
          {
            label: language === "mr" ? "सकाळची महाआरती:" : "Morning Maha Aarti:",
            time: morningTime,
            desc: morningRitual
          },
          {
            label: language === "mr" ? "संध्याकाळची महाआरती:" : "Evening Maha Aarti:",
            time: eveningTime,
            desc: eveningRitual
          }
        ],
        isActive: true,
        order: 1
      },
      {
        id: "synth_host",
        category: "host",
        title: language === "mr" ? "यजमान इमारत" : "HOST BUILDING",
        subtitle: hostWing,
        description: hostLead,
        hostCoordinator: hostLead,
        isActive: true,
        order: 2
      }
    ];
  }

  // Handle Copy Bulletin to Clipboard
  const handleCopyBulletin = async () => {
    const formatted = formatNewsletterBroadcast(nl, config, activeDay);
    const ok = await copyToClipboard(formatted);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // -------------------------------------------------------------
  // DISPLAY STYLES RENDERING
  // -------------------------------------------------------------

  // Render Display Style 1 — CLASSIC CARDS (Exact match to screenshot with expansion)
  const renderClassicCards = () => {
    const gridCols = activeBlocks.length <= 2 
      ? "grid-cols-1 md:grid-cols-2" 
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

    return (
      <div className={`grid ${gridCols} gap-2.5 sm:gap-3 text-xs`}>
        {activeBlocks.map((blk, idx) => {
          const meta = getCategoryMeta(blk.category);
          const IconComp = meta.icon;
          const title = (language === "mr" && blk.titleMr) ? blk.titleMr : (blk.title || meta.labelEn);
          const subtitle = (language === "mr" && blk.subtitleMr) ? blk.subtitleMr : (blk.subtitle || "");
          const desc = (language === "mr" && blk.descriptionMr) ? blk.descriptionMr : (blk.description || "");
          const time = (language === "mr" && blk.timeMr) ? blk.timeMr : (blk.time || "");
          const coordinator = (language === "mr" && blk.hostCoordinatorMr) ? blk.hostCoordinatorMr : (blk.hostCoordinator || "");

          return (
            <div 
              key={blk.id || idx}
              className="bg-maroon-950/80 rounded-xl p-3 border border-gold-500/30 flex flex-col justify-between shadow-sm hover:border-gold-400 transition"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-1.5 text-gold-300 font-bold mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <IconComp className={`w-4 h-4 ${meta.color} ${blk.category === "aarti" ? "animate-diya" : ""}`} />
                    <span className="uppercase tracking-wide text-[11px] font-extrabold">{title}</span>
                  </div>
                  {blk.badge && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-200 border border-gold-400/40">
                      {blk.badge}
                    </span>
                  )}
                </div>

                {/* Card Body: Multi-row Aarti or General items */}
                {Array.isArray(blk.items) && blk.items.length > 0 ? (
                  <div className="space-y-1 text-gold-100/90">
                    {blk.items.map((item, itmIdx) => {
                      const itemLabel = (language === "mr" && item.labelMr) ? item.labelMr : (item.label || "");
                      const itemTime = (language === "mr" && item.timeMr) ? item.timeMr : (item.time || "");
                      const itemDesc = (language === "mr" && item.descMr) ? item.descMr : (item.desc || "");

                      return (
                        <div key={item.id || itmIdx} className={itmIdx > 0 ? "pt-1 border-t border-gold-500/20" : ""}>
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-gold-300 font-semibold">{itemLabel}</span>
                            {itemTime && (
                              <span className="font-bold text-white whitespace-nowrap">{itemTime}</span>
                            )}
                          </div>
                          {itemDesc && (
                            <div className="text-[11px] text-gold-200/70 truncate" title={itemDesc}>
                              {itemDesc}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {subtitle && (
                      <div className="font-extrabold text-white text-xs sm:text-sm text-gold-100">
                        {subtitle}
                      </div>
                    )}
                    {time && (
                      <div className="flex items-center gap-1 text-[11px] text-gold-300 font-semibold">
                        <Clock className="w-3 h-3 text-gold-400 flex-shrink-0" />
                        <span>{time}</span>
                      </div>
                    )}
                    {desc && desc !== subtitle && (
                      <div className="text-[11px] text-gold-200/70 line-clamp-2" title={desc}>
                        {desc}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer / Coordinator line */}
              {coordinator && (
                <div className="flex items-center gap-1 text-[11px] text-amber-200/90 pt-1 mt-2 border-t border-gold-500/20">
                  <UserCheck className="w-3 h-3 text-gold-400 flex-shrink-0" />
                  <span className="truncate" title={coordinator}>{coordinator}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render Display Style 2 — TIMELINE / SCHEDULE (Chronological festive view)
  const renderTimeline = () => {
    return (
      <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-gold-400 before:via-amber-500 before:to-gold-400/20">
        {activeBlocks.map((blk, idx) => {
          const meta = getCategoryMeta(blk.category);
          const IconComp = meta.icon;
          const title = (language === "mr" && blk.titleMr) ? blk.titleMr : (blk.title || meta.labelEn);
          const subtitle = (language === "mr" && blk.subtitleMr) ? blk.subtitleMr : (blk.subtitle || "");
          const desc = (language === "mr" && blk.descriptionMr) ? blk.descriptionMr : (blk.description || "");
          const time = (language === "mr" && blk.timeMr) ? blk.timeMr : (blk.time || "");

          return (
            <div key={blk.id || idx} className="relative group">
              {/* Timeline Glowing Node */}
              <div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full bg-gold-400 border-2 border-maroon-950 shadow-xs flex items-center justify-center ring-2 ring-gold-400/30" />

              <div className="bg-maroon-950/85 rounded-xl p-3 border border-gold-500/30 hover:border-gold-400 transition shadow-sm text-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <IconComp className={`w-3.5 h-3.5 ${meta.color}`} />
                    <span className="font-extrabold text-gold-200 text-xs sm:text-sm">{title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {time && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-maroon-950 bg-gold-400 px-2 py-0.5 rounded-full shadow-xs">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{time}</span>
                      </span>
                    )}
                    {blk.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-200 border border-gold-400/30">
                        {blk.badge}
                      </span>
                    )}
                  </div>
                </div>

                {Array.isArray(blk.items) && blk.items.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {blk.items.map((it, iIdx) => (
                      <div key={iIdx} className="bg-maroon-900/60 p-2 rounded-lg border border-gold-500/20">
                        <div className="flex items-center justify-between gap-1 text-gold-300 font-bold text-[11px]">
                          <span>{it.label}</span>
                          <span className="text-white font-black">{it.time}</span>
                        </div>
                        {it.desc && <p className="text-[10px] text-gold-100/70 mt-0.5 truncate">{it.desc}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {subtitle && <p className="text-xs font-bold text-gold-100">{subtitle}</p>}
                    {desc && desc !== subtitle && <p className="text-[11px] text-gold-200/80 mt-0.5 leading-relaxed">{desc}</p>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Display Style 3 — INFORMATION GRID (Multi-column symmetrical cards)
  const renderInformationGrid = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        {activeBlocks.map((blk, idx) => {
          const meta = getCategoryMeta(blk.category);
          const IconComp = meta.icon;
          const title = (language === "mr" && blk.titleMr) ? blk.titleMr : (blk.title || meta.labelEn);
          const subtitle = (language === "mr" && blk.subtitleMr) ? blk.subtitleMr : (blk.subtitle || "");
          const desc = (language === "mr" && blk.descriptionMr) ? blk.descriptionMr : (blk.description || "");
          const time = (language === "mr" && blk.timeMr) ? blk.timeMr : (blk.time || "");

          return (
            <div 
              key={blk.id || idx}
              className="bg-maroon-950/80 rounded-xl p-3 border border-gold-500/30 flex flex-col justify-between hover:border-gold-400 transition shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-gold-500/20">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-gold-400/10 border border-gold-400/30">
                      <IconComp className={`w-3.5 h-3.5 ${meta.color}`} />
                    </span>
                    <span className="font-extrabold text-gold-200 text-xs uppercase tracking-wider">{title}</span>
                  </div>
                  {time && (
                    <span className="text-[10px] font-bold text-gold-300 bg-maroon-900 px-2 py-0.5 rounded border border-gold-500/30">
                      {time}
                    </span>
                  )}
                </div>

                {Array.isArray(blk.items) && blk.items.length > 0 ? (
                  <div className="space-y-1">
                    {blk.items.map((it, iIdx) => (
                      <div key={iIdx} className="text-[11px] flex items-baseline justify-between gap-1 text-gold-100/90">
                        <span className="font-semibold text-gold-300">{it.label}</span>
                        <span className="font-bold text-white">{it.time}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {subtitle && <p className="font-bold text-white text-xs">{subtitle}</p>}
                    {desc && <p className="text-[11px] text-gold-200/80 mt-1 leading-relaxed">{desc}</p>}
                  </div>
                )}
              </div>

              {blk.badge && (
                <div className="mt-2 pt-1 border-t border-gold-500/20 text-right">
                  <span className="text-[9px] uppercase font-black text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded">
                    {blk.badge}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render Display Style 4 — BULLETIN / ANNOUNCEMENT (High-density program schedule & notices)
  const renderBulletinBoard = () => {
    return (
      <div className="space-y-3 text-xs">
        {/* Top Program Summary Banner */}
        <div className="bg-maroon-950/90 rounded-xl p-3 border border-gold-500/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between border-b border-gold-500/30 pb-1.5">
            <span className="text-xs font-black uppercase text-gold-300 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-festive-saffron" />
              <span>{language === "mr" ? "आजची संपूर्ण कार्यक्रम रूपरेषा" : "TODAY'S PROGRAM & HIGHLIGHTS"}</span>
            </span>
            <span className="text-[10px] text-gold-300/80 font-semibold">{dayLabel}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            {activeBlocks.map((blk, idx) => {
              const meta = getCategoryMeta(blk.category);
              const IconComp = meta.icon;
              const title = (language === "mr" && blk.titleMr) ? blk.titleMr : (blk.title || meta.labelEn);
              const subtitle = (language === "mr" && blk.subtitleMr) ? blk.subtitleMr : (blk.subtitle || "");
              const time = (language === "mr" && blk.timeMr) ? blk.timeMr : (blk.time || "");

              return (
                <div key={blk.id || idx} className="flex items-start gap-2 bg-maroon-900/50 p-2 rounded-lg border border-gold-500/20">
                  <IconComp className={`w-3.5 h-3.5 ${meta.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="font-extrabold text-gold-200 truncate">{title}</span>
                      {time && <span className="font-black text-gold-400 whitespace-nowrap text-[10px]">{time}</span>}
                    </div>
                    {subtitle && <p className="text-[10px] text-gold-100/80 truncate mt-0.5">{subtitle}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Announcements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {activeBlocks.filter(b => b.description || (b.items && b.items.length > 0)).map((blk, idx) => {
            const title = (language === "mr" && blk.titleMr) ? blk.titleMr : (blk.title || "Announcement");
            const desc = (language === "mr" && blk.descriptionMr) ? blk.descriptionMr : (blk.description || "");

            return (
              <div key={idx} className="border-l-4 border-gold-400 bg-maroon-950/70 p-2.5 rounded-r-xl border-y border-r border-gold-500/20">
                <span className="font-extrabold text-gold-200 text-xs block">{title}</span>
                {Array.isArray(blk.items) && blk.items.length > 0 ? (
                  <ul className="mt-1 space-y-0.5 text-[11px] text-gold-100/90 list-disc list-inside">
                    {blk.items.map((it, itIdx) => (
                      <li key={itIdx} className="truncate">
                        <span className="font-semibold text-gold-300">{it.label}</span> {it.time && <span className="font-bold text-white">— {it.time}</span>} {it.desc && <span className="text-gold-200/70">({it.desc})</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-gold-100/85 mt-0.5 leading-relaxed">{desc}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section id="newsletter" className="w-full bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-white py-4 sm:py-5 px-3 sm:px-6 border-y-2 border-gold-400 shadow-xl relative overflow-hidden">
      {/* Subtle festive background illumination */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-festive-saffron/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-4">
        
        {/* Row 1: Header Badge, Edition, Date & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gold-500/30">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-maroon-950 bg-gradient-to-r from-gold-400 to-amber-400 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              <Newspaper className="w-3.5 h-3.5 text-maroon-950" />
              <span>{bulletinTitle}</span>
            </span>

            <span className="text-xs sm:text-sm font-extrabold text-gold-200">
              {eventDuration}
            </span>

            <span className="text-xs text-gold-300/80 font-medium">
              • {dayLabel}
            </span>

            {showTodayBadge && activeDay.isCurrentDay && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                {language === "mr" ? "आजचा दिवस (Today)" : "Today's Day"}
              </span>
            )}
          </div>

          {/* Copy Button */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              onClick={handleCopyBulletin}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-maroon-850 hover:bg-maroon-800 border border-gold-500/40 text-gold-200 text-xs font-semibold transition active:scale-95 cursor-pointer shadow-xs"
              title="वृत्तपत्र मजकूर कॉपी करा"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">{language === "mr" ? "कॉपी झाले!" : "Copied!"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gold-300" />
                  <span>{language === "mr" ? "कॉपी" : "Copy"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Main Headline & Subheadline */}
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-black text-gold-200 font-heading leading-snug flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-festive-saffron flex-shrink-0" />
            <span>{headline}</span>
          </h2>
          {summary && (
            <p className="text-xs sm:text-sm text-gold-100/90 mt-1 font-medium leading-relaxed pl-6">
              {summary}
            </p>
          )}
        </div>

        {/* Row 3: Dynamic Content Display based on Admin Display Style */}
        {displayStyle === "timeline" && renderTimeline()}
        {displayStyle === "grid" && renderInformationGrid()}
        {displayStyle === "bulletin" && renderBulletinBoard()}
        {displayStyle !== "timeline" && displayStyle !== "grid" && displayStyle !== "bulletin" && renderClassicCards()}

        {/* Row 4: Dynamic Day Quick Selector & Safety Notice */}
        <div className={`pt-2 flex flex-col md:flex-row md:items-center ${showSelectDay ? "justify-between" : "justify-end"} gap-3 text-xs border-t border-gold-500/20`}>
          
          {/* Day Selector Pills (Admin ON/OFF control) */}
          {showSelectDay && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <span className="text-[11px] font-bold text-gold-300 whitespace-nowrap mr-1">
                {language === "mr" ? "दिवस निवडा:" : "Select Day:"}
              </span>
              {resolvedDays.map((item, idx) => {
                const isSelected = idx === selectedDayIdx;
                const isCurrent = item.isCurrentDay;
                const dNum = item.dayNumber || (idx + 1);
                const dNumDisplay = language === "mr" ? toMarathiNumeral(dNum) : dNum;

                return (
                  <button
                    key={item.id || idx}
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? "bg-gold-400 text-maroon-950 border-gold-300 shadow-md font-black"
                        : "bg-maroon-950/70 text-gold-200 hover:bg-maroon-850 border-gold-500/30"
                    }`}
                    title={`${item.dateStr || `Day ${dNum}`} - ${item.festivalDayLabel || item.headline || ""}`}
                  >
                    <span>{t("day")} {dNumDisplay}</span>
                    {showTodayBadge && isCurrent && (
                      <span className="ml-1 text-[9px] px-1 py-0.2 rounded-full font-black bg-red-600 text-white">
                        {language === "mr" ? "आज" : "Today"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Safety Tip Pill */}
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate max-w-xs sm:max-w-md">{safetyTip}</span>
          </div>

        </div>

      </div>
    </section>
  );
};

export default DailyNewsletter;
