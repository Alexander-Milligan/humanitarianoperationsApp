// app/api/upload/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
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

    const fakeFilename = `${Date.now()}-${file.name}`;

    const user = store.users.find(
      (u) => u.id === parseInt(userId as string, 10)
    );
    if (user) user.avatar = fakeFilename;

    return NextResponse.json({ ok: true, filename: fakeFilename });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
