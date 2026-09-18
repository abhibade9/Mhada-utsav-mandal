import React from "react";
import { Building2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";

const WingFilter = ({ selectedWing, onSelectWing }) => {
  const { language } = useLanguage();
  const { config } = useConfig();

  // If wings tab is disabled by admin, return null
  if (config?.tabs?.wings && !config.tabs.wings.enabled) {
    return null;
  }

  const wingsList = [
    { code: "All", nameMr: "सर्व इमारती (All)", nameEn: "All Buildings" }
  ];

  if (config?.wings && config.wings.length > 0) {
    config.wings.forEach((w) => {
      wingsList.push({
        code: w.code,
        nameMr: w.nameMr || `${w.code} - ${w.sacredNameMr || ""}`,
        nameEn: w.nameEn || `${w.code} - ${w.sacredNameEn || ""}`
      });
    });
  } else if (config?.participatingWings && config.participatingWings.length > 0) {
    config.participatingWings.forEach((code) => {
      wingsList.push({
        code,
        nameMr: `विंग ${code}`,
        nameEn: `Wing ${code}`
      });
    });
  }

  return (
    <div className="w-full bg-[#FAF5EB] border-y-2 border-gold-400/60 py-3 px-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
        
        <div className="flex items-center gap-2 text-xs sm:text-sm text-maroon-950 font-bold">
          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-maroon-800 flex-shrink-0" />
          <span>
            {language === "mr" ? "सहभागी इमारती:" : "Participating Buildings:"}
          </span>
          <span className="hidden lg:inline text-maroon-700 font-medium text-xs">
            {language === "mr" 
              ? "आपल्या विंगचे विशेष नियोजन व आरती वेळा पाहण्यासाठी निवडा"
              : "Select building to view specific Aarti schedule & updates"
            }
          </span>
        </div>

        {/* Wing Pills Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {wingsList.map((wing) => {
            const isSelected =
              (wing.code === "All" && (selectedWing === "All" || !selectedWing)) ||
              selectedWing === wing.code;

            return (
              <button
                key={wing.code}
                onClick={() => onSelectWing(wing.code)}
                className={`flex-shrink-0 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 border ${
                  isSelected
                    ? "bg-maroon-850 text-gold-200 border-gold-500 shadow-md transform scale-105"
                    : "bg-white text-maroon-900 hover:bg-gold-100/80 border-gold-300 shadow-2xs"
                }`}
              >
                {language === "mr" ? wing.nameMr : wing.nameEn}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default WingFilter;
