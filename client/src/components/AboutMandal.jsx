import React from "react";
import { 
  Building2, ShieldCheck, HeartHandshake, Leaf, Award, 
  PhoneCall, Mail, MapPin, Sparkles, Shield, Users 
} from "lucide-react";
import { useConfig } from "../context/ConfigContext";
import { useLanguage } from "../context/LanguageContext";
import { getAllWingsShortLabel, getWingCodesText } from "../utils/wingUtils";
import { getMediaUrl, handleImageError } from "../utils/mediaUrl";

const ICON_MAP = {
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Award,
  Shield,
  Building2
};

const AboutMandal = () => {
  const { config } = useConfig();
  const { language, t } = useLanguage();

  // If mandalInfo tab is disabled by admin, return null
  if (config?.tabs?.mandalInfo && !config.tabs.mandalInfo.enabled) {
    return null;
  }

  const info = config?.mandalInfo || {};
  const mandalName = language === "mr" ? (config?.mandalNameMr || "म्हाडा टॉवर्स उत्सव मंडळ") : (config?.mandalNameEn || "MHADA Towers Utsav Mandal");
  const helpline = info.helpline || config?.emergencyHelpline || "+91 98220 11223";
  const email = info.email || config?.email || "mhadatowersutsavmandal@gmail.com";
  const address = language === "mr" 
    ? (info.officeAddressMr || config?.addressMr || "पिंपरी वाघेरे, पिंपरी चिंचवड, पुणे - ४११०१७")
    : (info.officeAddressEn || config?.addressEn || "Pimpri Waghere, Pimpri Chinchwad, Pune - 411017");
  const motto = language === "mr" 
    ? (info.mottoMr || `॥ ${getAllWingsShortLabel(config, "mr")} - सहकार्य • शिस्त • अखंड भक्ती ॥`) 
    : (info.mottoEn || info.mottoMr || `॥ ${getAllWingsShortLabel(config, "en")} - Cooperation • Discipline • Devotion ॥`);
  const historyText = language === "mr" ? (info.historyMr || "") : (info.historyEn || info.historyMr || "");
  const pillarsList = info.pillars || [];
  const committeeList = info.committeeMembers || [];

  return (
    <section id="mandal-info" className="scroll-mt-20 my-10">
      <div className="bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EB] rounded-3xl border-2 border-gold-400 shadow-xl overflow-hidden p-5 sm:p-8 md:p-10 relative">
        
        {/* Subtle Decorative Aura */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-200/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-maroon-900 bg-gold-100 px-4 py-1.5 rounded-full border border-gold-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {language === "mr" 
                ? "अधिकृत मंडळ माहिती व पार्श्वभूमी" 
                : "Official Mandal History & Background"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-maroon-950 font-heading tracking-tight">
            {mandalName}
          </h2>

          <p className="text-sm sm:text-base font-bold text-festive-saffron mt-1.5">
            {motto}
          </p>

          <p className="text-xs sm:text-sm text-gray-700 mt-2 font-medium">
            {info.regDetails || (config?.regNo 
              ? (language === "mr" ? `नोंदणी क्र: ${config.regNo} - पुणे (धर्मादाय सहआयुक्त मान्यताप्राप्त)` : `Reg No: ${config.regNo} - Pune (Charity Commissioner Recognized)`) 
              : "")} 
            {info.establishedYear ? (language === "mr" ? ` • स्थापना: ${info.establishedYear}` : ` • Estd: ${info.establishedYear}`) : ""}
          </p>
        </div>

        {/* Story / About Mandal Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10 relative z-10">
          
          {/* Left: Official Circular Emblem */}
          <div className="lg:col-span-4 flex flex-col items-center text-center p-6 bg-gradient-to-b from-maroon-950 to-maroon-900 text-white rounded-2xl border-2 border-gold-400 shadow-md">
            <div className="relative mb-3">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-gold-400 via-amber-300 to-gold-500 shadow-xl overflow-hidden flex items-center justify-center bg-white">
                <img
                  src={getMediaUrl("/logo.jpg")}
                  alt="म्हाडा टॉवर्स लोगो"
                  className="w-full h-full rounded-full object-cover"
                  onError={handleImageError}
                />
              </div>
            </div>

            <h3 className="text-lg font-black text-gold-300 font-heading">
              {mandalName}
            </h3>
            <p className="text-xs text-gold-100/90 mt-1">
              {address}
            </p>
            
            <div className="w-full mt-4 pt-4 border-t border-gold-500/30 text-xs text-left space-y-2">
              {email && (
                <div className="flex items-center gap-2 text-gold-200">
                  <Mail className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                  <span className="font-mono text-[11px] truncate">{email}</span>
                </div>
              )}
              {helpline && (
                <div className="flex items-center gap-2 text-gold-200">
                  <PhoneCall className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                  <span>{helpline}</span>
                </div>
              )}
              {getWingCodesText(config) && (
                <div className="flex items-center gap-2 text-gold-200">
                  <Building2 className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                  <span>{language === "mr" ? "विंग्स:" : "Wings:"} {getWingCodesText(config, ", ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Narrative Story */}
          <div className="lg:col-span-8 space-y-4 text-gray-800 text-xs sm:text-sm leading-relaxed">
            {historyText && (
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-gold-300">
                <h4 className="text-sm sm:text-base font-black text-maroon-950 font-heading mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>{language === "mr" ? "आमचा इतिहास व संकल्प" : "Our Vision & Legacy"}</span>
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {historyText}
                </p>
              </div>
            )}

            {/* Pillars Grid */}
            {pillarsList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {pillarsList.map((p, i) => {
                  const IconComponent = ICON_MAP[p.icon] || ShieldCheck;
                  return (
                    <div key={i} className="p-3 bg-white rounded-xl border border-gold-200 shadow-2xs">
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="w-4 h-4 text-maroon-800 flex-shrink-0" />
                        <h5 className="font-bold text-maroon-950 text-xs sm:text-sm font-heading">
                          {language === "mr" ? p.titleMr : (p.titleEn || p.titleMr)}
                        </h5>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-600">
                        {language === "mr" ? p.descMr : (p.descEn || p.descMr)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Committee Members list if present */}
            {committeeList.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gold-200">
                <h5 className="text-xs uppercase font-extrabold text-maroon-900 tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-maroon-800" />
                  <span>{language === "mr" ? "मंडळ कार्यकारणी समिती" : "Managing Committee"}</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {committeeList.map((mem, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-xl border border-gray-200 text-xs">
                      <span className="text-[10px] font-bold text-maroon-800 bg-gold-100 px-2 py-0.5 rounded-full inline-block mb-1">
                        {language === "mr" ? mem.roleMr : (mem.roleEn || mem.roleMr)}
                      </span>
                      <p className="font-bold text-gray-900">{language === "mr" ? mem.nameMr : (mem.nameEn || mem.nameMr)}</p>
                      {mem.wing && <p className="text-[11px] text-gray-600">{mem.wing}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};

export default AboutMandal;
