import React from "react";
import { Sparkles, Heart, Shield, Lock, Mail, Building2, Phone } from "lucide-react";
import { useConfig } from "../context/ConfigContext";
import { useLanguage } from "../context/LanguageContext";
import { getMediaUrl, handleImageError } from "../utils/mediaUrl";

// Official participating wings in strict required sequence: G -> H -> I -> J -> K
const OFFICIAL_WING_ORDER = ["G", "H", "I", "J", "K"];

const OFFICIAL_WINGS_DATA = {
  G: { code: "G", nameMr: "G विंग - नंदादेवी", nameEn: "G Wing - Nandadevi" },
  H: { code: "H", nameMr: "H विंग - निलगिरी", nameEn: "H Wing - Nilgiri" },
  I: { code: "I", nameMr: "I विंग - ब्रह्मगिरी", nameEn: "I Wing - Brahmagiri" },
  J: { code: "J", nameMr: "J विंग - पूर्वांचल", nameEn: "J Wing - Purvanchal" },
  K: { code: "K", nameMr: "K विंग - गोवर्धन", nameEn: "K Wing - Govardhan" }
};

const Footer = ({ onOpenAdminLogin }) => {
  const { config } = useConfig();
  const { language, t } = useLanguage();

  // Guaranteed official sequence: G -> H -> I -> J -> K
  const displayWings = OFFICIAL_WING_ORDER.map((code) => {
    const existing = config?.wings?.find(
      (w) => w.code?.toUpperCase() === code
    );
    return {
      code,
      nameMr: existing?.nameMr || OFFICIAL_WINGS_DATA[code].nameMr,
      nameEn: existing?.nameEn || OFFICIAL_WINGS_DATA[code].nameEn
    };
  });

  return (
    <footer className="bg-gradient-to-b from-maroon-950 via-maroon-900 to-[#180104] text-white border-t-2 border-gold-500/80 pt-10 pb-6 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Divine Shloka Banner */}
        <div className="text-center pb-8 border-b border-gold-500/20 max-w-2xl mx-auto">
          <p className="text-base sm:text-lg text-gold-300 font-heading font-bold tracking-wide">
            ॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="h-px w-12 bg-gold-500/40"></span>
            <span className="text-xs text-gold-400 font-bold">गणपती बाप्पा मोरया, मंगलमूर्ती मोरया</span>
            <span className="h-px w-12 bg-gold-500/40"></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 items-center text-center md:text-left">
          
          {/* Logo & Mandal Profile */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <img
              src={getMediaUrl("/logo.jpg")}
              alt="म्हाडा टॉवर्स उत्सव मंडळ"
              onError={handleImageError}
              className="w-16 h-16 rounded-full border-2 border-gold-400 shadow-lg object-cover flex-shrink-0"
            />
            <div>
              <h4 className="text-base sm:text-lg font-black text-gold-200 font-heading">
                {language === "mr" 
                  ? (config?.mandalNameMr || "म्हाडा टॉवर्स उत्सव मंडळ")
                  : (config?.mandalNameEn || "MHADA Towers Utsav Mandal")}
              </h4>
              <p className="text-xs text-gold-100/80 mt-0.5">
                {config?.addressMr || "पिंपरी वाघेरे, पिंपरी चिंचवड, पुणे - ४११०१७"}
              </p>
              <p className="text-[11px] text-festive-saffron font-bold mt-1">
                {config?.regNo ? `नोंदणी क्र: ${config.regNo}` : "नोंदणी क्र: १२४३/२०२५ - पुणे"}
              </p>
            </div>
          </div>

          {/* Participating Buildings Info */}
          <div className="text-center flex justify-center">
            <div className="w-full max-w-sm sm:max-w-md bg-maroon-850 px-4 sm:px-5 py-3.5 rounded-2xl border border-gold-500/40 shadow-inner">
              <span className="text-xs text-gold-300 font-bold block uppercase tracking-wider mb-2.5">
                {language === "mr" ? "सहभागी इमारती" : "Participating Buildings"}
              </span>

              {/* Official Wings List in Guaranteed Order G -> H -> I -> J -> K */}
              <div className="flex flex-col gap-1.5 my-2">
                {displayWings.map((wing) => (
                  <div
                    key={wing.code}
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-1.5 rounded-xl bg-maroon-900/70 border border-gold-500/25 hover:border-gold-500/45 transition-colors gap-0.5 sm:gap-2 text-center sm:text-left"
                  >
                    <span className="font-heading font-black text-white text-xs sm:text-[13px] tracking-wide">
                      {wing.nameMr}
                    </span>
                    <span className="text-[11px] text-gold-300/85 font-medium sm:text-right">
                      {wing.nameEn}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mandal Email */}
              {(config?.mandalInfo?.email || config?.email || "mhadatowersutsavmandal@gmail.com") && (
                <a 
                  href={`mailto:${config?.mandalInfo?.email || config?.email || "mhadatowersutsavmandal@gmail.com"}`} 
                  className="text-[11px] text-gold-300/90 hover:text-white inline-flex items-center justify-center gap-1.5 mt-2 underline transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                  <span>{config?.mandalInfo?.email || config?.email || "mhadatowersutsavmandal@gmail.com"}</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Admin Access & Security */}
          <div className="flex flex-col items-center md:items-end gap-2 text-xs">
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1.5 text-gold-300 hover:text-white bg-maroon-850 hover:bg-maroon-800 px-3.5 py-2 rounded-xl border border-gold-500/40 transition shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-gold-400" />
              <span>{t("adminLogin")}</span>
            </button>
            <p className="text-[11px] text-gray-400">
              सोसायटी ईमेलने सुरक्षित व्यवस्थापक प्रवेश
            </p>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-gold-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-400 text-center">
          <p>© २०२५ - २०२६ {config?.mandalNameMr || "म्हाडा टॉवर्स उत्सव मंडळ, पिंपरी वाघेरे, पुणे"}. सर्व हक्क सुरक्षित.</p>
          <p className="flex items-center gap-1 text-gold-400/80 font-medium">
            <span>डिजिटल महाराष्ट्र • बाप्पांची सेवा</span>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
