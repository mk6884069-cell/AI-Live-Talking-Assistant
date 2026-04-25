import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Example API for checking minutes (for production-ready feel)
  app.get("/api/usage", (req, res) => {
    res.json({ minutes_remaining: 120, total_calls: 15 });
  });

  // WebRTC Signaling Endpoint
  // In a real production app, this would handle complex peer routing
  // For this AI assistant, it facilitates the handshake for low-latency streaming
  app.post("/api/signaling", (req, res) => {
    const { type, sdp, candidate } = req.body;
    
    // Simple echo-back or mock-answer logic for the AI handshake
    // In a full implementation, this would communicate with the AI processing service
    if (type === "offer") {
      console.log("WebRTC Offer received, generating response...");
      res.json({
         type: "answer",
         sdp: sdp // Simulating a direct peer loopback or AI-injection point
      });
    } else if (candidate) {
      console.log("ICE Candidate received");
      res.json({ status: "candidate_received" });
    } else {
      res.status(400).json({ error: "Invalid signaling payload" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
