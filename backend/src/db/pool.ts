import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;
const useSsl =
  env.NODE_ENV === "production" &&
  (env.DATABASE_URL.includes("render.com") || env.DATABASE_URL.includes("sslmode=require"));

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined
});
