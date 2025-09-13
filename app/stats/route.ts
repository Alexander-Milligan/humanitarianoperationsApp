export const runtime = "nodejs";
import { NextResponse } from "next/server";
import store from "@/lib/store";

export async function GET() {
  const emps = store.employees;

  const employees = emps.length; // use const
  const departments = new Set(emps.map((e) => e.department)).size;
  const totalSalary = emps.reduce(
    (sum, e) => sum + (Number(e.salary) || 0),
    0
  );

  return NextResponse.json({ ok: true, employees, departments, totalSalary });
}
