export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises"; // <-- you need mkdir here
import path from "path";
import store from "@/lib/store";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ Ensure uploads dir exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // Update store
    const user = store.users.find((u) => u.id === parseInt(userId as string, 10));
    if (user) user.avatar = filename;

    return NextResponse.json({ ok: true, filename });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { ok: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
