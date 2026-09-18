import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  titleMr: { type: String, required: true },
  titleEn: { type: String, default: "" },
  descriptionMr: { type: String, required: true },
  descriptionEn: { type: String, default: "" },
  category: {
    type: String,
    enum: ["aarti", "arrival", "cultural", "prasad", "visarjan", "general", "urgent", "owners"],
    default: "general"
  },
  priority: {
    type: String,
    enum: ["high", "medium", "normal"],
    default: "normal"
  },
  isPinned: { type: Boolean, default: false },
  targetWings: {
    type: [String],
    default: ["All", "G", "H", "I", "J", "K"]
  },
  badgeText: { type: String, default: "नवीन सूचना (New)" },
  date: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;
