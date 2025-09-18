export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "../../../db/db";

/* ---------- POST upload avatar ---------- */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const userId = formData.get("userId");

    if (!(file instanceof File) || !userId) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid file/userId" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // ✅ store directly in DB
    await query`
      UPDATE employees
      SET avatar = ${buffer}
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      ok: true,
      message: "Avatar uploaded",
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { ok: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
