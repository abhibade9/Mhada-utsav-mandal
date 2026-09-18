import React, { useState, useEffect } from "react";
import { 
  Users, Mail, Search, RefreshCw, Eye, Trash2, CheckCircle2, 
  AlertTriangle, Phone, Building2, Calendar, Clock, MapPin, 
  Send, X, Check, Filter, UserCheck, ShieldAlert
} from "lucide-react";
import API from "../../services/api";
import { 
  FestiveCard, FestiveInput, FestiveSelect, 
  FestiveTextarea, FestiveButton, FestiveBadge, FestiveToggle 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";
import { useConfig } from "../../context/ConfigContext";
import { triggerLiveSync } from "../../utils/liveSync";

const STATUS_CONFIG = {
  New: { labelMr: "नवीन", labelEn: "New", color: "bg-blue-100 text-blue-800 border-blue-300" },
  Reviewed: { labelMr: "तपासले", labelEn: "Reviewed", color: "bg-amber-100 text-amber-900 border-amber-300" },
  Contacted: { labelMr: "संपर्क केला", labelEn: "Contacted", color: "bg-purple-100 text-purple-900 border-purple-300" },
  Accepted: { labelMr: "स्वीकृत", labelEn: "Accepted", color: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  Rejected: { labelMr: "अस्वीकृत", labelEn: "Rejected", color: "bg-rose-100 text-rose-800 border-rose-300" },
  Closed: { labelMr: "बंद", labelEn: "Closed", color: "bg-stone-200 text-stone-700 border-stone-300" },
};

const DEFAULT_EMAIL_TEMPLATE = (volunteerName) => ({
  subject: "Thank You for Volunteering with MHADA Towers Utsav Mandal",
  body: `Dear ${volunteerName || "Volunteer"},

Thank you for your interest in volunteering with MHADA Towers Utsav Mandal.

We sincerely appreciate your willingness to contribute your time and support to our community activities.

We have received your volunteer request and our team will review the details. We will contact you regarding the next steps and available volunteer opportunities.

Thank you once again for coming forward and supporting our community celebrations.

Warm regards,
MHADA Towers Utsav Mandal
Pimpri Waghere, Pune - 411017`
});

const VolunteerManager = ({ onNotify }) => {
  const { language } = useLanguage();
  const isEn = language === "en";
  const { config, updateTabs, refreshConfig } = useConfig();

  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [wingFilter, setWingFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [emailFilter, setEmailFilter] = useState("all");

  // Modals
  const [viewingRequest, setViewingRequest] = useState(null);
  const [emailComposer, setEmailComposer] = useState(null); // { volunteer, recipientEmail, subject, body, isResend, sending }
  const [deletingRequest, setDeletingRequest] = useState(null); // volunteer to delete
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Fetch volunteers list
  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/volunteers", {
        params: {
          search: searchTerm,
          status: statusFilter,
          wing: wingFilter,
          volunteerArea: areaFilter,
          emailStatus: emailFilter
        }
      });
      if (res.data.success) {
        setVolunteers(res.data.data);
      }
    } catch (err) {
      console.error("[VolunteerManager] Error fetching volunteers:", err);
      if (onNotify) onNotify(isEn ? "Failed to load volunteer requests" : "स्वयंसेवक विनंत्या लोड करताना त्रुटी आली", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [searchTerm, statusFilter, wingFilter, areaFilter, emailFilter]);

  // ON / OFF Toggle for Volunteer Feature
  const isFeatureEnabled =
    config?.tabs?.volunteer?.enabled !== false && config?.volunteerSeva?.active !== false;

  const handleToggleFeature = async (nextState) => {
    if (!config?.tabs) return;
    const currentVolTab = config.tabs.volunteer || {
      enabled: true,
      approved: true,
      labelMr: "सहभाग व सेवा",
      labelEn: "Volunteer Seva",
      order: 16
    };

    const updatedTabs = {
      ...config.tabs,
      volunteer: {
        ...currentVolTab,
        enabled: nextState,
        approved: nextState
      }
    };

    try {
      const res = await updateTabs(updatedTabs);
      if (res.success) {
        if (onNotify) {
          onNotify(
            nextState
              ? (isEn ? "Volunteer feature turned ON (Visible on website)" : "स्वयंसेवक सुविधा सुरू केली (वेबसाईटवर दृश्यमान)")
              : (isEn ? "Volunteer feature turned OFF (Hidden from website)" : "स्वयंसेवक सुविधा बंद केली (वेबसाईटवर लपवली)")
          );
        }
        refreshConfig();
        triggerLiveSync("config");
      } else {
        if (onNotify) onNotify(isEn ? "Failed to update toggle setting" : "सेटिंग बदलताना त्रुटी आली", "error");
      }
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify(isEn ? "Failed to update toggle setting" : "सेटिंग बदलताना त्रुटी आली", "error");
    }
  };

  // Status update
  const handleUpdateStatus = async (id, newStatus) => {
    setStatusUpdating(true);
    try {
      const res = await API.put(`/volunteers/${id}/status`, { status: newStatus });
      if (res.data.success) {
        if (onNotify) onNotify(isEn ? `Status updated to ${newStatus}` : `स्थिती अद्ययावत केली: ${newStatus}`);
        setVolunteers((prev) =>
          prev.map((v) => (v._id === id ? { ...v, status: newStatus } : v))
        );
        if (viewingRequest && viewingRequest._id === id) {
          setViewingRequest({ ...viewingRequest, status: newStatus });
        }
      }
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify(isEn ? "Failed to update status" : "स्थिती बदलताना त्रुटी आली", "error");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Open Email Preview / Composer
  const handleOpenEmailComposer = (v, isResend = false) => {
    const template = DEFAULT_EMAIL_TEMPLATE(v.fullName);
    setEmailComposer({
      volunteer: v,
      recipientEmail: v.email || "",
      subject: template.subject,
      body: template.body,
      isResend,
      sending: false,
      error: ""
    });
  };

  // Confirm & Send Email
  const handleConfirmSendEmail = async () => {
    if (!emailComposer) return;
    const { volunteer, recipientEmail, subject, body, isResend } = emailComposer;

    setEmailComposer((prev) => ({ ...prev, sending: true, error: "" }));

    try {
      const res = await API.post(`/volunteers/${volunteer._id}/send-email`, {
        recipientEmail,
        subject,
        messageBody: body,
        forceResend: isResend
      });

      if (res.data.success) {
        const updatedVol = res.data.data;
        if (onNotify) onNotify(isEn ? "Email sent successfully." : "आभार ईमेल यशस्वीरीत्या पाठवला.");
        setVolunteers((prev) =>
          prev.map((v) => (v._id === volunteer._id ? updatedVol : v))
        );
        if (viewingRequest && viewingRequest._id === volunteer._id) {
          setViewingRequest(updatedVol);
        }
        setEmailComposer(null);
      } else {
        setEmailComposer((prev) => ({
          ...prev,
          sending: false,
          error: res.data.message || (isEn ? "Email could not be sent." : "ईमेल पाठवता आला नाही.")
        }));
      }
    } catch (err) {
      console.error(err);
      const errMsg =
        err.response?.data?.message || (isEn ? "Email could not be sent." : "ईमेल पाठवता आला नाही.");
      setEmailComposer((prev) => ({ ...prev, sending: false, error: errMsg }));
      if (onNotify) onNotify(errMsg, "error");
    }
  };

  // Delete submission
  const handleConfirmDelete = async () => {
    if (!deletingRequest) return;
    try {
      const res = await API.delete(`/volunteers/${deletingRequest._id}`);
      if (res.data.success) {
        if (onNotify) onNotify(isEn ? "Volunteer request deleted." : "स्वयंसेवक विनंती हटवली.");
        setVolunteers((prev) => prev.filter((v) => v._id !== deletingRequest._id));
        if (viewingRequest && viewingRequest._id === deletingRequest._id) {
          setViewingRequest(null);
        }
        setDeletingRequest(null);
      }
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify(isEn ? "Failed to delete request" : "विनंती हटवताना त्रुटी आली", "error");
    }
  };

  // Statistics
  const totalCount = volunteers.length;
  const newCount = volunteers.filter((v) => v.status === "New").length;
  const acceptedCount = volunteers.filter((v) => v.status === "Accepted").length;
  const emailSentCount = volunteers.filter((v) => v.emailStatus === "Sent").length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. TOP HEADER & ON/OFF TOGGLE CONTROL CARD */}
      <FestiveCard
        title={isEn ? "Volunteer Feature Control & Requests" : "स्वयंसेवक सुविधा व अर्ज व्यवस्थापन"}
        subtitle={
          isEn
            ? "Manage public volunteer tab visibility and review all resident volunteer applications."
            : "मुख्य वेबसाईटवरील स्वयंसेवक फॉर्मची दृश्यमानता नियंत्रित करा व सर्व रहिवाशांचे अर्ज तपासा."
        }
        icon={Users}
        badge={isEn ? "Volunteer Seva" : "स्वयंसेवक सेवा"}
        action={
          <FestiveButton
            onClick={fetchVolunteers}
            icon={RefreshCw}
            variant="secondary"
            size="sm"
            disabled={loading}
          >
            {isEn ? "Refresh" : "रिफ्रेश करा"}
          </FestiveButton>
        }
      >
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 border-2 border-gold-400/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 shadow-inner transition-colors ${
              isFeatureEnabled
                ? "bg-gradient-to-br from-amber-600 via-amber-500 to-amber-600 text-maroon-950 border-gold-400"
                : "bg-stone-200 text-stone-500 border-stone-300"
            }`}>
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-maroon-950 font-heading">
                  {isEn ? "Public Volunteer Feature Status" : "वेबसाईटवर स्वयंसेवक फॉर्म सुविधा"}
                </h4>
                {isFeatureEnabled ? (
                  <FestiveBadge variant="gold" icon={Check}>
                    {isEn ? "LIVE ON WEBSITE" : "वेबसाईटवर सुरू"}
                  </FestiveBadge>
                ) : (
                  <FestiveBadge variant="gray" icon={X}>
                    {isEn ? "HIDDEN / OFF" : "वेबसाईटवर बंद"}
                  </FestiveBadge>
                )}
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {isFeatureEnabled
                  ? (isEn ? "The Volunteer tab and registration form are active and visible to all residents." : "स्वयंसेवक नोंदणी टॅब व फॉर्म मुख्य वेबसाईटवर सर्व रहिवाशांसाठी दृश्यमान आहे.")
                  : (isEn ? "The Volunteer tab and form are hidden from the website. Submissions remain safely saved." : "स्वयंसेवक टॅब व फॉर्म वेबसाईटवरून लपवला आहे. मागील अर्ज सुरक्षित आहेत.")}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex-shrink-0">
            <FestiveToggle
              checked={isFeatureEnabled}
              onChange={handleToggleFeature}
              activeText={isEn ? "FEATURE ON" : "सुरू (ON)"}
              inactiveText={isEn ? "FEATURE OFF" : "बंद (OFF)"}
              size="md"
            />
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 bg-white rounded-xl border border-gold-300 shadow-xs">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              {isEn ? "Total Applications" : "एकूण अर्ज"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-maroon-950 font-heading">
              {totalCount}
            </span>
          </div>

          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 shadow-xs">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
              {isEn ? "New (Pending)" : "नवीन अर्ज"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-blue-950 font-heading">
              {newCount}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              {isEn ? "Accepted" : "स्वीकृत"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-950 font-heading">
              {acceptedCount}
            </span>
          </div>

          <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 shadow-xs">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
              {isEn ? "Thank-You Sent" : "ईमेल पाठवले"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-purple-950 font-heading">
              {emailSentCount}
            </span>
          </div>
        </div>
      </FestiveCard>

      {/* 2. SEARCH, FILTER & TABLE SECTION */}
      <FestiveCard
        title={isEn ? "Volunteer Submissions (स्वयंसेवक अर्ज यादी)" : "स्वयंसेवक अर्ज यादी (Volunteer Submissions)"}
        subtitle={
          isEn
            ? "View submitted volunteer applications, read complete details, update status, and send thank-you emails."
            : "सर्व स्वयंसेवक अर्ज पहा, संदेश वाचा, स्थिती बदला आणि आभार ईमेल पाठवा."
        }
        icon={Users}
      >
        {/* Search & Filter Bar */}
        <div className="p-3 sm:p-4 bg-stone-50/80 rounded-2xl border border-stone-200 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="sm:col-span-2">
              <FestiveInput
                placeholder={isEn ? "Search by Name, Mobile, Email, Flat..." : "नाव, मोबाईल, ईमेल, फ्लॅट द्वारे शोधा..."}
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <FestiveSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{isEn ? "All Statuses" : "सर्व स्थिती (All Status)"}</option>
                <option value="New">{isEn ? "New" : "नवीन (New)"}</option>
                <option value="Reviewed">{isEn ? "Reviewed" : "तपासले (Reviewed)"}</option>
                <option value="Contacted">{isEn ? "Contacted" : "संपर्क केला (Contacted)"}</option>
                <option value="Accepted">{isEn ? "Accepted" : "स्वीकृत (Accepted)"}</option>
                <option value="Rejected">{isEn ? "Rejected" : "अस्वीकृत (Rejected)"}</option>
                <option value="Closed">{isEn ? "Closed" : "बंद (Closed)"}</option>
              </FestiveSelect>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <FestiveSelect
                value={wingFilter}
                onChange={(e) => setWingFilter(e.target.value)}
              >
                <option value="all">{isEn ? "All Wings" : "सर्व विंग्स (All Wings)"}</option>
                <option value="G">G Wing</option>
                <option value="H">H Wing</option>
                <option value="J">J Wing</option>
                <option value="K">K Wing</option>
              </FestiveSelect>
            </div>

            <div>
              <FestiveSelect
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
              >
                <option value="all">{isEn ? "All Email Statuses" : "सर्व ईमेल स्थिती"}</option>
                <option value="Sent">{isEn ? "Email Sent" : "ईमेल पाठवले (Sent)"}</option>
                <option value="Not Sent">{isEn ? "Email Not Sent" : "ईमेल नाही पाठवले (Not Sent)"}</option>
              </FestiveSelect>
            </div>

            <div className="col-span-2 sm:col-span-1 flex justify-end">
              {(searchTerm || statusFilter !== "all" || wingFilter !== "all" || emailFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setWingFilter("all");
                    setEmailFilter("all");
                  }}
                  className="px-3 py-2 text-xs font-bold text-stone-600 hover:text-maroon-900 bg-white rounded-xl border border-stone-300 shadow-xs"
                >
                  {isEn ? "Clear Filters" : "फिल्टर काढा"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Volunteers Table */}
        {loading ? (
          <div className="py-12 text-center text-maroon-900 font-bold">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gold-500" />
            <p className="text-xs">{isEn ? "Loading volunteer requests..." : "अर्ज लोड होत आहेत..."}</p>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border-2 border-dashed border-stone-200">
            <Users className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-stone-700">
              {isEn ? "No volunteer requests found" : "कोणतेही स्वयंसेवक अर्ज आढळले नाहीत"}
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              {isEn ? "New submissions from the public website will appear here." : "वेबसाईटवरून रहिवाशांनी केलेले अर्ज येथे दिसतील."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-xs bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#FAF5EC] to-[#F7F2E7] text-maroon-950 font-black border-b border-gold-300">
                  <th className="p-3 whitespace-nowrap">{isEn ? "Name" : "नाव"}</th>
                  <th className="p-3 whitespace-nowrap">{isEn ? "Mobile" : "मोबाईल"}</th>
                  <th className="p-3 whitespace-nowrap">{isEn ? "Email" : "ईमेल"}</th>
                  <th className="p-3 whitespace-nowrap">{isEn ? "Wing" : "इमारत"}</th>
                  <th className="p-3 whitespace-nowrap">{isEn ? "Flat" : "फ्लॅट"}</th>
                  <th className="p-3 whitespace-nowrap">{isEn ? "Volunteer Area" : "इच्छित सेवा"}</th>
                  <th className="p-3 whitespace-nowrap">{isEn ? "Date" : "तारीख"}</th>
                  <th className="p-3 whitespace-nowrap">{isEn ? "Status" : "स्थिती"}</th>
                  <th className="p-3 text-right whitespace-nowrap">{isEn ? "Actions" : "कृती"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                {volunteers.map((v) => {
                  const statusInfo = STATUS_CONFIG[v.status] || STATUS_CONFIG.New;
                  const formattedDate = new Date(v.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short"
                  });

                  return (
                    <tr key={v._id} className="hover:bg-amber-50/40 transition">
                      <td className="p-3 font-bold text-maroon-950">
                        <div className="flex items-center gap-2">
                          <span>{v.fullName}</span>
                          {v.status === "New" && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse flex-shrink-0" />
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-stone-700 whitespace-nowrap">
                        <a href={`tel:${v.mobile}`} className="hover:text-amber-800 hover:underline">
                          {v.mobile}
                        </a>
                      </td>
                      <td className="p-3 text-stone-600 truncate max-w-[150px]">
                        <a href={`mailto:${v.email}`} className="hover:text-amber-800 hover:underline" title={v.email}>
                          {v.email}
                        </a>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg bg-stone-100 font-bold text-stone-700">
                          {v.wing}
                        </span>
                      </td>
                      <td className="p-3 font-semibold whitespace-nowrap">{v.flatNo}</td>
                      <td className="p-3 font-semibold text-maroon-900 truncate max-w-[160px]" title={v.volunteerArea}>
                        {v.volunteerArea}
                      </td>
                      <td className="p-3 text-stone-500 whitespace-nowrap">{formattedDate}</td>
                      
                      {/* Status Dropdown Pill */}
                      <td className="p-3 whitespace-nowrap">
                        <select
                          value={v.status}
                          onChange={(e) => handleUpdateStatus(v._id, e.target.value)}
                          disabled={statusUpdating}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer outline-none ${statusInfo.color}`}
                        >
                          <option value="New">{isEn ? "New" : "नवीन"}</option>
                          <option value="Reviewed">{isEn ? "Reviewed" : "तपासले"}</option>
                          <option value="Contacted">{isEn ? "Contacted" : "संपर्क केला"}</option>
                          <option value="Accepted">{isEn ? "Accepted" : "स्वीकृत"}</option>
                          <option value="Rejected">{isEn ? "Rejected" : "अस्वीकृत"}</option>
                          <option value="Closed">{isEn ? "Closed" : "बंद"}</option>
                        </select>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. View Details */}
                          <button
                            onClick={() => setViewingRequest(v)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-gold-200 text-maroon-900 transition"
                            title={isEn ? "View Complete Details" : "तपशील पहा"}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Send Thank-You Email */}
                          {v.emailStatus === "Sent" ? (
                            <button
                              onClick={() => handleOpenEmailComposer(v, true)}
                              className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-[11px] font-bold flex items-center gap-1 transition"
                              title={isEn ? `Email sent on ${new Date(v.emailSentAt).toLocaleDateString()}. Click to resend.` : "ईमेल आधीच पाठवला आहे. पुन्हा पाठवण्यासाठी क्लिक करा."}
                            >
                              <Check className="w-3 h-3 text-purple-700 stroke-[3]" />
                              <span>{isEn ? "Sent" : "पाठवले"}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenEmailComposer(v, false)}
                              className="px-2 py-1 rounded-lg bg-gold-400 hover:bg-gold-300 text-maroon-950 text-[11px] font-bold flex items-center gap-1 shadow-xs transition"
                              title={isEn ? "Preview & Send Thank-You Email" : "आभार ईमेल पाठवा"}
                            >
                              <Mail className="w-3 h-3" />
                              <span>{isEn ? "Email" : "ईमेल"}</span>
                            </button>
                          )}

                          {/* 3. Delete */}
                          <button
                            onClick={() => setDeletingRequest(v)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title={isEn ? "Delete submission" : "अर्ज हटवा"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </FestiveCard>

      {/* 3. FULL DETAILS VIEW MODAL */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full border-2 border-gold-400 p-5 sm:p-6 shadow-2xl relative animate-fadeIn max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setViewingRequest(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-gold-400 flex items-center justify-center text-maroon-900 font-bold shadow-xs">
                <Users className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-maroon-950 font-heading">
                  {viewingRequest.fullName}
                </h3>
                <p className="text-xs text-stone-500">
                  {isEn ? "Volunteer Application Details" : "स्वयंसेवक नोंदणी संपूर्ण तपशील"}
                </p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-4 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  {isEn ? "Contact Phone" : "मोबाईल नंबर"}
                </span>
                <a href={`tel:${viewingRequest.mobile}`} className="font-bold text-amber-900 text-sm hover:underline">
                  {viewingRequest.mobile}
                </a>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  {isEn ? "Email Address" : "ईमेल पत्ता"}
                </span>
                <a href={`mailto:${viewingRequest.email}`} className="font-bold text-amber-900 truncate block hover:underline">
                  {viewingRequest.email}
                </a>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  {isEn ? "Wing & Flat" : "इमारत व फ्लॅट नंबर"}
                </span>
                <span className="font-black text-maroon-950 text-sm">
                  {viewingRequest.wing} - {viewingRequest.flatNo}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  {isEn ? "Preferred Area" : "इच्छित सेवा क्षेत्र"}
                </span>
                <span className="font-bold text-maroon-900">
                  {viewingRequest.volunteerArea}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  {isEn ? "Availability" : "उपलब्ध वेळ"}
                </span>
                <span className="font-bold text-stone-800">
                  {viewingRequest.availability}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  {isEn ? "Preferred Date(s)" : "इच्छित दिवस/तारीख"}
                </span>
                <span className="font-bold text-stone-800">
                  {viewingRequest.preferredDates || (isEn ? "Not specified" : "उल्लेख नाही")}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 sm:col-span-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  {isEn ? "Submitted On" : "नोंदणी तारीख व वेळ"}
                </span>
                <span className="text-stone-700 font-semibold">
                  {new Date(viewingRequest.createdAt).toLocaleString("en-IN", {
                    dateStyle: "full",
                    timeStyle: "short"
                  })}
                </span>
              </div>

              {/* Complete Volunteer Message */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-gold-300 sm:col-span-2">
                <span className="text-[10px] font-bold text-maroon-900 uppercase tracking-wider block mb-1 font-heading">
                  {isEn ? "Complete Volunteer Message / Information" : "स्वयंसेवकाचा संपूर्ण संदेश / अतिरिक्त माहिती"}
                </span>
                <p className="text-xs text-stone-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {viewingRequest.message ? viewingRequest.message : (isEn ? "No additional message was provided." : "कोणताही अतिरिक्त संदेश दिलेला नाही.")}
                </p>
              </div>

              {/* Email Status Info */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 sm:col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    {isEn ? "Thank-You Email Status" : "आभार ईमेल स्थिती"}
                  </span>
                  <span className="font-bold text-xs text-stone-800">
                    {viewingRequest.emailStatus === "Sent" 
                      ? (isEn ? `Sent on ${new Date(viewingRequest.emailSentAt).toLocaleString()}` : `पाठवले: ${new Date(viewingRequest.emailSentAt).toLocaleString()}`)
                      : (isEn ? "Not Sent" : "पाठवले नाही (Not Sent)")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenEmailComposer(viewingRequest, viewingRequest.emailStatus === "Sent")}
                  className="px-3 py-1.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-maroon-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{viewingRequest.emailStatus === "Sent" ? (isEn ? "Resend Email" : "पुन्हा ईमेल पाठवा") : (isEn ? "Send Thank-You Email" : "आभार ईमेल पाठवा")}</span>
                </button>
              </div>

              {/* Status Update Dropdown */}
              <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-700">
                  {isEn ? "Update Request Status:" : "विनंती स्थिती बदला:"}
                </span>
                <select
                  value={viewingRequest.status}
                  onChange={(e) => handleUpdateStatus(viewingRequest._id, e.target.value)}
                  className="p-2 rounded-lg border border-stone-300 font-bold text-xs bg-white outline-none"
                >
                  <option value="New">{isEn ? "New" : "नवीन"}</option>
                  <option value="Reviewed">{isEn ? "Reviewed" : "तपासले"}</option>
                  <option value="Contacted">{isEn ? "Contacted" : "संपर्क केला"}</option>
                  <option value="Accepted">{isEn ? "Accepted" : "स्वीकृत"}</option>
                  <option value="Rejected">{isEn ? "Rejected" : "अस्वीकृत"}</option>
                  <option value="Closed">{isEn ? "Closed" : "बंद"}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setViewingRequest(null)}
                className="px-5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition"
              >
                {isEn ? "Close" : "बंद करा"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. EMAIL PREVIEW & COMPOSER MODAL (STRICT ADMIN CONFIRMATION) */}
      {emailComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full border-2 border-gold-400 p-5 sm:p-6 shadow-2xl relative animate-fadeIn max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setEmailComposer(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              disabled={emailComposer.sending}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
              <div className="w-10 h-10 rounded-2xl bg-gold-400 text-maroon-950 flex items-center justify-center font-bold shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-maroon-950 font-heading">
                  {isEn ? "Send Volunteer Thank-You Email" : "स्वयंसेवक आभार ईमेल पाठवा"}
                </h3>
                <p className="text-xs text-stone-500">
                  {isEn
                    ? "Review and edit the email before confirming. No email is sent until you click confirm."
                    : "ईमेल पाठवण्यापूर्वी तपासा. 'Confirm & Send' वर क्लिक केल्याशिवाय ईमेल पाठवला जात नाही."}
                </p>
              </div>
            </div>

            {/* Duplicate Notice if Already Sent */}
            {emailComposer.isResend && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">
                    {isEn ? "Notice: This volunteer has already received a thank-you email." : "सूचना: या स्वयंसेवकाला यापूर्वी आभार ईमेल पाठवला आहे."}
                  </span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    {isEn ? "You can review and send again if necessary." : "गरज असल्यास आपण मजकूर तपासून पुन्हा पाठवू शकता."}
                  </p>
                </div>
              </div>
            )}

            {emailComposer.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{emailComposer.error}</span>
              </div>
            )}

            {/* Editable Form */}
            <div className="space-y-3.5 my-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {isEn ? "To (Recipient Email):" : "प्रति (ईमेल पत्ता):"}
                </label>
                <input
                  type="email"
                  value={emailComposer.recipientEmail}
                  onChange={(e) => setEmailComposer({ ...emailComposer, recipientEmail: e.target.value })}
                  disabled={emailComposer.sending}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-amber-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {isEn ? "Subject:" : "विषय (Subject):"}
                </label>
                <input
                  type="text"
                  value={emailComposer.subject}
                  onChange={(e) => setEmailComposer({ ...emailComposer, subject: e.target.value })}
                  disabled={emailComposer.sending}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-amber-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {isEn ? "Message Body:" : "ईमेल संदेश मजकूर:"}
                </label>
                <textarea
                  rows={9}
                  value={emailComposer.body}
                  onChange={(e) => setEmailComposer({ ...emailComposer, body: e.target.value })}
                  disabled={emailComposer.sending}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-amber-500 outline-none font-medium leading-relaxed"
                />
              </div>
            </div>

            {/* Confirmation Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setEmailComposer(null)}
                disabled={emailComposer.sending}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition"
              >
                {isEn ? "Cancel" : "रद्द करा (Cancel)"}
              </button>

              <button
                type="button"
                onClick={handleConfirmSendEmail}
                disabled={emailComposer.sending}
                className={`px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-maroon-950 font-black text-xs border border-gold-400 shadow-md flex items-center gap-2 transition active:scale-95 ${
                  emailComposer.sending ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {emailComposer.sending
                    ? (isEn ? "Sending Email..." : "ईमेल पाठवत आहे...")
                    : (isEn ? "Confirm & Send Email" : "खात्री करा व ईमेल पाठवा")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DELETE CONFIRMATION MODAL */}
      {deletingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full border-2 border-rose-300 p-5 shadow-2xl relative animate-fadeIn text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-300">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-maroon-950 font-heading">
              {isEn ? "Delete Volunteer Request?" : "स्वयंसेवक विनंती हटवायची आहे का?"}
            </h4>
            <p className="text-xs text-stone-600">
              {isEn 
                ? `Are you sure you want to delete the volunteer submission from "${deletingRequest.fullName}"? This action cannot be undone.` 
                : `आपण खात्रीपूर्वक "${deletingRequest.fullName}" यांचा स्वयंसेवक अर्ज हटवू इच्छिता का?`}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRequest(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition"
              >
                {isEn ? "Cancel" : "रद्द करा"}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow transition"
              >
                {isEn ? "Delete" : "हटवा (Delete)"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VolunteerManager;
