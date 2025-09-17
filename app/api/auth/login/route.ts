// app/api/auth/login/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { ok: false, error: "Missing credentials" },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      SELECT id, email, username, password_hash, role
      FROM users
      WHERE lower(email) = lower(${identifier})
         OR lower(username) = lower(${identifier})
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No user found for identifier", identifier },
        { status: 401 }
      );
    }

    const user = rows[0];

    // 🔍 Debug logging to Vercel logs
    console.log("DEBUG: login attempt", { identifier, password });
    console.log("DEBUG: db user", {
      id: user.id,
      username: user.username,
      email: user.email,
      hashLength: user.password_hash?.length,
      hashSnippet: user.password_hash?.slice(0, 20),
    });

    let isValid = false;
    try {
      isValid = await bcrypt.compare(password, user.password_hash);
    } catch (err) {
      console.error("bcrypt error:", err);
    }

    console.log("DEBUG: bcrypt.compare result", isValid);

    if (!isValid) {
      return NextResponse.json(
        {
          ok: false,
          error: "Password did not match",
          identifier,
          incomingPassword: password,
          storedHashLength: user.password_hash?.length,
          storedHashSnippet: user.password_hash?.slice(0, 20),
        },
        { status: 401 }
      );
    }

    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;

    return NextResponse.json({
      ok: true,
      message: "✅ Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
