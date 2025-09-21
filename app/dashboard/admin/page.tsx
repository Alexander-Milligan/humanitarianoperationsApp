"use client";

import Navbar from "../../components/Navbar";
import { useEffect, useMemo, useState } from "react";
import styles from "./admin.module.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";

import EmployeeManager from "./EmployeeManager";

/* ---------- Types ---------- */
type Emp = {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
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

type HrReq = {
  id: number;
  fromId: number;
  message: string;
  requestedAt: string;
};

type PasswordReset = {
  id: number;
  email: string;
  requestedAt: string;
};

type NewAccount = {
  username: string;
  password: string;
};

export default function Page() {
  const [rows, setRows] = useState<Emp[]>([]);
  const [loading, setLoading] = useState(true);

  // Leave state
  const [leaveItems, setLeaveItems] = useState<LeaveReq[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(true);

  // HR state
  const [hrItems, setHrItems] = useState<HrReq[]>([]);
  const [hrLoading, setHrLoading] = useState(true);

  // Password reset state
  const [resetItems, setResetItems] = useState<PasswordReset[]>([]);
  const [resetLoading, setResetLoading] = useState(true);

  // Messages
  const [leaveMsg, setLeaveMsg] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [hrMsg, setHrMsg] = useState("");

  // New account modal
  const [newAccount, setNewAccount] = useState<NewAccount | null>(null);

  // Reset Password modal
  const [resetOpen, setResetOpen] = useState(false);
  const [resetSaving, setResetSaving] = useState(false);
  const [resetForm, setResetForm] = useState<{
    id: number | null;
    email: string;
    newPassword: string;
    confirm: string;
  }>({ id: null, email: "", newPassword: "", confirm: "" });

  /* ---------- Load employees ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/employees");
        const d = await r.json();

        const employees: Emp[] = (d.employees || []).map((e: unknown) => {
          const emp = e as Emp & { salary?: number | string };
          return {
            id: emp.id,
            name: emp.name,
            email: emp.email,
            department: emp.department,
            position: emp.position,
            salary:
              emp?.salary !== undefined && emp?.salary !== null
                ? typeof emp.salary === "number"
                  ? emp.salary
                  : Number(emp.salary) || 0
                : 0,
          };
        });

        setRows(employees);
      } catch (err) {
        console.error("Error loading employees:", err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();

    const refresh = () => load();
    window.addEventListener("employees:changed", refresh);
    return () => window.removeEventListener("employees:changed", refresh);
  }, []);

  /* ---------- Listen for new accounts ---------- */
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<NewAccount>).detail;
      setNewAccount(detail);
    };
    window.addEventListener("account:created", handler as EventListener);
    return () =>
      window.removeEventListener("account:created", handler as EventListener);
  }, []);

  /* ---------- Load leave requests ---------- */
  async function loadLeave() {
    try {
      const r = await fetch("/api/leave");
      const d = await r.json();
      setLeaveItems(d.items || []);
    } catch {
      setLeaveItems([]);
    } finally {
      setLeaveLoading(false);
    }
  }
  useEffect(() => {
    loadLeave();
  }, []);

  /* ---------- Load HR requests ---------- */
  async function loadHr() {
    try {
      const r = await fetch("/api/hr");
      const d = await r.json();
      setHrItems(d.items || []);
    } catch {
      setHrItems([]);
    } finally {
      setHrLoading(false);
    }
  }
  useEffect(() => {
    loadHr();
  }, []);

  /* ---------- Load password reset requests ---------- */
  async function loadResets() {
    try {
      const r = await fetch("/api/password-reset");
      const d = await r.json();
      setResetItems(d.items || []);
    } catch {
      setResetItems([]);
    } finally {
      setResetLoading(false);
    }
  }
  useEffect(() => {
    loadResets();
  }, []);

  /* ---------- KPI stats ---------- */
  const stats = useMemo(() => {
    const employees = rows.length;
    const departments = new Set(rows.map((r) => r.department)).size;
    const totalSalary = rows.reduce(
      (sum, r) => sum + (Number(r.salary) || 0),
      0
    );
    return { employees, departments, totalSalary };
  }, [rows]);

  /* ---------- Charts ---------- */
  const deptData = useMemo(() => {
    const groups: Record<string, number> = {};
    rows.forEach((r) => {
      groups[r.department] = (groups[r.department] || 0) + 1;
    });
    return Object.entries(groups).map(([dept, employees]) => ({
      dept,
      employees,
    }));
  }, [rows]);

  const salaryPie = useMemo(() => {
    const groups: Record<string, number> = {};
    rows.forEach((r) => {
      groups[r.department] =
        (groups[r.department] || 0) + (Number(r.salary) || 0);
    });
    return Object.entries(groups).map(([name, value]) => ({
      name,
      value,
    }));
  }, [rows]);

  const headcountTrend = useMemo(() => {
    const base = stats.employees;
    return [
      { m: "Jan", emp: Math.max(0, base - 3) },
      { m: "Feb", emp: Math.max(0, base - 2) },
      { m: "Mar", emp: Math.max(0, base - 1) },
      { m: "Apr", emp: base },
      { m: "May", emp: base },
      { m: "Jun", emp: base },
    ];
  }, [stats.employees]);

  const COLORS = ["#0d6efd", "#20c997", "#ffc107", "#dc3545", "#6f42c1"];

  /* ---------- Actions ---------- */
  async function updateLeave(id: number, status: "approved" | "rejected") {
    setLeaveMsg("");
    try {
      const r = await fetch("/api/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const d = await r.json();
      if (d.ok) {
        setLeaveItems((prev) => prev.map((it) => (it.id === id ? d.item : it)));
        setLeaveMsg(`✅ Request #${id} ${status}.`);
      } else {
        setLeaveMsg(`❌ ${d.error || "Update failed"}`);
      }
    } catch {
      setLeaveMsg("❌ Failed to update request.");
    }
  }

  function openResetModal(item: PasswordReset) {
    setResetMsg("");
    setResetForm({
      id: item.id,
      email: item.email,
      newPassword: "",
      confirm: "",
    });
    setResetOpen(true);
  }

  async function doPasswordReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetForm.id || !resetForm.email) return;

    if (!resetForm.newPassword || resetForm.newPassword.length < 6) {
      setResetMsg("Password must be at least 6 characters.");
      return;
    }
    if (resetForm.newPassword !== resetForm.confirm) {
      setResetMsg("Passwords do not match.");
      return;
    }

    setResetSaving(true);
    setResetMsg("");
    try {
      const res = await fetch("/api/password-reset", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resetForm.id,
          email: resetForm.email,
          newPassword: resetForm.newPassword,
        }),
      });
      const d = await res.json();
      if (d.ok) {
        setResetItems((prev) => prev.filter((it) => it.id !== resetForm.id));
        setResetOpen(false);
        setResetForm({ id: null, email: "", newPassword: "", confirm: "" });
      } else {
        setResetMsg(d.error || "Failed to reset password.");
      }
    } catch {
      setResetMsg("Failed to reset password.");
    } finally {
      setResetSaving(false);
    }
  }

  const nameById = (id: number) =>
    rows.find((e) => e.id === id)?.name || `#${id}`;

  /* ---------- Render ---------- */
  return (
    <div className={styles.wrap}>
      <Navbar role="admin" />

      <header className={styles.hero}>
        <div>
          <h1 className={styles.title}>HR Admin Dashboard</h1>
          <p className={styles.subtitle}>
            Overview of workforce, requests & compensation
          </p>
        </div>
      </header>

      {/* KPI cards    */}
      <section className={styles.cards}>
        <div className={`${styles.card} ${styles.cardBlue}`}>
          <div className={styles.cardLabel}>Employees</div>
          <div className={styles.cardValue}>
            {loading ? "…" : stats.employees}
          </div>
        </div>
        <div className={`${styles.card} ${styles.cardGreen}`}>
          <div className={styles.cardLabel}>Departments</div>
          <div className={styles.cardValue}>
            {loading ? "…" : stats.departments}
          </div>
        </div>
        <div className={`${styles.card} ${styles.cardRed}`}>
          <div className={styles.cardLabel}>Total Salary</div>
          <div className={styles.cardValue}>
            {loading ? "…" : `£${stats.totalSalary.toLocaleString()}`}
          </div>
        </div>
      </section>

      {/* Charts   */}
      <section className={styles.grid}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Employees by Department</h3>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptData}>
                <XAxis dataKey="dept" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="employees" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Salary Distribution</h3>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={salaryPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                >
                  {salaryPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.panelWide}>
          <h3 className={styles.panelTitle}>Headcount Trend (6 months)</h3>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={headcountTrend}>
                <defs>
                  <linearGradient id="hc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopOpacity={0.6} />
                    <stop offset="95%" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="emp"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#hc)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Employee CRUD */}
      <EmployeeManager />
      <br />

      {/* Leave Requests Panel   */}
      <section className={styles.panelWide}>
        <h3 className={styles.panelTitle}>Leave Requests</h3>
        {leaveMsg && <div className={styles.alert}>{leaveMsg}</div>}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveLoading ? (
                <tr>
                  <td colSpan={6}>Loading…</td>
                </tr>
              ) : leaveItems.length ? (
                leaveItems.map((it) => (
                  <tr key={it.id}>
                    <td>{it.id}</td>
                    <td>{nameById(it.employeeId)}</td>
                    <td>
                      {it.start} → {it.end}
                    </td>
                    <td>{it.reason}</td>
                    <td style={{ textTransform: "capitalize" }}>{it.status}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.btnPrimary}
                          disabled={it.status === "approved"}
                          onClick={() => updateLeave(it.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className={styles.btnDanger}
                          disabled={it.status === "rejected"}
                          onClick={() => updateLeave(it.id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No leave requests yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <br />

      {/* Password Reset   + HR Requests  */}
      <section className={styles.twoColGrid}>
        <div className={styles.panelHalf}>
          <h3 className={styles.panelTitle}>🔑 Password Reset Requests</h3>

          {resetMsg && (
            <div
              className={`${styles.alert} ${
                resetMsg.startsWith("✅")
                  ? styles.alertSuccess
                  : styles.alertError
              }`}
            >
              {resetMsg}
            </div>
          )}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Requested</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {resetLoading ? (
                  <tr>
                    <td colSpan={4}>⏳ Loading reset requests…</td>
                  </tr>
                ) : resetItems.length ? (
                  resetItems.map((it) => (
                    <tr key={it.id}>
                      <td>{it.id}</td>
                      <td>
                        <code>{it.email}</code>
                      </td>
                      <td>
                        {new Date(it.requestedAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td>
                        <button
                          className={styles.btnPrimary}
                          onClick={() => openResetModal(it)}
                          title={`Set a new password for ${it.email}`}
                        >
                          🔧 Set Password
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>✅ No pending password reset requests</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.panelHalf}>
          <h3 className={styles.panelTitle}>HR Requests</h3>
          {hrMsg && <div className={styles.alert}>{hrMsg}</div>}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>From</th>
                  <th>Message</th>
                  <th>Requested At</th>
                </tr>
              </thead>
              <tbody>
                {hrLoading ? (
                  <tr>
                    <td colSpan={4}>Loading…</td>
                  </tr>
                ) : hrItems.length ? (
                  hrItems.map((it) => (
                    <tr key={it.id}>
                      <td>{it.id}</td>
                      <td>{nameById(it.fromId)}</td>
                      <td>{it.message}</td>
                      <td>{new Date(it.requestedAt).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>No HR requests yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* New Account Modal */}
      {newAccount && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setNewAccount(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>New Account Created</h4>
            <p>Share these details with the employee:</p>
            <ul>
              <li>
                <strong>Username:</strong> {newAccount.username}
              </li>
              <li>
                <strong>Temporary Password:</strong> {newAccount.password}
              </li>
            </ul>
            <div className={styles.modalActions}>
              <button
                className={styles.btnPrimary}
                onClick={() => setNewAccount(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setResetOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>Reset Password</h4>
            {resetMsg && <div className={styles.alert}>{resetMsg}</div>}
            <form onSubmit={doPasswordReset} className={styles.formGrid}>
              <label>
                <span>Email</span>
                <input
                  className={styles.input}
                  readOnly
                  value={resetForm.email}
                />
              </label>
              <label>
                <span>New Password</span>
                <input
                  className={styles.input}
                  type="password"
                  value={resetForm.newPassword}
                  onChange={(e) =>
                    setResetForm((f) => ({ ...f, newPassword: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                <span>Confirm Password</span>
                <input
                  className={styles.input}
                  type="password"
                  value={resetForm.confirm}
                  onChange={(e) =>
                    setResetForm((f) => ({ ...f, confirm: e.target.value }))
                  }
                  required
                />
              </label>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnLite}
                  onClick={() => setResetOpen(false)}
                  disabled={resetSaving}
                >
                  Cancel
                </button>
                <button className={styles.btnPrimary} disabled={resetSaving}>
                  {resetSaving ? "Saving…" : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
