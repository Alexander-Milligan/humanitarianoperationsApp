export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDB();

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin','employee') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create employees table
    await db.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        position VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        salary DECIMAL(10,2) NOT NULL,
        join_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin user (password = admin123)
    await db.query(`
      INSERT IGNORE INTO users (username, password, role)
      VALUES ('admin', '$2a$10$w9XddHyKObOT8sB/F7J/Mej/En7KmXJo7iIdnHTHqkWNYF1uL90nq', 'admin')
    `);

    await db.end();

    return NextResponse.json({
      ok: true,
      message: "Tables created and default admin user added (username: admin, password: admin123)."
    });
  } catch (err: unknown) {
  console.error("SETUP ERROR:", err);  // 👈 print full error in terminal
  const error = err as Error;
  return NextResponse.json(
    {
      ok: false,
      error: error.message || "Unknown error",
      details: JSON.stringify(err, null, 2) // 👈 show full error
    },
    { status: 500 }
  );
}
}
