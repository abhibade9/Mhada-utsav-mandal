import React, { useState, useEffect } from "react";
import { 
  BarChart2, Users, Save, Plus, Trash2, RotateCcw, CheckCircle2 
} from "lucide-react";
import { 
  FestiveCard, FestiveInput, FestiveTextarea, FestiveButton, FestiveToggle 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";

const PollManager = ({ config, onSavePoll, onSaveVolunteer, onNotify, onSwitchTab }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isSaving, setIsSaving] = useState(false);
  const [poll, setPoll] = useState({
    active: true,
    question: "",
    questionEn: "",
    options: [],
    totalVotes: 0
  });

  const [volunteer, setVolunteer] = useState({
    active: true,
    title: "",
    titleEn: "",
    description: "",
    descriptionEn: "",
    roles: []
  });

  useEffect(() => {
    if (config?.poll) {
      setPoll({
        active: config.poll.active !== false,
        question: config.poll.question || "",
        questionEn: config.poll.questionEn || "",
        options: config.poll.options ? JSON.parse(JSON.stringify(config.poll.options)) : [],
        totalVotes: config.poll.totalVotes || 0
      });
    }
    if (config?.volunteerSeva) {
      setVolunteer({
        active: config.volunteerSeva.active !== false,
        title: config.volunteerSeva.title || "स्वयंसेवक सेवा नोंदणी",
        titleEn: config.volunteerSeva.titleEn || "Volunteer Registration",
        description: config.volunteerSeva.description || "",
        descriptionEn: config.volunteerSeva.descriptionEn || "",
        roles: config.volunteerSeva.roles ? JSON.parse(JSON.stringify(config.volunteerSeva.roles)) : []
      });
    }
  }, [config]);

  const handleAddOption = () => {
    const nextId = poll.options.length > 0 ? Math.max(...poll.options.map(o => o.id || 0)) + 1 : 1;
    setPoll({
      ...poll,
      options: [
        ...poll.options,
        { id: nextId, text: "नवीन पर्याय", textEn: "New Option", votes: 0 }
      ]
    });
  };

  const handleRemoveOption = (idx) => {
    setPoll({
      ...poll,
      options: poll.options.filter((_, i) => i !== idx)
    });
  };

  const handleOptionChange = (idx, field, val) => {
    const updated = [...poll.options];
    updated[idx][field] = val;
    setPoll({ ...poll, options: updated });
  };

  const handleResetVotes = () => {
    if (window.confirm(isEn ? "Reset all recorded votes to zero?" : "सर्व नोंदवलेली मते शून्य (Reset) करायची आहेत का?")) {
      const resetOpts = poll.options.map(o => ({ ...o, votes: 0 }));
      setPoll({ ...poll, options: resetOpts, totalVotes: 0 });
    }
  };

  const handleAddRole = () => {
    setVolunteer({
      ...volunteer,
      roles: [
        ...volunteer.roles,
        { titleMr: "नवीन सेवा", titleEn: "New Seva Role", descriptionMr: "" }
      ]
    });
  };

  const handleRemoveRole = (idx) => {
    setVolunteer({
      ...volunteer,
      roles: volunteer.roles.filter((_, i) => i !== idx)
    });
  };

  const handleRoleChange = (idx, field, val) => {
    const updated = [...volunteer.roles];
    updated[idx][field] = val;
    setVolunteer({ ...volunteer, roles: updated });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const pRes = await onSavePoll(poll);
    const vRes = await onSaveVolunteer(volunteer);
    setIsSaving(false);
    if (pRes?.success && vRes?.success) {
      if (onNotify) onNotify(isEn ? "Polls and volunteer settings saved!" : "मतदान व स्वयंसेवक सेटिंग्ज जतन झाल्या!");
    } else {
      if (onNotify) onNotify(isEn ? "Failed to save settings" : "जतन करताना त्रुटी आली", "error");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Poll Management Card */}
      <FestiveCard
        title={isEn ? "Resident Polls & Voting (रहिवासी मतदान)" : "रहिवासी मतदान कट्टा (Resident Polls)"}
        subtitle={
          isEn
            ? "Manage society voting questions, options, and live resident vote counters."
            : "सोसायटी रहिवाशांसाठी मतदानाचा प्रश्न, पर्याय आणि थेट मतमोजणी व्यवस्थापित करा."
        }
        icon={BarChart2}
        badge={isEn ? "Polls" : "मतदान"}
        action={
          <div className="flex items-center gap-2">
            <FestiveButton
              onClick={handleResetVotes}
              icon={RotateCcw}
              variant="outline"
              size="md"
            >
              {isEn ? "Reset Votes" : "मते रीसेट करा"}
            </FestiveButton>
            <FestiveButton
              onClick={handleSaveAll}
              icon={Save}
              variant="primary"
              size="md"
              disabled={isSaving}
            >
              {isSaving 
                ? (isEn ? "Saving..." : "जतन करत आहे...") 
                : (isEn ? "Save Polls (जतन करा)" : "जतन करा (Save)")
              }
            </FestiveButton>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-gold-300">
            <div>
              <span className="text-xs font-bold text-maroon-950">
                {isEn ? "Poll Active on Website" : "मतदान सक्रिय ठेवा (Poll Active)"}
              </span>
              <p className="text-[11px] text-gray-600">
                {isEn ? "When disabled, the poll section will be hidden on the website." : "बंद केल्यास युझर्सना मतदानाचा पर्याय दिसणार नाही."}
              </p>
            </div>
            <FestiveToggle
              checked={poll.active}
              onChange={(checked) => setPoll({ ...poll, active: checked })}
              activeText={isEn ? "ON" : "सुरू"}
              inactiveText={isEn ? "OFF" : "बंद"}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FestiveInput
              label={isEn ? "Poll Question (Marathi) *" : "मतदान प्रश्न (मराठी) *"}
              value={poll.question}
              onChange={(e) => setPoll({ ...poll, question: e.target.value })}
              placeholder="उदा. संध्याकाळच्या महाआरतीची कोणती वेळ सर्वात सोयीस्कर आहे?"
            />
            <FestiveInput
              label={isEn ? "Poll Question (English)" : "English Question"}
              value={poll.questionEn}
              onChange={(e) => setPoll({ ...poll, questionEn: e.target.value })}
              placeholder="e.g. Which evening Aarti timing is most convenient?"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-maroon-950">
                {isEn ? "Poll Options & Votes:" : "मतदान पर्याय (Options & Votes):"}
              </span>
              <FestiveButton
                type="button"
                onClick={handleAddOption}
                icon={Plus}
                variant="secondary"
                size="sm"
              >
                {isEn ? "Add Option" : "पर्याय जोडा"}
              </FestiveButton>
            </div>

            <div className="space-y-2">
              {poll.options.map((opt, idx) => (
                <div key={opt.id || idx} className="p-3 bg-white rounded-xl border border-gold-300 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1">
                    <FestiveInput
                      value={opt.text}
                      onChange={(e) => handleOptionChange(idx, "text", e.target.value)}
                      placeholder={isEn ? "Option (Marathi)" : "पर्याय मजकूर (Marathi)"}
                    />
                  </div>
                  <div className="flex-1">
                    <FestiveInput
                      value={opt.textEn || ""}
                      onChange={(e) => handleOptionChange(idx, "textEn", e.target.value)}
                      placeholder={isEn ? "Option (English)" : "Option Text (English)"}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 rounded-xl bg-gold-100 font-mono text-xs font-black text-maroon-950 whitespace-nowrap">
                      {opt.votes || 0} {isEn ? "votes" : "मते"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title={isEn ? "Remove option" : "पर्याय काढा"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FestiveCard>

      {/* 2. Volunteer Seva Card */}
      <FestiveCard
        title={isEn ? "Volunteer Registration Manager (स्वयंसेवक सेवा)" : "स्वयंसेवक सेवा नोंदणी व्यवस्थापक (Volunteer Seva)"}
        subtitle={
          isEn
            ? "Manage volunteer registration options, seva roles, and instructions for residents."
            : "उत्सवासाठी स्वयंसेवक नोंदणी फॉर्ममधील इच्छित सेवांचे पर्याय व माहिती व्यवस्थापित करा."
        }
        icon={Users}
        badge={isEn ? "Volunteers" : "सहभाग"}
        action={
          onSwitchTab ? (
            <FestiveButton
              type="button"
              onClick={() => onSwitchTab("volunteers")}
              icon={Users}
              variant="secondary"
              size="sm"
            >
              {isEn ? "View Volunteer Requests" : "स्वयंसेवक अर्ज पहा"}
            </FestiveButton>
          ) : null
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FestiveInput
              label={isEn ? "Title (Marathi)" : "शीर्षक (Title)"}
              value={volunteer.title}
              onChange={(e) => setVolunteer({ ...volunteer, title: e.target.value })}
              placeholder="स्वयंसेवक सेवा नोंदणी"
            />
            <FestiveInput
              label={isEn ? "Title (English)" : "Title (English)"}
              value={volunteer.titleEn}
              onChange={(e) => setVolunteer({ ...volunteer, titleEn: e.target.value })}
              placeholder="Volunteer Seva Registration"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FestiveInput
              label={isEn ? "Description (Marathi)" : "वर्णन (Description)"}
              value={volunteer.description}
              onChange={(e) => setVolunteer({ ...volunteer, description: e.target.value })}
              placeholder="बाप्पांच्या उत्सवात सेवा करण्याची सुवर्णसंधी..."
            />
            <FestiveInput
              label={isEn ? "Description (English)" : "Description (English)"}
              value={volunteer.descriptionEn}
              onChange={(e) => setVolunteer({ ...volunteer, descriptionEn: e.target.value })}
              placeholder="Join hands as a blessed volunteer..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-maroon-950">
                {isEn ? "Available Seva Roles:" : "उपलब्ध सेवा पर्याय (Seva Roles):"}
              </span>
              <FestiveButton
                type="button"
                onClick={handleAddRole}
                icon={Plus}
                variant="secondary"
                size="sm"
              >
                {isEn ? "Add Role" : "सेवा जोडा"}
              </FestiveButton>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {volunteer.roles.map((r, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-xl border border-gold-300 flex items-center gap-2">
                  <div className="flex-1">
                    <FestiveInput
                      value={r.titleMr}
                      onChange={(e) => handleRoleChange(idx, "titleMr", e.target.value)}
                      placeholder={isEn ? "e.g. Mandap & Aarti support" : "उदा. मंडप व्यवस्था व आरती मदत"}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(idx)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title={isEn ? "Remove role" : "सेवा काढा"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FestiveCard>

    </div>
  );
};

export default PollManager;
