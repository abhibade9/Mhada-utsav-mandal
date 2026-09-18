/**
 * WhatsApp Message Formatter for MHADA Towers Ganesh Utsav Mandal
 * Refined broadcast templates for:
 * 1. Daily Newsletter (दैनिक डिजिटल वृत्तपत्र)
 * 2. 10-day Aarti Schedule (१० दिवसांचे आरती वेळापत्रक व यजमान विंग्ज)
 * 3. Announcements (महत्त्वाच्या सूचना)
 * 4. Event Schedule (सांस्कृतिक व उत्सव कार्यक्रम वेळापत्रक)
 * 5. Society Rules (मंडळ व सोसायटी नियमावली)
 */

export const openWhatsApp = (messageText) => {
  if (!messageText) return;

  // Background instant copy to clipboard for convenience
  copyToClipboard(messageText).catch(() => {});

  const encoded = encodeURIComponent(messageText);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );

  // Fast direct target:
  // On desktop: web.whatsapp.com immediately opens WhatsApp Web composer without the slow intermediate landing page.
  // On mobile: api.whatsapp.com triggers native WhatsApp app intent directly.
  const targetUrl = isMobile
    ? `https://api.whatsapp.com/send?text=${encoded}`
    : `https://web.whatsapp.com/send?text=${encoded}`;

  try {
    const newWindow = window.open(targetUrl, "_blank", "noopener,noreferrer");
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      // Fallback if popup blocker intercepted
      const link = document.createElement("a");
      link.href = targetUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (err) {
    window.location.href = targetUrl;
  }
};

export const openWhatsAppDirect = (messageText, preferWeb = false) => {
  if (!messageText) return;
  copyToClipboard(messageText).catch(() => {});
  const encoded = encodeURIComponent(messageText);
  const targetUrl = preferWeb
    ? `https://web.whatsapp.com/send?text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;

  try {
    const win = window.open(targetUrl, "_blank", "noopener,noreferrer");
    if (!win || win.closed || typeof win.closed === "undefined") {
      const a = document.createElement("a");
      a.href = targetUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  } catch (e) {
    window.location.href = targetUrl;
  }
};

export const copyToClipboard = async (text) => {
  if (!text) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
    return true;
  } catch (err) {
    console.error("Clipboard copy error:", err);
    return false;
  }
};

const getMandalHeader = (config) => {
  const nameMr = config?.mandalNameMr || "म्हाडा टॉवर्स गणेशोत्सव मंडळ";
  const location = "पिंपरी वाघेरे, पुणे - ४११०१७";
  const year = config?.festivalYear || "२०२६";
  return `🚩 *${nameMr}* (${year})\n📍 *${location}*\n━━━━━━━━━━━━━━━━━━━━━━`;
};

const getMandalFooter = () => {
  return `━━━━━━━━━━━━━━━━━━━━━━\n🏢 *सहभागी ४ इमारती:* G (नंदादेवी) • H (निलगिरी) • J (पूर्वांचल) • K (गोवर्धन)\n🙏 *गणपती बाप्पा मोरया, मंगलमूर्ती मोरया!* 🌸`;
};

// 1. Daily Newsletter Broadcast Formatter (Fully dynamic with blocks and days)
export const formatNewsletterBroadcast = (newsletter, config, specificDay = null) => {
  const nl = newsletter || config?.newsletter || {};
  const daysList = (nl.days && Array.isArray(nl.days) && nl.days.length > 0)
    ? nl.days
    : (config?.dailyAartiSchedule || config?.tenDaysAartiSchedule || []);
  
  // Find current day from schedule or use passed specificDay
  const activeDay = specificDay || daysList.find((d) => d.isCurrentDay) || daysList[0] || {};

  const dayNum = activeDay.dayNumber ? `Day ${activeDay.dayNumber}` : "Today";
  const dateStr = activeDay.dateStr || activeDay.dateStrEn || nl.dateStr || "Today";
  const bulletinTitle = nl.bulletinTitle || "DAILY DIGITAL BULLETIN";
  const eventDuration = nl.eventDuration || "1 day event";
  const festivalLabel = activeDay.festivalDayLabel || activeDay.festivalName || nl.festivalName || `${dayNum}`;
  const headline = activeDay.headline || nl.headline || "Ganpati Festival Live";
  const subheadline = activeDay.subtitle || nl.subheadline || "All 5 wings are participated";
  const safetyTip = nl.safetyTip || "Please park vehicles only in designated spots.";

  let contentSections = "";

  if (Array.isArray(activeDay.blocks) && activeDay.blocks.length > 0) {
    const activeBlocks = activeDay.blocks
      .filter((b) => b.isActive !== false)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    const renderedBlocks = activeBlocks.map((blk) => {
      let icon = "📌";
      if (blk.category === "aarti") icon = "🪔";
      else if (blk.category === "host") icon = "🏛️";
      else if (blk.category === "prasad") icon = "🍬";
      else if (blk.category === "cultural" || blk.category === "event") icon = "🎭";
      else if (blk.category === "competition") icon = "🏆";
      else if (blk.category === "parking") icon = "🚗";
      else if (blk.category === "safety") icon = "🛡️";

      let blockText = `${icon} *${blk.title || "माहिती"}*`;
      if (blk.time) blockText += ` [${blk.time}]`;

      if (Array.isArray(blk.items) && blk.items.length > 0) {
        const itemLines = blk.items.map(it => `  • ${it.label || ""} ${it.time ? `*${it.time}*` : ""} ${it.desc ? `— ${it.desc}` : ""}`).join("\n");
        blockText += `\n${itemLines}`;
      } else {
        if (blk.subtitle) blockText += `\n  ${blk.subtitle}`;
        if (blk.description && blk.description !== blk.subtitle) blockText += `\n  ${blk.description}`;
        if (blk.hostCoordinator) blockText += `\n  👤 ${blk.hostCoordinator}`;
      }
      return blockText;
    });

    contentSections = renderedBlocks.join("\n\n");
  } else {
    // Fallback to legacy fields
    const hostWing = activeDay.hostWing || nl.todaysHostWing || "सर्व ४ विंग्ज (G, H, J, K)";
    const hostLead = activeDay.hostLead || nl.hostLead || "";
    const morningTime = activeDay.morningTime || "सकाळी ०८:३०";
    const morningRitual = activeDay.morningRitual || activeDay.ritual || "महापूजा";
    const eveningTime = activeDay.eveningTime || nl.eveningAartiTime || "रात्री ०८:००";
    const eveningRitual = activeDay.eveningRitual || activeDay.cultural || "महाआरती";
    const specialPrasad = activeDay.specialPrasad || nl.prasadSpecial || "";
    const cultural = activeDay.cultural || "";

    contentSections = [
      `🏛️ *आजचे विंग यजमान:* ${hostWing}${hostLead ? ` (प्रमुख: ${hostLead})` : ""}`,
      `🪔 *सकाळची महाआरती:* ${morningTime} (${morningRitual})`,
      `🪔 *संध्याकाळची महाआरती:* ${eveningTime} (${eveningRitual})`,
      specialPrasad ? `🍬 *विशेष महाप्रसाद:* ${specialPrasad}` : "",
      cultural ? `🎭 *सांस्कृतिक उपक्रम:* ${cultural}` : ""
    ].filter(Boolean).join("\n");
  }

  return (
`${getMandalHeader(config)}
📰 *${bulletinTitle}* [${eventDuration}]
🗓️ *${festivalLabel}* • ${dateStr}
━━━━━━━━━━━━━━━━━━━━━━

✨ *${headline}*
${subheadline ? `📝 ${subheadline}\n` : ""}
${contentSections}

🛡️ *सूचना:* ${safetyTip}

${getMandalFooter()}`
  ).trim();
};

// 2. 10-Day Aarti Schedule Broadcast Formatter (Complete)
export const formatAartiScheduleBroadcast = (scheduleList, config) => {
  const list = Array.isArray(scheduleList) && scheduleList.length > 0 
    ? scheduleList 
    : (config?.tenDaysAartiSchedule || []);

  const daysText = list.map((item, idx) => {
    const dayNum = item.dayNumber || (idx + 1);
    const date = item.dateStr || "";
    const morning = item.morningTime || "०८:३० AM";
    const evening = item.eveningTime || "०८:०० PM";
    const host = item.hostWing || `विंग ${item.wingCode || ""}`;
    const lead = item.hostLead ? ` (प्रमुख: ${item.hostLead})` : "";
    const ritual = item.ritual || item.morningRitual || "";
    const cultural = item.cultural || item.eveningRitual || "";

    return (
`📅 *दिवस ${dayNum} (${date})*
  • 🏢 *यजमान:* ${host}${lead}
  • 🪔 *आरती वेळ:* सकाळी ${morning} | संध्याकाळी ${evening}` +
(ritual ? `\n  • 🌸 *विशेष विधी:* ${ritual}` : "") +
(cultural ? `\n  • 🎭 *सांस्कृतिक:* ${cultural}` : "")
    );
  }).join("\n\n");

  return (
`${getMandalHeader(config)}
🪔 *१० दिवसांचे संपूर्ण महाआरती व यजमान वेळापत्रक*
📍 *स्थळ:* मुख्य उत्सव मंडप, म्हाडा टॉवर्स संकुल
⏰ *नियमित वेळा:* सकाळ आरती ०८:३० AM | संध्या आरती ०८:०० PM
━━━━━━━━━━━━━━━━━━━━━━

${daysText || "वेळापत्रक लवकरच उपलब्ध होईल."}

${getMandalFooter()}`
  ).trim();
};

// 2b. Single Day Aarti Timing Broadcast
export const formatSingleAartiDay = (dayItem, config) => {
  if (!dayItem) return "";
  const dayNum = dayItem.dayNumber || "१";
  const date = dayItem.dateStr || "";
  const morning = dayItem.morningTime || "०८:३० AM";
  const evening = dayItem.eveningTime || "०८:०० PM";
  const host = dayItem.hostWing || "";
  const lead = dayItem.hostLead ? ` (${dayItem.hostLead})` : "";
  const ritual = dayItem.ritual || dayItem.morningRitual || "";
  const cultural = dayItem.cultural || dayItem.eveningRitual || "";
  const prasad = dayItem.specialPrasad || "";

  return (
`${getMandalHeader(config)}
🪔 *आजचे महाआरती वेळापत्रक - दिवस ${dayNum}*
📅 *तारीख:* ${date}
📍 *स्थळ:* मुख्य उत्सव मंडप, म्हाडा टॉवर्स संकुल
━━━━━━━━━━━━━━━━━━━━━━

⏰ *आरती वेळा:*
• सकाळची महाआरती: *${morning}*
• संध्याकाळची महाआरती: *${evening}*

🏢 *यजमान इमारत:* ${host}${lead}
${ritual ? `🌸 *धार्मिक विधी:* ${ritual}\n` : ""}${cultural ? `🎭 *सांस्कृतिक कार्यक्रम:* ${cultural}\n` : ""}${prasad ? `🍬 *महाप्रसाद:* ${prasad}\n` : ""}
सर्व इमारतींच्या (G, H, J, K) रहिवाशांनी सपरिवार उपस्थित राहून बाप्पांच्या आरतीचा लाभ घ्यावा.

${getMandalFooter()}`
  ).trim();
};

// 3. Announcements Broadcast Formatter (All active)
export const formatAnnouncementsBroadcast = (announcementsList, config) => {
  const list = Array.isArray(announcementsList) ? announcementsList.filter(a => a.isActive !== false) : [];

  const itemsText = list.map((a, idx) => {
    const priorityBadge = a.priority === "high" ? "🚨 [अत्यंत महत्त्वाचे]" : "📢";
    const wings = Array.isArray(a.targetWings) ? a.targetWings.join(", ") : "सर्व विंग्ज";
    return (
`${idx + 1}. ${priorityBadge} *${a.titleMr || a.titleEn}*
   🏢 विंग्ज: ${wings}
   📝 ${a.descriptionMr || a.descriptionEn || ""}`
    );
  }).join("\n\n");

  return (
`${getMandalHeader(config)}
📢 *मंडळाच्या महत्त्वाच्या सूचना व अपडेट्स*
━━━━━━━━━━━━━━━━━━━━━━

${itemsText || "सध्या कोणत्याही नवीन सूचना नाहीत."}

${getMandalFooter()}`
  ).trim();
};

// 3b. Single Announcement Broadcast
export const formatSingleAnnouncement = (ann, config) => {
  if (!ann) return "";
  const priorityBadge = ann.priority === "high" ? "🚨 *अत्यंत महत्त्वाची सूचना (URGENT)*" : "📢 *मंडळ सूचना*";
  const wings = Array.isArray(ann.targetWings) ? ann.targetWings.join(", ") : "सर्व विंग्ज (G, H, J, K)";

  return (
`${getMandalHeader(config)}
${priorityBadge}
📌 *विषय:* ${ann.titleMr || ann.titleEn}
🏢 *लक्षित इमारती:* ${wings}
━━━━━━━━━━━━━━━━━━━━━━

📝 *तपशील:*
${ann.descriptionMr || ann.descriptionEn || ""}

कृपया सर्व रहिवाशांनी नोंद घ्यावी व सहकार्य करावे.

${getMandalFooter()}`
  ).trim();
};

// 4. Festival Event Schedule Broadcast Formatter (All events)
export const formatEventsScheduleBroadcast = (eventsList, config) => {
  const list = Array.isArray(eventsList) ? eventsList : [];

  const itemsText = list.map((ev, idx) => {
    return (
`🎭 *${idx + 1}. ${ev.titleMr || ev.titleEn}*
  • 📅 *तारीख/वेळ:* ${ev.dateStr || ""} | ${ev.time || ""}
  • 📍 *स्थळ:* ${ev.venue || "मुख्य मंडप"}
  • 🏢 *यजमान/आयोजक:* ${ev.hostWing || "सर्व विंग्ज"}` +
(ev.descriptionMr ? `\n  • 📝 *माहिती:* ${ev.descriptionMr}` : "")
    );
  }).join("\n\n");

  return (
`${getMandalHeader(config)}
🎉 *गणेशोत्सव सांस्कृतिक व क्रीडा स्पर्धा कार्यक्रम वेळापत्रक*
📍 *स्थळ:* मुख्य उत्सव मंडप व सांस्कृतिक मंच, म्हाडा टॉवर्स
━━━━━━━━━━━━━━━━━━━━━━

${itemsText || "कार्यक्रम वेळापत्रक लवकरच जाहीर केले जाईल."}

सर्व रहिवाशांनी, महिला व बालमित्रांनी उत्स्फूर्त सहभाग घ्यावा!
${getMandalFooter()}`
  ).trim();
};

// 4b. Single Event Broadcast
export const formatSingleEvent = (ev, config) => {
  if (!ev) return "";
  return (
`${getMandalHeader(config)}
🎉 *विशेष कार्यक्रम निमंत्रण*
📌 *${ev.titleMr || ev.titleEn}*
━━━━━━━━━━━━━━━━━━━━━━

📅 *तारीख:* ${ev.dateStr || ""}
⏰ *वेळ:* ${ev.time || ""}
📍 *स्थळ:* ${ev.venue || "मुख्य उत्सव मंडप"}
🏢 *आयोजक/यजमान:* ${ev.hostWing || "सर्व विंग्ज (G, H, J, K)"}

${ev.descriptionMr ? `📝 *तपशील:*\n${ev.descriptionMr}\n` : ""}
सर्व इमारतींच्या रहिवाशांनी उपस्थित राहावे!

${getMandalFooter()}`
  ).trim();
};

// 5. Society Rules Broadcast Formatter
export const formatSocietyRulesBroadcast = (rulesList, config) => {
  const list = Array.isArray(rulesList) && rulesList.length > 0
    ? rulesList
    : (config?.rules || []);

  const rulesText = list.map((rule, idx) => {
    const title = rule.titleMr || rule.title || `नियम क्र. ${idx + 1}`;
    const desc = rule.descMr || rule.desc || "";
    return `${idx + 1}️⃣ *${title}:*\n   ${desc}`;
  }).join("\n\n");

  return (
`${getMandalHeader(config)}
📜 *म्हाडा टॉवर्स गणेशोत्सव - मंडळ व सोसायटी नियमावली*
━━━━━━━━━━━━━━━━━━━━━━
उत्सवादरम्यान सर्व ४ इमारतींमधील (G, H, J, K) रहिवाशांच्या सुरक्षिततेसाठी व शांततेसाठी खालील नियमांचे काटेकोर पालन करावे:

${rulesText || "सोसायटी नियमावली लवकरच उपलब्ध होईल."}

━━━━━━━━━━━━━━━━━━━━━━
आपल्या सहकार्याबद्दल धन्यवाद! नियम पाळा, उत्सव शांततेत साजरा करा!
- उत्सव व्यवस्थापन समिती, म्हाडा टॉवर्स
${getMandalFooter()}`
  ).trim();
};
