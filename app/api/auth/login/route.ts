export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { pool } from "@/db/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "demo_secret";

/* Health check */
export async function GET() {
  return NextResponse.json({ ok: true, message: "Auth login endpoint is ready" });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    if (!(username || email) || !password) {
      return NextResponse.json(
        { ok: false, error: "Username/email and password required" },
        { status: 400 }
      );
    }

    const identifier = username || email;
 // Debug logs
    console.log("LOGIN INPUT:", identifier, password);
    // ✅ Column names match your Neon DB
    const { rows } = await pool.query(
      `
      SELECT id, email, username, password_hash, role, first_name, last_name
      FROM users
      WHERE username = $1 OR email = $1
      LIMIT 1
      `,
      [identifier]
    );
 console.log("LOGIN ROWS:", rows);  // <--- see what DB returned
    if (!rows.length) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // ✅ Check bcrypt password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Issue JWT
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
