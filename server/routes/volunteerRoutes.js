import express from "express";
import Volunteer from "../models/Volunteer.js";
import TabConfig from "../models/TabConfig.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
import { isDatabaseConnected } from "../config/db.js";
import localStore from "../config/localStore.js";
import emailService from "../services/emailService.js";

const router = express.Router();

const VALID_STATUSES = ["New", "Reviewed", "Contacted", "Accepted", "Rejected", "Closed"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper to fetch current config
const getCurrentConfig = async () => {
  if (isDatabaseConnected()) {
    try {
      const cfg = await TabConfig.findOne();
      if (cfg) return cfg;
    } catch (err) {
      console.warn("[VolunteerRoutes] Mongo config fetch failed, checking localStore:", err.message);
    }
  }
  return localStore.getConfig();
};

/**
 * 1. POST /api/volunteers (Public submission)
 * Saves volunteer registration securely.
 * Enforces admin ON/OFF visibility setting.
 * STRICT: Does NOT trigger an email automatically.
 */
router.post("/", async (req, res) => {
  try {
    const config = await getCurrentConfig();

    // Check if Volunteer feature is enabled by admin
    const isVolunteerEnabled =
      config?.tabs?.volunteer?.enabled !== false && config?.volunteerSeva?.active !== false;

    if (!isVolunteerEnabled) {
      return res.status(403).json({
        success: false,
        message: "स्वयंसेवक नोंदणी सध्या बंद आहे. (Volunteer registration is currently closed by the committee.)"
      });
    }

    const {
      fullName,
      mobile,
      email,
      wing,
      flatNo,
      volunteerArea,
      availability,
      preferredDates,
      message
    } = req.body;

    // Validation
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return res.status(400).json({ success: false, message: "कृपया पूर्ण नाव प्रविष्ट करा (Full name is required)." });
    }

    const cleanMobile = String(mobile || "").replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length < 10) {
      return res.status(400).json({
        success: false,
        message: "कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा (Valid 10-digit mobile number is required)."
      });
    }

    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "कृपया वैध ईमेल पत्ता प्रविष्ट करा (Valid email address is required)."
      });
    }

    if (!wing || !String(wing).trim()) {
      return res.status(400).json({ success: false, message: "कृपया इमारत / विंग निवडा (Building/Wing is required)." });
    }

    if (!flatNo || !String(flatNo).trim()) {
      return res.status(400).json({ success: false, message: "कृपया फ्लॅट नंबर प्रविष्ट करा (Flat number is required)." });
    }

    if (!volunteerArea || !String(volunteerArea).trim()) {
      return res.status(400).json({
        success: false,
        message: "कृपया इच्छित स्वयंसेवक सेवा निवडा (Preferred volunteer area is required)."
      });
    }

    if (!availability || !String(availability).trim()) {
      return res.status(400).json({
        success: false,
        message: "कृपया उपलब्ध वेळ / दिवस निवडा (Availability is required)."
      });
    }

    const payload = {
      fullName: fullName.trim(),
      mobile: cleanMobile,
      email: cleanEmail,
      wing: String(wing).trim(),
      flatNo: String(flatNo).trim(),
      volunteerArea: String(volunteerArea).trim(),
      availability: String(availability).trim(),
      preferredDates: String(preferredDates || "").trim(),
      message: String(message || "").trim(),
      status: "New",
      emailStatus: "Not Sent",
      emailSentAt: null,
      emailRecipient: "",
      emailSubject: ""
    };

    let createdId = null;

    if (isDatabaseConnected()) {
      try {
        const volunteer = new Volunteer(payload);
        await volunteer.save();
        createdId = volunteer._id;
        return res.status(201).json({
          success: true,
          message: "आपली स्वयंसेवक नोंदणी यशस्वीरीत्या प्राप्त झाली आहे. मंडळ समन्वयक लवकरच आपल्याशी संपर्क साधतील.",
          messageEn: "Your volunteer registration has been received successfully. Mandal coordinators will contact you soon.",
          data: { id: createdId }
        });
      } catch (dbErr) {
        console.warn("[Volunteers] Mongo create failed, falling back to localStore:", dbErr.message);
      }
    }

    const localV = localStore.createVolunteer(payload);
    return res.status(201).json({
      success: true,
      message: "आपली स्वयंसेवक नोंदणी यशस्वीरीत्या प्राप्त झाली आहे. मंडळ समन्वयक लवकरच आपल्याशी संपर्क साधतील.",
      messageEn: "Your volunteer registration has been received successfully. Mandal coordinators will contact you soon.",
      data: { id: localV._id }
    });
  } catch (error) {
    console.error("[Volunteers] Error during registration submission:", error.message);
    res.status(500).json({
      success: false,
      message: "नोंदणी करताना तांत्रिक अडचण आली. कृपया थोड्या वेळाने प्रयत्न करा."
    });
  }
});

/**
 * 2. GET /api/volunteers (Admin only)
 * Retrieve volunteer submissions with search & filtering.
 */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const { search, status, wing, volunteerArea, emailStatus } = req.query;

    if (isDatabaseConnected()) {
      try {
        let filter = {};

        if (status && status !== "all") {
          filter.status = status;
        }
        if (wing && wing !== "all") {
          filter.wing = { $regex: wing, $options: "i" };
        }
        if (volunteerArea && volunteerArea !== "all") {
          filter.volunteerArea = { $regex: volunteerArea, $options: "i" };
        }
        if (emailStatus && emailStatus !== "all") {
          filter.emailStatus = emailStatus;
        }
        if (search && search.trim()) {
          const q = search.trim();
          filter.$or = [
            { fullName: { $regex: q, $options: "i" } },
            { mobile: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { flatNo: { $regex: q, $options: "i" } },
            { message: { $regex: q, $options: "i" } }
          ];
        }

        const list = await Volunteer.find(filter).sort({ createdAt: -1 });
        return res.json({ success: true, count: list.length, data: list });
      } catch (dbErr) {
        console.warn("[Volunteers] Mongo fetch failed, using localStore:", dbErr.message);
      }
    }

    const list = localStore.getVolunteers({ search, status, wing, volunteerArea, emailStatus });
    return res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error("[Volunteers] Error fetching list:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch volunteer requests" });
  }
});

/**
 * 3. GET /api/volunteers/:id (Admin only)
 * Retrieve single submission by ID with complete details.
 */
router.get("/:id", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (isDatabaseConnected()) {
      try {
        const v = await Volunteer.findById(id);
        if (v) return res.json({ success: true, data: v });
      } catch (dbErr) {
        console.warn("[Volunteers] Mongo findById failed, checking localStore:", dbErr.message);
      }
    }

    const v = localStore.getVolunteerById(id);
    if (!v) {
      return res.status(404).json({ success: false, message: "Volunteer submission not found" });
    }
    return res.json({ success: true, data: v });
  } catch (error) {
    console.error("[Volunteers] Error fetching submission:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve submission" });
  }
});

/**
 * 4. PUT /api/volunteers/:id/status (Admin only)
 * Update status of a submission.
 * STRICT: Does NOT send an email automatically.
 */
router.put("/:id/status", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
      });
    }

    if (isDatabaseConnected()) {
      try {
        const v = await Volunteer.findByIdAndUpdate(
          id,
          { status, updatedAt: new Date() },
          { new: true }
        );
        if (v) {
          return res.json({
            success: true,
            message: "Volunteer status updated successfully",
            data: v
          });
        }
      } catch (dbErr) {
        console.warn("[Volunteers] Mongo status update failed, checking localStore:", dbErr.message);
      }
    }

    const updated = localStore.updateVolunteerStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Volunteer submission not found" });
    }

    return res.json({
      success: true,
      message: "Volunteer status updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("[Volunteers] Error updating status:", error.message);
    res.status(500).json({ success: false, message: "Failed to update volunteer status" });
  }
});

/**
 * 5. POST /api/volunteers/:id/send-email (Admin only)
 * Dispatches thank-you email ONLY upon explicit admin confirmation.
 * Accepts customized recipient, subject, and body text.
 * Prevents accidental duplicates unless forceResend is specified.
 */
router.post("/:id/send-email", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { recipientEmail, subject, messageBody, forceResend } = req.body;

    if (!recipientEmail || !EMAIL_REGEX.test(recipientEmail.trim())) {
      return res.status(400).json({ success: false, message: "A valid recipient email address is required." });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: "Email subject is required." });
    }

    if (!messageBody || !messageBody.trim()) {
      return res.status(400).json({ success: false, message: "Email message body is required." });
    }

    // Find submission
    let volunteer = null;
    if (isDatabaseConnected()) {
      try {
        volunteer = await Volunteer.findById(id);
      } catch (dbErr) {
        console.warn("[Volunteers] Mongo lookup failed, checking localStore:", dbErr.message);
      }
    }
    if (!volunteer) {
      volunteer = localStore.getVolunteerById(id);
    }

    if (!volunteer) {
      return res.status(404).json({ success: false, message: "Volunteer submission not found" });
    }

    // Duplicate check
    if (volunteer.emailStatus === "Sent" && !forceResend) {
      return res.status(400).json({
        success: false,
        alreadySent: true,
        message: "This volunteer has already received a thank-you email.",
        sentAt: volunteer.emailSentAt,
        recipient: volunteer.emailRecipient
      });
    }

    // Send email via isolated email service
    try {
      const emailResult = await emailService.sendEmail({
        to: recipientEmail.trim(),
        subject: subject.trim(),
        text: messageBody.trim()
      });

      const now = new Date();
      const meta = {
        recipient: recipientEmail.trim(),
        subject: subject.trim(),
        sentAt: now
      };

      if (isDatabaseConnected()) {
        try {
          volunteer = await Volunteer.findByIdAndUpdate(
            id,
            {
              emailStatus: "Sent",
              emailSentAt: now,
              emailRecipient: meta.recipient,
              emailSubject: meta.subject,
              updatedAt: now
            },
            { new: true }
          );
        } catch (dbErr) {
          console.warn("[Volunteers] Mongo email status save failed:", dbErr.message);
        }
      }

      const updatedLocal = localStore.updateVolunteerEmail(id, meta);

      return res.json({
        success: true,
        message: "Email sent successfully.",
        simulated: Boolean(emailResult.simulated),
        data: volunteer || updatedLocal
      });
    } catch (mailErr) {
      console.error("[Volunteers] Email sending failed:", mailErr.message);
      return res.status(500).json({
        success: false,
        message: `Email could not be sent: ${mailErr.message}`
      });
    }
  } catch (error) {
    console.error("[Volunteers] Error sending email:", error.message);
    res.status(500).json({ success: false, message: "Server error while sending email" });
  }
});

/**
 * 6. DELETE /api/volunteers/:id (Admin only)
 * Deletes a volunteer submission.
 */
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (isDatabaseConnected()) {
      try {
        const deleted = await Volunteer.findByIdAndDelete(id);
        if (deleted) {
          return res.json({ success: true, message: "Volunteer request deleted successfully." });
        }
      } catch (dbErr) {
        console.warn("[Volunteers] Mongo delete failed, falling back to localStore:", dbErr.message);
      }
    }

    const ok = localStore.deleteVolunteer(id);
    if (!ok) {
      return res.status(404).json({ success: false, message: "Volunteer submission not found" });
    }

    return res.json({ success: true, message: "Volunteer request deleted successfully." });
  } catch (error) {
    console.error("[Volunteers] Error deleting submission:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete volunteer request" });
  }
});

export default router;
