/* ---------- Employee type & data ---------- */
export type Emp = {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
};

const employees: Emp[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", department: "HR",      position: "Manager",   salary: 50000 },
  { id: 2, name: "Bob Smith",     email: "bob@example.com",   department: "IT",      position: "Developer", salary: 60000 },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", department: "Finance", position: "Analyst",   salary: 55000 },
];

/* ---------- User type & data ---------- */
export type User = {
  id: number;
  username: string;
  password: string; // ⚠️ demo only, not secure
  role: "admin" | "employee";
  name: string;
  employeeId?: number; // link to employee record if staff
  avatar?: string; // filename of profile image (saved in /public/uploads)
};

const users: User[] = [
  { id: 1, username: "admin", password: "admin123", role: "admin",    name: "HR Admin" },
  { id: 2, username: "alice", password: "alice123", role: "employee", name: "Alice Johnson", employeeId: 1 },
  { id: 3, username: "bob",   password: "bob123",   role: "employee", name: "Bob Smith",     employeeId: 2 },
];

/* ---------- Password Reset Requests ---------- */
export type PasswordReset = {
  id: number;
  email: string;
  requestedAt: string; // ISO timestamp
};

const passwordResets: PasswordReset[] = [];

/* ---------- Leave Requests ---------- */
export type LeaveRequest = {
  id: number;
  employeeId: number;
  start: string; // ISO date (yyyy-mm-dd)
  end: string;   // ISO date
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string; // ISO timestamp
};

const leaveRequests: LeaveRequest[] = [];

/* ---------- HR Requests ---------- */
export type HrRequest = {
  id: number;
  fromId: number;      // employee/user who submitted
  message: string;
  requestedAt: string; // ISO timestamp
};

const hrRequests: HrRequest[] = [];

/* ---------- Shared store ---------- */
const store = { employees, users, passwordResets, leaveRequests, hrRequests };

/* ---------- Utilities ---------- */
export function findUser(identifier: string, password: string): User | undefined {
  return store.users.find((u) => {
    if (u.password !== password) return false;
    if (u.username === identifier) return true;
    if (u.employeeId) {
      const emp = store.employees.find((e) => e.id === u.employeeId);
      if (emp?.email === identifier) return true;
    }
    return false;
  });
}

export function addUser(user: Omit<User, "id">): User {
  const newUser: User = { id: store.users.length + 1, ...user };
  store.users.push(newUser);
  return newUser;
}

/* ---------- Password reset helpers ---------- */
export function addPasswordReset(email: string): PasswordReset {
  const req: PasswordReset = {
    id: store.passwordResets.length + 1,
    email,
    requestedAt: new Date().toISOString(),
  };
  store.passwordResets.push(req);
  return req;
}

export function listPasswordResets(): PasswordReset[] {
  return [...store.passwordResets].sort((a, b) => (a.id < b.id ? 1 : -1));
}

/* ---------- Leave helpers ---------- */
export function addLeaveRequest(input: Omit<LeaveRequest, "id" | "status" | "requestedAt">): LeaveRequest {
  const req: LeaveRequest = {
    id: store.leaveRequests.length + 1,
    employeeId: input.employeeId,
    start: input.start,
    end: input.end,
    reason: input.reason,
    status: "pending",
    requestedAt: new Date().toISOString(),
  };
  store.leaveRequests.push(req);
  return req;
}

export function listLeaveRequests(): LeaveRequest[] {
  return [...store.leaveRequests].sort((a, b) => (a.id < b.id ? 1 : -1));
}

export function updateLeaveStatus(id: number, status: "approved" | "rejected"): LeaveRequest | undefined {
  const idx = store.leaveRequests.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  store.leaveRequests[idx] = { ...store.leaveRequests[idx], status };
  return store.leaveRequests[idx];
}

/* ---------- HR helpers ---------- */
export function addHrRequest(fromId: number, message: string): HrRequest {
  const req: HrRequest = {
    id: store.hrRequests.length + 1,
    fromId,
    message,
    requestedAt: new Date().toISOString(),
  };
  store.hrRequests.push(req);
  return req;
}

export function listHrRequests(): HrRequest[] {
  return [...store.hrRequests].sort((a, b) => (a.id < b.id ? 1 : -1));
}

export default store;
