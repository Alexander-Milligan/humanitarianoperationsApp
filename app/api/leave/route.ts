export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "../../../db/db";

/* ---------- GET all leave requests ---------- */
export async function GET() {
  try {
    const { rows } = await query`
      SELECT id, user_id, start_date, end_date, reason, status, requested_at
      FROM leave_requests
      ORDER BY id DESC
    `;
    return NextResponse.json({ ok: true, items: rows });
  } catch (err) {
    console.error("Leave GET error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}

/* ---------- POST new leave request ---------- */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { userId, start, end, reason } = data;

    if (!userId || !start || !end || !reason) {
      return NextResponse.json(
        { ok: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    const { rows } = await query`
      INSERT INTO leave_requests (user_id, start_date, end_date, reason)
      VALUES (${userId}, ${start}, ${end}, ${reason})
      RETURNING id, user_id, start_date, end_date, reason, status, requested_at
    `;

    return NextResponse.json({ ok: true, item: rows[0] });
  } catch (err) {
    console.error("Leave POST error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create leave request" },
      { status: 500 }
    );
  }
}

/* ---------- PATCH update leave status ---------- */
export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    const { id, status } = data;

    if (!id || !status) {
      return NextResponse.json(
        { ok: false, error: "Missing id/status" },
        { status: 400 }
      );
    }

    const { rows } = await query`
      UPDATE leave_requests
      SET status = ${status}
      WHERE id = ${id}
      RETURNING id, user_id, start_date, end_date, reason, status, requested_at
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Leave request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, item: rows[0] });
  } catch (err) {
    console.error("Leave PATCH error:", err);
    return NextResponse.json(
      { ok: false, error: "Update failed" },
      { status: 500 }
    );
  }
}
