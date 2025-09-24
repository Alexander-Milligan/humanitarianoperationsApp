# Basic Internal HR System

[![License: Proprietary](https://img.shields.io/badge/license-proprietary-red.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap)](https://getbootstrap.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)](https://nodejs.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)


A full-stack HR management system built with Next.js, TypeScript, and Node.js API routes.  
This project demonstrates role-based authentication, employee management, HR request handling, and live deployment on **Vercel**.  

Project Objective

The goal of this project is to build a **basic internal HR system** that enables a company to manage employees efficiently.  
The system supports **Admin** and **Employee** roles, offering features for CRUD operations, dashboards, and HR requests.  

---

##Requirements vs Implementation

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
hr-system/
│── app/ # Next.js App Router pages
│ ├── api/ # API routes (employees, hr, stats, leave, etc.)
│ └── dashboard/ # Admin & Employee dashboards
│── lib/ # Shared in-memory store and type models
│── public/ # Static assets (avatars, uploads)
│── server.js # Local Express server (for cPanel Node hosting)
│── package.json
│── next.config.ts
│── tsconfig.json
│── .env.local # Environment variables (ignored in repo)

## 👨‍💻 Author

Built with ❤️ by **Alexander Milligan**  
🌐 [saltirewebsites.com](https://saltirewebsites.com)  

🚀 [Live Vercel Demo](https://humanitarianoperations-app.vercel.app/)



## ⚖️ Copyright & License

© 2025 **Alexander Milligan**. All rights reserved.  

This project is provided **exclusively for technical assessment purposes**.  
It may not be copied, modified, distributed, or used outside of the assessment without prior written consent.  

🔗 See [LICENSE](./LICENSE) and [COPYRIGHT.md](./COPYRIGHT.md) for details.  
