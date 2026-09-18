import React from "react";
import { FileText, Coins, Users, CheckSquare, ShieldCheck, AlertCircle } from "lucide-react";

const OwnersNotice = () => {
  const notices = [
    {
      title: "उत्सव निधी व ऐच्छिक वर्गणी जमा तपशील",
      category: "हिशोब व वर्गणी",
      date: "दैनिक अद्ययावत",
      desc: "सर्व ५ इमारतींचे (G, H, I, J, K) बहुसंख्य फ्लॅटधारक व रहिवाशांनी उत्सवासाठी उत्स्फूर्त ऐच्छिक वर्गणी दिली आहे. दैनिक जमा-खर्च हिशोब रजिस्टर व्यवस्थापकीय कार्यालयात तपासणीसाठी उपलब्ध आहे.",
      icon: Coins,
    },
    {
      title: "मंडळ कार्यकारी समिती सभा निर्णय",
      category: "समिती निर्णय",
      date: "८ सप्टेंबर २०२६",
      desc: "साऊंड सिस्टीम, विद्युत रोषणाई व भोजन मंडप कंत्राटदारांचे अंतिम देयक मंजूर करण्यात आले. रात्री १०:०० नंतर केवळ ध्वनी मर्यादेचे पालन करण्याचे निर्देश कंत्राटदारास देण्यात आले आहेत.",
      icon: CheckSquare,
    },
    {
      title: "पुढील वर्षाच्या कार्यकारिणी निवड व आढावा बैठक",
      category: "सर्वसाधारण सभा",
      date: "विसर्जनानंतरचा पहिला रविवार",
      desc: "विसर्जन सोहळ्यानंतर सर्व इमारत प्रतिनिधी व फ्लॅटधारकांची विशेष आढावा बैठक क्लब हाऊसमध्ये आयोजित केली जाईल. सर्व सदस्यांनी वेळेवर उपस्थित राहावे.",
      icon: Users,
    }
  ];

  return (
    <div className="bg-amber-50/70 rounded-2xl border-2 border-amber-300 p-5 sm:p-7 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-amber-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-400">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-800" /> सभासद व फ्लॅटधारक विशेष कट्टा
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-maroon-900 mt-1 font-heading">
            वर्गणी, जमा-खर्च व समिती निर्णय (Owners Notice Board)
          </h3>
          <p className="text-xs sm:text-sm text-maroon-700">
            म्हाडा टॉवर्स ५ विंग्स सोसायटीच्या पारदर्शकतेसाठी अधिकृत सूचना फलक
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-amber-950 bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>अधिकृत समिती दस्तऐवज</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {notices.map((n, i) => {
          const Icon = n.icon;
          return (
            <div key={i} className="bg-white rounded-xl p-4 border border-amber-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-maroon-850 bg-amber-100 px-2 py-0.5 rounded">
                    {n.category}
                  </span>
                  <span className="text-[11px] text-gray-500">{n.date}</span>
                </div>
                <h4 className="text-sm font-bold text-maroon-950 font-heading mb-1.5">
                  {n.title}
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {n.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-1 text-[11px] text-maroon-700 font-semibold">
                <Icon className="w-3.5 h-3.5 text-gold-600" />
                <span>समिती मान्य नोंद</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OwnersNotice;
