export const runtime = "nodejs";

import { NextResponse } from "next/server";
import store from "@/lib/store";

/* ---------- HR Request Type ---------- */
type HrRequest = {
  id: number;
  fromId: number;
  message: string;
  requestedAt: string; // ISO timestamp
};

/* ---------- Add request ---------- */
function addHrRequest(fromId: number, message: string): HrRequest {
  if (!("hrRequests" in store)) {
    (store as { hrRequests: HrRequest[] }).hrRequests = [];
  }

  const hrRequests = store["hrRequests"] as HrRequest[];
  const req: HrRequest = {
    id: hrRequests.length + 1,
    fromId,
    message,
    requestedAt: new Date().toISOString(),
  };

  hrRequests.push(req);
  return req;
}

/* ---------- List requests ---------- */
function listHrRequests(): HrRequest[] {
  const hrRequests = (store["hrRequests"] as HrRequest[]) || [];
  return [...hrRequests].sort((a, b) => (a.id < b.id ? 1 : -1));
}

/* ---------- GET: return all HR requests ---------- */
export async function GET() {
  try {
    const items = listHrRequests();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to load HR requests" },
      { status: 500 }
    );
  }
}

/* ---------- POST: submit new HR request ---------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromId, message } = body;

    if (!fromId || !message) {
      return NextResponse.json(
        { ok: false, error: "fromId and message are required" },
        { status: 400 }
      );
    }

    const request = addHrRequest(fromId, message);
    return NextResponse.json({ ok: true, request });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to load HR requests" },
      { status: 500 }
    );
  }
}
