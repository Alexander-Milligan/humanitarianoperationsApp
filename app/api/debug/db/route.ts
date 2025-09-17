// app/api/debug/db/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const meta = await sql`SELECT current_database() AS db, current_user AS usr`;
    const users = await sql`
      SELECT id, username, email, role, password_hash
      FROM users
      ORDER BY id ASC
      LIMIT 10
    `;

    // 🔍 hardcoded test for admin123
    let adminCheck = null;
    const adminRow = users.rows.find((u) => u.username === "admin");
    if (adminRow) {
      const match = await bcrypt.compare("admin123", adminRow.password_hash);
      adminCheck = {
        username: adminRow.username,
        testedPassword: "admin123",
        storedHashLength: adminRow.password_hash.length,
        matches: match,
      };
    }

    return NextResponse.json({
      ok: true,
      db: meta.rows[0]?.db,
      user: meta.rows[0]?.usr,
      sampleUsers: users.rows.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
      })),
      adminCheck,
    });
  } catch (err) {
    console.error("Debug DB error:", err);
    return NextResponse.json(
      { ok: false, error: "Cannot read database" },
      { status: 500 }
    );
  }
}
