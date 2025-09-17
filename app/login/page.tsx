"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css"; // ✅ keep your CSS module

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(""); // 🔑 allow username OR email
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔑 Reset mode state
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }), // ✅ changed
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        // save role/token in sessionStorage if returned
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

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();
      if (data.ok) {
        setMessage("✅ Password reset request submitted. HR will review.");
        setResetEmail("");
        setResetMode(false);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage("❌ Failed to submit reset request.");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className="text-light">HR System</h2>
        <p className={styles.subtitle}>
          {resetMode ? "Request password reset" : "Sign in to continue"}
        </p>

        {!resetMode ? (
          <form onSubmit={handleLogin} className={styles.form}>
            <input
              type="text"
              placeholder="Email or Username" // ✅ clearer placeholder
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

            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => setResetMode(true)}
            >
              Forgot password?
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className={styles.form}>
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              className={styles.input}
            />

            <button type="submit" className={styles.btn}>
              Submit Request
            </button>

            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => setResetMode(false)}
            >
              Back to login
            </button>
          </form>
        )}

        {message && <div className={styles.message}>{message}</div>}
      </div>
    </div>
  );
}
