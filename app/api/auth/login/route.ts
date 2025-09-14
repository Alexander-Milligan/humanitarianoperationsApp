// app/api/auth/login/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import store, { findUser } from "@/lib/store";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message:
      "Auth login endpoint (demo mode, no DB). Send a POST with username/password or email/password.",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body as {
      username?: string; // can be username OR email
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Username/email and password required" },
        { status: 400 }
      );
    }

    // 1) Keep existing behavior first (plain-text compat via findUser)
    let user = findUser(username, password);

    // 2) Fallback: if not found, try bcrypt against any hashed password
    if (!user) {
      const candidate = store.users.find((u) => {
        if (u.username === username) return true;
        if ((u as any).email && (u as any).email === username) return true;
        if (u.employeeId) {
          const emp = store.employees.find((e) => e.id === u.employeeId);
          return emp?.email === username;
        }
        return false;
      });

      if (candidate && typeof candidate.password === "string") {
        // Only attempt compare if it looks like a bcrypt hash or is a string
        const match = await bcrypt.compare(String(password), candidate.password);
        if (match) user = candidate;
      }
    }

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        username: user.username,
        employeeId: user.employeeId,
      },
      process.env.JWT_SECRET || "demo_secret",
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      ok: true,
      token,
      role: user.role,
      username: user.username,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { ok: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
