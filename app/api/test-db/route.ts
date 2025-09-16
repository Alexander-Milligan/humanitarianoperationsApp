// app/api/test-db/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "@/db/db";

export async function GET() {
  try {
    // Quick health check
    await query`SELECT 1`;

    // Query counts
    const { rows: users } = await query`
      SELECT COUNT(*)::int AS count FROM users
    `;
    const { rows: employees } = await query`
      SELECT COUNT(*)::int AS count FROM employees
    `;

    const usersCount = users[0]?.count ?? 0;
    const employeesCount = employees[0]?.count ?? 0;

    return NextResponse.json({
      ok: true,
      users: usersCount,
      employees: employeesCount,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("DB ERROR (test-db):", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
