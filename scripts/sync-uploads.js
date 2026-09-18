import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const serverUploads = path.join(rootDir, "server", "uploads");
const clientPublicUploads = path.join(rootDir, "client", "public", "uploads");

try {
  if (!fs.existsSync(serverUploads)) {
    fs.mkdirSync(serverUploads, { recursive: true });
  }
  if (!fs.existsSync(clientPublicUploads)) {
    fs.mkdirSync(clientPublicUploads, { recursive: true });
  }

  // 1. Sync server/uploads -> client/public/uploads
  const serverFiles = fs.readdirSync(serverUploads);
  let countToClient = 0;
  for (const file of serverFiles) {
    if (file === ".gitkeep") continue;
    const src = path.join(serverUploads, file);
    const dest = path.join(clientPublicUploads, file);
    if (fs.statSync(src).isFile() && !fs.existsSync(dest)) {
      try {
        fs.copyFileSync(src, dest);
        countToClient++;
      } catch (e) {
        // ignore copy conflicts
      }
    }
  }

  // 2. Sync client/public/uploads -> server/uploads (bidirectional)
  const clientFiles = fs.readdirSync(clientPublicUploads);
  let countToServer = 0;
  for (const file of clientFiles) {
    if (file === ".gitkeep") continue;
    const src = path.join(clientPublicUploads, file);
    const dest = path.join(serverUploads, file);
    if (fs.statSync(src).isFile() && !fs.existsSync(dest)) {
      try {
        fs.copyFileSync(src, dest);
        countToServer++;
      } catch (e) {
        // ignore copy conflicts
      }
    }
  }

  // 3. Ensure official logo.jpg is also mirrored to server uploads
  const clientLogo = path.join(rootDir, "client", "public", "logo.jpg");
  const serverUploadsLogo = path.join(serverUploads, "logo.jpg");
  if (fs.existsSync(clientLogo) && !fs.existsSync(serverUploadsLogo)) {
    try {
      fs.copyFileSync(clientLogo, serverUploadsLogo);
      console.log("[sync-uploads] Mirrored logo.jpg -> server/uploads/logo.jpg");
    } catch (e) {
      // ignore
    }
  }

  console.log(`[sync-uploads] Sync complete. ${countToClient} file(s) to client, ${countToServer} file(s) to server.`);
} catch (err) {
  console.warn("[sync-uploads] Warning during uploads sync:", err.message);
}
