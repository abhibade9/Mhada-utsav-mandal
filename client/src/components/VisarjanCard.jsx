import React from "react";
import { Waves, Clock, MapPin, Shield, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const VisarjanCard = () => {
  const { language } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-rose-950 via-maroon-900 to-maroon-950 text-white rounded-2xl border-2 border-gold-400/80 p-5 sm:p-7 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gold-500/30">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-200 bg-rose-900/60 px-3 py-1 rounded-full border border-rose-500/40">
            <Waves className="w-3.5 h-3.5 text-rose-300" /> 
            <span>{language === "mr" ? "भावपूर्ण निरोप व विसर्जन मिरवणूक" : "Farewell & Visarjan Procession"}</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gold-300 mt-1 font-heading">
            {language === "mr" ? "विसर्जन सोहळा व मिरवणूक मार्ग" : "Immersion Ceremony & Procession Route"}
          </h3>
          <p className="text-xs sm:text-sm text-gold-100/80">
            {language === "mr" 
              ? "अनंत चतुर्दशी - लाडक्या बाप्पाला पर्यावरणपूरक व शिस्तबद्ध निरोप" 
              : "Anant Chaturdashi - Eco-friendly and disciplined farewell to Bappa"}
          </p>
        </div>

        <div className="bg-maroon-950/80 px-3.5 py-2 rounded-xl border border-gold-500/40 text-xs">
          <div className="font-bold text-gold-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-festive-saffron" /> 
            <span>{language === "mr" ? "दुपारी ०३:३० वाजता" : "03:30 PM"}</span>
          </div>
          <div className="text-[11px] text-gray-300">
            {language === "mr" ? "मिरवणूक प्रस्थान" : "Procession Departure"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
        
        {/* Step 1 */}
        <div className="bg-maroon-950/70 p-4 rounded-xl border border-gold-500/20">
          <div className="text-gold-400 font-bold text-xs mb-1 uppercase tracking-wider">
            {language === "mr" ? "टप्पा १: उत्तरपूजा व आरती" : "Stage 1: Uttarpooja & Aarti"}
          </div>
          <div className="text-base font-bold text-white font-heading mb-1">
            {language === "mr" ? "दुपारी ०२:३० वाजता" : "02:30 PM"}
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            {language === "mr" 
              ? "मुख्य मंडपात सर्व भाविकांच्या उपस्थितीत अखेरची निरोप आरती व मंत्रपुष्पांजली." 
              : "Final farewell Aarti and Mantrapushpanjali in central pandal."}
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-maroon-950/70 p-4 rounded-xl border border-gold-500/20">
          <div className="text-gold-400 font-bold text-xs mb-1 uppercase tracking-wider">
            {language === "mr" ? "टप्पा २: भव्य मिरवणूक मार्ग" : "Stage 2: Procession Route"}
          </div>
          <div className="text-base font-bold text-white font-heading mb-1">
            {language === "mr" ? "दुपारी ०३:३० वाजता" : "03:30 PM"}
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            {language === "mr" 
              ? "मंडप → इमारत G, H → इमारत J, K → मुख्य प्रवेशद्वार परिक्रमा." 
              : "Pandal → Buildings G, H → Buildings J, K → Main Entrance Parikrama."}
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-maroon-950/70 p-4 rounded-xl border border-gold-500/20">
          <div className="text-gold-400 font-bold text-xs mb-1 uppercase tracking-wider">
            {language === "mr" ? "टप्पा ३: पर्यावरणपूरक विसर्जन" : "Stage 3: Eco Immersion"}
          </div>
          <div className="text-base font-bold text-white font-heading mb-1">
            {language === "mr" ? "संध्याकाळी ०६:३० वाजता" : "06:30 PM"}
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            {language === "mr" 
              ? "सोसायटी आवारात तयार करण्यात आलेल्या कृत्रिम हौदात १००% पर्यावरणपूरक विसर्जन." 
              : "100% eco-friendly immersion in artificial water tank within society premises."}
          </p>
        </div>

      </div>

      {/* Safety Notice */}
      <div className="mt-5 pt-4 border-t border-gold-500/20 flex items-center gap-2 text-xs text-gold-200">
        <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>
          {language === "mr" 
            ? "सुरक्षा नियम: लहान मुलांची काळजी घ्या, गर्दीत शिस्त पाळा, फटाके वाजवणे वर्ज्य आहे." 
            : "Safety Guidelines: Watch children, maintain line discipline, firecrackers are strictly prohibited."}
        </span>
      </div>
    </div>
  );
};

export default VisarjanCard;
