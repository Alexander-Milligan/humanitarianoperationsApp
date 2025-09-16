"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./admin.module.css";

type Emp = {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
};

export default function EmployeeManager() {
  const [rows, setRows] = useState<Emp[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Modal + form state
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editing, setEditing] = useState<Emp | null>(null);
  const [form, setForm] = useState<Omit<Emp, "id">>({
    name: "",
    email: "",
    department: "",
    position: "",
    salary: 0,
  });
  const [targetId, setTargetId] = useState<number | null>(null);
  const [msg, setMsg] = useState<string>("");

  /** Load employees from API */
  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/employees");
      const d = await r.json();
      setRows(d.employees || []);
    } catch (err) {
      console.error("Failed to load employees:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /** Filtered list based on search */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.email, r.department, r.position].some((v) =>
        v.toLowerCase().includes(q)
      )
    );
  }, [rows, search]);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", email: "", department: "", position: "", salary: 0 });
    setShowForm(true);
    setMsg("");
  }

  function openEdit(emp: Emp) {
    setEditing(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      salary: emp.salary,
    });
    setShowForm(true);
    setMsg("");
  }

  function openDelete(id: number) {
    setTargetId(id);
    setShowDelete(true);
    setMsg("");
  }

  /** Save (add/edit) employee */
  async function saveForm(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!form.name || !form.email) {
      setMsg("Please fill name and email.");
      return;
    }

    const method = editing ? "PUT" : "POST";
    const body = editing ? { id: editing.id, ...form } : form;

    try {
      const r = await fetch("/api/employees", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.ok) {
        setShowForm(false);
        await load();
        window.dispatchEvent(new Event("employees:changed")); // notify dashboard

        // ✅ Dispatch account:created event if new account was returned
        if (d.account) {
          window.dispatchEvent(
            new CustomEvent("account:created", { detail: d.account })
          );
          setMsg(
            `✅ Employee created. Login: ${d.account.username}, Temp password: ${d.account.password}`
          );
        } else {
          setMsg("✅ Employee updated successfully.");
        }
      } else {
        setMsg(d.error || "Failed to save.");
      }
    } catch (err) {
      console.error(err);
      setMsg("Error saving employee.");
    }
  }

  /** Confirm delete */
  async function confirmDelete() {
    if (!targetId) return;
    try {
      const r = await fetch("/api/employees", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: targetId }),
      });
      const d = await r.json();
      if (d.ok) {
        setShowDelete(false);
        setTargetId(null);
        await load();
        window.dispatchEvent(new Event("employees:changed"));
        setMsg("✅ Employee deleted.");
      } else {
        setMsg(d.error || "Failed to delete.");
      }
    } catch (err) {
      console.error(err);
      setMsg("Error deleting employee.");
    }
  }

  return (
    <div className={styles.panelWide}>
      <div className={styles.toolbar}>
        <h3 className={styles.panelTitle}>Manage Employees</h3>
        <div className={styles.toolRight}>
          <input
            className={styles.input}
            placeholder="Search name, email, dept…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className={styles.btnPrimary} onClick={openAdd}>
            + Add Employee
          </button>
        </div>
      </div>

      {msg && <div className={styles.alert}>{msg}</div>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th>Salary</th>
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>Loading…</td>
              </tr>
            ) : filtered.length ? (
              filtered.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.email}</td>
                  <td>{e.department}</td>
                  <td>{e.position}</td>
                  <td>£{e.salary.toLocaleString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.btnLite}
                        onClick={() => openEdit(e)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.btnDanger}
                        onClick={() => openDelete(e.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowForm(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>
              {editing ? "Edit Employee" : "Add Employee"}
            </h4>
            {msg && <div className={styles.alert}>{msg}</div>}

            <form onSubmit={saveForm} className={styles.formGrid}>
              <label>
                <span>Name</span>
                <input
                  className={styles.input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  className={styles.input}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </label>
              <label>
                <span>Department</span>
                <input
                  className={styles.input}
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                <span>Position</span>
                <input
                  className={styles.input}
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                <span>Salary</span>
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  value={form.salary}
                  onChange={(e) =>
                    setForm({ ...form, salary: Number(e.target.value) })
                  }
                  required
                />
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnLite}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button className={styles.btnPrimary}>
                  {editing ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowDelete(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>Delete Employee</h4>
            <p>Are you sure you want to delete this employee?</p>
            <div className={styles.modalActions}>
              <button
                className={styles.btnLite}
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
              <button className={styles.btnDanger} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
