export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sql } from "@/db/db"; // ✅ use sql directly

export async function GET() {
  try {
    const employees = await sql`SELECT COUNT(*)::int AS count FROM employees`;
    const departments = await sql`SELECT COUNT(DISTINCT department)::int AS count FROM employees`;
    const totalSalary = await sql`SELECT COALESCE(SUM(salary),0)::int AS total FROM employees`;

    return NextResponse.json({
      ok: true,
      employees: employees.rows[0].count,
      departments: departments.rows[0].count,
      totalSalary: totalSalary.rows[0].total,
    });
  } catch (err) {
    console.error("Stats GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}
