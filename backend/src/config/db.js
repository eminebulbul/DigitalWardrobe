import "dotenv/config";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

export const pool = DATABASE_URL
  ? new Pool({ connectionString: DATABASE_URL })
  : null;

export async function query(text, params) {
  if (!pool) {
    throw new Error("DATABASE_URL is not configured");
  }

  return pool.query(text, params);
}
