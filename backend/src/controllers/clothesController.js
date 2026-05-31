import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { query } from "../config/db.js";
import {
  s3Client,
  PutObjectCommand,
  GetObjectCommand,
  S3_BUCKET,
  S3_REGION,
  S3_ENDPOINT,
  isS3ImageUrl,
  toPublicImageUrl,
  extractS3KeyFromImageUrl,
} from "../config/s3.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../../uploads");
const clothesUploadsDir = path.join(uploadsDir, "clothes");
const REMOVE_BG_API_URL = "https://api.remove.bg/v1.0/removebg";

async function ensureClothesFolder() {
  await fs.mkdir(clothesUploadsDir, { recursive: true });
}

export async function getClothes(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    const result = await query(
      `SELECT id, user_id, image_url, category, description, visibility, created_at
       FROM clothes
       WHERE user_id = $1
       ORDER BY category ASC, created_at DESC`,
      [req.user.id]
    );

    return res.json({
      ok: true,
      clothes: result.rows.map((row) => ({
        ...row,
        image_url: toPublicImageUrl(row.image_url),
      })),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Clothes load failed", details: error.message });
  }
}

export async function addCloth(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    await ensureClothesFolder();

    const { category, description, is_public, image_url } = req.body || {};
    let imageUrl = null;

    if (image_url) {
      imageUrl = image_url;
    } else {
      if (!req.file?.buffer) {
        return res.status(400).json({ ok: false, message: "Image file is required" });
      }

      const extension = req.file.mimetype === "image/png" ? "png" : "jpg";
      const filename = `${Date.now()}-${randomUUID()}.${extension}`;
      const key = `clothes/${filename}`;

      if (s3Client) {
        await s3Client.send(new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype || "image/jpeg",
        }));

        if (S3_ENDPOINT) {
          imageUrl = `${S3_ENDPOINT.replace(/\/$/, "")}/${key}`;
        } else {
          imageUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
        }
      } else {
        const relativePath = path.join("clothes", filename);
        const absolutePath = path.join(clothesUploadsDir, filename);
        await fs.writeFile(absolutePath, req.file.buffer);
        imageUrl = `/uploads/${relativePath.replaceAll(path.sep, "/")}`;
      }
    }

    const visibility = is_public === "true" || is_public === true ? "public" : "private";

    const result = await query(
      `INSERT INTO clothes (user_id, image_url, category, description, visibility)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, image_url, category, description, visibility, created_at`,
      [req.user.id, imageUrl, category || null, description || null, visibility]
    );

    return res.status(201).json({
      ok: true,
      cloth: {
        ...result.rows[0],
        image_url: toPublicImageUrl(result.rows[0].image_url),
      },
    });
  } catch (error) {
    console.error("Clothes save failed:", error);
    return res.status(500).json({ ok: false, message: "Clothes save failed", details: error.message });
  }
}

export async function deleteCloth(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    await query("DELETE FROM clothes WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Clothes delete failed", details: error.message });
  }
}

export async function getClothImage(req, res) {
  try {
    const token = req.query?.token || null;
    let userId = null;

    if (token) {
      try {
        const jwt = await import("jsonwebtoken");
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || "dev-secret-change-me");
        userId = decoded.sub;
      } catch (e) {
        // Invalid token, continue as unauthenticated
      }
    }

    const clothResult = await query(
      `SELECT id, user_id, image_url, visibility
       FROM clothes
       WHERE id = $1`,
      [req.params.id]
    );

    if (!clothResult.rows.length) {
      return res.status(404).json({ ok: false, message: "Clothing not found" });
    }

    const clothing = clothResult.rows[0];
    const isPublic = clothing.visibility === "public";

    if (!isPublic && (!userId || userId !== clothing.user_id)) {
      return res.status(403).json({ ok: false, message: "Access denied" });
    }

    if (isS3ImageUrl(clothing.image_url) && s3Client) {
      const key = extractS3KeyFromImageUrl(clothing.image_url);
      if (!key) {
        return res.status(500).json({ ok: false, message: "Invalid image key" });
      }

      const objectResponse = await s3Client.send(
        new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
        })
      );

      res.setHeader("Content-Type", objectResponse.ContentType || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=3600");
      if (objectResponse.Body?.pipe) {
        objectResponse.Body.pipe(res);
        return;
      }

      const buffer = Buffer.from(await objectResponse.Body.transformToByteArray());
      return res.status(200).send(buffer);
    }

    const relativePath = clothing.image_url.replace(/^\/+/, "");
    const absolutePath = path.join(__dirname, "../..", relativePath);
    return res.sendFile(absolutePath);
  } catch (error) {
    console.error("Clothing image load failed:", error);
    return res.status(500).json({ ok: false, message: "Image load failed", details: error.message });
  }
}

export async function toggleVisibility(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    const { visibility } = req.body;

    if (!visibility || !["private", "public"].includes(visibility)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid visibility value. Use 'private' or 'public'",
      });
    }

    const result = await query(
      `UPDATE clothes
       SET visibility = $2, updated_at = NOW()
       WHERE id = $1 AND user_id = $3
       RETURNING id, user_id, image_url, category, description, visibility, created_at`,
      [req.params.id, visibility, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ ok: false, message: "Clothing not found" });
    }

    return res.json({
      ok: true,
      cloth: {
        ...result.rows[0],
        image_url: toPublicImageUrl(result.rows[0].image_url),
      },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to update visibility" });
  }
}

export async function toggleFavoriteCloth(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    const clothId = req.params.id;

    const clothResult = await query(
      `SELECT id, user_id, image_url, category, description, visibility, created_at
       FROM clothes
       WHERE id = $1 AND visibility = 'public'`,
      [clothId]
    );

    if (!clothResult.rows.length) {
      return res.status(404).json({ ok: false, message: "Clothing not found or not public" });
    }

    const existingFavorite = await query(
      `SELECT user_id, cloth_id FROM favorite_clothes WHERE user_id = $1 AND cloth_id = $2`,
      [req.user.id, clothId]
    );

    if (existingFavorite.rows.length) {
      await query(
        `DELETE FROM favorite_clothes WHERE user_id = $1 AND cloth_id = $2`,
        [req.user.id, clothId]
      );

      return res.json({ ok: true, favorite: false, message: "Cloth unfavorited" });
    }

    await query(
      `INSERT INTO favorite_clothes (user_id, cloth_id)
       VALUES ($1, $2)`,
      [req.user.id, clothId]
    );

    return res.status(201).json({ ok: true, favorite: true, cloth: clothResult.rows[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to toggle favorite cloth", details: error.message });
  }
}

export async function getFavoriteClothes(req, res) {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Authorization token missing" });
  }

  try {
    const result = await query(
      `SELECT c.id, c.user_id, c.image_url, c.category, c.description, c.visibility, c.created_at,
              fc.created_at as favorited_at
       FROM favorite_clothes fc
       JOIN clothes c ON c.id = fc.cloth_id
       WHERE fc.user_id = $1
       ORDER BY fc.created_at DESC`,
      [req.user.id]
    );

    return res.json({
      ok: true,
      clothes: result.rows.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        image_url: toPublicImageUrl(row.image_url),
        category: row.category,
        description: row.description,
        visibility: row.visibility,
        created_at: row.created_at,
        favorited_at: row.favorited_at,
      })),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load favorite clothes", details: error.message });
  }
}

export async function removeBackground(req, res) {
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
}
