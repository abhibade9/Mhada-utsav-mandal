import React, { useState, useEffect } from "react";
import { 
  Save, Settings, Sparkles, PhoneCall, QrCode, 
  Flame, Megaphone, Globe, Building2, Tag 
} from "lucide-react";
import { 
  FestiveCard, FestiveInput, FestiveTextarea, 
  FestiveButton 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";

const GeneralSettings = ({ config, onSaveGeneral, onSwitchTab }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    mandalNameMr: "",
    mandalNameEn: "",
    regNo: "",
    festivalYear: "",
    marqueeText: "",
    festivalStatus: "",
    emergencyHelpline: "",
    whatsAppCommunityLink: ""
  });

  useEffect(() => {
    if (config) {
      setForm({
        mandalNameMr: config.mandalNameMr || "म्हाडा टॉवर्स उत्सव मंडळ",
        mandalNameEn: config.mandalNameEn || "MHADA Towers Utsav Mandal",
        regNo: config.regNo || "१२४३/२०२५ - पुणे",
        festivalYear: config.festivalYear || "२०२५ - २०२६",
        marqueeText: config.marqueeText || "",
        festivalStatus: config.festivalStatus || "उत्सव सुरू आहे",
        emergencyHelpline: config.emergencyHelpline || "+91 98220 11223",
        whatsAppCommunityLink: config.whatsAppCommunityLink || ""
      });
    }
  }, [config]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSaveGeneral(form);
    setIsSaving(false);
  };

  return (
    <FestiveCard
      title={
        isEn 
          ? "Ticker Scroller & General Settings" 
          : "स्क्रोलर टिकर व सर्वसाधारण सेटिंग्ज"
      }
      subtitle={
        isEn
          ? "Manage the top marquee ticker, Mandal registered name, registration number, festival year, status badge, and WhatsApp link."
          : "वेबसाईटवरील शीर्षस्थ धावणारी पट्टी, मंडळाचे अधिकृत नाव, नोंदणी क्रमांक, उत्सव वर्ष, स्थिती बॅज व व्हॉट्सॲप लिंक नियंत्रित करा."
      }
      icon={Settings}
      badge={isEn ? "General Settings" : "सामान्य सेटिंग्ज"}
      action={
        <FestiveButton
          onClick={handleSubmit}
          icon={Save}
          variant="primary"
          size="md"
          disabled={isSaving}
        >
          {isSaving 
            ? (isEn ? "Saving..." : "जतन करत आहे...") 
            : (isEn ? "Save Settings (बदल जतन करा)" : "बदल जतन करा (Save)")
          }
        </FestiveButton>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        
        {/* Mandal Brand Info Section */}
        <div className="space-y-4 p-4 sm:p-5 bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EC] to-white rounded-2xl border-1.5 border-gold-300/80 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-gold-200">
            <Building2 className="w-4 h-4 text-maroon-800" />
            <span className="text-xs font-black text-maroon-950 uppercase tracking-wider font-heading">
              {isEn ? "Official Mandal Brand Information" : "मंडळ अधिकृत नाव व नोंदणी माहिती (Brand Information)"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveInput
              label={isEn ? "Mandal Name (Marathi) *" : "मंडळाचे नाव (मराठी) *"}
              icon={Building2}
              value={form.mandalNameMr}
              onChange={(e) => setForm({ ...form, mandalNameMr: e.target.value })}
              placeholder="उदा. म्हाडा टॉवर्स उत्सव मंडळ"
              required
            />

            <FestiveInput
              label={isEn ? "Mandal Name (English)" : "Mandal Name (English)"}
              icon={Globe}
              value={form.mandalNameEn}
              onChange={(e) => setForm({ ...form, mandalNameEn: e.target.value })}
              placeholder="e.g. MHADA Towers Utsav Mandal"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveInput
              label={isEn ? "Registration Number" : "धर्मादाय नोंदणी क्रमांक (Registration No)"}
              icon={Tag}
              value={form.regNo}
              onChange={(e) => setForm({ ...form, regNo: e.target.value })}
              placeholder={isEn ? "e.g. 1243/2025 - Pune" : "उदा. १२४३/२०२५ - पुणे"}
            />

            <FestiveInput
              label={isEn ? "Festival Year" : "उत्सव वर्ष (Festival Year)"}
              icon={Sparkles}
              value={form.festivalYear}
              onChange={(e) => setForm({ ...form, festivalYear: e.target.value })}
              placeholder={isEn ? "2025 - 2026" : "उदा. २०२५ - २०२६"}
            />
          </div>
        </div>

        {/* Dynamic Scroller Hub Link */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/80 via-white to-gold-50/40 rounded-2xl border-2 border-gold-400 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-600 animate-diya-flicker fill-amber-300" />
              <span className="text-xs sm:text-sm font-black text-maroon-950 uppercase tracking-wider font-heading">
                {isEn ? "Dynamic Important Update Scroller" : "महत्वाचे अपडेट स्क्रोलर (Dynamic Scroller Hub)"}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-tight">
              {isEn 
                ? "Add, Edit, Delete, Reorder, Enable/Disable, and Schedule multiple scrolling announcements." 
                : "सर्व धावणाऱ्या सूचना जोडणे, संपादित करणे, क्रम बदलणे, सुरू/बंद करणे व वेळापत्रक ठरवण्यासाठी व्यवस्थापक वापरा."}
            </p>
          </div>
          {onSwitchTab && (
            <FestiveButton
              type="button"
              onClick={() => onSwitchTab("scroller")}
              icon={Flame}
              variant="primary"
              size="sm"
            >
              {isEn ? "Manage Scroller Messages →" : "स्क्रोलर संदेश व्यवस्थापित करा →"}
            </FestiveButton>
          )}
        </div>

        {/* Festival Status & Helpline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FestiveInput
            label={isEn ? "Festival Status Badge" : "उत्सव सद्यस्थिती (Status Badge)"}
            icon={Sparkles}
            value={form.festivalStatus}
            onChange={(e) => setForm({ ...form, festivalStatus: e.target.value })}
            placeholder={isEn ? "e.g. Festival Live / Pre-festival preparations" : "उदा. उत्सव सुरू आहे / आगमन पूर्व तयारी"}
            helperText={isEn ? "Displayed as a live status badge on the website." : "वेबसाईटवर स्टेटस बॅज म्हणून दिसेल."}
          />

          <FestiveInput
            label={isEn ? "Main Emergency Helpline Number" : "तातडीचा मुख्य हेल्पलाइन क्रमांक"}
            icon={PhoneCall}
            value={form.emergencyHelpline}
            onChange={(e) => setForm({ ...form, emergencyHelpline: e.target.value })}
            placeholder="+91 98220 11223"
            helperText={isEn ? "Displayed directly in emergency and contact desk." : "आपत्कालीन संपर्क कक्षामध्ये थेट प्रदर्शित होईल."}
          />
        </div>

        {/* WhatsApp Group Link */}
        <div className="p-4 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 rounded-2xl border-1.5 border-emerald-300/80">
          <FestiveInput
            label={isEn ? "Official WhatsApp Group / Community Invite Link" : "अधिकृत व्हॉट्सॲप ग्रुप / कम्युनिटी लिंक (WhatsApp Group Link)"}
            icon={QrCode}
            value={form.whatsAppCommunityLink}
            onChange={(e) => setForm({ ...form, whatsAppCommunityLink: e.target.value })}
            placeholder="https://chat.whatsapp.com/..."
            helperText={isEn ? "Updating this link will automatically regenerate the WhatsApp QR code on the website." : "ही लिंक बदलल्यास वेबसाईटवरील QR कोड आपोआप नवीन ग्रुपसाठी अपडेट होईल."}
          />
        </div>

        {/* Bottom Save Action */}
        <div className="pt-2 flex justify-end">
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
              : (isEn ? "Save All Settings (सर्व बदल जतन करा)" : "सर्व बदल जतन करा (Save Settings)")
            }
          </FestiveButton>
        </div>

      </form>
    </FestiveCard>
  );
};

export default GeneralSettings;
