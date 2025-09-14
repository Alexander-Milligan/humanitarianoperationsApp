export const runtime = "nodejs";

import { NextResponse } from "next/server";
import store, { addPasswordReset, listPasswordResets, User } from "@/lib/store";
import bcrypt from "bcryptjs";

/* ----------------- Type guard for email ----------------- */
function hasEmail(u: User): u is User & { email: string } {
  return typeof (u as any).email === "string";
}

/* ----------------- List all requests (for admin) ----------------- */
export async function GET() {
  try {
    const items = listPasswordResets();
    return NextResponse.json({ ok: true, items });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to load requests" },
      { status: 500 }
    );
  }
}

/* ----------------- Add new request (for staff) ----------------- */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const request = addPasswordReset(email);
    return NextResponse.json({ ok: true, request });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to submit request" },
      { status: 500 }
    );
  }
}

/* ----------------- Complete reset (for admin) ----------------- */
export async function PATCH(req: Request) {
  try {
    const { id, email, newPassword } = await req.json();

    if (!id || !email || !newPassword) {
      return NextResponse.json(
        { ok: false, error: "id, email and newPassword are required" },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Find the user by email (via employee link in your store)
    const user: User | undefined = store.users.find((u) => {
      if (hasEmail(u) && u.email === email) return true;
      if (u.employeeId) {
        const emp = store.employees.find((e) => e.id === u.employeeId);
        return emp?.email === email;
      }
      return false;
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Hash the new password before storing
    const hashed = await bcrypt.hash(String(newPassword), 10);
    user.password = hashed;

    // Remove reset request
    const idx = store.passwordResets.findIndex((r) => r.id === Number(id));
    if (idx !== -1) store.passwordResets.splice(idx, 1);

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
