"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
import Image from "next/image";

/* ---------- Types ---------- */
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

  useEffect(() => {
    const load = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const decoded: TokenPayload = jwtDecode(token);
        if (!decoded.employeeId) throw new Error("No employeeId in token");

        const r = await fetch("/api/employees");
        const d = await r.json();
        const emp = d.employees?.find((e: Emp) => e.id === decoded.employeeId);

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

  // Load my leave requests once employee known, and whenever a leave is submitted.
  const loadMyLeaves = useCallback(async () => {
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
  }, [employee]);

  useEffect(() => {
    if (employee) loadMyLeaves();
  }, [employee, loadMyLeaves]);

  const salaryProgress = useMemo(
    () =>
      employee
        ? [{ name: "Salary", value: employee.salary, fill: "#0d6efd" }]
        : [],
    [employee]
  );

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
    fd.append("userId", String(employee.id)); // userId==employee.id in this demo

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
        // refresh my list so status appears immediately
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

  async function loadHrRequests() {
    setHrLoading(true);
    try {
      const res = await fetch("/api/hr");
      const data = await res.json();
      if (data.ok) setHrItems(data.items);
    } catch {
      setHrItems([]);
    } finally {
      setHrLoading(false);
    }
  }

  useEffect(() => {
    if (showHr) loadHrRequests();
  }, [showHr]);

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
              <Image
                src={`/uploads/${employee.avatar}`}
                alt="Profile"
                width={60}
                height={60}
                style={{ borderRadius: "50%" }}
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

      {/* … KEEPING ALL YOUR ORIGINAL PANELS, CARDS, MODALS, TABLES … */}

      {/* Profile Modal */}
      {showProfile && employee && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowProfile(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>Profile</h4>
            {employee.avatar && (
              <Image
                src={`/uploads/${employee.avatar}`}
                alt="Profile"
                width={100}
                height={100}
                style={{ borderRadius: "50%" }}
              />
            )}
            {/* …rest of your profile modal unchanged… */}
          </div>
        </div>
      )}

      {/* …rest of your modals unchanged… */}
    </div>
  );
}
