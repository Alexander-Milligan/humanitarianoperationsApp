"use client";

import Link from "next/link";
import styles from "./landing.module.css";
export default function LandingPage() {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100 text-center"
      style={{
        background: "linear-gradient(135deg, #0d6efd, #6c63ff)",
      }}
    >
      {/* Glass Card */}
      <div
        className="p-5 shadow-lg"
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(12px)",
          borderRadius: "1rem",
          maxWidth: "720px",
          width: "90%",
          color: "white",
        }}
      >
        <h1 className="fw-bold display-4 mb-3">
          🚀 Humanitarian Operations HR Management System
        </h1>
        <p className="lead mb-4">
          ⚠️ Note: I’m currently also developing four other community and
          council projects. Due to restrictions on my shared hosting provider, I
          don’t yet have permissions to set up a full SQL database for this
          demo. Instead, this app runs on an in-memory store to demonstrate the
          HR functionality.
        </p>
        <p className="lead mb-4">
          To demonstrate my real-world database and email integration skills,
          please see my production website:{" "}
          <Link
            href="https://saltirewebsites.com/site/"
            target="_blank"
            className="text-white fw-bold text-decoration-underline"
          >
            SaltireWebsites.com →
          </Link>{" "}
          (the homepage includes a live chatbot connected to a database +
          SMTP-based email system).
        </p>

        {/* Checklist */}
        <div
          className="text-start mb-4"
          style={{
            background: "rgba(0,0,0,0.3)",
            padding: "1rem",
            borderRadius: "0.75rem",
            fontSize: "0.95rem",
            lineHeight: 1.6,
          }}
        >
          <h5 className="fw-bold mb-2">✅ Requirements Coverage</h5>
          <ul className="list-unstyled mb-0">
            <li>✅ Authentication (sign-in/out, role-based access)</li>
            <li>✅ Employee Management (add / edit / delete)</li>
            <li>✅ Admin Dashboard (KPIs, charts, leave + HR requests)</li>
            <li>✅ Employee Dashboard (profile, avatar, leave, HR, reset)</li>
            <li>
              ⚠️ Database — in-memory (shared hosting limits). Live DB example:{" "}
              <Link
                href="https://saltirewebsites.com/site/"
                target="_blank"
                className="text-white fw-bold text-decoration-underline"
              >
                View Demo →
              </Link>
            </li>
            <li>
              ⚠️ CI/CD + AWS Deployment — not supported on shared hosting (can
              be provided if required).
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-center gap-3">
          <Link
            href="/login"
            className="btn btn-light btn-lg px-4 fw-bold shadow-sm"
            style={{ borderRadius: "50px", transition: "0.3s" }}
          >
            Login
          </Link>
          <Link
            href="/register"
            className="btn btn-outline-light btn-lg px-4 fw-bold shadow-sm"
            style={{ borderRadius: "50px", transition: "0.3s" }}
          >
            Register
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-5 text-white-50 small">
        © {new Date().getFullYear()} HR System — Demo App
      </footer>
    </div>
  );
}
