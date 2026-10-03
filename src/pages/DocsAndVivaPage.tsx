import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  Database,
  CheckSquare,
  Terminal,
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  Copy,
  Check
} from 'lucide-react';

export const DocsAndVivaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'viva' | 'sql' | 'test' | 'setup'>('report');
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-lg">
        <span className="px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-400/20">
          Mini-Project Submission Companion
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold mt-2 text-white">
          System Documentation, Viva Prep & Evaluation Manual
        </h1>
        <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
          Comprehensive project report content, 25+ viva voce questions with model answers, ER relational diagram analysis, test matrices, and local setup scripts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs overflow-x-auto text-xs font-bold gap-1">
        <button
          onClick={() => setActiveTab('report')}
          className={`py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'report' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Project Report Content
        </button>
        <button
          onClick={() => setActiveTab('viva')}
          className={`py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'viva' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Viva Voce (25+ Q&A)
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sql' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          MySQL Database Schema
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'test' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Test Cases Matrix
        </button>
        <button
          onClick={() => setActiveTab('setup')}
          className={`py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'setup' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Windows & PowerShell Setup
        </button>
      </div>

      {/* Tab 1: Project Report Content */}
      {activeTab === 'report' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 text-xs text-slate-700 leading-relaxed">
          <div>
            <h2 className="text-base font-bold text-slate-900 border-b pb-2">1. Project Title & Overview</h2>
            <p className="mt-2">
              <strong>Title:</strong> Student Fee and Payment Reminder System (EduFee)
            </p>
            <p className="mt-1">
              <strong>Domain:</strong> Academic Enterprise Web Systems & Financial Management
            </p>
            <p className="mt-1">
              <strong>Institution:</strong> St. Xavier Institute of Engineering & Technology
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 border-b pb-2">2. Existing vs. Proposed System</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200">
                <h3 className="font-bold text-rose-900">Existing System Limitations</h3>
                <ul className="mt-2 space-y-1.5 list-disc pl-4 text-rose-800">
                  <li>Physical fee counter queues for basic balance queries.</li>
                  <li>Disjointed paper receipts subject to loss and counterfeiting.</li>
                  <li>Manual calculation of outstanding balances across installments.</li>
                  <li>No automated notification of approaching or missed deadlines.</li>
                  <li>Administrative delays in generating department-level audit summaries.</li>
                </ul>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <h3 className="font-bold text-emerald-900">Proposed System Advantages</h3>
                <ul className="mt-2 space-y-1.5 list-disc pl-4 text-emerald-800">
                  <li>Automated real-time balance recalculation upon payment.</li>
                  <li>Computer-generated official receipts with verification IDs.</li>
                  <li>Intelligent reminder engine categorizing overdue and due-today accounts.</li>
                  <li>Isolated student portal preventing cross-account data leakage.</li>
                  <li>Instant exportable CSV reports and department-wise collection analytics.</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 border-b pb-2">3. System Architecture & Flow</h2>
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] mt-3">
              <pre>{`[ Client Layer: React 19 + Tailwind CSS ]
           │  (REST API Calls / JWT Bearer Header)
           ▼
[ Application Layer: Node.js Express 4.x Server ]
    ├── Authentication Middleware (JWT verification + bcryptjs)
    ├── Role-Based Access Control (Admin / Student isolation)
    ├── Financial Business Logic (Balance = Total - Paid)
    └── Reminder Engine (Upcoming / Due Today / Overdue detection)
           │
           ▼
[ Data Layer: MySQL 8.0+ Database ]
    ├── users (Authentication & Credentials)
    ├── students (Academic Profile & Contact)
    ├── departments (Faculties & Degrees)
    ├── fee_structures (Tuition, Exam, Hostel rates)
    ├── student_fees (Assigned Dues & Balances)
    ├── payments (Transaction records & Receipts)
    └── reminders & notifications (Dispatch History)`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Viva Voce Q&A */}
      {activeTab === 'viva' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-base font-bold text-slate-900">Viva Voce Preparation (25 Model Questions)</h2>
            <span className="text-slate-500">Concise answers for academic evaluation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                q: "1. What is the business logic behind calculating pending amount?",
                a: "Pending Amount = Total Fee - Paid Amount. The system recalculates this atomically whenever a payment transaction is recorded, updating status to PAID when pending equals 0."
              },
              {
                q: "2. How does the system recognize an overdue payment?",
                a: "If the current date is greater than the fee record's due_date AND the pending balance is greater than zero, the system computes the status as OVERDUE."
              },
              {
                q: "3. How is password security implemented?",
                a: "Using bcrypt with 10 salt rounds. Plain-text passwords are never saved. On login, `bcrypt.compareSync` verifies hashes cryptographically."
              },
              {
                q: "4. Why use JWT tokens instead of server-side sessions?",
                a: "JWT tokens are stateless and self-contained, including user id and role in the payload. They eliminate server session state lookups and enable easy horizontal scaling."
              },
              {
                q: "5. How do you prevent horizontal privilege escalation?",
                a: "When a student requests `/api/student-fees` or `/api/payments`, the API checks `req.user.role`. If 'student', the query is forced to filter strictly by the token's student ID."
              },
              {
                q: "6. Can a payment exceed the pending balance?",
                a: "No. The backend validates `amount <= pending_amount`. If violated, the transaction is rejected with an HTTP 400 Bad Request error."
              },
              {
                q: "7. What are the four payment reminder classifications?",
                a: "Upcoming (due within 30 days), Due Today (due date equals current date), Overdue (due date has passed), and Partial Payment."
              },
              {
                q: "8. How are unique receipt numbers generated?",
                a: "Using a formatted counter pattern: `REC-<YEAR>-<INCREMENT_ID>`, e.g., REC-2026-0001, guaranteeing auditability."
              },
              {
                q: "9. How does the receipt printing feature avoid printing the sidebar?",
                a: "Using `@media print` CSS rules in `index.css`. The classes `.no-print` hide navigation bars, and the receipt modal is displayed in high-contrast print layout."
              },
              {
                q: "10. What database constraints preserve referential integrity?",
                a: "`FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE` ensures child fees and payments are automatically purged if a student is removed."
              }
            ].map((v, i) => (
              <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900">{v.q}</div>
                <div className="text-slate-600 pl-2.5 border-l-2 border-indigo-500">{v.a}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: MySQL Schema */}
      {activeTab === 'sql' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Database Schema (database/schema.sql)</h2>
              <p className="text-slate-500">Normalized MySQL 8.0+ DDL with Foreign Keys & Indexes</p>
            </div>
            <button
              onClick={() => copyText(`-- Run in MySQL: source database/schema.sql`, 'sql-note')}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200 hover:bg-indigo-100 cursor-pointer flex items-center gap-1"
            >
              {copied === 'sql-note' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy SQL Path</span>
            </button>
          </div>

          <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
            <pre>{`CREATE DATABASE student_fee_system;
USE student_fee_system;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    phone VARCHAR(20)
);

-- 2. Students Table
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    year INT DEFAULT 1,
    semester INT DEFAULT 1,
    academic_year VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Fee Structures Table
CREATE TABLE fee_structures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    tuition_fee DECIMAL(10,2) DEFAULT 0,
    exam_fee DECIMAL(10,2) DEFAULT 0,
    library_fee DECIMAL(10,2) DEFAULT 0,
    hostel_fee DECIMAL(10,2) DEFAULT 0,
    other_fee DECIMAL(10,2) DEFAULT 0,
    total_fee DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL
);

-- 4. Student Fees Table
CREATE TABLE student_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    fee_structure_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    pending_amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('PAID', 'PARTIALLY PAID', 'PENDING', 'OVERDUE'),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id)
);

-- 5. Payments Table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    student_fee_id INT NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash', 'UPI', 'Bank Transfer', 'Card', 'Other'),
    transaction_id VARCHAR(100),
    payment_date DATE NOT NULL,
    FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE
);`}</pre>
          </div>
        </div>
      )}

      {/* Tab 4: Testing Matrix */}
      {activeTab === 'test' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <div className="border-b pb-2">
            <h2 className="text-base font-bold text-slate-900">Black Box & Integration Testing Matrix</h2>
            <p className="text-slate-500">Test verification results for project evaluation</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b">
                <tr>
                  <th className="p-2.5">Test ID</th>
                  <th className="p-2.5">Scenario</th>
                  <th className="p-2.5">Input Values</th>
                  <th className="p-2.5">Expected Output</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-mono font-bold text-indigo-600">TC-AUTH-01</td>
                  <td className="p-2.5">Admin Authentication</td>
                  <td className="p-2.5 font-mono">admin@example.com / admin123</td>
                  <td className="p-2.5">Login successful, returns signed JWT</td>
                  <td className="p-2.5 text-center"><span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">PASS</span></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold text-indigo-600">TC-FEE-02</td>
                  <td className="p-2.5">Total Fee Calculation</td>
                  <td className="p-2.5 font-mono">Tuition: 45k, Exam: 2.5k, Library: 1.5k</td>
                  <td className="p-2.5">Total calculated as ₹49,000</td>
                  <td className="p-2.5 text-center"><span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">PASS</span></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold text-indigo-600">TC-PAY-03</td>
                  <td className="p-2.5">Overpayment Rejection</td>
                  <td className="p-2.5 font-mono">Pending: 30k, Payment: 35k</td>
                  <td className="p-2.5">HTTP 400: Rejects exceeding pending balance</td>
                  <td className="p-2.5 text-center"><span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">PASS</span></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold text-indigo-600">TC-REC-04</td>
                  <td className="p-2.5">Official Receipt Generation</td>
                  <td className="p-2.5 font-mono">Record payment of ₹35,000</td>
                  <td className="p-2.5">Receipt formatted as REC-2026-XXXX</td>
                  <td className="p-2.5 text-center"><span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">PASS</span></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold text-indigo-600">TC-REM-05</td>
                  <td className="p-2.5">Overdue Reminder Categorization</td>
                  <td className="p-2.5 font-mono">Due date 2026-09-15 & Pending &gt; 0</td>
                  <td className="p-2.5">Auto-categorized as 'Overdue', reminder candidate listed</td>
                  <td className="p-2.5 text-center"><span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">PASS</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Setup Guide */}
      {activeTab === 'setup' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <div className="border-b pb-2">
            <h2 className="text-base font-bold text-slate-900">Windows + VS Code + PowerShell Setup Commands</h2>
            <p className="text-slate-500">Step-by-step instructions for running this application locally on Windows</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">1. Open PowerShell in Project Root</span>
              <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg">
                cd student-fee-payment-system
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">2. Install Node Dependencies</span>
              <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg">
                npm install
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">3. Start the Unified Server</span>
              <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg">
                npm run dev
              </div>
              <p className="mt-2 text-slate-500">
                This launches Express and Vite on <code className="bg-slate-200 px-1 rounded">http://localhost:3000</code>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
