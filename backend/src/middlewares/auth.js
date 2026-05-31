import "dotenv/config";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function createToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function getAuthToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }
  return token;
}

export async function requireAuth(req, res, next) {
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
