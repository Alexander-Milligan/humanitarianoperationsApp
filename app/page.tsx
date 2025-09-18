"use client";

import Link from "next/link";
import styles from "./landing.module.css";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className="d-flex flex-wrap justify-content-center gap-4">
        <div className={styles.card}>
          <h1 className="fw-bold display-5 mb-3">
            Humanitarian Operations HR Management System
          </h1>

          <p className="lead mb-4">
            Note: I’m currently also developing four other community and council
            projects. Due to restrictions on my shared hosting provider, I don’t
            yet have permissions to set up a full SQL database for this demo.
            Instead, this app runs on an in-memory store to demonstrate the HR
            functionality.
          </p>

          <div className={styles.checklist}>
            <h5 className="fw-bold mb-2">Requirements Coverage</h5>
            <ul className="list-unstyled mb-0">
              <li>Authentication (sign-in/out, role-based access)</li>
              <li>Employee Management (add / edit / delete)</li>
              <li>Admin Dashboard (KPIs, charts, leave + HR requests)</li>
              <li>Employee Dashboard (profile, avatar, leave, HR, reset)</li>
              <li>Database — in-memory (shared hosting limits).</li>
              <li>CI/CD + AWS Deployment — not supported on shared hosting.</li>
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

        <div className={`${styles.card} ${styles.scrollCard}`}>
          <h2 className="fw-bold mb-3 text-center">
            Database Integration Journey
          </h2>

          <div className={styles.scrollContent}>
            <section className="mb-4">
              <h5 className="fw-bold">Learning Curve</h5>
              <p>
                I dedicated the last few days to learning how to properly
                integrate with Vercel and Neon Postgres. With no prior
                experience on these platforms, this was a steep but valuable
                challenge that demonstrates my ability to adapt quickly.
              </p>
            </section>

            <section className="mb-4">
              <h5 className="fw-bold">Key Achievement</h5>
              <p>
                I implemented a fully working login flow backed by a real
                database, replacing the temporary in-memory store. This
                validates my capacity to solve unfamiliar problems under
                pressure and deliver production-ready solutions.
              </p>
            </section>

            <section className="mb-4">
              <h5 className="fw-bold">Problem Solving</h5>
              <ul>
                <li>Resolved environment variable issues on Vercel</li>
                <li>Fixed TypeScript / ESM runtime errors in migrations</li>
                <li>Aligned database users and employees for consistency</li>
              </ul>
            </section>

            <section>
              <h5 className="fw-bold">Ongoing Work</h5>
              <p>
                Some staff dashboards still need refinement. These remaining
                tasks show my persistence and ownership: I take responsibility
                not only for successes but also for resolving issues completely.
              </p>
            </section>

            <footer className="mt-4 text-muted small text-center">
              Demonstrating technical growth, professionalism, and resilience.
            </footer>
          </div>
        </div>
      </div>

      <footer className="mt-5 text-white-50 small text-center">
        © {new Date().getFullYear()} HR System — Demo App
      </footer>
    </div>
  );
}
