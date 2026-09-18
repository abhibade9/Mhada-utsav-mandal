import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import Media from "../models/Media.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Sanitize original file name
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName || "image"}-${uniqueSuffix}${ext}`);
  },
});

// File filter: accept all image files and extensions (JPG, PNG, WEBP, GIF, SVG, AVIF, BMP, TIFF, ICO, HEIC, etc.)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const isImageExt = /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|tiff|tif|ico|heic|heif|jfif|raw|eps)$/i.test(ext);
  const isImageMime = Boolean(file.mimetype && (file.mimetype.startsWith("image/") || file.mimetype === "application/octet-stream"));

  if (isImageExt || isImageMime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPG, PNG, WEBP, GIF, SVG, AVIF, BMP, TIFF, etc.) are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max file size
  },
});

const router = express.Router();

// Helper to format file response
const formatFileResponse = (file, category = "general") => {
  const publicUrl = `/uploads/${file.filename}`;
  return {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: publicUrl,
    imageUrl: publicUrl,
    category,
  };
};

/**
 * @route   POST /api/upload
 * @desc    Upload a single image
 * @access  Public / Admin
 */
router.post("/", (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File is too large. Maximum size is 20MB.",
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please select an image to upload.",
      });
    }

    try {
      const category = req.body.category || "general";
      const fileData = formatFileResponse(req.file, category);

      // Save record in database if connected (non-blocking)
      if (mongoose.connection.readyState === 1) {
        Media.create({
          filename: fileData.filename,
          originalName: fileData.originalName,
          mimetype: fileData.mimetype,
          size: fileData.size,
          url: fileData.url,
          category,
        }).catch((dbErr) => {
          console.warn("[Upload] Warning saving media record:", dbErr.message);
        });
      }

      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        ...fileData,
      });
    } catch (error) {
      console.error("[Upload] Error processing upload:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error while processing image upload.",
      });
    }
  });
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple images (up to 10)
 * @access  Public / Admin
 */
router.post("/multiple", (req, res) => {
  upload.array("images", 10)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "One or more files exceed the 20MB size limit.",
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided. Please select at least one image.",
      });
    }

    try {
      const category = req.body.category || "general";
      const uploadedFiles = [];

      for (const file of req.files) {
        const fileData = formatFileResponse(file, category);
        uploadedFiles.push(fileData);

        if (mongoose.connection.readyState === 1) {
          Media.create({
            filename: fileData.filename,
            originalName: fileData.originalName,
            mimetype: fileData.mimetype,
            size: fileData.size,
            url: fileData.url,
            category,
          }).catch((dbErr) => {
            console.warn("[Upload] Warning saving media record:", dbErr.message);
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `${uploadedFiles.length} images uploaded successfully`,
        files: uploadedFiles,
      });
    } catch (error) {
      console.error("[Upload] Error processing multiple uploads:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error while processing multiple uploads.",
      });
    }
  });
});

/**
 * @route   GET /api/upload/list
 * @desc    Get list of uploaded images
 * @access  Public
 */
router.get("/list", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const mediaList = await Media.find().sort({ createdAt: -1 }).limit(50);
      return res.status(200).json({
        success: true,
        media: mediaList,
      });
    }

    // Fallback: Read uploaded files from uploads directory
    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json({ success: true, media: [] });
    }

    const files = fs.readdirSync(uploadsDir);
    const mediaList = files.map((file) => ({
      filename: file,
      url: `/uploads/${file}`,
      imageUrl: `/uploads/${file}`,
      category: "general"
    }));

    return res.status(200).json({
      success: true,
      media: mediaList,
    });
  } catch (error) {
    console.error("[Upload] Error retrieving media list:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch uploaded images list.",
    });
  }
});

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Delete an uploaded image
 * @access  Admin
 */
router.delete("/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    // Prevent directory traversal attacks
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, safeFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (mongoose.connection.readyState === 1) {
      await Media.deleteOne({ filename: safeFilename }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: `Image ${safeFilename} deleted successfully`,
    });
  } catch (error) {
    console.error("[Upload] Error deleting image:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete image file.",
    });
  }
});

export default router;
