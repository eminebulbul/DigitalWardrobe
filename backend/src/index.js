import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { pool } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import clothesRoutes from "./routes/clothesRoutes.js";
import outfitRoutes from "./routes/outfitRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");
const clothesUploadsDir = path.join(uploadsDir, "clothes");
const PORT = process.env.PORT || 3001;

async function ensureUploadFolders() {
  await fs.mkdir(clothesUploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: "4mb" }));
app.use("/uploads", express.static(uploadsDir));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "digital-wardrobe-backend", database: Boolean(pool) });
});

app.use("/api/auth", authRoutes);
app.use("/api/clothes", clothesRoutes);
app.use("/api", outfitRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", profileRoutes);

async function startServer() {
  await ensureUploadFolders();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Digital wardrobe backend running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});

export default app;
