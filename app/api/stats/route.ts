export const runtime = "nodejs";
import { NextResponse } from "next/server";

type Emp = {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
};

// ⬅️ Shared in-memory array (same as /api/employees)
const employees: Emp[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    department: "HR",
    position: "Manager",
    salary: 50000,
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    department: "IT",
    position: "Developer",
    salary: 60000,
  },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie@example.com",
    department: "Finance",
    position: "Analyst",
    salary: 55000,
  },
];

export async function GET() {
  const totalEmployees = employees.length;
  const totalDepartments = new Set(employees.map((e) => e.department)).size;
  const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);

  return NextResponse.json({
    ok: true,
    employees: totalEmployees,
    departments: totalDepartments,
    totalSalary,
  });
}
