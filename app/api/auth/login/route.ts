export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { pool } from "@/db/db";   // ✅ use pool, not getPool
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "demo_secret";

/* Optional GET for health check */
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Auth login endpoint (DB mode) is ready",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Username/email and password required" },
        { status: 400 }
      );
    }

    // 🔍 Look up by username OR email
    const { rows } = await pool.query(
      `
      SELECT id, username, email, password_hash, role, first_name, last_name
      FROM users
      WHERE username = $1 OR email = $1
      LIMIT 1
      `,
      [username]
    );

    if (!rows.length) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // 🔑 Check bcrypt password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🎟️ Issue JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        username: user.username,
        email: user.email,
        name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      ok: true,
      token,
      role: user.role,
      username: user.username,
      email: user.email,
      name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Login error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
