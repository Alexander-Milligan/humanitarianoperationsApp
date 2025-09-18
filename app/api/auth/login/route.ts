// app/api/auth/login/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ---------- Types ---------- */
interface DbUser {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  role: string;
}

interface ResponseUser {
  id: number;
  email: string;
  username: string;
  role: string;
}

interface LoginResponse {
  ok: boolean;
  message: string;
  user: ResponseUser;
  token?: string;
}

/* ---------- POST handler ---------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body as {
      identifier?: string;
      password?: string;
    };

    if (!identifier || !password) {
      return NextResponse.json(
        { ok: false, error: "Missing credentials" },
        { status: 400 }
      );
    }

    const { rows } = await sql<DbUser>`
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

    // 🔍 Debug logging
    console.log("DEBUG: login attempt", { identifier });
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

    if (!isValid) {
      return NextResponse.json(
        {
          ok: false,
          error: "Password did not match",
          identifier,
        },
        { status: 401 }
      );
    }

    // update last_login
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;

    // Prepare response user object
    const responseUser: ResponseUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    // Optionally sign a JWT
    let token: string | null = null;
    const secret = process.env.JWT_SECRET;
    if (secret) {
      try {
        const empQ = await sql<{ id: number }>`
          SELECT id FROM employees WHERE user_id = ${user.id} LIMIT 1
        `;
        const employeeId = empQ.rows[0]?.id ?? null;

        token = jwt.sign(
          {
            id: user.id,
            username: user.username,
            role: user.role,
            employeeId: employeeId ?? null,
          },
          secret,
          { expiresIn: "1h" }
        );
      } catch (err) {
        console.error("JWT sign error:", err);
      }
    }

    // Build typed response payload
    const payload: LoginResponse = {
      ok: true,
      message: "✅ Login successful",
      user: responseUser,
    };
    if (token) payload.token = token;

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
