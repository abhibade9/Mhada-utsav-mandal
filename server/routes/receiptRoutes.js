import express from "express";
import bcrypt from "bcryptjs";
import Receipt from "../models/Receipt.js";
import User from "../models/User.js";
import { isDatabaseConnected } from "../config/db.js";
import localStore from "../config/localStore.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protectAdmin to all receipt routes - ADMIN ONLY
router.use(protectAdmin);

/**
 * Intelligent helper to polish receipt text when AI API is unavailable or offline
 */
const polishReceiptDescriptionFallback = (rawText, { residentName, purpose, amount, paymentDate }) => {
  const trimmed = (rawText || "").trim();
  if (!trimmed) {
    return `Received with thanks towards ${purpose || "contribution"} for MHADA Towers Utsav Mandal.`;
  }

  const isDevanagari = /[\u0900-\u097F]/.test(trimmed);

  if (isDevanagari) {
    // If text already has formal keywords, preserve and enhance
    if (trimmed.includes("सस्नेह धन्यवाद") || trimmed.includes("पावती देण्यात येत आहे")) {
      return trimmed;
    }
    return `म्हाडा टॉवर्स उत्सव मंडळातर्फे ${purpose ? `"${purpose}"` : "उत्सव उपक्रमा"} अंतर्गत वरील रहिवाशांकडून प्राप्त रकमेबद्दल सस्नेह धन्यवाद. ही अधिकृत संगणकीय पावती देण्यात येत आहे.`;
  }

  // English refinement
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("received") && (lower.includes("thanks") || lower.includes("acknowledged"))) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  // Clean common informal phrases like "received donation from flat for ganpati"
  let cleaned = trimmed
    .replace(/^received\s+/i, "")
    .replace(/^got\s+/i, "")
    .replace(/^payment\s+for\s+/i, "")
    .trim();

  return `Received with sincere thanks from the resident towards ${cleaned || purpose || "society contribution"} for MHADA Towers Utsav Mandal.`;
};

/**
 * @route   GET /api/receipts
 * @desc    Get all receipts with optional search (?q=...)
 * @access  Admin only
 */
router.get("/", async (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : "";

    if (isDatabaseConnected()) {
      let filter = { isArchived: { $ne: true } };
      if (q) {
        const regex = new RegExp(q, "i");
        filter = {
          isArchived: { $ne: true },
          $or: [
            { receiptNo: regex },
            { residentName: regex },
            { flatNo: regex },
            { building: regex },
            { purpose: regex },
            { paymentDate: regex },
            { paymentMode: regex }
          ]
        };
      }
      const receipts = await Receipt.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({
        success: true,
        count: receipts.length,
        data: receipts
      });
    }

    // Fallback: localStore
    const receipts = localStore.getReceipts({ q, includeArchived: false });
    return res.status(200).json({
      success: true,
      count: receipts.length,
      data: receipts
    });
  } catch (error) {
    console.error("[Receipts] Error fetching receipts:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch receipts."
    });
  }
});

/**
 * @route   GET /api/receipts/next-number
 * @desc    Get next sequential receipt number
 * @access  Admin only
 */
router.get("/next-number", async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const prefix = "MT";

    if (isDatabaseConnected()) {
      const regex = new RegExp(`^${prefix}/${year}/(\\d+)$`, "i");
      const receipts = await Receipt.find({ receiptNo: regex }).select("receiptNo").lean();

      let maxSeq = 0;
      for (const r of receipts) {
        const match = (r.receiptNo || "").match(regex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
      const nextSeq = maxSeq + 1;
      const nextReceiptNo = `${prefix}/${year}/${String(nextSeq).padStart(5, "0")}`;
      return res.status(200).json({ success: true, nextReceiptNo });
    }

    // Fallback: localStore
    const nextReceiptNo = localStore.getNextReceiptNumber(year);
    return res.status(200).json({ success: true, nextReceiptNo });
  } catch (error) {
    console.error("[Receipts] Error generating next receipt number:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate receipt number."
    });
  }
});

/**
 * @route   GET /api/receipts/settings
 * @desc    Get receipt settings (SACHIV signature URL, etc.)
 * @access  Admin only
 */
router.get("/settings", async (req, res) => {
  try {
    const settings = localStore.getReceiptSettings();
    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error("[Receipts] Error fetching receipt settings:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch receipt settings."
    });
  }
});

/**
 * @route   PUT /api/receipts/settings
 * @desc    Update receipt settings (e.g. SACHIV signature URL)
 * @access  Admin only
 */
router.put("/settings", async (req, res) => {
  try {
    const { sachivSignatureUrl, receiptPrefix } = req.body;
    const updates = {};
    if (sachivSignatureUrl !== undefined) updates.sachivSignatureUrl = sachivSignatureUrl;
    if (receiptPrefix !== undefined) updates.receiptPrefix = receiptPrefix;

    const updated = localStore.updateReceiptSettings(updates);
    return res.status(200).json({
      success: true,
      message: "Receipt settings updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("[Receipts] Error updating receipt settings:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update receipt settings."
    });
  }
});

/**
 * @route   POST /api/receipts/rewrite-description
 * @desc    Redesign/refine receipt description with AI
 * @access  Admin only
 */
router.post("/rewrite-description", async (req, res) => {
  try {
    const { text, residentName, purpose, amount, paymentDate } = req.body;
    const rawText = (text || "").trim();

    if (!rawText) {
      return res.status(400).json({
        success: false,
        message: "Please enter some text in the description box first."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const systemPrompt = `You are a professional administrative assistant for "MHADA Towers Utsav Mandal" housing society in Pune, India.
Your task is to refine and polish receipt descriptions written by the society admin into dignified, formal, courteous receipt wording.
CRITICAL RULES:
1. Preserve the user's core intent and meaning.
2. If written in Marathi, output in polished formal Marathi. If written in English, output in polished formal English.
3. DO NOT invent or fabricate any payment details, names, flat numbers, transaction IDs, dates, or amounts.
4. Keep it concise (1 to 2 sentences max), suitable for printing on an official financial receipt voucher.
5. Return ONLY the polished text with no explanations, greetings, quotes, or markdown wrappers.`;

        const userPrompt = `Improve this receipt description wording:
"${rawText}"
Context:
- Purpose: ${purpose || "Contribution"}
- Resident: ${residentName || "Resident"}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 200
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim()) {
            const cleanText = candidateText.trim().replace(/^["']|["']$/g, "");
            return res.status(200).json({
              success: true,
              rewrittenText: cleanText,
              provider: "gemini"
            });
          }
        }
      } catch (aiErr) {
        console.warn("[Receipts] Gemini API call failed, falling back to intelligent refiner:", aiErr.message);
      }
    }

    // Fallback: Intelligent rule-based Marathi & English receipt wording formatter
    const rewritten = polishReceiptDescriptionFallback(rawText, { residentName, purpose, amount, paymentDate });
    return res.status(200).json({
      success: true,
      rewrittenText: rewritten,
      provider: "smart-formatter"
    });
  } catch (error) {
    console.error("[Receipts] Error redesigning text:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to rewrite receipt text. You may continue with your original wording."
    });
  }
});

/**
 * @route   POST /api/receipts
 * @desc    Generate and save a new receipt
 * @access  Admin only
 */
router.post("/", async (req, res) => {
  try {
    const {
      residentName,
      flatNo,
      building,
      purpose,
      amount,
      amountInWords,
      paymentDate,
      paymentMode,
      transactionRef,
      description,
      notes,
      sachivSignatureUrl,
      receiptNo
    } = req.body;

    // Validation
    if (!residentName || !residentName.trim()) {
      return res.status(400).json({ success: false, message: "Resident name is required." });
    }
    if (!flatNo || !flatNo.trim()) {
      return res.status(400).json({ success: false, message: "Flat number is required." });
    }
    if (!building || !building.trim()) {
      return res.status(400).json({ success: false, message: "Building name/wing is required." });
    }
    if (!purpose || !purpose.trim()) {
      return res.status(400).json({ success: false, message: "Receipt purpose is required." });
    }
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be a valid positive number." });
    }
    if (!paymentDate || !paymentDate.trim()) {
      return res.status(400).json({ success: false, message: "Payment date is required." });
    }

    // Resolve receipt number
    let finalReceiptNo = receiptNo ? receiptNo.trim().toUpperCase() : null;
    const year = new Date(paymentDate).getFullYear() || new Date().getFullYear();

    // Check signature from settings if not passed
    const settings = localStore.getReceiptSettings();
    const effectiveSignature = sachivSignatureUrl || settings.sachivSignatureUrl || "";

    if (isDatabaseConnected()) {
      if (!finalReceiptNo) {
        const regex = new RegExp(`^MT/${year}/(\\d+)$`, "i");
        const receipts = await Receipt.find({ receiptNo: regex }).select("receiptNo").lean();
        let maxSeq = 0;
        for (const r of receipts) {
          const match = (r.receiptNo || "").match(regex);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxSeq) maxSeq = num;
          }
        }
        finalReceiptNo = `MT/${year}/${String(maxSeq + 1).padStart(5, "0")}`;
      } else {
        const existing = await Receipt.findOne({ receiptNo: finalReceiptNo });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: `Receipt number "${finalReceiptNo}" already exists. Please use a unique receipt number.`
          });
        }
      }

      const receipt = await Receipt.create({
        receiptNo: finalReceiptNo,
        residentName: residentName.trim(),
        flatNo: flatNo.trim(),
        building: building.trim(),
        purpose: purpose.trim(),
        amount: numAmount,
        amountInWords: (amountInWords || "").trim(),
        paymentDate: paymentDate.trim(),
        paymentMode: (paymentMode || "UPI").trim(),
        transactionRef: (transactionRef || "").trim(),
        description: (description || "").trim(),
        notes: (notes || "").trim(),
        sachivSignatureUrl: effectiveSignature,
        createdBy: req.user?.name || "म्हाडा उत्सव समिती अध्यक्ष (Admin)"
      });

      return res.status(201).json({
        success: true,
        message: "Receipt generated and stored successfully",
        data: receipt
      });
    }

    // Fallback: localStore
    try {
      const receipt = localStore.createReceipt({
        receiptNo: finalReceiptNo,
        residentName,
        flatNo,
        building,
        purpose,
        amount: numAmount,
        amountInWords,
        paymentDate,
        paymentMode,
        transactionRef,
        description,
        notes,
        sachivSignatureUrl: effectiveSignature,
        createdBy: req.user?.name || "म्हाडा उत्सव समिती अध्यक्ष (Admin)"
      });

      return res.status(201).json({
        success: true,
        message: "Receipt generated and stored successfully",
        data: receipt
      });
    } catch (storeErr) {
      return res.status(400).json({
        success: false,
        message: storeErr.message || "Failed to create receipt record."
      });
    }
  } catch (error) {
    console.error("[Receipts] Error creating receipt:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating receipt."
    });
  }
});

/**
 * @route   GET /api/receipts/:id
 * @desc    Get single receipt by ID or ReceiptNo
 * @access  Admin only
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isDatabaseConnected()) {
      let receipt = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        receipt = await Receipt.findById(id).lean();
      }
      if (!receipt) {
        receipt = await Receipt.findOne({ receiptNo: id.toUpperCase() }).lean();
      }

      if (!receipt) {
        return res.status(404).json({ success: false, message: "Receipt not found." });
      }
      return res.status(200).json({ success: true, data: receipt });
    }

    // Fallback: localStore
    let receipt = localStore.getReceiptById(id);
    if (!receipt) {
      receipt = localStore.getReceiptByNumber(id);
    }

    if (!receipt) {
      return res.status(404).json({ success: false, message: "Receipt not found." });
    }
    return res.status(200).json({ success: true, data: receipt });
  } catch (error) {
    console.error("[Receipts] Error fetching receipt details:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch receipt details."
    });
  }
});

/**
 * @route   POST /api/receipts/archive/unlock
 * @desc    Verify admin password to unlock Secure Archive
 * @access  Admin only
 */
router.post("/archive/unlock", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== "string") {
      return res.status(400).json({ success: false, message: "Password is required." });
    }

    const cleanPass = password.trim();
    const envPass = process.env.RECEIPT_ARCHIVE_PASSWORD || process.env.ADMIN_PASSWORD;

    let isValid = Boolean(envPass && cleanPass === envPass.trim());

    if (!isValid && isDatabaseConnected()) {
      const user = await User.findById(req.user?._id || req.user?.id);
      if (user && user.passwordHash) {
        isValid = await bcrypt.compare(cleanPass, user.passwordHash);
      }
    }

    if (!isValid) {
      const adminUser = localStore.data?.users?.find(u => u.role === "admin");
      if (adminUser?.passwordHash) {
        isValid = bcrypt.compareSync(cleanPass, adminUser.passwordHash);
      }
    }

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "चुकीचा पासवर्ड. आर्काइव्ह अनलॉक करता आले नाही (Invalid archive unlock password)."
      });
    }

    return res.status(200).json({
      success: true,
      message: "आर्काइव्ह यशस्वीरीत्या अनलॉक झाले (Receipt archive unlocked successfully)."
    });
  } catch (error) {
    console.error("[Receipts] Error verifying archive password:", error.message);
    return res.status(500).json({ success: false, message: "Error unlocking archive." });
  }
});

/**
 * @route   GET /api/receipts/archive
 * @desc    Get all receipts for Secure Archive (both active & archived)
 * @access  Admin only
 */
router.get("/archive", async (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : "";
    const status = req.query.status ? String(req.query.status).trim() : "all"; // all, active, archived

    if (isDatabaseConnected()) {
      let filter = {};
      if (status === "archived") {
        filter.isArchived = true;
      } else if (status === "active") {
        filter.isArchived = { $ne: true };
      }

      if (q) {
        const regex = new RegExp(q, "i");
        const qFilter = {
          $or: [
            { receiptNo: regex },
            { residentName: regex },
            { flatNo: regex },
            { building: regex },
            { purpose: regex },
            { paymentDate: regex },
            { paymentMode: regex }
          ]
        };
        filter = { ...filter, ...qFilter };
      }

      const receipts = await Receipt.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({
        success: true,
        count: receipts.length,
        data: receipts
      });
    }

    // Fallback: localStore
    const receipts = localStore.getReceipts({ q, includeArchived: true, status });
    return res.status(200).json({
      success: true,
      count: receipts.length,
      data: receipts
    });
  } catch (error) {
    console.error("[Receipts] Error fetching archive receipts:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch archive receipts." });
  }
});

/**
 * @route   PUT /api/receipts/:id/archive
 * @desc    Soft-delete / Archive a receipt
 * @access  Admin only
 */
router.put("/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;
    const adminName = req.user?.name || "म्हाडा उत्सव समिती अध्यक्ष (Admin)";

    if (isDatabaseConnected()) {
      let receipt = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        receipt = await Receipt.findByIdAndUpdate(
          id,
          { isArchived: true, archivedAt: new Date(), archivedBy: adminName },
          { new: true }
        );
      }
      if (!receipt) {
        receipt = await Receipt.findOneAndUpdate(
          { receiptNo: id.toUpperCase() },
          { isArchived: true, archivedAt: new Date(), archivedBy: adminName },
          { new: true }
        );
      }
      if (!receipt) {
        return res.status(404).json({ success: false, message: "Receipt not found." });
      }
      return res.status(200).json({
        success: true,
        message: "Receipt moved to Secure Archive successfully.",
        data: receipt
      });
    }

    // Fallback: localStore
    const receipt = localStore.archiveReceipt(id, adminName);
    if (!receipt) {
      return res.status(404).json({ success: false, message: "Receipt not found." });
    }
    return res.status(200).json({
      success: true,
      message: "Receipt moved to Secure Archive successfully.",
      data: receipt
    });
  } catch (error) {
    console.error("[Receipts] Error archiving receipt:", error.message);
    return res.status(500).json({ success: false, message: "Failed to archive receipt." });
  }
});

/**
 * @route   PUT /api/receipts/archive/:id/restore
 * @desc    Restore an archived receipt back to active history
 * @access  Admin only
 */
router.put("/archive/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;

    if (isDatabaseConnected()) {
      let receipt = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        receipt = await Receipt.findByIdAndUpdate(
          id,
          { isArchived: false, archivedAt: null, archivedBy: "" },
          { new: true }
        );
      }
      if (!receipt) {
        receipt = await Receipt.findOneAndUpdate(
          { receiptNo: id.toUpperCase() },
          { isArchived: false, archivedAt: null, archivedBy: "" },
          { new: true }
        );
      }
      if (!receipt) {
        return res.status(404).json({ success: false, message: "Receipt not found." });
      }
      return res.status(200).json({
        success: true,
        message: "Receipt restored to active history successfully.",
        data: receipt
      });
    }

    // Fallback: localStore
    const receipt = localStore.restoreReceipt(id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: "Receipt not found." });
    }
    return res.status(200).json({
      success: true,
      message: "Receipt restored to active history successfully.",
      data: receipt
    });
  } catch (error) {
    console.error("[Receipts] Error restoring receipt:", error.message);
    return res.status(500).json({ success: false, message: "Failed to restore receipt." });
  }
});

/**
 * @route   DELETE /api/receipts/:id
 * @desc    Delete a receipt (soft-deletes to Archive for data preservation)
 * @access  Admin only
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const adminName = req.user?.name || "म्हाडा उत्सव समिती अध्यक्ष (Admin)";
    const permanent = req.query.permanent === "true";

    if (isDatabaseConnected()) {
      if (permanent) {
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          await Receipt.findByIdAndDelete(id);
        } else {
          await Receipt.findOneAndDelete({ receiptNo: id.toUpperCase() });
        }
        return res.status(200).json({ success: true, message: "Receipt permanently deleted." });
      }

      // Soft-delete to archive
      let receipt = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        receipt = await Receipt.findByIdAndUpdate(
          id,
          { isArchived: true, archivedAt: new Date(), archivedBy: adminName },
          { new: true }
        );
      }
      if (!receipt) {
        receipt = await Receipt.findOneAndUpdate(
          { receiptNo: id.toUpperCase() },
          { isArchived: true, archivedAt: new Date(), archivedBy: adminName },
          { new: true }
        );
      }
      return res.status(200).json({
        success: true,
        message: "पावती सक्रिय यादीतून काढून सुरक्षित आर्काइव्हमध्ये हलवली (Receipt moved to Secure Archive).",
        data: receipt
      });
    }

    // Fallback: localStore
    const archived = localStore.archiveReceipt(id, adminName);
    return res.status(200).json({
      success: true,
      message: archived 
        ? "पावती सक्रिय यादीतून काढून सुरक्षित आर्काइव्हमध्ये हलवली (Receipt moved to Secure Archive)." 
        : "Receipt not found."
    });
  } catch (error) {
    console.error("[Receipts] Error deleting receipt:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete receipt."
    });
  }
});

export default router;
