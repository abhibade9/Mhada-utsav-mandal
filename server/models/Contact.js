import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  nameMr: { type: String, required: true },
  nameEn: { type: String, default: "" },
  roleMr: { type: String, required: true },
  roleEn: { type: String, default: "" },
  wing: { type: String, default: "सर्व विंग्ज" },
  phone: { type: String, default: "" },
  type: {
    type: String,
    enum: ["committee", "emergency", "wing_lead", "security"],
    default: "committee"
  },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
