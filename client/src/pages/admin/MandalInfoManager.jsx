import React, { useState, useEffect } from "react";
import { 
  Info, Save, Plus, Trash2, ShieldCheck, HeartHandshake, Building, Mail, Phone, Landmark 
} from "lucide-react";
import { 
  FestiveCard, FestiveInput, FestiveTextarea, FestiveButton 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";

const MandalInfoManager = ({ config, onSaveMandalInfo, onNotify }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    historyMr: "",
    historyEn: "",
    establishedYear: "२०२४",
    regDetails: "",
    mottoMr: "४ विंग्स, एकच परिवार (सहकार्य • शिस्त • अखंड भक्ती)",
    officeAddressMr: "",
    helpline: "",
    email: "",
    bankDetails: {
      accountName: "",
      bankName: "",
      accountNo: "",
      ifsc: "",
      upiId: ""
    },
    pillars: [],
    committeeMembers: []
  });

  useEffect(() => {
    if (config?.mandalInfo) {
      setForm({
        historyMr: config.mandalInfo.historyMr || "",
        historyEn: config.mandalInfo.historyEn || "",
        establishedYear: config.mandalInfo.establishedYear || "२०२४",
        regDetails: config.mandalInfo.regDetails || "",
        mottoMr: config.mandalInfo.mottoMr || "४ विंग्स, एकच परिवार",
        officeAddressMr: config.mandalInfo.officeAddressMr || "",
        helpline: config.mandalInfo.helpline || config?.emergencyHelpline || "",
        email: config.mandalInfo.email || config?.email || "",
        bankDetails: {
          accountName: config.mandalInfo.bankDetails?.accountName || "",
          bankName: config.mandalInfo.bankDetails?.bankName || "",
          accountNo: config.mandalInfo.bankDetails?.accountNo || "",
          ifsc: config.mandalInfo.bankDetails?.ifsc || "",
          upiId: config.mandalInfo.bankDetails?.upiId || ""
        },
        pillars: config.mandalInfo.pillars ? JSON.parse(JSON.stringify(config.mandalInfo.pillars)) : [],
        committeeMembers: config.mandalInfo.committeeMembers ? JSON.parse(JSON.stringify(config.mandalInfo.committeeMembers)) : []
      });
    }
  }, [config]);

  const handleAddPillar = () => {
    setForm({
      ...form,
      pillars: [
        ...form.pillars,
        {
          icon: "ShieldCheck",
          titleMr: "नवीन उद्दिष्ट / संकल्प",
          titleEn: "New Mission Pillar",
          descMr: "उद्दिष्टाचा तपशील येथे लिहा.",
          descEn: "Mission description here."
        }
      ]
    });
  };

  const handleRemovePillar = (idx) => {
    setForm({
      ...form,
      pillars: form.pillars.filter((_, i) => i !== idx)
    });
  };

  const handlePillarChange = (idx, field, val) => {
    const updated = [...form.pillars];
    updated[idx][field] = val;
    setForm({ ...form, pillars: updated });
  };

  const handleAddMember = () => {
    setForm({
      ...form,
      committeeMembers: [
        ...form.committeeMembers,
        {
          roleMr: "सदस्य",
          roleEn: "Member",
          nameMr: "श्री. ...",
          nameEn: "Mr. ...",
          wing: "G विंग",
          phone: "+91 98220..."
        }
      ]
    });
  };

  const handleRemoveMember = (idx) => {
    setForm({
      ...form,
      committeeMembers: form.committeeMembers.filter((_, i) => i !== idx)
    });
  };

  const handleMemberChange = (idx, field, val) => {
    const updated = [...form.committeeMembers];
    updated[idx][field] = val;
    setForm({ ...form, committeeMembers: updated });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    const res = await onSaveMandalInfo(form);
    setIsSaving(false);
    if (res?.success) {
      if (onNotify) onNotify(isEn ? "Mandal information updated!" : "मंडळ माहिती व कार्यकारणी अद्ययावत केली!");
    } else {
      if (onNotify) onNotify(isEn ? "Failed to save information" : "माहिती जतन करताना त्रुटी आली", "error");
    }
  };

  return (
    <FestiveCard
      title={
        isEn 
          ? "Mandal Information, History & Committee" 
          : "मंडळ अधिकृत माहिती, इतिहास व कार्यकारणी"
      }
      subtitle={
        isEn
          ? "Manage the Mandal history, tagline, registration details, bank account, core pillars, and executive committee."
          : "मंडळाचा इतिहास, ध्येयवाक्य, नोंदणी तपशील, बँक खात्याची माहिती, मुख्य उद्दिष्टे (Pillars) व कार्यकारणी समिती नियंत्रित करा."
      }
      icon={Info}
      badge={isEn ? "Mandal Info" : "मंडळ माहिती"}
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
            : (isEn ? "Save Mandal Info (माहिती जतन करा)" : "सर्व जतन करा (Save)")
          }
        </FestiveButton>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        
        {/* Basic Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FestiveInput
            label={isEn ? "Motto / Tagline" : "ध्येयवाक्य (Motto / Tagline)"}
            value={form.mottoMr}
            onChange={(e) => setForm({ ...form, mottoMr: e.target.value })}
            placeholder="४ विंग्स, एकच परिवार"
          />
          <FestiveInput
            label={isEn ? "Established Year" : "स्थापना वर्ष (Established Year)"}
            value={form.establishedYear}
            onChange={(e) => setForm({ ...form, establishedYear: e.target.value })}
            placeholder="२०२४"
          />
          <FestiveInput
            label={isEn ? "Registration Details" : "नोंदणी तपशील (Registration Details)"}
            value={form.regDetails}
            onChange={(e) => setForm({ ...form, regDetails: e.target.value })}
            placeholder="नोंदणी क्र: १२४३/२०२५ - पुणे"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FestiveInput
            label={isEn ? "Office Address" : "कार्यालय पत्ता"}
            icon={Building}
            value={form.officeAddressMr}
            onChange={(e) => setForm({ ...form, officeAddressMr: e.target.value })}
            placeholder="पिंपरी वाघेरे, पुणे - ४११०१७"
          />
          <FestiveInput
            label={isEn ? "Official Society Email" : "सोसायटी अधिकृत ईमेल"}
            icon={Mail}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="mhadatowersutsavmandal@gmail.com"
          />
          <FestiveInput
            label={isEn ? "Emergency Helpline" : "आपत्कालीन हेल्पलाइन"}
            icon={Phone}
            value={form.helpline}
            onChange={(e) => setForm({ ...form, helpline: e.target.value })}
            placeholder="+91 98220 11223"
          />
        </div>

        {/* Narrative History */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FestiveTextarea
            label={isEn ? "Mandal History (Marathi)" : "मंडळ इतिहास व पार्श्वभूमी (Marathi History)"}
            rows={4}
            value={form.historyMr}
            onChange={(e) => setForm({ ...form, historyMr: e.target.value })}
            placeholder="पिंपरी चिंचवड मधील म्हाडा टॉवर्स संकुलातील सर्व रहिवासी एकत्र येऊन..."
          />
          <FestiveTextarea
            label={isEn ? "Mandal History (English)" : "English History / Background"}
            rows={4}
            value={form.historyEn}
            onChange={(e) => setForm({ ...form, historyEn: e.target.value })}
            placeholder="Residents across MHADA Towers come together every year..."
          />
        </div>

        {/* Bank & Vargani Details */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/60 to-white rounded-2xl border border-gold-300 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gold-200">
            <Landmark className="w-4 h-4 text-maroon-850" />
            <h4 className="font-heading font-black text-maroon-950 text-xs sm:text-sm">
              {isEn ? "Official Bank Account Details (वर्गणी व बँक तपशील)" : "वर्गणी व अधिकृत बँक खात्याचा तपशील (Society Bank Account)"}
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FestiveInput
              label={isEn ? "Account Name" : "खाते नाव (Account Name)"}
              value={form.bankDetails.accountName}
              onChange={(e) => setForm({
                ...form,
                bankDetails: { ...form.bankDetails, accountName: e.target.value }
              })}
              placeholder="MHADA TOWERS UTSAV MANDAL"
            />
            <FestiveInput
              label={isEn ? "Bank Name & Branch" : "बँकेचे नाव व शाखा"}
              value={form.bankDetails.bankName}
              onChange={(e) => setForm({
                ...form,
                bankDetails: { ...form.bankDetails, bankName: e.target.value }
              })}
              placeholder="Bank of Maharashtra - Pimpri Branch"
            />
            <FestiveInput
              label={isEn ? "Account Number" : "खाते क्रमांक (Account No)"}
              value={form.bankDetails.accountNo}
              onChange={(e) => setForm({
                ...form,
                bankDetails: { ...form.bankDetails, accountNo: e.target.value }
              })}
              placeholder="60459821034"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FestiveInput
              label={isEn ? "IFSC Code" : "IFSC कोड"}
              value={form.bankDetails.ifsc}
              onChange={(e) => setForm({
                ...form,
                bankDetails: { ...form.bankDetails, ifsc: e.target.value }
              })}
              placeholder="MAHB0000123"
            />
            <FestiveInput
              label={isEn ? "UPI ID" : "UPI ID"}
              value={form.bankDetails.upiId}
              onChange={(e) => setForm({
                ...form,
                bankDetails: { ...form.bankDetails, upiId: e.target.value }
              })}
              placeholder="mhadatowers@upi"
            />
          </div>
        </div>

        {/* Pillars Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-black text-maroon-950 text-xs sm:text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{isEn ? "Core Pillars of Mandal" : "मुख्य उद्दिष्टे (4 Pillars of Mandal)"}</span>
            </h4>
            <FestiveButton
              type="button"
              onClick={handleAddPillar}
              icon={Plus}
              variant="secondary"
              size="sm"
            >
              {isEn ? "Add Pillar" : "उद्दिष्ट जोडा"}
            </FestiveButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {form.pillars.map((p, idx) => (
              <div key={idx} className="p-3.5 bg-white rounded-xl border border-gold-300 space-y-2 relative">
                <button
                  type="button"
                  onClick={() => handleRemovePillar(idx)}
                  className="absolute top-3 right-3 text-rose-600 hover:bg-rose-50 p-1 rounded cursor-pointer"
                  title={isEn ? "Remove pillar" : "उद्दिष्ट काढा"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <FestiveInput
                  label={isEn ? "Pillar Title" : "उद्दिष्ट शीर्षक (Marathi)"}
                  value={p.titleMr}
                  onChange={(e) => handlePillarChange(idx, "titleMr", e.target.value)}
                  placeholder={isEn ? "e.g. Social Unity & Harmony" : "उदा. सामाजिक एकता व सलोखा"}
                />
                <FestiveTextarea
                  label={isEn ? "Description" : "वर्णन (Description)"}
                  rows={2}
                  value={p.descMr}
                  onChange={(e) => handlePillarChange(idx, "descMr", e.target.value)}
                  placeholder={isEn ? "Uniting families across all 4 buildings..." : "४ इमारतींमधील सर्व कुटुंबांना एका सूत्रात..."}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Committee Members Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-black text-maroon-950 text-xs sm:text-sm flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-maroon-850" />
              <span>{isEn ? "Managing Committee Members" : "कार्यकारणी समिती सदस्य (Managing Committee)"}</span>
            </h4>
            <FestiveButton
              type="button"
              onClick={handleAddMember}
              icon={Plus}
              variant="secondary"
              size="sm"
            >
              {isEn ? "Add Member" : "पदाधिकारी जोडा"}
            </FestiveButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {form.committeeMembers.map((m, idx) => (
              <div key={idx} className="p-3 bg-white rounded-xl border border-gold-300 space-y-2 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveMember(idx)}
                  className="absolute top-2 right-2 text-rose-600 hover:bg-rose-50 p-1 rounded cursor-pointer"
                  title={isEn ? "Remove member" : "पदाधिकारी काढा"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <FestiveInput
                  label={isEn ? "Role / Position" : "पद / भूमिका (Role)"}
                  value={m.roleMr}
                  onChange={(e) => handleMemberChange(idx, "roleMr", e.target.value)}
                  placeholder={isEn ? "e.g. President / Secretary" : "उदा. अध्यक्ष / सचिव"}
                />
                <FestiveInput
                  label={isEn ? "Full Name" : "नाव (Full Name)"}
                  value={m.nameMr}
                  onChange={(e) => handleMemberChange(idx, "nameMr", e.target.value)}
                  placeholder="श्री. सतीश कांबळे"
                />
                <div className="grid grid-cols-2 gap-2">
                  <FestiveInput
                    label={isEn ? "Wing" : "विंग"}
                    value={m.wing}
                    onChange={(e) => handleMemberChange(idx, "wing", e.target.value)}
                    placeholder="G विंग"
                  />
                  <FestiveInput
                    label={isEn ? "Phone" : "फोन"}
                    value={m.phone}
                    onChange={(e) => handleMemberChange(idx, "phone", e.target.value)}
                    placeholder="+91 98220..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </form>
    </FestiveCard>
  );
};

export default MandalInfoManager;
