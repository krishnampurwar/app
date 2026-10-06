/**
 * AJ Heaven's Harvest Nursery — API server.
 *
 * Deliberately stateless: AI logic + lead email only, no database. All catalog, service,
 * location, project and plan content is static JSON served by the frontend.
 *
 * Every route is mounted under /api so one reverse proxy rule covers the whole API.
 */

import "dotenv/config";
import cors from "cors";
import express from "express";
import { router as aiRouter } from "./routes/ai.js";
import { router as leadsRouter } from "./routes/leads.js";

const app = express();
const PORT = Number(process.env.PORT || 8001);
const HOST = process.env.HOST || "0.0.0.0";

const origins = (process.env.CORS_ORIGINS || "*").split(",").map((s) => s.trim());
app.use(cors({ origin: origins.includes("*") ? true : origins, credentials: true }));

// Photos arrive as base64 data URLs, so the body limit has to be generous.
app.use(express.json({ limit: "25mb" }));

app.use((req, _res, next) => {
  if (req.path !== "/api/health") console.log(`${req.method} ${req.path}`);
  next();
});

const api = express.Router();

api.get("/", (_req, res) => res.json({ message: "AJ Heaven's Harvest Nursery API" }));
api.get("/health", (_req, res) => res.json({ status: "ok", stateless: true }));

api.use(aiRouter);
api.use(leadsRouter);

app.use("/api", api);

app.use((req, res) => res.status(404).json({ detail: `No route for ${req.method} ${req.path}` }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[unhandled]", err);
  res.status(500).json({ detail: "Internal server error" });
});

app.listen(PORT, HOST, () => {
  console.log(`AJ Nursery API listening on http://${HOST}:${PORT} (no database)`);
});
