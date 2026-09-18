import mongoose from "mongoose";

const tabSettingSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  labelMr: { type: String, required: true },
  labelEn: { type: String, required: true },
  order: { type: Number, default: 0 },
  approved: { type: Boolean, default: true }
}, { _id: false, strict: false });

const sidebarItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  labelMr: { type: String, required: true },
  labelEn: { type: String, required: true },
  badge: { type: String, default: "" },
  badgeType: { type: String, default: "default" },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  targetSection: { type: String, default: "" },
  icon: { type: String, default: "layout" }
}, { _id: false, strict: false });

const dailyAartiItemSchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  dateStr: { type: String, required: true },
  dateStrEn: { type: String, default: "" },
  tithi: { type: String, default: "" },
  tithiEn: { type: String, default: "" },
  hostWing: { type: String, required: true },
  hostWingEn: { type: String, default: "" },
  hostLead: { type: String, default: "" },
  hostLeadEn: { type: String, default: "" },
  morningTime: { type: String, default: "सकाळी ०८:३० वाजता" },
  morningTimeEn: { type: String, default: "08:30 AM" },
  eveningTime: { type: String, default: "रात्री ०८:०० वाजता" },
  eveningTimeEn: { type: String, default: "08:00 PM" },
  morningRitual: { type: String, default: "काकड आरती, मंत्रपुष्पांजली व नैवेद्य" },
  morningRitualEn: { type: String, default: "" },
  eveningRitual: { type: String, default: "भव्य महाआरती व मंत्रपुष्पांजली" },
  eveningRitualEn: { type: String, default: "" },
  specialPrasad: { type: String, default: "मोदक व पेढे" },
  specialPrasadEn: { type: String, default: "" },
  cultural: { type: String, default: "" },
  culturalEn: { type: String, default: "" },
  date: { type: String, default: "" },
  events: { type: [mongoose.Schema.Types.Mixed], default: [] },
  isCurrentDay: { type: Boolean, default: false }
}, { _id: false, strict: false });

const dailyAartiSectionSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  badgeMr: { type: String, default: "दैनिक महाआरती व यजमान" },
  badgeEn: { type: String, default: "Daily Maha Aarti & Host Wings" },
  titleMr: { type: String, default: "दैनिक महाआरती व विंग यजमान" },
  titleEn: { type: String, default: "Daily Maha Aarti & Host Wings" },
  subtitleMr: { type: String, default: "दररोज सकाळी ०८:३० व रात्री ०८:०० वाजता मुख्य मंडपात महाआरती" },
  subtitleEn: { type: String, default: "Every day at 08:30 AM and 07:30 PM near G wing" },
  countdownLabelMr: { type: String, default: "पुढील महाआरतीसाठी शिल्लक वेळ" },
  countdownLabelEn: { type: String, default: "Time Remaining Until Next Aarti" },
  startDate: { type: String, default: "2026-09-07" },
  endDate: { type: String, default: "2026-09-16" },
  morningTime: { type: String, default: "सकाळी ०८:३० वाजता" },
  morningTimeEn: { type: String, default: "08:30 AM" },
  eveningTime: { type: String, default: "रात्री ०७:३० वाजता" },
  eveningTimeEn: { type: String, default: "07:30 PM" }
}, { _id: false, strict: false });

const festivalScheduleCardSchema = new mongoose.Schema({
  eventNameMr: { type: String, default: "श्री गणेशोत्सव २०२६ (१० दिवसीय भव्य उत्सव)" },
  eventNameEn: { type: String, default: "Shree Ganeshotsav 2026 (10-Day Grand Celebration)" },
  eventDescriptionMr: { type: String, default: "म्हाडा टॉवर्स संकुलातील सर्व ४ विंग्ज (G, H, J, K) संयुक्त विद्यमाने आयोजित १० दिवसीय अखंड गणेशोत्सव सोहळा." },
  eventDescriptionEn: { type: String, default: "10-day grand festival celebration organized jointly by all 4 buildings (Wings G, H, J, K) of MHADA Towers." },
  plannerMr: { type: String, default: "म्हाडा टॉवर्स उत्सव मंडळ व मध्यवर्ती सोसायटी समिती" },
  plannerEn: { type: String, default: "MHADA Towers Utsav Mandal & Central Society Committee" },
  plannerDetailsMr: { type: String, default: "सर्व ४ इमारतींचे विंग प्रमुख व स्वयंसेवक दल (विंग G, H, J, K)" },
  plannerDetailsEn: { type: String, default: "All 4 Building Wing Leads & Volunteer Squad (Wings G, H, J, K)" },
  imageUrl: { type: String, default: "" },
  imageCaptionMr: { type: String, default: "उत्सव वेळापत्रक व संपूर्ण कार्यक्रम रूपरेषा" },
  imageCaptionEn: { type: String, default: "Festival Schedule & Complete Event Blueprint" }
}, { _id: false, strict: false });

const newsletterSchema = new mongoose.Schema({
  edition: { type: String, default: "अंक १ (दिवस १ - श्री गणेश चतुर्थी)" },
  editionEn: { type: String, default: "Edition 1 (Day 1 - Ganesh Chaturthi)" },
  date: { type: String, default: "७ सप्टेंबर २०२६" },
  dateEn: { type: String, default: "7 September 2026" },
  dateStr: { type: String, default: "" },
  dateStrEn: { type: String, default: "" },
  headline: { type: String, default: "श्री गणरायाचे भव्य आगमन व प्राणप्रतिष्ठा सोहळा संपन्न!" },
  headlineEn: { type: String, default: "Grand Arrival & Murti Sthapana Ceremony Completed!" },
  summary: { type: String, default: "सर्व ४ इमारतींमधील भाविकांच्या उपस्थितीत बाप्पांचे आगमन झाले." },
  summaryEn: { type: String, default: "" },
  subheadline: { type: String, default: "" },
  subheadlineEn: { type: String, default: "" },
  todayHost: { type: String, default: "G WING - नंदादेवी (Nandadevi)" },
  todayHostEn: { type: String, default: "G Wing - Nandadevi" },
  todaysHostWing: { type: String, default: "G WING - नंदादेवी (Nandadevi)" },
  todaysHostWingEn: { type: String, default: "G Wing - Nandadevi" },
  morningAarti: { type: String, default: "०८:३० AM" },
  eveningAarti: { type: String, default: "०८:०० PM" },
  eveningAartiTime: { type: String, default: "०८:०० PM" },
  hostLead: { type: String, default: "" },
  hostLeadEn: { type: String, default: "" },
  specialNote: { type: String, default: "" },
  safetyTip: { type: String, default: "कृपया वाहने नियुक्त पार्किंगमध्येच लावावीत. संकुल २४x७ सीसीटीव्ही निगराणीखाली आहे." },
  safetyTipEn: { type: String, default: "Please park vehicles only in designated spots. Complex is monitored 24x7 by CCTV." },
  bappaDarshanQuote: { type: String, default: "" },
  darshanPhotoUrl: { type: String, default: "" },
  darshanPhotoCaption: { type: String, default: "" },
  todaysHighlights: { type: [String], default: [] },
  yesterdayHighlights: { type: [String], default: [] },
  prasadSpecial: { type: String, default: "" },
  displayStyle: { type: String, default: "classic" },
  bulletinTitle: { type: String, default: "DAILY DIGITAL BULLETIN" },
  bulletinTitleMr: { type: String, default: "दैनिक डिजिटल वृत्तपत्र" },
  eventDuration: { type: String, default: "1 day event" },
  eventDurationMr: { type: String, default: "१ दिवसीय सोहळा" },
  festivalName: { type: String, default: "Ganesh Utsav - 16 Sep" },
  festivalNameMr: { type: String, default: "गणेश उत्सव - १६ सप्टेंबर" },
  startDate: { type: String, default: "2026-09-07" },
  endDate: { type: String, default: "2026-09-16" },
  showSelectDay: { type: Boolean, default: true },
  showTodayBadge: { type: Boolean, default: true },
  showCurrentDay: { type: Boolean, default: true },
  days: { type: [mongoose.Schema.Types.Mixed], default: [] },
  enabled: { type: Boolean, default: true }
}, { _id: false, strict: false });

const wingItemSchema = new mongoose.Schema({
  code: { type: String, required: true },
  nameMr: { type: String, required: true },
  nameEn: { type: String, default: "" },
  sacredName: { type: String, default: "" },
  flats: { type: String, default: "४० फ्लॅट्स" },
  lead: { type: String, default: "" },
  phone: { type: String, default: "" },
  aartiDay: { type: String, default: "" }
}, { _id: false });

const ruleItemSchema = new mongoose.Schema({
  id: { type: String, default: "" },
  title: { type: String, required: true },
  desc: { type: String, required: true },
  icon: { type: String, default: "ShieldCheck" }
}, { _id: false });

const festivalPhotoSchema = new mongoose.Schema({
  id: { type: String, default: "" },
  url: { type: String, required: true },
  captionMr: { type: String, default: "" },
  captionEn: { type: String, default: "" },
  order: { type: Number, default: 0 }
}, { _id: false, strict: false });

const galleryItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  titleMr: { type: String, required: true },
  titleEn: { type: String, default: "" },
  nameMr: { type: String, default: "" },
  nameEn: { type: String, default: "" },
  category: { type: String, default: "महाआरती" },
  categoryEn: { type: String, default: "Maha Aarti" },
  year: { type: String, default: "२०२६" },
  yearEn: { type: String, default: "2026" },
  descMr: { type: String, default: "" },
  descEn: { type: String, default: "" },
  accentColor: { type: String, default: "from-amber-700 to-maroon-900" },
  bannerUrl: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  photos: { type: [festivalPhotoSchema], default: [] },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: false, strict: false });

const pollOptionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  text: { type: String, required: true },
  textEn: { type: String, default: "" },
  votes: { type: Number, default: 0 }
}, { _id: false, strict: false });

const pollSchema = new mongoose.Schema({
  question: { type: String, default: "" },
  questionMr: { type: String, default: "संध्याकाळच्या महाआरतीची कोणती वेळ सर्वात सोयीस्कर आहे?" },
  questionEn: { type: String, default: "Which evening Maha Aarti timing is most convenient for residents?" },
  options: {
    type: [pollOptionSchema],
    default: [
      { id: 1, text: "संध्याकाळी ०७:३० वाजता (Early Evening - 07:30 PM)", votes: 14 },
      { id: 2, text: "रात्री ०८:०० वाजता (Regular - 08:00 PM)", votes: 38 },
      { id: 3, text: "रात्री ०८:३० वाजता (Late Evening - 08:30 PM)", votes: 9 }
    ]
  },
  active: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  totalVotes: { type: Number, default: 0 }
}, { _id: false, strict: false });

const volunteerSevaSchema = new mongoose.Schema({
  title: { type: String, default: "स्वयंसेवक सेवा नोंदणी" },
  titleMr: { type: String, default: "स्वयंसेवक सेवा नोंदणी" },
  titleEn: { type: String, default: "Volunteer Registration" },
  description: { type: String, default: "" },
  descriptionEn: { type: String, default: "" },
  roles: { type: [mongoose.Schema.Types.Mixed], default: [] },
  sevaOptions: {
    type: [String],
    default: [
      "मंडप व्यवस्था व आरती मदत",
      "सांस्कृतिक कार्यक्रम संयोजन",
      "सीसीटीव्ही व सुरक्षा मदत",
      "माहिती व डिजिटल प्रसिद्धी"
    ]
  },
  active: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { _id: false, strict: false });

const pillarSchema = new mongoose.Schema({
  icon: { type: String, default: "HeartHandshake" },
  titleMr: { type: String, required: true },
  titleEn: { type: String, default: "" },
  descMr: { type: String, default: "" },
  descEn: { type: String, default: "" }
}, { _id: false });

const committeeMemberSchema = new mongoose.Schema({
  roleMr: { type: String, required: true },
  roleEn: { type: String, default: "" },
  nameMr: { type: String, required: true },
  nameEn: { type: String, default: "" },
  wing: { type: String, default: "" },
  phone: { type: String, default: "" }
}, { _id: false });

const mandalInfoSchema = new mongoose.Schema({
  historyMr: {
    type: String,
    default: "पिंपरी चिंचवड मधील म्हाडा टॉवर्स संकुलातील ४ विंग्ज (G-नंदादेवी, H-निलगिरी, J-पूर्वांचल, K-गोवर्धन) मधील सर्व रहिवासी, मालक व भाडेकरू कुटुंबे एकत्र येऊन दरवर्षी अत्यंत उत्साहात, शिस्तबद्ध व भव्य स्वरूपात गणेशोत्सव साजरा करतात. '४ विंग्स, एकच परिवार' या संकल्पनेतून सामाजिक सलोखा, चोख सुरक्षा व पर्यावरण संवर्धन जपले जाते."
  },
  historyEn: {
    type: String,
    default: "Families residing in the 4 key buildings of MHADA Towers - G (Nandadevi), H (Nilgiri), J (Purvanchal), and K (Govardhan) come together every year with deep devotion to celebrate Ganesh Utsav."
  },
  establishedYear: { type: String, default: "२०२४" },
  regDetails: { type: String, default: "नोंदणी क्र: १२४३/२०२५ - पुणे (धर्मादाय सहआयुक्त मान्यताप्राप्त)" },
  mottoMr: { type: String, default: "४ विंग्स, एकच परिवार (सहकार्य • शिस्त • अखंड भक्ती)" },
  officeAddressMr: { type: String, default: "मध्यवर्ती उत्सव मंडप, म्हाडा टॉवर्स संकुल, पिंपरी वाघेरे, पिंपरी चिंचवड, पुणे - ४११०१७" },
  helpline: { type: String, default: "+91 98220 11223" },
  email: { type: String, default: "mhadatowersutsavmandal@gmail.com" },
  bankDetails: {
    accountName: { type: String, default: "MHADA TOWERS UTSAV MANDAL" },
    bankName: { type: String, default: "Bank of Maharashtra - Pimpri Branch" },
    accountNo: { type: String, default: "60459821034" },
    ifsc: { type: String, default: "MAHB0000123" },
    upiId: { type: String, default: "mhadatowers@upi" }
  },
  pillars: {
    type: [pillarSchema],
    default: [
      {
        icon: "HeartHandshake",
        titleMr: "सामाजिक एकता व सलोखा",
        titleEn: "Social Unity & Harmony",
        descMr: "४ इमारतींमधील (G-नंदादेवी, H-निलगिरी, J-पूर्वांचल, K-गोवर्धन) सर्व मालक व भाडेकरू कुटुंबांना एका सूत्रात बांधणारा उत्सव.",
        descEn: "Uniting all owner and tenant families across 4 buildings (G, H, J, K) under one divine family."
      },
      {
        icon: "Leaf",
        titleMr: "१००% पर्यावरणपूरक संकल्प",
        titleEn: "100% Eco-Friendly Festival",
        descMr: "शाडू मातीची मूर्ती, शून्य प्लास्टिक वापर व संकुलातच उभारलेल्या कृत्रिम हौदात १००% पर्यावरणपूरक विसर्जन.",
        descEn: "Pure clay idol, zero plastic usage, and eco-friendly immersion in dedicated artificial water tank."
      },
      {
        icon: "ShieldCheck",
        titleMr: "चोख सुरक्षा व २४x७ निगराणी",
        titleEn: "Safety, Security & 24x7 Vigilance",
        descMr: "संपूर्ण उत्सव परिसर उच्च दर्जाच्या सीसीटीव्ही निगराणीखाली, २४x७ सुरक्षा रक्षक व शिस्तबद्ध स्वयंसेवक दल.",
        descEn: "High-definition CCTV coverage across festive premises, 24x7 security guards, and volunteer squad."
      },
      {
        icon: "Award",
        titleMr: "सांस्कृतिक व बालसंस्कार",
        titleEn: "Culture, Youth & Women Welfare",
        descMr: "लहान मुलांसाठी चित्रकला व वक्तृत्व स्पर्धा, महिला मंडळाचे कार्यक्रम व गुणवंत विद्यार्थ्यांचा गौरव सोहळा.",
        descEn: "Children drawing & speech contests, women cultural activities, and student felicitations."
      }
    ]
  },
  committeeMembers: {
    type: [committeeMemberSchema],
    default: [
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
    ]
  }
}, { _id: false });

const scrollerMessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  textMr: { type: String, default: "" },
  textEn: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  startDate: { type: String, default: "" },
  endDate: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
}, { _id: false, strict: false });

const tabConfigSchema = new mongoose.Schema({
  mandalNameMr: { type: String, default: "म्हाडा टॉवर्स उत्सव मंडळ" },
  mandalNameEn: { type: String, default: "MHADA Towers Utsav Mandal" },
  addressMr: { type: String, default: "पिंपरी वाघेरे, पिंपरी चिंचवड, पुणे - ४११०१७" },
  regNo: { type: String, default: "१२४३/२०२५ - पुणे" },
  festivalYear: { type: String, default: "२०२५ - २०२६" },
  festivalStatus: { type: String, default: "उत्सव सुरू आहे (Festival Live)" },
  marqueeText: {
    type: String,
    default: "गणपती बाप्पा मोरया! दैनिक महाआरती सकाळी ८:३० व रात्री ८:०० वाजता | आजची महाआरती इमारत G विंग यजमान | सर्व भाविकांनी आरतीला उपस्थित राहावे."
  },
  marqueeActive: { type: Boolean, default: true },
  scrollerMessages: {
    type: [scrollerMessageSchema],
    default: [
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
    ]
  },
  participatingWings: {
    type: [String],
    default: ["G", "H", "J", "K"]
  },
  whatsAppCommunityLink: {
    type: String,
    default: "https://chat.whatsapp.com/sample-mhada-ganpati-community"
  },
  emergencyHelpline: {
    type: String,
    default: "+91 98220 11223"
  },
  tabs: {
    marquee: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "स्क्रोलर टिकर", labelEn: "Breaking Ticker", order: 1 }
    },
    newsletter: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "दैनिक वृत्तपत्र", labelEn: "Daily Bulletin", order: 2 }
    },
    wings: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "सहभागी इमारती", labelEn: "Participating Buildings", order: 3 }
    },
    events: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "उत्सव कार्यक्रम", labelEn: "Festival Events", order: 4 }
    },
    aarti: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "दैनिक महाआरती", labelEn: "Aarti Timings", order: 5 }
    },
    schedule: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "१० दिवसांचे वेळापत्रक", labelEn: "10-Day Schedule", order: 6 }
    },
    upcoming: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "आगामी व वार्षिक कार्यक्रम", labelEn: "Upcoming & Yearly Events", order: 7 }
    },
    gallery: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "छायाचित्रे", labelEn: "Photo Gallery", order: 8 }
    },
    rules: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "मंडळ नियमावली", labelEn: "Society Rules", order: 9 }
    },
    contacts: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "संपर्क व मदत केंद्र", labelEn: "Emergency & Committee", order: 10 }
    },
    about: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "मंडळ माहिती व इतिहास", labelEn: "About Mandal", order: 11 }
    },
    polls: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "रहिवासी मतदान", labelEn: "Resident Polls", order: 12 }
    },
    volunteer: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "स्वयंसेवक सेवा", labelEn: "Volunteer Seva", order: 13 }
    },
    whatsapp: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "व्हॉट्सॲप कम्युनिटी", labelEn: "WhatsApp Group QR", order: 15 }
    },
    arrival: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "श्रींचे आगमन", labelEn: "Ganpati Arrival", order: 16 }
    },
    cultural: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "सांस्कृतिक कार्यक्रम", labelEn: "Cultural Programs", order: 17 }
    },
    announcements: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "महत्वाच्या सूचना", labelEn: "Announcements", order: 18 }
    },
    prasad: {
      type: tabSettingSchema,
      default: { enabled: false, approved: false, labelMr: "महाप्रसाद", labelEn: "Maha Prasad", order: 19 }
    },
    visarjan: {
      type: tabSettingSchema,
      default: { enabled: false, approved: false, labelMr: "विसर्जन सोहळा", labelEn: "Visarjan Timings", order: 20 }
    },
    ownersNotice: {
      type: tabSettingSchema,
      default: { enabled: false, approved: false, labelMr: "वर्गणी व सभा अपडेट", labelEn: "Owners & Mandal Info", order: 21 }
    },
    mandalInfo: {
      type: tabSettingSchema,
      default: { enabled: true, approved: true, labelMr: "मंडळ माहिती व सुरक्षा", labelEn: "Mandal Info", order: 22 }
    }
  },
  newsletter: {
    type: newsletterSchema,
    default: () => ({})
  },
  wings: {
    type: [wingItemSchema],
    default: [
      { code: "G", nameMr: "G - नंदादेवी (Nandadevi)", nameEn: "G - Nandadevi", sacredName: "नंदादेवी (Nandadevi)", flats: "४० फ्लॅट्स", lead: "श्री. सचिन पाटील (G-402)", phone: "+91 98220 11223", aartiDay: "दिवस १ व ५" },
      { code: "H", nameMr: "H - निलगिरी (Nilgiri)", nameEn: "H - Nilgiri", sacredName: "निलगिरी (Nilgiri)", flats: "४० फ्लॅट्स", lead: "श्री. विजय पवार (H-301)", phone: "+91 94220 77882", aartiDay: "दिवस २ व ६" },
      { code: "J", nameMr: "J - पूर्वांचल (Purvanchal)", nameEn: "J - Purvanchal", sacredName: "पूर्वांचल (Purvanchal)", flats: "४० फ्लॅट्स", lead: "श्री. निलेश मोरे (J-202)", phone: "+91 94220 77884", aartiDay: "दिवस ३ व ७" },
      { code: "K", nameMr: "K - गोवर्धन (Govardhan)", nameEn: "K - Govardhan", sacredName: "गोवर्धन (Govardhan)", flats: "४० फ्लॅट्स", lead: "श्री. गणेश जाधव (K-603)", phone: "+91 94220 77885", aartiDay: "दिवस ४ व ८" }
    ]
  },
  rules: {
    type: [ruleItemSchema],
    default: [
      {
        id: "r1",
        title: "ध्वनी मर्यादा व शांतता नियम",
        desc: "शासकीय नियमांनुसार रात्री १०:०० नंतर ध्वनिक्षेपक (लाऊडस्पीकर) पूर्णपणे बंद राहील. कृपया मंडप परिसरात शांतता राखावी.",
        icon: "Volume2"
      },
      {
        id: "r2",
        title: "वाहने पार्किंग व आपत्कालीन रस्ता",
        desc: "मुख्य मंडपाच्या समोरील आपत्कालीन रस्ता कायम रिकामा ठेवावा. सर्व वाहने ठरवून दिलेल्या विंग पार्किंगमध्येच लावावीत.",
        icon: "Car"
      },
      {
        id: "r3",
        title: "स्वच्छता व कचरा व्यवस्थापन",
        desc: "प्रसादाच्या पत्रावळ्या, द्रोण व प्लास्टिक बाटल्या कचराकुंडीतच टाकाव्यात. ओला व सुका कचरा वेगळा ठेवण्यास सहकार्य करावे.",
        icon: "Sparkles"
      },
      {
        id: "r4",
        title: "१००% पर्यावरणपूरक उत्सव",
        desc: "सोसायटीमध्ये १००% शाडू मातीच्या मूर्तीचे कृत्रिम हौदात विसर्जन केले जाईल. रासायनिक रंगांचा वापर टाळण्यात आला आहे.",
        icon: "ShieldCheck"
      }
    ]
  },
  gallery: {
    type: [galleryItemSchema],
    default: [
      {
        id: "p1",
        titleMr: "श्री गणरायाची भव्य शाडू मातीची मूर्ती प्राणप्रतिष्ठा",
        titleEn: "Grand Eco-Friendly Bappa Murti Sthapana",
        category: "मूर्ती व प्रतिष्ठापना",
        categoryEn: "Murti & Sthapana",
        year: "२०२५",
        yearEn: "2025",
        descMr: "म्हाडा टॉवर्स मुख्य मंडपातील बाप्पांचे विलोभनीय रूप. आकर्षक फुलांची आरास व सुवर्ण मुकुट दर्शन.",
        descEn: "Splendid darshan of Bappa adorned with fragrant flowers and golden crown in the main pandal.",
        accentColor: "from-amber-700 to-maroon-900",
        imageUrl: ""
      },
      {
        id: "p2",
        titleMr: "१०१ समई व दीप प्रज्वलन महाआरती सोहळा",
        titleEn: "Grand Deepotsav Maha Aarti Ceremony",
        category: "महाआरती",
        categoryEn: "Maha Aarti",
        year: "२०२५",
        yearEn: "2025",
        descMr: "सर्व ४ इमारतींमधील शेकडो भाविकांनी एकत्र येऊन केलेली अखंड सायं महाआरती व मंत्रपुष्पांजली.",
        descEn: "Hundreds of residents gathered for the grand evening maha aarti illuminated with sacred lamps.",
        accentColor: "from-orange-700 to-amber-900",
        imageUrl: ""
      },
      {
        id: "p3",
        titleMr: "बाल गोपाळांची भव्य चित्रकला व वेशभूषा स्पर्धा",
        titleEn: "Children's Drawing & Fancy Dress Competitions",
        category: "सांस्कृतिक",
        categoryEn: "Cultural & Kids",
        year: "२०२४",
        yearEn: "2024",
        descMr: "सोसायटीतील ७० हून अधिक मुलांचा उत्स्फूर्त सहभाग व बक्षीस वितरण समारंभ.",
        descEn: "Over 70 children participated enthusiastically in fancy dress and drawing competitions.",
        accentColor: "from-indigo-800 to-maroon-900",
        imageUrl: ""
      },
      {
        id: "p4",
        titleMr: "पारंपरिक ढोल-ताशा पथक व लेझीम मिरवणूक",
        titleEn: "Traditional Dhol-Tasha & Lezim Procession",
        category: "मिरवणूक",
        categoryEn: "Procession",
        year: "२०२५",
        yearEn: "2025",
        descMr: "युवा मंडळाच्या तालबद्ध वादनाने म्हाडा टॉवर्स संकुल दुमदुमले. अभूतपूर्व उत्साह व आनंद.",
        descEn: "Rhythmic beats of Dhol-Tasha echoed through the MHADA Towers complex during the grand welcome.",
        accentColor: "from-rose-800 to-maroon-950",
        imageUrl: ""
      },
      {
        id: "p5",
        titleMr: "महिला मंडळाचा पारंपरिक खेळ व मंगळागौर",
        titleEn: "Women's Wing Mangalagaur & Folk Games",
        category: "सांस्कृतिक",
        categoryEn: "Cultural & Kids",
        year: "२०२५",
        yearEn: "2025",
        descMr: "गौरी पूजनाच्या शुभमुहूर्तावर सर्व विंग्समधील भगिनींचा सहभाग, फुगडी व पारंपरिक लोककला.",
        descEn: "Celebration of traditional folk games, Fugdi, and cultural heritage on the eve of Gauri Pujan.",
        accentColor: "from-purple-800 to-maroon-900",
        imageUrl: ""
      },
      {
        id: "p6",
        titleMr: "पर्यावरणपूरक कृत्रिम हौद संकल्प व सांगता",
        titleEn: "Eco-Friendly Water Tank Farewell & Slogans",
        category: "मूर्ती व प्रतिष्ठापना",
        categoryEn: "Murti & Sthapana",
        year: "२०२४",
        yearEn: "2024",
        descMr: "संकुलातच उभारलेल्या १००% पर्यावरणपूरक कृत्रिम हौदात बाप्पांचे सन्मानपूर्वक भावपूर्ण विसर्जन.",
        descEn: "Dignified and 100% eco-friendly water tank immersion ceremony within the complex premises.",
        accentColor: "from-emerald-800 to-maroon-950",
        imageUrl: ""
      }
    ]
  },
  poll: {
    type: pollSchema,
    default: () => ({})
  },
  volunteerSeva: {
    type: volunteerSevaSchema,
    default: () => ({})
  },
  sidebarMenu: {
    type: [sidebarItemSchema],
    default: [
      { id: "dashboard", labelMr: "मुख्य पृष्ठ", labelEn: "Dashboard", badge: "", badgeType: "active", enabled: true, order: 1, targetSection: "top", icon: "LayoutDashboard" },
      { id: "liveUpdates", labelMr: "दैनिक वृत्तपत्र", labelEn: "Daily Bulletin", badge: "LIVE", badgeType: "pill-red", enabled: true, order: 2, targetSection: "marquee", icon: "Sparkles" },
      { id: "aartiSchedule", labelMr: "दैनिक महाआरती", labelEn: "Daily Maha Aarti", badge: "आरती", badgeType: "badge-gold", enabled: true, order: 3, targetSection: "aarti", icon: "Flame" },
      { id: "schedule", labelMr: "१० दिवसांचे वेळापत्रक", labelEn: "10-Day Schedule", badge: "१० दिवस", badgeType: "badge-gold", enabled: true, order: 4, targetSection: "schedule", icon: "Calendar" },
      { id: "upcoming", labelMr: "आगामी कार्यक्रम", labelEn: "Upcoming Events", badge: "नवीन", badgeType: "badge-gold", enabled: true, order: 5, targetSection: "upcoming", icon: "Calendar" },
      { id: "wings", labelMr: "इमारती (४ विंग्ज)", labelEn: "4 Buildings", badge: "", badgeType: "default", enabled: true, order: 6, targetSection: "wings", icon: "Building2" },
      { id: "polls", labelMr: "मतदान कट्टा", labelEn: "Resident Polls", badge: "", badgeType: "default", enabled: true, order: 7, targetSection: "polls", icon: "BarChart2" },
      { id: "volunteer", labelMr: "स्वयंसेवक सेवा", labelEn: "Volunteer Seva", badge: "", badgeType: "default", enabled: true, order: 8, targetSection: "volunteer", icon: "Users" },
      { id: "gallery", labelMr: "छायाचित्रे", labelEn: "Photo Gallery", badge: "", badgeType: "default", enabled: true, order: 9, targetSection: "gallery", icon: "Image" },
      { id: "contacts", labelMr: "संपर्क व ईमेल", labelEn: "Helplines & Email", badge: "", badgeType: "default", enabled: true, order: 10, targetSection: "contacts", icon: "PhoneCall" },
      { id: "mandalInfo", labelMr: "मंडळ माहिती व सुरक्षा", labelEn: "Mandal Info & Security", badge: "", badgeType: "default", enabled: true, order: 11, targetSection: "mandal-info", icon: "Info" },
      { id: "adminLogin", labelMr: "व्यवस्थापक कक्ष", labelEn: "Admin Portal", badge: "", badgeType: "default", enabled: true, order: 12, targetSection: "admin-login", icon: "Shield" }
    ]
  },
  sidebarSettings: {
    showFloatingTrigger: { type: Boolean, default: true },
    bottomCardTitle: { type: String, default: "All 4 Buildings" },
    bottomCardSubtitle: { type: String, default: "Wings G, H, J, K" },
    bottomCardTagline: { type: String, default: "❤️ ४ विंग्स, एकच परिवार" },
    bottomCardSubtag: { type: String, default: "सहकार्य • शिस्त • अखंड भक्ती" }
  },
  dailyAartiSchedule: {
    type: [dailyAartiItemSchema],
    default: [
      {
        dayNumber: 1,
        dateStr: "दिवस १ (श्री गणेश चतुर्थी - ७ सप्टेंबर)",
        dateStrEn: "Day 1 (Ganesh Chaturthi - 7 Sep)",
        tithi: "श्री गणेश चतुर्थी (गणेश आगमन व प्राणप्रतिष्ठा)",
        tithiEn: "Ganesh Chaturthi (Arrival & Murti Sthapana)",
        hostWing: "G WING - नंदादेवी (Nandadevi)",
        hostWingEn: "G Wing - Nandadevi",
        hostLead: "श्री. सचिन पाटील (फ्लॅट G-402)",
        hostLeadEn: "Mr. Sachin Patil (Flat G-402)",
        morningTime: "सकाळी ०८:३० वाजता",
        morningTimeEn: "08:30 AM",
        eveningTime: "रात्री ०८:०० वाजता",
        eveningTimeEn: "08:00 PM",
        morningRitual: "श्री गणरायाची विधिवत प्राणप्रतिष्ठा, काकड आरती व मोदक नैवेद्य",
        morningRitualEn: "Pranpratishtha pooja, kakad aarti & modak naivedya",
        eveningRitual: "संध्याकाळची भव्य धूपारती, मंत्रपुष्पांजली व भजन",
        eveningRitualEn: "Grand evening dhupaarti and sacred chants",
        specialPrasad: "ताजे उकडीचे मोदक व पेढे",
        specialPrasadEn: "Fresh steamed modak & pedhe",
        cultural: "रात्री ९:०० स्थानिक बालगोपाळांचे स्वागत व श्लोक पठण",
        culturalEn: "9:00 PM Welcome ceremony & children's shloka recitation",
        isCurrentDay: true
      },
      {
        dayNumber: 2,
        dateStr: "दिवस २ (ऋषी पंचमी - ८ सप्टेंबर)",
        dateStrEn: "Day 2 (Rishi Panchami - 8 Sep)",
        tithi: "ऋषी पंचमी विशेष पूजा",
        tithiEn: "Rishi Panchami Special Pooja",
        hostWing: "H WING - निलगिरी (Nilgiri)",
        hostWingEn: "H Wing - Nilgiri",
        hostLead: "श्री. विजय पवार (फ्लॅट H-301)",
        hostLeadEn: "Mr. Vijay Pawar (Flat H-301)",
        morningTime: "सकाळी ०८:३० वाजता",
        morningTimeEn: "08:30 AM",
        eveningTime: "रात्री ०८:०० वाजता",
        eveningTimeEn: "08:00 PM",
        morningRitual: "ऋषी पंचमी विशेष पूजा, प्रभात आरती व पंचखाद्य",
        morningRitualEn: "Rishi Panchami pooja and morning aarti",
        eveningRitual: "धूप आरती व स्थानिक भजनी मंडळ",
        eveningRitualEn: "Dhupaarti and resident devotional bhajan",
        specialPrasad: "पंचखाद्य व केळी प्रसाद",
        specialPrasadEn: "Panchkhadya & banana prasad",
        cultural: "सायंकाळी ६:०० लहान मुलांची चित्रकला व हस्ताक्षर स्पर्धा",
        culturalEn: "6:00 PM Children's Drawing & Handwriting Competition",
        isCurrentDay: false
      },
      {
        dayNumber: 3,
        dateStr: "दिवस ३ (गौरी आवाहन - ९ सप्टेंबर)",
        dateStrEn: "Day 3 (Gauri Aavahan - 9 Sep)",
        tithi: "श्री महालक्ष्मी / गौरी आवाहन",
        tithiEn: "Shri Mahalakshmi / Gauri Aavahan",
        hostWing: "J WING - पूर्वांचल (Purvanchal)",
        hostWingEn: "J Wing - Purvanchal",
        hostLead: "श्री. निलेश मोरे (फ्लॅट J-202)",
        hostLeadEn: "Mr. Nilesh More (Flat J-202)",
        morningTime: "सकाळी ०८:३० वाजता",
        morningTimeEn: "08:30 AM",
        eveningTime: "रात्री ०८:०० वाजता",
        eveningTimeEn: "08:00 PM",
        morningRitual: "श्री महालक्ष्मी / गौरी आवाहन व प्रभात आरती",
        morningRitualEn: "Gauri aavahan and morning aarti",
        eveningRitual: "संध्या महाआरती व महिला मंडळाचे पारंपरिक खेळ",
        eveningRitualEn: "Evening maha aarti and traditional games",
        specialPrasad: "रवा-नारळ लाडू",
        specialPrasadEn: "Rawa coconut laddu",
        cultural: "रात्री ८:३० महिला मंडळाचे पारंपारिक खेळ व संगीत खुर्ची",
        culturalEn: "8:30 PM Women's Wing Traditional Games & Musical Chairs",
        isCurrentDay: false
      },
      {
        dayNumber: 4,
        dateStr: "दिवस ४ (गौरी पूजन - १० सप्टेंबर)",
        dateStrEn: "Day 4 (Gauri Pujan - 10 Sep)",
        tithi: "गौरी पूजन व हळदी-कुंकू सोहळा",
        tithiEn: "Gauri Pujan & Haldi-Kunku Ceremony",
        hostWing: "K WING - गोवर्धन (Govardhan)",
        hostWingEn: "K Wing - Govardhan",
        hostLead: "श्री. गणेश जाधव (फ्लॅट K-603)",
        hostLeadEn: "Mr. Ganesh Jadhav (Flat K-603)",
        morningTime: "सकाळी ०८:३० वाजता",
        morningTimeEn: "08:30 AM",
        eveningTime: "रात्री ०८:०० वाजता",
        eveningTimeEn: "08:00 PM",
        morningRitual: "गौरी पूजन, काकड आरती व मोदक",
        morningRitualEn: "Gauri pujan and kakad aarti",
        eveningRitual: "भव्य धूपारती व बाल सांस्कृतिक कार्यक्रम",
        eveningRitualEn: "Grand dhupaarti and youth cultural show",
        specialPrasad: "गोड बुंदी व सुकामेवा",
        specialPrasadEn: "Sweet boondi & dry fruits",
        cultural: "सायंकाळी ५:०० महिला मंडळाचा भव्य हळदी-कुंकू सोहळा",
        culturalEn: "5:00 PM Grand Haldi-Kunku function for all society residents",
        isCurrentDay: false
      },
      {
        dayNumber: 5,
        dateStr: "दिवस ५ (विशेष आरती दिन - ११ सप्टेंबर)",
        dateStrEn: "Day 5 (Special Aarti Day - 11 Sep)",
        tithi: "गौरी विसर्जन व विशेष महापूजा",
        tithiEn: "Gauri Visarjan & Special Mahapooja",
        hostWing: "G WING - नंदादेवी (Nandadevi)",
        hostWingEn: "G Wing - Nandadevi",
        hostLead: "श्री. सतीश कांबळे (फ्लॅट G-101)",
        hostLeadEn: "Mr. Satish Kamble (Flat G-101)",
        morningTime: "सकाळी ०८:३० वाजता",
        morningTimeEn: "08:30 AM",
        eveningTime: "रात्री ०८:०० वाजता",
        eveningTimeEn: "08:00 PM",
        morningRitual: "प्रभात महाआरती व अथर्वशीर्ष पठण",
        morningRitualEn: "Morning aarti & Atharvashirsha chanting",
        eveningRitual: "धूप आरती व टाळ-मृदुंग संकीर्तन",
        eveningRitualEn: "Dhupaarti and community bhajan",
        specialPrasad: "पंचामृत व पेढे",
        specialPrasadEn: "Panchamrut & pedhe",
        cultural: "रात्री ८:३० स्थानिक भजनी मंडळाचे सुरेल भक्तिगीते गायन",
        culturalEn: "8:30 PM Devotional bhajan recital by local resident group",
        isCurrentDay: false
      },
      {
        dayNumber: 6,
        dateStr: "दिवस ६ (एकता भजन संध्या - १२ सप्टेंबर)",
        dateStrEn: "Day 6 (Unity Bhajan Sandhya - 12 Sep)",
        tithi: "एकता भजन संध्या व संकीर्तन",
        tithiEn: "Unity Bhajan Sandhya & Sankirtan",
        hostWing: "H WING - निलगिरी (Nilgiri)",
        hostWingEn: "H Wing - Nilgiri",
        hostLead: "श्री. राहुल गायकवाड (फ्लॅट H-405)",
        hostLeadEn: "Mr. Rahul Gaikwad (Flat H-405)",
        morningTime: "सकाळी ०८:३० वाजता",
        morningTimeEn: "08:30 AM",
        eveningTime: "रात्री ०८:०० वाजता",
        eveningTimeEn: "08:00 PM",
        morningRitual: "काकड आरती व श्री गणपती स्तोत्र",
        morningRitualEn: "Kakad aarti and Ganpati stotra",
        eveningRitual: "संध्या महाआरती व अखंड हरिनाम",
        eveningRitualEn: "Evening maha aarti & devotional songs",
        specialPrasad: "गूळ-खोबरे व लाडू",
        specialPrasadEn: "Jaggery coconut & laddu",
        cultural: "रात्री ८:३० टाळ-मृदुंग व ढोलकीच्या गजरात अखंड हरिनाम",
        culturalEn: "8:30 PM Taal-Mridang sankirtan and community chanting",
        isCurrentDay: false
      },
      {
        dayNumber: 7,
        dateStr: "दिवस ७ (सामूहिक सत्यविनायक पूजा - १३ सप्टेंबर)",
        dateStrEn: "Day 7 (Satyavinayak Pooja - 13 Sep)",
        tithi: "सामूहिक श्री सत्यविनायक महापूजा",
        tithiEn: "Community Shri Satyavinayak Mahapooja",
        hostWing: "J WING - पूर्वांचल (Purvanchal)",
        hostWingEn: "J Wing - Purvanchal",
        hostLead: "श्री. निलेश मोरे व पूर्वांचल रहिवासी",
        hostLeadEn: "Mr. Nilesh More & Purvanchal residents",
        morningTime: "सकाळी ०८:३० वाजता",
        morningTimeEn: "08:30 AM",
        eveningTime: "रात्री ०८:०० वाजता",
        eveningTimeEn: "08:00 PM",
        morningRitual: "सत्यविनायक महापूजा संकल्प व काकड आरती",
        morningRitualEn: "Satyavinayak mahapooja & morning aarti",
        eveningRitual: "धूप आरती व ज्येष्ठ नागरिक सन्मान सोहळा",
        eveningRitualEn: "Dhupaarti and senior citizen felicitation",
        specialPrasad: "सत्यनारायण शिरा प्रसाद",
        specialPrasadEn: "Satyavinayak sheera prasad",
        cultural: "रात्री ८:३० ज्येष्ठ नागरिक सन्मान व अनुभव कथन",
        culturalEn: "8:30 PM Senior citizen felicitation and life experience sharing",
        isCurrentDay: false
      },
      {
        dayNumber: 8,
        dateStr: "दिवस ८ (महिला मंडळ महाआरती - १४ सप्टेंबर)",
        dateStrEn: "Day 8 (Mahila Mandal Aarti - 14 Sep)",
        tithi: "महिला मंडळ विशेष महाआरती व युवा मंच",
        tithiEn: "Mahila Mandal Aarti & Youth Talent Night",
        hostWing: "K WING - गोवर्धन (Govardhan)",
        hostWingEn: "K Wing - Govardhan",
        hostLead: "श्रीमती सुनीता जाधव व महिला मंच",
        hostLeadEn: "Mrs. Sunita Jadhav & Women's Wing",
        morningTime: "सकाळी ०८:३० वाजता",
        morningTimeEn: "08:30 AM",
        eveningTime: "रात्री ०८:०० वाजता",
        eveningTimeEn: "08:00 PM",
        morningRitual: "प्रभात आरती व श्री सूक्त पठण",
        morningRitualEn: "Morning aarti & Shri Sukta recitation",
        eveningRitual: "संध्या महाआरती व मंत्रपुष्पांजली",
        eveningRitualEn: "Evening maha aarti & sacred mantras",
        specialPrasad: "केसर पेढा व खिरीचा प्रसाद",
        specialPrasadEn: "Kesar pedha & kheer prasad",
        cultural: "सायंकाळी ६:०० सोसायटीच्या मुलांचे फॅन्सी ड्रेस व नृत्य",
        culturalEn: "6:00 PM Society Children Fancy Dress & Cultural Dance",
        isCurrentDay: false
      },
      {
        dayNumber: 9,
        dateStr: "दिवस ९ (भव्य दीपोत्सव - १५ सप्टेंबर)",
        dateStrEn: "Day 9 (Grand Deepotsav - 15 Sep)",
        tithi: "भव्य दीपोत्सव व गुणगौरव सोहळा",
        tithiEn: "Grand Deepotsav & Student Felicitation",
        hostWing: "G & H WING संयुक्त यजमान (नंदादेवी व निलगिरी)",
        hostWingEn: "G & H Joint Host (Nandadevi & Nilgiri)",
        hostLead: "श्री. सचिन पाटील व श्री. विजय पवार",
        hostLeadEn: "Mr. Sachin Patil & Mr. Vijay Pawar",
        morningTime: "सकाळी ०८:३० वाजता",
        morningTimeEn: "08:30 AM",
        eveningTime: "रात्री ०८:०० वाजता",
        eveningTimeEn: "08:00 PM",
        morningRitual: "प्रभात महाआरती व मोदक नैवेद्य",
        morningRitualEn: "Morning maha aarti & modak offering",
        eveningRitual: "भव्य दीप प्रज्वलन व धूप आरती",
        eveningRitualEn: "Grand diya lighting & evening dhupaarti",
        specialPrasad: "काजू कतली व बदाम लाडू",
        specialPrasadEn: "Kaju katli & almond laddu",
        cultural: "रात्री ८:३० १०वी व १२वी गुणवंत विद्यार्थ्यांचा सत्कार सोहळा",
        culturalEn: "8:30 PM SSC & HSC Meritorious Students Felicitation",
        isCurrentDay: false
      },
      {
        dayNumber: 10,
        dateStr: "दिवस १० (सांगता महाआरती - १६ सप्टेंबर)",
        dateStrEn: "Day 10 (Concluding Maha Aarti - 16 Sep)",
        tithi: "श्री अनंत चतुर्दशी (सांगता महाआरती)",
        tithiEn: "Anant Chaturdashi (Concluding Maha Aarti)",
        hostWing: "सर्व ४ इमारती संयुक्त (G • H • J • K WINGS)",
        hostWingEn: "All 4 Buildings Joint (G, H, J, K)",
        hostLead: "समस्त म्हाडा टॉवर्स सोसायटी परिवार",
        hostLeadEn: "All MHADA Towers Society Residents",
        morningTime: "सकाळी ०८:३० वाजता",
        morningTimeEn: "08:30 AM",
        eveningTime: "रात्री ०८:०० वाजता",
        eveningTimeEn: "08:00 PM",
        morningRitual: "उत्तरपूजा संकल्प व प्रभात महाआरती",
        morningRitualEn: "Uttarpooja and morning maha aarti",
        eveningRitual: "सांगता महाआरती, मंत्रपुष्पांजली व जयघोष",
        eveningRitualEn: "Final concluding maha aarti and sacred chants",
        specialPrasad: "महाप्रसाद मोदक व नारळ",
        specialPrasadEn: "Special modak and fresh coconut",
        cultural: "रात्री ८:०० सांगता महाआरती, आभार प्रदर्शन व बाप्पांचा जयघोष",
        culturalEn: "8:00 PM Concluding maha aarti, vote of thanks & Bappa slogans",
        isCurrentDay: false
      }
    ]
  },
  mandalInfo: {
    type: mandalInfoSchema,
    default: () => ({})
  },
  festivalScheduleCard: {
    type: festivalScheduleCardSchema,
    default: () => ({})
  },
  dailyAartiSection: {
    type: dailyAartiSectionSchema,
    default: () => ({})
  },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const TabConfig = mongoose.model("TabConfig", tabConfigSchema);
export default TabConfig;
