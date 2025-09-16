// app/api/setup/route.ts
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { rows } = await sql`SELECT NOW() AS time`;
    return NextResponse.json({ ok: true, time: rows[0].time });
  } catch (err) {
    console.error("Setup error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to connect to DB" },
      { status: 500 }
    );
  }
}
