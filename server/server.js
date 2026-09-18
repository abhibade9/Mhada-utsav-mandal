import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { seedInitialData } from "./seed/seedData.js";
import localStore from "./config/localStore.js";

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Routes
import authRoutes from "./routes/authRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import volunteerRoutes from "./routes/volunteerRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

const clientDistDir = path.join(__dirname, "../client/dist");
const clientPublicDir = path.join(__dirname, "../client/public");
const clientDistUploads = path.join(clientDistDir, "uploads");
const clientPublicUploads = path.join(clientPublicDir, "uploads");

// Helper to serve public asset (logo.jpg, favicon.svg, icons.svg) with search fallbacks
const servePublicAsset = (assetName, contentType) => (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cache-Control", "public, max-age=86400");
  if (contentType) res.setHeader("Content-Type", contentType);

  const candidates = [
    path.join(clientDistDir, assetName),
    path.join(clientPublicDir, assetName),
    path.join(uploadsDir, assetName),
    path.join(__dirname, "../client/src/assets", assetName)
  ];

  for (const candidatePath of candidates) {
    try {
      if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
        return res.sendFile(candidatePath);
      }
    } catch (e) {
      // ignore and try next candidate
    }
  }
  next();
};

// Explicit high-priority handlers for core branding assets
app.get("/logo.jpg", servePublicAsset("logo.jpg", "image/jpeg"));
app.get("/favicon.svg", servePublicAsset("favicon.svg", "image/svg+xml"));
app.get("/icons.svg", servePublicAsset("icons.svg", "image/svg+xml"));

// Serve uploaded media statically with open CORS and caching headers
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cache-Control", "public, max-age=86400");
  next();
}, express.static(uploadsDir));

// Fallback static mounts for uploads
if (fs.existsSync(clientDistUploads)) {
  app.use("/uploads", express.static(clientDistUploads));
}
if (fs.existsSync(clientPublicUploads)) {
  app.use("/uploads", express.static(clientPublicUploads));
}

// Case-Insensitive & URL-Decoded Static Fallback Middleware for Linux File Systems
app.use("/uploads", (req, res, next) => {
  try {
    const rawFilename = req.path.replace(/^\/+/, "");
    if (!rawFilename) return next();

    const decodedFilename = decodeURIComponent(rawFilename);
    const targetDirs = [uploadsDir, clientDistUploads, clientPublicUploads];

    // 1. Direct match in any uploads directory
    for (const dir of targetDirs) {
      if (fs.existsSync(dir)) {
        const fullPath = path.join(dir, decodedFilename);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          return res.sendFile(fullPath);
        }
      }
    }

    // 2. Case-insensitive search across directories (critical for Linux ext4)
    const lowerRequested = decodedFilename.toLowerCase();
    for (const dir of targetDirs) {
      if (fs.existsSync(dir)) {
        const dirFiles = fs.readdirSync(dir);
        const match = dirFiles.find(f => f.toLowerCase() === lowerRequested);
        if (match) {
          const matchPath = path.join(dir, match);
          if (fs.statSync(matchPath).isFile()) {
            return res.sendFile(matchPath);
          }
        }
      }
    }

    // 3. Fallback for logo if requested via /uploads/logo.jpg
    if (lowerRequested.includes("logo")) {
      const logoCandidates = [
        path.join(uploadsDir, "logo.jpg"),
        path.join(clientPublicDir, "logo.jpg"),
        path.join(clientDistDir, "logo.jpg")
      ];
      for (const lp of logoCandidates) {
        if (fs.existsSync(lp)) return res.sendFile(lp);
      }
    }
  } catch (err) {
    console.warn("[Uploads Fallback] Error:", err.message);
  }
  next();
});

// Serve client/public statically so all static assets resolve even before build
if (fs.existsSync(clientPublicDir)) {
  app.use(express.static(clientPublicDir));
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/config", configRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/volunteers", volunteerRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "MHADA Towers Utsav Mandal API",
    time: new Date().toISOString()
  });
});

// Serve production client build if exists with SPA fallback
if (fs.existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return res.status(404).json({ success: false, message: "API endpoint not found" });
    }
    res.sendFile(path.join(clientDistDir, "index.html"));
  });
} else {
  // Friendly Root Route (Prevents "Cannot GET /" during development)
  app.get("/", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>MHADA Towers Utsav Mandal - Backend API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 36px; max-width: 520px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          h1 { color: #f59e0b; margin: 0 0 10px; font-size: 22px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
          .badge { display: inline-block; background: #065f46; color: #34d399; font-weight: bold; font-size: 12px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #f59e0b, #ea580c); color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 14px; transition: transform 0.15s; }
          .btn:hover { transform: scale(1.02); }
          .endpoints { margin-top: 24px; text-align: left; font-size: 13px; color: #cbd5e1; background: #0f172a; padding: 16px; border-radius: 12px; line-height: 1.8; }
          .endpoints a { color: #38bdf8; text-decoration: none; }
          .endpoints a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="font-size: 44px; margin-bottom: 8px;">🕉️</div>
          <span class="badge">● Backend API Online (Port 5000)</span>
          <h1>म्हाडा टॉवर्स उत्सव मंडळ API</h1>
          <p>The backend API server is running smoothly on port 5000.<br/>To view the full website, run <code>npm run client</code> and visit the Frontend app on <b>port 5173</b>.</p>
          <a class="btn" href="http://localhost:5173" target="_blank">Open Frontend Website (Port 5173) →</a>
          <div class="endpoints">
            <b>API Endpoints:</b><br/>
            • Health: <a href="/api/health" target="_blank">/api/health</a><br/>
            • Config: <a href="/api/config" target="_blank">/api/config</a><br/>
            • Announcements: <a href="/api/announcements" target="_blank">/api/announcements</a><br/>
            • Events: <a href="/api/events" target="_blank">/api/events</a><br/>
            • Contacts: <a href="/api/contacts" target="_blank">/api/contacts</a>
          </div>
        </div>
      </body>
      </html>
    `);
  });
}

// Start Server and Database Connection
const startServer = async () => {
  const isConnected = await connectDB();
  if (isConnected) {
    await seedInitialData();
  } else {
    localStore.init();
    console.log("[Storage] Local JSON store initialized with committee and festival data.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MHADA Utsav Server] Running on http://localhost:${PORT}`);
  });
};

startServer();
