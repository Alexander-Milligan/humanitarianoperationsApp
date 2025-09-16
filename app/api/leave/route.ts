export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "../../../db/db";

/* ---------- GET all leave requests ---------- */
export async function GET() {
  try {
    const { rows } = await query`
      SELECT id, employee_id, start_date, end_date, reason, status, requested_at
      FROM leave_requests
      ORDER BY id DESC
    `;
    return NextResponse.json({ ok: true, items: rows });
  } catch (err) {
    console.error("Leave GET error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch" },
      { status: 500 }
    );
  }
}

/* ---------- POST new leave request ---------- */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { employeeId, start, end, reason } = data;

    if (!employeeId || !start || !end || !reason) {
      return NextResponse.json(
        { ok: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    const { rows } = await query`
      INSERT INTO leave_requests (employee_id, start_date, end_date, reason)
      VALUES (${employeeId}, ${start}, ${end}, ${reason})
      RETURNING id, employee_id, start_date, end_date, reason, status, requested_at
    `;

    return NextResponse.json({ ok: true, item: rows[0] });
  } catch (err) {
    console.error("Leave POST error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create" },
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
      RETURNING id, employee_id, start_date, end_date, reason, status, requested_at
    `;

    if (!rows.length) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
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
