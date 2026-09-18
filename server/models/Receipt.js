import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
  {
    receiptNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    residentName: {
      type: String,
      required: true,
      trim: true
    },
    flatNo: {
      type: String,
      required: true,
      trim: true
    },
    building: {
      type: String,
      required: true,
      trim: true
    },
    purpose: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be a positive number"]
    },
    amountInWords: {
      type: String,
      default: "",
      trim: true
    },
    paymentDate: {
      type: String,
      required: true,
      trim: true
    },
    paymentMode: {
      type: String,
      default: "UPI",
      trim: true
    },
    transactionRef: {
      type: String,
      default: "",
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    notes: {
      type: String,
      default: "",
      trim: true
    },
    sachivSignatureUrl: {
      type: String,
      default: "",
      trim: true
    },
    createdBy: {
      type: String,
      default: "म्हाडा उत्सव समिती अध्यक्ष (Admin)",
      trim: true
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },
    archivedAt: {
      type: Date,
      default: null
    },
    archivedBy: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Receipt = mongoose.models.Receipt || mongoose.model("Receipt", receiptSchema);

export default Receipt;
