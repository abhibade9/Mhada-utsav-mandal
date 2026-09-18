import React, { useState, useEffect } from "react";
import { 
  Save, Newspaper, Sparkles, Building, Flame, ShieldCheck, Share2,
  Plus, Trash2, Edit3, Clock, Calendar, Check, X, ArrowUp, ArrowDown,
  LayoutGrid, Megaphone, UtensilsCrossed, Trophy, Car, Info, Music,
  Eye, Star, AlertTriangle, UserCheck
} from "lucide-react";
import { 
  FestiveCard, FestiveInput, FestiveTextarea, FestiveSelect, FestiveButton, FestiveToggle 
} from "./FestiveControls";
import { useLanguage } from "../../context/LanguageContext";
import { formatNewsletterBroadcast, openWhatsApp } from "../../utils/whatsappFormatter";
import { 
  getKolkataDate, 
  calculateFestivalDay, 
  diffInDays, 
  formatKolkataDateString 
} from "../../utils/aartiDateUtils";

const CATEGORY_OPTIONS = [
  { value: "aarti", labelMr: "महाआरती व विधी (Aarti)", labelEn: "Daily Maha Aarti & Rituals", icon: Flame, color: "text-orange-400" },
  { value: "host", labelMr: "यजमान इमारत व प्रमुख (Host)", labelEn: "Host Building & Coordinator", icon: Building, color: "text-gold-400" },
  { value: "prasad", labelMr: "महाप्रसाद माहिती (Prasad)", labelEn: "Prasad Distribution", icon: UtensilsCrossed, color: "text-amber-400" },
  { value: "event", labelMr: "उत्सव कार्यक्रम (Event)", labelEn: "Festival Event Schedule", icon: Calendar, color: "text-gold-300" },
  { value: "cultural", labelMr: "सांस्कृतिक कार्यक्रम (Cultural)", labelEn: "Cultural Program", icon: Music, color: "text-purple-400" },
  { value: "competition", labelMr: "स्पर्धा व पारितोषिक (Competition)", labelEn: "Competitions & Contests", icon: Trophy, color: "text-yellow-400" },
  { value: "announcement", labelMr: "महत्त्वाची सूचना (Announcement)", labelEn: "Important Announcement", icon: Megaphone, color: "text-rose-400" },
  { value: "parking", labelMr: "पार्किंग नियमावली (Parking)", labelEn: "Parking Guidelines", icon: Car, color: "text-sky-400" },
  { value: "safety", labelMr: "सुरक्षा व निगराणी (Safety)", labelEn: "Safety & Security Notice", icon: ShieldCheck, color: "text-emerald-400" },
  { value: "general", labelMr: "सर्वसाधारण माहिती (General)", labelEn: "General Information", icon: Info, color: "text-gold-300" }
];

const DISPLAY_STYLES = [
  {
    id: "classic",
    titleMr: "क्लासिक कार्ड्स",
    titleEn: "Classic Cards",
    descMr: "महाआरती व यजमान इमारतीचे मूळ कार्ड-आधारित आकर्षक स्वरूप",
    descEn: "Card-based design with side-by-side Aarti & Host highlights",
    icon: Building
  },
  {
    id: "timeline",
    titleMr: "टाइमलाइन / वेळापत्रक",
    titleEn: "Timeline / Schedule",
    descMr: "वेळेनुसार चढत्या क्रमातील टाइमलाइन व प्रकाशित नोड्स",
    descEn: "Chronological vertical timeline with glowing festive nodes",
    icon: Clock
  },
  {
    id: "grid",
    titleMr: "माहिती ग्रिड",
    titleEn: "Information Grid",
    descMr: "चिन्हांसह सुबक बहु-स्तंभीय आधुनिक कार्ड ग्रिड",
    descEn: "Symmetrical multi-column grid with category icon badges",
    icon: LayoutGrid
  },
  {
    id: "bulletin",
    titleMr: "बुलेटिन / ठळक सूचना",
    titleEn: "Bulletin / Announcement",
    descMr: "संपूर्ण दिवसाची कार्यक्रम यादी व ठळक सूचना फलक",
    descEn: "High-density program summary with notice callouts",
    icon: Megaphone
  }
];

const createDefaultBlocks = () => [
  {
    id: `blk_aarti_${Date.now()}_1`,
    category: "aarti",
    title: "DAILY MAHA AARTI & HOST WINGS",
    titleMr: "दैनिक महाआरती व विंग यजमान",
    subtitle: "Murti Pranpratishtha Pooja & Maha Aarti",
    subtitleMr: "मूर्ती प्राणप्रतिष्ठा पूजा व महाआरती",
    time: "08:30 AM & 07:30 PM",
    timeMr: "सकाळी ०८:३० व रात्री ०७:३०",
    description: "Morning: 08:30 AM - Murti Pranpratishtha Pooja & Maha Aarti\nEvening: 07:30 PM - Dhupaarti, Atharvashirsha & Maha Aarti",
    descriptionMr: "सकाळची महाआरती: ०८:३० AM - श्रींची विधिवत प्राणप्रतिष्ठा पूजा व महाआरती\nसंध्याकाळची महाआरती: ०७:३० PM - धूप आरती, सामूहिक अथर्वशीर्ष पठण व महाआरती",
    badge: "Aarti",
    priority: "high",
    isActive: true,
    order: 1,
    items: [
      {
        id: "itm_1",
        label: "Morning Maha Aarti:",
        labelMr: "सकाळची महाआरती:",
        time: "08:30 AM",
        timeMr: "सकाळी ०८:३०",
        desc: "Murti Pranpratishtha Pooja & Maha Aarti",
        descMr: "श्रींची विधिवत प्राणप्रतिष्ठा पूजा व महाआरती"
      },
      {
        id: "itm_2",
        label: "Evening Maha Aarti:",
        labelMr: "संध्याकाळची महाआरती:",
        time: "07:30 PM",
        timeMr: "रात्री ०७:३०",
        desc: "Dhupaarti, Atharvashirsha & Maha Aarti",
        descMr: "धूप आरती, सामूहिक अथर्वशीर्ष पठण व महाआरती"
      }
    ]
  },
  {
    id: `blk_host_${Date.now()}_2`,
    category: "host",
    title: "HOST BUILDING",
    titleMr: "यजमान इमारत",
    subtitle: "All 5 Buildings Joint (G, H, I, J, K)",
    subtitleMr: "सर्व ५ इमारती संयुक्त (G • H • I • J • K WINGS)",
    description: "All Committee Members & Senior Residents",
    descriptionMr: "म्हाडा उत्सव मंडळ सर्व कमिटी सदस्य व ज्येष्ठ नागरिक",
    hostCoordinator: "All Committee Members & Senior Residents",
    hostCoordinatorMr: "म्हाडा उत्सव मंडळ सर्व कमिटी सदस्य व ज्येष्ठ नागरिक",
    time: "",
    timeMr: "",
    badge: "Host",
    priority: "normal",
    isActive: true,
    order: 2,
    items: []
  }
];

const createDefaultDays = () => [
  {
    id: "day_3",
    dayNumber: 3,
    dateStr: "16 Sep 2026",
    dateStrEn: "16 Sep 2026",
    dateStrMr: "१६ सप्टेंबर २०२६",
    festivalDayLabel: "Day 3 (Ganesh Utsav - 16 Sep)",
    festivalDayLabelMr: "दिवस ३ (गणेश उत्सव - १६ सप्टेंबर)",
    headline: "Ganpati Festival Live",
    headlineMr: "गणपती उत्सव थेट (लाइव्ह)",
    subtitle: "All 5 wings are participated",
    subtitleMr: "सर्व ५ इमारतींचा संयुक्त सहभाग",
    isCurrentDay: true,
    isActive: true,
    order: 1,
    blocks: createDefaultBlocks()
  }
];

const NewsletterManager = ({ config, onSaveNewsletter, onNotify }) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isSaving, setIsSaving] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Main Form State
  const [form, setForm] = useState({
    enabled: true,
    startDate: "2026-09-07",
    endDate: "2026-09-16",
    showSelectDay: true,
    showTodayBadge: true,
    showCurrentDay: true,
    displayStyle: "classic",
    bulletinTitle: "DAILY DIGITAL BULLETIN",
    bulletinTitleMr: "दैनिक डिजिटल वृत्तपत्र",
    eventDuration: "1 day event",
    eventDurationMr: "१ दिवसीय सोहळा",
    festivalName: "Ganesh Utsav - 16 Sep",
    festivalNameMr: "गणेश उत्सव - १६ सप्टेंबर",
    headline: "Ganpati Festival Live",
    headlineMr: "गणपती उत्सव थेट (लाइव्ह)",
    subtitle: "All 5 wings are participated",
    subtitleMr: "सर्व ५ इमारतींचा संयुक्त सहभाग",
    safetyTip: "Please park vehicles only in designated spots.",
    safetyTipMr: "कृपया वाहने नियुक्त पार्किंगमध्येच लावावीत.",
    days: createDefaultDays()
  });

  // Modal State for Adding/Editing Information Block
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBlockIndex, setEditingBlockIndex] = useState(null);
  const [blockForm, setBlockForm] = useState({
    id: "",
    category: "aarti",
    title: "",
    titleMr: "",
    subtitle: "",
    subtitleMr: "",
    time: "",
    timeMr: "",
    description: "",
    descriptionMr: "",
    hostCoordinator: "",
    hostCoordinatorMr: "",
    badge: "",
    priority: "normal",
    isActive: true,
    order: 1,
    startTime: "",
    endTime: "",
    items: []
  });

  // Modal State for Adding/Editing Day
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [dayForm, setDayForm] = useState({
    id: "",
    dayNumber: 1,
    dateStr: "",
    dateStrMr: "",
    festivalDayLabel: "",
    festivalDayLabelMr: "",
    headline: "",
    headlineMr: "",
    subtitle: "",
    subtitleMr: "",
    isCurrentDay: false,
    isActive: true
  });

  // Populate from config on mount or update
  useEffect(() => {
    if (config?.newsletter) {
      const nl = config.newsletter;
      let loadedDays = (Array.isArray(nl.days) && nl.days.length > 0)
        ? nl.days
        : createDefaultDays();

      const enabled = nl.enabled !== undefined 
        ? nl.enabled 
        : (config?.tabs?.newsletter?.enabled !== false);

      setForm({
        enabled,
        startDate: nl.startDate || "2026-09-07",
        endDate: nl.endDate || "2026-09-16",
        showSelectDay: nl.showSelectDay !== undefined ? Boolean(nl.showSelectDay) : true,
        showTodayBadge: nl.showTodayBadge !== undefined ? Boolean(nl.showTodayBadge) : true,
        showCurrentDay: nl.showCurrentDay !== undefined ? Boolean(nl.showCurrentDay) : true,
        displayStyle: nl.displayStyle || "classic",
        bulletinTitle: nl.bulletinTitle || "DAILY DIGITAL BULLETIN",
        bulletinTitleMr: nl.bulletinTitleMr || "दैनिक डिजिटल वृत्तपत्र",
        eventDuration: nl.eventDuration || "1 day event",
        eventDurationMr: nl.eventDurationMr || "१ दिवसीय सोहळा",
        festivalName: nl.festivalName || "Ganesh Utsav - 16 Sep",
        festivalNameMr: nl.festivalNameMr || "गणेश उत्सव - १६ सप्टेंबर",
        headline: nl.headline || "Ganpati Festival Live",
        headlineMr: nl.headlineMr || "गणपती उत्सव थेट (लाइव्ह)",
        subtitle: nl.subtitle || "All 5 wings are participated",
        subtitleMr: nl.subtitleMr || "सर्व ५ इमारतींचा संयुक्त सहभाग",
        safetyTip: nl.safetyTip || "Please park vehicles only in designated spots.",
        safetyTipMr: nl.safetyTipMr || "कृपया वाहने नियुक्त पार्किंगमध्येच लावावीत.",
        days: loadedDays
      });

      // Keep selected day within bounds
      if (selectedDayIdx >= loadedDays.length) {
        setSelectedDayIdx(0);
      }
    }
  }, [config]);

  // Current active day being edited
  const currentDay = form.days[selectedDayIdx] || form.days[0] || {};
  const currentBlocks = currentDay.blocks || [];

  // -------------------------------------------------------------
  // DAY MANAGEMENT ACTIONS
  // -------------------------------------------------------------

  const handleSetAsToday = (idx) => {
    const updatedDays = form.days.map((d, i) => ({
      ...d,
      isCurrentDay: i === idx
    }));
    setForm(prev => ({ ...prev, days: updatedDays }));
    if (onNotify) {
      onNotify(isEn ? `Day ${updatedDays[idx].dayNumber} marked as Today` : `दिवस ${updatedDays[idx].dayNumber} आजचा दिवस म्हणून सेट केला!`, "success");
    }
  };

  const handleOpenAddDay = () => {
    const nextNum = (form.days.length > 0) 
      ? Math.max(...form.days.map(d => Number(d.dayNumber) || 0)) + 1 
      : 1;

    setDayForm({
      id: `day_${Date.now()}`,
      dayNumber: nextNum,
      dateStr: `${nextNum} Sep 2026`,
      dateStrMr: `${nextNum} सप्टेंबर २०२६`,
      festivalDayLabel: `Day ${nextNum} (Ganesh Utsav)`,
      festivalDayLabelMr: `दिवस ${nextNum} (श्री गणेशोत्सव)`,
      headline: form.headline || "Ganpati Festival Live",
      headlineMr: form.headlineMr || "गणपती उत्सव थेट",
      subtitle: form.subtitle || "All 5 wings are participated",
      subtitleMr: form.subtitleMr || "सर्व ५ इमारतींचा संयुक्त सहभाग",
      isCurrentDay: form.days.length === 0,
      isActive: true
    });
    setEditingDayIndex(null);
    setIsDayModalOpen(true);
  };

  const handleOpenEditDay = (idx) => {
    const target = form.days[idx];
    if (!target) return;
    setDayForm({ ...target });
    setEditingDayIndex(idx);
    setIsDayModalOpen(true);
  };

  const handleSaveDayModal = (e) => {
    if (e) e.preventDefault();
    if (editingDayIndex !== null) {
      // Edit existing day
      const updatedDays = [...form.days];
      updatedDays[editingDayIndex] = {
        ...updatedDays[editingDayIndex],
        ...dayForm
      };
      // If marked current day, reset others
      if (dayForm.isCurrentDay) {
        updatedDays.forEach((d, i) => {
          if (i !== editingDayIndex) d.isCurrentDay = false;
        });
      }
      setForm(prev => ({ ...prev, days: updatedDays }));
      if (onNotify) onNotify(isEn ? "Day details updated" : "दिवसाची माहिती अद्ययावत केली");
    } else {
      // Add new day
      const newDay = {
        ...dayForm,
        id: dayForm.id || `day_${Date.now()}`,
        blocks: createDefaultBlocks()
      };
      const updatedDays = [...form.days, newDay];
      if (newDay.isCurrentDay) {
        updatedDays.forEach((d, i) => {
          if (i !== updatedDays.length - 1) d.isCurrentDay = false;
        });
      }
      setForm(prev => ({ ...prev, days: updatedDays }));
      setSelectedDayIdx(updatedDays.length - 1);
      if (onNotify) onNotify(isEn ? `Day ${newDay.dayNumber} added successfully` : `दिवस ${newDay.dayNumber} जोडला गेला!`);
    }
    setIsDayModalOpen(false);
  };

  const handleDeleteDay = (idx) => {
    if (form.days.length <= 1) {
      if (onNotify) onNotify(isEn ? "At least one day must be preserved" : "किमान एक दिवस ठेवणे आवश्यक आहे", "error");
      return;
    }
    const dayToDelete = form.days[idx];
    if (!window.confirm(isEn ? `Delete Day ${dayToDelete?.dayNumber || idx + 1}? All blocks in this day will be removed.` : `दिवस ${dayToDelete?.dayNumber || idx + 1} खरोखर हटवायचा आहे का?`)) {
      return;
    }
    const updatedDays = form.days.filter((_, i) => i !== idx);
    // Ensure at least one is current if deleted day was current
    if (dayToDelete.isCurrentDay && updatedDays.length > 0) {
      updatedDays[0].isCurrentDay = true;
    }
    setForm(prev => ({ ...prev, days: updatedDays }));
    setSelectedDayIdx(Math.max(0, idx - 1));
    if (onNotify) onNotify(isEn ? "Day removed" : "दिवस हटवला गेला");
  };

  const handleToggleDayActive = (idx) => {
    const updatedDays = [...form.days];
    updatedDays[idx].isActive = !updatedDays[idx].isActive;
    setForm(prev => ({ ...prev, days: updatedDays }));
  };

  const handleMoveDay = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= form.days.length) return;
    const updatedDays = [...form.days];
    const temp = updatedDays[idx];
    updatedDays[idx] = updatedDays[targetIdx];
    updatedDays[targetIdx] = temp;
    setForm(prev => ({ ...prev, days: updatedDays }));
    setSelectedDayIdx(targetIdx);
  };

  // -------------------------------------------------------------
  // BLOCK MANAGEMENT ACTIONS
  // -------------------------------------------------------------

  const handleOpenAddBlock = () => {
    setBlockForm({
      id: `blk_${Date.now()}`,
      category: "aarti",
      title: isEn ? "Daily Maha Aarti" : "दैनिक महाआरती व विधी",
      titleMr: "दैनिक महाआरती व विंग यजमान",
      subtitle: "",
      subtitleMr: "",
      time: "08:30 AM",
      timeMr: "सकाळी ०८:३०",
      description: "",
      descriptionMr: "",
      hostCoordinator: "",
      hostCoordinatorMr: "",
      badge: "",
      priority: "normal",
      isActive: true,
      order: currentBlocks.length + 1,
      startTime: "",
      endTime: "",
      items: [
        { id: "itm_1", label: "Morning Aarti:", labelMr: "सकाळची महाआरती:", time: "08:30 AM", timeMr: "सकाळी ०८:३०", desc: "", descMr: "" },
        { id: "itm_2", label: "Evening Aarti:", labelMr: "संध्याकाळची महाआरती:", time: "07:30 PM", timeMr: "रात्री ०७:३०", desc: "", descMr: "" }
      ]
    });
    setEditingBlockIndex(null);
    setIsBlockModalOpen(true);
  };

  const handleOpenEditBlock = (blkIdx) => {
    const target = currentBlocks[blkIdx];
    if (!target) return;
    setBlockForm({
      id: target.id || `blk_${Date.now()}`,
      category: target.category || "general",
      title: target.title || "",
      titleMr: target.titleMr || "",
      subtitle: target.subtitle || "",
      subtitleMr: target.subtitleMr || "",
      time: target.time || "",
      timeMr: target.timeMr || "",
      description: target.description || "",
      descriptionMr: target.descriptionMr || "",
      hostCoordinator: target.hostCoordinator || "",
      hostCoordinatorMr: target.hostCoordinatorMr || "",
      badge: target.badge || "",
      priority: target.priority || "normal",
      isActive: target.isActive !== false,
      order: Number(target.order) || blkIdx + 1,
      startTime: target.startTime || "",
      endTime: target.endTime || "",
      items: Array.isArray(target.items) ? [...target.items] : []
    });
    setEditingBlockIndex(blkIdx);
    setIsBlockModalOpen(true);
  };

  const handleSaveBlockModal = (e) => {
    if (e) e.preventDefault();
    if (!blockForm.title && !blockForm.titleMr) {
      if (onNotify) onNotify(isEn ? "Block title is required" : "ब्लॉकचे शीर्षक आवश्यक आहे", "error");
      return;
    }

    const updatedDays = [...form.days];
    const targetDay = { ...updatedDays[selectedDayIdx] };
    const updatedBlocks = [...(targetDay.blocks || [])];

    if (editingBlockIndex !== null) {
      updatedBlocks[editingBlockIndex] = { ...blockForm };
    } else {
      updatedBlocks.push({ ...blockForm });
    }

    // Sort blocks by order
    targetDay.blocks = updatedBlocks.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    updatedDays[selectedDayIdx] = targetDay;
    setForm(prev => ({ ...prev, days: updatedDays }));
    setIsBlockModalOpen(false);
    if (onNotify) onNotify(isEn ? "Information block saved" : "माहिती ब्लॉक जतन केला!");
  };

  const handleDeleteBlock = (blkIdx) => {
    const blk = currentBlocks[blkIdx];
    if (!window.confirm(isEn ? `Delete block "${blk?.title || 'Information'}"?` : `हा ब्लॉक खरोखर हटवायचा आहे का?`)) {
      return;
    }
    const updatedDays = [...form.days];
    const targetDay = { ...updatedDays[selectedDayIdx] };
    targetDay.blocks = (targetDay.blocks || []).filter((_, i) => i !== blkIdx);
    updatedDays[selectedDayIdx] = targetDay;
    setForm(prev => ({ ...prev, days: updatedDays }));
    if (onNotify) onNotify(isEn ? "Block removed" : "ब्लॉक हटवला गेला");
  };

  const handleToggleBlockActive = (blkIdx) => {
    const updatedDays = [...form.days];
    const targetDay = { ...updatedDays[selectedDayIdx] };
    const updatedBlocks = [...(targetDay.blocks || [])];
    updatedBlocks[blkIdx] = {
      ...updatedBlocks[blkIdx],
      isActive: updatedBlocks[blkIdx].isActive === false ? true : false
    };
    targetDay.blocks = updatedBlocks;
    updatedDays[selectedDayIdx] = targetDay;
    setForm(prev => ({ ...prev, days: updatedDays }));
  };

  const handleMoveBlock = (blkIdx, direction) => {
    const targetIdx = blkIdx + direction;
    if (targetIdx < 0 || targetIdx >= currentBlocks.length) return;
    const updatedDays = [...form.days];
    const targetDay = { ...updatedDays[selectedDayIdx] };
    const updatedBlocks = [...(targetDay.blocks || [])];
    const temp = updatedBlocks[blkIdx];
    updatedBlocks[blkIdx] = updatedBlocks[targetIdx];
    updatedBlocks[targetIdx] = temp;

    // Re-assign order numbers
    updatedBlocks.forEach((b, i) => { b.order = i + 1; });
    targetDay.blocks = updatedBlocks;
    updatedDays[selectedDayIdx] = targetDay;
    setForm(prev => ({ ...prev, days: updatedDays }));
  };

  // Aarti Items helper inside block modal
  const handleAddAartiRow = () => {
    setBlockForm(prev => ({
      ...prev,
      items: [
        ...(prev.items || []),
        { id: `itm_${Date.now()}`, label: "Aarti:", labelMr: "आरती:", time: "08:00 PM", timeMr: "रात्री ०८:००", desc: "", descMr: "" }
      ]
    }));
  };

  const handleRemoveAartiRow = (itmIdx) => {
    setBlockForm(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== itmIdx)
    }));
  };

  const handleUpdateAartiRow = (itmIdx, field, val) => {
    const updated = [...(blockForm.items || [])];
    updated[itmIdx] = { ...updated[itmIdx], [field]: val };
    setBlockForm(prev => ({ ...prev, items: updated }));
  };

  // -------------------------------------------------------------
  // SAVE FORM TO BACKEND
  // -------------------------------------------------------------
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Date range validation
    if (!form.startDate || !form.endDate) {
      if (onNotify) onNotify(isEn ? "Please configure both Start Date and End Date" : "कृपया सुरूवात आणि समाप्ती तारीख दोन्ही भरा", "error");
      return;
    }

    if (form.endDate < form.startDate) {
      if (onNotify) onNotify(isEn ? "End Date cannot be earlier than Start Date" : "समाप्ती तारीख सुरूवातीच्या तारखेच्या आधी असू शकत नाही", "error");
      return;
    }

    setIsSaving(true);

    const payload = {
      ...form,
      startDate: form.startDate,
      endDate: form.endDate,
      showSelectDay: form.showSelectDay !== false,
      showTodayBadge: form.showTodayBadge !== false,
      showCurrentDay: form.showCurrentDay !== false,
      // Backward-compatible mirror fields
      edition: form.bulletinTitleMr || form.bulletinTitle,
      editionEn: form.eventDuration,
      headline: form.headlineMr || form.headline,
      headlineEn: form.headline,
      subheadline: form.subtitleMr || form.subtitle,
      subheadlineEn: form.subtitle,
      safetyTip: form.safetyTipMr || form.safetyTip,
      safetyTipEn: form.safetyTip
    };

    const res = await onSaveNewsletter(payload);
    setIsSaving(false);

    if (res?.success) {
      if (onNotify) onNotify(isEn ? "Digital Newsletter settings saved successfully!" : "दैनिक डिजिटल वृत्तपत्र सेटिंग्ज यशस्वीरित्या जतन केल्या!");
    } else {
      if (onNotify) onNotify(isEn ? "Failed to save newsletter" : "वृत्तपत्र जतन करताना त्रुटी आली", "error");
    }
  };

  return (
    <FestiveCard
      title={isEn ? "Daily Digital Bulletin Management" : "दैनिक डिजिटल वृत्तपत्र व्यवस्थापन"}
      subtitle={isEn 
        ? "Fully control the digital bulletin section: master ON/OFF, 4 display styles, multi-day schedule, and flexible information blocks."
        : "दैनिक वृत्तपत्र संपूर्णपणे नियंत्रित करा: मुख्य चालू/बंद स्विच, ४ प्रदर्शन शैली, दिवस व्यवस्थापन व लवचिक माहिती ब्लॉक्स."
      }
      icon={Newspaper}
      badge={isEn ? "Dynamic Channel" : "थेट डिजिटल माहिती"}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const txt = formatNewsletterBroadcast(form, config, currentDay);
              openWhatsApp(txt);
              if (onNotify) onNotify(isEn ? "Opening WhatsApp with newsletter..." : "व्हॉट्सॲपवर वृत्तपत्र पाठवण्यासाठी तयार!", "success");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition cursor-pointer"
            title="थेट व्हॉट्सॲपवर पाठवा"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isEn ? "Share on WhatsApp" : "व्हॉट्सॲपवर पाठवा"}</span>
          </button>

          <FestiveButton
            onClick={handleSubmit}
            icon={Save}
            variant="primary"
            size="md"
            disabled={isSaving}
          >
            {isSaving 
              ? (isEn ? "Saving..." : "जतन करत आहे...") 
              : (isEn ? "Save Changes (बदल जतन करा)" : "बदल जतन करा (Save)")
            }
          </FestiveButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">

        {/* SECTION 1: Master ON/OFF Switch */}
        <div className="p-4 bg-amber-50/80 rounded-2xl border-2 border-gold-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase text-maroon-950 font-heading block mb-0.5">
              {isEn ? "1. Section Visibility Control (Master ON / OFF)" : "१. डिजिटल वृत्तपत्र दृश्यमानता (Master ON / OFF)"}
            </span>
            <p className="text-xs text-stone-600">
              {isEn 
                ? "Turn ON to display on the public website, or OFF to completely hide without losing any saved data."
                : "सुरू (ON) केल्यास मुख्य पृष्ठावर दिसेल; बंद (OFF) केल्यास वेबसाईटवरून पूर्णपणे लपवले जाईल व डेटा सुरक्षित राहील."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full ${
              form.enabled 
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                : "bg-red-100 text-red-800 border border-red-300"
            }`}>
              <span className={`w-2 h-2 rounded-full ${form.enabled ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
              <span>{form.enabled ? (isEn ? "LIVE ON HOMEPAGE" : "वेबसाईटवर सुरू") : (isEn ? "HIDDEN (OFF)" : "लपवलेले (बंद)")}</span>
            </span>

            <FestiveToggle
              checked={form.enabled !== false}
              onChange={(val) => setForm(prev => ({ ...prev, enabled: val }))}
              activeText={isEn ? "ON" : "सुरू"}
              inactiveText={isEn ? "OFF" : "बंद"}
              size="md"
            />
          </div>
        </div>

        {/* SECTION 2: Newsletter Period & Automatic Date Range */}
        <div className="p-4 bg-[#FFFDF9] rounded-2xl border-2 border-gold-300 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold-200 pb-2">
            <div>
              <span className="text-xs font-black uppercase text-maroon-950 font-heading block mb-0.5">
                {isEn ? "2. Newsletter Active Period (Automatic Date / Day)" : "२. उत्सव कालावधी (स्वयंचलित दिवस व तारीख)"}
              </span>
              <p className="text-xs text-stone-600">
                {isEn 
                  ? "Configure the period once. The website automatically calculates Current Day = Current Date - Start Date + 1 every morning in Asia/Kolkata timezone."
                  : "कालावधी एकदाच निवडा. वेबसाईट दररोज सकाळी भारतीय प्रमाणवेळेनुसार (Asia/Kolkata) चालू दिवसाची स्वयंचलित गणना करेल."}
              </p>
            </div>

            {/* Live Period Status Pill */}
            {form.startDate && form.endDate && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-gold-400 shadow-xs">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    {isEn 
                      ? `Total: ${Math.max(0, diffInDays(form.endDate, form.startDate) + 1)} Days` 
                      : `एकूण: ${Math.max(0, diffInDays(form.endDate, form.startDate) + 1)} दिवस`}
                  </span>
                </span>

                {(() => {
                  const dayCalc = calculateFestivalDay(form.startDate, form.endDate, getKolkataDate());
                  if (dayCalc.status === "upcoming") {
                    return (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black bg-sky-100 text-sky-800 border border-sky-300 px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3 text-sky-600" />
                        <span>{isEn ? `Upcoming (${dayCalc.daysUntil} days left)` : `आगामी (${dayCalc.daysUntil} दिवस बाकी)`}</span>
                      </span>
                    );
                  }
                  if (dayCalc.status === "active") {
                    return (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{isEn ? `Live Now: Day ${dayCalc.currentDay}` : `सुरू आहे: दिवस ${dayCalc.currentDay}`}</span>
                      </span>
                    );
                  }
                  if (dayCalc.status === "concluded") {
                    return (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black bg-stone-100 text-stone-700 border border-stone-300 px-2.5 py-1 rounded-full">
                        <span>{isEn ? "Festival Concluded" : "उत्सव सांगता"}</span>
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveInput
              label={isEn ? "Start Date (प्रारंभ तारीख) *" : "सुरूवात तारीख (Start Date) *"}
              type="date"
              icon={Calendar}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
            <FestiveInput
              label={isEn ? "End Date (समाप्ती तारीख) *" : "समाप्ती तारीख (End Date) *"}
              type="date"
              icon={Calendar}
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </div>
        </div>

        {/* SECTION 3: Display Options */}
        <div className="p-4 bg-[#FFFDF9] rounded-2xl border-2 border-gold-300 shadow-xs space-y-4">
          <span className="text-xs font-black uppercase text-maroon-950 font-heading block">
            {isEn ? "3. Display Options (दृश्यमानता पर्याय)" : "३. प्रदर्शन पर्याय (Display Options)"}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Show Select Day */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-gold-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-maroon-950 block">
                  {isEn ? "Show Select Day Section" : "'दिवस निवडा' विभाग दाखवा"}
                </span>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  {isEn ? "Show Day 1, Day 2... selector pills at bottom" : "तळाशी दिवस १, दिवस २... निवड बटणे दाखवा"}
                </p>
              </div>
              <FestiveToggle
                checked={form.showSelectDay !== false}
                onChange={(val) => setForm(prev => ({ ...prev, showSelectDay: val }))}
                activeText={isEn ? "ON" : "सुरू"}
                inactiveText={isEn ? "OFF" : "बंद"}
                size="sm"
              />
            </div>

            {/* Show Today Badge */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-gold-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-maroon-950 block">
                  {isEn ? "Show Today Badge" : "'आजचा दिवस' बॅज दाखवा"}
                </span>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  {isEn ? "Show pulsing Today's Day indicator on active day" : "चालू दिवशी 'Today's Day' चमकणारा बॅज दाखवा"}
                </p>
              </div>
              <FestiveToggle
                checked={form.showTodayBadge !== false}
                onChange={(val) => setForm(prev => ({ ...prev, showTodayBadge: val }))}
                activeText={isEn ? "ON" : "सुरू"}
                inactiveText={isEn ? "OFF" : "बंद"}
                size="sm"
              />
            </div>

            {/* Show Current Day */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-gold-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-maroon-950 block">
                  {isEn ? "Show Current Day in Header" : "मथळ्यात चालू दिवस दाखवा"}
                </span>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  {isEn ? "Display active day calculation in bulletin header" : "वृत्तपत्राच्या मुख्य मथळ्यात दिवसाची गणना दाखवा"}
                </p>
              </div>
              <FestiveToggle
                checked={form.showCurrentDay !== false}
                onChange={(val) => setForm(prev => ({ ...prev, showCurrentDay: val }))}
                activeText={isEn ? "ON" : "सुरू"}
                inactiveText={isEn ? "OFF" : "बंद"}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: 4 Display Styles Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase text-maroon-950 font-heading">
              {isEn ? "4. Choose Display Style (4 Options)" : "४. माहिती प्रदर्शन शैली निवडा (४ पर्याय)"}
            </label>
            <span className="text-[11px] text-stone-500 font-semibold">
              {isEn ? "Active Style: " : "निवडलेली शैली: "}
              <strong className="text-amber-800 uppercase">{form.displayStyle}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DISPLAY_STYLES.map((style) => {
              const isSelected = form.displayStyle === style.id;
              const IconComp = style.icon;

              return (
                <div
                  key={style.id}
                  onClick={() => setForm(prev => ({ ...prev, displayStyle: style.id }))}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-gradient-to-br from-amber-50 to-amber-100/60 border-gold-500 shadow-md ring-2 ring-gold-400/30"
                      : "bg-[#FFFDF9] border-gold-200 hover:border-gold-300 hover:bg-stone-50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg ${isSelected ? "bg-maroon-950 text-gold-300" : "bg-stone-200 text-stone-700"}`}>
                          <IconComp className="w-4 h-4" />
                        </span>
                        <span className="font-extrabold text-xs text-maroon-950">
                          {isEn ? style.titleEn : style.titleMr}
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-amber-600 bg-amber-600 text-white" : "border-stone-300 bg-white"
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-600 leading-tight">
                      {isEn ? style.descEn : style.descMr}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: General Bulletin Info */}
        <div className="p-4 bg-[#FFFDF9] rounded-2xl border-2 border-gold-300 shadow-xs space-y-4">
          <span className="text-xs font-black uppercase text-maroon-950 font-heading block">
            {isEn ? "5. Bulletin Header & General Information" : "५. मुख्य मथळा व सर्वसाधारण माहिती"}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FestiveInput
              label={isEn ? "Bulletin Badge Title (English)" : "वृत्तपत्र बॅज शीर्षक (इंग्रजी)"}
              value={form.bulletinTitle}
              onChange={(e) => setForm({ ...form, bulletinTitle: e.target.value })}
              placeholder="e.g. DAILY DIGITAL BULLETIN"
            />
            <FestiveInput
              label={isEn ? "Event Duration Badge" : "उत्सव कालावधी बॅज"}
              value={form.eventDuration}
              onChange={(e) => setForm({ ...form, eventDuration: e.target.value })}
              placeholder="e.g. 1 day event / 10-day event"
            />
            <FestiveInput
              label={isEn ? "Festival / Event Name" : "उत्सव / सण नाव"}
              value={form.festivalName}
              onChange={(e) => setForm({ ...form, festivalName: e.target.value })}
              placeholder="e.g. Ganesh Utsav - 16 Sep"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveInput
              label={isEn ? "Main Headline (English) *" : "मुख्य बातमी मथळा (इंग्रजी) *"}
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="e.g. Ganpati Festival Live"
              required
            />
            <FestiveInput
              label={isEn ? "Main Headline (Marathi)" : "मुख्य बातमी मथळा (मराठी)"}
              value={form.headlineMr}
              onChange={(e) => setForm({ ...form, headlineMr: e.target.value })}
              placeholder="उदा. गणपती उत्सव थेट (लाइव्ह)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveInput
              label={isEn ? "Subtitle / Summary (English)" : "उपशीर्षक / सारांश (इंग्रजी)"}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="e.g. All 5 wings are participated"
            />
            <FestiveInput
              label={isEn ? "Subtitle / Summary (Marathi)" : "उपशीर्षक / सारांश (मराठी)"}
              value={form.subtitleMr}
              onChange={(e) => setForm({ ...form, subtitleMr: e.target.value })}
              placeholder="उदा. सर्व ५ इमारतींचा संयुक्त सहभाग"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FestiveInput
              label={isEn ? "Footer Notice / Safety Tip (English)" : "तळटीप / सुरक्षा सूचना (इंग्रजी)"}
              icon={ShieldCheck}
              value={form.safetyTip}
              onChange={(e) => setForm({ ...form, safetyTip: e.target.value })}
              placeholder="e.g. Please park vehicles only in designated spots."
            />
            <FestiveInput
              label={isEn ? "Footer Notice / Safety Tip (Marathi)" : "तळटीप / सुरक्षा सूचना (मराठी)"}
              icon={ShieldCheck}
              value={form.safetyTipMr}
              onChange={(e) => setForm({ ...form, safetyTipMr: e.target.value })}
              placeholder="उदा. कृपया वाहने नियुक्त पार्किंगमध्येच लावावीत."
            />
          </div>
        </div>

        {/* SECTION 6: Dynamic Days Management */}
        <div className="p-4 bg-[#FFFDF9] rounded-2xl border-2 border-gold-300 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black uppercase text-maroon-950 font-heading block">
                {isEn ? "6. Festival Day Management (Select Day to Edit)" : "६. उत्सव दिवस व्यवस्थापन (माहिती भरण्यासाठी दिवस निवडा)"}
              </span>
              <p className="text-[11px] text-stone-500">
                {isEn 
                  ? "Manage days, mark Today's Day, add information blocks per day, or add new days."
                  : "दिवस जोडा, बदला, 'आजचा दिवस' नियुक्त करा व प्रत्येक दिवसाचे माहिती ब्लॉक्स नियंत्रित करा."}
              </p>
            </div>

            <FestiveButton
              type="button"
              onClick={handleOpenAddDay}
              icon={Plus}
              variant="outline"
              size="sm"
            >
              {isEn ? "+ Add New Day" : "+ नवीन दिवस जोडा"}
            </FestiveButton>
          </div>

          {/* Day Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 border-b border-gold-200 no-scrollbar">
            {form.days.map((d, idx) => {
              const isSelected = idx === selectedDayIdx;
              const isToday = d.isCurrentDay;
              const dNum = d.dayNumber || (idx + 1);

              return (
                <div key={d.id || idx} className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition border flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-maroon-950 text-gold-300 border-gold-500 shadow-sm"
                        : "bg-amber-50/70 text-maroon-900 hover:bg-gold-100 border-gold-300"
                    }`}
                  >
                    <span>{isEn ? `Day ${dNum}` : `दिवस ${dNum}`}</span>
                    {isToday && (
                      <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-black">
                        {isEn ? "Today" : "आज"}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Controls for Selected Day */}
          <div className="bg-amber-50/50 p-3 rounded-xl border border-gold-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-maroon-950">
                {isEn ? `Day ${currentDay.dayNumber || selectedDayIdx + 1}` : `दिवस ${currentDay.dayNumber || selectedDayIdx + 1}`}:
              </span>
              <span className="text-stone-700 font-semibold">
                {currentDay.festivalDayLabel || currentDay.dateStr || "Ganesh Utsav"}
              </span>
              {currentDay.isCurrentDay ? (
                <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-white" />
                  <span>{isEn ? "Marked as Today's Day" : "आजचा दिवस (Today)"}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetAsToday(selectedDayIdx)}
                  className="px-2 py-0.5 rounded-lg bg-gold-400 hover:bg-gold-500 text-maroon-950 font-black text-[10px] transition cursor-pointer shadow-xs"
                >
                  {isEn ? "★ Set as Today" : "★ आजचा दिवस करा"}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleMoveDay(selectedDayIdx, -1)}
                disabled={selectedDayIdx === 0}
                className="p-1 rounded-lg border border-gold-300 hover:bg-gold-100 disabled:opacity-30 cursor-pointer"
                title="Move Left"
              >
                <ArrowUp className="w-3.5 h-3.5 -rotate-90 text-maroon-900" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDay(selectedDayIdx, 1)}
                disabled={selectedDayIdx === form.days.length - 1}
                className="p-1 rounded-lg border border-gold-300 hover:bg-gold-100 disabled:opacity-30 cursor-pointer"
                title="Move Right"
              >
                <ArrowDown className="w-3.5 h-3.5 -rotate-90 text-maroon-900" />
              </button>
              <button
                type="button"
                onClick={() => handleOpenEditDay(selectedDayIdx)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-gold-100 text-maroon-900 font-bold text-[11px] border border-gold-300 transition cursor-pointer"
              >
                {isEn ? "Edit Day Details" : "दिवसाचे तपशील बदला"}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDay(selectedDayIdx)}
                disabled={form.days.length <= 1}
                className="p-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-30 cursor-pointer"
                title="Delete Day"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 7: Information Blocks for Selected Day */}
        <div className="p-4 bg-[#FFFDF9] rounded-2xl border-2 border-gold-300 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gold-200">
            <div>
              <span className="text-xs font-black uppercase text-maroon-950 font-heading block">
                {isEn 
                  ? `7. Information Blocks for Day ${currentDay.dayNumber || selectedDayIdx + 1}` 
                  : `७. दिवस ${currentDay.dayNumber || selectedDayIdx + 1} चे माहिती ब्लॉक्स (${currentBlocks.length})`}
              </span>
              <p className="text-[11px] text-stone-500">
                {isEn 
                  ? "Add Aarti times, Host building, Prasad details, cultural events, parking, or custom notices."
                  : "महाआरती वेळ, यजमान इमारत, प्रसाद, सांस्कृतिक कार्यक्रम व महत्त्वाच्या सूचनांचे ब्लॉक्स जोडा."}
              </p>
            </div>

            <FestiveButton
              type="button"
              onClick={handleOpenAddBlock}
              icon={Plus}
              variant="primary"
              size="sm"
            >
              {isEn ? "+ Add Information Block" : "+ माहिती ब्लॉक जोडा"}
            </FestiveButton>
          </div>

          {/* Blocks List */}
          {currentBlocks.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gold-300 rounded-xl bg-amber-50/40">
              <Sparkles className="w-6 h-6 text-gold-500 mx-auto mb-1" />
              <p className="text-xs font-bold text-maroon-900">{isEn ? "No information blocks for this day" : "या दिवसासाठी अद्याप कोणतेही माहिती ब्लॉक नाहीत"}</p>
              <button
                type="button"
                onClick={handleOpenAddBlock}
                className="mt-2 text-xs text-amber-800 font-extrabold hover:underline"
              >
                {isEn ? "+ Add first information block" : "+ पहिला माहिती ब्लॉक जोडा"}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {currentBlocks.map((blk, bIdx) => {
                const meta = CATEGORY_OPTIONS.find(c => c.value === blk.category) || CATEGORY_OPTIONS[0];
                const IconComp = meta.icon;
                const isBlockActive = blk.isActive !== false;

                return (
                  <div
                    key={blk.id || bIdx}
                    className={`p-3 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isBlockActive 
                        ? "bg-white border-gold-300 shadow-xs" 
                        : "bg-stone-50 border-stone-300 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveBlock(bIdx, -1)}
                          disabled={bIdx === 0}
                          className="p-0.5 hover:bg-gold-100 rounded text-stone-500 disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveBlock(bIdx, 1)}
                          disabled={bIdx === currentBlocks.length - 1}
                          className="p-0.5 hover:bg-gold-100 rounded text-stone-500 disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Icon */}
                      <div className="p-2 rounded-xl bg-amber-50 border border-gold-300 text-maroon-900 flex-shrink-0">
                        <IconComp className={`w-4 h-4 ${meta.color}`} />
                      </div>

                      {/* Content Preview */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-xs text-maroon-950 truncate">
                            {blk.title || blk.titleMr}
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.2 rounded-full border border-amber-300">
                            {isEn ? meta.labelEn : meta.labelMr}
                          </span>
                          {blk.badge && (
                            <span className="text-[9px] font-black uppercase text-gold-700 bg-gold-100 px-1.5 py-0.2 rounded border border-gold-300">
                              {blk.badge}
                            </span>
                          )}
                          {blk.time && (
                            <span className="text-[10px] font-extrabold text-stone-700 bg-stone-100 px-2 py-0.2 rounded">
                              ⏰ {blk.time}
                            </span>
                          )}
                        </div>

                        {blk.subtitle && (
                          <p className="text-[11px] font-semibold text-stone-700 truncate">
                            {blk.subtitle}
                          </p>
                        )}
                        {blk.description && (
                          <p className="text-[11px] text-stone-500 line-clamp-1">
                            {blk.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions & Individual ON/OFF Switch */}
                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-stone-500 uppercase">
                          {isBlockActive ? (isEn ? "Status: ON" : "सुरू") : (isEn ? "Status: OFF" : "बंद")}
                        </span>
                        <FestiveToggle
                          checked={isBlockActive}
                          onChange={() => handleToggleBlockActive(bIdx)}
                          size="sm"
                        />
                      </div>

                      <div className="flex items-center gap-1 border-l border-stone-200 pl-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBlock(bIdx)}
                          className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-100 border border-gold-300 transition cursor-pointer"
                          title="Edit Block"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlock(bIdx)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-300 transition cursor-pointer"
                          title="Delete Block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 6: Live Website Preview Box */}
        <div className="p-4 bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-white rounded-2xl border-2 border-gold-400 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-gold-500/30 pb-2">
            <span className="text-[11px] uppercase font-black tracking-wider text-gold-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-festive-saffron" />
              <span>{isEn ? "Live Website Preview (Selected Style & Day):" : "वेबसाईटवर असे दिसेल (Live Website Preview):"}</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-200 border border-gold-400/40 uppercase">
              {form.displayStyle} style
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-maroon-950 bg-gold-400 px-2.5 py-0.5 rounded-full uppercase">
              {form.bulletinTitle}
            </span>
            <span className="text-xs text-gold-200 font-extrabold">
              {form.eventDuration} • {currentDay.festivalDayLabel || `Day ${currentDay.dayNumber || selectedDayIdx + 1}`}
            </span>
            {currentDay.isCurrentDay && (
              <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.2 rounded-full">
                {isEn ? "Today's Day" : "आजचा दिवस"}
              </span>
            )}
          </div>

          <div>
            <h4 className="text-sm sm:text-base font-black text-gold-100 font-heading">
              {form.headline}
            </h4>
            {form.subtitle && (
              <p className="text-xs text-gold-200/80 mt-0.5">{form.subtitle}</p>
            )}
          </div>

          {/* Render preview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gold-500/20 text-xs">
            {currentBlocks.filter(b => b.isActive !== false).slice(0, 4).map((blk, idx) => (
              <div key={idx} className="bg-maroon-900/70 p-2 rounded-lg border border-gold-500/30">
                <span className="font-extrabold text-gold-300 block text-[11px] uppercase">{blk.title}</span>
                {blk.time && <span className="text-white font-bold text-[10px]">⏰ {blk.time}</span>}
                {blk.subtitle && <p className="text-[10px] text-gold-100/90 truncate">{blk.subtitle}</p>}
              </div>
            ))}
          </div>

          <div className="text-[11px] text-emerald-300 flex items-center gap-1 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{form.safetyTip}</span>
          </div>
        </div>

      </form>

      {/* --------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT INFORMATION BLOCK */}
      {/* --------------------------------------------------------- */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] rounded-2xl border-2 border-gold-400 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 text-xs sm:text-sm">
            
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-maroon-950 to-maroon-900 text-white flex items-center justify-between border-b border-gold-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-festive-saffron" />
                <h3 className="font-bold text-sm sm:text-base text-gold-200 font-heading">
                  {editingBlockIndex !== null 
                    ? (isEn ? "Edit Information Block" : "माहिती ब्लॉक संपादित करा") 
                    : (isEn ? "Add New Information Block" : "नवीन माहिती ब्लॉक जोडा")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBlockModalOpen(false)}
                className="p-1 rounded-lg hover:bg-maroon-800 text-gold-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveBlockModal} className="p-4 space-y-4 overflow-y-auto flex-1">
              
              {/* Category */}
              <FestiveSelect
                label={isEn ? "Category / Type *" : "वर्ग / प्रकार *"}
                value={blockForm.category}
                onChange={(e) => {
                  const val = e.target.value;
                  const cat = CATEGORY_OPTIONS.find(c => c.value === val);
                  setBlockForm(prev => ({
                    ...prev,
                    category: val,
                    title: prev.title || (isEn ? cat?.labelEn : cat?.labelMr) || "",
                    titleMr: prev.titleMr || cat?.labelMr || ""
                  }));
                }}
                required
              >
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {isEn ? cat.labelEn : cat.labelMr}
                  </option>
                ))}
              </FestiveSelect>

              {/* Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FestiveInput
                  label={isEn ? "Block Title (English) *" : "ब्लॉक शीर्षक (इंग्रजी) *"}
                  value={blockForm.title}
                  onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })}
                  placeholder="e.g. DAILY MAHA AARTI"
                  required
                />
                <FestiveInput
                  label={isEn ? "Block Title (Marathi)" : "ब्लॉक शीर्षक (मराठी)"}
                  value={blockForm.titleMr}
                  onChange={(e) => setBlockForm({ ...blockForm, titleMr: e.target.value })}
                  placeholder="उदा. दैनिक महाआरती व विंग यजमान"
                />
              </div>

              {/* Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FestiveInput
                  label={isEn ? "Subtitle / Highlight" : "उपशीर्षक / मुख्य नोंद"}
                  value={blockForm.subtitle}
                  onChange={(e) => setBlockForm({ ...blockForm, subtitle: e.target.value })}
                  placeholder="e.g. All 5 Buildings Joint / Modak Prasad"
                />
                <FestiveInput
                  label={isEn ? "Subtitle (Marathi)" : "उपशीर्षक (मराठी)"}
                  value={blockForm.subtitleMr}
                  onChange={(e) => setBlockForm({ ...blockForm, subtitleMr: e.target.value })}
                  placeholder="उदा. सर्व ५ इमारती संयुक्त"
                />
              </div>

              {/* Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FestiveInput
                  label={isEn ? "Display Timing" : "वेळ (Timing)"}
                  icon={Clock}
                  value={blockForm.time}
                  onChange={(e) => setBlockForm({ ...blockForm, time: e.target.value })}
                  placeholder="e.g. 08:30 AM & 07:30 PM"
                />
                <FestiveInput
                  label={isEn ? "Optional Badge Tag" : "ऐच्छिक बॅज (उदा. Live, Special)"}
                  value={blockForm.badge}
                  onChange={(e) => setBlockForm({ ...blockForm, badge: e.target.value })}
                  placeholder="e.g. Special / Live"
                />
              </div>

              {/* Multi-Row Items Builder for Aarti or Multiple schedules */}
              {blockForm.category === "aarti" && (
                <div className="p-3 bg-amber-50/80 rounded-xl border border-gold-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-maroon-950">
                      {isEn ? "Aarti Timings Rows (Morning & Evening)" : "आरती वेळ व विधी (सकाळ व संध्याकाळ)"}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddAartiRow}
                      className="text-[11px] font-black text-amber-800 hover:underline cursor-pointer"
                    >
                      {isEn ? "+ Add Row" : "+ ओळ जोडा"}
                    </button>
                  </div>

                  {(blockForm.items || []).map((itm, itmIdx) => (
                    <div key={itm.id || itmIdx} className="bg-white p-2.5 rounded-lg border border-gold-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[11px] text-maroon-900">
                          {isEn ? `Aarti Row #${itmIdx + 1}` : `आरती ओळ #${itmIdx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAartiRow(itmIdx)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          title="Remove Row"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <FestiveInput
                          label={isEn ? "Label (e.g. Morning Aarti:)" : "नाव (उदा. सकाळची महाआरती:)"}
                          value={itm.label}
                          onChange={(e) => handleUpdateAartiRow(itmIdx, "label", e.target.value)}
                        />
                        <FestiveInput
                          label={isEn ? "Time (e.g. 08:30 AM)" : "वेळ (उदा. ०८:३० AM)"}
                          value={itm.time}
                          onChange={(e) => handleUpdateAartiRow(itmIdx, "time", e.target.value)}
                        />
                      </div>

                      <FestiveInput
                        label={isEn ? "Ritual / Details" : "विधी / माहिती"}
                        value={itm.desc}
                        onChange={(e) => handleUpdateAartiRow(itmIdx, "desc", e.target.value)}
                        placeholder="e.g. Murti Pranpratishtha Pooja & Maha Aarti"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Host coordinator */}
              {blockForm.category === "host" && (
                <FestiveInput
                  label={isEn ? "Host Coordinator / Lead Name" : "यजमान प्रमुख / कमिटी सदस्य"}
                  icon={UserCheck}
                  value={blockForm.hostCoordinator}
                  onChange={(e) => setBlockForm({ ...blockForm, hostCoordinator: e.target.value })}
                  placeholder="e.g. All Committee Members & Senior Residents"
                />
              )}

              {/* Description */}
              <FestiveTextarea
                label={isEn ? "Detailed Description / Notice Content" : "सविस्तर माहिती / सूचना तपशील"}
                rows={2}
                value={blockForm.description}
                onChange={(e) => setBlockForm({ ...blockForm, description: e.target.value })}
                placeholder="Enter detailed notice, instructions, or prasad info..."
              />

              {/* Order & Status */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gold-200">
                <FestiveInput
                  type="number"
                  label={isEn ? "Display Order (1, 2, 3...)" : "प्रदर्शन क्रम (Display Order)"}
                  value={blockForm.order}
                  onChange={(e) => setBlockForm({ ...blockForm, order: Number(e.target.value) || 1 })}
                />

                <div className="flex flex-col justify-center">
                  <label className="text-xs font-bold text-maroon-950 mb-1">
                    {isEn ? "Block Visibility" : "ब्लॉक दृश्यमानता"}
                  </label>
                  <FestiveToggle
                    checked={blockForm.isActive}
                    onChange={(val) => setBlockForm({ ...blockForm, isActive: val })}
                    activeText={isEn ? "Active (ON)" : "सुरू"}
                    inactiveText={isEn ? "Hidden (OFF)" : "बंद"}
                    size="sm"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gold-300">
                <FestiveButton
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsBlockModalOpen(false)}
                >
                  {isEn ? "Cancel" : "रद्द करा"}
                </FestiveButton>
                <FestiveButton
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Check}
                >
                  {isEn ? "Save Block" : "ब्लॉक जतन करा"}
                </FestiveButton>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT DAY */}
      {/* --------------------------------------------------------- */}
      {isDayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] rounded-2xl border-2 border-gold-400 shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 text-xs sm:text-sm">
            
            {/* Day Modal Header */}
            <div className="p-4 bg-gradient-to-r from-maroon-950 to-maroon-900 text-white flex items-center justify-between border-b border-gold-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-festive-saffron" />
                <h3 className="font-bold text-sm sm:text-base text-gold-200 font-heading">
                  {editingDayIndex !== null 
                    ? (isEn ? "Edit Day Details" : "दिवसाचे तपशील बदला") 
                    : (isEn ? "Add New Festival Day" : "नवीन उत्सव दिवस जोडा")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDayModalOpen(false)}
                className="p-1 rounded-lg hover:bg-maroon-800 text-gold-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Day Modal Body */}
            <form onSubmit={handleSaveDayModal} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FestiveInput
                  type="number"
                  label={isEn ? "Day Number *" : "दिवस क्रमांक *"}
                  value={dayForm.dayNumber}
                  onChange={(e) => setDayForm({ ...dayForm, dayNumber: Number(e.target.value) || 1 })}
                  required
                />
                <FestiveInput
                  label={isEn ? "Date (e.g. 16 Sep 2026)" : "तारीख (उदा. १६ सप्टेंबर २०२६)"}
                  value={dayForm.dateStr}
                  onChange={(e) => setDayForm({ ...dayForm, dateStr: e.target.value })}
                />
              </div>

              <FestiveInput
                label={isEn ? "Festival / Day Label" : "दिवस लेबल (उदा. Day 3 (Ganesh Utsav - 16 Sep))"}
                value={dayForm.festivalDayLabel}
                onChange={(e) => setDayForm({ ...dayForm, festivalDayLabel: e.target.value })}
                placeholder="e.g. Day 3 (Ganesh Utsav - 16 Sep)"
              />

              <div className="p-3 bg-amber-50 rounded-xl border border-gold-300 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs text-maroon-950 block">
                    {isEn ? "Mark as Today's Day" : "आजचा दिवस (Today) म्हणून चिन्हांकित करा"}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {isEn ? "Shows the live 'Today' badge on website" : "वेबसाईटवर 'आज' चा लाल दिवा दर्शवतो"}
                  </span>
                </div>
                <FestiveToggle
                  checked={dayForm.isCurrentDay}
                  onChange={(val) => setDayForm({ ...dayForm, isCurrentDay: val })}
                  size="sm"
                />
              </div>

              {/* Day Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gold-300">
                <FestiveButton
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsDayModalOpen(false)}
                >
                  {isEn ? "Cancel" : "रद्द करा"}
                </FestiveButton>
                <FestiveButton
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Check}
                >
                  {isEn ? "Save Day" : "दिवस जतन करा"}
                </FestiveButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </FestiveCard>
  );
};

export default NewsletterManager;
