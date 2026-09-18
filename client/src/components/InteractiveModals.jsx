import React, { useState } from "react";
import { 
  X, BarChart2, Users, Building2, Image as ImageIcon, 
  CheckCircle2, Sparkles, Send, MapPin, PhoneCall, AlertCircle 
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useConfig } from "../context/ConfigContext";
import API from "../services/api";
import { getMediaUrl, handleImageError } from "../utils/mediaUrl";

export const ResidentPollsModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { config, castVote } = useConfig();
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const poll = config?.poll || {};
  const question = language === "mr" 
    ? (poll.questionMr || poll.question) 
    : (poll.questionEn || poll.questionMr || poll.question);
  const options = poll.options || [];

  const handleVote = async () => {
    if (selectedOption !== null) {
      setSubmitting(true);
      try {
        await castVote(selectedOption);
        setHasVoted(true);
      } catch (err) {
        console.error("Failed to cast vote:", err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-gold-400 p-6 shadow-2xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-maroon-900">
          <BarChart2 className="w-5 h-5 text-festive-saffron" />
          <h3 className="text-lg font-bold font-heading">
            {language === "mr" ? "रहिवासी मतदान (Resident Polls)" : "Resident Polls"}
          </h3>
        </div>
        <p className="text-xs text-gray-600 mb-4">
          {language === "mr"
            ? "म्हाडा टॉवर्स उत्सव मंडळाचे निर्णय सर्व विंग्जच्या रहिवाशांच्या मताने होतात."
            : "Decisions are made with resident votes across all society buildings."}
        </p>

        {hasVoted ? (
          <div className="p-5 text-center bg-emerald-50 rounded-2xl border border-emerald-300">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-emerald-900">
              {language === "mr" ? "आपले मत नोंदवले गेले आहे!" : "Your vote has been recorded!"}
            </h4>
            <p className="text-xs text-emerald-700 mt-1">
              {language === "mr" ? "उत्सवाच्या नियोजनात सहभाग घेतल्याबद्दल धन्यवाद." : "Thank you for actively participating in festival planning."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {question && (
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200">
                <span className="text-[11px] font-bold text-amber-900 uppercase">
                  {language === "mr" ? "चालू मतदान प्रश्न:" : "Active Poll Question:"}
                </span>
                <p className="text-sm font-bold text-maroon-950 mt-1">
                  {question}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition text-xs font-semibold ${
                    selectedOption === opt.id
                      ? "border-amber-500 bg-amber-50 text-maroon-950"
                      : "border-gray-200 hover:border-gold-300 text-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="poll"
                    checked={selectedOption === opt.id}
                    onChange={() => setSelectedOption(opt.id)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>{language === "mr" ? opt.text : (opt.textEn || opt.text)}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleVote}
              disabled={selectedOption === null || submitting}
              className="w-full py-2.5 bg-maroon-850 hover:bg-maroon-800 disabled:opacity-50 text-gold-200 font-bold rounded-xl shadow transition text-xs flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> 
              <span>
                {submitting 
                  ? (language === "mr" ? "नोंदवत आहे..." : "Submitting...") 
                  : (language === "mr" ? "मत नोंदवा (Submit Vote)" : "Submit Vote")}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const VolunteerSevaModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const isEn = language === "en";
  const { config } = useConfig();

  const volunteer = config?.volunteerSeva || {};
  const wings = config?.wings && config.wings.length > 0 ? config.wings : [];
  const defaultWing = wings[0]?.code || (config?.participatingWings?.[0] || "G");

  // Practical predefined volunteer area options
  const defaultAreas = [
    { value: "Festival/Event Management", labelMr: "उत्सव व कार्यक्रम व्यवस्थापन (Event Management)", labelEn: "Festival / Event Management" },
    { value: "Decoration", labelMr: "मंडप सजावट व विद्युत रोषणाई (Decoration)", labelEn: "Decoration & Lighting" },
    { value: "Cultural Programs", labelMr: "सांस्कृतिक कार्यक्रम संयोजन (Cultural Programs)", labelEn: "Cultural Programs" },
    { value: "Maha Aarti / Religious Events", labelMr: "महाआरती व धार्मिक विधी सहाय्य (Maha Aarti / Religious)", labelEn: "Maha Aarti / Religious Events" },
    { value: "Crowd Management", labelMr: "रांग व गर्दी नियंत्रण (Crowd Management)", labelEn: "Crowd & Queue Management" },
    { value: "Food / Prasad Distribution", labelMr: "महाप्रसाद व वाटप व्यवस्था (Prasad Distribution)", labelEn: "Food / Prasad Distribution" },
    { value: "Photography / Media", labelMr: "छायाचित्रण व सोशल मीडिया (Photography & Media)", labelEn: "Photography & Media" },
    { value: "Cleaning / Environment", labelMr: "स्वच्छता व पर्यावरण संवर्धन (Cleaning / Environment)", labelEn: "Cleaning & Environment" },
    { value: "Technical / IT Support", labelMr: "ध्वनिक्षेपक व तांत्रिक सहाय्य (Technical / IT)", labelEn: "Technical / Audio / IT Support" },
    { value: "General Volunteer", labelMr: "सर्वसाधारण स्वयंसेवक (General Volunteer)", labelEn: "General Volunteer" },
    { value: "Other", labelMr: "इतर (Other)", labelEn: "Other" }
  ];

  // Custom roles from config if provided
  const configuredRoles = Array.isArray(volunteer.roles)
    ? volunteer.roles.map(r => ({
        value: typeof r === "string" ? r : (r.titleMr || r.titleEn || "Custom"),
        labelMr: typeof r === "string" ? r : (r.titleMr || r.titleEn),
        labelEn: typeof r === "string" ? r : (r.titleEn || r.titleMr)
      }))
    : [];

  const volunteerAreaOptions = [...configuredRoles, ...defaultAreas.filter(d => !configuredRoles.some(c => c.value === d.value))];

  const availabilityOptions = [
    { value: "Morning", labelMr: "सकाळची वेळ (Morning: 8:00 AM - 12:00 PM)", labelEn: "Morning (8:00 AM - 12:00 PM)" },
    { value: "Afternoon", labelMr: "दुपारची वेळ (Afternoon: 12:00 PM - 5:00 PM)", labelEn: "Afternoon (12:00 PM - 5:00 PM)" },
    { value: "Evening", labelMr: "संध्याकाळची वेळ (Evening: 5:00 PM - 10:00 PM)", labelEn: "Evening (5:00 PM - 10:00 PM)" },
    { value: "Full Day", labelMr: "संपूर्ण दिवस (Full Day)", labelEn: "Full Day" },
    { value: "Flexible", labelMr: "वेळेनुसार उपलब्ध (Flexible)", labelEn: "Flexible" }
  ];

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    wing: defaultWing,
    flatNo: "",
    volunteerArea: volunteerAreaOptions[0]?.value || "Festival/Event Management",
    availability: "Flexible",
    preferredDates: "",
    message: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setSubmitted(false);
    setErrorMessage("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setErrorMessage(isEn ? "Please enter your full name (minimum 2 characters)." : "कृपया आपले पूर्ण नाव प्रविष्ट करा.");
      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length < 10) {
      setErrorMessage(isEn ? "Please enter a valid 10-digit mobile number." : "कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setErrorMessage(isEn ? "Please enter a valid email address." : "कृपया वैध ईमेल पत्ता प्रविष्ट करा.");
      return;
    }

    if (!formData.flatNo.trim()) {
      setErrorMessage(isEn ? "Please enter your flat number." : "कृपया आपला फ्लॅट नंबर प्रविष्ट करा.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post("/volunteers", {
        fullName: formData.fullName.trim(),
        mobile: cleanMobile,
        email: formData.email.trim(),
        wing: formData.wing.trim(),
        flatNo: formData.flatNo.trim(),
        volunteerArea: formData.volunteerArea,
        availability: formData.availability,
        preferredDates: formData.preferredDates.trim(),
        message: formData.message.trim()
      });

      if (res.data.success) {
        setSubmitted(true);
        // Reset form
        setFormData({
          fullName: "",
          mobile: "",
          email: "",
          wing: defaultWing,
          flatNo: "",
          volunteerArea: volunteerAreaOptions[0]?.value || "Festival/Event Management",
          availability: "Flexible",
          preferredDates: "",
          message: ""
        });
      } else {
        setErrorMessage(res.data.message || (isEn ? "Registration submission failed" : "नोंदणी करताना अडचण आली"));
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (isEn ? "Server error during volunteer registration. Please try again." : "सर्व्हरवर तांत्रिक अडचण आली. कृपया पुन्हा प्रयत्न करा.");
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-gold-400 p-5 sm:p-6 shadow-2xl relative animate-fadeIn max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2 text-maroon-900">
          <div className="w-8 h-8 rounded-full bg-amber-100 border border-gold-400 flex items-center justify-center text-maroon-850 flex-shrink-0">
            <Users className="w-4 h-4 text-amber-700" />
          </div>
          <h3 className="text-base sm:text-lg font-bold font-heading text-maroon-950">
            {language === "mr" 
              ? (volunteer.title || "स्वयंसेवक सेवा नोंदणी (Volunteer Registration)") 
              : (volunteer.titleEn || volunteer.title || "Volunteer Registration")}
          </h3>
        </div>
        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          {language === "mr"
            ? (volunteer.description || "बाप्पांच्या उत्सवात सेवा करण्याची सुवर्णसंधी. सर्व इमारतींच्या रहिवाशांनी व तरुणांनी उत्स्फूर्त सहभाग नोंदवावा.")
            : (volunteer.descriptionEn || volunteer.description || "Register your interest to volunteer and serve during our grand Ganpati celebrations.")}
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-6 text-center bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-300 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-black text-emerald-950 font-heading">
              {language === "mr" ? "नोंदणी यशस्वीरीत्या प्राप्त झाली!" : "Volunteer Registration Received!"}
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
              {language === "mr" 
                ? "धन्यवाद! आपल्या सहभागाची माहिती उत्सव समितीकडे जतन झाली आहे. स्वयंसेवक समन्वयक पुढील नियोजनासाठी लवकरच आपल्याशी थेट संपर्क साधतील." 
                : "Thank you! Your volunteer details have been saved securely. Mandal coordinators will review and contact you regarding the upcoming activities."}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 bg-maroon-850 hover:bg-maroon-800 text-gold-200 rounded-xl text-xs font-black shadow transition active:scale-95"
              >
                {language === "mr" ? "बंद करा (Close)" : "Close"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {/* 1. Full Name */}
            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                {language === "mr" ? "पूर्ण नाव (Full Name)" : "Full Name"} <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={language === "mr" ? "उदा. सचिन रमेश पाटील" : "e.g. Sachin Ramesh Patil"}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none transition"
              />
            </div>

            {/* 2. Mobile & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-gray-700">
                  {language === "mr" ? "मोबाईल नंबर (Mobile No.)" : "Mobile Number"} <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={12}
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="9822012345"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700">
                  {language === "mr" ? "ईमेल पत्ता (Email Address)" : "Email Address"} <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@email.com"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none transition"
                />
              </div>
            </div>

            {/* 3. Building / Wing & Flat Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-gray-700">
                  {language === "mr" ? "इमारत / विंग (Building / Wing)" : "Building / Wing"} <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.wing}
                  onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none transition bg-white"
                >
                  {wings.length > 0 ? (
                    wings.map((w) => (
                      <option key={w.code} value={w.code}>
                        {language === "mr" ? (w.nameMr || `${w.code} विंग`) : (w.nameEn || `${w.code} Wing`)}
                      </option>
                    ))
                  ) : (
                    (config?.participatingWings || ["G", "H", "J", "K"]).map(c => (
                      <option key={c} value={c}>विंग {c}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700">
                  {language === "mr" ? "फ्लॅट नंबर (Flat Number)" : "Flat Number"} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.flatNo}
                  onChange={(e) => setFormData({ ...formData, flatNo: e.target.value })}
                  placeholder="उदा. 402, 1104"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none transition"
                />
              </div>
            </div>

            {/* 4. Preferred Volunteer Area */}
            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                {language === "mr" ? "इच्छित सेवा क्षेत्र (Preferred Volunteer Area)" : "Preferred Volunteer Area"} <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.volunteerArea}
                onChange={(e) => setFormData({ ...formData, volunteerArea: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none transition bg-white"
              >
                {volunteerAreaOptions.map((opt, idx) => (
                  <option key={idx} value={opt.value}>
                    {language === "mr" ? opt.labelMr : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Availability & Preferred Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-gray-700">
                  {language === "mr" ? "उपलब्ध वेळ (Availability)" : "Availability"} <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none transition bg-white"
                >
                  {availabilityOptions.map((opt, idx) => (
                    <option key={idx} value={opt.value}>
                      {language === "mr" ? opt.labelMr : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700">
                  {language === "mr" ? "इच्छित दिवस/तारीख (Preferred Date/s)" : "Preferred Date(s)"}
                </label>
                <input
                  type="text"
                  value={formData.preferredDates}
                  onChange={(e) => setFormData({ ...formData, preferredDates: e.target.value })}
                  placeholder={language === "mr" ? "उदा. सर्व दिवस किंवा ७-१० सप्टेंबर" : "e.g. All Days or 7-10 Sep"}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none transition"
                />
              </div>
            </div>

            {/* 6. Message / Additional Information */}
            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                {language === "mr" ? "अतिरिक्त संदेश / माहिती (Message / Additional Info)" : "Message / Additional Information"}
              </label>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={
                  language === "mr"
                    ? "आपण उत्सवात कशा प्रकारे योगदान देऊ इच्छिता किंवा आपल्याबद्दल काही विशेष माहिती सांगावी..."
                    : "Please tell us how you would like to contribute or any relevant information."
                }
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none transition text-xs"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-maroon-950 font-black rounded-xl shadow-md transition transform active:scale-98 text-xs sm:text-sm mt-3 border border-gold-400 flex items-center justify-center gap-2 ${
                submitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              <Users className="w-4 h-4" />
              <span>
                {submitting
                  ? (language === "mr" ? "नोंदणी पाठवत आहे..." : "Submitting...")
                  : (language === "mr" ? "स्वयंसेवक नोंदणी करा (Register Volunteer)" : "Register as Volunteer")}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const WingInfoModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { config } = useConfig();
  if (!isOpen) return null;

  const wings = config?.wings || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-gold-400 p-6 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-maroon-900">
          <Building2 className="w-5 h-5 text-festive-saffron" />
          <h3 className="text-lg font-bold font-heading">
            {language === "mr" ? "सहभागी इमारतींची माहिती" : "Buildings Information"}
          </h3>
        </div>
        <p className="text-xs text-gray-600 mb-4">
          {language === "mr" ? "म्हाडा टॉवर्स मधील सहभागी विंग्स, समन्वयक व आरक्षित आरती दिवस." : "Participating buildings, coordinators, and reserved Aarti days."}
        </p>

        <div className="space-y-3">
          {wings.map((w, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-maroon-950 text-sm font-heading">
                    {language === "mr" ? (w.nameMr || `${w.code} - ${w.sacredNameMr || ""}`) : (w.nameEn || `${w.code} - ${w.sacredNameEn || ""}`)}
                  </span>
                  {w.flatsCount && (
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-amber-300 font-semibold text-gray-700">
                      {w.flatsCount} फ्लॅट्स
                    </span>
                  )}
                </div>
                {w.coordinatorLead && (
                  <p className="text-gray-700 mt-1 font-medium">विंग प्रमुख: <strong>{w.coordinatorLead}</strong></p>
                )}
                {w.aartiReservedDays && (
                  <span className="text-[10px] text-amber-800 font-bold">आरती यजमान: {w.aartiReservedDays}</span>
                )}
              </div>
              {w.coordinatorPhone && (
                <a
                  href={`tel:${w.coordinatorPhone.replace(/[^0-9+]/g, "")}`}
                  className="p-2 rounded-xl bg-gold-200 hover:bg-gold-300 text-maroon-900 transition flex items-center gap-1"
                  title="कॉल करा"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FestivalGalleryModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { config } = useConfig();
  if (!isOpen) return null;

  const gallery = (config?.gallery || []).filter(f => f.isActive !== false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full border-2 border-gold-400 p-6 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-maroon-900">
          <ImageIcon className="w-5 h-5 text-festive-saffron" />
          <h3 className="text-lg font-bold font-heading">
            {language === "mr" ? "उत्सव छायाचित्रे (Festival Gallery)" : "Festival Photo Gallery"}
          </h3>
        </div>
        <p className="text-xs text-gray-600 mb-4">
          {language === "mr" ? "म्हाडा टॉवर्स गणेशोत्सवातील काही अविस्मरणीय क्षणचित्रे." : "Memorable moments from MHADA Towers Ganesh Utsav."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gallery.map((item, idx) => {
            const banner = getMediaUrl(item.bannerUrl || item.imageUrl);
            const title = language === "mr" ? (item.nameMr || item.titleMr) : (item.nameEn || item.titleEn || item.titleMr);
            const count = item.photos?.length || 0;
            return (
              <div key={item.id || idx} className="rounded-2xl border border-gold-300 p-3 bg-gradient-to-br from-[#FFFDF9] to-[#FAF5EC] shadow-xs">
                {banner ? (
                  <div className="h-36 rounded-xl overflow-hidden mb-2 relative bg-black">
                    <img 
                      src={banner} 
                      alt={title} 
                      onError={handleImageError}
                      className="w-full h-full object-cover" 
                    />
                    {item.category && (
                      <span className="absolute top-2 right-2 text-[9px] bg-amber-500 text-maroon-950 font-black px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    )}
                    {count > 0 && (
                      <span className="absolute bottom-2 right-2 text-[9px] bg-black/60 text-gold-200 font-bold px-2 py-0.5 rounded-full">
                        {count} {language === "mr" ? "फोटो" : "Photos"}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-32 rounded-xl bg-maroon-950 flex flex-col items-center justify-center text-gold-300 mb-2 relative overflow-hidden">
                    <Sparkles className="w-8 h-8 text-gold-400 mb-1 animate-pulse" />
                    <span className="text-[11px] font-bold text-center px-2">{title}</span>
                    {item.category && (
                      <span className="absolute top-2 right-2 text-[9px] bg-amber-500 text-maroon-950 font-black px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-xs font-bold text-maroon-950 truncate">
                  {title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
