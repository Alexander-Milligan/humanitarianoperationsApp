// app/api/auth/login/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import store, { findUser, User } from "@/lib/store";

/* ----------------- Type guard for email ----------------- */
function hasEmail(u: unknown): u is User & { email: string } {
  return typeof (u as { email?: unknown }).email === "string";
}

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

    // 1) Try plain-text (legacy) via findUser
    let user = findUser(username, password);

    // 2) Fallback: bcrypt compare if no plain-text match
    if (!user) {
      const candidate: User | undefined = store.users.find((u) => {
        if ((u as User).username === username) return true;
        if (hasEmail(u) && u.email === username) return true;
        if ((u as User).employeeId) {
          const emp = store.employees.find(
            (e) => e.id === (u as User).employeeId
          );
          return emp?.email === username;
        }
        return false;
      });

      if (candidate && typeof candidate.password === "string") {
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
        id: (user as User).id,
        role: (user as User).role,
        username: (user as User).username,
        employeeId: (user as User).employeeId,
      },
      process.env.JWT_SECRET || "demo_secret",
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      ok: true,
      token,
      role: (user as User).role,
      username: (user as User).username,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { ok: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
