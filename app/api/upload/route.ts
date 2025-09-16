export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "../../../db/db";

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

    const fakeFilename = `${Date.now()}-${file.name}`;

    await query`
      UPDATE employees
      SET avatar = ${fakeFilename}
      WHERE id = ${userId}
    `;

    return NextResponse.json({ ok: true, filename: fakeFilename });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
  }
}
