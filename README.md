# Student Fee and Payment Reminder System (EduFee)

A full-stack, automated college academic fee management, installment tracking, official receipt generation, and intelligent payment reminder platform. Designed specifically as a college mini-project demonstration for Computer Science and Engineering students.

---

## 1. Project Overview

- **Project Title:** Student Fee and Payment Reminder System
- **Domain:** Academic Finance & Educational ERP Systems
- **Target Institution:** St. Xavier Institute of Engineering & Technology
- **Academic Year:** 2025–2026
- **Architecture:** 3-Tier Web Application (React Client, Express API, Relational MySQL/JSON persistence)

### The Problem
Traditional colleges and universities rely on manual fee collection counters and decentralized Excel spreadsheets. This leads to long queues, lost paper receipts, calculation errors across partial installments, missed due dates, and days spent generating department revenue audits.

### The Solution
EduFee automates the entire fee collection lifecycle:
1. **Fee Configuration:** Defines tuition, examination, library, and hostel breakdowns with automated total computation.
2. **Dynamic Ledger:** Tracks paid vs. pending balances with real-time status transitions (`PAID`, `PARTIALLY PAID`, `PENDING`, `OVERDUE`).
3. **Receipt Generation:** Issues computer-generated official receipts with unique receipt numbers, transaction IDs, and clean print layout.
4. **Intelligent Reminders:** Automatically identifies approaching due dates, payments due today, and overdue accounts, allowing one-click single and bulk reminders.
5. **Role-Based Access Control:** Strict authorization isolating student records and providing financial analytics for administrators.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 (SPA with functional components & custom hooks)
- **Styling:** Tailwind CSS (utility-first, responsive, print media stylesheets)
- **Icons:** Lucide React
- **Celebration Effects:** Canvas Confetti

### Backend
- **Runtime:** Node.js (v18+)
- **Web Framework:** Express.js 4.x
- **Authentication:** JSON Web Tokens (JWT) + bcryptjs password hashing
- **Architecture:** Modular RESTful API (`controllers`, `routes`, `middleware`)

### Database
- **Database Engine:** MySQL 8.0+ / MariaDB / Relational Persistent Store
- **Dialect:** Standard SQL Schema (`database/schema.sql`)
- **Integrity:** Primary keys, foreign keys with `CASCADE` & `RESTRICT`, indexed lookups

---

## 3. Project Structure

```text
student-fee-payment-system/
│
├── database/
│   └── schema.sql                # Complete MySQL DDL & DML script with sample data
│
├── server/
│   ├── routes/
│   │   ├── authRoutes.ts         # Login, JWT issuing, password management
│   │   ├── departmentRoutes.ts   # Department & degree program CRUD
│   │   ├── studentRoutes.ts      # Student registration, profile updates, directory
│   │   ├── feeStructureRoutes.ts # Fee configuration & auto-calculation
│   │   ├── studentFeeRoutes.ts   # Fee assignment (single & batch) & ledger
│   │   ├── paymentRoutes.ts      # Payment recording, balance validation, receipts
│   │   ├── reminderRoutes.ts     # Automated categorization & reminder dispatch
│   │   ├── reportRoutes.ts       # Statistical aggregations & CSV exports
│   │   └── notificationRoutes.ts # In-app alerts & read status tracking
│   ├── auth.ts                   # JWT sign/verify & RBAC middleware
│   └── db.ts                     # Persistent relational database engine
│
├── src/
│   ├── components/
│   │   ├── Navbar.tsx            # Header, notifications bell, demo switcher
│   │   ├── Sidebar.tsx           # Role-based collapsible navigation
│   │   ├── StatCard.tsx          # Reusable financial KPI card
│   │   ├── StatusBadge.tsx       # Visual badge (PAID, PARTIALLY PAID, etc.)
│   │   ├── ReceiptModal.tsx      # Printable official payment receipt
│   │   ├── NotificationDrawer.tsx# In-app alerts slide-over
│   │   └── ProjectGuideModal.tsx # Interactive presentation & viva guide
│   ├── context/
│   │   └── AuthContext.tsx       # Authentication state, login, logout
│   ├── pages/
│   │   ├── LoginPage.tsx         # Login with 1-click evaluation shortcuts
│   │   ├── DocsAndVivaPage.tsx   # Viva Voce Q&A and project documentation
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── StudentManagement.tsx
│   │   │   ├── DepartmentManagement.tsx
│   │   │   ├── FeeStructureManagement.tsx
│   │   │   ├── StudentFeeManagement.tsx
│   │   │   ├── PaymentManagement.tsx
│   │   │   ├── ReminderManagement.tsx
│   │   │   └── ReportsManagement.tsx
│   │   └── student/
│   │       ├── StudentDashboard.tsx
│   │       ├── StudentFeeDetails.tsx
│   │       ├── StudentReceipts.tsx
│   │       └── StudentProfile.tsx
│   ├── services/
│   │   └── api.ts                # Centralized typed HTTP client with bearer tokens
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── App.tsx                   # Main component & layout router
│   ├── index.css                 # Tailwind directives & print media rules
│   └── main.tsx                  # React entry point
│
├── server.ts                     # Express server & Vite integration
├── package.json                  # Scripts & dependencies
├── tsconfig.json                 # TypeScript compiler configuration
└── README.md                     # Full documentation
```

---

## 4. Demo Login Credentials

For testing and demonstration, pre-configured accounts covering all academic and financial scenarios are available:

| Role | Name | Email / Student ID | Password | Scenario Description |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | System Administrator | `admin@example.com` | `admin123` | Full financial & administrative control |
| **Student** | Aarav Sharma | `aarav.sharma@example.com` (`STU2026001`) | `password123` | **100% Fully Paid** (Balance: ₹0) |
| **Student** | Priya Patel | `priya.patel@example.com` (`STU2026002`) | `password123` | **Partially Paid** (Paid ₹35k, Pending ₹30k) |
| **Student** | Rohan Verma | `rohan.verma@example.com` (`STU2026003`) | `password123` | **Overdue Fee** (Due Sep 15, Pending ₹48k) |
| **Student** | Vikram Singh | `vikram.singh@example.com` (`STU2026005`) | `password123` | **Due Today** (Due today, Pending ₹50k) |
| **Student** | Ananya Iyer | `ananya.iyer@example.com` (`STU2026004`) | `password123` | **Upcoming Due Date** (Due Nov 30, ₹77.5k) |

*Note: You can switch between these accounts with 1-click using the **"Demo Switcher"** in the top navigation bar!*

---

## 5. Step-by-Step Setup Instructions

### Environment Prerequisites
- Windows 10/11 (or macOS / Linux)
- Node.js (v18.0.0 or higher)
- npm (Node Package Manager)
- MySQL 8.0+ or XAMPP (Optional for local MySQL hosting)

### Step 1: Clone or Navigate to Project
Open PowerShell or your terminal:
```powershell
cd student-fee-payment-system
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: (Optional) MySQL Database Setup
If running against a standalone MySQL instance:
1. Open MySQL Command Line or MySQL Workbench.
2. Execute the schema file:
```sql
SOURCE database/schema.sql;
```
3. Update `.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_fee_system
```

*(Note: The application includes an embedded persistent data store seeded with the exact schema data, so it runs immediately out-of-the-box!)*

### Step 4: Run the Application
```powershell
npm run dev
```

### Step 5: Open Browser
Navigate to:
```text
http://localhost:3000
```

---

## 6. REST API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user and returns JWT token |
| `GET` | `/api/auth/me` | Protected | Fetches current authenticated user profile |
| `POST` | `/api/auth/change-password` | Protected | Updates user account password |
| `GET` | `/api/students` | Protected | Lists students with search & department filters |
| `POST` | `/api/students` | Admin | Registers student and auto-creates credentials |
| `PUT` | `/api/students/:id` | Admin | Updates student profile |
| `DELETE` | `/api/students/:id` | Admin | Deletes student and cascades fee records |
| `GET` | `/api/departments` | Public | Lists faculties and course offerings |
| `POST` | `/api/departments` | Admin | Adds new academic department |
| `GET` | `/api/fee-structures` | Protected | Lists fee configurations per course |
| `POST` | `/api/fee-structures` | Admin | Creates fee structure with auto-total |
| `GET` | `/api/student-fees` | Protected | Retrieves fee balances (isolated per student) |
| `POST` | `/api/student-fees/assign` | Admin | Assigns fee structure (single or batch) |
| `GET` | `/api/payments` | Protected | Lists payment history and transactions |
| `POST` | `/api/payments` | Admin | Records payment, updates balance & issues receipt |
| `GET` | `/api/payments/:id` | Protected | Retrieves single printable receipt |
| `GET` | `/api/reminders/candidates`| Admin | Automatically categorizes overdue/upcoming fees |
| `POST` | `/api/reminders/send` | Admin | Dispatches single customized reminder |
| `POST` | `/api/reminders/send-bulk` | Admin | Dispatches batch reminders by category |
| `GET` | `/api/reports/dashboard` | Admin | Computes real-time KPI metrics |
| `GET` | `/api/reports/fees` | Admin | Generates fee overview with CSV export |
| `GET` | `/api/notifications` | Protected | Fetches in-app alerts and unread count |

---

## 7. Viva Voce Preparation Guide (Sample Q&A)

### Q1: What is the core formula used for fee calculation?
**Answer:** `Pending Amount = Total Fee - Paid Amount`. The total fee is the sum of Tuition, Examination, Library, Hostel, and Other fees. When `Pending Amount == 0`, status changes to `PAID`.

### Q2: How does the system handle security and student data isolation?
**Answer:** The system uses JSON Web Tokens (JWT) and role-based access control (RBAC). When a student logs in, queries are restricted to `req.user.student_id`. Students cannot alter URL query parameters to inspect another student's fee ledger.

### Q3: Why is bcrypt hashing essential?
**Answer:** Storing plain-text passwords violates security standards. Bcrypt incorporates a cryptographic salt and computational work factor, protecting user passwords against rainbow tables and brute-force attacks.

### Q4: How is the payment receipt generated and printed?
**Answer:** Upon recording a payment, the server generates a unique sequential receipt number (`REC-YYYY-XXXX`). The React client renders the receipt using `@media print` CSS rules that hide UI elements and format the paper as an official institutional invoice.

---

## 8. Troubleshooting Guide

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **Port 3000 already in use** | An existing Node or process is occupying port 3000 | In PowerShell run: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force` or change port in `.env`. |
| **npm not recognized** | Node.js is not added to system PATH | Reinstall Node.js or add `C:\Program Files\nodejs\` to System PATH environment variables. |
| **CORS error** | Frontend requested unauthorized origin | Express server is unified with Vite middlewares; all requests use relative `/api/*` endpoints. |
| **JWT expired error** | Token exceeded 7-day expiration | Click Logout and log back in, or use the 1-click Demo Switcher. |

---

## 9. Future Enhancements

- Online Payment Gateway Integration (Razorpay / Stripe / UPI QR generation).
- Automated SMS and WhatsApp Business API webhooks.
- Multi-college branch multi-tenancy.
- Parent portal with student fee status alerts.
