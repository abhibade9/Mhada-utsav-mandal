import { getBackendOrigin } from "../services/api";

export const DEFAULT_LOGO = "/logo.jpg";
export const FALLBACK_SVG_LOGO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23780C1E" stroke="%23D4AF37" stroke-width="4"/><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-size="34" fill="%23D4AF37">🕉️</text></svg>`;

/**
 * Resolves media URLs (gallery photos, banners, event posters, uploaded pictures)
 * so that they work reliably across all deployment configurations:
 * - Same domain (e.g. https://yourdomain.com/uploads/...)
 * - Split domain (e.g. Frontend on Vercel, Backend on Render)
 * - Linux host setups (IP/domain, port 5000/5173)
 * - Subdirectory / Custom Base path (import.meta.env.BASE_URL)
 * - Stored localhost URLs from local development
 */
export const getMediaUrl = (url, fallback = "") => {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return fallback;
  }

  // Base64 data URLs & Blob URLs
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  let backendOrigin = getBackendOrigin();

  // If running in development on port 5173 without VITE_BACKEND_URL set, route to backend port 5000
  if (!backendOrigin && typeof window !== "undefined" && window.location && window.location.port === "5173") {
    backendOrigin = `http://${window.location.hostname}:5000`;
  }

  // If local development hardcoded localhost:5000 in DB
  if (trimmed.includes("localhost:5000/uploads/")) {
    const filename = trimmed.split("/uploads/")[1];
    if (backendOrigin) {
      return `${backendOrigin}/uploads/${filename}`;
    }
    return `/uploads/${filename}`;
  }

  // Already absolute URL (http:// or https://)
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  // If this is an uploaded image path (/uploads/...)
  if (normalized.startsWith("/uploads/")) {
    // If backend origin is defined (different domain/server), route to backend
    if (backendOrigin) {
      return `${backendOrigin}${normalized}`;
    }
    // Otherwise route to relative uploads (served by frontend static or same host)
    const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
    return `${base}${normalized}`;
  }

  // Relative static asset path like /logo.jpg
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  return `${base}${normalized}`;
};

/**
 * Image error handler that provides a graceful fallback rather than leaving blank spaces
 */
export const handleImageError = (e, fallback = DEFAULT_LOGO) => {
  const target = e.currentTarget || e.target;
  if (!target) return;

  const currentSrc = target.getAttribute("src") || "";
  let backendOrigin = getBackendOrigin();
  if (!backendOrigin && typeof window !== "undefined" && window.location && window.location.port === "5173") {
    backendOrigin = `http://${window.location.hostname}:5000`;
  }

  // 1. If it was trying to load /uploads/... relatively and failed, try backend if available
  if (backendOrigin && currentSrc.startsWith("/uploads/") && !currentSrc.startsWith(backendOrigin)) {
    target.src = `${backendOrigin}${currentSrc}`;
    return;
  }

  // 2. Try extension variation for Linux case/format discrepancies (.jpg <-> .jpeg)
  if (currentSrc.includes("/uploads/")) {
    if (currentSrc.endsWith(".jpeg") && !target.dataset.triedJpg) {
      target.dataset.triedJpg = "true";
      target.src = currentSrc.replace(/\.jpeg$/i, ".jpg");
      return;
    }
    if (currentSrc.endsWith(".jpg") && !target.dataset.triedJpeg) {
      target.dataset.triedJpeg = "true";
      target.src = currentSrc.replace(/\.jpg$/i, ".jpeg");
      return;
    }
  }

  // 3. Fallback to default logo if not tried yet
  if (fallback && !currentSrc.endsWith(fallback) && currentSrc !== fallback) {
    target.src = fallback;
    return;
  }

  // 4. As final safety net, use embedded SVG logo so broken image icon never shows
  if (target.src !== FALLBACK_SVG_LOGO) {
    target.src = FALLBACK_SVG_LOGO;
    return;
  }

  // As a last resort, style it cleanly without breaking page layout
  target.style.opacity = "0.6";
};
