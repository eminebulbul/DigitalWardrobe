import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const PORT = process.env.PORT || 3001;
const REMOVE_BG_API_URL = "https://api.remove.bg/v1.0/removebg";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "background-removal-api" });
});

app.post("/api/remove-background", upload.single("image"), async (req, res) => {
  try {
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        message: "Server config missing: REMOVE_BG_API_KEY",
      });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({
        ok: false,
        message: "No image uploaded. Send multipart/form-data with field name 'image'.",
      });
    }

    const formData = new FormData();
    const blob = new Blob([req.file.buffer], {
      type: req.file.mimetype || "image/jpeg",
    });

    formData.append("image_file", blob, req.file.originalname || "photo.jpg");
    formData.append("size", "auto");

    const response = await fetch(REMOVE_BG_API_URL, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        ok: false,
        message: "remove.bg request failed",
        details: errorText,
      });
    }

    const output = Buffer.from(await response.arrayBuffer());
    const imageBase64 = output.toString("base64");

    return res.status(200).json({
      ok: true,
      imageBase64,
      mimeType: "image/png",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Unexpected server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Background removal API running on http://localhost:${PORT}`);
});
