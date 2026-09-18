import React from "react";
import { ShieldCheck, Volume2, Car, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";

const ICON_MAP = {
  Volume2: Volume2,
  Car: Car,
  Sparkles: Sparkles,
  ShieldCheck: ShieldCheck,
  AlertTriangle: AlertTriangle
};

const MandalRules = () => {
  const { language } = useLanguage();
  const { config } = useConfig();

  // If rules tab is disabled by admin, return null
  if (config?.tabs?.rules && !config.tabs.rules.enabled) {
    return null;
  }

  const rulesList = config?.rules || [];
  if (rulesList.length === 0) {
    return null;
  }

  return (
    <section id="rules" className="scroll-mt-20 my-6">
      <div className="bg-white rounded-2xl border-2 border-gold-300 p-5 sm:p-7 shadow-md">
        <div className="mb-4 pb-3 border-b border-gold-200 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-800 bg-gold-100 px-3 py-1 rounded-full border border-gold-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 
              <span>{language === "mr" ? "मंडळ अधिकृत नियमावली" : "Official Mandal Rules"}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-maroon-900 mt-1 font-heading">
              {language === "mr" ? "सोसायटी व उत्सव आचारसंहिता (Common Rules)" : "Society & Festival Code of Conduct"}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rulesList.map((rule, idx) => {
            const Icon = ICON_MAP[rule.icon] || ShieldCheck;
            const title = language === "mr" ? (rule.titleMr || rule.title) : (rule.titleEn || rule.titleMr || rule.title);
            const desc = language === "mr" ? (rule.descMr || rule.desc) : (rule.descEn || rule.descMr || rule.desc);

            return (
              <div key={rule.id || idx} className="p-4 rounded-xl bg-gold-50/50 border border-gold-200 flex flex-col justify-between hover:border-gold-400 transition">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-maroon-850 text-gold-300 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-maroon-950 font-heading mb-1">
                    {title}
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MandalRules;
