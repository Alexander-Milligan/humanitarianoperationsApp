# 🌍 Basic Internal HR System

A full-stack **HR management system** built with **Next.js, TypeScript, and Node.js API routes**.  
This project demonstrates role-based authentication, employee management, HR request handling, and live deployment on **Vercel**.  

---

## 🎯 Project Objective

The goal of this project is to build a **basic internal HR system** that enables a company to manage employees efficiently.  
The system supports **Admin** and **Employee** roles, offering features for CRUD operations, dashboards, and HR requests.  

---

## ✅ Requirements vs Implementation

### 1. **User Authentication**
- ✔️ Sign-in & Sign-out functionality
- ✔️ JWT-based sessions
- ✔️ Role-based access control (**Admin** & **Employee**)

### 2. **Employee Management**
- ✔️ Admin can:
  - Add employees (Name, Email, Department, Position, Salary)
  - Edit employee details
  - Delete employees
- ✔️ Linked login account created automatically for each employee
- ✔️ Demo account: `admin / password123`

### 3. **Tech Stack**
- **Frontend:** React, TypeScript, Next.js  
- **Styling:** CSS Modules + Bootstrap 5  
- **Backend:** Node.js via **Next.js API routes**  
- **Database (Demo):** In-memory store (`/lib/store.ts`)  
  - *(Production-ready to swap with PostgreSQL/MySQL/MongoDB)*  
- **Cloud Hosting:** **Vercel**  
  - CI/CD via GitHub → auto deploy to production  

### 4. **Bonus Features**
- ✔️ Upload employee profile pictures (local storage in `/public/uploads`)  
- ✔️ Dashboard with **employee statistics**  
- ✔️ Deployment via **Vercel** (cloud demo live)  
- ⚡ CI/CD (GitHub → Vercel integration)  

### 5. **Evaluation Criteria**
- ✔️ Clean, modular code (React components, API routes, typed models)  
- ✔️ Fully functional system with Admin & Employee flows  
- ✔️ Demonstrated full-stack skills (frontend, backend, APIs, auth)  
- ✔️ Live deployment (Vercel link below)  

---

## 🛠️ Tech Stack

| Layer         | Technology Used |
|---------------|-----------------|
| **Frontend**  | React 18, Next.js 15, TypeScript |
| **Backend**   | Next.js API Routes (Node.js) |
| **Styling**   | Bootstrap 5 + CSS Modules |
| **Charts**    | Recharts (Radial & Bar Charts) |
| **Auth**      | JWT (`jwt-decode`) |
| **Data Store**| In-memory demo store (`/lib/store.ts`) |
| **Cloud**     | Vercel (serverless deployment) |

---

## 📂 Project Structure

