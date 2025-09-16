// app/api/employees/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { pool } from "@/db/db";
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
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, department, position, salary, avatar FROM employees ORDER BY id ASC"
    );
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

    const empInsert = await pool.query(
      `INSERT INTO employees (first_name, last_name, email, department, position, salary)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, first_name, last_name, email, department, position, salary, avatar`,
      [body.first_name, body.last_name, body.email, body.department, body.position, body.salary]
    );
    const newEmp = empInsert.rows[0];

    await pool.query(
      "INSERT INTO users (username, password_hash, role, email) VALUES ($1,$2,$3,$4)",
      [newEmp.email, hashed, "employee", newEmp.email]
    );

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

    const result = await pool.query(
      `UPDATE employees
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           department = COALESCE($4, department),
           position = COALESCE($5, position),
           salary = COALESCE($6, salary),
           avatar = COALESCE($7, avatar)
       WHERE id = $8
       RETURNING id, first_name, last_name, email, department, position, salary, avatar`,
      [
        body.first_name,
        body.last_name,
        body.email,
        body.department,
        body.position,
        body.salary,
        body.avatar,
        body.id,
      ]
    );

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

    await pool.query("DELETE FROM users WHERE username = (SELECT email FROM employees WHERE id = $1)", [id]);
    const result = await pool.query("DELETE FROM employees WHERE id = $1", [id]);

    return NextResponse.json({ ok: true, removed: (result.rowCount ?? 0) > 0 });
  } catch (err) {
    console.error("Employees DELETE error:", err);
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
