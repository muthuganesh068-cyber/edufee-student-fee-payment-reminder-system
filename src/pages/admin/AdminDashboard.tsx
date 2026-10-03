import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Building2,
  Receipt,
  BellRing,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../../services/api';
import { DashboardStats } from '../../types';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { ReceiptModal } from '../../components/ReceiptModal';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenRecordPayment?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab, onOpenRecordPayment }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleViewReceipt = async (paymentId: number) => {
    try {
      const res = await api.getReceipt(paymentId);
      if (res.success) {
        setSelectedReceipt(res.receipt);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to load receipt');
    }
  };

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-28 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const collectionPercentage = stats.totalFeeAmount > 0
    ? Math.round((stats.totalCollected / stats.totalFeeAmount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 rounded-3xl text-white shadow-lg">
        <div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider border border-indigo-400/20">
            College Finance Overview
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-2 text-white">
            Finance & Fee Collection Dashboard
          </h1>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            Real-time tracking of institutional fee assignments, student installment payments, overdue accounts, and automated notifications.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onOpenRecordPayment && (
            <button
              onClick={onOpenRecordPayment}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white text-indigo-950 rounded-xl hover:bg-indigo-50 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Record Payment</span>
            </button>
          )}
          <button
            onClick={() => onNavigateTab('admin-reminders')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl border border-indigo-400/30 transition-all cursor-pointer"
          >
            <BellRing className="w-4 h-4" />
            <span>Send Reminders</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Enrolled active students"
          icon={Users}
          color="indigo"
        />

        <StatCard
          title="Total Fee Amount"
          value={`₹${stats.totalFeeAmount.toLocaleString()}`}
          subtitle="Total assigned semester fees"
          icon={FileSpreadsheet}
          color="blue"
        />

        <StatCard
          title="Total Collected"
          value={`₹${stats.totalCollected.toLocaleString()}`}
          subtitle={`${collectionPercentage}% of total fee collection`}
          icon={CheckCircle2}
          color="emerald"
          trend={{ value: `${collectionPercentage}% cleared`, positive: true }}
        />

        <StatCard
          title="Total Pending"
          value={`₹${stats.totalPending.toLocaleString()}`}
          subtitle="Pending uncollected balance"
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Overdue Fees"
          value={`₹${stats.overdueFees.toLocaleString()}`}
          subtitle={`${stats.statusCounts.OVERDUE} student account(s) overdue`}
          icon={AlertTriangle}
          color="rose"
        />

        <StatCard
          title="Payments This Month"
          value={`₹${stats.paymentsThisMonth.toLocaleString()}`}
          subtitle="Collected in current calendar month"
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Progress & Status Ratio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Collection Status Ratio</h3>
            <p className="text-xs text-slate-500 mt-0.5">Overall student accounts fee completion</p>

            <div className="mt-4">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700">Fee Clearance Rate</span>
                <span className="text-indigo-600">{collectionPercentage}%</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${collectionPercentage}%` }}
                ></div>
                <div
                  className="bg-amber-400 h-full transition-all duration-500"
                  style={{ width: `${100 - collectionPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="font-semibold text-emerald-900">Fully Paid</span>
                </div>
                <span className="font-bold text-emerald-800">{stats.statusCounts.PAID} Students</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="font-semibold text-amber-900">Partially Paid</span>
                </div>
                <span className="font-bold text-amber-800">{stats.statusCounts.PARTIALLY_PAID} Students</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                  <span className="font-semibold text-indigo-900">Pending (No Payment)</span>
                </div>
                <span className="font-bold text-indigo-800">{stats.statusCounts.PENDING} Students</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <span className="font-semibold text-rose-900">Overdue (Past Deadline)</span>
                </div>
                <span className="font-bold text-rose-800">{stats.statusCounts.OVERDUE} Students</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('admin-student-fees')}
              className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Full Fee Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Department Collection Breakdown */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Department-wise Collection</h3>
                <p className="text-xs text-slate-500 mt-0.5">Assigned vs collected revenue across academic branches</p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                {stats.departmentStats.length} Departments
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {stats.departmentStats.map((dept, idx) => {
                const pct = dept.total > 0 ? Math.round((dept.collected / dept.total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{dept.department}</span>
                      <div className="text-slate-500 text-[11px] font-mono">
                        ₹{dept.collected.toLocaleString()} / ₹{dept.total.toLocaleString()} ({pct}%)
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Auto-calculated from live student fees</span>
            <button
              onClick={() => onNavigateTab('admin-reports')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Export Department Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Payment Transactions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest recorded student payments and receipts</p>
          </div>
          <button
            onClick={() => onNavigateTab('admin-payments')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Payments</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Method & Txn</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                stats.recentPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {pay.receipt_no}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{pay.student_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{pay.student_id}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{pay.department}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{pay.payment_method}</span>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-[130px]">
                        {pay.transaction_id || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{pay.payment_date}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{pay.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleViewReceipt(pay.id)}
                        className="p-1.5 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                        title="View Official Receipt"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Receipt Viewer Modal */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
