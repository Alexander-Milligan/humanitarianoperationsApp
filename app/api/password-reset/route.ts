export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "../../../db/db";
import bcrypt from "bcryptjs";

/* ---------- GET: list all reset requests (admin) ---------- */
export async function GET() {
  try {
    const { rows } = await query`
      SELECT id, email, requested_at
      FROM password_resets
      ORDER BY requested_at DESC
    `;
    return NextResponse.json({ ok: true, items: rows });
  } catch (err) {
    console.error("PasswordReset GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to load requests" }, { status: 500 });
  }
}

/* ---------- POST: add new request (staff) ---------- */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
    }

    const { rows } = await query`
      INSERT INTO password_resets (email)
      VALUES (${email})
      RETURNING id, email, requested_at
    `;

    return NextResponse.json({ ok: true, request: rows[0] });
  } catch (err) {
    console.error("PasswordReset POST error:", err);
    return NextResponse.json({ ok: false, error: "Failed to submit request" }, { status: 500 });
  }
}

/* ---------- PATCH: complete reset (admin) ---------- */
export async function PATCH(req: Request) {
  try {
    const { id, email, newPassword } = await req.json();

    if (!id || !email || !newPassword) {
      return NextResponse.json({ ok: false, error: "id, email and newPassword are required" }, { status: 400 });
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json({ ok: false, error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(String(newPassword), 10);

    const { rows } = await query`
      UPDATE users
      SET password_hash = ${hashed}
      WHERE lower(email) = lower(${email})
      RETURNING id
    `;

    if (!rows.length) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    await query`DELETE FROM password_resets WHERE id = ${id}`;

    return NextResponse.json({ ok: true, userId: rows[0].id });
  } catch (err) {
    console.error("PasswordReset PATCH error:", err);
    return NextResponse.json({ ok: false, error: "Failed to reset password" }, { status: 500 });
  }
}
