// app/api/hr/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

/* ---------- GET: list HR requests ---------- */
// app/api/hr/route.ts
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT h.id,
             h.user_id,
             h.message,
             h.status,
             h.requested_at,
             u.first_name,
             u.last_name,
             u.username,
             u.email
      FROM hr_requests h
      JOIN users u ON h.user_id = u.id
      ORDER BY h.id DESC
    `;
    return NextResponse.json({ ok: true, items: rows });
  } catch (err) {
    console.error("GET /api/hr error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load HR requests" },
      { status: 500 }
    );
  }
}

/* ---------- POST: add new HR request ---------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.fromId || !body.message) {
      return NextResponse.json(
        { ok: false, error: "fromId and message are required" },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      INSERT INTO hr_requests (user_id, message)
      VALUES (${body.fromId}, ${body.message})
      RETURNING id, user_id, message, status, requested_at
    `;

    return NextResponse.json({ ok: true, request: rows[0] });
  } catch (err) {
    console.error("POST /api/hr error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to add HR request" },
      { status: 500 }
    );
  }
}
