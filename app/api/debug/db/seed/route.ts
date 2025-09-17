// app/api/debug/db/seed/route.ts
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const adminHash = await bcrypt.hash("admin123", 10);
    const aliceHash = await bcrypt.hash("alice123", 10);

    // Clear existing users
    await sql`DELETE FROM users`;

    // Insert fresh users
    await sql`
      INSERT INTO users (email, username, password_hash, role)
      VALUES
        ('admin@example.com', 'admin', ${adminHash}, 'admin'),
        ('alice@example.com', 'alice', ${aliceHash}, 'hr')
    `;

    return NextResponse.json({ ok: true, message: "✅ Users seeded" });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
