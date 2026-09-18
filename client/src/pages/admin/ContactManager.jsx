import React, { useState } from "react";
import { 
  Plus, Trash2, Phone, Building2, UserCheck, 
  ShieldCheck, PhoneCall, Tag, Edit2, X, Check, Globe 
} from "lucide-react";
import API from "../../services/api";
import { 
  FestiveCard, FestiveInput, FestiveSelect, 
  FestiveButton, FestiveBadge 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";
import { triggerLiveSync } from "../../utils/liveSync";

const WING_OPTIONS_MR = [
  { value: "सर्व विंग्ज (All Buildings)", label: "सर्व ४ इमारती (All Buildings)" },
  { value: "G - नंदादेवी (Nandadevi)", label: "G विंग - नंदादेवी (Nandadevi)" },
  { value: "H - निलगिरी (Nilgiri)", label: "H विंग - निलगिरी (Nilgiri)" },
  { value: "J - पूर्वांचल (Purvanchal)", label: "J विंग - पूर्वांचल (Purvanchal)" },
  { value: "K - गोवर्धन (Govardhan)", label: "K विंग - गोवर्धन (Govardhan)" }
];

const WING_OPTIONS_EN = [
  { value: "सर्व विंग्ज (All Buildings)", label: "All 4 Buildings (G, H, J, K)" },
  { value: "G - नंदादेवी (Nandadevi)", label: "G Wing - Nandadevi" },
  { value: "H - निलगिरी (Nilgiri)", label: "H Wing - Nilgiri" },
  { value: "J - पूर्वांचल (Purvanchal)", label: "J Wing - Purvanchal" },
  { value: "K - गोवर्धन (Govardhan)", label: "K Wing - Govardhan" }
];

const TYPE_OPTIONS_MR = [
  { value: "wing_lead", label: "इमारत प्रतिनिधी (Building Lead)" },
  { value: "committee", label: "कार्यकारिणी समिती (Executive Committee)" },
  { value: "security", label: "सुरक्षा व सीसीटीव्ही (Security Control)" },
  { value: "emergency", label: "तातडीची मदत (Emergency Helpline)" }
];

const TYPE_OPTIONS_EN = [
  { value: "wing_lead", label: "Building Wing Coordinator" },
  { value: "committee", label: "Executive Committee Member" },
  { value: "security", label: "Security & CCTV Desk" },
  { value: "emergency", label: "24x7 Emergency Helpline" }
];

const ContactManager = ({ contacts, onRefresh, onNotify }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nameMr: "",
    nameEn: "",
    roleMr: "",
    roleEn: "",
    wing: "G - नंदादेवी (Nandadevi)",
    phone: "",
    type: "wing_lead"
  });

  const handleStartEdit = (c) => {
    setEditingId(c._id);
    setForm({
      nameMr: c.nameMr || "",
      nameEn: c.nameEn || "",
      roleMr: c.roleMr || "",
      roleEn: c.roleEn || "",
      wing: c.wing || "G - नंदादेवी (Nandadevi)",
      phone: c.phone || "",
      type: c.type || "wing_lead"
    });
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      nameMr: "",
      nameEn: "",
      roleMr: "",
      roleEn: "",
      wing: "G - नंदादेवी (Nandadevi)",
      phone: "",
      type: "wing_lead"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nameMr || !form.roleMr) {
      onNotify(isEn ? "Name and role are required!" : "कृपया नाव व पद प्रविष्ट करा!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        nameMr: form.nameMr,
        nameEn: form.nameEn || form.nameMr,
        roleMr: form.roleMr,
        roleEn: form.roleEn || form.roleMr,
        wing: form.wing,
        phone: form.phone,
        type: form.type
      };

      if (editingId) {
        const res = await API.put(`/contacts/${editingId}`, payload);
        setIsSubmitting(false);
        if (res.data.success) {
          onNotify(isEn ? "Contact updated successfully!" : "संपर्क यशस्वीरीत्या अद्ययावत केला!", "success");
          handleCancelEdit();
          onRefresh();
          triggerLiveSync("contacts");
        }
      } else {
        const res = await API.post("/contacts", payload);
        setIsSubmitting(false);
        if (res.data.success) {
          onNotify(isEn ? "New contact added!" : "नवीन संपर्क जोडला गेला!", "success");
          setForm({
            nameMr: "",
            nameEn: "",
            roleMr: "",
            roleEn: "",
            wing: "G - नंदादेवी (Nandadevi)",
            phone: "",
            type: "wing_lead"
          });
          onRefresh();
          triggerLiveSync("contacts");
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      onNotify(editingId ? (isEn ? "Failed to update contact" : "संपर्क अद्ययावत करताना त्रुटी आली") : (isEn ? "Failed to add contact" : "संपर्क जोडताना त्रुटी आली"), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(isEn ? "Are you sure you want to delete this contact?" : "हा संपर्क नक्की हटवायचा आहे का?")) return;
    try {
      const res = await API.delete(`/contacts/${id}`);
      if (res.data.success) {
        onNotify(isEn ? "Contact removed" : "संपर्क काढला गेला", "success");
        if (editingId === id) handleCancelEdit();
        onRefresh();
        triggerLiveSync("contacts");
      }
    } catch (err) {
      onNotify(isEn ? "Failed to delete contact" : "हटवताना त्रुटी आली", "error");
    }
  };

  const wingOptions = isEn ? WING_OPTIONS_EN : WING_OPTIONS_MR;
  const typeOptions = isEn ? TYPE_OPTIONS_EN : TYPE_OPTIONS_MR;

  return (
    <div className="space-y-6">
      
      {/* 1. Add / Edit Contact Form */}
      <FestiveCard
        title={
          editingId 
            ? (isEn ? "Edit Contact & Wing Coordinator" : "पदाधिकारी / समन्वयक संपर्क संपादन (Edit Contact)") 
            : (isEn ? "Add New Office Bearer or Wing Coordinator" : "नवीन पदाधिकारी किंवा ४ इमारतींचे समन्वयक जोडा")
        }
        subtitle={
          editingId 
            ? (isEn 
                ? "You are currently updating an existing contact. Changes will reflect immediately in the Contact Desk on the website."
                : "आपण विद्यमान संपर्कात बदल करत आहात. बदल जतन करताच ते वेबसाईटवरील 'आपत्कालीन व विंग संपर्क' कार्ड्समध्ये त्वरित अपडेट होतील.") 
            : (isEn 
                ? "Add wing coordinators, committee members, security desk, or 24x7 emergency contacts for the website."
                : "वेबसाईटवरील संपर्क कक्षामध्ये दर्शवण्यासाठी विंग प्रमुख किंवा कार्यकारिणी सदस्यांची माहिती भरा.")
        }
        icon={Phone}
        badge={
          editingId 
            ? (isEn ? "Edit Mode" : "संपादन मोड (Edit Mode)") 
            : (isEn ? "Contacts" : "संपर्क व्यवस्थापन")
        }
      >
        {/* Active Edit Alert Bar */}
        {editingId && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border-2 border-amber-400 flex items-center justify-between gap-2 text-amber-950 text-xs font-bold animate-fadeIn">
            <div className="flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                {isEn 
                  ? "Contact editing in progress. Click 'Save Changes' below when complete." 
                  : "संपर्क संपादन सुरू आहे. बदल पूर्ण झाल्यावर 'बदल जतन करा' वर क्लिक करा."}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-400 hover:bg-amber-100 text-stone-800 text-[11px] font-black transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isEn ? "Cancel" : "रद्द करा"}</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          
          {/* Bilingual Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveInput
              label={isEn ? "Full Name (Marathi) *" : "पूर्ण नाव (मराठी) *"}
              icon={UserCheck}
              value={form.nameMr}
              onChange={(e) => setForm({ ...form, nameMr: e.target.value })}
              placeholder="उदा. श्री. सचिन पाटील"
              required
            />

            <FestiveInput
              label={isEn ? "Full Name (English)" : "Full Name (English)"}
              icon={Globe}
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              placeholder="e.g. Mr. Sachin Patil"
            />
          </div>

          {/* Bilingual Roles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveInput
              label={isEn ? "Role / Designation (Marathi) *" : "पद / भूमिका (मराठी) *"}
              icon={Tag}
              value={form.roleMr}
              onChange={(e) => setForm({ ...form, roleMr: e.target.value })}
              placeholder="उदा. विंग G समन्वयक (फ्लॅट G-402)"
              required
            />

            <FestiveInput
              label={isEn ? "Role / Designation (English)" : "Role / Designation (English)"}
              icon={Globe}
              value={form.roleEn}
              onChange={(e) => setForm({ ...form, roleEn: e.target.value })}
              placeholder="e.g. Wing G Lead (Flat G-402)"
            />
          </div>

          {/* Phone, Wing, Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FestiveInput
              label={isEn ? "Phone Number (Optional)" : "फोन नंबर (ऐच्छिक)"}
              icon={Phone}
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98220 11223"
            />

            <FestiveInput
              label={isEn ? "Building / Flat (e.g. J-1503)" : "इमारत / फ्लॅट (उदा. जे – १५०३)"}
              icon={Building2}
              value={form.wing}
              onChange={(e) => setForm({ ...form, wing: e.target.value })}
              placeholder="उदा. जे – १५०३ (J-1503)"
            />

            <FestiveSelect
              label={isEn ? "Contact Type" : "संपर्क प्रकार (Contact Type)"}
              icon={ShieldCheck}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {typeOptions.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </FestiveSelect>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            {editingId && (
              <FestiveButton
                type="button"
                onClick={handleCancelEdit}
                variant="secondary"
                size="md"
                icon={X}
              >
                {isEn ? "Cancel Edit" : "रद्द करा (Cancel)"}
              </FestiveButton>
            )}

            <FestiveButton
              type="submit"
              icon={editingId ? Check : Plus}
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (editingId ? (isEn ? "Saving..." : "बदल जतन करत आहे...") : (isEn ? "Saving..." : "जतन करत आहे...")) 
                : (editingId ? (isEn ? "Save Changes" : "बदल जतन करा (Save Changes)") : (isEn ? "Save Contact" : "संपर्क जतन करा (Save Contact)"))
              }
            </FestiveButton>
          </div>
        </form>
      </FestiveCard>

      {/* 2. Contacts List with Edit & Delete */}
      <FestiveCard
        title={isEn ? `Registered Contacts (${contacts.length})` : `नोंदवलेले संपर्क व विंग प्रतिनिधी (${contacts.length})`}
        subtitle={
          isEn
            ? "List of all active contacts visible to residents. You can edit phone numbers or remove contacts anytime."
            : "वेबसाईटवरील संपर्क कक्षामध्ये दर्शवले जाणारे सर्व संपर्क. येथून आपण क्रमांक त्वरित संपादित किंवा हटवू शकता."
        }
        icon={PhoneCall}
      >
        {contacts.length === 0 ? (
          <p className="text-center py-6 text-xs text-stone-500 font-medium">
            {isEn ? "No contacts recorded yet. Add a new contact above." : "कोणताही संपर्क नोंदवलेला नाही. वरून नवीन संपर्क जोडा."}
          </p>
        ) : (
          <div className="space-y-3">
            {contacts.map((c) => {
              const isCurrentEditing = editingId === c._id;

              return (
                <div
                  key={c._id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                    isCurrentEditing
                      ? "bg-amber-100/60 border-amber-500 ring-2 ring-amber-400/40"
                      : "border-gold-300/80 bg-white hover:border-gold-400"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FestiveBadge variant="maroon">
                        {c.wing}
                      </FestiveBadge>
                      <FestiveBadge variant="gold">
                        {c.type === "emergency" ? (isEn ? "Emergency" : "तातडीची मदत") : (isEn ? "Wing Lead" : "प्रतिनिधी")}
                      </FestiveBadge>
                    </div>

                    <h5 className="font-heading font-black text-sm text-maroon-950 pt-0.5">
                      {isEn ? (c.nameEn || c.nameMr) : c.nameMr} {isEn && c.nameMr ? <span className="text-stone-500 font-normal text-xs">({c.nameMr})</span> : (c.nameEn ? <span className="text-stone-500 font-normal text-xs">({c.nameEn})</span> : null)}
                    </h5>

                    <p className="text-xs text-stone-600 font-medium">
                      {isEn ? (c.roleEn || c.roleMr) : c.roleMr}
                    </p>

                    <p className="text-xs text-maroon-900 font-bold flex items-center gap-1.5 pt-0.5">
                      <Phone className="w-3.5 h-3.5 text-amber-700" />
                      <span>{c.phone}</span>
                    </p>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-2 justify-end flex-shrink-0 pt-2 sm:pt-0 w-full sm:w-auto">
                    <FestiveButton
                      onClick={() => handleStartEdit(c)}
                      variant={isCurrentEditing ? "primary" : "secondary"}
                      size="sm"
                      icon={Edit2}
                      className="w-full sm:w-auto"
                      title={isEn ? "Edit Contact" : "संपर्क संपादन करा"}
                    >
                      {isCurrentEditing ? (isEn ? "Editing" : "संपादन चालू") : (isEn ? "Edit" : "संपादन करा")}
                    </FestiveButton>

                    <FestiveButton
                      onClick={() => handleDelete(c._id)}
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      className="w-full sm:w-auto"
                      title={isEn ? "Delete Contact" : "संपर्क हटवा"}
                    >
                      {isEn ? "Delete" : "हटवा"}
                    </FestiveButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </FestiveCard>
    </div>
  );
};

export default ContactManager;
