import React, { useState, useEffect } from "react";
import { 
  Calendar, Sparkles, Building2, Users, Eye, Maximize2, X, Image as ImageIcon, Award
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";
import { 
  getWingsCount, 
  getWingCodesText, 
  getWingNamesText, 
  getAllWingsLabel 
} from "../utils/wingUtils";
import { getMediaUrl, handleImageError } from "../utils/mediaUrl";

export const TEN_DAYS_DATA = [];

const TenDaysSchedule = () => {
  const { language, t } = useLanguage();
  const { config } = useConfig();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // If schedule tab is disabled by admin, return null
  if (config?.tabs?.schedule && !config.tabs.schedule.enabled) {
    return null;
  }

  const cardData = config?.festivalScheduleCard || {};
  const wingsCount = getWingsCount(config);
  const wingsCodes = getWingCodesText(config, ", ");
  const wingsFullNames = getWingNamesText(config, language);

  const cleanStr = (val, fb) => (typeof val === "string" && val.trim() && !val.includes("??") && !val.includes("\ufffd") ? val : fb);

  const rawEventName = language === "mr" 
    ? cardData.eventNameMr
    : (cardData.eventNameEn || cardData.eventNameMr);
  const eventName = cleanStr(
    rawEventName,
    language === "mr" 
      ? `श्री गणेशोत्सव ${config?.festivalYear || "२०२६"} (१० दिवसीय भव्य सोहळा)` 
      : `Shree Ganeshotsav ${config?.festivalYear || "2026"} (10-Day Grand Celebration)`
  );

  const rawEventDesc = language === "mr"
    ? cardData.eventDescriptionMr
    : (cardData.eventDescriptionEn || cardData.eventDescriptionMr);
  const eventDesc = cleanStr(
    rawEventDesc,
    language === "mr"
      ? `म्हाडा टॉवर्स संकुलातील सर्व ${wingsCount} विंग्ज (${wingsFullNames}) संयुक्त विद्यमाने आयोजित १० दिवसीय अखंड गणेशोत्सव व सांस्कृतिक सोहळा.`
      : `10-day grand festival celebration and cultural programs organized jointly by all ${wingsCount} buildings (Wings ${wingsCodes}) of MHADA Towers.`
  );

  const rawPlanner = language === "mr"
    ? cardData.plannerMr
    : (cardData.plannerEn || cardData.plannerMr);
  const planner = cleanStr(
    rawPlanner,
    language === "mr"
      ? "म्हाडा टॉवर्स उत्सव मंडळ व मध्यवर्ती सोसायटी समिती"
      : "MHADA Towers Utsav Mandal & Central Society Committee"
  );

  const rawPlannerDetails = language === "mr"
    ? cardData.plannerDetailsMr
    : (cardData.plannerDetailsEn || cardData.plannerDetailsMr);
  const plannerDetails = cleanStr(
    rawPlannerDetails,
    language === "mr"
      ? `सर्व ${wingsCount} इमारतींचे विंग प्रमुख, महिला मंडळ व स्वयंसेवक दल (विंग ${wingsCodes})`
      : `All ${wingsCount} Building Wing Leads, Women's Wing & Volunteer Squad (Wings ${wingsCodes})`
  );

  const imageUrl = getMediaUrl(cardData.imageUrl || "");
  const imageCaption = language === "mr"
    ? (cardData.imageCaptionMr || "उत्सव वेळापत्रक व संपूर्ण कार्यक्रम रूपरेषा")
    : (cardData.imageCaptionEn || cardData.imageCaptionMr || "Festival Schedule & Complete Event Blueprint");

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsPhotoModalOpen(false);
      }
    };
    if (isPhotoModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPhotoModalOpen]);

  return (
    <section id="schedule" data-section="schedule-section" className="scroll-mt-20 my-6">
      <div className="bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EB] rounded-3xl border-2 border-gold-400 shadow-xl overflow-hidden p-4 sm:p-7 md:p-8">
        
        {/* Section Header with Rank #1 Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-gold-300/60">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-gradient-to-r from-amber-600 via-rose-700 to-amber-700 px-3 py-1 rounded-full border border-gold-400 shadow-sm animate-pulse">
                <Award className="w-3.5 h-3.5 text-gold-300" />
                <span>{language === "mr" ? "🏆 प्रथम प्राधान्य (Rank #1) | मुख्य उत्सव कार्यक्रम" : "🏆 Rank #1 Featured | Main Festival Event"}</span>
              </span>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-maroon-900 bg-gold-200/90 px-3 py-1 rounded-full border border-gold-400">
                <Calendar className="w-4 h-4 text-maroon-800" />
                <span>{t("festivalEventTitle")}</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-maroon-950 font-heading mt-1">
              {eventName}
            </h2>
            <p className="text-xs sm:text-sm text-maroon-800 font-medium mt-0.5">
              {t("festivalEventSubtitle")}
            </p>
          </div>
        </div>

        {/* Main Content Grid: Event & Planner Info (Left) + Photo View Option (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: What the Event actually is & Its Planner */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            
            {/* 1. What the actual event is */}
            <div className="bg-white rounded-2xl border-2 border-gold-300/80 p-5 sm:p-6 shadow-xs hover:border-gold-400 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gold-100 border border-gold-300 flex items-center justify-center text-maroon-900 flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-gold-100/80 px-2.5 py-0.5 rounded-md border border-gold-200 inline-block">
                    {t("whatIsEvent")}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-maroon-950 font-heading mt-1">
                    {eventName}
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium bg-amber-50/40 p-3.5 rounded-xl border border-amber-200/60">
                {eventDesc}
              </p>
            </div>

            {/* 2. Its Planner & Organizing Committee */}
            <div className="bg-white rounded-2xl border-2 border-gold-300/80 p-5 sm:p-6 shadow-xs hover:border-gold-400 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-maroon-900 border border-gold-400 flex items-center justify-center text-gold-300 flex-shrink-0">
                  <Users className="w-4 h-4 text-gold-300" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-maroon-900 bg-gold-200/70 px-2.5 py-0.5 rounded-md border border-gold-300 inline-block">
                    {t("eventPlanner")}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-maroon-950 font-heading mt-1">
                    {planner}
                  </h3>
                </div>
              </div>
              
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 via-white to-amber-50/60 border border-gold-300 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-maroon-900">
                  <Building2 className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                  <span>{plannerDetails}</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  {language === "mr" 
                    ? "सर्व धार्मिक विधी, महाआरती व्यवस्था व मोदक महाप्रसाद संयोजन मध्यवर्ती उत्सव समितीद्वारे केले जाईल." 
                    : "All holy rituals, Maha Aarti schedules and Mahaprasad arrangements are coordinated by the central committee."}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Photo View Option */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white rounded-2xl border-2 border-gold-400 p-5 sm:p-6 shadow-md flex flex-col justify-between h-full">
              
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gold-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gold-200 text-maroon-900 flex items-center justify-center border border-gold-400">
                    <ImageIcon className="w-4 h-4 text-maroon-900" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-maroon-950 font-heading">
                      {language === "mr" ? "उत्सव वेळापत्रक फोटो" : "Festival Schedule Photo"}
                    </h4>
                    <span className="text-[11px] text-stone-500 font-medium">
                      {imageCaption}
                    </span>
                  </div>
                </div>

                {imageUrl && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {language === "mr" ? "उपलब्ध" : "Available"}
                  </span>
                )}
              </div>

              {/* Photo Preview Container */}
              {imageUrl ? (
                <div className="space-y-4">
                  <div 
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="relative rounded-xl overflow-hidden border-2 border-gold-300 shadow-sm cursor-pointer group bg-stone-900 max-h-64 sm:max-h-72 flex items-center justify-center"
                    title={t("clickToEnlarge")}
                  >
                    <img 
                      src={imageUrl} 
                      alt={eventName} 
                      onError={handleImageError}
                      className="w-full h-56 sm:h-64 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-all flex items-center justify-center">
                      <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform bg-maroon-900/90 text-gold-200 px-4 py-2 rounded-xl border border-gold-400/80 shadow-lg flex items-center gap-2 text-xs font-bold backdrop-blur-xs">
                        <Eye className="w-4 h-4 text-gold-300" />
                        <span>{t("openPhotoModal")}</span>
                        <Maximize2 className="w-3.5 h-3.5 text-gold-300/80" />
                      </div>
                    </div>
                  </div>

                  {/* Prominent View Photo Action Button */}
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-maroon-900 via-maroon-850 to-maroon-900 hover:from-maroon-850 hover:to-maroon-800 text-gold-200 border-2 border-gold-400 shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-gold-300" />
                    <span>{t("viewSchedulePhoto")}</span>
                    <Maximize2 className="w-3.5 h-3.5 text-gold-300" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-amber-50/50 rounded-xl border-2 border-dashed border-gold-300 my-auto">
                  <div className="w-14 h-14 rounded-2xl bg-gold-100 border border-gold-300 flex items-center justify-center text-maroon-800 mb-3 shadow-2xs">
                    <ImageIcon className="w-7 h-7 text-amber-700" />
                  </div>
                  <h5 className="text-sm font-black text-maroon-950 font-heading mb-1">
                    {language === "mr" ? "वेळापत्रक फोटो लवकरच येत आहे" : "Schedule Photo Coming Soon"}
                  </h5>
                  <p className="text-xs text-stone-600 max-w-xs leading-relaxed">
                    {t("noPhotoAvailable")}
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Pop-Up Image Modal with Single Close Button */}
      {isPhotoModalOpen && imageUrl && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-fadeIn"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div 
            className="relative max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Single Close Button (Prominent Floating Circular Close Button) */}
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(false)}
              aria-label={t("singleCloseBtn")}
              className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 z-20 w-11 h-11 sm:w-12 sm:h-12 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-full flex items-center justify-center shadow-2xl border-2 border-white transition-transform transform hover:scale-110 cursor-pointer"
              title={t("singleCloseBtn")}
            >
              <X className="w-6 h-6 stroke-[3]" />
            </button>

            {/* High-Resolution Display Image */}
            <div className="w-full flex justify-center overflow-hidden rounded-2xl border-2 border-gold-400/90 shadow-2xl bg-black/60">
              <img 
                src={imageUrl} 
                alt={eventName} 
                onError={handleImageError}
                className="max-w-full max-h-[82vh] object-contain rounded-2xl"
              />
            </div>

            {/* Bottom Bar with Caption and Single Close Button */}
            <div className="mt-3 w-full flex items-center justify-between px-2 text-white">
              <div className="truncate pr-4">
                <span className="text-xs sm:text-sm font-bold text-gold-300 block truncate">
                  {eventName}
                </span>
                <span className="text-[11px] text-gray-300 hidden sm:block truncate">
                  {imageCaption}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="flex-shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md border border-white/40 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t("singleCloseBtn")}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};

export default TenDaysSchedule;
