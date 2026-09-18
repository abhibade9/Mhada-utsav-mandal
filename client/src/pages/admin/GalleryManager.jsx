import React, { useState, useEffect, useRef } from "react";
import { 
  Image as ImageIcon, Save, Plus, Trash2, Sparkles, Calendar, Eye,
  Upload, FolderUp, Camera, Loader2, X, CheckCircle2, ArrowUp, ArrowDown,
  ChevronDown, ChevronUp, Layers, HelpCircle
} from "lucide-react";
import { 
  FestiveCard, FestiveInput, FestiveTextarea, FestiveButton, FestiveToggle 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";
import API from "../../services/api";
import { getMediaUrl, handleImageError } from "../../utils/mediaUrl";

const GalleryManager = ({ config, onSaveGallery, onNotify }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isSaving, setIsSaving] = useState(false);
  const [festivals, setFestivals] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [uploadingBannerId, setUploadingBannerId] = useState(null);
  const [uploadingPhotosId, setUploadingPhotosId] = useState(null);
  const [previewFestival, setPreviewFestival] = useState(null);
  const [previewModalImg, setPreviewModalImg] = useState(null);

  // File input refs per festival
  const bannerInputRefs = useRef({});
  const batchPhotosInputRefs = useRef({});

  useEffect(() => {
    if (config?.gallery) {
      const normalized = config.gallery.map((item, idx) => {
        const banner = item.bannerUrl || item.imageUrl || (Array.isArray(item.photos) && item.photos[0]?.url) || "";
        const photos = Array.isArray(item.photos)
          ? item.photos.map((p, pIdx) => ({
              id: p.id || `p_${Date.now()}_${pIdx}`,
              url: p.url || p.imageUrl || "",
              captionMr: p.captionMr || p.titleMr || "",
              captionEn: p.captionEn || p.titleEn || "",
              order: Number(p.order) || pIdx + 1
            })).filter(p => Boolean(p.url))
          : (item.imageUrl ? [{ id: "p_1", url: item.imageUrl, captionMr: item.titleMr || "", captionEn: item.titleEn || "", order: 1 }] : []);

        return {
          id: item.id || `fest_${Date.now()}_${idx}`,
          titleMr: item.titleMr || item.nameMr || "नवीन उत्सव गॅलरी",
          titleEn: item.titleEn || item.nameEn || "New Festival Gallery",
          nameMr: item.nameMr || item.titleMr || "नवीन उत्सव गॅलरी",
          nameEn: item.nameEn || item.titleEn || "New Festival Gallery",
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

      setFestivals(normalized);
      if (normalized.length > 0 && !expandedId) {
        setExpandedId(normalized[0].id);
      }
    }
  }, [config]);

  // Total photo count across all festivals
  const totalPhotos = festivals.reduce((sum, f) => sum + (f.photos?.length || 0), 0);

  // Add new festival gallery
  const handleAddFestival = () => {
    const newFest = {
      id: `fest_${Date.now()}`,
      titleMr: "नवीन उत्सव छायाचित्र संग्रह",
      titleEn: "New Festival Photo Collection",
      nameMr: "नवीन उत्सव छायाचित्र संग्रह",
      nameEn: "New Festival Photo Collection",
      category: "महाआरती",
      categoryEn: "Maha Aarti",
      year: config?.festivalYear || "२०२६",
      yearEn: "2026",
      descMr: "",
      descEn: "",
      bannerUrl: "",
      imageUrl: "",
      accentColor: "from-amber-700 to-maroon-900",
      photos: [],
      isActive: true,
      order: festivals.length + 1
    };

    setFestivals([newFest, ...festivals]);
    setExpandedId(newFest.id);
    if (onNotify) {
      onNotify(isEn ? "New Festival Gallery created! Add banner & photos below." : "नवीन उत्सव गॅलरी तयार झाली! खाली कव्हर फोटो व गॅलरी फोटो जोडा.", "info");
    }
  };

  // Remove entire festival
  const handleDeleteFestival = (festId) => {
    const target = festivals.find(f => f.id === festId);
    const festName = target ? (isEn ? (target.nameEn || target.titleEn) : (target.nameMr || target.titleMr)) : "festival";
    
    if (window.confirm(isEn ? `Are you sure you want to delete the festival "${festName}"? All its photos in this folder will be removed.` : `तुम्हाला खात्री आहे का की "${festName}" ही संपूर्ण उत्सव गॅलरी काढून टाकायची आहे?`)) {
      setFestivals(prev => prev.filter(f => f.id !== festId));
      if (expandedId === festId) {
        setExpandedId(null);
      }
      if (onNotify) {
        onNotify(isEn ? "Festival gallery deleted." : "उत्सव गॅलरी काढून टाकण्यात आली.", "info");
      }
    }
  };

  // Move festival order up / down
  const handleMoveFestival = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= festivals.length) return;

    const updated = [...festivals];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;

    // Re-assign order numbers
    updated.forEach((f, i) => {
      f.order = i + 1;
    });

    setFestivals(updated);
  };

  // Update specific field in a festival
  const handleFestivalChange = (festId, field, val) => {
    setFestivals(prev => prev.map(f => {
      if (f.id !== festId) return f;
      const updated = { ...f, [field]: val };
      // Sync names and banner image aliases
      if (field === "nameMr") updated.titleMr = val;
      if (field === "nameEn") updated.titleEn = val;
      if (field === "titleMr") updated.nameMr = val;
      if (field === "titleEn") updated.nameEn = val;
      if (field === "bannerUrl") updated.imageUrl = val;
      return updated;
    }));
  };

  // Upload Dedicated Banner / Cover Photo
  const handleBannerUpload = async (e, festId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      if (onNotify) onNotify(isEn ? "Please select a valid image file (JPG, PNG, WEBP)" : "कृपया वैध फोटो फाइल निवडा (JPG, PNG, WEBP)", "error");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      if (onNotify) onNotify(isEn ? "File size exceeds 20MB limit." : "फोटो फाइलची साईज २०MB पेक्षा जास्त आहे.", "error");
      return;
    }

    setUploadingBannerId(festId);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("category", "festival-banner");

      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data.imageUrl) {
        handleFestivalChange(festId, "bannerUrl", res.data.imageUrl);
        if (onNotify) onNotify(isEn ? "Banner image uploaded successfully!" : "उत्सवाचा कव्हर / बॅनर फोटो यशस्वीरित्या सेव्ह झाला!", "success");
      } else {
        throw new Error(res.data?.message || "Failed to upload banner");
      }
    } catch (err) {
      console.error("Banner upload error:", err);
      const msg = err.response?.data?.message || (isEn ? "Upload failed" : "बॅनर फोटो अपलोड करताना त्रुटी आली");
      if (onNotify) onNotify(msg, "error");
    } finally {
      setUploadingBannerId(null);
      if (e.target) e.target.value = "";
    }
  };

  // Batch Upload Multiple Photos for a Specific Festival
  const handleBatchPhotosUpload = async (e, festId) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const invalidFiles = files.filter(f => !f.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      if (onNotify) onNotify(isEn ? "Some files are not valid images." : "काही फाइल्स वैध फोटो नाहीत.", "error");
      return;
    }

    setUploadingPhotosId(festId);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      formData.append("category", "festival-photos");

      const res = await API.post("/upload/multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && Array.isArray(res.data.files)) {
        const newPhotos = res.data.files.map((f, i) => {
          const rawName = (f.originalName || "photo").replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          return {
            id: `p_${Date.now()}_${i}`,
            url: f.imageUrl || f.url,
            captionMr: rawName,
            captionEn: rawName,
            order: i + 1
          };
        });

        setFestivals(prev => prev.map(f => {
          if (f.id !== festId) return f;
          const currentPhotos = f.photos || [];
          // If no banner exists yet, set the first uploaded photo as default banner
          const updatedBanner = f.bannerUrl || newPhotos[0]?.url || "";
          return {
            ...f,
            bannerUrl: updatedBanner,
            imageUrl: updatedBanner,
            photos: [...currentPhotos, ...newPhotos].map((p, idx) => ({ ...p, order: idx + 1 }))
          };
        }));

        if (onNotify) {
          onNotify(
            isEn 
              ? `${newPhotos.length} photos added to this festival successfully!` 
              : `${newPhotos.length} फोटो या उत्सवामध्ये यशस्वीरित्या जोडले!`,
            "success"
          );
        }
      } else {
        throw new Error(res.data?.message || "Batch upload failed");
      }
    } catch (err) {
      console.error("Photos upload error:", err);
      const msg = err.response?.data?.message || (isEn ? "Failed to upload photos" : "फोटो अपलोड करताना त्रुटी आली");
      if (onNotify) onNotify(msg, "error");
    } finally {
      setUploadingPhotosId(null);
      if (e.target) e.target.value = "";
    }
  };

  // Delete an individual photo inside a festival
  const handleDeletePhoto = (festId, photoId) => {
    setFestivals(prev => prev.map(f => {
      if (f.id !== festId) return f;
      const updatedPhotos = (f.photos || []).filter(p => p.id !== photoId);
      return {
        ...f,
        photos: updatedPhotos.map((p, idx) => ({ ...p, order: idx + 1 }))
      };
    }));
  };

  // Reorder photo inside festival (left/right or up/down)
  const handleMovePhoto = (festId, photoIdx, direction) => {
    setFestivals(prev => prev.map(f => {
      if (f.id !== festId) return f;
      const photos = [...(f.photos || [])];
      const newIdx = photoIdx + direction;
      if (newIdx < 0 || newIdx >= photos.length) return f;

      const temp = photos[photoIdx];
      photos[photoIdx] = photos[newIdx];
      photos[newIdx] = temp;

      return {
        ...f,
        photos: photos.map((p, idx) => ({ ...p, order: idx + 1 }))
      };
    }));
  };

  // Update photo caption
  const handlePhotoCaptionChange = (festId, photoId, field, value) => {
    setFestivals(prev => prev.map(f => {
      if (f.id !== festId) return f;
      return {
        ...f,
        photos: (f.photos || []).map(p => {
          if (p.id !== photoId) return p;
          const updatedPhoto = { ...p, [field]: value };
          if (field === "captionMr") updatedPhoto.titleMr = value;
          if (field === "captionEn") updatedPhoto.titleEn = value;
          return updatedPhoto;
        })
      };
    }));
  };

  // Save all festival galleries to server
  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const res = await onSaveGallery(festivals);
      if (res?.success) {
        if (onNotify) {
          onNotify(
            isEn 
              ? "All Festival Galleries saved successfully and published to Home Page!" 
              : "सर्व उत्सव गॅलरी यशस्वीरित्या जतन झाल्या व होमपेजवर प्रकाशित झाल्या!",
            "success"
          );
        }
      } else {
        throw new Error(res?.message || "Failed to save");
      }
    } catch (err) {
      if (onNotify) {
        onNotify(isEn ? "Failed to save festival galleries." : "गॅलरी जतन करताना त्रुटी आली.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FestiveCard
      title={
        isEn 
          ? "Festival Photo Gallery Manager" 
          : "उत्सव छायाचित्र गॅलरी व्यवस्थापक"
      }
      subtitle={
        isEn
          ? "Organize photos into festival folders (e.g. Ganesh Chaturthi, Maha Aarti, Visarjan). Each festival has 1 Banner cover and its own collection of photos."
          : "प्रत्येक सण/उत्सवाची स्वतंत्र गॅलरी बनवा (उदा. गणेश चतुर्थी, महाआरती, विसर्जन). प्रत्येक उत्सवाला १ मुख्य बॅनर कव्हर व त्या उत्सवातील स्वतंत्र फोटो संग्रह असतो."
      }
      icon={ImageIcon}
      badge={
        isEn 
          ? `Festivals: ${festivals.length} | Photos: ${totalPhotos}` 
          : `एकूण उत्सव: ${festivals.length} | एकूण फोटो: ${totalPhotos}`
      }
      action={
        <div className="flex flex-wrap items-center gap-2">
          <FestiveButton
            onClick={handleAddFestival}
            icon={Plus}
            variant="secondary"
            size="md"
          >
            {isEn ? "+ Add Festival Gallery" : "+ नवीन उत्सव गॅलरी जोडा"}
          </FestiveButton>

          <FestiveButton
            onClick={handleSubmit}
            icon={Save}
            variant="primary"
            size="md"
            disabled={isSaving}
          >
            {isSaving 
              ? (isEn ? "Saving Changes..." : "जतन करत आहे...") 
              : (isEn ? "Save All Changes (गॅलरी जतन करा)" : "गॅलरी जतन करा (Save)")
            }
          </FestiveButton>
        </div>
      }
    >
      {/* Information Helper Box */}
      <div className="mb-5 p-3.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-maroon-900 shadow-2xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            {isEn 
              ? "Each festival card on the Home Page shows its Banner Cover. Clicking 'View Details' opens that specific festival's photos."
              : "होमपेजवर प्रत्येक उत्सवाचे मुख्य बॅनर कव्हर दिसते. 'विस्तारित पहा (View Details)' वर क्लिक केल्यावर फक्त त्या उत्सवातील फोटो भाविकांना दिसतात."}
          </span>
        </div>
        <span className="font-mono bg-white px-2.5 py-0.5 rounded-full border border-amber-200 text-[11px] text-amber-900 font-bold self-start sm:self-center">
          {festivals.filter(f => f.isActive !== false).length} {isEn ? "Live on website" : "वेबसाइटवर सुरू"}
        </span>
      </div>

      {/* List of Festival Galleries */}
      <div className="space-y-4">
        {festivals.map((festival, idx) => {
          const isExpanded = expandedId === festival.id;
          const isThisBannerUploading = uploadingBannerId === festival.id;
          const isThisPhotosUploading = uploadingPhotosId === festival.id;
          const photoCount = festival.photos?.length || 0;
          const festTitle = isEn 
            ? (festival.nameEn || festival.titleEn || festival.nameMr) 
            : (festival.nameMr || festival.titleMr);

          return (
            <div
              key={festival.id || idx}
              className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                isExpanded 
                  ? "border-gold-500 bg-white shadow-md ring-2 ring-gold-400/20" 
                  : "border-gold-300 bg-white/90 hover:border-gold-400 shadow-xs"
              }`}
            >
              {/* Festival Header / Accordion Bar */}
              <div className="p-3.5 sm:p-4 bg-gradient-to-r from-white via-[#FFFDF9] to-[#FAF7F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-200">
                
                {/* Left: Drag / Order, Banner Mini-Thumb, Title & Badges */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  
                  {/* Order Controls */}
                  <div className="flex flex-col items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleMoveFestival(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 text-stone-500 hover:text-maroon-900 disabled:opacity-20 cursor-pointer"
                      title={isEn ? "Move Up" : "वर हलवा"}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-black font-mono text-amber-900 bg-gold-200 px-1.5 py-0.2 rounded">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMoveFestival(idx, 1)}
                      disabled={idx === festivals.length - 1}
                      className="p-1 text-stone-500 hover:text-maroon-900 disabled:opacity-20 cursor-pointer"
                      title={isEn ? "Move Down" : "खाली हलवा"}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Banner Mini Thumbnail */}
                  <div className="w-14 h-12 rounded-lg border border-gold-300 bg-maroon-950 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                    {festival.bannerUrl ? (
                      <img 
                        src={getMediaUrl(festival.bannerUrl)} 
                        alt="Banner" 
                        onError={handleImageError}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Sparkles className="w-5 h-5 text-gold-400" />
                    )}
                  </div>

                  {/* Festival Name & Badges */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h4 className="text-sm sm:text-base font-black text-maroon-950 font-heading truncate">
                        {festTitle || (isEn ? "Untitled Festival" : "शीर्षक नसलेला उत्सव")}
                      </h4>
                      <span className="text-[10px] font-bold bg-gold-200 text-maroon-950 px-2 py-0.5 rounded-full border border-gold-300">
                        {festival.year || "२०२६"}
                      </span>
                      {festival.category && (
                        <span className="text-[10px] font-black bg-amber-400 text-maroon-950 px-2 py-0.5 rounded-full shadow-2xs">
                          {festival.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      <span className="flex items-center gap-1 font-semibold text-amber-800">
                        <Camera className="w-3 h-3 text-amber-700" />
                        {photoCount} {isEn ? "Photos" : "फोटो"}
                      </span>
                      <span>•</span>
                      <span className={festival.isActive !== false ? "text-emerald-700 font-bold" : "text-stone-500 font-bold"}>
                        {festival.isActive !== false 
                          ? (isEn ? "● Live on Website" : "● सुरू (वेबसाइटवर दिसेल)") 
                          : (isEn ? "○ Hidden (Draft)" : "○ बंद (लपवलेले)")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Active Toggle, Preview, Expand, Delete */}
                <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                  
                  {/* Public ON/OFF Switch */}
                  <FestiveToggle
                    checked={festival.isActive !== false}
                    onChange={(val) => handleFestivalChange(festival.id, "isActive", val)}
                    size="sm"
                    activeText={isEn ? "ON" : "सुरू"}
                    inactiveText={isEn ? "OFF" : "बंद"}
                  />

                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewFestival(festival)}
                    className="p-2 text-amber-800 hover:bg-gold-100 rounded-xl transition cursor-pointer border border-gold-300"
                    title={isEn ? "Preview Festival Gallery" : "गॅलरीचे पूर्वावलोकन पहा"}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Expand / Collapse Button */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : festival.id)}
                    className={`p-2 rounded-xl transition cursor-pointer border ${
                      isExpanded 
                        ? "bg-amber-600 text-white border-amber-700" 
                        : "bg-white text-maroon-900 border-gold-300 hover:bg-gold-50"
                    }`}
                    title={isExpanded ? (isEn ? "Collapse" : "बंद करा") : (isEn ? "Edit Festival" : "उत्सव संपादित करा")}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Delete Festival Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteFestival(festival.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-rose-200"
                    title={isEn ? "Delete Festival" : "उत्सव हटवा"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Expanded Festival Editor Body */}
              {isExpanded && (
                <div className="p-4 sm:p-6 space-y-6 bg-white">
                  
                  {/* SECTION 1: Festival Basic Information */}
                  <div className="space-y-3 pb-5 border-b border-gold-200">
                    <div className="flex items-center gap-2 text-xs font-black text-maroon-950 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>{isEn ? "1. Festival Details" : "१. उत्सवाचा तपशील"}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FestiveInput
                        label={isEn ? "Festival Name (Marathi) *" : "उत्सवाचे नाव (मराठी) *"}
                        value={festival.nameMr || festival.titleMr || ""}
                        onChange={(e) => handleFestivalChange(festival.id, "nameMr", e.target.value)}
                        placeholder="उदा. श्री गणेश चतुर्थी २०२६"
                        required
                      />
                      <FestiveInput
                        label={isEn ? "Festival Name (English)" : "Festival Name (English)"}
                        value={festival.nameEn || festival.titleEn || ""}
                        onChange={(e) => handleFestivalChange(festival.id, "nameEn", e.target.value)}
                        placeholder="e.g. Ganesh Chaturthi 2026"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FestiveInput
                        label={isEn ? "Category (वर्गवारी)" : "वर्गवारी (Category)"}
                        value={festival.category || ""}
                        onChange={(e) => handleFestivalChange(festival.id, "category", e.target.value)}
                        placeholder="उदा. महाआरती / मूर्ती / सांस्कृतिक / विसर्जन"
                      />
                      <FestiveInput
                        label={isEn ? "Year (वर्ष)" : "वर्ष (Year)"}
                        value={festival.year || ""}
                        onChange={(e) => handleFestivalChange(festival.id, "year", e.target.value)}
                        placeholder="२०२६ / 2026"
                      />
                      <FestiveInput
                        label={isEn ? "Display / Sort Order" : "क्रमवारी क्रमांक (Display Order)"}
                        type="number"
                        min="1"
                        value={festival.order || idx + 1}
                        onChange={(e) => handleFestivalChange(festival.id, "order", Number(e.target.value))}
                        helperText={isEn ? "Lower number appears first" : "कमी नंबर असलेला उत्सव आधी दिसेल"}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FestiveTextarea
                        label={isEn ? "Festival Description (Marathi)" : "उत्सव वर्णन / तपशील (मराठी)"}
                        rows={2}
                        value={festival.descMr || ""}
                        onChange={(e) => handleFestivalChange(festival.id, "descMr", e.target.value)}
                        placeholder="म्हाडा टॉवर्स मुख्य मंडपातील बाप्पांचे विलोभनीय रूप व महाआरती..."
                      />
                      <FestiveTextarea
                        label={isEn ? "Festival Description (English)" : "English Description"}
                        rows={2}
                        value={festival.descEn || ""}
                        onChange={(e) => handleFestivalChange(festival.id, "descEn", e.target.value)}
                        placeholder="Memorable celebration and grand aarti at MHADA Towers..."
                      />
                    </div>
                  </div>

                  {/* SECTION 2: Dedicated Banner / Cover Photo */}
                  <div className="p-4 bg-gradient-to-br from-[#FFFDF9] to-[#FAF6EE] rounded-2xl border-2 border-gold-300 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-amber-700" />
                        <h5 className="text-xs sm:text-sm font-black text-maroon-950 font-heading uppercase tracking-wide">
                          {isEn ? "2. Festival Banner / Cover Photo *" : "२. मुख्य बॅनर / कव्हर फोटो *"}
                        </h5>
                      </div>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {isEn 
                          ? "This image is featured as the main card photo on the Home Page" 
                          : "हा फोटो होमपेजवरील मुख्य कार्डवर कव्हर म्हणून दिसेल"}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 pt-1">
                      {/* Banner Preview Box */}
                      <div className="relative w-full md:w-60 h-36 rounded-xl border-2 border-dashed border-gold-400 bg-white overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs">
                        {isThisBannerUploading ? (
                          <div className="flex flex-col items-center justify-center gap-1.5 text-amber-700">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-[11px] font-bold">
                              {isEn ? "Uploading Banner..." : "बॅनर अपलोड होत आहे..."}
                            </span>
                          </div>
                        ) : festival.bannerUrl ? (
                          <>
                            <img
                              src={getMediaUrl(festival.bannerUrl)}
                              alt="Festival Banner"
                              onError={handleImageError}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                              onClick={() => setPreviewModalImg(festival.bannerUrl)}
                            />
                            <button
                              type="button"
                              onClick={() => handleFestivalChange(festival.id, "bannerUrl", "")}
                              className="absolute top-1.5 right-1.5 p-1 bg-black/70 text-white hover:bg-rose-600 rounded-full transition cursor-pointer"
                              title={isEn ? "Remove banner photo" : "बॅनर काढा"}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-gold-300 text-[10px] font-bold px-2 py-0.5 rounded">
                              {isEn ? "Main Banner" : "कव्हर फोटो"}
                            </span>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1 text-stone-400 p-3 text-center">
                            <ImageIcon className="w-8 h-8 text-gold-400" />
                            <span className="text-[11px] text-stone-600 font-bold">
                              {isEn ? "No Banner Attached" : "कोणताही बॅनर जोडलेला नाही"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Upload Controls & URL fallback */}
                      <div className="flex-1 w-full space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="file"
                            ref={(el) => (bannerInputRefs.current[festival.id] = el)}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleBannerUpload(e, festival.id)}
                            disabled={isThisBannerUploading}
                          />

                          <FestiveButton
                            onClick={() => bannerInputRefs.current[festival.id]?.click()}
                            icon={isThisBannerUploading ? Loader2 : Upload}
                            variant="primary"
                            size="md"
                            disabled={isThisBannerUploading}
                          >
                            {festival.bannerUrl 
                              ? (isEn ? "Replace Banner Photo" : "बॅनर फोटो बदला (Replace)")
                              : (isEn ? "Upload Banner from Device" : "डिव्हाइसवरून बॅनर अपलोड करा")
                            }
                          </FestiveButton>

                          {festival.bannerUrl && (
                            <FestiveButton
                              onClick={() => setPreviewModalImg(festival.bannerUrl)}
                              icon={Eye}
                              variant="secondary"
                              size="md"
                            >
                              {isEn ? "Preview Banner" : "बॅनर पहा"}
                            </FestiveButton>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[11px] text-stone-600 mb-1">
                            <span>{isEn ? "Banner Photo Path / URL:" : "बॅनर फोटो मार्ग (Path) किंवा URL:"}</span>
                            {festival.bannerUrl?.startsWith("/uploads") && (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {isEn ? "Stored in server/uploads/" : "server/uploads/ मध्ये सुरक्षित"}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={festival.bannerUrl || ""}
                            onChange={(e) => handleFestivalChange(festival.id, "bannerUrl", e.target.value)}
                            placeholder="उदा. /uploads/banner.jpg किंवा https://..."
                            className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-gold-300 bg-white text-gray-800 focus:border-amber-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: Festival Photos Collection */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gold-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-amber-700" />
                          <h5 className="text-xs sm:text-sm font-black text-maroon-950 font-heading uppercase tracking-wide">
                            {isEn ? "3. Photos Inside This Festival" : "३. या उत्सवातील सर्व छायाचित्रे"}
                          </h5>
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium">
                          {isEn 
                            ? "All photos uploaded here remain strictly associated with this festival." 
                            : "येथे जोडलेले सर्व फोटो केवळ या उत्सवाशी संबंधित राहतील आणि 'View Details' मध्ये दिसतील."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Hidden Batch Input */}
                        <input
                          type="file"
                          ref={(el) => (batchPhotosInputRefs.current[festival.id] = el)}
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleBatchPhotosUpload(e, festival.id)}
                          disabled={isThisPhotosUploading}
                        />

                        <FestiveButton
                          onClick={() => batchPhotosInputRefs.current[festival.id]?.click()}
                          icon={isThisPhotosUploading ? Loader2 : FolderUp}
                          variant="emerald"
                          size="md"
                          disabled={isThisPhotosUploading}
                        >
                          {isThisPhotosUploading 
                            ? (isEn ? "Uploading Photos..." : "फोटो अपलोड होत आहेत...") 
                            : (isEn ? "Upload Multiple Photos" : "एकाचवेळी अनेक फोटो निवडा व जोडा")
                          }
                        </FestiveButton>
                      </div>
                    </div>

                    {/* Photos Thumbnail List / Grid */}
                    {festival.photos && festival.photos.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                        {festival.photos.map((photo, pIdx) => (
                          <div
                            key={photo.id || pIdx}
                            className="bg-[#FAF7F0] rounded-xl border border-gold-300 p-2.5 space-y-2 relative group shadow-2xs hover:border-gold-500 transition-colors"
                          >
                            {/* Thumbnail */}
                            <div className="relative h-28 w-full rounded-lg bg-black overflow-hidden flex items-center justify-center">
                              <img
                                src={getMediaUrl(photo.url)}
                                alt={photo.captionMr || "Festival photo"}
                                onError={handleImageError}
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                                onClick={() => setPreviewModalImg(photo.url)}
                              />
                              
                              <span className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                #{pIdx + 1}
                              </span>

                              {/* Reorder Buttons (Left / Right) */}
                              <div className="absolute top-1 right-1 flex items-center gap-1">
                                {pIdx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMovePhoto(festival.id, pIdx, -1)}
                                    className="p-1 bg-black/60 hover:bg-gold-500 text-white hover:text-black rounded transition cursor-pointer"
                                    title={isEn ? "Move Left" : "डावीकडे हलवा"}
                                  >
                                    <ArrowUp className="w-2.5 h-2.5 rotate-270" />
                                  </button>
                                )}
                                {pIdx < festival.photos.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMovePhoto(festival.id, pIdx, 1)}
                                    className="p-1 bg-black/60 hover:bg-gold-500 text-white hover:text-black rounded transition cursor-pointer"
                                    title={isEn ? "Move Right" : "उजवीकडे हलवा"}
                                  >
                                    <ArrowDown className="w-2.5 h-2.5 rotate-270" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeletePhoto(festival.id, photo.id)}
                                  className="p-1 bg-rose-700/80 hover:bg-rose-600 text-white rounded transition cursor-pointer"
                                  title={isEn ? "Delete photo from festival" : "हा फोटो उत्सवातून काढा"}
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>

                            {/* Caption Input */}
                            <input
                              type="text"
                              value={photo.captionMr || ""}
                              onChange={(e) => handlePhotoCaptionChange(festival.id, photo.id, "captionMr", e.target.value)}
                              placeholder={isEn ? "Caption (Optional)" : "फोटो मथळा / वर्णन"}
                              className="w-full px-2 py-1 text-xs font-medium rounded-lg border border-gold-300 bg-white text-gray-800 outline-none focus:border-amber-500"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-[#FFFDF9] rounded-xl border-2 border-dashed border-gold-300 text-stone-500 space-y-2">
                        <Camera className="w-8 h-8 text-gold-400 mx-auto opacity-70" />
                        <p className="text-xs font-bold text-maroon-950">
                          {isEn ? "No photos in this festival yet." : "या उत्सवात अद्याप कोणतेही फोटो जोडलेले नाहीत."}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {isEn 
                            ? "Click 'Upload Multiple Photos' above to select and upload photos for this festival." 
                            : "या उत्सवासाठी फोटो जोडण्याकरिता वरील 'एकाचवेळी अनेक फोटो निवडा व जोडा' बटणावर क्लिक करा."}
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          );
        })}

        {/* Empty State when zero festivals exist */}
        {festivals.length === 0 && (
          <div className="p-10 text-center bg-amber-50/50 rounded-2xl border-2 border-dashed border-gold-300 space-y-3">
            <ImageIcon className="w-12 h-12 text-gold-500 mx-auto opacity-70" />
            <h4 className="text-base font-bold text-maroon-950 font-heading">
              {isEn ? "No Festival Galleries Yet" : "कोणतीही उत्सव गॅलरी तयार नाही"}
            </h4>
            <p className="text-xs text-stone-600 max-w-md mx-auto">
              {isEn 
                ? "Click '+ Add Festival Gallery' to create your first festival folder (e.g. Ganesh Chaturthi 2026, Maha Aarti 2026, Visarjan 2026)." 
                : "आपली पहिली उत्सव गॅलरी तयार करण्यासाठी '+ नवीन उत्सव गॅलरी जोडा' वर क्लिक करा (उदा. श्री गणेश चतुर्थी २०२६, महाआरती २०२६, विसर्जन सोहळा २०२६)."}
            </p>
            <div className="pt-2">
              <FestiveButton onClick={handleAddFestival} icon={Plus} variant="primary" size="md">
                {isEn ? "+ Add Festival Gallery" : "+ नवीन उत्सव गॅलरी जोडा"}
              </FestiveButton>
            </div>
          </div>
        )}
      </div>

      {/* Floating Save Reminder */}
      <div className="mt-6 pt-4 border-t border-gold-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-stone-600">
          {isEn 
            ? "Remember to click 'Save All Changes' to make your changes visible on the website." 
            : "केलेले बदल वेबसाइटवर भाविकांना दिसण्यासाठी 'गॅलरी जतन करा (Save)' बटण नक्की दाबा."}
        </span>
        <FestiveButton
          onClick={handleSubmit}
          icon={Save}
          variant="primary"
          size="md"
          disabled={isSaving}
        >
          {isSaving 
            ? (isEn ? "Saving Changes..." : "जतन करत आहे...") 
            : (isEn ? "Save All Changes (गॅलरी जतन करा)" : "गॅलरी जतन करा (Save)")
          }
        </FestiveButton>
      </div>

      {/* Lightbox Single Image Preview Modal */}
      {previewModalImg && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => setPreviewModalImg(null)}
        >
          <div 
            className="relative bg-black rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden border-2 border-gold-400 shadow-2xl flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-rose-600 transition z-10 cursor-pointer"
              title={isEn ? "Close" : "बंद करा"}
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={getMediaUrl(previewModalImg)} 
              alt="Photo preview" 
              onError={handleImageError}
              className="max-h-[80vh] w-auto object-contain rounded-2xl p-2" 
            />
            <div className="p-2 text-center text-xs text-gold-300 font-mono truncate max-w-full px-4">
              {previewModalImg}
            </div>
          </div>
        </div>
      )}

      {/* Festival Gallery Live Preview Modal (Simulates Frontend View) */}
      {previewFestival && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-5 animate-fadeIn"
          onClick={() => setPreviewFestival(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] border-2 border-gold-400 shadow-2xl overflow-hidden relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-maroon-950 text-white flex items-center justify-between border-b border-gold-400/40">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gold-400 text-maroon-950 font-black px-2.5 py-0.5 rounded-full">
                  {previewFestival.category}
                </span>
                <span className="text-xs text-gold-300 font-bold">
                  {previewFestival.year}
                </span>
                <span className="text-xs bg-black/40 text-gold-200 px-2 py-0.5 rounded-full border border-gold-400/30">
                  {previewFestival.photos?.length || 0} {isEn ? "Photos" : "फोटो"}
                </span>
              </div>
              <button
                onClick={() => setPreviewFestival(null)}
                className="p-1 rounded-full text-gold-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-[#FFFDF9] to-[#FAF5EC]">
              {previewFestival.bannerUrl && (
                <div className="h-56 rounded-2xl overflow-hidden border-2 border-gold-300 relative bg-black shadow-md">
                  <img 
                    src={getMediaUrl(previewFestival.bannerUrl)} 
                    alt="Banner" 
                    onError={handleImageError}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] text-gold-300 font-bold uppercase">{isEn ? "Banner Photo" : "मुख्य कव्हर"}</span>
                    <h3 className="text-lg sm:text-xl font-black text-gold-100 font-heading">
                      {isEn ? (previewFestival.nameEn || previewFestival.titleEn) : (previewFestival.nameMr || previewFestival.titleMr)}
                    </h3>
                  </div>
                </div>
              )}

              {previewFestival.descMr && (
                <p className="text-xs text-stone-700 bg-white p-3 rounded-xl border border-gold-200">
                  {isEn ? (previewFestival.descEn || previewFestival.descMr) : previewFestival.descMr}
                </p>
              )}

              {/* Photos Grid */}
              <div className="space-y-2">
                <h5 className="text-xs font-black text-maroon-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isEn ? "Photos Collection" : "या उत्सवातील फोटो"}</span>
                </h5>

                {previewFestival.photos?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {previewFestival.photos.map((p, idx) => (
                      <div key={p.id || idx} className="h-28 rounded-xl overflow-hidden border border-gold-300 bg-black">
                        <img 
                          src={getMediaUrl(p.url)} 
                          alt="Photo" 
                          onError={handleImageError}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic p-4 text-center">
                    {isEn ? "No photos in this festival yet." : "या उत्सवात अद्याप कोणतेही फोटो नाहीत."}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#FAF5EC] border-t border-gold-200 flex justify-end">
              <button
                onClick={() => setPreviewFestival(null)}
                className="px-4 py-1.5 bg-maroon-850 text-gold-200 text-xs font-bold rounded-xl"
              >
                {isEn ? "Close Preview" : "पूर्वावलोकन बंद करा"}
              </button>
            </div>
          </div>
        </div>
      )}

    </FestiveCard>
  );
};

export default GalleryManager;
