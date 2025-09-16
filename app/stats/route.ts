export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    // ✅ Count employees
    const { rows: empCountRows } = await sql`
      SELECT COUNT(*)::int AS count FROM employees
    `;
    const employees = empCountRows[0].count;

    // ✅ Count distinct departments
    const { rows: deptCountRows } = await sql`
      SELECT COUNT(DISTINCT department)::int AS count FROM employees
    `;
    const departments = deptCountRows[0].count;

    // ✅ Total salary
    const { rows: salaryRows } = await sql`
      SELECT COALESCE(SUM(salary),0)::numeric AS total FROM employees
    `;
    const totalSalary = Number(salaryRows[0].total);

    return NextResponse.json({
      ok: true,
      employees,
      departments,
      totalSalary,
    });
  } catch (err) {
    console.error("Stats GET error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
