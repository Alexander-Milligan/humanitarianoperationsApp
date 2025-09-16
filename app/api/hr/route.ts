export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "../../../db/db";

/* ---------- HR Request Type ---------- */
type HrRequest = {
  id: number;
  user_id: number;
  message: string;
  status: string;
  requested_at: string; // ISO timestamp
};

/* ---------- GET: return all HR requests ---------- */
export async function GET() {
  try {
    const { rows } = await query`
      SELECT id, user_id, message, status, requested_at
      FROM hr_requests
      ORDER BY id DESC
    `;

    return NextResponse.json({ ok: true, items: rows as HrRequest[] });
  } catch (err) {
    console.error("GET /api/hr error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load HR requests" },
      { status: 500 }
    );
  }
}

/* ---------- POST: submit new HR request ---------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromId, message } = body;

    if (!fromId || !message) {
      return NextResponse.json(
        { ok: false, error: "fromId and message are required" },
        { status: 400 }
      );
    }

    const { rows } = await query`
      INSERT INTO hr_requests (user_id, message)
      VALUES (${fromId}, ${message})
      RETURNING id, user_id, message, status, requested_at
    `;

    return NextResponse.json({ ok: true, request: rows[0] as HrRequest });
  } catch (err) {
    console.error("POST /api/hr error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to add HR request" },
      { status: 500 }
    );
  }
}
