import "dotenv/config";
import cors from "cors";
import express from "express";
import { MAX_BODY_BYTES } from "./ai-server/guard.js";
import { aiRouter } from "./routes/ai/index.js";

const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGINS = (process.env.CORS_ORIGIN?.trim() || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.use(
  cors({
    origin: CORS_ORIGINS.length === 1 ? CORS_ORIGINS[0] : CORS_ORIGINS,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Gemini-Key"],
  }),
);

app.use(
  express.json({
    limit: MAX_BODY_BYTES,
  }),
);

app.get("/", (_req, res) => {
  res.json({
    name: "Reclaim AI API",
    health: "/api/ai/health",
  });
});

app.use("/api/ai", aiRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found", code: "BAD_REQUEST" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Reclaim AI backend listening on http://0.0.0.0:${PORT}`);
  console.log(`CORS origin: ${CORS_ORIGINS.join(", ")}`);
});
