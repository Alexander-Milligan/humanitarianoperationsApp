export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { addPasswordReset, listPasswordResets } from "@/lib/store";

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
