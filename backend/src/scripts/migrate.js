import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";
import "dotenv/config";

const { Client } = pg;

const run = async () => {
  const connectionString = process.env.DATABASE_URL;
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const useSsl =
    nodeEnv === "production" &&
    Boolean(
      connectionString?.includes("render.com") || connectionString?.includes("sslmode=require")
    );

  const client = new Client({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined
  });
  await client.connect();

  try {
    const sql = readFileSync(resolve(process.cwd(), "src/db/schema.sql"), "utf-8");
    try {
      await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
    } catch (error) {
      // Managed Postgres providers can block extension creation; continue when unavailable.
      console.warn("Extension pgcrypto non creee automatiquement, continuation migration.");
      console.warn(error instanceof Error ? error.message : error);
    }
    await client.query(sql);
    console.log("Migration terminee.");
  } finally {
    await client.end();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
