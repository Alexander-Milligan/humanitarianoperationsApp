"use client";

import Link from "next/link";
import styles from "./landing.module.css";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className="d-flex flex-wrap justify-content-center gap-4">
        {/* Existing HR System Card */}
        <div className={styles.card}>
          <h1 className="fw-bold display-5 mb-3">
            🚀 Humanitarian Operations HR Management System
          </h1>

          <p className="lead mb-4">
            ⚠️ Note: I’m currently also developing four other community and
            council projects. Due to restrictions on my shared hosting provider,
            I don’t yet have permissions to set up a full SQL database for this
            demo. Instead, this app runs on an in-memory store to demonstrate
            the HR functionality.
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

        {/* New Card: Database Integration Journey */}
        <div className={styles.card}>
          <h2 className="fw-bold mb-3">🛠 Database Integration Journey</h2>

          <p className="mb-4">
            Over the last few days I’ve been learning how to properly integrate
            with <strong>Vercel</strong> and <strong>Neon Postgres</strong>.
            Having no prior experience with Vercel, this was a steep but
            valuable learning curve.
          </p>

          <p className="mb-4">
            After a lot of debugging, I now have a{" "}
            <strong>fully working login flow</strong> using the real database,
            instead of the temporary store page. This shows my ability to
            quickly learn, adapt, and deliver under pressure — even when facing
            new platforms and unexpected blockers.
          </p>

          <p className="mb-4">
            ⚠️ Some staff dashboards still have bugs, but these are being
            resolved. The progress so far reflects my approach to{" "}
            <strong>problem solving, persistence, and ownership</strong> of the
            work.
          </p>

          <footer className="text-white-50 small">
            Demonstrating technical growth & resilience.
          </footer>
        </div>
      </div>

      <footer className="mt-5 text-white-50 small">
        © {new Date().getFullYear()} HR System — Demo App
      </footer>
    </div>
  );
}
