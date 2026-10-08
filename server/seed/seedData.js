import TabConfig from "../models/TabConfig.js";
import Announcement from "../models/Announcement.js";
import FestivalEvent from "../models/FestivalEvent.js";
import Contact from "../models/Contact.js";
import User from "../models/User.js";

import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "../data/local_db.json");

const getLocalDbBackup = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    }
  } catch (e) {
    console.warn("[Seed] Warning reading local_db.json:", e.message);
  }
  return null;
};

export const seedInitialData = async () => {
  try {
    const localBackup = getLocalDbBackup();
    // 1. Check if Admin User exists
    const initialEmail = (process.env.ADMIN_INITIAL_EMAIL || "mhadatowersutsavmandal@gmail.com").toLowerCase().trim();
    const initialPass = process.env.ADMIN_INITIAL_PASSWORD || "mhada@hig";
    const initialName = process.env.ADMIN_INITIAL_NAME || "म्हाडा उत्सव समिती अध्यक्ष (Admin)";
    const initialUsername = process.env.ADMIN_INITIAL_USERNAME || "admin";

    let existingAdmin = await User.findOne({ role: "admin" });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(initialPass, 10);
      const admin = new User({
        username: initialUsername,
        email: initialEmail,
        passwordHash,
        name: initialName,
        role: "admin",
        isActive: true,
        failedLoginAttempts: 0,
        lockUntil: null,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
        passwordChangedAt: null
      });
      await admin.save();
      console.log("[Seed] Initial admin user account created successfully.");
    } else {
      // Ensure essential fields exist without overwriting password
      let needsSave = false;
      if (existingAdmin.isActive === undefined) {
        existingAdmin.isActive = true;
        needsSave = true;
      }
      if (!existingAdmin.passwordHash && existingAdmin.password) {
        existingAdmin.passwordHash = await bcrypt.hash(existingAdmin.password, 10);
        existingAdmin.password = undefined;
        needsSave = true;
      }
      if (needsSave) {
        await existingAdmin.save();
      }
      console.log("[Seed] Existing admin user verified.");
    }

    // Official 12 Committee Members
    const officialCommitteeMembers = [
      { roleMr: "अध्यक्षा", roleEn: "President", nameMr: "सौ. प्रियांका मयूर देशपांडे", nameEn: "Mrs. Priyanka Mayur Deshpande", wing: "जे – १५०३ (J-1503)", phone: "" },
      { roleMr: "उपाध्यक्षा", roleEn: "Vice President", nameMr: "सौ. हर्षानी निकुंभ", nameEn: "Mrs. Harshani Nikumbh", wing: "के – १००१ (K-1001)", phone: "" },
      { roleMr: "सचिव", roleEn: "Secretary", nameMr: "सौ. अर्चना सुधींद्र मठड", nameEn: "Mrs. Archana Sudhindra Mathad", wing: "जी – २२०४, जे – ५०३ (G-2204, J-503)", phone: "" },
      { roleMr: "खजिनदार", roleEn: "Treasurer", nameMr: "श्री. अनुराग माळी", nameEn: "Mr. Anurag Mali", wing: "के – १५०३ (K-1503)", phone: "" },
      { roleMr: "सदस्या", roleEn: "Committee Member", nameMr: "श्रीमती कल्पना अविनाश गाजरे", nameEn: "Mrs. Kalpana Avinash Gajare", wing: "के – १००२-१८०२ (K-1002-1802)", phone: "" },
      { roleMr: "सदस्या", roleEn: "Committee Member", nameMr: "सौ. शीतल प्रफुल साठे", nameEn: "Mrs. Sheetal Praful Sathe", wing: "जी – ११०४ (G-1104)", phone: "" },
      { roleMr: "सदस्या", roleEn: "Committee Member", nameMr: "सौ. कुंदा राजेंद्र सौंदणकर", nameEn: "Mrs. Kunda Rajendra Saundankar", wing: "एच – १०३ (H-103)", phone: "" },
      { roleMr: "सदस्य", roleEn: "Committee Member", nameMr: "श्री. सतीश बालकु फडके", nameEn: "Mr. Satish Balku Phadke", wing: "के – १५०१ (K-1501)", phone: "" },
      { roleMr: "सदस्या", roleEn: "Committee Member", nameMr: "सौ. आदिती साबू", nameEn: "Mrs. Aditi Sabu", wing: "जे – ११०२ (J-1102)", phone: "" },
      { roleMr: "सदस्य", roleEn: "Committee Member", nameMr: "श्री. तेजस माळी", nameEn: "Mr. Tejas Mali", wing: "जी – १००१ (G-1001)", phone: "" },
      { roleMr: "सदस्या", roleEn: "Committee Member", nameMr: "सौ. प्रतिमा प्रशांत कुलकर्णी", nameEn: "Mrs. Pratima Prashant Kulkarni", wing: "एच – १६०४ (H-1604)", phone: "" },
      { roleMr: "सदस्य", roleEn: "Committee Member", nameMr: "श्री. चेतनकुमार उत्तमराव सौंदाणे", nameEn: "Mr. Chetankumar Uttamrao Soundane", wing: "के – १०३ (K-103)", phone: "" }
    ];

    // 2. Seed TabConfig with all dynamic modules
    let existingConfig = await TabConfig.findOne();
    if (!existingConfig) {
      const config = new TabConfig();
      if (localBackup?.config?.gallery && Array.isArray(localBackup.config.gallery) && localBackup.config.gallery.length > 0) {
        config.gallery = localBackup.config.gallery;
      }
      if (localBackup?.config?.festivalScheduleCard) {
        config.festivalScheduleCard = localBackup.config.festivalScheduleCard;
      }
      config.mandalInfo.email = "mhadatowersutsavmandal@gmail.com";
      config.mandalInfo.committeeMembers = officialCommitteeMembers;
      await config.save();
      console.log("[Seed] TabConfig initialized with full dynamic modules and media.");
    } else {
      let needsSave = false;
      // Sync mandalInfo email and committeeMembers
      if (!existingConfig.mandalInfo) existingConfig.mandalInfo = {};
      if (existingConfig.mandalInfo.email !== "mhadatowersutsavmandal@gmail.com") {
        existingConfig.mandalInfo.email = "mhadatowersutsavmandal@gmail.com";
        needsSave = true;
      }
      existingConfig.mandalInfo.committeeMembers = officialCommitteeMembers;
      needsSave = true;

      // Ensure newsletter exists
      if (!existingConfig.newsletter || !existingConfig.newsletter.headline) {
        existingConfig.set("newsletter", undefined);
        needsSave = true;
      }
      // Ensure wings exist
      if (!existingConfig.wings || existingConfig.wings.length === 0) {
        existingConfig.set("wings", undefined);
        needsSave = true;
      }
      // Ensure rules exist
      if (!existingConfig.rules || existingConfig.rules.length === 0) {
        existingConfig.set("rules", undefined);
        needsSave = true;
      }

      // Ensure gallery exists and sync rich media from local_db.json if empty
      const localGallery = localBackup?.config?.gallery;
      const galleryNeedsMedia = !existingConfig.gallery || 
        existingConfig.gallery.length === 0 || 
        existingConfig.gallery.every(g => !g.bannerUrl && !g.imageUrl && (!g.photos || g.photos.length === 0));
      if (galleryNeedsMedia && localGallery && Array.isArray(localGallery) && localGallery.length > 0) {
        existingConfig.gallery = localGallery;
        needsSave = true;
      } else if (!existingConfig.gallery || existingConfig.gallery.length === 0) {
        existingConfig.set("gallery", undefined);
        needsSave = true;
      }

      // Ensure poll exists
      if (!existingConfig.poll || !existingConfig.poll.question) {
        existingConfig.set("poll", undefined);
        needsSave = true;
      }
      // Ensure volunteer exists
      if (!existingConfig.volunteerSeva || !existingConfig.volunteerSeva.title) {
        existingConfig.set("volunteerSeva", undefined);
        needsSave = true;
      }
      // Ensure 10-day schedule has full fields
      if (!existingConfig.dailyAartiSchedule || existingConfig.dailyAartiSchedule.length === 0 || !existingConfig.dailyAartiSchedule[0].tithi) {
        existingConfig.set("dailyAartiSchedule", undefined);
        needsSave = true;
      }

      // Ensure festival schedule card exists and sync image
      const localCard = localBackup?.config?.festivalScheduleCard;
      if (!existingConfig.festivalScheduleCard || !existingConfig.festivalScheduleCard.eventNameMr) {
        existingConfig.set("festivalScheduleCard", localCard || {
          eventNameMr: "श्री गणेशोत्सव २०२६ (१० दिवसीय भव्य उत्सव)",
          eventNameEn: "Shree Ganeshotsav 2026 (10-Day Grand Celebration)",
          eventDescriptionMr: "म्हाडा टॉवर्स संकुलातील सर्व ५ विंग्ज (G, H, I, J, K) संयुक्त विद्यमाने आयोजित १० दिवसीय अखंड गणेशोत्सव सोहळा.",
          eventDescriptionEn: "10-day grand festival celebration organized jointly by all 5 buildings (Wings G, H, I, J, K) of MHADA Towers.",
          plannerMr: "म्हाडा टॉवर्स उत्सव मंडळ व मध्यवर्ती सोसायटी समिती",
          plannerEn: "MHADA Towers Utsav Mandal & Central Society Committee",
          plannerDetailsMr: "सर्व ५ इमारतींचे विंग प्रमुख व स्वयंसेवक दल (विंग G, H, I, J, K)",
          plannerDetailsEn: "All 5 Building Wing Leads & Volunteer Squad (Wings G, H, I, J, K)",
          imageUrl: localCard?.imageUrl || "/uploads/WhatsApp_Image_2026-09-15_at_22_28_01-1789491506299-483063137.jpeg",
          imageCaptionMr: "उत्सव वेळापत्रक व संपूर्ण कार्यक्रम रूपरेषा",
          imageCaptionEn: "Festival Schedule & Complete Event Blueprint"
        });
        needsSave = true;
      }

      if (needsSave) {
        await existingConfig.save();
        console.log("[Seed] TabConfig updated with complete dynamic sections and media.");
      }
    }

    // 3. Seed Festival & Yearly Events if empty
    const festivalCount = await FestivalEvent.countDocuments({ eventType: "festival" });
    const yearlyCount = await FestivalEvent.countDocuments({ eventType: "yearly" });

    if (festivalCount === 0) {
      const festivalEvents = [
        {
          category: "arrival",
          categoryEn: "Arrival",
          eventType: "festival",
          titleMr: "श्री गणरायाचे वाजतगाजत आगमन व प्राणप्रतिष्ठा",
          titleEn: "Grand Ganpati Bappa Arrival & Murti Sthapana",
          time: "सकाळी ९:३० वाजता",
          dateStr: "दिवस १ (गणेश चतुर्थी - ७ सप्टेंबर)",
          dateStrEn: "Day 1 (Ganesh Chaturthi - 7 Sep)",
          dayNumber: 1,
          venue: "म्हाडा टॉवर्स मुख्य प्रवेशद्वार ते मध्यवर्ती मंडप",
          venueEn: "Main Entrance to Central Pandal",
          hostWing: "सर्व ५ विंग्ज (G, H, I, J, K)",
          hostWingEn: "All 5 Wings (G, H, I, J, K)",
          descriptionMr: "ढोल-ताशांच्या गजरात व लेझीम पथकासह बाप्पांचे आगमन. मुख्य प्रवेशद्वारावर सुवासिनींकडून औक्षण व त्यानंतर विधिवत प्राणप्रतिष्ठा पूजा.",
          descriptionEn: "Arrival procession with traditional Dhol-Tasha and Pranpratishtha pooja at the central festive pandal.",
          isHighlight: true,
          status: "completed",
          order: 1
        },
        {
          category: "aarti",
          categoryEn: "Aarti",
          eventType: "festival",
          titleMr: "दैनिक सकाळची मंगल आरती व प्रार्थना",
          titleEn: "Daily Morning Aarti & Morning Prayers",
          time: "सकाळी ०८:३० वाजता",
          dateStr: "दररोज (Daily Schedule)",
          dateStrEn: "Daily Schedule",
          dayNumber: 1,
          venue: "मध्यवर्ती उत्सव मंडप, म्हाडा टॉवर्स",
          venueEn: "Central Festive Pandal",
          hostWing: "G & H Wing यजमान",
          hostWingEn: "G & H Wing Hosts",
          descriptionMr: "सर्व ४ विंग्समधील रहिवाशांनी सपरिवार आरतीसाठी उपस्थित राहावे. आरतीनंतर मोदक व पेढ्यांचा नैवेद्य वाटप होईल.",
          descriptionEn: "Daily morning aarti followed by prasad distribution for all building residents.",
          isHighlight: true,
          status: "upcoming",
          order: 2
        },
        {
          category: "aarti",
          categoryEn: "Aarti",
          eventType: "festival",
          titleMr: "दैनिक संध्याकाळची महाआरती व धूप आरती",
          titleEn: "Grand Evening Maha Aarti & Bhajan",
          time: "रात्री ०८:०० वाजता",
          dateStr: "दररोज (Daily Schedule)",
          dateStrEn: "Daily Schedule",
          dayNumber: 1,
          venue: "मध्यवर्ती उत्सव मंडप",
          venueEn: "Central Festive Pandal",
          hostWing: "J & K Wing यजमान",
          hostWingEn: "J & K Wing Hosts",
          descriptionMr: "संध्याकाळची भव्य महाआरती, मंत्रपुष्पांजली व महिला मंडळाचे भक्तिगीते व भजन गायन. सर्वांना उपस्थित राहण्याचे आवाहन.",
          descriptionEn: "Grand evening aarti with holy chants, devotional songs, and deepotsav.",
          isHighlight: true,
          status: "upcoming",
          order: 3
        },
        {
          category: "सांस्कृतिक",
          categoryEn: "Cultural",
          eventType: "festival",
          titleMr: "बाल गोपाळ चित्रकला व वक्तृत्व स्पर्धा",
          titleEn: "Children's Drawing & Elocution Competition",
          time: "सायंकाळी ५:०० ते ७:००",
          dateStr: "दिवस २ (८ सप्टेंबर २०२६)",
          dateStrEn: "Day 2 (8 September 2026)",
          dayNumber: 2,
          venue: "क्लब हाऊस / उत्सव मंडप",
          venueEn: "Club House / Pandal",
          hostWing: "सर्व ४ इमारती (वय वर्षे ५ ते १५)",
          hostWingEn: "All 4 Buildings (Age 5-15)",
          descriptionMr: "विषय: 'माझा लाडका बाप्पा' व 'पर्यावरणपूरक गणेशोत्सव'. सर्व सहभागी मुलांना आकर्षक भेटवस्तू व विजेत्यांना सन्मानचिन्ह दिले जाईल.",
          descriptionEn: "Themes: 'My Beloved Bappa' & 'Eco-Friendly Ganesh Utsav'. Participation gifts for all, trophies for winners.",
          isHighlight: false,
          status: "upcoming",
          order: 4
        },
        {
          category: "महिला विशेष",
          categoryEn: "Women Special",
          eventType: "festival",
          titleMr: "महिला मंडळाचा पारंपरिक हळदी-कुंकू व खेळ",
          titleEn: "Women's Wing Haldi-Kunku & Traditional Games",
          time: "सायंकाळी ५:३० वाजता",
          dateStr: "दिवस ४ (१० सप्टेंबर २०२६)",
          dateStrEn: "Day 4 (10 September 2026)",
          dayNumber: 4,
          venue: "मध्यवर्ती उत्सव मंडप, म्हाडा टॉवर्स",
          venueEn: "Central Festive Pandal",
          hostWing: "सर्व ४ विंग्स महिला भगिनी",
          hostWingEn: "All 4 Wings Women Residents",
          descriptionMr: "पारंपरिक खेळ, संगीत खुर्ची, उखाणे स्पर्धा व वाण वाटप. सर्व ४ इमारतींच्या महिलांनी मोठ्या संख्येने उपस्थित राहावे.",
          descriptionEn: "Musical chairs, traditional games, and gift distribution for all resident families.",
          isHighlight: true,
          status: "upcoming",
          order: 5
        },
        {
          category: "भक्तिसंगीत",
          categoryEn: "Devotional",
          eventType: "festival",
          titleMr: "एकता भजन संध्या व टाळ-मृदुंग संकीर्तन",
          titleEn: "Unity Bhajan Sandhya & Taal-Mridang",
          time: "रात्री ८:३० वाजता",
          dateStr: "दिवस ६ (१२ सप्टेंबर २०२६)",
          dateStrEn: "Day 6 (12 September 2026)",
          dayNumber: 6,
          venue: "मुख्य बाप्पा मंडप",
          venueEn: "Main Pandal",
          hostWing: "H विंग - निलगिरी व स्थानिक भजनी मंडळ",
          hostWingEn: "H Wing - Nilgiri & Resident Bhajan Group",
          descriptionMr: "स्थानिक वारकरी व भजनी कलाकारांचे सुरेल अभंग, गवळणी व भारुडे. सर्वांसाठी भक्तिमय मेजवानी.",
          descriptionEn: "Soulful Marathi abhangs and devotional singing by resident artists.",
          isHighlight: false,
          status: "upcoming",
          order: 6
        },
        {
          category: "सत्कार सोहळा",
          categoryEn: "Felicitation",
          eventType: "festival",
          titleMr: "गुणवंत विद्यार्थी सत्कार व बक्षीस वितरण",
          titleEn: "Meritorious Students Felicitation & Prizes",
          time: "रात्री ८:३० वाजता",
          dateStr: "दिवस ९ (१५ सप्टेंबर २०२६)",
          dateStrEn: "Day 9 (15 September 2026)",
          dayNumber: 9,
          venue: "मुख्य उत्सव व्यासपीठ",
          venueEn: "Main Festive Stage",
          hostWing: "G, H, I, J, K विंग्ज समिती",
          hostWingEn: "G, H, I, J, K Wings Committee",
          descriptionMr: "१०वी, १२वी, पदवी व क्रीडा क्षेत्रात उल्लेखनीय यश मिळवलेल्या म्हाडा टॉवर्समधील विद्यार्थ्यांचा विशेष सन्मानचिन्ह देऊन गौरव.",
          descriptionEn: "Honoring 10th, 12th, degree and sports achievers from MHADA Towers with mementos.",
          isHighlight: true,
          status: "upcoming",
          order: 7
        },
        {
          category: "visarjan",
          categoryEn: "Visarjan",
          eventType: "festival",
          titleMr: "भावपूर्ण विसर्जन मिरवणूक व पर्यावरणपूरक निरोप",
          titleEn: "Emotional Visarjan Procession & Eco-Immersion",
          time: "दुपारी ०३:३० पासून मिरवणूक",
          dateStr: "अनंत चतुर्दशी (दिवस १० / १६ सप्टेंबर)",
          dateStrEn: "Day 10 (16 September 2026)",
          dayNumber: 10,
          venue: "परिसरात उभारण्यात आलेला कृत्रिम विसर्जन हौद",
          venueEn: "Dedicated Artificial Water Tank",
          hostWing: "समस्त म्हाडा टॉवर्स नागरिक",
          hostWingEn: "All MHADA Towers Residents",
          descriptionMr: "गुलाल व फुलांच्या वर्षावात टाळ-मृदुंगाच्या नादात लाडक्या बाप्पाला भावपूर्ण निरोप. पर्यावरण संवर्धनासाठी मंडळातर्फे १००% कृत्रिम हौदातच विसर्जन करण्यात येईल.",
          descriptionEn: "Grand farewell procession followed by 100% eco-friendly immersion in society's designated artificial water tank.",
          isHighlight: true,
          status: "upcoming",
          order: 8
        }
      ];

      // Merge image URLs from local backup if present
      if (localBackup?.events && Array.isArray(localBackup.events)) {
        for (const ev of festivalEvents) {
          const matchedBackup = localBackup.events.find(
            b => (b.order === ev.order && b.dayNumber === ev.dayNumber) || b.titleMr === ev.titleMr
          );
          if (matchedBackup?.imageUrl) {
            ev.imageUrl = matchedBackup.imageUrl;
          }
        }
      }

      await FestivalEvent.insertMany(festivalEvents);
      console.log("[Seed] Festival events initialized with images.");
    } else if (localBackup?.events && Array.isArray(localBackup.events)) {
      // If events already existed in Mongo, ensure their imageUrls are restored from local backup
      for (const b of localBackup.events) {
        if (b.imageUrl) {
          await FestivalEvent.updateMany(
            { 
              $or: [{ order: b.order, dayNumber: b.dayNumber }, { titleMr: b.titleMr }],
              $or: [{ imageUrl: "" }, { imageUrl: { $exists: false } }]
            },
            { $set: { imageUrl: b.imageUrl } }
          ).catch(() => {});
        }
      }
    }

    if (yearlyCount === 0) {
      const yearlyEvents = [
        {
          category: "ऐतिहासिक",
          categoryEn: "Historic",
          eventType: "yearly",
          titleMr: "शिवजयंती भव्य उत्सव व पोवाडा",
          titleEn: "Chhatrapati Shivaji Maharaj Jayanti",
          time: "संध्याकाळी ५:०० वाजता",
          dateStr: "१९ फेब्रुवारी (दरवर्षी)",
          dateStrEn: "19 February (Annually)",
          dayNumber: 1,
          venue: "म्हाडा टॉवर्स मुख्य प्रांगण",
          venueEn: "MHADA Towers Main Courtyard",
          hostWing: "सर्व ४ इमारती संयुक्त",
          hostWingEn: "All 4 Buildings Joint",
          descriptionMr: "छत्रपती शिवाजी महाराज यांच्या प्रतिमेची पालखी मिरवणूक, शिवकालीन व्याख्यान व शाहीर पोवाडा सादरीकरण.",
          descriptionEn: "Palkhi procession, inspiring historic lecture, and traditional Powada performance.",
          isHighlight: true,
          status: "upcoming",
          order: 1
        },
        {
          category: "सामाजिक सेवा",
          categoryEn: "Social Welfare",
          eventType: "yearly",
          titleMr: "रक्तदान व मोफत आरोग्य तपासणी शिबिर",
          titleEn: "Mega Blood Donation & Health Camp",
          time: "सकाळी ९:०० ते दुपारी २:००",
          dateStr: "१ मे - महाराष्ट्र दिन (दरवर्षी)",
          dateStrEn: "1 May - Maharashtra Day (Annually)",
          dayNumber: 1,
          venue: "सोसायटी क्लब हाऊस",
          venueEn: "Society Club House",
          hostWing: "सर्व ४ विंग्स रहिवासी",
          hostWingEn: "All 4 Wings Residents",
          descriptionMr: "पिंपरी चिंचवड रक्तपेढी व तज्ज्ञ डॉक्टरांच्या सहकार्याने भव्य रक्तदान व बीपी, शुगर, नेत्र तपासणी शिबिर.",
          descriptionEn: "Community blood drive and free health screening in association with PCMC Blood Bank.",
          isHighlight: true,
          status: "upcoming",
          order: 2
        },
        {
          category: "पर्यावरण",
          categoryEn: "Environment",
          eventType: "yearly",
          titleMr: "पर्यावरण दिन वृक्षारोपण व स्वच्छता मोहीम",
          titleEn: "Environment Day Tree Plantation & Cleanliness",
          time: "सकाळी ७:३० वाजता",
          dateStr: "५ जून (दरवर्षी)",
          dateStrEn: "5 June (Annually)",
          dayNumber: 1,
          venue: "म्हाडा टॉवर्स बाह्य परिसर व उद्यान",
          venueEn: "Society Garden & Perimeter",
          hostWing: "पर्यावरण मंच व युवा दल",
          hostWingEn: "Eco Club & Youth Wing",
          descriptionMr: "संकुलात ५० हून अधिक औषधी व सावली देणाऱ्या झाडांची लागवड व 'स्वच्छ म्हाडा टॉवर्स' परिसर स्वच्छता मोहीम.",
          descriptionEn: "Planting 50+ medicinal trees and comprehensive cleanliness drive across all buildings.",
          isHighlight: false,
          status: "upcoming",
          order: 3
        },
        {
          category: "स्नेहसंमेलन",
          categoryEn: "Festival Gathering",
          eventType: "yearly",
          titleMr: "दिवाळी स्नेहसंमेलन व किल्ले स्पर्धा",
          titleEn: "Diwali Snehasammelan & Fort Making",
          time: "संध्याकाळी ६:०० वाजता",
          dateStr: "दिवाळी पाडवा (दरवर्षी)",
          dateStrEn: "Diwali Padwa (Annually)",
          dayNumber: 1,
          venue: "मध्यवर्ती उद्यान प्रांगण",
          venueEn: "Central Garden Lawn",
          hostWing: "सर्व ४ विंग्ज परिवार",
          hostWingEn: "All 4 Wings Families",
          descriptionMr: "लहान मुलांची पारंपरिक किल्ले बनवण्याची स्पर्धा, दीपोत्सव आणि सर्व ४ विंग्जच्या रहिवाशांसाठी दिवाळी फराळ मेळावा.",
          descriptionEn: "Historical fort-making contest for kids, 1000-diya deepotsav, and community gathering.",
          isHighlight: true,
          status: "upcoming",
          order: 4
        }
      ];
      await FestivalEvent.insertMany(yearlyEvents);
      console.log("[Seed] Yearly events initialized.");
    }

    // 4. Seed Announcements if empty
    const announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0) {
      const announcements = [
        {
          titleMr: "दैनिक महाआरती वेळेबाबत सर्व रहिवाशांना नम्र विनंती",
          titleEn: "Gentle reminder regarding Daily Aarti Timings",
          descriptionMr: "सकाळची आरती ठीक ८:३० वा. व संध्याकाळची महाआरती ठीक ८:०० वा. सुरू होईल. सर्वांनी १० मिनिटे आधी मंडपात हजर राहावे.",
          descriptionEn: "Morning Aarti starts promptly at 8:30 AM and Evening Aarti at 8:00 PM. Kindly arrive 10 minutes earlier.",
          category: "aarti",
          priority: "high",
          isPinned: true,
          badgeText: "आरती वेळ (Aarti Alert)"
        },
        {
          titleMr: "मंडप परिसरातील शांतता व पार्किंग नियमावली",
          titleEn: "Society Parking & Noise Rules around Pandal",
          descriptionMr: "मुख्य मंडपाच्या समोरील रस्ता पादचाऱ्यांसाठी राखीव आहे. कृपया दोनचाकी व चारचाकी वाहने आपापल्या पार्किंग स्लॉटमध्येच लावावीत.",
          descriptionEn: "Please park all vehicles in designated resident slots. Emergency access path must remain clear at all times.",
          category: "general",
          priority: "normal",
          isPinned: false,
          badgeText: "पार्किंग सूचना (Rules)"
        },
        {
          titleMr: "फ्लॅट धारकांसाठी: उत्सव जमा-खर्च व देणगी तपशील",
          titleEn: "Owners Corner: Utsav Accounts & Mandal Meeting Updates",
          descriptionMr: "उत्सवासाठी जमा झालेली ऐच्छिक वर्गणी व मंडप खर्चाचा प्राथमिक हिशेब व्यवस्थापकीय सूचना फलकावर दररोज संध्याकाळी अद्ययावत केला जात आहे.",
          descriptionEn: "Voluntary collections and daily festival expense balance sheet is transparently reviewed by the committee.",
          category: "owners",
          priority: "normal",
          isPinned: false,
          badgeText: "सभासद कट्टा (Owners Info)"
        }
      ];
      await Announcement.insertMany(announcements);
      console.log("[Seed] Announcements initialized.");
    }

    // 5. Seed Contacts: Synchronize exclusively with the 12 official committee members
    await Contact.deleteMany({});
    const contacts = officialCommitteeMembers.map((m, idx) => ({
      nameMr: m.nameMr,
      nameEn: m.nameEn,
      roleMr: m.roleMr,
      roleEn: m.roleEn,
      wing: m.wing,
      phone: m.phone || "",
      type: "committee",
      order: idx + 1
    }));
    await Contact.insertMany(contacts);
    console.log("[Seed] Official 12 committee contacts synchronized successfully.");

  } catch (error) {
    console.error("[Seed] Error seeding data:", error.message);
  }
};
