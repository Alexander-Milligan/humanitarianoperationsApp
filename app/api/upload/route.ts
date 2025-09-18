export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { query } from "../../../db/db";
import bcrypt from "bcryptjs";

/* ---------- GET: list all employees ---------- */
export async function GET() {
  try {
    const { rows } = await query`
      SELECT 
        id,
        user_id,
        position,
        department,
        salary,
        avatar_url
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

/* ---------- POST: create employee + linked user ---------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, username, password, department, position, salary } = body;

    if (!firstName || !lastName || !email || !username || !password) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    // Insert into users table
    const userResult = await query`
      INSERT INTO users (first_name, last_name, email, username, password_hash, role)
      VALUES (${firstName}, ${lastName}, ${email}, ${username}, ${hashed}, 'employee')
      RETURNING id
    `;

    const userId = userResult.rows[0].id;

    // Insert into employees table
    const { rows } = await query`
      INSERT INTO employees (user_id, department, position, salary, avatar_url)
      VALUES (${userId}, ${department}, ${position}, ${salary}, NULL)
      RETURNING id, user_id, position, department, salary, avatar_url
    `;

    return NextResponse.json({ ok: true, employee: rows[0] });
  } catch (err) {
    console.error("Employees POST error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create employee" },
      { status: 500 }
    );
  }
}

/* ---------- PATCH: update employee ---------- */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, department, position, salary, avatarUrl } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Employee id required" }, { status: 400 });
    }

    const { rows } = await query`
      UPDATE employees
      SET 
        department = COALESCE(${department}, department),
        position = COALESCE(${position}, position),
        salary = COALESCE(${salary}, salary),
        avatar_url = COALESCE(${avatarUrl}, avatar_url)
      WHERE id = ${id}
      RETURNING id, user_id, position, department, salary, avatar_url
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, employee: rows[0] });
  } catch (err) {
    console.error("Employees PATCH error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update employee" },
      { status: 500 }
    );
  }
}
