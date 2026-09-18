import React, { useState, useEffect } from "react";
import { 
  SlidersHorizontal, Save, Sparkles, Heart, Eye, 
  EyeOff, CheckCircle2, Shield, Menu, Flame, Calendar,
  BarChart2, Users, Building2, Info, Image, PhoneCall,
  LayoutDashboard, Bell, Globe
} from "lucide-react";
import { 
  FestiveCard, FestiveToggle, FestiveInput, 
  FestiveButton, FestiveBadge 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";

const ICON_MAP = {
  dashboard: LayoutDashboard,
  liveUpdates: Sparkles,
  aartiSchedule: Flame,
  schedule: Calendar,
  upcoming: Sparkles,
  wings: Building2,
  polls: BarChart2,
  volunteer: Users,
  gallery: Image,
  contacts: PhoneCall,
  mandalInfo: Info,
  adminLogin: Shield
};

const SidebarManager = ({ config, onSaveSidebar, onNotify }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [items, setItems] = useState([]);
  const [showFloatingTrigger, setShowFloatingTrigger] = useState(true);
  const [bottomCardTagline, setBottomCardTagline] = useState("❤️ ४ विंग्स, एकच परिवार");
  const [bottomCardSubtag, setBottomCardSubtag] = useState("सहकार्य • शिस्त • अखंड भक्ती");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config?.sidebarMenu?.length) {
      setItems(JSON.parse(JSON.stringify(config.sidebarMenu)));
    }
    if (config?.sidebarSettings) {
      setShowFloatingTrigger(config.sidebarSettings.showFloatingTrigger !== false);
      if (config.sidebarSettings.bottomCardTagline) {
        setBottomCardTagline(config.sidebarSettings.bottomCardTagline);
      }
      if (config.sidebarSettings.bottomCardSubtag) {
        setBottomCardSubtag(config.sidebarSettings.bottomCardSubtag);
      }
    }
  }, [config]);

  const handleToggleItem = (index) => {
    const updated = [...items];
    updated[index].enabled = !updated[index].enabled;
    setItems(updated);
  };

  const handleChangeField = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    const payload = {
      sidebarMenu: items,
      sidebarSettings: {
        showFloatingTrigger,
        bottomCardTitle: "All 4 Wings",
        bottomCardSubtitle: "Wings G, H, J, K",
        bottomCardTagline,
        bottomCardSubtag
      }
    };
    const res = await onSaveSidebar(payload);
    setIsSaving(false);
    if (res?.success) {
      onNotify(isEn ? "Sidebar navigation settings saved successfully!" : "साइडबार मेनू व सेटिंग्ज यशस्वीरीत्या जतन केल्या!", "success");
    } else {
      onNotify(res?.message || (isEn ? "Failed to save settings" : "जतन करताना त्रुटी आली"), "error");
    }
  };

  return (
    <FestiveCard
      title={
        isEn 
          ? "Sidebar Menu & Navigation Control" 
          : "साइडबार मेनू व फ्लोटिंग बटण नियंत्रण"
      }
      subtitle={
        isEn
          ? "Manage visibility (show/hide), labels, and badges for each item in the sliding navigation menu."
          : "येथून आपण युजरला दिसणाऱ्या साइडबारमधील प्रत्येक पर्यायाची दृश्यमानता (Show/Hide), नाव व बॅज नियंत्रित करू शकता."
      }
      icon={SlidersHorizontal}
      badge={isEn ? "UI Navigation" : "युझर इंटरफेस"}
      action={
        <FestiveButton
          onClick={handleSave}
          icon={Save}
          variant="primary"
          size="md"
          disabled={isSaving}
        >
          {isSaving 
            ? (isEn ? "Saving..." : "जतन करत आहे...") 
            : (isEn ? "Save Sidebar (जतन करा)" : "बदल जतन करा (Save)")
          }
        </FestiveButton>
      }
    >
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Floating Button & Bottom Card Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EC] to-white rounded-2xl border-2 border-gold-300 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gold-200">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-xs font-black text-maroon-950 uppercase tracking-wider font-heading">
              {isEn ? "Floating Trigger & Footer Message" : "स्क्रीनवरील फ्लोटिंग बटण व तळपट्टी संदेश"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col justify-center p-3.5 rounded-2xl bg-white border-2 border-gold-300/80 shadow-xs">
              <label className="text-xs font-bold text-maroon-950 mb-2 font-heading">
                {isEn ? "Floating Menu Button" : "फ्लोटिंग मेनू बटण (Side Menu Trigger)"}
              </label>
              <FestiveToggle
                checked={showFloatingTrigger}
                onChange={setShowFloatingTrigger}
                activeText={isEn ? "VISIBLE" : "स्क्रीनवर दृश्यमान"}
                inactiveText={isEn ? "HIDDEN" : "लपवलेले"}
              />
            </div>

            <FestiveInput
              label={isEn ? "Sidebar Footer Tagline" : "साइडबार तळपट्टी संदेश (Tagline)"}
              icon={Heart}
              value={bottomCardTagline}
              onChange={(e) => setBottomCardTagline(e.target.value)}
              placeholder="❤️ ४ विंग्स, एकच परिवार"
            />

            <FestiveInput
              label={isEn ? "Sidebar Footer Subtag" : "तळपट्टी उपसंदेश (Subtag)"}
              icon={Sparkles}
              value={bottomCardSubtag}
              onChange={(e) => setBottomCardSubtag(e.target.value)}
              placeholder="सहकार्य • शिस्त • अखंड भक्ती"
            />
          </div>
        </div>

        {/* Sidebar Items List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs sm:text-sm font-black text-maroon-950 uppercase tracking-wider font-heading flex items-center gap-2">
              <span>{isEn ? `Sidebar Navigation Items (${items.length})` : `साइडबारमधील पर्याय सूची (${items.length})`}</span>
            </h4>
            <span className="text-[11px] text-stone-500 font-medium">
              {isEn ? "Toggle switch to show or hide items" : "टॉगल स्विचने पर्याय दाखवा/लपवा"}
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const Icon = ICON_MAP[item.id] || Sparkles;
              return (
                <div
                  key={item.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs ${
                    item.enabled
                      ? "bg-white border-gold-300 shadow-xs hover:border-gold-400"
                      : "bg-[#F8F6F1] border-stone-300/80 opacity-70"
                  }`}
                >
                  {/* Top on Mobile / Left on Desktop: Index, Name & Mobile Toggle */}
                  <div className="flex items-center justify-between gap-2 lg:min-w-[190px] flex-shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-xl bg-gold-200 text-maroon-950 font-black flex items-center justify-center text-xs border border-gold-400 shadow-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-maroon-900 text-gold-300 flex items-center justify-center flex-shrink-0 border border-gold-500/40">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-maroon-950 text-xs sm:text-sm block font-heading truncate">
                          {isEn ? (item.labelEn || item.labelMr) : item.labelMr}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium block truncate">
                          ID: {item.id}
                        </span>
                      </div>
                    </div>

                    {/* Mobile-only toggle */}
                    <div className="lg:hidden flex-shrink-0">
                      <FestiveToggle
                        checked={item.enabled}
                        onChange={() => handleToggleItem(idx)}
                        activeText={isEn ? "ON" : "सुरू"}
                        inactiveText={isEn ? "OFF" : "बंद"}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Center: Edit Marathi Label, English Label & Badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <FestiveInput
                      label={isEn ? "Marathi Name *" : "नाव (मराठी) *"}
                      value={item.labelMr}
                      onChange={(e) => handleChangeField(idx, "labelMr", e.target.value)}
                    />
                    <FestiveInput
                      label={isEn ? "English Name *" : "नाव (English) *"}
                      value={item.labelEn || ""}
                      onChange={(e) => handleChangeField(idx, "labelEn", e.target.value)}
                    />
                    <FestiveInput
                      label={isEn ? "Badge Tag" : "बॅज (Badge)"}
                      value={item.badge || ""}
                      onChange={(e) => handleChangeField(idx, "badge", e.target.value)}
                      placeholder={isEn ? "e.g. LIVE, 10 Days" : "उदा. LIVE, आरती, १० दिवस"}
                    />
                  </div>

                  {/* Desktop-only toggle switch */}
                  <div className="hidden lg:flex items-center justify-end min-w-[130px] flex-shrink-0">
                    <FestiveToggle
                      checked={item.enabled}
                      onChange={() => handleToggleItem(idx)}
                      activeText={isEn ? "SHOW" : "सुरू (Show)"}
                      inactiveText={isEn ? "HIDE" : "बंद (Hide)"}
                      size="md"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-4 border-t border-gold-200/80 flex justify-end">
          <FestiveButton
            type="submit"
            icon={Save}
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            disabled={isSaving}
          >
            {isSaving 
              ? (isEn ? "Saving..." : "जतन करत आहे...") 
              : (isEn ? "Save Sidebar Settings (बदल जतन करा)" : "साइडबार बदल जतन करा (Save Settings)")
            }
          </FestiveButton>
        </div>

      </form>
    </FestiveCard>
  );
};

export default SidebarManager;
