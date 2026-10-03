import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  FileSpreadsheet,
  Calendar,
  AlertTriangle,
  CreditCard,
  Building2,
  Printer
} from 'lucide-react';
import { api } from '../../services/api';
import { Department } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export const ReportsManagement: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'fees' | 'pending' | 'overdue' | 'payments' | 'collection'>('fees');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Report Data States
  const [feeReportData, setFeeReportData] = useState<any[]>([]);
  const [feeSummary, setFeeSummary] = useState<any>(null);
  const [pendingReportData, setPendingReportData] = useState<any[]>([]);
  const [overdueReportData, setOverdueReportData] = useState<any[]>([]);
  const [paymentsData, setPaymentsData] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [deptRes, feeRes, pendRes, overRes, payRes, dashRes] = await Promise.all([
        api.getDepartments(),
        api.getFeeReport(selectedDept, selectedStatus),
        api.getPendingReport(),
        api.getOverdueReport(),
        api.getPayments({ department: selectedDept }),
        api.getDashboardStats()
      ]);

      if (deptRes.success) setDepartments(deptRes.departments);
      if (feeRes.success) {
        setFeeReportData(feeRes.data);
        setFeeSummary(feeRes.summary);
      }
      if (pendRes.success) setPendingReportData(pendRes.data);
      if (overRes.success) setOverdueReportData(overRes.data);
      if (payRes.success) setPaymentsData(payRes.payments);
      if (dashRes.success) setStatsData(dashRes.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedDept, selectedStatus]);

  // Export to CSV helper
  const exportToCSV = (filename: string, rows: any[]) => {
    if (!rows || !rows.length) {
      alert('No data to export');
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map(row =>
          keys
            .map(k => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
              return cell;
            })
            .join(separator)
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Academic Financial Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit collection ledgers, export spreadsheet summaries, and analyze department revenue metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => {
              if (activeReport === 'fees') exportToCSV('student_fee_report', feeReportData);
              else if (activeReport === 'pending') exportToCSV('pending_fees_report', pendingReportData);
              else if (activeReport === 'overdue') exportToCSV('overdue_accounts_report', overdueReportData);
              else if (activeReport === 'payments') exportToCSV('payment_transactions_log', paymentsData);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveReport('fees')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeReport === 'fees'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Student Fee Overview</span>
        </button>

        <button
          onClick={() => setActiveReport('pending')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeReport === 'pending'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Pending Fees Report</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {pendingReportData.length}
          </span>
        </button>

        <button
          onClick={() => setActiveReport('overdue')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeReport === 'overdue'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Overdue Defaulters</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-200/50">
            {overdueReportData.length}
          </span>
        </button>

        <button
          onClick={() => setActiveReport('payments')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeReport === 'payments'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payment Transactions Log</span>
        </button>

        <button
          onClick={() => setActiveReport('collection')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeReport === 'collection'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Collection Analytics</span>
        </button>
      </div>

      {/* Filters (for fees and payments) */}
      {(activeReport === 'fees' || activeReport === 'payments') && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            Report Filters:
          </span>

          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">All Academic Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.department_name}>{d.department_code} - {d.department_name}</option>
            ))}
          </select>

          {activeReport === 'fees' && (
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="ALL">All Fee Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PARTIALLY PAID">PARTIALLY PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
          )}

          {feeSummary && activeReport === 'fees' && (
            <div className="ml-auto flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-600">Total: <strong>₹{feeSummary.sumTotal?.toLocaleString()}</strong></span>
              <span className="text-emerald-600">Collected: <strong>₹{feeSummary.sumPaid?.toLocaleString()}</strong></span>
              <span className="text-amber-600">Pending: <strong>₹{feeSummary.sumPending?.toLocaleString()}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Report 1: Student Fee Overview */}
      {activeReport === 'fees' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department & Course</th>
                  <th className="py-3 px-4 text-right">Total Fee</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Pending</th>
                  <th className="py-3 px-4">Earliest Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feeReportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{row.student_id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{row.department}</div>
                      <div className="text-[11px] text-slate-500">{row.course}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">₹{row.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 font-bold">₹{row.paidAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-amber-600 font-bold">₹{row.pendingAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-700">{row.earliestDue}</td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: Pending Fees Report */}
      {activeReport === 'pending' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student ID / Name</th>
                  <th className="py-3 px-4">Department & Course</th>
                  <th className="py-3 px-4 text-right">Total Fee</th>
                  <th className="py-3 px-4 text-right">Paid Amount</th>
                  <th className="py-3 px-4 text-right">Pending Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingReportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{row.studentName}</div>
                      <span className="font-mono text-[11px] text-slate-500">{row.student_id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{row.department}</div>
                      <div className="text-[11px] text-slate-500">{row.course}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">₹{row.total_amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 font-bold">₹{row.paid_amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-amber-600 font-bold text-sm">
                      ₹{row.pending_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{row.due_date}</td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3: Overdue Accounts Defaulters List */}
      {activeReport === 'overdue' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-rose-50/70 border-b border-rose-200 text-xs text-rose-800 flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Critical Overdue Accounts ({overdueReportData.length} Students)
            </span>
            <span className="font-mono font-bold text-sm">
              Total Overdue: ₹{overdueReportData.reduce((s, r) => s + r.pending_amount, 0).toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student ID / Name</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-right">Overdue Dues</th>
                  <th className="py-3 px-4">Original Due Date</th>
                  <th className="py-3 px-4 text-center">Days Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueReportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{row.studentName}</div>
                      <span className="font-mono text-[11px] text-slate-500">{row.student_id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>{row.email}</div>
                      <div className="text-[11px] text-slate-500">{row.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{row.department}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 text-sm">
                      ₹{row.pending_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{row.due_date}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        {row.daysOverdue} Days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 4: Payment Transactions Log */}
      {activeReport === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt No</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentsData.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{p.receipt_no}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{p.studentName}</div>
                      <span className="font-mono text-[11px] text-slate-500">{p.student_id}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{p.department}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{p.payment_method}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{p.transaction_id || 'Cash'}</td>
                    <td className="py-3 px-4 text-slate-700">{p.payment_date}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      ₹{p.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 5: Collection Analytics */}
      {activeReport === 'collection' && statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm">Department Revenue Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Assigned vs collected fee revenue per faculty</p>

            <div className="mt-4 space-y-4">
              {statsData.departmentStats.map((dept: any, idx: number) => {
                const pct = dept.total > 0 ? Math.round((dept.collected / dept.total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{dept.department}</span>
                      <span className="font-mono text-indigo-600">{pct}% Collected</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>Paid: ₹{dept.collected.toLocaleString()}</span>
                      <span>Target: ₹{dept.total.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="bg-indigo-600 h-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm">Monthly Collection Trend</h3>
            <p className="text-xs text-slate-500 mt-0.5">Cash flow trend over recent billing periods</p>

            <div className="mt-6 space-y-3">
              {statsData.monthlyStats.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-800">{item.month}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ₹{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
