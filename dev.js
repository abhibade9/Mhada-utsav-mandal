import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

console.log("=========================================================");
console.log("  🕉️  MHADA Towers Utsav Mandal - Full Stack Launcher");
console.log("=========================================================");
console.log("[1/2] Starting Backend API on http://localhost:5000 ...");

const server = spawn(npmCmd, ["start"], {
  cwd: path.join(__dirname, "server"),
  stdio: "inherit",
  shell: true
});

console.log("[2/2] Starting Frontend App on http://localhost:5173 ...");

const client = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(__dirname, "client"),
  stdio: "inherit",
  shell: true
});

const cleanup = () => {
  console.log("\n[Launcher] Stopping services...");
  try {
    if (isWin) {
      if (server.pid) spawn("taskkill", ["/pid", server.pid, "/f", "/t"]);
      if (client.pid) spawn("taskkill", ["/pid", client.pid, "/f", "/t"]);
    } else {
      server.kill("SIGTERM");
      client.kill("SIGTERM");
    }
  } catch (e) {
    // ignore
  }
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
