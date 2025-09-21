export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "../../../db/db";
import bcrypt from "bcryptjs";

/* ---------- POST: add new request ---------- */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
    }

    // ✅ ensure table exists
    await query`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        requested_at TIMESTAMP DEFAULT NOW()
      )
    `;

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

/* ---------- GET: list pending reset requests ---------- */
export async function GET() {
  try {
    // make sure the table exists
    await query`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        requested_at TIMESTAMP DEFAULT NOW()
      )
    `;

    const { rows } = await query`
      SELECT id, email, requested_at
      FROM password_resets
      ORDER BY requested_at DESC
    `;

    const items = rows.map((r) => ({
      id: r.id,
      email: r.email,
      requestedAt: r.requested_at, // 👈 rename to match frontend
    }));

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("PasswordReset GET error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load reset requests" },
      { status: 500 }
    );
  }
}

/* ---------- PATCH: complete reset ---------- */
export async function PATCH(req: Request) {
  try {
    const { id, email, newPassword } = await req.json();

    if (!id || !email || !newPassword) {
      return NextResponse.json({ ok: false, error: "id, email and newPassword required" }, { status: 400 });
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json({ ok: false, error: "Password must be >= 6 chars" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(String(newPassword), 10);

    // ✅ use correct column
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
