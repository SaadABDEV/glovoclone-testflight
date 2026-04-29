import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";
import "dotenv/config";

const { Client } = pg;

const run = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const sql = readFileSync(resolve(process.cwd(), "src/db/schema.sql"), "utf-8");
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
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
