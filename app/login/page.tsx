"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        if (data.token) sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.user?.role);

        setMessage(`✅ Logged in as ${data.user?.role}`);

        if (data.user?.role === "admin") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard/employee");
        }
      } else {
        setMessage(`❌ ${data.error || "Login failed"}`);
      }
    } catch {
      setMessage("❌ Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className="text-light">HR System</h2>
        <p className={styles.subtitle}>Sign in to continue</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <input
            type="text"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && <div className={styles.message}>{message}</div>}
      </div>
    </div>
  );
}
