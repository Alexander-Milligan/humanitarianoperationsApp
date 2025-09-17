// app/api/employees/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";   // ✅ correct client
import bcrypt from "bcryptjs";

/* Utility to generate random temp password */
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
    const result = await sql`
      SELECT id, first_name, last_name, email, department, position, salary, avatar
      FROM employees
      ORDER BY id ASC
    `;
    return NextResponse.json({ ok: true, employees: result.rows });
  } catch (err) {
    console.error("Employees GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch" }, { status: 500 });
  }
}

/** ---------- POST: create employee + linked user ---------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const tempPassword = randomPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    // create employee
    const empInsert = await sql`
      INSERT INTO employees (first_name, last_name, email, department, position, salary)
      VALUES (${body.first_name}, ${body.last_name}, ${body.email}, ${body.department}, ${body.position}, ${body.salary})
      RETURNING id, first_name, last_name, email, department, position, salary, avatar
    `;
    const newEmp = empInsert.rows[0];

    // create linked user
    await sql`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (${newEmp.email}, ${newEmp.email}, ${hashed}, 'employee')
    `;

    return NextResponse.json({
      ok: true,
      employee: newEmp,
      account: { username: newEmp.email, password: tempPassword },
    });
  } catch (err) {
    console.error("Employees POST error:", err);
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

/** ---------- PUT: update employee (partial) ---------- */
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const result = await sql`
      UPDATE employees
      SET first_name = COALESCE(${body.first_name}, first_name),
          last_name  = COALESCE(${body.last_name}, last_name),
          email      = COALESCE(${body.email}, email),
          department = COALESCE(${body.department}, department),
          position   = COALESCE(${body.position}, position),
          salary     = COALESCE(${body.salary}, salary),
          avatar     = COALESCE(${body.avatar}, avatar)
      WHERE id = ${body.id}
      RETURNING id, first_name, last_name, email, department, position, salary, avatar
    `;

    if (!result.rows.length) {
      return NextResponse.json({ ok: false, error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, employee: result.rows[0] });
  } catch (err) {
    console.error("Employees PUT error:", err);
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

/** ---------- DELETE: remove employee + linked user ---------- */
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await sql`
      DELETE FROM users
      WHERE email = (SELECT email FROM employees WHERE id = ${id})
    `;
    const result = await sql`
      DELETE FROM employees WHERE id = ${id}
    `;

    return NextResponse.json({
      ok: true,
      removed: (result.rowCount ?? 0) > 0,   
    });
  } catch (err) {
    console.error("Employees DELETE error:", err);
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
