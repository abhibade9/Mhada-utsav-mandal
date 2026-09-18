import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    wing: {
      type: String,
      required: true,
      trim: true,
    },
    flatNo: {
      type: String,
      required: true,
      trim: true,
    },
    volunteerArea: {
      type: String,
      required: true,
      trim: true,
    },
    availability: {
      type: String,
      required: true,
      trim: true,
    },
    preferredDates: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["New", "Reviewed", "Contacted", "Accepted", "Rejected", "Closed"],
      default: "New",
    },
    emailStatus: {
      type: String,
      enum: ["Not Sent", "Sent"],
      default: "Not Sent",
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    emailRecipient: {
      type: String,
      default: "",
    },
    emailSubject: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Volunteer = mongoose.model("Volunteer", volunteerSchema);

export default Volunteer;
