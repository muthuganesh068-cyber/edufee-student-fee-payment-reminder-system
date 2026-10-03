import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Receipt,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X,
  Printer,
  Download,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { api } from '../../services/api';
import { Payment, StudentFee, Department } from '../../types';
import { ReceiptModal } from '../../components/ReceiptModal';

interface PaymentManagementProps {
  initialStudentFeeId?: number | null;
  onClearInitialFeeId?: () => void;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({
  initialStudentFeeId,
  onClearInitialFeeId
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Record Payment Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedFeeId, setSelectedFeeId] = useState<number | ''>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other'>('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
  const [celebrateReceipt, setCelebrateReceipt] = useState(false);

  const fetchPaymentsAndFees = async () => {
    try {
      setLoading(true);
      const [payRes, feeRes, deptRes] = await Promise.all([
        api.getPayments({
          search,
          payment_method: selectedMethod,
          department: selectedDept,
          date_from: dateFrom,
          date_to: dateTo
        }),
        api.getStudentFees(),
        api.getDepartments()
      ]);

      if (payRes.success) setPayments(payRes.payments);
      if (feeRes.success) setStudentFees(feeRes.studentFees);
      if (deptRes.success) setDepartments(deptRes.departments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsAndFees();
  }, [search, selectedMethod, selectedDept, dateFrom, dateTo]);

  // Open modal if initialStudentFeeId passed from outside
  useEffect(() => {
    if (initialStudentFeeId) {
      setSelectedFeeId(initialStudentFeeId);
      const target = studentFees.find(sf => sf.id === initialStudentFeeId);
      if (target) {
        setAmount(target.pending_amount);
      }
      setShowModal(true);
      if (onClearInitialFeeId) onClearInitialFeeId();
    }
  }, [initialStudentFeeId, studentFees]);

  const handleOpenRecordPayment = () => {
    // Default to the first pending fee
    const pendingFees = studentFees.filter(sf => sf.pending_amount > 0);
    const firstPending = pendingFees[0];
    if (firstPending) {
      setSelectedFeeId(firstPending.id);
      setAmount(firstPending.pending_amount);
    } else {
      setSelectedFeeId('');
      setAmount('');
    }
    setPaymentMethod('UPI');
    setTransactionId(`UPI/${new Date().getFullYear()}/${Math.floor(1000000 + Math.random() * 9000000)}`);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setRemarks('Semester Fee Installment');
    setError(null);
    setShowModal(true);
  };

  const handleSelectFee = (feeId: number) => {
    setSelectedFeeId(feeId);
    const target = studentFees.find(sf => sf.id === feeId);
    if (target) {
      setAmount(target.pending_amount);
    }
  };

  const handleViewReceipt = async (paymentId: number) => {
    try {
      const res = await api.getReceipt(paymentId);
      if (res.success) {
        setActiveReceipt(res.receipt);
        setCelebrateReceipt(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to load receipt');
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeId || !amount) {
      setError('Please select a student fee and enter payment amount');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await api.recordPayment({
        student_fee_id: Number(selectedFeeId),
        amount: Number(amount),
        payment_method: paymentMethod,
        transaction_id: transactionId,
        payment_date: paymentDate,
        remarks
      });

      setShowModal(false);
      // Fetch full receipt for celebratory view
      const receiptRes = await api.getReceipt(res.payment.id);
      if (receiptRes.success) {
        setActiveReceipt(receiptRes.receipt);
        setCelebrateReceipt(true);
      }
      fetchPaymentsAndFees();
    } catch (err: any) {
      setError(err.message || 'Error recording payment');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedFeeObj = studentFees.find(sf => sf.id === Number(selectedFeeId));
  const remainingAfterPayment = selectedFeeObj
    ? Math.max(0, selectedFeeObj.pending_amount - (Number(amount) || 0))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Payment Management & Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record tuition collections, validate balances, print official receipts, and audit transactions
          </p>
        </div>
        <button
          onClick={handleOpenRecordPayment}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by receipt no, student name, ID, or transaction ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedMethod}
              onChange={e => setSelectedMethod(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-indigo-500 font-medium"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
              <option value="Card">Debit / Credit Card</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-indigo-500 font-medium"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.department_name}>{d.department_code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date Range:
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px]"
            title="From Date"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px]"
            title="To Date"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-[11px] text-rose-600 font-semibold hover:underline ml-2 cursor-pointer"
            >
              Clear Dates
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Student Details</th>
                <th className="py-3 px-4">Department & Course</th>
                <th className="py-3 px-4">Mode & Transaction</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading payment ledger...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No payment transactions found.
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                        {p.receipt_no}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{p.studentName}</div>
                      <span className="font-mono text-[11px] text-slate-500">{p.student_id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{p.department}</div>
                      <div className="text-[11px] text-slate-500">{p.course}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{p.payment_method}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-[140px]">
                        {p.transaction_id || 'Cash Transaction'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{p.payment_date}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleViewReceipt(p.id)}
                        className="p-1.5 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                        title="Print / View Official Receipt"
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

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-900">Record Fee Collection</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Student Account & Fee *
                </label>
                <select
                  value={selectedFeeId}
                  onChange={e => handleSelectFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                >
                  <option value="">-- Choose student fee record --</option>
                  {studentFees
                    .filter(sf => sf.pending_amount > 0)
                    .map(sf => (
                      <option key={sf.id} value={sf.id}>
                        {sf.studentName} ({sf.student_id}) - Pending: ₹{sf.pending_amount.toLocaleString()} (Due: {sf.due_date})
                      </option>
                    ))}
                </select>
              </div>

              {selectedFeeObj && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Total Assigned Course Fee:</span>
                    <span className="font-mono font-bold">₹{selectedFeeObj.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Already Paid So Far:</span>
                    <span className="font-mono text-emerald-700 font-bold">₹{selectedFeeObj.paid_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-indigo-200/60">
                    <span>Current Outstanding Pending:</span>
                    <span className="font-mono text-amber-700">₹{selectedFeeObj.pending_amount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Amount (INR) *</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedFeeObj ? selectedFeeObj.pending_amount : undefined}
                    required
                    value={amount}
                    onChange={e => setAmount(parseFloat(e.target.value) || '')}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-sm font-bold"
                    placeholder="e.g. 25000"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT / RTGS)</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Live Balance Preview */}
              {selectedFeeObj && Number(amount) > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-slate-600 font-medium">New Balance Remaining after Payment:</span>
                  <span className={`font-mono font-bold ${remainingAfterPayment === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    ₹{remainingAfterPayment.toLocaleString()} {remainingAfterPayment === 0 ? '(100% PAID)' : ''}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Cheque No</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900 font-mono"
                    placeholder="e.g. UPI/2026/123456"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. Semester 5 installment payment"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting ? 'Generating Receipt...' : 'Confirm & Issue Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Viewer Modal */}
      {activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
          celebrate={celebrateReceipt}
        />
      )}
    </div>
  );
};
