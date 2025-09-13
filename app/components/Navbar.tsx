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
              <li onClick={() => router.push("/dashboard/admin")}>Dashboard</li>
              <li onClick={() => router.push("/dashboard/admin#employees")}>
                Employees
              </li>
              <li onClick={() => router.push("/dashboard/admin#reports")}>
                Reports
              </li>
            </>
          ) : (
            <>
              <li onClick={() => router.push("/dashboard/employee")}>
                My Dashboard
              </li>
              <li onClick={() => router.push("/dashboard/employee#profile")}>
                My Profile
              </li>
              <li onClick={() => router.push("/dashboard/employee#department")}>
                My Department
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
