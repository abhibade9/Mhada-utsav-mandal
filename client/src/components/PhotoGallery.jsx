import React, { useState, useEffect } from "react";
import { 
  Image as ImageIcon, Sparkles, X, 
  Eye, Calendar, ZoomIn, ChevronLeft, ChevronRight,
  Layers, Camera
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";
import { getMediaUrl, handleImageError } from "../utils/mediaUrl";

export const PAST_PHOTOS_DATA = [];

const PhotoGallery = () => {
  const { language, t } = useLanguage();
  const { config } = useConfig();
  const isEn = language === "en";

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeFestival, setActiveFestival] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // If gallery tab is disabled by admin, return null
  if (config?.tabs?.gallery && !config.tabs.gallery.enabled) {
    return null;
  }

  const rawGalleryList = config?.gallery || [];
  if (rawGalleryList.length === 0) {
    return null;
  }

  // Normalize festival objects for rock-solid backward compatibility
  const normalizedFestivals = rawGalleryList.map((item, idx) => {
    const banner = item.bannerUrl || item.imageUrl || (Array.isArray(item.photos) && item.photos[0]?.url) || "";
    const photos = Array.isArray(item.photos)
      ? item.photos.map((p, pIdx) => ({
          id: p.id || `p_${pIdx + 1}`,
          url: p.url || p.imageUrl || "",
          captionMr: p.captionMr || p.titleMr || "",
          captionEn: p.captionEn || p.titleEn || "",
          order: Number(p.order) || pIdx + 1
        })).filter(p => Boolean(p.url))
      : (item.imageUrl ? [{ id: "p_1", url: item.imageUrl, captionMr: item.titleMr || "", captionEn: item.titleEn || "", order: 1 }] : []);

    return {
      id: item.id || `fest_${idx + 1}`,
      titleMr: item.titleMr || item.nameMr || "उत्सव छायाचित्रे",
      titleEn: item.titleEn || item.nameEn || "Festival Gallery",
      nameMr: item.nameMr || item.titleMr || "उत्सव छायाचित्रे",
      nameEn: item.nameEn || item.titleEn || "Festival Gallery",
      category: item.category || "महाआरती",
      categoryEn: item.categoryEn || "Maha Aarti",
      year: item.year || config?.festivalYear || "२०२६",
      yearEn: item.yearEn || "2026",
      descMr: item.descMr || "",
      descEn: item.descEn || "",
      bannerUrl: banner,
      imageUrl: banner,
      accentColor: item.accentColor || "from-amber-700 to-maroon-900",
      photos,
      isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
      order: Number(item.order) || idx + 1
    };
  });

  // Only show active (published) festivals on public homepage
  const activeFestivals = normalizedFestivals
    .filter((f) => f.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (activeFestivals.length === 0) {
    return null;
  }

  // Generate category filter pills
  const categories = [
    { id: "all", labelMr: "सर्व फोटो", labelEn: "All Photos" },
    ...Array.from(new Set(activeFestivals.map((p) => p.category).filter(Boolean))).map((cat) => ({
      id: cat,
      labelMr: cat,
      labelEn: activeFestivals.find((p) => p.category === cat)?.categoryEn || cat
    }))
  ];

  const filteredFestivals = selectedCategory === "all"
    ? activeFestivals
    : activeFestivals.filter((p) => p.category === selectedCategory);

  // Keyboard navigation for photo lightbox
  useEffect(() => {
    if (lightboxIndex === null || !activeFestival) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : activeFestival.photos.length - 1));
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev < activeFestival.photos.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, activeFestival]);

  const activePhotoItem = (activeFestival && lightboxIndex !== null && activeFestival.photos[lightboxIndex]) 
    ? activeFestival.photos[lightboxIndex] 
    : null;

  return (
    <section id="gallery-section" className="scroll-mt-20 my-8">
      {/* Anchor tag for backward compatibility with id="gallery" */}
      <span id="gallery" className="block -mt-20 pt-20 invisible pointer-events-none" />

      <div className="bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EB] rounded-3xl border-2 border-gold-400 shadow-xl overflow-hidden p-4 sm:p-7 md:p-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-gold-300/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-maroon-900 bg-gold-200/90 px-3 py-1 rounded-full border border-gold-400">
              <ImageIcon className="w-4 h-4 text-maroon-800" />
              <span>{t("galleryTitle")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-maroon-950 font-heading mt-1.5">
              {language === "mr" ? "मागील उत्सवांची अविस्मरणीय छायाचित्रे" : "Past Festival Moments & Photo Gallery"}
            </h2>
            <p className="text-xs sm:text-sm text-maroon-800 font-medium">
              {t("gallerySubtitle")}
            </p>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-maroon-850 text-gold-200 border-gold-500 shadow-sm"
                      : "bg-white text-maroon-900 hover:bg-gold-100 border-gold-300"
                  }`}
                >
                  {language === "mr" ? cat.labelMr : cat.labelEn}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Festival Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFestivals.map((festival, idx) => {
            const festivalId = festival.id || idx;
            const accent = festival.accentColor || "from-amber-700 to-maroon-900";
            const photoCount = festival.photos?.length || 0;
            const festivalTitle = language === "mr" 
              ? (festival.nameMr || festival.titleMr) 
              : (festival.nameEn || festival.titleEn || festival.titleMr);

            return (
              <div
                key={festivalId}
                onClick={() => {
                  setActiveFestival(festival);
                  setLightboxIndex(null);
                }}
                className="bg-white rounded-2xl border-2 border-gold-300 overflow-hidden shadow-sm hover:shadow-xl hover:border-gold-500 transition-all duration-300 cursor-pointer group flex flex-col"
              >
                {/* Festival Visual Box (Banner Image) */}
                {festival.bannerUrl ? (
                  <div className="h-48 relative overflow-hidden bg-maroon-950">
                    <img 
                      src={getMediaUrl(festival.bannerUrl)} 
                      alt={festivalTitle} 
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    
                    {/* Top-Left: Year Badge */}
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-xs text-gold-300 border border-gold-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {language === "mr" ? `वर्ष ${festival.year || config.festivalYear}` : `Year ${festival.year || config.festivalYear}`}
                    </div>

                    {/* Top-Right: Category Badge */}
                    {festival.category && (
                      <div className="absolute top-3 right-3 bg-gold-400 text-maroon-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        {language === "mr" ? festival.category : (festival.categoryEn || festival.category)}
                      </div>
                    )}

                    {/* Bottom-Right: Photos Count Badge */}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-gold-200 border border-gold-400/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Camera className="w-3 h-3 text-gold-300" />
                      <span>{photoCount} {language === "mr" ? "फोटो" : "Photos"}</span>
                    </div>
                  </div>
                ) : (
                  <div className={`h-48 bg-gradient-to-br ${accent} relative flex flex-col items-center justify-center text-white p-4 overflow-hidden`}>
                    <div className="absolute inset-0 opacity-15 flex items-center justify-center pointer-events-none">
                      <div className="w-40 h-40 border-4 border-dashed border-gold-300 rounded-full animate-spin"></div>
                    </div>

                    <Sparkles className="w-10 h-10 text-gold-300 mb-2 transform group-hover:scale-125 transition duration-300" />
                    
                    <h4 className="text-sm sm:text-base font-extrabold text-gold-100 text-center font-heading leading-tight drop-shadow-md z-10 px-2 line-clamp-2">
                      {festivalTitle}
                    </h4>

                    {/* Top-Left: Year Badge */}
                    <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-xs text-gold-300 border border-gold-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {language === "mr" ? `वर्ष ${festival.year || config.festivalYear}` : `Year ${festival.year || config.festivalYear}`}
                    </div>

                    {/* Top-Right: Category Badge */}
                    {festival.category && (
                      <div className="absolute top-3 right-3 bg-gold-400 text-maroon-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        {language === "mr" ? festival.category : (festival.categoryEn || festival.category)}
                      </div>
                    )}

                    {/* Bottom-Right: Photos Count Badge */}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-gold-200 border border-gold-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Camera className="w-3 h-3 text-gold-300" />
                      <span>{photoCount} {language === "mr" ? "फोटो" : "Photos"}</span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/50 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition duration-200">
                      <ZoomIn className="w-3.5 h-3.5 text-gold-300" />
                      <span>{language === "mr" ? "पहा" : "View"}</span>
                    </div>
                  </div>
                )}

                {/* Festival Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-[#FAF5EC]">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-maroon-950 font-heading line-clamp-1 mb-1 group-hover:text-amber-700 transition-colors">
                      {festivalTitle}
                    </h3>
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                      {language === "mr" ? festival.descMr : (festival.descEn || festival.descMr)}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gold-200 flex items-center justify-between text-xs text-maroon-800 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === "mr" ? `वर्ष ${festival.year || config.festivalYear}` : `Year ${festival.year || config.festivalYear}`}</span>
                    </span>
                    <span className="text-gold-700 font-bold group-hover:text-maroon-900 transition flex items-center gap-1">
                      <span>{language === "mr" ? "विस्तारित पहा" : "View Details"}</span>
                      <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty state if filtered results are 0 */}
        {filteredFestivals.length === 0 && (
          <div className="p-8 text-center bg-white/70 rounded-2xl border-2 border-dashed border-gold-300 text-maroon-900 my-4">
            <ImageIcon className="w-10 h-10 text-gold-500 mx-auto mb-2 opacity-70" />
            <p className="text-sm font-bold">
              {language === "mr" ? "या वर्गवारीत अद्याप कोणतेही फोटो उपलब्ध नाहीत." : "No festival photos available in this category yet."}
            </p>
          </div>
        )}

      </div>

      {/* 1. Festival Detail Modal (Opens when user clicks a festival card / View Details) */}
      {activeFestival && lightboxIndex === null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-5 animate-fadeIn"
          onClick={() => setActiveFestival(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] border-2 border-gold-400 shadow-2xl overflow-hidden relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between p-4 bg-maroon-950 text-white border-b border-gold-500/40 flex-shrink-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs bg-gold-400 text-maroon-950 font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  {language === "mr" ? activeFestival.category : (activeFestival.categoryEn || activeFestival.category)}
                </span>
                <span className="text-xs text-gold-300 font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {language === "mr" ? `वर्ष ${activeFestival.year || config.festivalYear}` : `Year ${activeFestival.year || config.festivalYear}`}
                </span>
                <span className="text-xs bg-black/40 text-gold-200 font-medium px-2 py-0.5 rounded-full border border-gold-400/30">
                  {activeFestival.photos?.length || 0} {language === "mr" ? "छायाचित्रे" : "Photos"}
                </span>
              </div>
              <button
                onClick={() => setActiveFestival(null)}
                className="p-1.5 rounded-full text-gold-300 hover:text-white hover:bg-maroon-800 transition cursor-pointer"
                title={language === "mr" ? "बंद करा" : "Close"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5 bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EC]">
              
              {/* Festival Banner Header */}
              {activeFestival.bannerUrl ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-gold-300 shadow-md max-h-64 sm:max-h-72 bg-black">
                  <img 
                    src={getMediaUrl(activeFestival.bannerUrl)} 
                    alt={activeFestival.nameMr || activeFestival.titleMr} 
                    onError={handleImageError}
                    className="w-full h-full object-cover max-h-64 sm:max-h-72" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
                    <span className="text-[11px] font-bold text-gold-300 uppercase tracking-wider mb-1">
                      {language === "mr" ? "मुख्य कव्हर / बॅनर छायाचित्र" : "Festival Cover Photo"}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-gold-100 font-heading drop-shadow-md">
                      {language === "mr" ? (activeFestival.nameMr || activeFestival.titleMr) : (activeFestival.nameEn || activeFestival.titleEn || activeFestival.titleMr)}
                    </h3>
                  </div>
                </div>
              ) : (
                <div className={`p-6 rounded-2xl bg-gradient-to-br ${activeFestival.accentColor || "from-amber-700 to-maroon-900"} text-white border-2 border-gold-400 text-center shadow-md relative overflow-hidden`}>
                  <Sparkles className="w-10 h-10 text-gold-300 mx-auto mb-2 animate-pulse" />
                  <h3 className="text-xl sm:text-2xl font-black text-gold-100 font-heading">
                    {language === "mr" ? (activeFestival.nameMr || activeFestival.titleMr) : (activeFestival.nameEn || activeFestival.titleEn || activeFestival.titleMr)}
                  </h3>
                </div>
              )}

              {/* Festival Description */}
              {(activeFestival.descMr || activeFestival.descEn) && (
                <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-gold-300/80 shadow-2xs">
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">
                    {language === "mr" ? activeFestival.descMr : (activeFestival.descEn || activeFestival.descMr)}
                  </p>
                </div>
              )}

              {/* Festival Photos Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-gold-300/70 pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-700" />
                    <h4 className="text-sm sm:text-base font-black text-maroon-950 font-heading">
                      {language === "mr" ? "या उत्सवातील सर्व छायाचित्रे" : "Festival Photo Gallery"}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-maroon-800 bg-gold-200/80 px-2.5 py-0.5 rounded-full border border-gold-300">
                    {activeFestival.photos?.length || 0} {language === "mr" ? "फोटो" : "Photos"}
                  </span>
                </div>

                {/* Photos Grid */}
                {activeFestival.photos && activeFestival.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {activeFestival.photos.map((photo, pIdx) => {
                      const photoCaption = language === "mr" ? (photo.captionMr || photo.titleMr) : (photo.captionEn || photo.captionMr || photo.titleEn);
                      return (
                        <div
                          key={photo.id || pIdx}
                          onClick={() => setLightboxIndex(pIdx)}
                          className="group relative rounded-xl overflow-hidden border-2 border-gold-300 hover:border-gold-500 bg-black cursor-pointer shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
                        >
                          <div className="h-32 sm:h-36 w-full overflow-hidden bg-black flex items-center justify-center relative">
                            <img
                              src={getMediaUrl(photo.url)}
                              alt={photoCaption || `Photo ${pIdx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                              onError={handleImageError}
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-black/60 text-gold-200 p-2 rounded-full backdrop-blur-xs">
                                <ZoomIn className="w-4 h-4" />
                              </span>
                            </div>
                            <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              #{pIdx + 1}
                            </span>
                          </div>
                          {photoCaption && (
                            <div className="p-1.5 bg-white border-t border-gold-200">
                              <p className="text-[11px] text-gray-700 font-medium truncate text-center">
                                {photoCaption}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-gold-300 text-gray-600 space-y-1">
                    <Camera className="w-8 h-8 text-gold-400 mx-auto opacity-70" />
                    <p className="text-xs sm:text-sm font-bold text-maroon-900">
                      {language === "mr" ? "या उत्सवासाठी अद्याप फोटो जोडलेले नाहीत." : "No gallery photos uploaded for this festival yet."}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {language === "mr" ? "ऍडमिन डॅशबोर्डवरून नवीन फोटो जोडता येतील." : "Admin can add festival photos from the Admin Dashboard."}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-3.5 sm:p-4 bg-[#FAF5EC] border-t border-gold-300 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-maroon-800 font-bold">
                {language === "mr" ? (config.mandalNameMr || "म्हाडा टॉवर्स उत्सव मंडळ") : (config.mandalNameEn || "MHADA Towers Utsav Mandal")}
              </span>
              <button
                onClick={() => setActiveFestival(null)}
                className="px-5 py-2 bg-maroon-850 hover:bg-maroon-800 text-gold-200 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                {t("close")}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Full-Screen Photo Lightbox Zoom View (When user clicks an individual photo) */}
      {activeFestival && lightboxIndex !== null && activePhotoItem && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/92 backdrop-blur-md p-2 sm:p-4 animate-fadeIn select-none"
          onClick={() => setLightboxIndex(null)}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[96vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Counter & Close */}
            <div className="w-full flex items-center justify-between text-white p-2 sm:p-3 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-gold-300">
                  {language === "mr" ? (activeFestival.nameMr || activeFestival.titleMr) : (activeFestival.nameEn || activeFestival.titleEn || activeFestival.titleMr)}
                </span>
                <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full text-gray-300 font-mono">
                  {lightboxIndex + 1} / {activeFestival.photos.length}
                </span>
              </div>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-rose-600 text-white transition cursor-pointer"
                title={language === "mr" ? "बंद करा" : "Close"}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image Viewer with Next & Prev Controls */}
            <div className="relative w-full flex items-center justify-center max-h-[80vh] overflow-hidden">
              <img
                src={getMediaUrl(activePhotoItem.url)}
                alt={activePhotoItem.captionMr || "Festival Zoomed"}
                onError={handleImageError}
                className="max-h-[78vh] max-w-full w-auto object-contain rounded-xl shadow-2xl border border-gold-500/30"
              />

              {/* Prev Button */}
              {activeFestival.photos.length > 1 && (
                <button
                  onClick={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : activeFestival.photos.length - 1))}
                  className="absolute left-2 sm:left-4 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-gold-500 hover:text-maroon-950 text-gold-300 transition cursor-pointer backdrop-blur-xs shadow-lg"
                  title="Previous"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Next Button */}
              {activeFestival.photos.length > 1 && (
                <button
                  onClick={() => setLightboxIndex((prev) => (prev < activeFestival.photos.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 sm:right-4 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-gold-500 hover:text-maroon-950 text-gold-300 transition cursor-pointer backdrop-blur-xs shadow-lg"
                  title="Next"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Caption Bar */}
            {(activePhotoItem.captionMr || activePhotoItem.captionEn) && (
              <div className="mt-3 text-center px-4 py-2 bg-black/60 border border-gold-500/30 rounded-full max-w-xl text-xs sm:text-sm text-gold-200 font-medium truncate">
                {language === "mr" ? activePhotoItem.captionMr : (activePhotoItem.captionEn || activePhotoItem.captionMr)}
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
};

export default PhotoGallery;
