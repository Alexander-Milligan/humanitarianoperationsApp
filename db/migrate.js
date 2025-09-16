import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // 👈 force load .env.local
console.log("DEBUG POSTGRES_URL:", process.env.POSTGRES_URL);

import { createPool } from "@vercel/postgres";
import { readFileSync } from "fs";
import path from "path";

async function main() {
  // Debug check
  console.log("DEBUG POSTGRES_URL:", process.env.POSTGRES_URL);

  const pool = createPool({ connectionString: process.env.POSTGRES_URL });

  try {
    // Load schema.sql
    const schema = readFileSync(
      path.join(process.cwd(), "db/schema.sql"),
      "utf8"
    );

    // Split into individual SQL statements
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Run each statement
    for (const statement of statements) {
      console.log("Running:", statement.slice(0, 60) + "...");
      await pool.query(statement);
    }

    console.log("✅ Tables created successfully");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
