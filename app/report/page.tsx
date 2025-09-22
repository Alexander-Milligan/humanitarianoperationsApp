export const metadata = {
  title: "System Report – HR Management System",
  description:
    "Comprehensive report covering architecture, features, data model, security, deployment, and a future improvement plan.",
};

export default function ReportPage() {
  return (
    <main style={{ padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.2 }}>
          HR Management System — Technical Report
        </h1>
        <p style={{ marginTop: 10, color: "#555", fontSize: 16 }}>
          A concise overview of the application’s functionality, architecture,
          data design, security, deployment, and a practical roadmap for next
          steps.
        </p>
      </header>

      <nav
        aria-label="Table of contents"
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 18,
          marginBottom: 28,
          background: "#fafafa",
        }}
      >
        <strong>Contents</strong>
        <ol style={{ marginTop: 10, paddingLeft: 18 }}>
          <li>
            <a href="#overview">Executive Overview</a>
          </li>
          <li>
            <a href="#features">Delivered Features</a>
          </li>
          <li>
            <a href="#architecture">Architecture & Technology Choices</a>
          </li>
          <li>
            <a href="#data">Data Model</a>
          </li>
          <li>
            <a href="#security">Security & Access Control</a>
          </li>
          <li>
            <a href="#ux">UX Notes & Accessibility</a>
          </li>
          <li>
            <a href="#deployment">Deployment & Environments</a>
          </li>
          <li>
            <a href="#testing">Testing Approach</a>
          </li>
          <li>
            <a href="#limits">Known Limitations</a>
          </li>
          <li>
            <a href="#roadmap">Future Improvements & Roadmap</a>
          </li>
          <li>
            <a href="#conclusion">Conclusion</a>
          </li>
        </ol>
      </nav>

      <section id="overview" style={{ marginBottom: 40 }}>
        <h2>Executive Overview</h2>
        <p>
          This HR Management System delivers a complete workflow for
          authentication, role-based access, employee administration, and staff
          self-service. The Admin dashboard provides KPIs, charts, leave
          management, password reset handling, and HR request visibility. The
          Employee dashboard enables staff to update their details, request
          leave, contact HR, and initiate password resets.
        </p>
        <p>
          The application is built with Next.js (React + TypeScript), uses
          Next.js API routes on the server, and persists data in PostgreSQL. It
          is structured for deployment on modern platforms (Vercel, Render, or
          AWS). The system prioritizes clarity, maintainability, and a pragmatic
          path for future growth.
        </p>
      </section>

      <section id="features" style={{ marginBottom: 40 }}>
        <h2>Delivered Features</h2>
        <ul>
          <li>
            <strong>Authentication & Roles:</strong> Secure sign-in/out with
            role-based access (Admin, Employee, HR).
          </li>
          <li>
            <strong>Employee Management (Admin):</strong> Add, edit, delete
            employees. Data includes name, email, department, position, and
            salary; linked to user accounts.
          </li>
          <li>
            <strong>Dashboards:</strong> Admin KPIs and charts (department
            headcount, salary distribution, headcount trend). Employee dashboard
            with profile, avatar, and key actions.
          </li>
          <li>
            <strong>Leave Requests:</strong> Employees submit; Admin
            approves/rejects.
          </li>
          <li>
            <strong>HR Requests:</strong> Employees message HR; Admin/HR views
            with sender resolution via user linkage.
          </li>
          <li>
            <strong>Password Reset Flow:</strong> Employees request; Admin sets
            the new password (hashed).
          </li>
          <li>
            <strong>Profile Pictures:</strong> Avatar upload & display.
          </li>
        </ul>
      </section>

      <section id="architecture" style={{ marginBottom: 40 }}>
        <h2>Architecture & Technology Choices</h2>
        <ul>
          <li>
            <strong>Frontend:</strong> Next.js (App Router), React, TypeScript.
            CSS Modules and Bootstrap utility classes for consistent styling.
          </li>
          <li>
            <strong>Backend:</strong> Next.js API routes (Node.js). Clear
            separation of concerns, minimal controllers, and typed data shaping
            on the client.
          </li>
          <li>
            <strong>Database:</strong> PostgreSQL with normalized tables:{" "}
            <em>users</em>,<em> employees</em>, <em>leave_requests</em>,{" "}
            <em>hr_requests</em>, <em>password_resets</em>.
          </li>
          <li>
            <strong>Charts & UI:</strong> Recharts for visualizations
            (bar/pie/area).
          </li>
          <li>
            <strong>Auth:</strong> JWT-based session stored client-side
            (rotatable), checked in pages and API routes as needed.
          </li>
        </ul>
        <p>
          This stack balances developer velocity with production viability: it’s
          simple to reason about, easy to test, and ready to scale with
          additional services.
        </p>
      </section>

      <section id="data" style={{ marginBottom: 40 }}>
        <h2>Data Model</h2>
        <p>
          Core relationships are designed to keep people and accounts aligned
          while allowing HR operations to remain simple:
        </p>
        <ul>
          <li>
            <strong>users</strong> — authentication, role, name, email,
            username, password_hash.
          </li>
          <li>
            <strong>employees</strong> — one-to-one with users via{" "}
            <code>user_id</code>; department, position, salary, avatar_url.
          </li>
          <li>
            <strong>leave_requests</strong> — references employees (
            <code>employee_id</code>); start, end, reason, status, requested_at.
          </li>
          <li>
            <strong>hr_requests</strong> — references users (
            <code>user_id</code>); message, status, requested_at.
          </li>
          <li>
            <strong>password_resets</strong> — email, requested_at; processed by
            admin with secure hashing.
          </li>
        </ul>
        <p>
          The split between <em>users</em> and <em>employees</em> ensures
          authentication/account data stays clean while HR-specific fields
          evolve independently.
        </p>
      </section>

      <section id="security" style={{ marginBottom: 40 }}>
        <h2>Security & Access Control</h2>
        <ul>
          <li>Passwords are hashed with bcrypt before storage.</li>
          <li>
            Role checks guard admin/HR actions on both the client and the
            server.
          </li>
          <li>
            Input validation on API routes; cautious JSON parsing and checks.
          </li>
          <li>
            Email lookups normalized (e.g., lowercased comparisons where
            appropriate).
          </li>
          <li>
            Minimal data exposure in responses (only fields needed by the UI).
          </li>
        </ul>
      </section>

      <section id="ux" style={{ marginBottom: 40 }}>
        <h2>UX Notes & Accessibility</h2>
        <ul>
          <li>
            Clear navigation via a simple Navbar with anchor targets for key
            sections.
          </li>
          <li>
            Consistent button styles and layout structure for readability.
          </li>
          <li>
            Tables are responsive and use semantic markup for assistive tech.
          </li>
          <li>
            Modals provide focused tasks with clear actions and validation.
          </li>
        </ul>
      </section>

      <section id="deployment" style={{ marginBottom: 40 }}>
        <h2>Deployment & Environments</h2>
        <ul>
          <li>
            <strong>Preferred:</strong> Vercel for the Next.js app with
            Neon/Postgres or Supabase for the database.
          </li>
          <li>
            <strong>Alternative:</strong> Render or Railway for a full-stack
            managed deployment; AWS for containerized or serverless approach as
            the system grows.
          </li>
          <li>
            Environment variables for DB connection, JWT secrets, and S3
            credentials.
          </li>
        </ul>
      </section>

      <section id="testing" style={{ marginBottom: 40 }}>
        <h2>Testing Approach</h2>
        <ul>
          <li>Focused route-level testing of API endpoints.</li>
          <li>
            Client-side smoke tests of critical flows (auth, CRUD, requests).
          </li>
          <li>
            Manual verification of data joins (users ↔ employees, users ↔
            hr_requests).
          </li>
        </ul>
      </section>

      <section id="limits" style={{ marginBottom: 40 }}>
        <h2>Known Limitations</h2>
        <ul>
          <li>JWT rotation/refresh can be expanded for long-lived sessions.</li>
          <li>
            File uploads are kept simple; production should use S3 with signed
            URLs.
          </li>
          <li>
            More granular HR workflows (categorization, SLAs, audit logs) can be
            added.
          </li>
          <li>
            Automated tests can be broadened to include visual regression and
            e2e flows.
          </li>
        </ul>
      </section>

      <section id="roadmap" style={{ marginBottom: 40 }}>
        <h2>Future Improvements & Roadmap</h2>

        <h3 style={{ marginTop: 12 }}>Short Term</h3>
        <ul>
          <li>
            Introduce signed URL uploads to S3 for avatars and attachments.
          </li>
          <li>Add pagination and sorting to tables (employees, requests).</li>
          <li>
            Strengthen auth with refresh tokens and role middleware on API
            routes.
          </li>
          <li>
            Export reports (CSV/PDF) for headcount, salary, and leave summaries.
          </li>
        </ul>

        <h3 style={{ marginTop: 12 }}>Medium Term</h3>
        <ul>
          <li>Role management UI (promote/demote users, assign HR roles).</li>
          <li>
            Richer HR workflows: categories, priorities, assignment, status
            history.
          </li>
          <li>
            Notifications (email or in-app) for approvals, resets, and HR
            updates.
          </li>
          <li>
            Team/Org views: managers, direct reports, department budget
            insights.
          </li>
        </ul>

        <h3 style={{ marginTop: 12 }}>Long Term</h3>
        <ul>
          <li>Performance reviews and objectives tracking.</li>
          <li>Time-off policy configuration and accruals.</li>
          <li>Compensation bands and salary benchmarking tools.</li>
          <li>Audit trails, analytics warehouse, and BI integration.</li>
        </ul>
      </section>

      <section id="conclusion" style={{ marginBottom: 16 }}>
        <h2>Conclusion</h2>
        <p>
          This system meets the assessment requirements and goes further with a
          practical foundation for HR workflows, security, and growth. The
          codebase is organized for maintainability and ready to evolve with a
          clear roadmap. It reflects a focus on usability, correctness, and
          delivery under real-world constraints.
        </p>
      </section>

      <hr style={{ margin: "32px 0" }} />

      <p style={{ fontSize: 14, color: "#666" }}>
        HR Management System — Report Page
      </p>
    </main>
  );
}
