import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import FestivalEvent from "../models/FestivalEvent.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
import { isDatabaseConnected } from "../config/db.js";
import localStore from "../config/localStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");

const router = express.Router();

// Helper to parse IST Date Time into Date object
const parseISTDateTime = (dateStr, timeStr, defaultTime = "09:00") => {
  if (!dateStr) return null;
  const time = (timeStr || defaultTime).trim();
  
  let hours = 9;
  let minutes = 0;
  
  // Try 12-hour AM/PM format (e.g., "08:30 AM", "3:30 PM", "संध्या. 06:00")
  const ampmMatch = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/);
  if (ampmMatch) {
    hours = parseInt(ampmMatch[1], 10);
    minutes = parseInt(ampmMatch[2], 10);
    const ampm = (ampmMatch[3] || "").toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  }

  const pad = (n) => String(n).padStart(2, "0");
  const isoTime = `${pad(hours)}:${pad(minutes)}:00+05:30`;

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T${isoTime}`);
  }
  return null;
};

// Helper to format human readable date string from YYYY-MM-DD
const formatHumanDates = (dateIso) => {
  if (!dateIso || !/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) {
    return { dateStr: "", dateStrEn: "" };
  }
  const [year, month, day] = dateIso.split("-").map(Number);
  const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthNamesMr = ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"];
  
  const mIndex = month - 1;
  const dateStrEn = `${day} ${monthNamesEn[mIndex]} ${year}`;
  const dateStr = `${day} ${monthNamesMr[mIndex]} ${year}`;
  return { dateStr, dateStrEn };
};

// Helper to format 24h time into 12h readable time
const formatHumanTime = (timeStr) => {
  if (!timeStr) return "";
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeStr;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  const padH = String(h).padStart(2, "0");
  return `${padH}:${m} ${ampm}`;
};

// Helper to sanitize and normalize event payload
const normalizeEventPayload = (body) => {
  const titleMr = (body.titleMr || body.titleEn || "").trim();
  const titleEn = (body.titleEn || body.titleMr || "").trim();
  
  let startDate = (body.startDate || "").trim();
  let startTime = (body.startTime || "").trim();
  let endDate = (body.endDate || startDate || "").trim();
  let endTime = (body.endTime || "").trim();

  let { dateStr, dateStrEn } = formatHumanDates(startDate);
  if (body.dateStr) dateStr = body.dateStr.trim();
  if (body.dateStrEn) dateStrEn = body.dateStrEn.trim();
  if (!dateStr && dateStrEn) dateStr = dateStrEn;
  if (!dateStr) dateStr = "दररोज (Daily)";

  let time = (body.time || "").trim();
  if (!time && startTime) {
    time = formatHumanTime(startTime);
    if (endTime) {
      time = `${time} - ${formatHumanTime(endTime)}`;
    }
  }
  if (!time) time = "सकाळी ०८:३० वाजता";

  const startDateTime = parseISTDateTime(startDate, startTime, "08:30");
  const endDateTime = parseISTDateTime(endDate || startDate, endTime || startTime, "21:00");

  const hostWing = (body.hostWing || body.targetAudience || "सर्व विंग्ज (G, H, J, K)").trim();
  const hostWingEn = (body.hostWingEn || body.targetAudienceEn || "All Wings (G, H, J, K)").trim();

  return {
    category: body.category || "cultural",
    categoryEn: body.categoryEn || "",
    eventType: body.eventType === "yearly" ? "yearly" : "festival",
    titleMr,
    titleEn,
    startDate,
    startTime,
    endDate,
    endTime,
    startDateTime,
    endDateTime,
    time,
    dateStr,
    dateStrEn: dateStrEn || dateStr,
    dayNumber: Number(body.dayNumber) || 1,
    venue: (body.venue || "मुख्य मंडप, म्हाडा टॉवर्स").trim(),
    venueEn: (body.venueEn || "Main Pandal, MHADA Towers").trim(),
    hostWing,
    hostWingEn,
    targetAudience: hostWing,
    targetAudienceEn: hostWingEn,
    descriptionMr: (body.descriptionMr || "").trim(),
    descriptionEn: (body.descriptionEn || "").trim(),
    isHighlight: Boolean(body.isHighlight),
    imageUrl: (body.imageUrl || "").trim(),
    isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
    status: body.status || "upcoming",
    order: Number(body.order) || 0
  };
};

// GET all events (public)
router.get("/", async (req, res) => {
  try {
    const { category, day, eventType, includeUnpublished } = req.query;

    if (isDatabaseConnected()) {
      try {
        let filter = {};
        if (includeUnpublished !== "true") {
          filter.isPublished = { $ne: false };
        }
        if (category && category !== "all") {
          filter.category = category;
        }
        if (day && day !== "all") {
          filter.dayNumber = Number(day);
        }
        if (eventType && eventType !== "all") {
          filter.eventType = eventType;
        }

        const events = await FestivalEvent.find(filter).sort({ startDateTime: 1, dayNumber: 1, order: 1, createdAt: -1 });
        return res.json({ success: true, count: events.length, data: events });
      } catch (dbErr) {
        console.warn("[Events] Mongo fetch failed, using localStore:", dbErr.message);
      }
    }

    const filterObj = { category, day, eventType };
    if (includeUnpublished !== "true") {
      filterObj.isPublished = true;
    }

    const events = localStore.getEvents(filterObj);
    return res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    console.error("[Events] Error fetching events:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
});

// Admin: Create Event
router.post("/", protectAdmin, async (req, res) => {
  try {
    const { titleMr, titleEn, startDate, dateStr, time, startTime } = req.body;

    if (!titleMr && !titleEn) {
      return res.status(400).json({
        success: false,
        message: "कार्यक्रमाचे शीर्षक आवश्यक आहे (Event title is required)"
      });
    }

    if (!startDate && !dateStr) {
      return res.status(400).json({
        success: false,
        message: "कार्यक्रमाचा दिनांक किंवा तारीख आवश्यक आहे (Event date is required)"
      });
    }

    const eventPayload = normalizeEventPayload(req.body);

    if (isDatabaseConnected()) {
      try {
        const event = new FestivalEvent(eventPayload);
        await event.save();
        return res.status(201).json({ success: true, message: "Event created successfully", data: event });
      } catch (dbErr) {
        console.warn("[Events] Mongo create failed, falling back to localStore:", dbErr.message);
      }
    }

    const ev = localStore.createEvent(eventPayload);
    return res.status(201).json({ success: true, message: "Event created successfully", data: ev });
  } catch (error) {
    console.error("[Events] Create error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create event" });
  }
});

// Admin: Bulk Import Events
router.post("/bulk", protectAdmin, async (req, res) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, message: "No events provided for import" });
    }

    const validEvents = events
      .filter((ev) => ev.titleMr || ev.titleEn)
      .map(normalizeEventPayload);

    if (validEvents.length === 0) {
      return res.status(400).json({ success: false, message: "No valid events found in import" });
    }

    if (isDatabaseConnected()) {
      try {
        const inserted = await FestivalEvent.insertMany(validEvents);
        return res.status(201).json({
          success: true,
          message: `Successfully imported ${inserted.length} events from file`,
          count: inserted.length,
          data: inserted
        });
      } catch (dbErr) {
        console.warn("[Events] Mongo bulk insert failed, using localStore:", dbErr.message);
      }
    }

    const created = validEvents.map(e => localStore.createEvent(e));
    return res.status(201).json({
      success: true,
      message: `Successfully imported ${created.length} events from file`,
      count: created.length,
      data: created
    });
  } catch (error) {
    console.error("[Events] Bulk import error:", error.message);
    res.status(500).json({ success: false, message: "Failed to bulk import events" });
  }
});

// Admin: Update Event
router.put("/:id", protectAdmin, async (req, res) => {
  try {
    const eventPayload = normalizeEventPayload(req.body);

    if (isDatabaseConnected()) {
      try {
        const event = await FestivalEvent.findById(req.params.id);
        if (event) {
          Object.assign(event, eventPayload);
          await event.save();
          return res.json({ success: true, message: "Event updated successfully", data: event });
        }
      } catch (dbErr) {
        console.warn("[Events] Mongo update failed, using localStore:", dbErr.message);
      }
    }

    const updated = localStore.updateEvent(req.params.id, eventPayload);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    return res.json({ success: true, message: "Event updated successfully", data: updated });
  } catch (error) {
    console.error("[Events] Update error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update event" });
  }
});

// Admin: Delete Event
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    let existingEvent = null;

    if (isDatabaseConnected()) {
      try {
        existingEvent = await FestivalEvent.findById(req.params.id);
        if (existingEvent) {
          await FestivalEvent.findByIdAndDelete(req.params.id);
        }
      } catch (dbErr) {
        console.warn("[Events] Mongo delete failed, using localStore:", dbErr.message);
      }
    }

    if (!existingEvent && localStore.data?.events) {
      existingEvent = localStore.data.events.find(e => String(e._id) === String(req.params.id));
      localStore.deleteEvent(req.params.id);
    }

    if (!existingEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Safely delete associated image if present in local uploads
    if (existingEvent.imageUrl && existingEvent.imageUrl.startsWith("/uploads/")) {
      const filename = path.basename(existingEvent.imageUrl);
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn("[Events] Could not delete image file:", e.message);
        }
      }
    }

    return res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("[Events] Delete error:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete event" });
  }
});

export default router;
