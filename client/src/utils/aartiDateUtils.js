/**
 * aartiDateUtils.js
 * Utility functions for Asia/Kolkata date-range calculations and countdown logic
 * for Daily Maha Aarti & Host Wings.
 */

// Helper to format any date into YYYY-MM-DD in Asia/Kolkata timezone
export const getKolkataDate = (date = new Date()) => {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    return formatter.format(date); // Always "YYYY-MM-DD"
  } catch (err) {
    // Fallback if Intl fails
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 330 * 60000);
    const y = ist.getFullYear();
    const m = String(ist.getMonth() + 1).padStart(2, "0");
    const d = String(ist.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
};

// Helper to get current HH:mm:ss in Asia/Kolkata timezone
export const getKolkataTime = (date = new Date()) => {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    return formatter.format(date); // "HH:mm:ss"
  } catch (err) {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 330 * 60000);
    return `${String(ist.getHours()).padStart(2, "0")}:${String(ist.getMinutes()).padStart(2, "0")}:${String(ist.getSeconds()).padStart(2, "0")}`;
  }
};

// Calculate difference in calendar days between two "YYYY-MM-DD" strings (d1 - d2)
export const diffInDays = (d1Str, d2Str) => {
  if (!d1Str || !d2Str) return 0;
  const [y1, m1, day1] = d1Str.split("-").map(Number);
  const [y2, m2, day2] = d2Str.split("-").map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, day1);
  const utc2 = Date.UTC(y2, m2 - 1, day2);
  return Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24));
};

// Add days to "YYYY-MM-DD" string and return new "YYYY-MM-DD"
export const addDaysToDateStr = (dateStr, days) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days));
  const newY = utc.getUTCFullYear();
  const newM = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const newD = String(utc.getUTCDate()).padStart(2, "0");
  return `${newY}-${newM}-${newD}`;
};

// Helper to parse 12h / 24h / Marathi time strings into standard 24h "HH:mm"
export const parseTimeTo24h = (str, defaultVal = "08:30") => {
  if (!str) return defaultVal;
  const trimmed = String(str).trim();
  const m24 = trimmed.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (m24) return `${m24[1].padStart(2, "0")}:${m24[2]}`;

  const isPM = /pm|रात्री|संध्या|सायं|दुपारी/i.test(trimmed);
  const isAM = /am|सकाळी|प्रभात/i.test(trimmed);

  const marathiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  let cleanStr = trimmed;
  marathiDigits.forEach((d, i) => {
    cleanStr = cleanStr.replaceAll(d, String(i));
  });

  const timeMatch = cleanStr.match(/(\d{1,2})[:.](\d{2})/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }
  return defaultVal;
};

// Convert 24h "HH:mm" to 12h display string e.g. "08:30 AM" or "07:30 PM"
export const format24hTo12h = (time24, lang = "en") => {
  if (!time24 || !time24.includes(":")) return time24 || "";
  const [h, m] = time24.split(":").map(Number);
  const isPM = h >= 12;
  const h12 = h % 12 || 12;
  const formattedEn = `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
  if (lang !== "mr") return formattedEn;
  const marathiPeriod = isPM ? (h >= 17 ? "रात्री" : "दुपारी") : (h < 12 ? "सकाळी" : "दुपारी");
  return `${marathiPeriod} ${formattedEn}`;
};

// Create a concrete timestamp for a given IST date string and 24h time string
export const createKolkataTimestamp = (dateStr, time24Str) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = time24Str.split(":").map(Number);
  // ISO-8601 with +05:30 offset
  const isoStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00+05:30`;
  return new Date(isoStr).getTime();
};

/**
 * Automatically calculate the current festival day number based on Start Date and End Date.
 * @param {string} startDate - "YYYY-MM-DD" e.g. "2026-09-07"
 * @param {string} endDate - "YYYY-MM-DD" e.g. "2026-09-16"
 * @param {string} currentDateStr - optional "YYYY-MM-DD" override, defaults to current Asia/Kolkata date
 * @returns {object} { status: "upcoming"|"active"|"concluded"|"invalid", currentDay: number|null, totalDays: number, daysUntil: number|null }
 */
export const calculateFestivalDay = (startDate, endDate, currentDateStr = null) => {
  if (!startDate || !endDate) {
    return { status: "invalid", currentDay: null, totalDays: 0, daysUntil: null };
  }

  const today = currentDateStr || getKolkataDate();
  const totalDays = diffInDays(endDate, startDate) + 1;

  if (totalDays <= 0) {
    return { status: "invalid", currentDay: null, totalDays: 0, daysUntil: null };
  }

  if (today < startDate) {
    const daysUntil = diffInDays(startDate, today);
    return {
      status: "upcoming",
      currentDay: null,
      totalDays,
      daysUntil
    };
  }

  if (today > endDate) {
    return {
      status: "concluded",
      currentDay: null,
      totalDays,
      daysUntil: null
    };
  }

  // Active period: Day 1 on startDate, up to Day totalDays on endDate (inclusive)
  const currentDay = diffInDays(today, startDate) + 1;
  return {
    status: "active",
    currentDay,
    totalDays,
    daysUntil: 0
  };
};

/**
 * Calculate the next applicable Aarti and countdown numbers.
 * Respects start date, end date, morning time, and evening time.
 */
export const calculateAartiCountdown = ({
  startDate = "2026-09-07",
  endDate = "2026-09-16",
  morningTime = "08:30 AM",
  eveningTime = "07:30 PM",
  morningTitleMr = "सकाळची महाआरती",
  morningTitleEn = "Morning Maha Aarti",
  eveningTitleMr = "संध्याकाळची महाआरती",
  eveningTitleEn = "Evening Maha Aarti",
  language = "en",
  nowDate = new Date()
}) => {
  const isMr = language === "mr";
  const todayStr = getKolkataDate(nowDate);
  const nowMs = nowDate.getTime();

  const m24 = parseTimeTo24h(morningTime, "08:30");
  const e24 = parseTimeTo24h(eveningTime, "19:30");

  const mDisplayTime = isMr ? format24hTo12h(m24, "mr") : format24hTo12h(m24, "en");
  const eDisplayTime = isMr ? format24hTo12h(e24, "mr") : format24hTo12h(e24, "en");

  // Check festival day status
  const dayInfo = calculateFestivalDay(startDate, endDate, todayStr);

  // Helper to format countdown numbers
  const buildCountdown = (diffMs, targetName, targetTime, isOngoing = false) => {
    const totalSec = Math.max(0, Math.floor(diffMs / 1000));
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    return {
      targetName,
      targetTime,
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
      isOngoing,
      allCompleted: false,
      festivalStatus: dayInfo.status,
      currentDay: dayInfo.currentDay,
      totalDays: dayInfo.totalDays
    };
  };

  // State A: BEFORE START DATE
  if (dayInfo.status === "upcoming") {
    // Countdown to Start Date's morning Aarti
    const startMorningMs = createKolkataTimestamp(startDate, m24);
    const diffMs = startMorningMs - nowMs;
    const targetName = isMr 
      ? `सकाळची महाआरती (आगामी • दिवस १)` 
      : `Morning Maha Aarti (Upcoming • Day 1)`;
    const targetTime = `${mDisplayTime}`;

    return {
      ...buildCountdown(diffMs, targetName, targetTime, false),
      isUpcoming: true
    };
  }

  // State B: AFTER END DATE
  if (dayInfo.status === "concluded") {
    return {
      targetName: isMr ? "सर्व आरत्या संपन्न" : "All Aartis Completed",
      targetTime: isMr ? "उत्सव सांगता" : "Festival Concluded",
      hours: "00",
      minutes: "00",
      seconds: "00",
      isOngoing: false,
      allCompleted: true,
      festivalStatus: "concluded",
      currentDay: null,
      totalDays: dayInfo.totalDays
    };
  }

  // State C: ACTIVE FESTIVAL PERIOD
  const morningStartMs = createKolkataTimestamp(todayStr, m24);
  const morningEndMs = morningStartMs + 45 * 60 * 1000; // 45 min aarti duration
  const eveningStartMs = createKolkataTimestamp(todayStr, e24);
  const eveningEndMs = eveningStartMs + 45 * 60 * 1000; // 45 min aarti duration

  // 1. Before Morning Aarti
  if (nowMs < morningStartMs) {
    const diffMs = morningStartMs - nowMs;
    const targetName = isMr ? morningTitleMr : morningTitleEn;
    return buildCountdown(diffMs, targetName, mDisplayTime, false);
  }

  // 2. During Morning Aarti (Live Now)
  if (nowMs >= morningStartMs && nowMs <= morningEndMs) {
    const targetName = isMr ? `${morningTitleMr} (सुरू आहे)` : `${morningTitleEn} (Live Now)`;
    return {
      targetName,
      targetTime: mDisplayTime,
      hours: "00",
      minutes: "00",
      seconds: "00",
      isOngoing: true,
      allCompleted: false,
      festivalStatus: "active",
      currentDay: dayInfo.currentDay,
      totalDays: dayInfo.totalDays
    };
  }

  // 3. After Morning Aarti, Before Evening Aarti
  if (nowMs > morningEndMs && nowMs < eveningStartMs) {
    const diffMs = eveningStartMs - nowMs;
    const targetName = isMr ? eveningTitleMr : eveningTitleEn;
    return buildCountdown(diffMs, targetName, eDisplayTime, false);
  }

  // 4. During Evening Aarti (Live Now)
  if (nowMs >= eveningStartMs && nowMs <= eveningEndMs) {
    const targetName = isMr ? `${eveningTitleMr} (सुरू आहे)` : `${eveningTitleEn} (Live Now)`;
    return {
      targetName,
      targetTime: eDisplayTime,
      hours: "00",
      minutes: "00",
      seconds: "00",
      isOngoing: true,
      allCompleted: false,
      festivalStatus: "active",
      currentDay: dayInfo.currentDay,
      totalDays: dayInfo.totalDays
    };
  }

  // 5. After Evening Aarti
  if (nowMs > eveningEndMs) {
    // If today is NOT the final day, countdown to tomorrow's Morning Maha Aarti
    if (todayStr < endDate) {
      const tomorrowStr = addDaysToDateStr(todayStr, 1);
      const tomorrowMorningMs = createKolkataTimestamp(tomorrowStr, m24);
      const diffMs = tomorrowMorningMs - nowMs;
      const nextDayNum = (dayInfo.currentDay || 1) + 1;
      const targetName = isMr 
        ? `सकाळची महाआरती (दिवस ${nextDayNum})` 
        : `Morning Maha Aarti (Day ${nextDayNum})`;
      return buildCountdown(diffMs, targetName, mDisplayTime, false);
    }

    // Today IS the final festival day and evening Aarti has concluded
    return {
      targetName: isMr ? "सर्व आरत्या संपन्न" : "All Aartis Completed",
      targetTime: isMr ? "उत्सव सांगता" : "Festival Concluded",
      hours: "00",
      minutes: "00",
      seconds: "00",
      isOngoing: false,
      allCompleted: true,
      festivalStatus: "concluded",
      currentDay: dayInfo.currentDay,
      totalDays: dayInfo.totalDays
    };
  }

  // Fallback safe return
  return {
    targetName: isMr ? eveningTitleMr : eveningTitleEn,
    targetTime: eDisplayTime,
    hours: "00",
    minutes: "00",
    seconds: "00",
    isOngoing: false,
    allCompleted: false,
    festivalStatus: dayInfo.status,
    currentDay: dayInfo.currentDay,
    totalDays: dayInfo.totalDays
  };
};

// Convert western digits to Marathi numerals
export const toMarathiNumeral = (num) => {
  const marathiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(num).split("").map((c) => marathiDigits[Number(c)] !== undefined ? marathiDigits[Number(c)] : c).join("");
};

// Helper to format "YYYY-MM-DD" string into readable English or Marathi date
export const formatKolkataDateString = (dateStr, lang = "en", includeYear = false) => {
  if (!dateStr || typeof dateStr !== "string" || !dateStr.includes("-")) return dateStr || "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthsMr = ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"];
  const monthIdx = (m >= 1 && m <= 12) ? m - 1 : 0;

  if (lang === "mr") {
    const dMr = toMarathiNumeral(String(d).padStart(2, "0"));
    const mMr = monthsMr[monthIdx];
    const yMr = toMarathiNumeral(y);
    return includeYear ? `${dMr} ${mMr} ${yMr}` : `${dMr} ${mMr}`;
  }

  const dEn = String(d).padStart(2, "0");
  const mEn = monthsEn[monthIdx];
  return includeYear ? `${dEn} ${mEn} ${y}` : `${dEn} ${mEn}`;
};
