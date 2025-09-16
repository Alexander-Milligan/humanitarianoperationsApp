export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "../../../db/db";
import bcrypt from "bcryptjs";

/* Utility to generate random temp password */
function randomPassword(length = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

/** GET: list all employees */
export async function GET() {
  try {
    const { rows } = await query`
      SELECT id, name, email, department, position, salary, avatar
      FROM employees
      ORDER BY id ASC
    `;
    return NextResponse.json({ ok: true, employees: rows });
  } catch (err) {
    console.error("Employees GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch" }, { status: 500 });
  }
}

/** POST: create employee + linked user */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const tempPassword = randomPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    const { rows } = await query`
      INSERT INTO employees (name, email, department, position, salary)
      VALUES (${body.name}, ${body.email}, ${body.department}, ${body.position}, ${body.salary})
      RETURNING id, name, email, department, position, salary, avatar
    `;
    const newEmp = rows[0];

    await query`
      INSERT INTO users (username, password, role, employee_id)
      VALUES (${newEmp.email}, ${hashed}, 'employee', ${newEmp.id})
    `;

    return NextResponse.json({
      ok: true,
      employee: newEmp,
      account: { username: newEmp.email, password: tempPassword },
    });
  } catch (err: unknown) {
    console.error("Employees POST error:", err);
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

/** PUT: update employee (partial) */
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const { rows } = await query`
      UPDATE employees
      SET
        name = COALESCE(${body.name}, name),
        email = COALESCE(${body.email}, email),
        department = COALESCE(${body.department}, department),
        position = COALESCE(${body.position}, position),
        salary = COALESCE(${body.salary}, salary),
        avatar = COALESCE(${body.avatar}, avatar)
      WHERE id = ${body.id}
      RETURNING id, name, email, department, position, salary, avatar
    `;

    if (!rows.length) {
      return NextResponse.json({ ok: false, error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, employee: rows[0] });
  } catch (err: unknown) {
    console.error("Employees PUT error:", err);
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

/** DELETE: remove employee + linked user */
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await query`DELETE FROM users WHERE employee_id = ${id}`;
    const result = await query`DELETE FROM employees WHERE id = ${id}`;

    return NextResponse.json({ ok: true, removed: (result.rowCount ?? 0) > 0 });
  } catch (err: unknown) {
    console.error("Employees DELETE error:", err);
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
