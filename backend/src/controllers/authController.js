import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { createToken } from "../middlewares/auth.js";

export async function register(req, res) {
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
}

export async function login(req, res) {
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
}
