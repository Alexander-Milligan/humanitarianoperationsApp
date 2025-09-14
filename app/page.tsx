"use client";

import Link from "next/link";
import styles from "./landing.module.css";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className="fw-bold display-5 mb-3">
          🚀 Humanitarian Operations HR Management System
        </h1>

        <p className="lead mb-4">
          ⚠️ Note: I’m currently also developing four other community and
          council projects. Due to restrictions on my shared hosting provider, I
          don’t yet have permissions to set up a full SQL database for this
          demo. Instead, this app runs on an in-memory store to demonstrate the
          HR functionality.
        </p>

        <div className={styles.checklist}>
          <h5 className="fw-bold mb-2">✅ Requirements Coverage</h5>
          <ul className="list-unstyled mb-0">
            <li>✅ Authentication (sign-in/out, role-based access)</li>
            <li>✅ Employee Management (add / edit / delete)</li>
            <li>✅ Admin Dashboard (KPIs, charts, leave + HR requests)</li>
            <li>✅ Employee Dashboard (profile, avatar, leave, HR, reset)</li>
            <li>⚠️ Database — in-memory (shared hosting limits).</li>
            <li>
              ⚠️ CI/CD + AWS Deployment — not supported on shared hosting.
            </li>
          </ul>
        </div>

        <div className="d-flex justify-content-center gap-3">
          <Link
            href="/login"
            className={`btn btn-light btn-lg ${styles.btnRounded}`}
          >
            Login
          </Link>
          <Link
            href="/register"
            className={`btn btn-outline-light btn-lg ${styles.btnRounded}`}
          >
            Register
          </Link>
        </div>
      </div>

      <footer className="mt-5 text-white-50 small">
        © {new Date().getFullYear()} HR System — Demo App
      </footer>
    </div>
  );
}
