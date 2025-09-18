// app/api/employees/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

function randomPassword(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

/** ---------- GET: list all employees ---------- */
export async function GET() {
  try {
    const result = await sql`
      SELECT 
        e.id,
        e.user_id,               -- ✅ add this so dashboard can match decoded.id
        u.first_name,
        u.last_name,
        u.email,
        u.username,
        u.role,
        e.department,
        e.position,
        e.salary,
        e.avatar_url
      FROM employees e
      JOIN users u ON e.user_id = u.id
      ORDER BY e.id ASC
    `;
    return NextResponse.json({ ok: true, employees: result.rows });
  } catch (err) {
    console.error("Employees GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch employees" }, { status: 500 });
  }
}

/** ---------- POST: create employee + linked user ---------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tempPassword = randomPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    const { rows: userRows } = await sql`
      INSERT INTO users (username, email, password_hash, role, first_name, last_name)
      VALUES (
        ${body.username || body.email.split("@")[0]},
        ${body.email},
        ${hashed},
        'employee',
        ${body.first_name},
        ${body.last_name}
      )
      RETURNING id, email, username, first_name, last_name, role
    `;
    const newUser = userRows[0];

    const { rows: empRows } = await sql`
      INSERT INTO employees (user_id, department, position, salary, avatar_url)
      VALUES (${newUser.id}, ${body.department}, ${body.position}, ${body.salary}, ${body.avatar_url || null})
      RETURNING id, user_id, department, position, salary, avatar_url
    `;
    const newEmp = empRows[0];

    return NextResponse.json({
      ok: true,
      employee: { ...newUser, ...newEmp },
      account: { username: newUser.username, password: tempPassword },
    });
  } catch (err) {
    console.error("Employees POST error:", err);
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

/** ---------- PUT: update employee ---------- */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const empUpdate = await sql`
      UPDATE employees
      SET department = COALESCE(${body.department}, department),
          position   = COALESCE(${body.position}, position),
          salary     = COALESCE(${body.salary}, salary),
          avatar_url = COALESCE(${body.avatar_url}, avatar_url)
      WHERE id = ${body.id}
      RETURNING id, user_id, department, position, salary, avatar_url
    `;
    if (!empUpdate.rows.length) {
      return NextResponse.json({ ok: false, error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, employee: empUpdate.rows[0] });
  } catch (err) {
    console.error("Employees PUT error:", err);
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

/** ---------- DELETE: remove employee + linked user ---------- */
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const empDelete = await sql`DELETE FROM employees WHERE id = ${id} RETURNING user_id`;
    if (!empDelete.rows.length) {
      return NextResponse.json({ ok: false, error: "Employee not found" }, { status: 404 });
    }
    const userId = empDelete.rows[0].user_id;
    await sql`DELETE FROM users WHERE id = ${userId}`;
    return NextResponse.json({ ok: true, removed: true });
  } catch (err) {
    console.error("Employees DELETE error:", err);
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
