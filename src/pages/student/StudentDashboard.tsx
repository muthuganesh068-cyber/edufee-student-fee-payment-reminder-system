import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Receipt,
  Download,
  BellRing,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StudentFee, Payment, Reminder } from '../../types';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { ReceiptModal } from '../../components/ReceiptModal';

interface StudentDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Pay Modal Simulation
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<'UPI' | 'Card' | 'Bank Transfer'>('UPI');
  const [paySubmitting, setPaySubmitting] = useState(false);

  // Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [feeRes, payRes, remRes] = await Promise.all([
        api.getStudentFees(),
        api.getPayments(),
        api.getReminders()
      ]);

      if (feeRes.success) setFees(feeRes.studentFees);
      if (payRes.success) setPayments(payRes.payments);
      if (remRes.success) setReminders(remRes.reminders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const totalFee = fees.reduce((sum, f) => sum + f.total_amount, 0);
  const paidFee = fees.reduce((sum, f) => sum + f.paid_amount, 0);
  const pendingFee = fees.reduce((sum, f) => sum + f.pending_amount, 0);

  const primaryFee = fees[0];
  const overallStatus = primaryFee ? primaryFee.status : 'PENDING';
  const dueDate = primaryFee?.due_date || 'N/A';

  const clearedPercentage = totalFee > 0 ? Math.round((paidFee / totalFee) * 100) : 0;

  const handleOpenPay = () => {
    if (primaryFee && primaryFee.pending_amount > 0) {
      setPayAmount(primaryFee.pending_amount);
      setShowPayModal(true);
    } else {
      alert('You have no pending fees to pay!');
    }
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryFee || !payAmount) return;

    try {
      setPaySubmitting(true);
      const res = await api.recordPayment({
        student_fee_id: primaryFee.id,
        amount: Number(payAmount),
        payment_method: payMethod,
        transaction_id: `${payMethod}/ONLINE/${Date.now().toString().slice(-7)}`,
        payment_date: new Date().toISOString().split('T')[0],
        remarks: 'Student Online Portal Payment'
      });

      setShowPayModal(false);
      // Load receipt
      const receiptRes = await api.getReceipt(res.payment.id);
      if (receiptRes.success) {
        setActiveReceipt(receiptRes.receipt);
        setCelebrate(true);
      }
      fetchStudentData();
    } catch (err: any) {
      alert(err.message || 'Payment simulation failed');
    } finally {
      setPaySubmitting(false);
    }
  };

  const handleViewReceipt = async (payId: number) => {
    try {
      const res = await api.getReceipt(payId);
      if (res.success) {
        setActiveReceipt(res.receipt);
        setCelebrate(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to load receipt');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading your fee portal...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider border border-indigo-400/20">
            Student Financial Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-2 text-white">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs text-indigo-200 mt-1">
            Roll No: <span className="font-mono font-bold text-white">{user?.student_id}</span> • {user?.department || 'Department'} ({user?.course || 'Degree Program'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pendingFee > 0 ? (
            <button
              onClick={handleOpenPay}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Pay Outstanding Fee</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All Dues Cleared</span>
            </div>
          )}
        </div>
      </div>

      {/* Critical Overdue / Due Today Alerts */}
      {overallStatus === 'OVERDUE' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-sm block">Fee Payment is Overdue!</span>
            <p className="mt-0.5 leading-relaxed">
              Your semester fee deadline was <strong>{dueDate}</strong>. Outstanding balance: <strong>₹{pendingFee.toLocaleString()}</strong>.
              Please complete payment immediately to avoid examination hall ticket restrictions.
            </p>
          </div>
          <button
            onClick={handleOpenPay}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 cursor-pointer shadow-xs shrink-0"
          >
            Pay Now
          </button>
        </div>
      )}

      {overallStatus === 'PARTIALLY PAID' && dueDate === new Date().toISOString().split('T')[0] && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-start gap-3 text-purple-800 text-xs">
          <Clock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-sm block">Payment Due Today</span>
            <p className="mt-0.5 leading-relaxed">
              Today is the deadline for your remaining fee balance of <strong>₹{pendingFee.toLocaleString()}</strong>.
            </p>
          </div>
          <button
            onClick={handleOpenPay}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 cursor-pointer shadow-xs shrink-0"
          >
            Clear Balance
          </button>
        </div>
      )}

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assigned Fee"
          value={`₹${totalFee.toLocaleString()}`}
          subtitle="Current semester tuition & dues"
          icon={CreditCard}
          color="indigo"
        />

        <StatCard
          title="Total Amount Paid"
          value={`₹${paidFee.toLocaleString()}`}
          subtitle={`${clearedPercentage}% of total cleared`}
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Pending Amount"
          value={`₹${pendingFee.toLocaleString()}`}
          subtitle={pendingFee === 0 ? 'Zero outstanding' : 'Remaining balance'}
          icon={Clock}
          color={pendingFee > 0 ? 'amber' : 'emerald'}
        />

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payment Status</span>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-3">
            <StatusBadge status={overallStatus} size="lg" />
            <div className="text-xs text-slate-500 mt-2">
              Due Date: <span className="font-semibold text-slate-800">{dueDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Clearance Progress Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex justify-between items-center text-xs font-semibold mb-2">
          <span className="text-slate-700">Fee Clearance Progress</span>
          <span className="text-indigo-600 font-bold">{clearedPercentage}% Cleared</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${clearedPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Dual Section: Recent Payments & Sent Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payments Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">My Payment History</h3>
              <p className="text-xs text-slate-500 mt-0.5">Recorded installments and downloaded receipts</p>
            </div>
            <button
              onClick={() => onNavigateTab('student-payments')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method & Ref</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{p.receipt_no}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{p.payment_date}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{p.payment_method}</span>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-[120px]">
                          {p.transaction_id || 'Cash'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        ₹{p.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleViewReceipt(p.id)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer"
                          title="Print / View Receipt"
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

        {/* Reminders & Notices (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Notices & Reminders</h3>
              </div>
              <span className="text-xs text-slate-400">{reminders.length} notices</span>
            </div>

            <div className="mt-4 space-y-3">
              {reminders.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No payment reminders have been sent to your account.
                </div>
              ) : (
                reminders.slice(0, 3).map(rem => (
                  <div
                    key={rem.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{rem.reminder_type} Reminder</span>
                      <span className="text-[10px] text-slate-400 font-normal font-mono">
                        {rem.sent_date.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{rem.message}</p>
                    <div className="pt-1 text-[10px] font-mono text-amber-700 font-bold">
                      Pending: ₹{rem.pending_amount.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('student-fees')}
              className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Full Fee Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pay Modal Simulation (For testing & demonstration) */}
      {showPayModal && primaryFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-900">Online Fee Payment Simulator</h2>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimulatePayment} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Course Fee:</span>
                  <span className="font-bold font-mono text-slate-800">₹{primaryFee.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Current Outstanding:</span>
                  <span className="font-bold font-mono text-amber-700">₹{primaryFee.pending_amount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Amount to Pay (INR) *
                </label>
                <input
                  type="number"
                  min="100"
                  max={primaryFee.pending_amount}
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(parseFloat(e.target.value) || '')}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900"
                />
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setPayAmount(primaryFee.pending_amount)}
                    className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Pay Full (₹{primaryFee.pending_amount.toLocaleString()})
                  </button>
                  {primaryFee.pending_amount > 10000 && (
                    <button
                      type="button"
                      onClick={() => setPayAmount(Math.round(primaryFee.pending_amount / 2))}
                      className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer ml-2"
                    >
                      Pay 50% (₹{Math.round(primaryFee.pending_amount / 2).toLocaleString()})
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Card', 'Bank Transfer'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`p-2 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                        payMethod === m
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800">
                This executes a real transactional payment record. A verified college fee receipt will be automatically generated and saved to your account.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paySubmitting}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {paySubmitting ? 'Processing Transaction...' : `Confirm & Pay ₹${Number(payAmount || 0).toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
          celebrate={celebrate}
        />
      )}
    </div>
  );
};
