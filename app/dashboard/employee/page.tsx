"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import styles from "../admin/admin.module.css";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Tooltip,
  Legend,
} from "recharts";
import { jwtDecode } from "jwt-decode";

/* ---------- Types ---------- */
type RawEmp = {
  id: number | string;
  user_id?: number | string;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  email: string;
  department: string;
  position: string;
  salary: number | string;
  avatar_url?: string | null;
  avatar?: string | null;
};

type Emp = {
  id: number;
  user_id?: number;
  username?: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  avatar?: string | null;
  role?: string; // added so frontend knows their role
};

type TokenPayload = {
  id: number | string;
  role: "admin" | "employee" | "hr";
  username: string;
  employeeId?: number | string;
  exp: number;
};

type HrReq = {
  id: number;
  user_id: number;
  message: string;
  status: string;
  requested_at: string;
};

type LeaveReq = {
  id: number;
  employeeId: number;
  start: string;
  end: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
};

export default function Page() {
  const [employee, setEmployee] = useState<Emp | null>(null);
  const [allEmployees, setAllEmployees] = useState<Emp[]>([]);
  const [loading, setLoading] = useState(true);

  const [showProfile, setShowProfile] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showHr, setShowHr] = useState(false);
  const [showContactHr, setShowContactHr] = useState(false);

  const [form, setForm] = useState<Partial<Emp>>({});
  const [leaveForm, setLeaveForm] = useState({
    start: "",
    end: "",
    reason: "",
  });
  const [msg, setMsg] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [contactHrMsg, setContactHrMsg] = useState("");
  const [contactHrText, setContactHrText] = useState("");

  const [hrItems, setHrItems] = useState<HrReq[]>([]);
  const [hrLoading, setHrLoading] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [myLeaves, setMyLeaves] = useState<LeaveReq[]>([]);
  const [myLeavesLoading, setMyLeavesLoading] = useState(false);

  /* ---------- Load employee + all employees ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) throw new Error("No token found");
        const decoded: TokenPayload = jwtDecode(token);

        const r = await fetch("/api/employees");
        const d = await r.json();

        const raw: RawEmp[] = d.employees || [];
        const normalized: Emp[] = raw.map((row) => {
          const id = Number(row.id);
          const user_id = row.user_id != null ? Number(row.user_id) : undefined;
          const nameFromParts = [row.first_name ?? "", row.last_name ?? ""]
            .map((s) => s?.trim())
            .filter(Boolean)
            .join(" ")
            .trim();
          const name = nameFromParts || row.username || row.email;

          return {
            id,
            user_id,
            username: row.username ?? undefined,
            name,
            email: row.email,
            department: row.department,
            position: row.position,
            salary: Number(row.salary),
            avatar: row.avatar_url ?? row.avatar ?? null,
            role: (row as unknown as { role?: string }).role ?? undefined,
          };
        });

        setAllEmployees(normalized);

        const me =
          normalized.find(
            (e) => decoded.employeeId && e.id === Number(decoded.employeeId)
          ) ||
          normalized.find((e) => e.user_id === Number(decoded.id)) ||
          normalized.find(
            (e) =>
              e.username &&
              decoded.username &&
              e.username.toLowerCase() === decoded.username.toLowerCase()
          ) ||
          null;

        if (me) {
          me.role = decoded.role;
        }

        setEmployee(me);
        setForm(me || {});
      } catch (e) {
        console.error(e);
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ---------- Helpers ---------- */
  const nameById = (id: number) => {
    const emp = allEmployees.find((e) => e.id === id || e.user_id === id);
    if (!emp) return `User #${id}`;
    return emp.name
      ? `${emp.name} (${emp.email})`
      : `${emp.username || emp.email}`;
  };

  const salaryProgress = useMemo(
    () =>
      employee
        ? [{ name: "Salary", value: employee.salary, fill: "#0d6efd" }]
        : [],
    [employee]
  );

  /* ---------- My leave requests ---------- */
  async function loadMyLeaves() {
    if (!employee) return;
    setMyLeavesLoading(true);
    try {
      const r = await fetch("/api/leave");
      const d = await r.json();
      const mine: LeaveReq[] = (d.items || []).filter(
        (it: LeaveReq) => it.employeeId === employee.id
      );
      setMyLeaves(mine);
    } catch {
      setMyLeaves([]);
    } finally {
      setMyLeavesLoading(false);
    }
  }

  useEffect(() => {
    if (employee) loadMyLeaves();
  }, [employee]);

  /* ---------- HR requests ---------- */
  async function loadHrRequests() {
    setHrLoading(true);
    try {
      const res = await fetch("/api/hr");
      const data = await res.json();
      if (data.ok) setHrItems(data.items);
      else setHrItems([]);
    } catch {
      setHrItems([]);
    } finally {
      setHrLoading(false);
    }
  }

  useEffect(() => {
    if (showHr && (employee?.department === "HR" || employee?.role === "hr")) {
      loadHrRequests();
    }
  }, [showHr, employee]);

  useEffect(() => {
    if (employee?.department === "HR" || employee?.role === "hr") {
      loadHrRequests();
    }
  }, [employee]);

  /* ---------- Handlers ---------- */
  async function saveUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!employee) return;

    try {
      const r = await fetch("/api/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: employee.id,
          name: form.name,
          email: form.email,
          avatar: form.avatar,
        }),
      });
      const d = await r.json();
      if (d.ok) {
        setEmployee({ ...employee, ...form } as Emp);
        setMsg("✅ Details updated.");
        setTimeout(() => setShowUpdate(false), 1500);
      } else {
        setMsg("❌ Update failed.");
      }
    } catch {
      setMsg("❌ Error saving changes.");
    }
  }

  async function uploadAvatar(file: File) {
    if (!employee) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("userId", String(employee.id));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        setForm({ ...form, avatar: data.url }); // ✅ use data.url
        setEmployee({ ...employee, avatar: data.url }); // ✅ base64 string
        setMsg("✅ Profile picture updated.");
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch {
      setMsg("❌ Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  /* ---------- Render ---------- */
  return (
    <div className={styles.wrap}>
      <Navbar role="employee" />

      <header className={styles.hero}>
        {loading ? (
          <h1 className={styles.title}>Loading your dashboard…</h1>
        ) : employee ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {employee.avatar && (
              <img
                src={employee.avatar} // ✅ fixed
                alt="Profile"
                style={{ width: "60px", height: "60px", borderRadius: "50%" }}
              />
            )}
            <div>
              <h1 className={styles.title}>
                Welcome back,{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg,#0d6efd,#20c997)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {employee.name}
                </span>{" "}
                👋
              </h1>
              <p className={styles.subtitle}>
                {employee.position} in <strong>{employee.department}</strong>
              </p>
            </div>
          </div>
        ) : (
          <h1 className={styles.title}>No employee record found</h1>
        )}
      </header>

      {showProfile && employee && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowProfile(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>Profile</h4>
            {employee.avatar && (
              <img
                src={employee.avatar} // ✅ fixed
                alt="Profile"
                style={{ width: "100px", height: "100px", borderRadius: "50%" }}
              />
            )}
            <ul>
              <li>
                <strong>Name:</strong> {employee.name}
              </li>
              <li>
                <strong>Email:</strong> {employee.email}
              </li>
              <li>
                <strong>Department:</strong> {employee.department}
              </li>
              <li>
                <strong>Position:</strong> {employee.position}
              </li>
              <li>
                <strong>Salary:</strong> £{employee.salary.toLocaleString()}
              </li>
            </ul>
            <div className={styles.modalActions}>
              <button
                className={styles.btnLite}
                onClick={() => setShowProfile(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdate && employee && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowUpdate(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>Update My Details</h4>
            {msg && <div className={styles.alert}>{msg}</div>}
            <form onSubmit={saveUpdate} className={styles.formGrid}>
              <label>
                <span>Name</span>
                <input
                  className={styles.input}
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  className={styles.input}
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              <label>
                <span>Profile Picture</span>
                <input
                  type="file"
                  accept="image/*"
                  className={styles.input}
                  onChange={(e) =>
                    e.target.files?.[0] && uploadAvatar(e.target.files[0])
                  }
                  disabled={uploading}
                />
              </label>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnLite}
                  onClick={() => setShowUpdate(false)}
                >
                  Cancel
                </button>
                <button className={styles.btnPrimary}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
