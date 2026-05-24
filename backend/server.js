import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");
const clothesUploadsDir = path.join(uploadsDir, "clothes");

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const DATABASE_URL = process.env.DATABASE_URL;
const REMOVE_BG_API_URL = "https://api.remove.bg/v1.0/removebg";

// S3 configuration (optional). If `AWS_S3_BUCKET` and credentials are set,
// uploads will go to S3 and DB will store the S3 URL. Otherwise fallback to
// local filesystem under /uploads.
const S3_BUCKET = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET;
const S3_REGION = process.env.AWS_REGION || process.env.S3_REGION || "us-east-1";
const S3_ENDPOINT = process.env.S3_ENDPOINT || null; // optional custom endpoint
const S3_PUBLIC_BASE_URL = process.env.S3_PUBLIC_BASE_URL || null;
const S3_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY;

const s3Client = S3_BUCKET && S3_ACCESS_KEY && S3_SECRET_KEY
  ? new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
  })
  : null;

const pool = DATABASE_URL
  ? new Pool({ connectionString: DATABASE_URL })
  : null;

async function ensureUploadFolders() {
  await fs.mkdir(clothesUploadsDir, { recursive: true });
}

async function query(text, params) {
  if (!pool) {
    throw new Error("DATABASE_URL is not configured");
  }

  return pool.query(text, params);
}

function createToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function getAuthToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }
  return token;
}

function getImageAccessToken(req) {
  const headerToken = getAuthToken(req);
  if (headerToken) {
    return headerToken;
  }

  const queryToken = req.query?.token;
  return typeof queryToken === "string" && queryToken.trim() ? queryToken.trim() : null;
}

async function requireAuth(req, res, next) {
  try {
    const token = getAuthToken(req);
    if (!token) {
      return res.status(401).json({ ok: false, message: "Authorization token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub;
    const result = await query(
      `SELECT id, name, email, avatar_url, bio, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (!result.rows.length) {
      return res.status(401).json({ ok: false, message: "User not found" });
    }

    req.user = result.rows[0];
    return next();
  } catch (error) {
    return res.status(401).json({ ok: false, message: "Invalid or expired token" });
  }
}

function sendDbUnavailable(res) {
  return res.status(500).json({
    ok: false,
    message: "DATABASE_URL is not configured on the server",
  });
}

function isS3ImageUrl(imageUrl) {
  return Boolean(S3_ENDPOINT && imageUrl && imageUrl.startsWith(S3_ENDPOINT.replace(/\/$/, "")));
}

function toPublicImageUrl(imageUrl) {
  if (!imageUrl) {
    return imageUrl;
  }

  if (!S3_PUBLIC_BASE_URL || !S3_ENDPOINT) {
    return imageUrl;
  }

  const privateBase = S3_ENDPOINT.replace(/\/$/, "");
  const publicBase = S3_PUBLIC_BASE_URL.replace(/\/$/, "");

  if (!imageUrl.startsWith(privateBase)) {
    return imageUrl;
  }

  const key = imageUrl.slice(privateBase.length).replace(/^\/+/, "");
  return `${publicBase}/${key}`;
}

function extractS3KeyFromImageUrl(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    return url.pathname.replace(/^\/+/, "");
  } catch (error) {
    return imageUrl.replace(/^\/+/, "");
  }
}

app.use(cors());
app.use(express.json({ limit: "4mb" }));
app.use("/uploads", express.static(uploadsDir));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "digital-wardrobe-backend", database: Boolean(pool) });
});

app.post("/api/auth/register", async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, message: "Name, email and password are required" });
    }

    const existing = await query("SELECT id FROM users WHERE email = $1", [email.trim().toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ ok: false, message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, avatar_url, bio, created_at`,
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const user = result.rows[0];
    await query("INSERT INTO profiles (user_id) VALUES ($1)", [user.id]);

    return res.status(201).json({
      ok: true,
      token: createToken(user),
      user,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Registration failed", details: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Email and password are required" });
    }

    const result = await query(
      `SELECT id, name, email, avatar_url, bio, password_hash, created_at
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (!result.rows.length) {
      return res.status(401).json({ ok: false, message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ ok: false, message: "Invalid credentials" });
    }

    delete user.password_hash;

    return res.json({ ok: true, token: createToken(user), user });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Login failed", details: error.message });
  }
});

app.get("/api/profile/me", requireAuth, async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const profile = await query(
      `SELECT id, user_id, display_name, avatar_url, bio, location, created_at, updated_at
       FROM profiles
       WHERE user_id = $1`,
      [req.user.id]
    );

    return res.json({ ok: true, user: req.user, profile: profile.rows[0] || null });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Profile load failed", details: error.message });
  }
});

app.put("/api/profile/me", requireAuth, async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const { displayName, bio, location, avatarUrl } = req.body || {};
    const result = await query(
      `UPDATE profiles
       SET display_name = COALESCE($2, display_name),
           bio = COALESCE($3, bio),
           location = COALESCE($4, location),
           avatar_url = COALESCE($5, avatar_url),
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING id, user_id, display_name, avatar_url, bio, location, created_at, updated_at`,
      [req.user.id, displayName || null, bio || null, location || null, avatarUrl || null]
    );

    return res.json({ ok: true, profile: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Profile update failed", details: error.message });
  }
});

app.get("/api/clothes", requireAuth, async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
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
});

app.post("/api/clothes", requireAuth, upload.single("image"), async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const { category, description } = req.body || {};
    if (!req.file?.buffer) {
      return res.status(400).json({ ok: false, message: "Image file is required" });
    }

    const extension = req.file.mimetype === "image/png" ? "png" : "jpg";
    const filename = `${Date.now()}-${randomUUID()}.${extension}`;
    const key = `clothes/${filename}`;

    let imageUrl;

    if (s3Client) {
      // Upload to S3-compatible storage
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

    const result = await query(
      `INSERT INTO clothes (user_id, image_url, category, description, visibility)
       VALUES ($1, $2, $3, $4, 'private')
       RETURNING id, user_id, image_url, category, description, visibility, created_at`,
      [req.user.id, imageUrl, category || null, description || null]
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
});

app.delete("/api/clothes/:id", requireAuth, async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    await query("DELETE FROM clothes WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Clothes delete failed", details: error.message });
  }
});

app.get("/api/clothes/:id/image", async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const token = getImageAccessToken(req);
    if (!token) {
      return res.status(401).json({ ok: false, message: "Authorization token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub;

    const result = await query(
      `SELECT id, user_id, image_url
       FROM clothes
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ ok: false, message: "Clothing not found" });
    }

    const clothing = result.rows[0];

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
    const absolutePath = path.join(__dirname, relativePath);
    return res.sendFile(absolutePath);
  } catch (error) {
    console.error("Clothing image load failed:", error);
    return res.status(500).json({ ok: false, message: "Image load failed", details: error.message });
  }
});

app.get("/api/outfits", requireAuth, async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const result = await query(
      `SELECT id, user_id, name, clothes_ids, visibility, created_at
       FROM outfits
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json({ ok: true, outfits: result.rows });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Outfits load failed", details: error.message });
  }
});

app.post("/api/outfits", requireAuth, async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const { name, clothesIds } = req.body || {};
    if (!name || !Array.isArray(clothesIds) || clothesIds.length === 0) {
      return res.status(400).json({ ok: false, message: "name and clothesIds are required" });
    }

    const result = await query(
      `INSERT INTO outfits (user_id, name, clothes_ids, visibility)
       VALUES ($1, $2, $3, 'private')
       RETURNING id, user_id, name, clothes_ids, visibility, created_at`,
      [req.user.id, name.trim(), clothesIds]
    );

    return res.status(201).json({ ok: true, outfit: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Outfit save failed", details: error.message });
  }
});

app.delete("/api/outfits/:id", requireAuth, async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    await query("DELETE FROM outfits WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Outfit delete failed", details: error.message });
  }
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

// ===== SOCIAL FEATURES ENDPOINTS =====

// GET /api/users/:userId/clothes - Other user's public clothes
app.get("/api/users/:userId/clothes", async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const result = await query(
      `SELECT id, user_id, image_url, category, description, created_at
       FROM clothes
       WHERE user_id = $1 AND visibility = 'public'
       ORDER BY created_at DESC`,
      [req.params.userId]
    );

    return res.json({
      ok: true,
      clothes: result.rows.map((row) => ({
        ...row,
        image_url: toPublicImageUrl(row.image_url),
      })),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load clothes" });
  }
});

// PUT /api/clothes/:id/visibility - Toggle visibility
app.put("/api/clothes/:id/visibility", requireAuth, async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
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
});

// GET /api/users/:userId/outfits - Other user's public outfits
app.get("/api/users/:userId/outfits", async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const result = await query(
      `SELECT id, user_id, name, clothes_ids, created_at
       FROM outfits
       WHERE user_id = $1 AND visibility = 'public'
       ORDER BY created_at DESC`,
      [req.params.userId]
    );

    return res.json({ ok: true, outfits: result.rows });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load outfits" });
  }
});

// PUT /api/outfits/:id/visibility - Toggle outfit visibility
app.put("/api/outfits/:id/visibility", requireAuth, async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
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
      `UPDATE outfits
       SET visibility = $2, updated_at = NOW()
       WHERE id = $1 AND user_id = $3
       RETURNING id, user_id, name, clothes_ids, visibility, created_at`,
      [req.params.id, visibility, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ ok: false, message: "Outfit not found" });
    }

    return res.json({ ok: true, outfit: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to update outfit visibility" });
  }
});

// GET /api/discover/outfits - Global public outfits feed
app.get("/api/discover/outfits", async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const sort = req.query.sort || "recent";

    let orderBy = "o.created_at DESC";
    if (sort === "trending") {
      orderBy = "COALESCE((SELECT COUNT(*) FROM saved_outfits WHERE outfit_id = o.id), 0) DESC, o.created_at DESC";
    }

    const result = await query(
      `SELECT o.id, o.user_id, o.name, o.clothes_ids, o.created_at,
              u.name as creator_name, u.avatar_url as creator_avatar,
              COALESCE((SELECT COUNT(*) FROM saved_outfits WHERE outfit_id = o.id), 0) as save_count
       FROM outfits o
       JOIN users u ON u.id = o.user_id
       WHERE o.visibility = 'public'
       ORDER BY ${orderBy}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM outfits WHERE visibility = 'public'`
    );
    const total = parseInt(countResult.rows[0].total);

    return res.json({
      ok: true,
      outfits: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load discover feed" });
  }
});

// GET /api/discover/clothes - Global public clothes feed
app.get("/api/discover/clothes", async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const sort = req.query.sort || "recent";

    let orderBy = "c.created_at DESC";
    if (sort === "trending") {
      orderBy = "c.created_at DESC"; // Can add favorite count later
    }

    const result = await query(
      `SELECT c.id, c.user_id, c.image_url, c.category, c.description, c.created_at,
              u.name as creator_name, u.avatar_url as creator_avatar
       FROM clothes c
       JOIN users u ON u.id = c.user_id
       WHERE c.visibility = 'public'
       ORDER BY ${orderBy}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM clothes WHERE visibility = 'public'`
    );
    const total = parseInt(countResult.rows[0].total);

    return res.json({
      ok: true,
      clothes: result.rows.map((row) => ({
        ...row,
        image_url: toPublicImageUrl(row.image_url),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load discover clothes" });
  }
});

// POST /api/saved-outfits - Save an outfit
app.post("/api/saved-outfits", requireAuth, async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const { outfit_id } = req.body;

    if (!outfit_id) {
      return res.status(400).json({ ok: false, message: "outfit_id is required" });
    }

    const outfitCheck = await query(
      `SELECT id FROM outfits WHERE id = $1 AND visibility = 'public'`,
      [outfit_id]
    );

    if (!outfitCheck.rows.length) {
      return res.status(404).json({ ok: false, message: "Outfit not found or not public" });
    }

    const result = await query(
      `INSERT INTO saved_outfits (id, user_id, outfit_id, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, outfit_id) DO NOTHING
       RETURNING id, user_id, outfit_id, created_at`,
      [randomUUID(), req.user.id, outfit_id]
    );

    return res.status(201).json({
      ok: true,
      saved_outfit: result.rows[0] || { message: "Already saved" },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to save outfit" });
  }
});

// GET /api/saved-outfits - Get my saved outfits
app.get("/api/saved-outfits", requireAuth, async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const result = await query(
      `SELECT o.id, o.user_id, o.name, o.clothes_ids, o.created_at,
              u.name as creator_name, u.avatar_url as creator_avatar,
              so.created_at as saved_at
       FROM saved_outfits so
       JOIN outfits o ON o.id = so.outfit_id
       JOIN users u ON u.id = o.user_id
       WHERE so.user_id = $1
       ORDER BY so.created_at DESC`,
      [req.user.id]
    );

    return res.json({ ok: true, saved_outfits: result.rows });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load saved outfits" });
  }
});

// DELETE /api/saved-outfits/:outfitId - Remove saved outfit
app.delete("/api/saved-outfits/:outfitId", requireAuth, async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    await query(
      `DELETE FROM saved_outfits WHERE user_id = $1 AND outfit_id = $2`,
      [req.user.id, req.params.outfitId]
    );

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to delete saved outfit" });
  }
});

// GET /api/users/:userId/profile - Get user's public profile
app.get("/api/users/:userId/profile", async (req, res) => {
  if (!pool) {
    return sendDbUnavailable(res);
  }

  try {
    const userResult = await query(
      `SELECT id, name, avatar_url, bio, created_at FROM users WHERE id = $1`,
      [req.params.userId]
    );

    if (!userResult.rows.length) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    const profileResult = await query(
      `SELECT display_name, avatar_url, bio, location FROM profiles WHERE user_id = $1`,
      [req.params.userId]
    );

    const user = userResult.rows[0];
    const profile = profileResult.rows[0] || {};

    return res.json({
      ok: true,
      user: {
        ...user,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url || user.avatar_url,
        bio: profile.bio || user.bio,
        location: profile.location,
      },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to load profile" });
  }
});

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
