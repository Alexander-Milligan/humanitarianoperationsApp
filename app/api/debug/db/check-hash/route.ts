// app/api/debug/check-hash/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { password, hash } = await req.json();

    if (!password || !hash) {
      return NextResponse.json(
        { ok: false, error: "Both password and hash are required" },
        { status: 400 }
      );
    }

    const matches = await bcrypt.compare(password, hash);

    return NextResponse.json({
      ok: true,
      password,
      hash,
      matches,
    });
  } catch (err) {
    console.error("check-hash error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
