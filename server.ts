import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // --- Autonomous Robot Logic ---
  let botStatus = "Idle";
  let lastCheck = new Date().toISOString();
  let logs: string[] = [];

  const runMaintenance = () => {
    botStatus = "Running Maintenance...";
    const timestamp = new Date().toLocaleTimeString();
    const actions = [
      "Checking database integrity...",
      "Optimizing studio assets...",
      "Scanning for production bottlenecks...",
      "Syncing cloud metadata...",
      "Cleaning temporary cache...",
      "Auditing artist roster for missing metadata...",
      "Verifying session scheduling conflicts...",
      "Analyzing release timeline for delays..."
    ];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const logEntry = `[${timestamp}] BOT: ${action}`;
    logs.unshift(logEntry);
    if (logs.length > 50) logs.pop();
    
    setTimeout(() => {
      botStatus = "Monitoring System";
      lastCheck = new Date().toISOString();
    }, 2000);
  };

  // Run maintenance every 60 seconds automatically
  setInterval(runMaintenance, 60000);
  runMaintenance(); // Initial run

  // API Routes
  app.get("/api/bot/status", (req, res) => {
    res.json({ status: botStatus, lastCheck, logs });
  });

  app.post("/api/bot/trigger", (req, res) => {
    runMaintenance();
    res.json({ message: "Maintenance triggered manually" });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EMS Full-Stack Server running on http://localhost:${PORT}`);
    console.log(`Autonomous Studio Bot initialized.`);
  });
}

startServer();
