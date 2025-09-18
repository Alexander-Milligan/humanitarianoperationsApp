export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "../../../db/db";
import fs from "fs/promises";
import path from "path";

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

    // Ensure uploads folder exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);

    await query`
      UPDATE employees
      SET avatar = ${filename}
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      ok: true,
      filename,
      url: `/uploads/${filename}`,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { ok: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
