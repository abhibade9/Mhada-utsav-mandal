import React, { useState, useEffect } from "react";
import { 
  FileText, Save, Plus, Trash2, ShieldCheck, Volume2, Car, Sparkles, AlertTriangle, Share2 
} from "lucide-react";
import { 
  FestiveCard, FestiveInput, FestiveTextarea, FestiveButton 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";
import { formatSocietyRulesBroadcast, openWhatsApp } from "../../utils/whatsappFormatter";

const ICON_OPTIONS_MR = [
  { value: "ShieldCheck", label: "सुरक्षा / शील्ड (ShieldCheck)" },
  { value: "Volume2", label: "ध्वनी मर्यादा (Volume2)" },
  { value: "Car", label: "पार्किंग / वाहने (Car)" },
  { value: "Sparkles", label: "स्वच्छता / पवित्रता (Sparkles)" },
  { value: "AlertTriangle", label: "महत्वाची सूचना (AlertTriangle)" }
];

const ICON_OPTIONS_EN = [
  { value: "ShieldCheck", label: "Security & Shield (ShieldCheck)" },
  { value: "Volume2", label: "Noise Control & Silence (Volume2)" },
  { value: "Car", label: "Parking & Vehicles (Car)" },
  { value: "Sparkles", label: "Cleanliness & Eco-Friendly (Sparkles)" },
  { value: "AlertTriangle", label: "Important Alert (AlertTriangle)" }
];

const RulesManager = ({ config, onSaveRules, onNotify }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isSaving, setIsSaving] = useState(false);
  const [rules, setRules] = useState([]);

  useEffect(() => {
    if (config?.rules) {
      setRules(JSON.parse(JSON.stringify(config.rules)));
    }
  }, [config]);

  const handleAddRule = () => {
    setRules([
      ...rules,
      {
        id: Date.now(),
        titleMr: "नवीन सोसायटी नियम",
        titleEn: "New Society Rule",
        descMr: "कृपया सर्व रहिवाशांनी नियमांचे पालन करावे.",
        descEn: "All residents are requested to adhere to rules.",
        icon: "ShieldCheck"
      }
    ]);
  };

  const handleRemoveRule = (idx) => {
    if (window.confirm(isEn ? "Are you sure you want to remove this rule?" : "हा नियम काढून टाकायचा आहे का?")) {
      setRules(rules.filter((_, i) => i !== idx));
    }
  };

  const handleChange = (idx, field, val) => {
    const updated = [...rules];
    updated[idx][field] = val;
    setRules(updated);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    const res = await onSaveRules(rules);
    setIsSaving(false);
    if (res?.success) {
      if (onNotify) onNotify(isEn ? "Society rules updated successfully!" : "मंडळ नियमावली अद्ययावत केली!");
    } else {
      if (onNotify) onNotify(isEn ? "Failed to save rules" : "नियमावली जतन करताना त्रुटी आली", "error");
    }
  };

  const iconOptions = isEn ? ICON_OPTIONS_EN : ICON_OPTIONS_MR;

  return (
    <FestiveCard
      title={
        isEn 
          ? "Society Code of Conduct & Rules Manager" 
          : "सोसायटी आचारसंहिता व नियमावली व्यवस्थापक"
      }
      subtitle={
        isEn
          ? "Manage official society guidelines on noise limits, parking, cleanliness, and eco-friendly celebrations."
          : "वेबसाईटवरील 'मंडळ अधिकृत नियमावली' कार्ड्स मधील ध्वनी, पार्किंग, स्वच्छता व पर्यावरणविषयक नियम व्यवस्थापित करा."
      }
      icon={FileText}
      badge={isEn ? "Society Rules" : "नियमावली"}
      action={
        <div className="flex items-center gap-2">
          <FestiveButton
            onClick={() => {
              const text = formatSocietyRulesBroadcast(rules, config, isEn);
              openWhatsApp(text);
            }}
            icon={Share2}
            variant="gold"
            size="md"
            title={isEn ? "Share Rules on WhatsApp" : "नियमावली व्हॉट्सॲपवर शेअर करा"}
          >
            {isEn ? "Share on WhatsApp" : "व्हॉट्सॲपवर शेअर करा"}
          </FestiveButton>
          <FestiveButton
            onClick={handleAddRule}
            icon={Plus}
            variant="secondary"
            size="md"
          >
            {isEn ? "Add New Rule" : "नवीन नियम जोडा"}
          </FestiveButton>
          <FestiveButton
            onClick={handleSubmit}
            icon={Save}
            variant="primary"
            size="md"
            disabled={isSaving}
          >
            {isSaving 
              ? (isEn ? "Saving..." : "जतन करत आहे...") 
              : (isEn ? "Save Rules (नियम जतन करा)" : "नियम जतन करा (Save)")
            }
          </FestiveButton>
        </div>
      }
    >
      <div className="space-y-4">
        {rules.map((rule, idx) => (
          <div
            key={rule.id || idx}
            className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-gold-300 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-gold-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-maroon-850 text-gold-300 font-bold flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
                <h4 className="text-sm font-black text-maroon-950 font-heading">
                  {isEn ? (rule.titleEn || rule.titleMr || rule.title || `Rule ${idx + 1}`) : (rule.titleMr || rule.title || `नियम ${idx + 1}`)}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveRule(idx)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                title={isEn ? "Remove rule" : "नियम काढा"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FestiveInput
                label={isEn ? "Rule Title (Marathi) *" : "नियम शीर्षक (मराठी) *"}
                value={rule.titleMr || rule.title || ""}
                onChange={(e) => {
                  handleChange(idx, "titleMr", e.target.value);
                  handleChange(idx, "title", e.target.value);
                }}
                placeholder="उदा. ध्वनी मर्यादा व शांतता नियम"
              />
              <FestiveInput
                label={isEn ? "Rule Title (English)" : "Rule Title (English)"}
                value={rule.titleEn || ""}
                onChange={(e) => handleChange(idx, "titleEn", e.target.value)}
                placeholder="e.g. Sound Limit & Silence Rules"
              />
              <div>
                <label className="block text-xs font-bold text-maroon-950 mb-1">
                  {isEn ? "Icon" : "चिन्ह (Icon)"}
                </label>
                <select
                  value={rule.icon || "ShieldCheck"}
                  onChange={(e) => handleChange(idx, "icon", e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gold-300 focus:border-maroon-850 outline-none bg-white"
                >
                  {iconOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FestiveTextarea
                label={isEn ? "Rule Description (Marathi) *" : "नियमाचा सविस्तर तपशील (मराठी) *"}
                rows={2}
                value={rule.descMr || rule.desc || ""}
                onChange={(e) => {
                  handleChange(idx, "descMr", e.target.value);
                  handleChange(idx, "desc", e.target.value);
                }}
                placeholder="शासकीय नियमांनुसार रात्री १०:०० नंतर ध्वनिक्षेपक पूर्णपणे बंद राहील..."
              />
              <FestiveTextarea
                label={isEn ? "Rule Description (English)" : "English Description"}
                rows={2}
                value={rule.descEn || ""}
                onChange={(e) => handleChange(idx, "descEn", e.target.value)}
                placeholder="As per norms, loudspeakers will be turned off post 10:00 PM..."
              />
            </div>
          </div>
        ))}
      </div>
    </FestiveCard>
  );
};

export default RulesManager;
