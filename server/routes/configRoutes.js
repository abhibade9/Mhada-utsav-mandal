import express from "express";
import TabConfig from "../models/TabConfig.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
import { isDatabaseConnected } from "../config/db.js";
import localStore from "../config/localStore.js";

const router = express.Router();

// GET Public Config
router.get("/", async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (!config) {
          config = new TabConfig();
          await config.save();
        }
        return res.json({ success: true, config });
      } catch (dbErr) {
        console.warn("[Config] Mongo fetch failed, falling back to localStore:", dbErr.message);
      }
    }

    const config = localStore.getConfig();
    return res.json({ success: true, config });
  } catch (error) {
    console.error("[Config] Error fetching config:", error.message);
    res.status(500).json({ success: false, message: "Error fetching configuration" });
  }
});

// Admin updates Tab Approvals / Screen Visibility
router.put("/tabs", protectAdmin, async (req, res) => {
  try {
    const { tabs } = req.body;

    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (!config) config = new TabConfig();

        if (tabs) {
          config.tabs = { ...(config.tabs?.toObject ? config.tabs.toObject() : config.tabs), ...tabs };
          config.markModified("tabs");
        }
        config.updatedAt = Date.now();
        await config.save();
        return res.json({ success: true, message: "Tabs updated successfully", tabs: config.tabs });
      } catch (dbErr) {
        console.warn("[Config] Mongo tabs update failed, using localStore:", dbErr.message);
      }
    }

    const curConfig = localStore.getConfig();
    const updatedTabs = { ...(curConfig.tabs || {}), ...(tabs || {}) };
    localStore.updateConfig({ tabs: updatedTabs });
    return res.json({ success: true, message: "Tabs updated successfully", tabs: updatedTabs });
  } catch (error) {
    console.error("[Config] Error updating tabs:", error.message);
    res.status(500).json({ success: false, message: "Failed to update tabs" });
  }
});

// Admin updates general festival information / Marquee scroller text
router.put("/general", protectAdmin, async (req, res) => {
  try {
    const generalData = req.body;

    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (!config) config = new TabConfig();

        Object.keys(generalData).forEach(key => {
          if (generalData[key] !== undefined) config[key] = generalData[key];
        });

        config.updatedAt = Date.now();
        await config.save();
        return res.json({ success: true, message: "General configuration saved", config });
      } catch (dbErr) {
        console.warn("[Config] Mongo general update failed, using localStore:", dbErr.message);
      }
    }

    const updatedConfig = localStore.updateConfig(generalData);
    return res.json({ success: true, message: "General configuration saved", config: updatedConfig });
  } catch (error) {
    console.error("[Config] Error updating general settings:", error.message);
    res.status(500).json({ success: false, message: "Failed to update general configuration" });
  }
});

// Admin updates Daily Newsletter
router.put("/newsletter", protectAdmin, async (req, res) => {
  try {
    const { newsletter } = req.body;

    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (!config) config = new TabConfig();

        if (newsletter) {
          config.newsletter = { ...(config.newsletter?.toObject ? config.newsletter.toObject() : config.newsletter), ...newsletter };
          if (newsletter.enabled !== undefined && config.tabs?.newsletter) {
            config.tabs.newsletter.enabled = Boolean(newsletter.enabled);
            config.tabs.newsletter.approved = Boolean(newsletter.enabled);
            config.markModified("tabs");
          }
          config.markModified("newsletter");
        }
        config.updatedAt = Date.now();
        await config.save();
        return res.json({
          success: true,
          message: "Daily newsletter updated successfully",
          newsletter: config.newsletter,
          tabs: config.tabs
        });
      } catch (dbErr) {
        console.warn("[Config] Mongo newsletter update failed, using localStore:", dbErr.message);
      }
    }

    const cur = localStore.getConfig();
    const updatedNewsletter = { ...(cur.newsletter || {}), ...(newsletter || {}) };
    const updates = { newsletter: updatedNewsletter };
    if (newsletter?.enabled !== undefined && cur.tabs?.newsletter) {
      updates.tabs = {
        ...(cur.tabs || {}),
        newsletter: {
          ...(cur.tabs.newsletter || {}),
          enabled: Boolean(newsletter.enabled),
          approved: Boolean(newsletter.enabled)
        }
      };
    }
    localStore.updateConfig(updates);
    const updated = localStore.getConfig();
    return res.json({ success: true, message: "Daily newsletter updated successfully", newsletter: updated.newsletter, tabs: updated.tabs });
  } catch (error) {
    console.error("[Config] Error updating newsletter:", error.message);
    res.status(500).json({ success: false, message: "Failed to update daily newsletter" });
  }
});

// Admin updates Participating Wings
router.put("/wings", protectAdmin, async (req, res) => {
  try {
    const { wings } = req.body;

    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (!config) config = new TabConfig();

        if (Array.isArray(wings)) {
          config.wings = wings;
          config.participatingWings = wings.map(w => w.code);
          config.markModified("wings");
          config.markModified("participatingWings");
        }
        config.updatedAt = Date.now();
        await config.save();
        return res.json({ success: true, message: "Participating wings updated successfully", wings: config.wings });
      } catch (dbErr) {
        console.warn("[Config] Mongo wings update failed, using localStore:", dbErr.message);
      }
    }

    if (Array.isArray(wings)) {
      localStore.updateConfig({
        wings,
        participatingWings: wings.map(w => w.code)
      });
    }
    return res.json({ success: true, message: "Participating wings updated successfully", wings });
  } catch (error) {
    console.error("[Config] Error updating wings:", error.message);
    res.status(500).json({ success: false, message: "Failed to update participating wings" });
  }
});

// Admin updates Society Rules
router.put("/rules", protectAdmin, async (req, res) => {
  try {
    const { rules } = req.body;

    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (!config) config = new TabConfig();

        if (Array.isArray(rules)) {
          config.rules = rules;
          config.markModified("rules");
        }
        config.updatedAt = Date.now();
        await config.save();
        return res.json({ success: true, message: "Mandal rules updated successfully", rules: config.rules });
      } catch (dbErr) {
        console.warn("[Config] Mongo rules update failed, using localStore:", dbErr.message);
      }
    }

    if (Array.isArray(rules)) {
      localStore.updateConfig({ rules });
    }
    return res.json({ success: true, message: "Mandal rules updated successfully", rules });
  } catch (error) {
    console.error("[Config] Error updating rules:", error.message);
    res.status(500).json({ success: false, message: "Failed to update mandal rules" });
  }
});

// GET Photo Gallery (Public)
router.get("/gallery", async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      try {
        const config = await TabConfig.findOne();
        if (config && config.gallery) {
          return res.json({ success: true, gallery: config.gallery });
        }
      } catch (dbErr) {
        console.warn("[Config] Mongo gallery fetch failed, using localStore:", dbErr.message);
      }
    }

    const config = localStore.getConfig();
    return res.json({ success: true, gallery: config?.gallery || [] });
  } catch (error) {
    console.error("[Config] Error fetching gallery:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch gallery" });
  }
});

// Admin updates Festival Photo Gallery
router.put("/gallery", protectAdmin, async (req, res) => {
  try {
    const { gallery } = req.body;

    if (!Array.isArray(gallery)) {
      return res.status(400).json({ success: false, message: "Gallery must be an array of festival items" });
    }

    // Normalize each festival object
    const normalizedGallery = gallery.map((item, idx) => {
      const banner = item.bannerUrl || item.imageUrl || (Array.isArray(item.photos) && item.photos[0]?.url) || "";
      const photos = Array.isArray(item.photos)
        ? item.photos.map((p, pIdx) => ({
            id: p.id || `p_${Date.now()}_${pIdx}`,
            url: p.url || p.imageUrl || "",
            captionMr: p.captionMr || p.titleMr || "",
            captionEn: p.captionEn || p.titleEn || "",
            order: Number(p.order) || pIdx + 1
          })).filter(p => Boolean(p.url))
        : (item.imageUrl ? [{ id: "p_1", url: item.imageUrl, captionMr: item.titleMr || "", captionEn: item.titleEn || "", order: 1 }] : []);

      return {
        id: item.id || `fest_${Date.now()}_${idx}`,
        titleMr: item.titleMr || item.nameMr || "नवीन उत्सव छायाचित्रे",
        titleEn: item.titleEn || item.nameEn || "New Festival Gallery",
        nameMr: item.nameMr || item.titleMr || "नवीन उत्सव छायाचित्रे",
        nameEn: item.nameEn || item.titleEn || "New Festival Gallery",
        category: item.category || "महाआरती",
        categoryEn: item.categoryEn || "Maha Aarti",
        year: item.year || "२०२६",
        yearEn: item.yearEn || "2026",
        descMr: item.descMr || "",
        descEn: item.descEn || "",
        bannerUrl: banner,
        imageUrl: banner,
        accentColor: item.accentColor || "from-amber-700 to-maroon-900",
        photos,
        isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
        order: Number(item.order) || idx + 1
      };
    });

    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (!config) config = new TabConfig();

        config.gallery = normalizedGallery;
        config.markModified("gallery");
        config.updatedAt = Date.now();
        await config.save();
        return res.json({ success: true, message: "Festival photo gallery updated successfully", gallery: config.gallery });
      } catch (dbErr) {
        console.warn("[Config] Mongo gallery update failed, using localStore:", dbErr.message);
      }
    }

    localStore.updateConfig({ gallery: normalizedGallery });
    return res.json({ success: true, message: "Festival photo gallery updated successfully", gallery: normalizedGallery });
  } catch (error) {
    console.error("[Config] Error updating gallery:", error.message);
    res.status(500).json({ success: false, message: "Failed to update festival photo gallery" });
  }
});

// Admin updates Poll
router.put("/poll", protectAdmin, async (req, res) => {
  try {
    const { poll } = req.body;

    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (!config) config = new TabConfig();

        if (poll) {
          config.poll = { ...(config.poll?.toObject ? config.poll.toObject() : config.poll), ...poll };
          config.markModified("poll");
        }
        config.updatedAt = Date.now();
        await config.save();
        return res.json({ success: true, message: "Poll updated successfully", poll: config.poll });
      } catch (dbErr) {
        console.warn("[Config] Mongo poll update failed, using localStore:", dbErr.message);
      }
    }

    const cur = localStore.getConfig();
    const updatedPoll = { ...(cur.poll || {}), ...(poll || {}) };
    localStore.updateConfig({ poll: updatedPoll });
    return res.json({ success: true, message: "Poll updated successfully", poll: updatedPoll });
  } catch (error) {
    console.error("[Config] Error updating poll:", error.message);
    res.status(500).json({ success: false, message: "Failed to update resident poll" });
  }
});

// Public Cast Vote in Poll
router.post("/poll/vote", async (req, res) => {
  try {
    const { optionId } = req.body;

    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (config && config.poll && config.poll.options) {
          const opt = config.poll.options.find(o => o.id === Number(optionId));
          if (opt) {
            opt.votes = (opt.votes || 0) + 1;
            config.markModified("poll");
            await config.save();
            return res.json({ success: true, message: "Vote recorded successfully", poll: config.poll });
          }
        }
      } catch (dbErr) {
        console.warn("[Config] Mongo vote failed, using localStore:", dbErr.message);
      }
    }

    const updatedPoll = localStore.votePoll(optionId);
    if (!updatedPoll) {
      return res.status(400).json({ success: false, message: "Invalid option selected" });
    }
    return res.json({ success: true, message: "Vote recorded successfully", poll: updatedPoll });
  } catch (error) {
    console.error("[Config] Error recording vote:", error.message);
    res.status(500).json({ success: false, message: "Failed to record vote" });
  }
});

// Admin updates Volunteer Seva
router.put("/volunteer", protectAdmin, async (req, res) => {
  try {
    const { volunteerSeva } = req.body;

    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (!config) config = new TabConfig();

        if (volunteerSeva) {
          config.volunteerSeva = { ...(config.volunteerSeva?.toObject ? config.volunteerSeva.toObject() : config.volunteerSeva), ...volunteerSeva };
          config.markModified("volunteerSeva");
        }
        config.updatedAt = Date.now();
        await config.save();
        return res.json({ success: true, message: "Volunteer seva settings updated successfully", volunteerSeva: config.volunteerSeva });
      } catch (dbErr) {
        console.warn("[Config] Mongo volunteer update failed, using localStore:", dbErr.message);
      }
    }

    const cur = localStore.getConfig();
    const updatedVolunteer = { ...(cur.volunteerSeva || {}), ...(volunteerSeva || {}) };
    localStore.updateConfig({ volunteerSeva: updatedVolunteer });
    return res.json({ success: true, message: "Volunteer seva settings updated successfully", volunteerSeva: updatedVolunteer });
  } catch (error) {
    console.error("[Config] Error updating volunteer settings:", error.message);
    res.status(500).json({ success: false, message: "Failed to update volunteer settings" });
  }
});

// Admin updates Sidebar Menu Items & Floating settings
router.put("/sidebar", protectAdmin, async (req, res) => {
  try {
    const { sidebarMenu, sidebarSettings } = req.body;

    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (!config) config = new TabConfig();

        if (sidebarMenu) {
          config.sidebarMenu = sidebarMenu;
          config.markModified("sidebarMenu");
        }
        if (sidebarSettings) {
          config.sidebarSettings = { ...(config.sidebarSettings?.toObject ? config.sidebarSettings.toObject() : config.sidebarSettings), ...sidebarSettings };
          config.markModified("sidebarSettings");
        }
        config.updatedAt = Date.now();
        await config.save();
        return res.json({
          success: true,
          message: "Sidebar configuration updated successfully",
          sidebarMenu: config.sidebarMenu,
          sidebarSettings: config.sidebarSettings
        });
      } catch (dbErr) {
        console.warn("[Config] Mongo sidebar update failed, using localStore:", dbErr.message);
      }
    }

    const cur = localStore.getConfig();
    const updates = {};
    if (sidebarMenu) updates.sidebarMenu = sidebarMenu;
    if (sidebarSettings) updates.sidebarSettings = { ...(cur.sidebarSettings || {}), ...sidebarSettings };
    localStore.updateConfig(updates);
    const updated = localStore.getConfig();

    return res.json({
      success: true,
      message: "Sidebar configuration updated successfully",
      sidebarMenu: updated.sidebarMenu,
      sidebarSettings: updated.sidebarSettings
    });
  } catch (error) {
    console.error("[Config] Error updating sidebar:", error.message);
    res.status(500).json({ success: false, message: "Failed to update sidebar configuration" });
  }
});

// Admin updates Festival Schedule Card (Event Details, Planner & Photo)
router.put("/festival-schedule-card", protectAdmin, async (req, res) => {
  try {
    const { festivalScheduleCard } = req.body;

    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (!config) config = new TabConfig();

        if (festivalScheduleCard) {
          config.festivalScheduleCard = {
            ...(config.festivalScheduleCard?.toObject ? config.festivalScheduleCard.toObject() : config.festivalScheduleCard),
            ...festivalScheduleCard
          };
          config.markModified("festivalScheduleCard");
        }
        config.updatedAt = Date.now();
        await config.save();
        return res.json({
          success: true,
          message: "Festival schedule card updated successfully",
          festivalScheduleCard: config.festivalScheduleCard
        });
      } catch (dbErr) {
        console.warn("[Config] Mongo festival schedule card update failed, using localStore:", dbErr.message);
      }
    }

    const cur = localStore.getConfig();
    const mergedCard = {
      ...(cur.festivalScheduleCard || {}),
      ...(festivalScheduleCard || {})
    };
    localStore.updateConfig({ festivalScheduleCard: mergedCard });
    return res.json({
      success: true,
      message: "Festival schedule card updated successfully",
      festivalScheduleCard: mergedCard
    });
  } catch (error) {
    console.error("[Config] Error updating festival schedule card:", error.message);
    res.status(500).json({ success: false, message: "Failed to update festival schedule card" });
  }
});

// Admin updates 10-day Aarti schedule & host buildings (and optionally festivalScheduleCard, dailyAartiSection, aartiTabEnabled)
router.put("/aarti-schedule", protectAdmin, async (req, res) => {
  try {
    const { dailyAartiSchedule, festivalScheduleCard, dailyAartiSection, aartiTabEnabled } = req.body;

    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (!config) config = new TabConfig();

        if (dailyAartiSchedule && Array.isArray(dailyAartiSchedule)) {
          config.dailyAartiSchedule = dailyAartiSchedule;
          config.markModified("dailyAartiSchedule");
        }
        if (festivalScheduleCard) {
          config.festivalScheduleCard = {
            ...(config.festivalScheduleCard?.toObject ? config.festivalScheduleCard.toObject() : config.festivalScheduleCard),
            ...festivalScheduleCard
          };
          config.markModified("festivalScheduleCard");
        }
        if (dailyAartiSection) {
          config.dailyAartiSection = {
            ...(config.dailyAartiSection?.toObject ? config.dailyAartiSection.toObject() : config.dailyAartiSection),
            ...dailyAartiSection
          };
          config.markModified("dailyAartiSection");
        }
        const effectiveEnabled = aartiTabEnabled !== undefined 
          ? Boolean(aartiTabEnabled) 
          : (dailyAartiSection?.enabled !== undefined ? Boolean(dailyAartiSection.enabled) : undefined);

        if (effectiveEnabled !== undefined && config.tabs && config.tabs.aarti) {
          config.tabs.aarti.enabled = effectiveEnabled;
          config.tabs.aarti.approved = effectiveEnabled;
          config.markModified("tabs");
        }

        config.updatedAt = Date.now();
        await config.save();
        return res.json({
          success: true,
          message: "Daily Aarti schedule updated successfully",
          dailyAartiSchedule: config.dailyAartiSchedule,
          festivalScheduleCard: config.festivalScheduleCard,
          dailyAartiSection: config.dailyAartiSection,
          tabs: config.tabs
        });
      } catch (dbErr) {
        console.warn("[Config] Mongo aarti-schedule update failed, using localStore:", dbErr.message);
      }
    }

    const cur = localStore.getConfig();
    const updates = {};
    if (dailyAartiSchedule && Array.isArray(dailyAartiSchedule)) {
      updates.dailyAartiSchedule = dailyAartiSchedule;
    }
    if (festivalScheduleCard) {
      updates.festivalScheduleCard = {
        ...(cur.festivalScheduleCard || {}),
        ...festivalScheduleCard
      };
    }
    if (dailyAartiSection) {
      updates.dailyAartiSection = {
        ...(cur.dailyAartiSection || {}),
        ...dailyAartiSection
      };
    }
    const effectiveEnabled = aartiTabEnabled !== undefined 
      ? Boolean(aartiTabEnabled) 
      : (dailyAartiSection?.enabled !== undefined ? Boolean(dailyAartiSection.enabled) : undefined);

    if (effectiveEnabled !== undefined && cur.tabs && cur.tabs.aarti) {
      updates.tabs = {
        ...(cur.tabs || {}),
        aarti: {
          ...(cur.tabs.aarti || {}),
          enabled: effectiveEnabled,
          approved: effectiveEnabled
        }
      };
    }

    localStore.updateConfig(updates);
    const updated = localStore.getConfig();

    return res.json({
      success: true,
      message: "Daily Aarti schedule updated successfully",
      dailyAartiSchedule: updated.dailyAartiSchedule,
      festivalScheduleCard: updated.festivalScheduleCard,
      dailyAartiSection: updated.dailyAartiSection,
      tabs: updated.tabs
    });
  } catch (error) {
    console.error("[Config] Error updating aarti schedule:", error.message);
    res.status(500).json({ success: false, message: "Failed to update aarti schedule" });
  }
});

// Admin updates Mandal info
router.put("/mandal-info", protectAdmin, async (req, res) => {
  try {
    const { mandalInfo } = req.body;

    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (!config) config = new TabConfig();

        if (mandalInfo) {
          config.mandalInfo = { ...(config.mandalInfo?.toObject ? config.mandalInfo.toObject() : config.mandalInfo), ...mandalInfo };
          config.markModified("mandalInfo");
        }
        config.updatedAt = Date.now();
        await config.save();
        return res.json({
          success: true,
          message: "Mandal information updated successfully",
          mandalInfo: config.mandalInfo
        });
      } catch (dbErr) {
        console.warn("[Config] Mongo mandal-info update failed, using localStore:", dbErr.message);
      }
    }

    const cur = localStore.getConfig();
    const updatedMandalInfo = { ...(cur.mandalInfo || {}), ...(mandalInfo || {}) };
    localStore.updateConfig({ mandalInfo: updatedMandalInfo });
    return res.json({
      success: true,
      message: "Mandal information updated successfully",
      mandalInfo: updatedMandalInfo
    });
  } catch (error) {
    console.error("[Config] Error updating mandal info:", error.message);
    res.status(500).json({ success: false, message: "Failed to update mandal information" });
  }
});

// Admin updates Important Update Scroller Settings & Messages
router.put("/scroller", protectAdmin, async (req, res) => {
  try {
    const { marqueeActive, scrollerMessages } = req.body;

    if (scrollerMessages !== undefined && !Array.isArray(scrollerMessages)) {
      return res.status(400).json({ success: false, message: "Scroller messages must be an array" });
    }

    // Validate and normalize messages
    const normalizedMessages = (scrollerMessages || []).map((msg, idx) => {
      const text = (msg.text || "").trim();
      if (!text) {
        throw new Error(`Message #${idx + 1} text cannot be empty`);
      }
      return {
        id: String(msg.id || `msg_${Date.now()}_${idx}`),
        text,
        textMr: (msg.textMr || text).trim(),
        textEn: (msg.textEn || text).trim(),
        isActive: msg.isActive !== undefined ? Boolean(msg.isActive) : true,
        order: Number(msg.order) || idx + 1,
        startDate: (msg.startDate || "").trim(),
        endDate: (msg.endDate || "").trim(),
        createdAt: msg.createdAt || new Date().toISOString()
      };
    }).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    const effectiveActive = marqueeActive !== undefined ? Boolean(marqueeActive) : true;

    if (isDatabaseConnected()) {
      try {
        let config = await TabConfig.findOne();
        if (!config) config = new TabConfig();

        config.marqueeActive = effectiveActive;
        if (scrollerMessages !== undefined) {
          config.scrollerMessages = normalizedMessages;
          config.markModified("scrollerMessages");
        }
        config.markModified("marqueeActive");
        config.updatedAt = Date.now();
        await config.save();

        return res.json({
          success: true,
          message: "Scroller settings updated successfully",
          marqueeActive: config.marqueeActive,
          scrollerMessages: config.scrollerMessages
        });
      } catch (dbErr) {
        console.warn("[Config] Mongo scroller update failed, using localStore:", dbErr.message);
      }
    }

    const updates = { marqueeActive: effectiveActive };
    if (scrollerMessages !== undefined) {
      updates.scrollerMessages = normalizedMessages;
    }
    localStore.updateConfig(updates);
    const updated = localStore.getConfig();

    return res.json({
      success: true,
      message: "Scroller settings updated successfully",
      marqueeActive: updated.marqueeActive,
      scrollerMessages: updated.scrollerMessages || []
    });
  } catch (error) {
    console.error("[Config] Error updating scroller settings:", error.message);
    res.status(400).json({ success: false, message: error.message || "Failed to update scroller settings" });
  }
});

export default router;
