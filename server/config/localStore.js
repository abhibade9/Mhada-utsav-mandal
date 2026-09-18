import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "local_db.json");

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

const defaultInitialData = {
  users: [
    {
      _id: "admin_society_mhada",
      username: process.env.ADMIN_INITIAL_USERNAME || "admin",
      email: (process.env.ADMIN_INITIAL_EMAIL || "mhadatowersutsavmandal@gmail.com").toLowerCase().trim(),
      passwordHash: bcrypt.hashSync(process.env.ADMIN_INITIAL_PASSWORD || "mhada@hig", 10),
      name: process.env.ADMIN_INITIAL_NAME || "म्हाडा उत्सव समिती अध्यक्ष (Admin)",
      role: "admin",
      isActive: true,
      failedLoginAttempts: 0,
      lockUntil: null,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      passwordChangedAt: null,
      createdAt: new Date().toISOString()
    }
  ],
  config: {
    mandalNameMr: "म्हाडा टॉवर्स उत्सव मंडळ",
    mandalNameEn: "MHADA Towers Utsav Mandal",
    addressMr: "पिंपरी वाघेरे, पिंपरी चिंचवड, पुणे - ४११०१७",
    regNo: "१२४३/२०२५ - पुणे",
    festivalYear: "२०२६",
    festivalStatus: "उत्सव सुरू आहे (Festival Live)",
    marqueeText: "गणपती बाप्पा मोरया! दैनिक महाआरती सकाळी ८:३० व रात्री ८:०० वाजता | सर्व भाविकांनी आरतीला उपस्थित राहावे.",
    marqueeActive: true,
    scrollerMessages: [
      {
        id: "msg_1",
        text: "7:30 PM. Kindly arrive 10 minutes earlier.",
        textMr: "संध्या. ७:३० वाजता. कृपया १० मिनिटे आधी यावे.",
        textEn: "7:30 PM. Kindly arrive 10 minutes earlier.",
        isActive: true,
        order: 1
      },
      {
        id: "msg_2",
        text: "All 5 Buildings (G • H • J • K • I) • MHADA Towers",
        textMr: "सर्व ५ इमारती (G • H • J • K • I) • म्हाडा टॉवर्स",
        textEn: "All 5 Buildings (G • H • J • K • I) • MHADA Towers",
        isActive: true,
        order: 2
      },
      {
        id: "msg_3",
        text: "Daily Maha Aarti: 08:30 AM & 08:00 PM",
        textMr: "दैनिक महाआरती: सकाळी ८:३० व रात्री ८:०० वाजता",
        textEn: "Daily Maha Aarti: 08:30 AM & 08:00 PM",
        isActive: true,
        order: 3
      },
      {
        id: "msg_4",
        text: "Shree Ganeshotsav 2026 • Digital Information Center",
        textMr: "श्री गणेशोत्सव २०२६ • डिजिटल माहिती केंद्र",
        textEn: "Shree Ganeshotsav 2026 • Digital Information Center",
        isActive: true,
        order: 4
      }
    ],
    participatingWings: ["G", "H", "J", "K"],
    whatsAppCommunityLink: "https://chat.whatsapp.com/sample-mhada-ganpati-community",
    emergencyHelpline: "+91 98220 11223",
    email: "mhadatowersutsavmandal@gmail.com",
    tabs: {
      arrival: { enabled: true, approved: true, labelMr: "श्रींचे आगमन", labelEn: "Ganpati Arrival", order: 1 },
      aarti: { enabled: true, approved: true, labelMr: "दैनिक महाआरती", labelEn: "Aarti Timings", order: 2 },
      schedule: { enabled: true, approved: true, labelMr: "१० दिवसांचे वेळापत्रक", labelEn: "10-Day Schedule", order: 3 },
      cultural: { enabled: true, approved: true, labelMr: "आगामी कार्यक्रम", labelEn: "Upcoming Events", order: 4 },
      gallery: { enabled: true, approved: true, labelMr: "छायाचित्रे", labelEn: "Photo Gallery", order: 5 },
      prasad: { enabled: false, approved: false, labelMr: "महाप्रसाद", labelEn: "Maha Prasad", order: 6 },
      visarjan: { enabled: false, approved: false, labelMr: "विसर्जन सोहळा", labelEn: "Visarjan Timings", order: 7 },
      announcements: { enabled: true, approved: true, labelMr: "महत्वाच्या सूचना", labelEn: "Announcements", order: 8 },
      ownersNotice: { enabled: false, approved: false, labelMr: "वर्गणी व सभा अपडेट", labelEn: "Owners & Mandal Info", order: 9 },
      rules: { enabled: true, approved: true, labelMr: "मंडळ नियमावली", labelEn: "Society Rules", order: 10 },
      whatsapp: { enabled: true, approved: true, labelMr: "व्हॉट्सॲप कम्युनिटी", labelEn: "WhatsApp Group QR", order: 11 },
      contacts: { enabled: true, approved: true, labelMr: "संपर्क व मदत केंद्र", labelEn: "Emergency & Committee", order: 12 },
      newsletter: { enabled: true, approved: true, labelMr: "दैनिक वृत्तपत्र", labelEn: "Daily Bulletin", order: 13 },
      wings: { enabled: true, approved: true, labelMr: "इमारती (४ विंग्ज)", labelEn: "4 Buildings", order: 14 },
      polls: { enabled: true, approved: true, labelMr: "रहिवासी मतदान", labelEn: "Resident Polls", order: 15 },
      volunteer: { enabled: true, approved: true, labelMr: "सहभाग व सेवा", labelEn: "Volunteer Seva", order: 16 },
      mandalInfo: { enabled: true, approved: true, labelMr: "मंडळ माहिती व सुरक्षा", labelEn: "Mandal Info", order: 17 }
    },
    sidebarMenu: [
      { id: "dashboard", labelMr: "मुख्य पृष्ठ", labelEn: "Dashboard", badge: "", badgeType: "active", enabled: true, order: 1, targetSection: "top", icon: "LayoutDashboard" },
      { id: "liveUpdates", labelMr: "दैनिक वृत्तपत्र", labelEn: "Daily Bulletin", badge: "LIVE", badgeType: "pill-red", enabled: true, order: 2, targetSection: "marquee", icon: "Sparkles" },
      { id: "aartiSchedule", labelMr: "दैनिक महाआरती", labelEn: "Daily Maha Aarti", badge: "आरती", badgeType: "badge-gold", enabled: true, order: 3, targetSection: "aarti", icon: "Flame" },
      { id: "schedule", labelMr: "१० दिवसांचे वेळापत्रक", labelEn: "10-Day Schedule", badge: "१० दिवस", badgeType: "badge-gold", enabled: true, order: 4, targetSection: "schedule", icon: "Calendar" },
      { id: "upcoming", labelMr: "आगामी कार्यक्रम", labelEn: "Upcoming Events", badge: "नवीन", badgeType: "badge-gold", enabled: true, order: 5, targetSection: "upcoming", icon: "Calendar" },
      { id: "wings", labelMr: "इमारती (४ विंग्ज)", labelEn: "4 Buildings", badge: "", badgeType: "default", enabled: true, order: 6, targetSection: "wings", icon: "Building2" },
      { id: "polls", labelMr: "मतदान कट्टा", labelEn: "Resident Polls", badge: "", badgeType: "default", enabled: true, order: 7, targetSection: "polls", icon: "BarChart2" },
      { id: "volunteer", labelMr: "सहभाग व सेवा", labelEn: "Volunteer Seva", badge: "", badgeType: "default", enabled: true, order: 8, targetSection: "volunteer", icon: "Users" },
      { id: "gallery", labelMr: "छायाचित्रे", labelEn: "Photo Gallery", badge: "", badgeType: "default", enabled: true, order: 9, targetSection: "gallery", icon: "Image" },
      { id: "contacts", labelMr: "संपर्क व ईमेल", labelEn: "Helplines & Email", badge: "", badgeType: "default", enabled: true, order: 10, targetSection: "contacts", icon: "PhoneCall" },
      { id: "mandalInfo", labelMr: "मंडळ माहिती व सुरक्षा", labelEn: "Mandal Info & Security", badge: "", badgeType: "default", enabled: true, order: 11, targetSection: "mandal-info", icon: "Info" },
      { id: "adminLogin", labelMr: "व्यवस्थापक कक्ष", labelEn: "Admin Portal", badge: "", badgeType: "default", enabled: true, order: 12, targetSection: "admin-login", icon: "Shield" }
    ],
    sidebarSettings: {
      showFloatingTrigger: true,
      bottomCardTitle: "All 4 Buildings",
      bottomCardSubtitle: "Wings G, H, J, K",
      bottomCardTagline: "❤️ ४ विंग्स, एकच परिवार",
      bottomCardSubtag: "सहकार्य • शिस्त • अखंड भक्ती"
    },
    dailyAartiSection: {
      enabled: true,
      badgeMr: "दैनिक महाआरती व यजमान",
      badgeEn: "Daily Maha Aarti & Host Wings",
      titleMr: "दैनिक महाआरती व विंग यजमान",
      titleEn: "Daily Maha Aarti & Host Wings",
      subtitleMr: "दररोज सकाळी ०८:३० व रात्री ०८:०० वाजता मुख्य मंडपात महाआरती",
      subtitleEn: "Every day at 08:30 AM and 07:30 PM near G wing",
      countdownLabelMr: "पुढील महाआरतीसाठी शिल्लक वेळ",
      countdownLabelEn: "Time Remaining Until Next Aarti",
      startDate: "2026-09-07",
      endDate: "2026-09-16",
      morningTime: "सकाळी ०८:३० वाजता",
      morningTimeEn: "08:30 AM",
      eveningTime: "रात्री ०७:३० वाजता",
      eveningTimeEn: "07:30 PM"
    },
    dailyAartiSchedule: [
      {
        dayNumber: 1,
        dateStr: "दिवस १ (गणेश चतुर्थी - ७ सप्टेंबर)",
        dateStrEn: "Day 1 (Ganesh Chaturthi - 7 Sep)",
        tithi: "श्री गणेश चतुर्थी (मूर्ती प्राणप्रतिष्ठा)",
        tithiEn: "Ganesh Chaturthi (Pranpratishtha)",
        hostWing: "सर्व ४ इमारती संयुक्त (G • H • J • K WINGS)",
        hostWingEn: "All 4 Buildings Joint (G, H, J, K)",
        hostLead: "म्हाडा उत्सव मंडळ सर्व कमिटी सदस्य व ज्येष्ठ नागरिक",
        hostLeadEn: "All Committee Members & Senior Residents",
        morningTime: "सकाळी ०८:३० वाजता",
        morningTimeEn: "08:30 AM",
        eveningTime: "रात्री ०८:०० वाजता",
        eveningTimeEn: "08:00 PM",
        morningRitual: "श्रींची विधिवत प्राणप्रतिष्ठा पूजा व महाआरती",
        morningRitualEn: "Murti Pranpratishtha Pooja & Maha Aarti",
        eveningRitual: "धूप आरती, सामूहिक अथर्वशीर्ष पठण व महाआरती",
        eveningRitualEn: "Dhupaarti, Atharvashirsha & Maha Aarti",
        specialPrasad: "उकडीचे मोदक (२१ मोदक महाप्रसाद)",
        specialPrasadEn: "Steamed Ukadiche Modak",
        cultural: "दुपारी १२:०० ढोल-ताशा गजर व संध्याकाळी ६:०० लेझीम प्रात्यक्षिक",
        culturalEn: "12:00 PM Dhol-Tasha & 6:00 PM Lezim Demonstration",
        isCurrentDay: true
      }
    ],
    newsletter: {
      edition: "अंक १ (दिवस १ - श्री गणेश चतुर्थी)",
      dateStr: "७ सप्टेंबर २०२६",
      headline: "श्री गणरायाचे भव्य आगमन व प्राणप्रतिष्ठा सोहळा संपन्न!",
      subheadline: "म्हाडा टॉवर्सच्या चारही विंग्समध्ये मंगलमय व भक्तिमय वातावरण",
      bappaDarshanQuote: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
      darshanPhotoUrl: "",
      darshanPhotoCaption: "म्हाडा टॉवर्स २०२६ श्री गणरायाचे नयनरम्य प्रथम दर्शन",
      todaysHighlights: [
        "सकाळी ठीक ९:३० वाजता ढोल-ताशांच्या गजरात बाप्पांचे मुख्य प्रवेशद्वारावर आगमन.",
        "सर्व विंग्समधील सुवासिनींकडून औक्षण व विधिवत मंगल पूजा.",
        "दुपारी १२:०० वाजता मंत्रघोषात प्राणप्रतिष्ठा व पहिली महाआरती संपन्न."
      ],
      yesterdayHighlights: ["मंडप सजावट, विद्युत रोषणाई व स्वागत कमानीचे काम पूर्ण."],
      todaysHostWing: "सर्व ४ विंग्स संयुक्त (G, H, J, K)",
      hostLead: "म्हाडा उत्सव कमिटी पदाधिकारी",
      prasadSpecial: "पारंपरिक उकडीचे मोदक व पंचखाद्य",
      specialNote: "आरतीला येताना रहिवाशांनी शिस्तीचे पालन करावे."
    },
    wings: [
      { code: "G", nameMr: "G विंग - नंदादेवी", nameEn: "G Wing - Nandadevi", floors: 22, flats: 88, flatsPerFloor: 4 },
      { code: "H", nameMr: "H विंग - निलगिरी", nameEn: "H Wing - Nilgiri", floors: 22, flats: 88, flatsPerFloor: 4 },
      { code: "J", nameMr: "J विंग - कांचनगंगा", nameEn: "J Wing - Kanchanganga", floors: 22, flats: 88, flatsPerFloor: 4 },
      { code: "K", nameMr: "K विंग - धवलगिरी", nameEn: "K Wing - Dhavalgiri", floors: 22, flats: 88, flatsPerFloor: 4 }
    ],
    rules: [
      { id: "1", titleMr: "मंडप परिसरातील शांतता", descriptionMr: "रात्री १०:०० नंतर ध्वनिक्षेपकाचा आवाज पूर्णपणे बंद राहील.", category: "शिस्त" },
      { id: "2", titleMr: "स्वच्छता व कचरा व्यवस्थापन", descriptionMr: "प्रसादाचे द्रोण व कचरा केवळ कचराकुंडीतच टाकावा.", category: "स्वच्छता" },
      { id: "3", titleMr: "पार्किंग शिस्त", descriptionMr: "उत्सव मंडपाच्या मुख्य मार्गावर कोणतीही वाहने पार्क करू नयेत.", category: "पार्किंग" }
    ],
    gallery: [],
    poll: {
      active: true,
      question: "यंदाच्या गणेशोत्सवात आपल्याला कोणता सांस्कृतिक उपक्रम सर्वात जास्त आवडेल?",
      options: [
        { id: 1, text: "पारंपरिक भजन व नाट्यसंगीत संध्या", votes: 24 },
        { id: 2, text: "लहान मुलांच्या चित्रकला व वकृत्व स्पर्धा", votes: 18 },
        { id: 3, text: "महिला मंडळाचा पारंपरिक हळदी-कुंकू व खेळ", votes: 29 },
        { id: 4, text: "आरोग्य व रक्तदान तपासणी शिबिर", votes: 15 }
      ],
      totalVotes: 86
    },
    volunteerSeva: {
      active: true,
      title: "गणेशोत्सव स्वयंसेवक सेवा नोंदणी",
      description: "आपल्या लाडक्या बाप्पाच्या उत्सवात सेवा करण्याची सुवर्णसंधी.",
      roles: ["मंडप व्यवस्थापन", "प्रसाद वाटप", "आरती व्यवस्था", "रांग नियंत्रण", "सांस्कृतिक कार्यक्रम"]
    },
    mandalInfo: {
      historyMr: "म्हाडा टॉवर्स उत्सव मंडळाची स्थापना सर्व ४ इमारतींच्या रहिवाशांमध्ये एकात्मता व बंधुभाव निर्माण करण्यासाठी करण्यात आली आहे.",
      historyEn: "Established to foster brotherhood and unity among all four wings of MHADA Towers.",
      establishedYear: "२०२४",
      regDetails: "१२४३/२०२५ - पुणे",
      mottoMr: "४ विंग्स, एकच परिवार (सहकार्य • शिस्त • अखंड भक्ती)",
      officeAddressMr: "पिंपरी वाघेरे, पिंपरी चिंचवड, पुणे - ४११०१७",
      helpline: "+91 98220 11223",
      email: "mhadatowersutsavmandal@gmail.com",
      bankDetails: {
        accountName: "MHADA TOWERS GANESHOTSAV MANDAL",
        bankName: "State Bank of India",
        accountNo: "XXXXXXXXX1234",
        ifsc: "SBIN0001234",
        upiId: "mhadatowers@sbi"
      },
      pillars: [],
      committeeMembers: officialCommitteeMembers
    },
    festivalScheduleCard: {
      eventNameMr: "श्री गणेशोत्सव २०२६ (१० दिवसीय भव्य उत्सव)",
      eventNameEn: "Shree Ganeshotsav 2026 (10-Day Grand Celebration)",
      eventDescriptionMr: "म्हाडा टॉवर्स संकुलातील सर्व ४ विंग्ज (G, H, J, K) संयुक्त विद्यमाने आयोजित १० दिवसीय अखंड गणेशोत्सव सोहळा.",
      eventDescriptionEn: "10-day grand festival celebration organized jointly by all 4 buildings (Wings G, H, J, K) of MHADA Towers.",
      plannerMr: "म्हाडा टॉवर्स उत्सव मंडळ व मध्यवर्ती सोसायटी समिती",
      plannerEn: "MHADA Towers Utsav Mandal & Central Society Committee",
      plannerDetailsMr: "सर्व ४ इमारतींचे विंग प्रमुख व स्वयंसेवक दल (विंग G, H, J, K)",
      plannerDetailsEn: "All 4 Building Wing Leads & Volunteer Squad (Wings G, H, J, K)",
      imageUrl: "",
      imageCaptionMr: "उत्सव वेळापत्रक व संपूर्ण कार्यक्रम रूपरेषा",
      imageCaptionEn: "Festival Schedule & Complete Event Blueprint"
    }
  },
  announcements: [
    {
      _id: "ann_1",
      titleMr: "दैनिक महाआरती वेळेबाबत सर्व रहिवाशांना नम्र विनंती",
      titleEn: "Gentle reminder regarding Daily Aarti Timings",
      descriptionMr: "सकाळची आरती ठीक ८:३० वा. व संध्याकाळची महाआरती ठीक ८:०० वा. सुरू होईल. सर्वांनी १० मिनिटे आधी मंडपात हजर राहावे.",
      descriptionEn: "Morning Aarti starts promptly at 8:30 AM and Evening Aarti at 8:00 PM. Kindly arrive 10 minutes earlier.",
      category: "aarti",
      priority: "high",
      isPinned: true,
      badgeText: "आरती वेळ (Aarti Alert)",
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: "ann_2",
      titleMr: "मंडप परिसरातील शांतता व पार्किंग नियमावली",
      titleEn: "Society Parking & Noise Rules around Pandal",
      descriptionMr: "मुख्य मंडपाच्या समोरील रस्ता पादचाऱ्यांसाठी राखीव आहे. कृपया दोनचाकी व चारचाकी वाहने आपापल्या पार्किंग स्लॉटमध्येच लावावीत.",
      descriptionEn: "Please park all vehicles in designated resident slots. Emergency access path must remain clear at all times.",
      category: "general",
      priority: "normal",
      isPinned: false,
      badgeText: "पार्किंग सूचना (Rules)",
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: "ann_3",
      titleMr: "फ्लॅट धारकांसाठी: उत्सव जमा-खर्च व देणगी तपशील",
      titleEn: "Owners Corner: Utsav Accounts & Mandal Meeting Updates",
      descriptionMr: "उत्सवासाठी जमा झालेली ऐच्छिक वर्गणी व मंडप खर्चाचा प्राथमिक हिशेब व्यवस्थापकीय सूचना फलकावर दररोज संध्याकाळी अद्ययावत केला जात आहे.",
      descriptionEn: "Voluntary collections and daily festival expense balance sheet is transparently reviewed by the committee.",
      category: "owners",
      priority: "normal",
      isPinned: false,
      badgeText: "सभासद कट्टा (Owners Info)",
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  events: [
    {
      _id: "ev_1",
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
      hostWing: "सर्व ४ विंग्ज (G, H, J, K)",
      hostWingEn: "All 4 Wings (G, H, J, K)",
      descriptionMr: "ढोल-ताशांच्या गजरात व लेझीम पथकासह बाप्पांचे आगमन. मुख्य प्रवेशद्वारावर सुवासिनींकडून औक्षण व त्यानंतर विधिवत प्राणप्रतिष्ठा पूजा.",
      descriptionEn: "Arrival procession with traditional Dhol-Tasha and Pranpratishtha pooja at the central festive pandal.",
      isHighlight: true,
      status: "completed",
      order: 1,
      createdAt: new Date().toISOString()
    },
    {
      _id: "ev_2",
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
      order: 2,
      createdAt: new Date().toISOString()
    },
    {
      _id: "ev_3",
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
      order: 3,
      createdAt: new Date().toISOString()
    },
    {
      _id: "ev_4",
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
      order: 4,
      createdAt: new Date().toISOString()
    }
  ],
  contacts: officialCommitteeMembers.map((m, idx) => ({
    _id: `contact_${idx + 1}`,
    nameMr: m.nameMr,
    nameEn: m.nameEn,
    roleMr: m.roleMr,
    roleEn: m.roleEn,
    wing: m.wing,
    phone: m.phone || "",
    type: "committee",
    order: idx + 1,
    createdAt: new Date().toISOString()
  })),
  receipts: [],
  receiptSettings: {
    sachivSignatureUrl: "",
    receiptPrefix: "MT"
  },
  volunteers: []
};

class LocalStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        // Verify or initialize admin user without overwriting existing password
        if (!Array.isArray(this.data.users) || this.data.users.length === 0) {
          this.data.users = [defaultInitialData.users[0]];
          this.save();
        } else {
          const adminUser = this.data.users.find(u => u.role === "admin") || this.data.users[0];
          if (adminUser) {
            if (adminUser.isActive === undefined) adminUser.isActive = true;
            if (adminUser.failedLoginAttempts === undefined) adminUser.failedLoginAttempts = 0;
            if (adminUser.lockUntil === undefined) adminUser.lockUntil = null;
            if (adminUser.resetTokenHash === undefined) adminUser.resetTokenHash = null;
            if (adminUser.resetTokenExpiresAt === undefined) adminUser.resetTokenExpiresAt = null;
            if (adminUser.passwordChangedAt === undefined) adminUser.passwordChangedAt = null;
            if (!adminUser.username) adminUser.username = "admin";
            delete adminUser.password;
            this.save();
          }
        }
        if (!this.data.config.festivalScheduleCard) {
          this.data.config.festivalScheduleCard = defaultInitialData.config.festivalScheduleCard;
          this.save();
        }
        if (!Array.isArray(this.data.receipts)) {
          this.data.receipts = [];
          this.save();
        }
        if (!this.data.receiptSettings) {
          this.data.receiptSettings = {
            sachivSignatureUrl: "",
            receiptPrefix: "MT"
          };
          this.save();
        }
        if (!Array.isArray(this.data.volunteers)) {
          this.data.volunteers = [];
          this.save();
        }
        if (!Array.isArray(this.data.config?.sidebarMenu) || this.data.config.sidebarMenu.length === 0) {
          if (!this.data.config) this.data.config = {};
          this.data.config.sidebarMenu = defaultInitialData.config.sidebarMenu;
          this.save();
        }
        this.migrateGalleryIfNeeded();
        this.migrateScrollerIfNeeded();
        this.migrateNewsletterIfNeeded();
        this.migrateAartiSectionIfNeeded();
      } else {
        this.data = JSON.parse(JSON.stringify(defaultInitialData));
        this.save();
      }
    } catch (err) {
      console.error("[LocalStore] Error initializing local storage:", err.message);
      this.data = JSON.parse(JSON.stringify(defaultInitialData));
    }
  }

  migrateNewsletterIfNeeded() {
    if (!this.data?.config) return;
    if (!this.data.config.newsletter) {
      this.data.config.newsletter = {};
    }
    const nl = this.data.config.newsletter;
    let modified = false;

    if (nl.enabled === undefined) {
      nl.enabled = true;
      modified = true;
    }
    if (!nl.displayStyle) {
      nl.displayStyle = "classic";
      modified = true;
    }
    if (!nl.bulletinTitle) {
      nl.bulletinTitle = "DAILY DIGITAL BULLETIN";
      nl.bulletinTitleMr = "दैनिक डिजिटल वृत्तपत्र";
      modified = true;
    }
    if (!nl.eventDuration) {
      nl.eventDuration = "1 day event";
      nl.eventDurationMr = "१ दिवसीय सोहळा";
      modified = true;
    }
    if (!nl.festivalName) {
      nl.festivalName = "Ganesh Utsav - 16 Sep";
      nl.festivalNameMr = "गणेश उत्सव - १६ सप्टेंबर";
      modified = true;
    }
    if (!nl.headline) {
      nl.headline = "Ganpati Festival Live";
      nl.headlineMr = "गणपती उत्सव थेट (लाइव्ह)";
      modified = true;
    }
    if (!nl.subheadline) {
      nl.subheadline = "All 5 wings are participated";
      nl.subheadlineMr = "सर्व ५ इमारतींचा संयुक्त सहभाग";
      modified = true;
    }
    if (!nl.safetyTip) {
      nl.safetyTip = "Please park vehicles only in designated spots.";
      nl.safetyTipMr = "कृपया वाहने नियुक्त पार्किंगमध्येच लावावीत.";
      modified = true;
    }

    if (!Array.isArray(nl.days) || nl.days.length === 0) {
      console.log("[LocalStore] Initializing dynamic newsletter days & information blocks...");
      const defaultBlocks = [
        {
          id: "blk_1",
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
              id: "item_1",
              label: "Morning Maha Aarti:",
              labelMr: "सकाळची महाआरती:",
              time: "08:30 AM",
              timeMr: "सकाळी ०८:३०",
              desc: "Murti Pranpratishtha Pooja & Maha Aarti",
              descMr: "श्रींची विधिवत प्राणप्रतिष्ठा पूजा व महाआरती"
            },
            {
              id: "item_2",
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
          id: "blk_2",
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
          badge: "Host",
          priority: "normal",
          isActive: true,
          order: 2,
          items: []
        }
      ];

      nl.days = [
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
          blocks: defaultBlocks
        }
      ];
      modified = true;
    }

    if (modified) {
      this.save();
    }
  }

  migrateScrollerIfNeeded() {
    if (!this.data?.config) return;
    if (this.data.config.marqueeActive === undefined) {
      this.data.config.marqueeActive = true;
    }
    if (!this.data.config.scrollerMessages || !Array.isArray(this.data.config.scrollerMessages) || this.data.config.scrollerMessages.length === 0) {
      console.log("[LocalStore] Initializing default dynamic scroller messages...");
      this.data.config.scrollerMessages = [
        {
          id: "msg_1",
          text: "7:30 PM. Kindly arrive 10 minutes earlier.",
          textMr: "संध्या. ७:३० वाजता. कृपया १० मिनिटे आधी यावे.",
          textEn: "7:30 PM. Kindly arrive 10 minutes earlier.",
          isActive: true,
          order: 1
        },
        {
          id: "msg_2",
          text: "All 5 Buildings (G • H • J • K • I) • MHADA Towers",
          textMr: "सर्व ५ इमारती (G • H • J • K • I) • म्हाडा टॉवर्स",
          textEn: "All 5 Buildings (G • H • J • K • I) • MHADA Towers",
          isActive: true,
          order: 2
        },
        {
          id: "msg_3",
          text: "Daily Maha Aarti: 08:30 AM & 08:00 PM",
          textMr: "दैनिक महाआरती: सकाळी ८:३० व रात्री ८:०० वाजता",
          textEn: "Daily Maha Aarti: 08:30 AM & 08:00 PM",
          isActive: true,
          order: 3
        },
        {
          id: "msg_4",
          text: "Shree Ganeshotsav 2026 • Digital Information Center",
          textMr: "श्री गणेशोत्सव २०२६ • डिजिटल माहिती केंद्र",
          textEn: "Shree Ganeshotsav 2026 • Digital Information Center",
          isActive: true,
          order: 4
        }
      ];
      this.save();
    }
  }

  migrateGalleryIfNeeded() {
    if (!this.data?.config?.gallery || !Array.isArray(this.data.config.gallery)) {
      this.data.config.gallery = [];
      return;
    }

    const currentGallery = this.data.config.gallery;
    const hasLegacy = currentGallery.some(item => !Array.isArray(item.photos));

    if (hasLegacy) {
      console.log("[LocalStore] Migrating legacy gallery photos to festival-wise structure...");
      const festivals = [];
      const legacyPhotos = [];

      for (const item of currentGallery) {
        if (Array.isArray(item.photos)) {
          festivals.push({
            ...item,
            bannerUrl: item.bannerUrl || item.imageUrl || (item.photos[0]?.url || ""),
            imageUrl: item.bannerUrl || item.imageUrl || (item.photos[0]?.url || ""),
            nameMr: item.nameMr || item.titleMr || "उत्सव गॅलरी",
            nameEn: item.nameEn || item.titleEn || "Festival Gallery",
            titleMr: item.titleMr || item.nameMr || "उत्सव गॅलरी",
            titleEn: item.titleEn || item.nameEn || "Festival Gallery",
            isActive: item.isActive !== undefined ? item.isActive : true,
            order: item.order || festivals.length + 1
          });
        } else if (item.imageUrl) {
          legacyPhotos.push(item);
        }
      }

      if (legacyPhotos.length > 0) {
        const firstPhoto = legacyPhotos[0];
        const mahaAartiFestival = {
          id: "fest_maha_aarti_2026",
          titleMr: "महाआरती सोहळा २०२६",
          titleEn: "Maha Aarti 2026",
          nameMr: "महाआरती सोहळा २०२६",
          nameEn: "Maha Aarti 2026",
          category: firstPhoto.category || "महाआरती",
          categoryEn: firstPhoto.categoryEn || "Maha Aarti",
          year: firstPhoto.year || "२०२६",
          yearEn: firstPhoto.yearEn || "2026",
          descMr: firstPhoto.descMr || "म्हाडा टॉवर्स गणेशोत्सवातील नयनरम्य महाआरती सोहळा व भाविकांची उपस्थिती.",
          descEn: firstPhoto.descEn || "Divine Maha Aarti moments during MHADA Towers Ganesh Utsav 2026.",
          bannerUrl: firstPhoto.imageUrl,
          imageUrl: firstPhoto.imageUrl,
          accentColor: firstPhoto.accentColor || "from-amber-700 to-maroon-900",
          photos: legacyPhotos.map((p, idx) => ({
            id: p.id || `photo_${Date.now()}_${idx}`,
            url: p.imageUrl,
            captionMr: p.titleMr || `महाआरती छायाचित्र #${idx + 1}`,
            captionEn: p.titleEn || `Maha Aarti Photo #${idx + 1}`,
            order: idx + 1
          })),
          isActive: true,
          order: 1
        };
        festivals.unshift(mahaAartiFestival);
      }

      this.data.config.gallery = festivals;
      this.save();
      console.log(`[LocalStore] Gallery migration completed. Total festivals: ${festivals.length}`);
    }
  }

  migrateAartiSectionIfNeeded() {
    if (!this.data?.config) return;
    if (!this.data.config.dailyAartiSection) {
      this.data.config.dailyAartiSection = JSON.parse(JSON.stringify(defaultInitialData.config.dailyAartiSection));
      this.save();
      return;
    }
    const sec = this.data.config.dailyAartiSection;
    let modified = false;
    if (!sec.startDate) {
      sec.startDate = "2026-09-07";
      modified = true;
    }
    if (!sec.endDate) {
      sec.endDate = "2026-09-16";
      modified = true;
    }
    if (!sec.morningTime) {
      sec.morningTime = "सकाळी ०८:३० वाजता";
      modified = true;
    }
    if (!sec.morningTimeEn) {
      sec.morningTimeEn = "08:30 AM";
      modified = true;
    }
    if (!sec.eveningTime) {
      sec.eveningTime = "रात्री ०७:३० वाजता";
      modified = true;
    }
    if (!sec.eveningTimeEn) {
      sec.eveningTimeEn = "07:30 PM";
      modified = true;
    }
    if (modified) {
      this.save();
      console.log("[LocalStore] Daily Aarti section active period fields initialized.");
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("[LocalStore] Error saving local DB:", err.message);
    }
  }

  // Users
  getUserByEmail(emailOrUsername) {
    if (!emailOrUsername || !this.data?.users) return null;
    const normalized = emailOrUsername.toLowerCase().trim();
    return this.data.users.find(u => 
      (u.email && u.email.toLowerCase().trim() === normalized) ||
      (u.username && u.username.toLowerCase().trim() === normalized)
    ) || null;
  }

  getUserById(id) {
    if (!id || !this.data?.users) return null;
    return this.data.users.find(u => String(u._id) === String(id)) || null;
  }

  getUserByResetTokenHash(tokenHash) {
    if (!tokenHash || !this.data?.users) return null;
    return this.data.users.find(u => u.resetTokenHash === tokenHash) || null;
  }

  updateUser(id, updates) {
    if (!id || !this.data?.users) return null;
    const idx = this.data.users.findIndex(u => String(u._id) === String(id));
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.users[idx];
  }

  createUser(userData) {
    const user = {
      _id: "user_" + Date.now(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(user);
    this.save();
    return user;
  }

  // TabConfig
  getConfig() {
    return this.data.config;
  }

  updateConfig(updates) {
    this.data.config = {
      ...this.data.config,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.config;
  }

  // Announcements
  getAnnouncements(filter = {}) {
    let list = [...(this.data.announcements || [])];
    if (filter.isActive !== undefined) {
      list = list.filter(a => a.isActive !== false);
    }
    if (filter.category && filter.category !== "all") {
      list = list.filter(a => a.category === filter.category);
    }
    if (filter.wing && filter.wing !== "All") {
      list = list.filter(a => !a.targetWings || a.targetWings.includes("All") || a.targetWings.includes(filter.wing));
    }
    return list.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }

  createAnnouncement(annData) {
    const ann = {
      _id: "ann_" + Date.now(),
      isActive: true,
      createdAt: new Date().toISOString(),
      ...annData
    };
    this.data.announcements.unshift(ann);
    this.save();
    return ann;
  }

  updateAnnouncement(id, annData) {
    const idx = this.data.announcements.findIndex(a => String(a._id) === String(id));
    if (idx === -1) return null;
    this.data.announcements[idx] = {
      ...this.data.announcements[idx],
      ...annData,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.announcements[idx];
  }

  deleteAnnouncement(id) {
    const initialLen = this.data.announcements.length;
    this.data.announcements = this.data.announcements.filter(a => String(a._id) !== String(id));
    if (this.data.announcements.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Events
  getEvents(filter = {}) {
    let list = [...(this.data.events || [])];
    if (filter.isPublished !== undefined) {
      list = list.filter(e => e.isPublished !== false);
    }
    if (filter.category && filter.category !== "all") {
      list = list.filter(e => e.category === filter.category);
    }
    if (filter.eventType && filter.eventType !== "all") {
      list = list.filter(e => e.eventType === filter.eventType);
    }
    if (filter.day && filter.day !== "all") {
      list = list.filter(e => Number(e.dayNumber) === Number(filter.day));
    }
    return list.sort((a, b) => {
      if (a.startDateTime && b.startDateTime) {
        return new Date(a.startDateTime) - new Date(b.startDateTime);
      }
      return (Number(a.dayNumber) || 1) - (Number(b.dayNumber) || 1) || (Number(a.order) || 0) - (Number(b.order) || 0);
    });
  }

  createEvent(eventData) {
    const ev = {
      _id: "ev_" + Date.now(),
      createdAt: new Date().toISOString(),
      isPublished: eventData.isPublished !== undefined ? Boolean(eventData.isPublished) : true,
      targetAudience: eventData.targetAudience || eventData.hostWing || "सर्व विंग्ज (G, H, J, K)",
      targetAudienceEn: eventData.targetAudienceEn || eventData.hostWingEn || "All Wings (G, H, J, K)",
      ...eventData
    };
    this.data.events.push(ev);
    this.save();
    return ev;
  }

  updateEvent(id, eventData) {
    const idx = this.data.events.findIndex(e => String(e._id) === String(id));
    if (idx === -1) return null;
    this.data.events[idx] = {
      ...this.data.events[idx],
      ...eventData,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.events[idx];
  }

  deleteEvent(id) {
    const initialLen = this.data.events.length;
    this.data.events = this.data.events.filter(e => String(e._id) !== String(id));
    if (this.data.events.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Contacts
  getContacts(filter = {}) {
    let list = [...(this.data.contacts || [])];
    if (filter.type && filter.type !== "all") {
      list = list.filter(c => c.type === filter.type);
    }
    return list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }

  createContact(contactData) {
    const c = {
      _id: "contact_" + Date.now(),
      createdAt: new Date().toISOString(),
      ...contactData
    };
    this.data.contacts.push(c);
    this.save();
    return c;
  }

  updateContact(id, contactData) {
    const idx = this.data.contacts.findIndex(c => String(c._id) === String(id));
    if (idx === -1) return null;
    this.data.contacts[idx] = {
      ...this.data.contacts[idx],
      ...contactData,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.contacts[idx];
  }

  deleteContact(id) {
    const initialLen = this.data.contacts.length;
    this.data.contacts = this.data.contacts.filter(c => String(c._id) !== String(id));
    if (this.data.contacts.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Poll
  votePoll(optionId) {
    if (!this.data.config.poll || !this.data.config.poll.options) return null;
    const opt = this.data.config.poll.options.find(o => o.id === Number(optionId));
    if (opt) {
      opt.votes = (opt.votes || 0) + 1;
      this.data.config.poll.totalVotes = (this.data.config.poll.totalVotes || 0) + 1;
      this.save();
      return this.data.config.poll;
    }
    return null;
  }

  // Receipts & Settings
  getReceipts(filter = {}) {
    let list = [...(this.data.receipts || [])];
    const includeArchived = filter.includeArchived === true || filter.includeArchived === "true";
    if (!includeArchived && !filter.status) {
      list = list.filter(r => !r.isArchived);
    } else if (filter.status === "archived") {
      list = list.filter(r => r.isArchived);
    } else if (filter.status === "active") {
      list = list.filter(r => !r.isArchived);
    }

    if (filter.q) {
      const q = filter.q.toLowerCase().trim();
      list = list.filter(r => 
        (r.receiptNo && r.receiptNo.toLowerCase().includes(q)) ||
        (r.residentName && r.residentName.toLowerCase().includes(q)) ||
        (r.flatNo && r.flatNo.toLowerCase().includes(q)) ||
        (r.building && r.building.toLowerCase().includes(q)) ||
        (r.purpose && r.purpose.toLowerCase().includes(q)) ||
        (r.paymentDate && r.paymentDate.toLowerCase().includes(q)) ||
        (r.paymentMode && r.paymentMode.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.createdAt || b.paymentDate || 0) - new Date(a.createdAt || a.paymentDate || 0));
  }

  getReceiptById(id) {
    if (!id || !this.data?.receipts) return null;
    return this.data.receipts.find(r => String(r._id) === String(id)) || null;
  }

  getReceiptByNumber(receiptNo) {
    if (!receiptNo || !this.data?.receipts) return null;
    const cleanNo = receiptNo.trim().toUpperCase();
    return this.data.receipts.find(r => (r.receiptNo || "").trim().toUpperCase() === cleanNo) || null;
  }

  getNextReceiptNumber(customYear) {
    const year = customYear || new Date().getFullYear();
    const prefix = (this.data.receiptSettings?.receiptPrefix || "MT").toUpperCase();
    const regex = new RegExp(`^${prefix}/${year}/(\\d+)$`, "i");
    let maxSeq = 0;

    const receipts = this.data.receipts || [];
    for (const r of receipts) {
      const match = (r.receiptNo || "").match(regex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
    const nextSeq = maxSeq + 1;
    return `${prefix}/${year}/${String(nextSeq).padStart(5, "0")}`;
  }

  createReceipt(receiptData) {
    if (!this.data.receipts) this.data.receipts = [];

    // Ensure receiptNo
    let receiptNo = receiptData.receiptNo;
    if (!receiptNo) {
      receiptNo = this.getNextReceiptNumber();
    } else {
      receiptNo = receiptNo.trim().toUpperCase();
    }

    // Check duplicate
    if (this.getReceiptByNumber(receiptNo)) {
      throw new Error(`Receipt number ${receiptNo} already exists`);
    }

    const receipt = {
      _id: "rcpt_" + Date.now(),
      receiptNo,
      residentName: receiptData.residentName?.trim() || "",
      flatNo: receiptData.flatNo?.trim() || "",
      building: receiptData.building?.trim() || "",
      purpose: receiptData.purpose?.trim() || "",
      amount: Number(receiptData.amount) || 0,
      amountInWords: receiptData.amountInWords?.trim() || "",
      paymentDate: receiptData.paymentDate || new Date().toISOString().split("T")[0],
      paymentMode: receiptData.paymentMode?.trim() || "UPI",
      transactionRef: receiptData.transactionRef?.trim() || "",
      description: receiptData.description?.trim() || "",
      notes: receiptData.notes?.trim() || "",
      sachivSignatureUrl: receiptData.sachivSignatureUrl || this.data.receiptSettings?.sachivSignatureUrl || "",
      createdBy: receiptData.createdBy || "Admin",
      isArchived: false,
      archivedAt: null,
      archivedBy: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.receipts.unshift(receipt);
    this.save();
    return receipt;
  }

  archiveReceipt(id, adminName = "Admin") {
    if (!id || !this.data?.receipts) return null;
    const cleanId = String(id).trim();
    const cleanNo = cleanId.toUpperCase();
    const rcpt = this.data.receipts.find(
      r => String(r._id) === cleanId || (r.receiptNo && r.receiptNo.toUpperCase() === cleanNo)
    );
    if (!rcpt) return null;
    rcpt.isArchived = true;
    rcpt.archivedAt = new Date().toISOString();
    rcpt.archivedBy = adminName || "Admin";
    rcpt.updatedAt = new Date().toISOString();
    this.save();
    return rcpt;
  }

  restoreReceipt(id) {
    if (!id || !this.data?.receipts) return null;
    const cleanId = String(id).trim();
    const cleanNo = cleanId.toUpperCase();
    const rcpt = this.data.receipts.find(
      r => String(r._id) === cleanId || (r.receiptNo && r.receiptNo.toUpperCase() === cleanNo)
    );
    if (!rcpt) return null;
    rcpt.isArchived = false;
    rcpt.archivedAt = null;
    rcpt.archivedBy = "";
    rcpt.updatedAt = new Date().toISOString();
    this.save();
    return rcpt;
  }

  deleteReceipt(id) {
    // By default, soft-archive for safety
    return this.archiveReceipt(id);
  }

  getReceiptSettings() {
    return this.data.receiptSettings || {
      sachivSignatureUrl: "",
      receiptPrefix: "MT"
    };
  }

  updateReceiptSettings(updates) {
    this.data.receiptSettings = {
      ...(this.data.receiptSettings || { receiptPrefix: "MT", sachivSignatureUrl: "" }),
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.receiptSettings;
  }

  // ==========================================
  // Volunteer Management Methods
  // ==========================================
  getVolunteers(filter = {}) {
    let list = Array.isArray(this.data?.volunteers) ? [...this.data.volunteers] : [];
    const { search, status, wing, volunteerArea, emailStatus } = filter;

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        v =>
          (v.fullName && v.fullName.toLowerCase().includes(q)) ||
          (v.mobile && v.mobile.toLowerCase().includes(q)) ||
          (v.email && v.email.toLowerCase().includes(q)) ||
          (v.flatNo && v.flatNo.toLowerCase().includes(q)) ||
          (v.message && v.message.toLowerCase().includes(q))
      );
    }

    if (status && status !== "all") {
      list = list.filter(v => v.status === status);
    }

    if (wing && wing !== "all") {
      list = list.filter(v => v.wing && v.wing.toLowerCase().includes(wing.toLowerCase()));
    }

    if (volunteerArea && volunteerArea !== "all") {
      list = list.filter(v => v.volunteerArea && v.volunteerArea.toLowerCase().includes(volunteerArea.toLowerCase()));
    }

    if (emailStatus && emailStatus !== "all") {
      list = list.filter(v => v.emailStatus === emailStatus);
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getVolunteerById(id) {
    if (!id || !Array.isArray(this.data?.volunteers)) return null;
    return this.data.volunteers.find(v => String(v._id) === String(id)) || null;
  }

  createVolunteer(volunteerData) {
    if (!Array.isArray(this.data.volunteers)) {
      this.data.volunteers = [];
    }

    const volunteer = {
      _id: "vol_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      fullName: volunteerData.fullName?.trim() || "",
      mobile: volunteerData.mobile?.trim() || "",
      email: volunteerData.email?.trim()?.toLowerCase() || "",
      wing: volunteerData.wing?.trim() || "",
      flatNo: volunteerData.flatNo?.trim() || "",
      volunteerArea: volunteerData.volunteerArea?.trim() || "",
      availability: volunteerData.availability?.trim() || "",
      preferredDates: volunteerData.preferredDates?.trim() || "",
      message: volunteerData.message?.trim() || "",
      status: "New",
      emailStatus: "Not Sent",
      emailSentAt: null,
      emailRecipient: "",
      emailSubject: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.volunteers.unshift(volunteer);
    this.save();
    return volunteer;
  }

  updateVolunteerStatus(id, status) {
    if (!id || !Array.isArray(this.data?.volunteers)) return null;
    const v = this.data.volunteers.find(item => String(item._id) === String(id));
    if (!v) return null;
    v.status = status;
    v.updatedAt = new Date().toISOString();
    this.save();
    return v;
  }

  updateVolunteerEmail(id, { recipient, subject }) {
    if (!id || !Array.isArray(this.data?.volunteers)) return null;
    const v = this.data.volunteers.find(item => String(item._id) === String(id));
    if (!v) return null;
    v.emailStatus = "Sent";
    v.emailSentAt = new Date().toISOString();
    v.emailRecipient = recipient || v.email;
    v.emailSubject = subject || "Thank You for Volunteering with MHADA Towers Utsav Mandal";
    v.updatedAt = new Date().toISOString();
    this.save();
    return v;
  }

  deleteVolunteer(id) {
    if (!id || !Array.isArray(this.data?.volunteers)) return false;
    const initialLen = this.data.volunteers.length;
    this.data.volunteers = this.data.volunteers.filter(item => String(item._id) !== String(id));
    if (this.data.volunteers.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }
}

const localStore = new LocalStore();
export default localStore;
