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

type Emp = {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  avatar?: string; 
};

type TokenPayload = {
  id: number;
  role: "admin" | "employee";
  username: string;
  employeeId?: number;
  exp: number;
};

type HrReq = {
  id: number;
  fromId: number;
  message: string;
  requestedAt: string;
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

  // Modal states
  const [showProfile, setShowProfile] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showHr, setShowHr] = useState(false);
  const [showContactHr, setShowContactHr] = useState(false);

  // Forms and messages
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

  // HR requests
  const [hrItems, setHrItems] = useState<HrReq[]>([]);
  const [hrLoading, setHrLoading] = useState(false);

  // Avatar upload
  const [uploading, setUploading] = useState(false);

  // My leave requests
  const [myLeaves, setMyLeaves] = useState<LeaveReq[]>([]);
  const [myLeavesLoading, setMyLeavesLoading] = useState(false);

  /* ---------- Load employee + all employees ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const decoded: TokenPayload = jwtDecode(token);
        if (!decoded.employeeId) throw new Error("No employeeId in token");

        const r = await fetch("/api/employees");
        const d = await r.json();
        const list: Emp[] = d.employees || [];
        setAllEmployees(list);

        const emp = list.find((e: Emp) => e.id === decoded.employeeId);
        setEmployee(emp || null);
        setForm(emp || {});
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
  const nameById = (id: number) =>
    allEmployees.find((e) => e.id === id)?.name || `#${id}`;

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

  /* ---------- HR requests (panel + modal trigger) ---------- */
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

  // Load when opening the modal
  useEffect(() => {
    if (showHr && employee?.department === "HR") {
      loadHrRequests();
    }
  }, [showHr, employee]);

  // Also load once automatically for HR users so the panel shows content
  useEffect(() => {
    if (employee?.department === "HR") {
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
    fd.append("userId", String(employee.id)); // demo: userId mirrors employee.id

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        setForm({ ...form, avatar: data.filename });
        setEmployee({ ...employee, avatar: data.filename });
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

  async function submitLeave(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!employee) return;

    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          start: leaveForm.start,
          end: leaveForm.end,
          reason: leaveForm.reason,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg("✅ Leave request submitted.");
        setLeaveForm({ start: "", end: "", reason: "" });
        loadMyLeaves();
        setTimeout(() => setShowLeave(false), 1500);
      } else {
        setMsg(`❌ ${data.error || "Failed to submit leave request."}`);
      }
    } catch {
      setMsg("❌ Failed to submit leave request.");
    }
  }

  async function submitReset() {
    if (!employee) return;
    setResetMsg("");
    try {
      const res = await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: employee.email }),
      });
      const data = await res.json();
      if (data.ok) {
        setResetMsg("✅ Password reset request sent.");
        setTimeout(() => setShowReset(false), 1500);
      } else {
        setResetMsg(`❌ ${data.error || "Failed to request reset."}`);
      }
    } catch {
      setResetMsg("❌ Error sending request.");
    }
  }

  async function submitContactHr() {
    if (!employee || !contactHrText.trim()) return;
    setContactHrMsg("");
    try {
      const res = await fetch("/api/hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromId: employee.id, message: contactHrText }),
      });
      const data = await res.json();
      if (data.ok) {
        setContactHrMsg("✅ Message sent to HR.");
        setContactHrText("");
        setTimeout(() => {
          setShowContactHr(false);
          setContactHrMsg("");
        }, 1500);
      } else {
        setContactHrMsg(`❌ ${data.error || "Failed to send message."}`);
      }
    } catch {
      setContactHrMsg("❌ Error sending message.");
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
                src={`/uploads/${employee.avatar}`}
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

      {employee && (
        <>
          {/* Info Cards */}
          <section className={styles.cards}>
            <div className={`${styles.card} ${styles.cardBlue}`}>
              <div className={styles.cardLabel}>Email</div>
              <div className={styles.cardValue}>{employee.email}</div>
            </div>
            <div className={`${styles.card} ${styles.cardGreen}`}>
              <div className={styles.cardLabel}>Department</div>
              <div className={styles.cardValue}>{employee.department}</div>
            </div>
            <div className={`${styles.card} ${styles.cardRed}`}>
              <div className={styles.cardLabel}>Salary</div>
              <div className={styles.cardValue}>
                £{employee.salary.toLocaleString()}
              </div>
            </div>
          </section>

          {/* Salary + Actions */}
          <section className={styles.grid}>
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>My Salary Progress</h3>
              <div className={styles.chart}>
                <ResponsiveContainer width="100%" height={260}>
                  <RadialBarChart
                    innerRadius="40%"
                    outerRadius="100%"
                    barSize={30}
                    data={salaryProgress}
                  >
                    <RadialBar background dataKey="value" />
                    <Legend />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Quick Actions</h3>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <button
                  className={styles.btnPrimary}
                  onClick={() => setShowProfile(true)}
                >
                  View Profile
                </button>
                <button
                  className={styles.btnLite}
                  onClick={() => setShowUpdate(true)}
                >
                  Update My Details
                </button>
                <button
                  className={styles.btnDanger}
                  onClick={() => setShowLeave(true)}
                >
                  Request Leave
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={() => setShowReset(true)}
                >
                  Request Password Reset
                </button>
                {employee.department === "HR" ? (
                  <button
                    className={styles.btnLite}
                    onClick={() => setShowHr(true)}
                  >
                    View HR Requests
                  </button>
                ) : (
                  <button
                    className={styles.btnLite}
                    onClick={() => setShowContactHr(true)}
                  >
                    Contact HR
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* My Leave Requests */}
          <section className={styles.panelWide}>
            <div className={styles.toolbar}>
              <h3 className={styles.panelTitle}>My Leave Requests</h3>
              <button
                className={styles.btnLite}
                onClick={() => loadMyLeaves()}
                title="Refresh"
              >
                Refresh
              </button>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Requested</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeavesLoading ? (
                    <tr>
                      <td colSpan={5}>Loading…</td>
                    </tr>
                  ) : myLeaves.length ? (
                    myLeaves.map((it) => (
                      <tr key={it.id}>
                        <td>{it.id}</td>
                        <td>
                          {it.start} → {it.end}
                        </td>
                        <td>{it.reason}</td>
                        <td style={{ textTransform: "capitalize" }}>
                          {it.status}
                        </td>
                        <td>{new Date(it.requestedAt).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>No leave requests yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* HR Requests Panel (only for HR department) */}
          {employee.department === "HR" && (
            <section className={styles.panelWide}>
              <div className={styles.toolbar}>
                <h3 className={styles.panelTitle}>HR Requests</h3>
                <button className={styles.btnLite} onClick={loadHrRequests}>
                  Refresh
                </button>
              </div>
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
            </section>
          )}
        </>
      )}

      {/* Profile Modal */}
      {showProfile && employee && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowProfile(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>Profile</h4>
            {employee.avatar && (
              <img
                src={`/uploads/${employee.avatar}`}
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

      {/* Update Modal */}
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

      {/* Leave Modal */}
      {showLeave && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowLeave(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>Request Leave</h4>
            {msg && <div className={styles.alert}>{msg}</div>}
            <form onSubmit={submitLeave} className={styles.formGrid}>
              <label>
                <span>Start Date</span>
                <input
                  type="date"
                  className={styles.input}
                  value={leaveForm.start}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, start: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                <span>End Date</span>
                <input
                  type="date"
                  className={styles.input}
                  value={leaveForm.end}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, end: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                <span>Reason</span>
                <textarea
                  className={styles.input}
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, reason: e.target.value })
                  }
                  required
                />
              </label>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnLite}
                  onClick={() => setShowLeave(false)}
                >
                  Cancel
                </button>
                <button className={styles.btnPrimary}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showReset && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowReset(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>Request Password Reset</h4>
            {resetMsg && <div className={styles.alert}>{resetMsg}</div>}
            <p>
              Are you sure you want to request a password reset for{" "}
              <strong>{employee?.email}</strong>?
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnLite}
                onClick={() => setShowReset(false)}
              >
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={submitReset}>
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HR Requests Modal (unchanged behavior, only opens if HR clicks the button) */}
      {showHr && (
        <div className={styles.modalBackdrop} onClick={() => setShowHr(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>HR Requests</h4>
            {hrLoading ? (
              <p>Loading…</p>
            ) : hrItems.length ? (
              <ul>
                {hrItems.map((it) => (
                  <li key={it.id}>
                    <strong>#{it.id}</strong> – {it.message} (
                    {new Date(it.requestedAt).toLocaleString()})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No HR requests yet.</p>
            )}
            <div className={styles.modalActions}>
              <button
                className={styles.btnLite}
                onClick={() => setShowHr(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact HR Modal */}
      {showContactHr && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowContactHr(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>Contact HR</h4>
            {contactHrMsg && <div className={styles.alert}>{contactHrMsg}</div>}
            <textarea
              className={styles.input}
              rows={4}
              placeholder="Write your message..."
              value={contactHrText}
              onChange={(e) => setContactHrText(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnLite}
                onClick={() => setShowContactHr(false)}
              >
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={submitContactHr}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
