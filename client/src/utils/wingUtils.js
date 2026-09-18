/**
 * wingUtils.js
 * Centralized utility helpers for MHADA Towers wings/buildings.
 * Ensures any added, edited, or removed wing dynamically updates across
 * all text strings, badges, cards, containers, footers, and modals.
 */

export const DEFAULT_WINGS = [
  { code: "G", nameMr: "G विंग - नंदादेवी", nameEn: "G Wing - Nandadevi", sacredNameMr: "नंदादेवी", sacredNameEn: "Nandadevi" },
  { code: "H", nameMr: "H विंग - निलगिरी", nameEn: "H Wing - Nilgiri", sacredNameMr: "निलगिरी", sacredNameEn: "Nilgiri" },
  { code: "J", nameMr: "J विंग - पूर्वांचल", nameEn: "J Wing - Purvanchal", sacredNameMr: "पूर्वांचल", sacredNameEn: "Purvanchal" },
  { code: "K", nameMr: "K विंग - गोवर्धन", nameEn: "K Wing - Govardhan", sacredNameMr: "गोवर्धन", sacredNameEn: "Govardhan" }
];

/**
 * Returns array of wing objects
 */
export const getWings = (config) => {
  if (config?.wings && Array.isArray(config.wings) && config.wings.length > 0) {
    return config.wings;
  }
  if (config?.participatingWings && Array.isArray(config.participatingWings) && config.participatingWings.length > 0) {
    return config.participatingWings.map(code => ({
      code,
      nameMr: `${code} विंग`,
      nameEn: `Wing ${code}`,
      sacredNameMr: "",
      sacredNameEn: ""
    }));
  }
  return DEFAULT_WINGS;
};

/**
 * Returns array of wing codes e.g. ['G', 'H', 'J', 'K']
 */
export const getWingCodes = (config) => {
  const wings = getWings(config);
  return wings.map(w => w.code || w);
};

/**
 * Returns total count of active wings (e.g. 4, 5, etc.)
 */
export const getWingsCount = (config) => {
  return getWings(config).length;
};

/**
 * Returns formatted wing codes text: "G • H • J • K"
 */
export const getWingCodesText = (config, separator = " • ") => {
  return getWingCodes(config).join(separator);
};

/**
 * Returns formatted wing names: "G-नंदादेवी, H-निलगिरी, J-पूर्वांचल, K-गोवर्धन"
 */
export const getWingNamesText = (config, language = "mr") => {
  const wings = getWings(config);
  return wings.map(w => {
    if (language === "mr") {
      if (w.sacredNameMr) return `${w.code}-${w.sacredNameMr}`;
      if (w.nameMr) return w.nameMr;
      return `${w.code} विंग`;
    } else {
      if (w.sacredNameEn) return `${w.code}-${w.sacredNameEn}`;
      if (w.nameEn) return w.nameEn;
      return `Wing ${w.code}`;
    }
  }).join(", ");
};

/**
 * Returns full bilingual label:
 * mr: "सर्व ४ इमारती (G • H • J • K)"
 * en: "All 4 Buildings (G • H • J • K)"
 */
export const getAllWingsLabel = (config, language = "mr") => {
  const count = getWingsCount(config);
  const codes = getWingCodesText(config, " • ");
  if (language === "mr") {
    return `सर्व ${count} इमारती (${codes})`;
  }
  return `All ${count} Buildings (${codes})`;
};

/**
 * Returns short family slogan:
 * mr: "४ विंग्स, एकच परिवार"
 * en: "4 Wings, One Family"
 */
export const getAllWingsShortLabel = (config, language = "mr") => {
  const count = getWingsCount(config);
  if (language === "mr") {
    return `${count} विंग्स, एकच परिवार`;
  }
  return `${count} Wings, One Family`;
};

/**
 * Generates dynamic Mahaprasad dining slots starting at 12:30 PM
 * evenly spaced for all configured wings.
 */
export const getMahaprasadSlots = (config, language = "mr") => {
  const wings = getWings(config);
  if (!wings.length) return [];

  let startMinutes = 12 * 60 + 30;
  const durationPerWing = 45;

  const formatSlotTime = (mins, lang) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h > 12 ? h - 12 : h;
    const padM = String(m).padStart(2, "0");
    const padH = String(displayH).padStart(2, "0");
    if (lang === "mr") {
      const mrPeriod = h >= 12 ? "दुपारी" : "सकाळी";
      return `${mrPeriod} ${padH}:${padM}`;
    }
    return `${padH}:${padM} ${period}`;
  };

  return wings.map((w, index) => {
    const slotStart = startMinutes + (index * durationPerWing);
    const slotEnd = slotStart + durationPerWing;
    const isLast = index === wings.length - 1;

    const wingLabel = language === "mr" 
      ? (isLast ? `${w.nameMr || `${w.code} विंग`} व उर्वरित अतिथी` : (w.nameMr || `${w.code} विंग`))
      : (isLast ? `${w.nameEn || `Wing ${w.code}`} & Guests` : (w.nameEn || `Wing ${w.code}`));

    const slotTimeStr = language === "mr"
      ? `${formatSlotTime(slotStart, "mr")} ते ${formatSlotTime(slotEnd, "mr")}`
      : `${formatSlotTime(slotStart, "en")} to ${formatSlotTime(slotEnd, "en")}`;

    return {
      wing: wingLabel,
      code: w.code,
      slot: slotTimeStr
    };
  });
};
