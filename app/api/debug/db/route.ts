// app/api/debug/db/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    const meta = await sql`SELECT current_database() AS db, current_user AS usr`;
    const users = await sql`
      SELECT id, username, email, role
      FROM users
      ORDER BY id ASC
      LIMIT 10
    `;
    return NextResponse.json({
      ok: true,
      db: meta.rows[0]?.db,
      user: meta.rows[0]?.usr,
      sampleUsers: users.rows,
    });
  } catch (err) {
    console.error("Debug DB error:", err);
    return NextResponse.json({ ok: false, error: "Cannot read database" }, { status: 500 });
  }
}
