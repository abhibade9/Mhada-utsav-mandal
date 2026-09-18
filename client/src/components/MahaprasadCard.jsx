import React from "react";
import { UtensilsCrossed, Clock, MapPin, CheckCircle, Ticket, Users } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";
import { getMahaprasadSlots, getAllWingsLabel } from "../utils/wingUtils";

const MahaprasadCard = () => {
  const { language } = useLanguage();
  const { config } = useConfig();

  const dynamicSlots = getMahaprasadSlots(config, language);
  const wingSlots = dynamicSlots.length > 0 ? dynamicSlots : [
    { wing: "G Wing (जी विंग)", slot: "दुपारी १२:३० ते ०१:१५" },
    { wing: "H Wing (एच विंग)", slot: "दुपारी ०१:१५ ते ०२:००" },
    { wing: "J Wing (जे विंग)", slot: "दुपारी ०२:०० ते ०२:४५" },
    { wing: "K Wing व उर्वरित अतिथी (के विंग)", slot: "दुपारी ०२:४५ ते ०३:३०" },
  ];

  const menuItems = language === "mr" ? [
    "गरमागरम पुरी व रस्सा बटाटा भाजी",
    "सुगंधी पारंपरिक मसालेभात व वरण",
    "तुपातील रवा शिरा नैवेद्य व गोड बुंदी",
    "ताक, पापड, लोणचे व शुद्ध पिण्याचे पाणी"
  ] : [
    "Hot Puris & Potato Curry (Bhaji)",
    "Fragrant Traditional Masale Bhaat & Varan",
    "Pure Ghee Sheera Naivedya & Sweet Boondi",
    "Chaas, Papad, Pickle & Purified Drinking Water"
  ];

  return (
    <div className="bg-white rounded-2xl border-2 border-gold-300 shadow-lg p-5 sm:p-7 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gold-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            <UtensilsCrossed className="w-3.5 h-3.5" /> 
            <span>{language === "mr" ? "महाप्रसाद वाटप विशेष दिन" : "Grand Mahaprasad Feast Day"}</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-maroon-900 mt-1 font-heading">
            {language === "mr" ? "भव्य महाप्रसाद व भोजन" : "Grand Mahaprasad Feast"}
          </h3>
          <p className="text-xs sm:text-sm text-maroon-700">
            {language === "mr" 
              ? `५ व्या दिवशी ${getAllWingsLabel(config, "mr")}मधील मालक, भाडेकरू व कुटुंबीयांसाठी स्नेहभोजन` 
              : `Day 5 Community Feast for all residents & families across ${getAllWingsLabel(config, "en")}`}
          </p>
        </div>

        <div className="flex-shrink-0 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs px-3 py-2 rounded-xl">
          <div className="font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-700" /> 
            <span>{language === "mr" ? "दुपारी १२:३० ते ०३:३०" : "12:30 PM to 03:30 PM"}</span>
          </div>
          <div className="text-[11px] text-gray-600">
            {language === "mr" ? "५वा दिवस (महाप्रसाद वार)" : "Day 5 (Feast Day)"}
          </div>
        </div>
      </div>

      {/* Grid: Menu & Wing Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Satvik Menu */}
        <div className="bg-[#FAF5EC] rounded-xl p-4 border border-gold-300/70">
          <h4 className="text-sm font-bold text-maroon-900 font-heading mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{language === "mr" ? "शुद्ध सात्विक महाप्रसाद मेनू:" : "Pure Satvik Mahaprasad Menu:"}</span>
          </h4>
          <ul className="space-y-1.5 text-xs sm:text-sm text-gray-800">
            {menuItems.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-600 flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-3 border-t border-gold-200 text-xs text-maroon-800 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-maroon-600 flex-shrink-0" />
            <span>{language === "mr" ? "विशेष भोजन मंडप: J व K विंग समोरील प्रांगण" : "Dining Venue: Ground in front of J & K Wings"}</span>
          </div>
        </div>

        {/* Wing-wise Time Allocation to prevent crowd */}
        <div className="bg-white rounded-xl p-4 border border-gold-300/70 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-maroon-900 font-heading mb-2 flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-maroon-700" />
              <span>{language === "mr" ? "गर्दी टाळण्यासाठी विंगनुसार वेळापत्रक:" : "Wing-wise Timings for Smooth Dining:"}</span>
            </h4>
            <div className="space-y-2">
              {wingSlots.map((ws, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs">
                  <span className="font-bold text-maroon-950">{ws.wing}</span>
                  <span className="font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                    {ws.slot}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MahaprasadCard;
