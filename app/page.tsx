"use client";

import Link from "next/link";
import styles from "./landing.module.css";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className="d-flex justify-content-center gap-3 mt-4">
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
        <Link
          href="/report"
          className={`btn btn-secondary btn-lg ${styles.btnRounded}`}
        >
          Read the Report
        </Link>
      </div>

      <div className="d-flex flex-wrap justify-content-center gap-4">
        <div className={styles.card}>
          <h1 className="fw-bold display-5 mb-3">
            Humanitarian Operations HR Management System
          </h1>

          <p className="lead mb-4">
            This is a full-stack HR management system I built to cover all the
            required features of the technical assessment, as well as several
            additional improvements.
          </p>

          <div className={styles.checklist}>
            <h5 className="fw-bold mb-2">Features</h5>
            <ul className="list-unstyled mb-0">
              <li>Authentication with secure sign-in and sign-out</li>
              <li>Role-based dashboards for administrators and employees</li>
              <li>Employee management with add, edit, and delete functions</li>
              <li>
                Admin dashboard with key performance indicators and charts
              </li>
              <li>Leave requests with approval workflow</li>
              <li>HR requests and communication</li>
              <li>Profile picture uploads and password reset functionality</li>
              <li>Built with Next.js, TypeScript, and PostgreSQL</li>
            </ul>
          </div>

          <p className="mt-4">
            The backend runs on PostgreSQL with Next.js handling both the
            frontend and API routes. The app is fully responsive, styled with
            Bootstrap, and deployable on Vercel or AWS. This project
            demonstrates the required functionality and also highlights my
            ability to refine workflows, focus on usability, and ensure the
            system can be scaled further.
          </p>

          <div className="d-flex justify-content-center gap-3 mt-4">
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
          <h2 className="fw-bold mb-3 text-center">Development Overview</h2>

          <div className={styles.scrollContent}>
            <section className="mb-4">
              <h5 className="fw-bold">Approach</h5>
              <p>
                I planned and structured the system to meet all required
                features and included additional elements that make it more
                practical for real-world use. This included refining workflows
                for leave management, HR messaging, and profile management.
              </p>
            </section>

            <section className="mb-4">
              <h5 className="fw-bold">Key Achievements</h5>
              <p>
                Implemented a fully functional authentication and authorization
                flow backed by PostgreSQL, with dashboards that adapt to user
                roles. I also integrated employee statistics, reset flows, and
                upload features to extend the core functionality.
              </p>
            </section>

            <section className="mb-4">
              <h5 className="fw-bold">Challenges Solved</h5>
              <ul>
                <li>Database integration and schema alignment</li>
                <li>Deployment configuration with Vercel and Postgres</li>
                <li>Consistent data handling across users and employees</li>
                <li>Never used Vercel before, like it now.</li>
              </ul>
            </section>

            <section>
              <h5 className="fw-bold">Outcome</h5>
              <p>
                The result is a working HR system that demonstrates both the
                required features and additional extras I think a hr system
                should have. I hope It highlights my ability to deliver a
                complete full-stack application with documentationand
                intellectual property coverage too.
              </p>
            </section>

            <footer className="mt-4 text-muted small text-center">
              Demonstrating technical growth, efficiency, and reliability with
              room for additionly opertunities.
            </footer>
          </div>
        </div>
      </div>

      <footer className="mt-5 text-white-50 small text-center">
        © {new Date().getFullYear()} HR System — Demo Application
      </footer>
    </div>
  );
}
