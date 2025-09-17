export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

/* Utility: random password */
function randomPassword(length = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

/** ---------- GET: list all employees ---------- */
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT id, first_name, last_name, email, department, position, salary, avatar
      FROM employees
      ORDER BY id ASC
    `;
    return NextResponse.json({ ok: true, employees: rows });
  } catch (err) {
    console.error("Employees GET error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

/** ---------- POST: create employee + linked user ---------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("EMPLOYEE POST BODY:", body);

    const tempPassword = randomPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    // Insert employee
    const { rows } = await sql`
      INSERT INTO employees (first_name, last_name, email, department, position, salary)
      VALUES (${body.first_name}, ${body.last_name}, ${body.email}, ${body.department}, ${body.position}, ${body.salary})
      RETURNING id, first_name, last_name, email, department, position, salary, avatar
    `;
    const newEmp = rows[0];
    console.log("NEW EMPLOYEE:", newEmp);

    // Use body.username if provided, otherwise default to email prefix
    const username = body.username || body.email.split("@")[0];

    // Insert linked user account
    await sql`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (${username}, ${body.email}, ${hashed}, 'employee')
    `;

    return NextResponse.json({
      ok: true,
      employee: newEmp,
      account: { username, password: tempPassword },
    });
  } catch (err: unknown) {
    console.error("Employees POST error:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message || "Bad request" },
      { status: 400 }
    );
  }
}
