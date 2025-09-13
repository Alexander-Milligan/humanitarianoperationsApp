export const runtime = "nodejs";

import { NextResponse } from "next/server";
import {
  addLeaveRequest,
  listLeaveRequests,
  updateLeaveStatus,
} from "@/lib/store";

/* ---------- GET all leave requests ---------- */
export async function GET() {
  try {
    const items = listLeaveRequests();
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("Leave GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch" }, { status: 500 });
  }
}

/* ---------- POST new leave request ---------- */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { employeeId, start, end, reason } = data;

    if (!employeeId || !start || !end || !reason) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const item = addLeaveRequest({ employeeId, start, end, reason });
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("Leave POST error:", err);
    return NextResponse.json({ ok: false, error: "Failed to create" }, { status: 500 });
  }
}

/* ---------- PATCH update leave status ---------- */
export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    const { id, status } = data;

    if (!id || !status) {
      return NextResponse.json({ ok: false, error: "Missing id/status" }, { status: 400 });
    }

    const item = updateLeaveStatus(Number(id), status);
    if (!item) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("Leave PATCH error:", err);
    return NextResponse.json({ ok: false, error: "Update failed" }, { status: 500 });
  }
}
