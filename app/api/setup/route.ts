// app/api/setup/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/db/db";  // ✅ use pool, not getDB

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW()");
    return NextResponse.json({ ok: true, time: result.rows[0] });
  } catch (err) {
    console.error("Setup error:", err);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}
