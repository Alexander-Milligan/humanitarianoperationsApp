export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "../../../db/db";

/* ---------- POST: upload avatar (Base64, Vercel safe) ---------- */
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

    // Convert file → Base64 string
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Save into employees.avatar_url (your actual column)
    const { rows } = await query`
      UPDATE employees
      SET avatar_url = ${base64}
      WHERE id = ${userId}
      RETURNING id, avatar_url
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      url: rows[0].avatar_url,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { ok: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
