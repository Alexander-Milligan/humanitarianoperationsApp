export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function GET() {
  try {
    // count employees
    const { rows: empCountRows } = await pool.query(
      `SELECT COUNT(*)::int AS total_employees FROM employees`
    );
    const totalEmployees = empCountRows[0]?.total_employees ?? 0;

    // count departments
    const { rows: deptCountRows } = await pool.query(
      `SELECT COUNT(DISTINCT department)::int AS total_departments FROM employees`
    );
    const totalDepartments = deptCountRows[0]?.total_departments ?? 0;

    // sum salary
    const { rows: salaryRows } = await pool.query(
      `SELECT COALESCE(SUM(salary),0)::int AS total_salary FROM employees`
    );
    const totalSalary = salaryRows[0]?.total_salary ?? 0;

    return NextResponse.json({
      ok: true,
      employees: totalEmployees,
      departments: totalDepartments,
      totalSalary,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Stats API error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to load stats" },
      { status: 500 }
    );
  }
}
