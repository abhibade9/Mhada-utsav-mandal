import express from "express";
import Announcement from "../models/Announcement.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
import { isDatabaseConnected } from "../config/db.js";
import localStore from "../config/localStore.js";

const router = express.Router();

// GET all active announcements (public)
router.get("/", async (req, res) => {
  try {
    const { category, wing } = req.query;

    if (isDatabaseConnected()) {
      try {
        let filter = { isActive: true };
        if (category && category !== "all") {
          filter.category = category;
        }
        if (wing && wing !== "All") {
          filter.targetWings = { $in: [wing, "All"] };
        }

        const announcements = await Announcement.find(filter).sort({ isPinned: -1, createdAt: -1 });
        return res.json({ success: true, count: announcements.length, data: announcements });
      } catch (dbErr) {
        console.warn("[Announcements] Mongo fetch failed, using localStore:", dbErr.message);
      }
    }

    const announcements = localStore.getAnnouncements({ isActive: true, category, wing });
    return res.json({ success: true, count: announcements.length, data: announcements });
  } catch (error) {
    console.error("[Announcements] Error fetching:", error.message);
    res.status(500).json({ success: false, message: "Error loading announcements" });
  }
});

// Admin: GET all announcements including inactive
router.get("/admin/all", protectAdmin, async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      try {
        const announcements = await Announcement.find().sort({ isPinned: -1, createdAt: -1 });
        return res.json({ success: true, count: announcements.length, data: announcements });
      } catch (dbErr) {
        console.warn("[Announcements] Mongo admin fetch failed, using localStore:", dbErr.message);
      }
    }

    const announcements = localStore.getAnnouncements();
    return res.json({ success: true, count: announcements.length, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading admin announcements" });
  }
});

// Admin: Create announcement
router.post("/", protectAdmin, async (req, res) => {
  try {
    const { titleMr, titleEn, descriptionMr, descriptionEn, category, priority, isPinned, targetWings, badgeText } = req.body;

    if (!titleMr || !descriptionMr) {
      return res.status(400).json({ success: false, message: "मराठी शीर्षक व माहिती आवश्यक आहे (Marathi title and description required)" });
    }

    if (isDatabaseConnected()) {
      try {
        const announcement = new Announcement({
          titleMr,
          titleEn: titleEn || "",
          descriptionMr,
          descriptionEn: descriptionEn || "",
          category: category || "general",
          priority: priority || "normal",
          isPinned: isPinned || false,
          targetWings: targetWings || ["All"],
          badgeText: badgeText || "नवीन सूचना"
        });

        await announcement.save();
        return res.status(201).json({ success: true, message: "Announcement created", data: announcement });
      } catch (dbErr) {
        console.warn("[Announcements] Mongo create failed, using localStore:", dbErr.message);
      }
    }

    const ann = localStore.createAnnouncement({
      titleMr,
      titleEn: titleEn || "",
      descriptionMr,
      descriptionEn: descriptionEn || "",
      category: category || "general",
      priority: priority || "normal",
      isPinned: isPinned || false,
      targetWings: targetWings || ["All"],
      badgeText: badgeText || "नवीन सूचना"
    });
    return res.status(201).json({ success: true, message: "Announcement created", data: ann });
  } catch (error) {
    console.error("[Announcements] Create error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create announcement" });
  }
});

// Admin: Update announcement
router.put("/:id", protectAdmin, async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      try {
        const announcement = await Announcement.findById(req.params.id);
        if (announcement) {
          Object.assign(announcement, req.body);
          await announcement.save();
          return res.json({ success: true, message: "Announcement updated", data: announcement });
        }
      } catch (dbErr) {
        console.warn("[Announcements] Mongo update failed, using localStore:", dbErr.message);
      }
    }

    const updated = localStore.updateAnnouncement(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    return res.json({ success: true, message: "Announcement updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update announcement" });
  }
});

// Admin: Delete announcement
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (announcement) {
          return res.json({ success: true, message: "Announcement deleted successfully" });
        }
      } catch (dbErr) {
        console.warn("[Announcements] Mongo delete failed, using localStore:", dbErr.message);
      }
    }

    const deleted = localStore.deleteAnnouncement(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    return res.json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete announcement" });
  }
});

export default router;
