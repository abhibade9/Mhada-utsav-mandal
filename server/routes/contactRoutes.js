import express from "express";
import Contact from "../models/Contact.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
import { isDatabaseConnected } from "../config/db.js";
import localStore from "../config/localStore.js";

const router = express.Router();

// GET all contacts (public)
router.get("/", async (req, res) => {
  try {
    const { type, wing } = req.query;

    if (isDatabaseConnected()) {
      try {
        let filter = {};
        if (type && type !== "all") {
          filter.type = type;
        }
        if (wing && wing !== "all") {
          filter.wing = { $regex: wing, $options: "i" };
        }

        const contacts = await Contact.find(filter).sort({ order: 1, type: 1 });
        return res.json({ success: true, count: contacts.length, data: contacts });
      } catch (dbErr) {
        console.warn("[Contacts] Mongo fetch failed, using localStore:", dbErr.message);
      }
    }

    const contacts = localStore.getContacts({ type, wing });
    return res.json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    console.error("[Contacts] Error fetching:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch contacts" });
  }
});

// Admin: Create contact
router.post("/", protectAdmin, async (req, res) => {
  try {
    const { nameMr, nameEn, roleMr, roleEn, wing, phone, type, order } = req.body;
    if (!nameMr || !roleMr) {
      return res.status(400).json({ success: false, message: "नाव आणि पद आवश्यक आहे" });
    }

    const contactPayload = {
      nameMr,
      nameEn: nameEn || "",
      roleMr,
      roleEn: roleEn || "",
      wing: wing || "सर्व विंग्ज",
      phone: phone || "",
      type: type || "committee",
      order: order || 0
    };

    if (isDatabaseConnected()) {
      try {
        const contact = new Contact(contactPayload);
        await contact.save();
        return res.status(201).json({ success: true, message: "Contact created", data: contact });
      } catch (dbErr) {
        console.warn("[Contacts] Mongo create failed, using localStore:", dbErr.message);
      }
    }

    const c = localStore.createContact(contactPayload);
    return res.status(201).json({ success: true, message: "Contact created", data: c });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create contact" });
  }
});

// Admin: Update contact
router.put("/:id", protectAdmin, async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      try {
        const contact = await Contact.findById(req.params.id);
        if (contact) {
          Object.assign(contact, req.body);
          await contact.save();
          return res.json({ success: true, message: "Contact updated", data: contact });
        }
      } catch (dbErr) {
        console.warn("[Contacts] Mongo update failed, using localStore:", dbErr.message);
      }
    }

    const updated = localStore.updateContact(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    return res.json({ success: true, message: "Contact updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update contact" });
  }
});

// Admin: Delete contact
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (contact) {
          return res.json({ success: true, message: "Contact deleted successfully" });
        }
      } catch (dbErr) {
        console.warn("[Contacts] Mongo delete failed, using localStore:", dbErr.message);
      }
    }

    const deleted = localStore.deleteContact(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    return res.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete contact" });
  }
});

export default router;
