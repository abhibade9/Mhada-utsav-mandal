import React from "react";
import { 
  ShieldCheck, Flame, Calendar, Megaphone, Newspaper, 
  Building2, Image as ImageIcon, Sparkles, Phone, FileText, 
  Info, Eye, EyeOff 
} from "lucide-react";
import { FestiveCard, FestiveToggle, FestiveBadge } from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";

const TAB_ICON_MAP = {
  announcements: Megaphone,
  newsletter: Newspaper,
  wings: Building2,
  events: Calendar,
  aarti: Flame,
  schedule: Calendar,
  cultural: Sparkles,
  upcoming: Sparkles,
  gallery: ImageIcon,
  rules: FileText,
  contacts: Phone,
  polls: Sparkles,
  volunteer: ShieldCheck,
  mandalInfo: Info,
  about: Info,
  arrival: Sparkles,
  prasad: Sparkles,
  visarjan: Flame,
  ownersNotice: FileText,
  whatsapp: Sparkles
};

const TabApprovals = ({ config, onToggleTab }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  return (
    <FestiveCard
      title={
        isEn 
          ? "Website Tabs & Section Approvals Manager" 
          : "वेबसाईट टॅब व विभाग मान्यता व्यवस्थापक"
      }
      subtitle={
        isEn
          ? "Enable (approve & publish) or disable (hide) any section on the main website in real-time. Changes reflect immediately."
          : "येथून आपण मुख्य वेबसाईटवरील प्रत्येक टॅब चालू (Approve / Publish) किंवा बंद (Hide) करू शकता. बदल थेट रिअल-टाइममध्ये वेबसाईटवर लागू होतात."
      }
      icon={ShieldCheck}
      badge={isEn ? "Real-Time Control" : "रिअल-टाइम नियंत्रण"}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config?.tabs &&
          Object.entries(config.tabs).map(([key, tab]) => {
            const Icon = TAB_ICON_MAP[key] || ShieldCheck;
            const isEnabled = Boolean(tab.enabled);

            return (
              <div
                key={key}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between gap-3 ${
                  isEnabled
                    ? "bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 border-gold-400/90 shadow-xs hover:border-gold-500 hover:shadow-md"
                    : "bg-[#F7F5F0] border-stone-300/80 opacity-75 hover:opacity-90"
                }`}
              >
                {/* Left side: Icon, Primary label, Secondary label, and Status Badge */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-all ${
                      isEnabled
                        ? "bg-gradient-to-br from-maroon-900 to-maroon-850 text-gold-300 border-gold-400 shadow-inner"
                        : "bg-stone-200 text-stone-600 border-stone-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-maroon-950 font-heading truncate">
                        {isEn ? (tab.labelEn || tab.labelMr) : tab.labelMr}
                      </h4>
                      <span className="text-[11px] text-stone-500 font-medium">
                        ({isEn ? tab.labelMr : (tab.labelEn || tab.labelMr)})
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5">
                      {isEnabled ? (
                        <FestiveBadge variant="gold" icon={Eye}>
                          {isEn ? "Approved & Live" : "मान्य व प्रकाशित"}
                        </FestiveBadge>
                      ) : (
                        <FestiveBadge variant="gray" icon={EyeOff}>
                          {isEn ? "Hidden / Inactive" : "अप्रकाशित / बंद"}
                        </FestiveBadge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Modern Festive Toggle Switch */}
                <div className="flex-shrink-0">
                  <FestiveToggle
                    checked={isEnabled}
                    onChange={() => onToggleTab(key)}
                    activeText={isEn ? "ON" : "सुरू"}
                    inactiveText={isEn ? "OFF" : "बंद"}
                    size="md"
                  />
                </div>
              </div>
            );
          })}
      </div>
    </FestiveCard>
  );
};

export default TabApprovals;
