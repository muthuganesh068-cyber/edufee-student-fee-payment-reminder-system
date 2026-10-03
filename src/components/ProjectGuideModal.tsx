import React, { useState } from 'react';
import { BookOpen, HelpCircle, Database, CheckSquare, Terminal, AlertCircle, X, ChevronRight, Download, Copy, Check } from 'lucide-react';

interface ProjectGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectGuideModal: React.FC<ProjectGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'planning' | 'architecture' | 'database' | 'viva' | 'testing' | 'setup'>('planning');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-800/80">
              <BookOpen className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">College Mini-Project Documentation & Viva Guide</h2>
              <p className="text-xs text-indigo-200">Student Fee and Payment Reminder System (Academic Year 2025-2026)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white rounded-lg hover:bg-indigo-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('planning')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'planning' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Phase 1: Project Report
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'architecture' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
            System Design & DFD
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'database' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            ER Diagram & Schema
          </button>
          <button
            onClick={() => setActiveTab('viva')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'viva' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Viva Voce (25+ Q&A)
          </button>
          <button
            onClick={() => setActiveTab('testing')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'testing' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Test Cases Matrix
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'setup' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Windows & MySQL Setup
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* TAB 1: PLANNING & REPORT CONTENT */}
          {activeTab === 'planning' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 border-b pb-2">1. Project Abstract</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  The <strong>Student Fee and Payment Reminder System (EduFee)</strong> is a centralized web-based academic finance management platform designed to automate college tuition collection, installment monitoring, receipt issuance, and intelligent payment reminders. The application eliminates paper receipts, Excel discrepancies, and manual follow-ups by implementing automated balance recalculation, real-time overdue detection, multi-tier installment records, and role-based access control for college administrators and students.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 border-b pb-2">2. Problem Statement</h3>
                <p className="mt-2 text-xs text-slate-600">
                  Most academic institutions handle fee structures across multiple branches using physical registers or disconnected spreadsheets. This results in:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-600">
                  <li><strong>Human Error:</strong> Manual miscalculations of pending balances and installment sums.</li>
                  <li><strong>Delayed Collections:</strong> Lack of automated overdue notifications causing massive fee backlogs.</li>
                  <li><strong>Lack of Transparency:</strong> Students queue at accounts desks merely to check remaining dues or reprint lost paper receipts.</li>
                  <li><strong>Administrative Overhead:</strong> Generating collection summaries by department and semester takes days of manual auditing.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 border-b pb-2">3. Proposed System Objectives & Scope</h3>
                <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800">Primary Objectives</h4>
                    <ul className="mt-2 space-y-1 text-slate-600 list-disc pl-4">
                      <li>Automate course fee structure calculations (Tuition, Exam, Library, Hostel).</li>
                      <li>Dynamically update fee status: <code>PAID</code>, <code>PARTIALLY PAID</code>, <code>PENDING</code>, <code>OVERDUE</code>.</li>
                      <li>Generate authentic printable receipts with transaction IDs and balance tracking.</li>
                      <li>Intelligent payment reminders categorized by upcoming, due today, and overdue.</li>
                    </ul>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800">Target Users & Scope</h4>
                    <ul className="mt-2 space-y-1 text-slate-600 list-disc pl-4">
                      <li><strong>College Finance Admins:</strong> Student CRUD, fee configurations, payment ledger, reminder dispatch, analytic reports.</li>
                      <li><strong>Students:</strong> Dedicated portal to view fee breakdowns, ledger history, upcoming deadlines, and download receipts.</li>
                      <li><strong>Academic Departments:</strong> CSE, IT, ECE, Mechanical, MBA, etc.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 border-b pb-2">4. Hardware & Software Requirements</h3>
                <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <h5 className="font-bold text-slate-800">Software Stack</h5>
                    <ul className="mt-1 space-y-0.5 text-slate-600">
                      <li>• Frontend: React 19, TypeScript, Tailwind CSS, Lucide Icons</li>
                      <li>• Backend: Node.js (v18+), Express.js (REST API)</li>
                      <li>• Database: MySQL 8.0+ / Relational Engine</li>
                      <li>• Auth: JSON Web Tokens (JWT), Bcrypt password hashing</li>
                      <li>• Tooling: Vite, TSX, VS Code, Git</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <h5 className="font-bold text-slate-800">Minimum Hardware Requirements</h5>
                    <ul className="mt-1 space-y-0.5 text-slate-600">
                      <li>• Processor: Dual Core 2.0 GHz or higher</li>
                      <li>• RAM: 4 GB minimum (8 GB recommended)</li>
                      <li>• Storage: 500 MB free hard disk space</li>
                      <li>• Display: 1366x768 resolution minimum</li>
                      <li>• OS: Windows 10/11, macOS, or Linux</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE & DFD */}
          {activeTab === 'architecture' && (
            <div className="space-y-6 text-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 border-b pb-2">Three-Tier Architecture</h3>
                <p className="mt-2 text-slate-600">
                  The system follows the standard enterprise 3-tier architectural design pattern:
                </p>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div className="font-bold text-indigo-900">Presentation Layer</div>
                    <div className="text-indigo-700 font-semibold mt-1">Client (React SPA)</div>
                    <p className="mt-1 text-slate-600">
                      Responsive user interface built with React hooks, context-driven auth, Tailwind CSS design system, and printable DOM receipt renderer.
                    </p>
                  </div>
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="font-bold text-blue-900">Application / Logic Layer</div>
                    <div className="text-blue-700 font-semibold mt-1">Node.js + Express API</div>
                    <p className="mt-1 text-slate-600">
                      RESTful routing, JWT bearer token verification, role-based authorization middleware, input sanitization, fee balance computation, and reminder dispatch logic.
                    </p>
                  </div>
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="font-bold text-emerald-900">Data Storage Layer</div>
                    <div className="text-emerald-700 font-semibold mt-1">MySQL Database</div>
                    <p className="mt-1 text-slate-600">
                      Normalized relational tables with foreign keys, ON DELETE CASCADE/RESTRICT constraints, transactional payment recording, and index optimization.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 border-b pb-2">Data Flow Diagram (Level 0 & Level 1)</h3>
                <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed">
                  <pre>{`[Admin / Student]
      │
      ├── (1) POST /api/auth/login ─────────────► [Auth Middleware (JWT/Bcrypt)]
      │                                                     │
      ├── (2) Admin CRUD (Students/Fees) ───► [Controllers] ┼──► [MySQL Database]
      │                                                     │    (users, students,
      ├── (3) Record Payment (Amount > 0) ──► [Txn Worker]  │     fee_structures,
      │         • Updates paid_amount                       │     student_fees,
      │         • Computes pending_amount                   │     payments,
      │         • Sets Status (PAID/OVERDUE)                │     reminders)
      │                                                     │
      └── (4) Automated Reminder Dispatch ──► [Scheduler] ──┘
                • Queries Overdue / Due Today
                • Pushes In-App Alerts & Logs Dispatch`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATABASE SCHEMA & ER */}
          {activeTab === 'database' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-base font-bold text-slate-900">Relational Database Tables (MySQL)</h3>
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                  Database: student_fee_system
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-indigo-700 font-mono">1. users</div>
                  <div className="text-slate-500 text-[11px]">Authentication & Role-Based Access</div>
                  <div className="mt-2 text-slate-700 space-y-1 font-mono text-[11px]">
                    <div>• id INT AUTO_INCREMENT (PK)</div>
                    <div>• name VARCHAR(100) NOT NULL</div>
                    <div>• email VARCHAR(120) UNIQUE NOT NULL</div>
                    <div>• password VARCHAR(255) (bcrypt hash)</div>
                    <div>• role ENUM('admin', 'student')</div>
                    <div>• phone VARCHAR(20)</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-indigo-700 font-mono">2. students</div>
                  <div className="text-slate-500 text-[11px]">College Student Profiles</div>
                  <div className="mt-2 text-slate-700 space-y-1 font-mono text-[11px]">
                    <div>• id INT AUTO_INCREMENT (PK)</div>
                    <div>• student_id VARCHAR(50) UNIQUE (Reg No)</div>
                    <div>• user_id INT (FK → users.id)</div>
                    <div>• name, email, phone, department, course</div>
                    <div>• year INT, semester INT, academic_year</div>
                    <div>• status ENUM('active', 'inactive', 'graduated')</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-indigo-700 font-mono">3. fee_structures</div>
                  <div className="text-slate-500 text-[11px]">Course Fee Breakdown Configuration</div>
                  <div className="mt-2 text-slate-700 space-y-1 font-mono text-[11px]">
                    <div>• id INT AUTO_INCREMENT (PK)</div>
                    <div>• department, course, year, semester</div>
                    <div>• tuition_fee, exam_fee, library_fee</div>
                    <div>• hostel_fee, other_fee</div>
                    <div>• total_fee DECIMAL(10,2) [Calculated]</div>
                    <div>• due_date DATE NOT NULL</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-indigo-700 font-mono">4. student_fees</div>
                  <div className="text-slate-500 text-[11px]">Assigned Fee & Live Balances</div>
                  <div className="mt-2 text-slate-700 space-y-1 font-mono text-[11px]">
                    <div>• id INT AUTO_INCREMENT (PK)</div>
                    <div>• student_id (FK → students.student_id)</div>
                    <div>• fee_structure_id (FK → fee_structures.id)</div>
                    <div>• total_amount, paid_amount, pending_amount</div>
                    <div>• status ENUM('PAID', 'PARTIALLY PAID', 'PENDING', 'OVERDUE')</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-indigo-700 font-mono">5. payments</div>
                  <div className="text-slate-500 text-[11px]">Payment Transaction Ledger</div>
                  <div className="mt-2 text-slate-700 space-y-1 font-mono text-[11px]">
                    <div>• id INT AUTO_INCREMENT (PK)</div>
                    <div>• receipt_no VARCHAR(50) UNIQUE (e.g. REC-2026-0001)</div>
                    <div>• student_fee_id (FK → student_fees.id)</div>
                    <div>• student_id (FK → students.student_id)</div>
                    <div>• amount, payment_method, transaction_id, date</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-indigo-700 font-mono">6. reminders & notifications</div>
                  <div className="text-slate-500 text-[11px]">Alerts & Dispatched Follow-ups</div>
                  <div className="mt-2 text-slate-700 space-y-1 font-mono text-[11px]">
                    <div>• id INT AUTO_INCREMENT (PK)</div>
                    <div>• student_id, student_fee_id</div>
                    <div>• reminder_type ('Upcoming', 'Due Today', 'Overdue')</div>
                    <div>• channel ('In-App', 'Email', 'SMS')</div>
                    <div>• message, pending_amount, sent_date, status</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VIVA VOCE QUESTIONS & ANSWERS */}
          {activeTab === 'viva' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-base font-bold text-slate-900">College Mini-Project Viva Voce Questions & Answers</h3>
                <span className="text-slate-500">25 Essential Questions with Concise Model Answers</span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    q: "Q1. What is the objective of the Student Fee and Payment Reminder System?",
                    a: "To automate student fee assignment, record installment payments, dynamically calculate outstanding balances, provide instant payment receipts, and issue timely reminders for upcoming or overdue fees."
                  },
                  {
                    q: "Q2. Which technology stack is used and why?",
                    a: "React for a fast, responsive user interface; Node.js and Express for modular REST APIs; MySQL for ACID-compliant relational data integrity; and JWT with bcrypt for secure, stateless role-based authentication."
                  },
                  {
                    q: "Q3. How is the fee status computed dynamically?",
                    a: "If paid >= total, status is 'PAID'. If due_date < current date and pending > 0, status is 'OVERDUE'. If paid > 0 and pending > 0, status is 'PARTIALLY PAID'. Otherwise, status remains 'PENDING'."
                  },
                  {
                    q: "Q4. How do you prevent a user from paying more than their pending balance?",
                    a: "The payment controller validates `amount <= student_fee.pending_amount`. If the user submits an amount higher than pending, the API rejects the request with HTTP 400 and an error message."
                  },
                  {
                    q: "Q5. How is student data privacy maintained?",
                    a: "Through role-based access control (RBAC). The backend validates JWT payload. If `role === 'student'`, queries strictly filter records by `req.user.student_id` or `req.user.id`, preventing horizontal privilege escalation."
                  },
                  {
                    q: "Q6. Why did you choose bcrypt instead of storing plain-text passwords?",
                    a: "Plain-text passwords expose user credentials if the database is leaked. Bcrypt uses a cryptographic adaptive hash function with salt rounds, protecting against dictionary and rainbow-table attacks."
                  },
                  {
                    q: "Q7. What is JWT and how does it work here?",
                    a: "JSON Web Token is an open standard (RFC 7519) for compact, self-contained claims. Upon successful login, the server signs a token containing the user id, email, and role. The client sends this token in the `Authorization: Bearer <token>` header for protected endpoints."
                  },
                  {
                    q: "Q8. Explain the database normalization level of your schema.",
                    a: "The schema is normalized to 3rd Normal Form (3NF). Non-key attributes depend solely on primary keys (e.g. fees are linked via foreign keys rather than storing redundant student name and branch on every payment row)."
                  },
                  {
                    q: "Q9. What happens when a student makes a partial payment?",
                    a: "The payment is logged in the `payments` table with a unique receipt number, the `paid_amount` in `student_fees` is incremented, `pending_amount` is recalculated as `total_amount - paid_amount`, and status changes to 'PARTIALLY PAID'."
                  },
                  {
                    q: "Q10. What are the four payment reminder categories?",
                    a: "1) Upcoming (due within 30 days), 2) Due Today (due date equals current date), 3) Overdue (due date has passed), and 4) Partial Payment (student has cleared part of the fee but has remaining dues)."
                  },
                  {
                    q: "Q11. How is a unique receipt number generated?",
                    a: "Receipt numbers use a formatted sequence `REC-<YEAR>-<INCREMENT_ID>`, e.g., REC-2026-0001, guaranteeing uniqueness, auditability, and academic compliance."
                  },
                  {
                    q: "Q12. What validations are performed on student registration?",
                    a: "Validations include required field verification, email regex validation, phone length check, and ensuring uniqueness of both `student_id` (Roll No) and email address before committing to the database."
                  },
                  {
                    q: "Q13. How does the frontend handle responsive layouts across mobile and desktop?",
                    a: "Using Tailwind CSS responsive utility classes (e.g. `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`, collapsible sidebar navigation, and flexible flexbox containers)."
                  },
                  {
                    q: "Q14. How does the receipt print feature work?",
                    a: "We use `@media print` CSS rules in `index.css`. Classes marked `.no-print` (like navbars, sidebars, buttons) are hidden, and the receipt modal is rendered cleanly as an official 8.5x11 printable document."
                  },
                  {
                    q: "Q15. Can the admin assign a fee structure to multiple students at once?",
                    a: "Yes, the Student Fee Assignment module supports both single-student assignment and bulk department-level assignment (e.g., assigning 3rd Year CSE fee structure to all enrolled CSE students)."
                  },
                  {
                    q: "Q16. What HTTP status codes are used in your REST API?",
                    a: "200 OK (successful query), 201 Created (student/fee/payment registered), 400 Bad Request (validation failure), 401 Unauthorized (missing token), 403 Forbidden (role permission error), 404 Not Found, and 500 Internal Server Error."
                  },
                  {
                    q: "Q17. What is CORS and why is it important?",
                    a: "Cross-Origin Resource Sharing is a browser security mechanism that restricts resources requested from another domain. Express configured with proper CORS headers allows our React frontend to communicate securely with the backend API."
                  },
                  {
                    q: "Q18. How are in-app notifications generated?",
                    a: "Whenever a payment is recorded or an admin sends a reminder, a notification row is written to the `notifications` table for the target student's `user_id`. The client fetches unread counts and marks them read on click."
                  },
                  {
                    q: "Q19. How do you prevent SQL Injection?",
                    a: "By using parameterized prepared statements in SQL queries, ORM/query builder abstractions, and strict input validation before passing parameters to the database engine."
                  },
                  {
                    q: "Q20. What reports can the admin export?",
                    a: "1) Complete Student Fee Ledger, 2) Payment Transactions Log, 3) Outstanding Pending Fees Report, 4) Overdue Accounts Defaulters List, and 5) Department & Monthly Collection Analytics with CSV export."
                  },
                  {
                    q: "Q21. What happens if a student is deleted?",
                    a: "Foreign key constraints with `ON DELETE CASCADE` ensure that dependent student fees, payments, and reminders are cleanly purged to prevent orphaned records in the database."
                  },
                  {
                    q: "Q22. How would you integrate real SMS in production?",
                    a: "By integrating an SMS Gateway API like Twilio or Fast2SMS in `server/services/smsService.ts`, passing the student's phone number and the reminder text via HTTPS POST."
                  },
                  {
                    q: "Q23. How does the dashboard stay synchronized with payment updates?",
                    a: "The dashboard metrics are computed dynamically on the server by aggregating `student_fees` and `payments`. Any newly recorded payment immediately reflects in total collected and pending stats."
                  },
                  {
                    q: "Q24. What are the key advantages of this system over traditional methods?",
                    a: "Immediate reconciliation, 100% elimination of calculation mistakes, automatic receipt generation, real-time overdue tracking, and accessible student self-service portals."
                  },
                  {
                    q: "Q25. What future enhancements can be added to this project?",
                    a: "Integration with payment gateways like Razorpay/Stripe for direct online UPI/NetBanking payments, automated WhatsApp notification APIs, parent portal logins, and biometric fee clearance synchronization."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-900">{item.q}</div>
                    <div className="mt-1 text-slate-600 pl-3 border-l-2 border-indigo-500">{item.a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TESTING PLAN & TEST CASES */}
          {activeTab === 'testing' && (
            <div className="space-y-4 text-xs">
              <div className="border-b pb-2">
                <h3 className="text-base font-bold text-slate-900">System Testing Plan & Test Cases Matrix</h3>
                <p className="text-slate-500">Comprehensive verification of authentication, fee calculations, validations, and security.</p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">TC ID</th>
                      <th className="p-2.5">Module</th>
                      <th className="p-2.5">Scenario</th>
                      <th className="p-2.5">Input Data</th>
                      <th className="p-2.5">Expected Result</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-indigo-600">TC-01</td>
                      <td className="p-2.5">Auth</td>
                      <td className="p-2.5">Valid Admin Login</td>
                      <td className="p-2.5 font-mono">admin@example.com / admin123</td>
                      <td className="p-2.5">JWT token issued, redirect to Admin Dashboard</td>
                      <td className="p-2.5"><span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">PASS</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-indigo-600">TC-02</td>
                      <td className="p-2.5">Auth</td>
                      <td className="p-2.5">Invalid Password Login</td>
                      <td className="p-2.5 font-mono">admin@example.com / wrongpass</td>
                      <td className="p-2.5">HTTP 401: "Incorrect password"</td>
                      <td className="p-2.5"><span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">PASS</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-indigo-600">TC-03</td>
                      <td className="p-2.5">Student</td>
                      <td className="p-2.5">Duplicate Student ID</td>
                      <td className="p-2.5 font-mono">student_id: 'STU2026001'</td>
                      <td className="p-2.5">HTTP 400: "Student ID is already registered"</td>
                      <td className="p-2.5"><span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">PASS</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-indigo-600">TC-04</td>
                      <td className="p-2.5">Fee Structure</td>
                      <td className="p-2.5">Calculate Total Fee</td>
                      <td className="p-2.5 font-mono">Tuition 40k + Exam 3k + Library 1.5k</td>
                      <td className="p-2.5">Total auto-calculated as ₹44,500</td>
                      <td className="p-2.5"><span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">PASS</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-indigo-600">TC-05</td>
                      <td className="p-2.5">Payments</td>
                      <td className="p-2.5">Excess Payment Validation</td>
                      <td className="p-2.5 font-mono">Pending: 30k, Amount: 35k</td>
                      <td className="p-2.5">HTTP 400: "Cannot exceed pending balance"</td>
                      <td className="p-2.5"><span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">PASS</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-indigo-600">TC-06</td>
                      <td className="p-2.5">Payments</td>
                      <td className="p-2.5">Partial Payment Balance</td>
                      <td className="p-2.5 font-mono">Total: 65k, Paid: 35k</td>
                      <td className="p-2.5">Pending = 30k, Status = "PARTIALLY PAID"</td>
                      <td className="p-2.5"><span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">PASS</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-indigo-600">TC-07</td>
                      <td className="p-2.5">Payments</td>
                      <td className="p-2.5">Full Clearance Balance</td>
                      <td className="p-2.5 font-mono">Pay remaining 30k balance</td>
                      <td className="p-2.5">Pending = 0, Status updates to "PAID"</td>
                      <td className="p-2.5"><span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">PASS</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-indigo-600">TC-08</td>
                      <td className="p-2.5">Reminders</td>
                      <td className="p-2.5">Overdue Detection</td>
                      <td className="p-2.5 font-mono">due_date: '2026-09-15' (Past)</td>
                      <td className="p-2.5">Tagged as 'Overdue', reminder candidate listed</td>
                      <td className="p-2.5"><span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">PASS</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-indigo-600">TC-09</td>
                      <td className="p-2.5">Security</td>
                      <td className="p-2.5">Student Access Isolation</td>
                      <td className="p-2.5 font-mono">Student token querying another student</td>
                      <td className="p-2.5">HTTP 403 Forbidden: Blocked unauthorized data</td>
                      <td className="p-2.5"><span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">PASS</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-indigo-600">TC-10</td>
                      <td className="p-2.5">Receipt</td>
                      <td className="p-2.5">Print Receipt Layout</td>
                      <td className="p-2.5 font-mono">Click Print Receipt</td>
                      <td className="p-2.5">Print CSS triggers clean institutional receipt</td>
                      <td className="p-2.5"><span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">PASS</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SETUP & TROUBLESHOOTING */}
          {activeTab === 'setup' && (
            <div className="space-y-4 text-xs">
              <div className="border-b pb-2">
                <h3 className="text-base font-bold text-slate-900">Step-by-Step Windows + PowerShell Setup Guide</h3>
                <p className="text-slate-500">Instructions for running locally on a college lab machine or personal laptop.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-800">Step 1: Prerequisites</div>
                  <p className="mt-1 text-slate-600">
                    Ensure <strong>Node.js (v18+)</strong> and <strong>MySQL (or XAMPP)</strong> are installed.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-800">Step 2: MySQL Database Setup</div>
                  <p className="mt-1 text-slate-600">
                    Open MySQL Workbench, phpMyAdmin, or MySQL Command Line and run the provided SQL file:
                  </p>
                  <div className="mt-2 p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg">
                    mysql -u root -p &lt; database/schema.sql
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-800">Step 3: Install Dependencies & Run in PowerShell</div>
                  <p className="mt-1 text-slate-600">In PowerShell inside the project directory:</p>
                  <div className="mt-2 p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg space-y-1">
                    <div># 1. Install packages</div>
                    <div>npm install</div>
                    <div className="pt-1"># 2. Start full-stack development server</div>
                    <div>npm run dev</div>
                  </div>
                  <p className="mt-2 text-slate-500">
                    Open your browser at <code className="bg-slate-200 px-1 rounded">http://localhost:3000</code>.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Troubleshooting Quick Fixes
                  </div>
                  <ul className="mt-2 space-y-1.5 text-amber-800 list-disc pl-4">
                    <li><strong>Port 3000 already in use:</strong> In PowerShell run: <code>Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force</code> or set <code>PORT=3001</code> in <code>.env</code>.</li>
                    <li><strong>npm not recognized:</strong> Add <code>C:\Program Files\nodejs\</code> to your Windows System Environment PATH variable and restart PowerShell.</li>
                    <li><strong>Access denied for MySQL root:</strong> Verify credentials in <code>.env</code> match your local root password.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>Department of Computer Science & Engineering | Mini-Project Submission</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
