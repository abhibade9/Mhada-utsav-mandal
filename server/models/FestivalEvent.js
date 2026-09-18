import mongoose from "mongoose";

const festivalEventSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    default: "cultural"
  },
  categoryEn: {
    type: String,
    default: ""
  },
  eventType: {
    type: String,
    enum: ["festival", "yearly"],
    default: "festival"
  },
  titleMr: { type: String, required: true },
  titleEn: { type: String, default: "" },
  time: { type: String, required: true },
  dateStr: { type: String, required: true },
  dateStrEn: { type: String, default: "" },
  dayNumber: { type: Number, default: 1 },
  venue: { type: String, default: "मुख्य मंडप, म्हाडा टॉवर्स प्रांगण" },
  venueEn: { type: String, default: "" },
  hostWing: { type: String, default: "सर्व विंग्ज (G, H, J, K)" },
  hostWingEn: { type: String, default: "" },
  descriptionMr: { type: String, default: "" },
  descriptionEn: { type: String, default: "" },
  isHighlight: { type: Boolean, default: false },
  imageUrl: { type: String, default: "" },
  startDate: { type: String, default: "" },
  startTime: { type: String, default: "" },
  endDate: { type: String, default: "" },
  endTime: { type: String, default: "" },
  startDateTime: { type: Date },
  endDateTime: { type: Date },
  targetAudience: { type: String, default: "सर्व विंग्ज (G, H, J, K)" },
  targetAudienceEn: { type: String, default: "All Wings (G, H, J, K)" },
  isPublished: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ["upcoming", "live", "completed"],
    default: "upcoming"
  },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

const FestivalEvent = mongoose.model("FestivalEvent", festivalEventSchema);
export default FestivalEvent;
