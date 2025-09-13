export const runtime = "nodejs";
import { NextResponse } from "next/server";
import store, { Emp, User } from "@/lib/store";

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
  // Return a shallow copy to avoid accidental external mutation
  const employees = store.employees.map((e) => ({ ...e }));
  return NextResponse.json({ ok: true, employees });
}

/** POST: create employee + linked account */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newEmp: Emp = {
      id: Date.now(),
      name: String(body.name ?? "").trim(),
      email: String(body.email ?? "").trim(),
      department: String(body.department ?? "").trim(),
      position: String(body.position ?? "").trim(),
      salary:
        typeof body.salary === "number"
          ? body.salary
          : Number(body.salary ?? 0) || 0,
    };

    store.employees.push(newEmp);

    // 🔑 Create linked user account
    const tempPassword = randomPassword();
    const newUser: User = {
      id: Date.now(),
      username: newEmp.email, // login with email
      password: tempPassword,
      role: "employee",
      name: newEmp.name,
      employeeId: newEmp.id,
    };
    store.users.push(newUser);

    return NextResponse.json({
      ok: true,
      employee: newEmp,
      account: { username: newUser.username, password: tempPassword },
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json(
      { ok: false, error: e.message || "Bad request" },
      { status: 400 }
    );
  }
}

/**
 * PUT: update employee (partial)
 * IMPORTANT: Preserve existing salary unless a salary is explicitly provided.
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const id = Number(body.id);

    const idx = store.employees.findIndex((e) => e.id === id);
    if (idx === -1) {
      return NextResponse.json(
        { ok: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    const current = store.employees[idx];

    // Start with the current record, then overlay incoming fields
    const updated: Emp = {
      ...current,
      name: body.name !== undefined ? String(body.name) : current.name,
      email: body.email !== undefined ? String(body.email) : current.email,
      department:
        body.department !== undefined
          ? String(body.department)
          : current.department,
      position:
        body.position !== undefined ? String(body.position) : current.position,
      // Only overwrite salary if provided; otherwise keep current
      salary:
        body.salary !== undefined
          ? typeof body.salary === "number"
            ? body.salary
            : Number(body.salary) || 0
          : current.salary,
    };

    store.employees[idx] = updated;
    return NextResponse.json({ ok: true, employee: updated });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json(
      { ok: false, error: e.message || "Bad request" },
      { status: 400 }
    );
  }
}

/** DELETE: remove employee + linked user */
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const empId = Number(id);

    const before = store.employees.length;
    store.employees = store.employees.filter((e) => e.id !== empId);
    const removed = store.employees.length !== before;

    // also remove linked user
    store.users = store.users.filter((u) => u.employeeId !== empId);

    return NextResponse.json({ ok: true, removed });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json(
      { ok: false, error: e.message || "Bad request" },
      { status: 400 }
    );
  }
}
