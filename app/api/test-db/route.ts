export const runtime = "nodejs"; // run in Node.js runtime for MySQL
import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

interface CountRow extends RowDataPacket {
  count: number;
}

export async function GET() {
  try {
    const db = await getDB();

    // Quick health check
    await db.query("SELECT 1");

    // Query counts
    const [users] = await db.query<CountRow[]>(
      "SELECT COUNT(*) AS count FROM users"
    );
    const [employees] = await db.query<CountRow[]>(
      "SELECT COUNT(*) AS count FROM employees"
    );

    const usersCount = users[0]?.count ?? 0;
    const employeesCount = employees[0]?.count ?? 0;

    await db.end();
    return NextResponse.json({
      ok: true,
      users: usersCount,
      employees: employeesCount,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("DB ERROR:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
