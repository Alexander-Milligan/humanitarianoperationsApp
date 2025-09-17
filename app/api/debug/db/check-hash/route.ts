export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  console.log("DEBUG: check-hash route called");  // 👈 add this

  try {
    const { password, hash } = await req.json();
    console.log("DEBUG body:", { password, hash });  // 👈 log input

    if (!password || !hash) {
      return NextResponse.json(
        { ok: false, error: "Both password and hash are required" },
        { status: 400 }
      );
    }

    const matches = await bcrypt.compare(password, hash);
    console.log("DEBUG result:", matches);  // 👈 log compare result

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
