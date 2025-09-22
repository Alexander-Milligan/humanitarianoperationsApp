"use client";

import { useRouter } from "next/navigation";
import styles from "./navbar.module.css";

type NavbarProps = {
  role: "admin" | "employee";
};

export default function Navbar({ role }: NavbarProps) {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft}>
        <span className={styles.brand}>HR System</span>
        <ul className={styles.navLinks}>
          {role === "admin" ? (
            <>
              <li>
                <a href="/dashboard/admin">Dashboard</a>
              </li>
              <li>
                <a href="/dashboard/admin#employees">Employees</a>
              </li>
              <li>
                <a href="/dashboard/admin#reports">Reports</a>
              </li>
            </>
          ) : (
            <>
              <li>
                <a href="/dashboard/employee">My Dashboard</a>
              </li>
              <li>
                <a href="/dashboard/employee#profile">My Profile</a>
              </li>
              <li>
                <a href="/dashboard/employee#department">My Department</a>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className={styles.navRight}>
        <button className={styles.btnDanger} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
