import React, { useState, useEffect } from "react";
import { 
  Building2, Save, Plus, Trash2, Phone, Calendar, Users, Sparkles 
} from "lucide-react";
import { 
  FestiveCard, FestiveInput, FestiveButton 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";

const WingsManager = ({ config, onSaveWings, onNotify }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isSaving, setIsSaving] = useState(false);
  const [wings, setWings] = useState([]);

  useEffect(() => {
    if (config?.wings && config.wings.length > 0) {
      setWings(JSON.parse(JSON.stringify(config.wings)));
    } else {
      setWings([
        { code: "G", nameMr: "G - नंदादेवी", nameEn: "G - Nandadevi", sacredNameMr: "नंदादेवी", flatsCount: "४०", coordinatorLead: "श्री. सचिन पाटील", coordinatorPhone: "+91 98220 11223", aartiReservedDays: "दिवस १ व ५" },
        { code: "H", nameMr: "H - निलगिरी", nameEn: "H - Nilgiri", sacredNameMr: "निलगिरी", flatsCount: "४०", coordinatorLead: "श्री. विजय पवार", coordinatorPhone: "+91 94220 77882", aartiReservedDays: "दिवस २ व ६" },
        { code: "J", nameMr: "J - पूर्वांचल", nameEn: "J - Purvanchal", sacredNameMr: "पूर्वांचल", flatsCount: "४०", coordinatorLead: "श्री. निलेश मोरे", coordinatorPhone: "+91 94220 77884", aartiReservedDays: "दिवस ३ व ७" },
        { code: "K", nameMr: "K - गोवर्धन", nameEn: "K - Govardhan", sacredNameMr: "गोवर्धन", flatsCount: "४०", coordinatorLead: "श्री. गणेश जाधव", coordinatorPhone: "+91 94220 77885", aartiReservedDays: "दिवस ४ व ८" }
      ]);
    }
  }, [config]);

  const handleAddWing = () => {
    const nextChar = String.fromCharCode(65 + wings.length);
    setWings([
      ...wings,
      {
        code: nextChar,
        nameMr: `${nextChar} विंग`,
        nameEn: `${nextChar} Wing`,
        sacredNameMr: "",
        flatsCount: "४०",
        coordinatorLead: "",
        coordinatorPhone: "",
        aartiReservedDays: ""
      }
    ]);
  };

  const handleRemoveWing = (idx) => {
    if (window.confirm(isEn ? "Remove this building from the list?" : "ही इमारत यादीतून काढायची आहे का?")) {
      setWings(wings.filter((_, i) => i !== idx));
    }
  };

  const handleChange = (idx, field, val) => {
    const updated = [...wings];
    updated[idx][field] = val;
    setWings(updated);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    const res = await onSaveWings(wings);
    setIsSaving(false);
    if (res?.success) {
      if (onNotify) onNotify(isEn ? "Participating buildings updated!" : "सहभागी इमारती अद्ययावत केल्या!");
    } else {
      if (onNotify) onNotify(isEn ? "Failed to save buildings" : "इमारती जतन करताना त्रुटी आली", "error");
    }
  };

  return (
    <FestiveCard
      title={
        isEn 
          ? "Participating Wings & Leads Manager" 
          : "सहभागी इमारती व विंग प्रमुख व्यवस्थापक"
      }
      subtitle={
        isEn
          ? "Manage all participating buildings, names, flat counts, wing coordinators, and reserved Aarti days."
          : "उत्सवात सहभागी असलेल्या सर्व इमारती, त्यांची नावे, फ्लॅट संख्या, विंग समन्वयक आणि आरक्षित महाआरती दिवस येथून नियंत्रित करा."
      }
      icon={Building2}
      badge={isEn ? "Wings Management" : "इमारत व्यवस्थापन"}
      action={
        <div className="flex items-center gap-2">
          <FestiveButton
            onClick={handleAddWing}
            icon={Plus}
            variant="secondary"
            size="md"
          >
            {isEn ? "Add New Wing" : "नवीन इमारत जोडा"}
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
              : (isEn ? "Save Wings (इमारती जतन करा)" : "इमारती जतन करा (Save)")
            }
          </FestiveButton>
        </div>
      }
    >
      <div className="space-y-4">
        {wings.map((w, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-gold-300 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gold-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-maroon-850 text-gold-300 font-bold flex items-center justify-center text-xs">
                  {w.code || idx + 1}
                </span>
                <h4 className="text-sm font-black text-maroon-950 font-heading">
                  {isEn ? (w.nameEn || w.nameMr || `Building ${idx + 1}`) : (w.nameMr || `इमारत ${idx + 1}`)}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveWing(idx)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                title={isEn ? "Remove Wing" : "इमारत काढा"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FestiveInput
                label={isEn ? "Wing Code (e.g. G, H)" : "विंग कोड (e.g. G, H)"}
                value={w.code}
                onChange={(e) => handleChange(idx, "code", e.target.value)}
                placeholder="G"
              />
              <FestiveInput
                label={isEn ? "Marathi Name *" : "नाव (मराठी) *"}
                value={w.nameMr}
                onChange={(e) => handleChange(idx, "nameMr", e.target.value)}
                placeholder="G - नंदादेवी"
              />
              <FestiveInput
                label={isEn ? "English Name *" : "नाव (English) *"}
                value={w.nameEn}
                onChange={(e) => handleChange(idx, "nameEn", e.target.value)}
                placeholder="G - Nandadevi"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <FestiveInput
                label={isEn ? "Sacred Name" : "पवित्र नाव (Sacred Name)"}
                value={w.sacredNameMr}
                onChange={(e) => handleChange(idx, "sacredNameMr", e.target.value)}
                placeholder={isEn ? "e.g. Nandadevi" : "उदा. नंदादेवी"}
              />
              <FestiveInput
                label={isEn ? "Flats Count" : "फ्लॅट्स संख्या"}
                value={w.flatsCount}
                onChange={(e) => handleChange(idx, "flatsCount", e.target.value)}
                placeholder={isEn ? "e.g. 40" : "उदा. ४०"}
              />
              <FestiveInput
                label={isEn ? "Wing Lead / Coordinator" : "विंग प्रमुख (Lead Name)"}
                value={w.coordinatorLead}
                onChange={(e) => handleChange(idx, "coordinatorLead", e.target.value)}
                placeholder={isEn ? "e.g. Mr. Sachin Patil" : "उदा. श्री. सचिन पाटील"}
              />
              <FestiveInput
                label={isEn ? "Mobile Number" : "मोबाईल क्र."}
                icon={Phone}
                value={w.coordinatorPhone}
                onChange={(e) => handleChange(idx, "coordinatorPhone", e.target.value)}
                placeholder="+91 98220..."
              />
            </div>

            <FestiveInput
              label={isEn ? "Aarti Reserved Days" : "आरक्षित आरती दिवस (Aarti Reserved Days)"}
              icon={Calendar}
              value={w.aartiReservedDays}
              onChange={(e) => handleChange(idx, "aartiReservedDays", e.target.value)}
              placeholder={isEn ? "e.g. Day 1 & 5 (Morning & Evening)" : "उदा. दिवस १ व ५ (सकाळी व संध्याकाळी)"}
            />
          </div>
        ))}
      </div>
    </FestiveCard>
  );
};

export default WingsManager;
