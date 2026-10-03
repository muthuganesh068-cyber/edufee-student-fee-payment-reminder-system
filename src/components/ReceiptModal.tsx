import React from 'react';
import { X, Printer, CheckCircle, GraduationCap, Building2, ShieldCheck, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReceiptModalProps {
  receipt: any;
  onClose: () => void;
  celebrate?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose, celebrate = false }) => {
  React.useEffect(() => {
    if (celebrate) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [celebrate]);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const payment = receipt;
  const student = receipt.student || {};
  const studentFee = receipt.studentFee || {};
  const feeStructure = receipt.feeStructure || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Top Action Bar (hidden in print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>Official College Fee Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-receipt" className="p-8 text-slate-800 bg-white">
          {/* Institution Header */}
          <div className="text-center pb-6 border-b-2 border-slate-800/80">
            <div className="flex justify-center items-center gap-2 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                St. Xavier Institute of Engineering & Technology
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Approved by AICTE | Affiliated to State Technological University | Accredited 'A+' Grade
            </p>
            <p className="text-xs text-slate-500">
              Campus: 42 Academic Avenue, Knowledge City, Bangalore - 560100 | Ph: +91 80 2345 6789
            </p>
            <div className="mt-3 inline-block px-4 py-1 bg-slate-100 rounded-full text-xs font-bold uppercase tracking-wider text-slate-800 border border-slate-200">
              Fee Payment Acknowledgment Receipt
            </div>
          </div>

          {/* Receipt Meta & Student Details */}
          <div className="grid grid-cols-2 gap-4 py-5 border-b border-dashed border-slate-300 text-xs">
            <div>
              <div className="text-slate-500 font-medium">RECEIPT NUMBER</div>
              <div className="text-sm font-bold text-slate-900 font-mono">{payment.receipt_no}</div>

              <div className="mt-3 text-slate-500 font-medium">STUDENT NAME</div>
              <div className="text-sm font-bold text-slate-900">{student.name || payment.studentName || 'Student'}</div>

              <div className="mt-3 text-slate-500 font-medium">STUDENT ID / ROLL NO</div>
              <div className="font-semibold text-slate-800 font-mono">{student.student_id || payment.student_id}</div>
            </div>

            <div>
              <div className="text-slate-500 font-medium">PAYMENT DATE</div>
              <div className="text-sm font-bold text-slate-900">{payment.payment_date}</div>

              <div className="mt-3 text-slate-500 font-medium">DEPARTMENT & COURSE</div>
              <div className="font-semibold text-slate-800">
                {student.department || payment.department}
                <div className="text-slate-600">{student.course || payment.course} (Sem {student.semester || payment.semester || 1})</div>
              </div>

              <div className="mt-3 text-slate-500 font-medium">ACADEMIC YEAR</div>
              <div className="font-semibold text-slate-800">{student.academic_year || '2025-2026'}</div>
            </div>
          </div>

          {/* Payment Particulars Table */}
          <div className="py-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 uppercase text-left font-semibold">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Payment Details</th>
                  <th className="py-2 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 font-medium text-slate-800">
                    Tuition & Academic Semester Fee
                    <div className="text-[11px] text-slate-500">
                      Payment Mode: {payment.payment_method}
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-600">
                    Ref / Txn: {payment.transaction_id || 'N/A'}
                  </td>
                  <td className="py-2.5 text-right font-bold text-slate-900 font-mono text-sm">
                    ₹{Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Balance & Totals Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Total Course Fee Assigned:</span>
                  <span className="font-semibold font-mono text-slate-800">
                    ₹{Number(studentFee.total_amount || payment.feeTotal || payment.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Status:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                    <CheckCircle className="w-3.5 h-3.5" /> SUCCESS
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 border-l border-slate-200 pl-4">
                <div className="flex justify-between text-slate-600">
                  <span>Amount Paid in this receipt:</span>
                  <span className="font-bold font-mono text-indigo-600">
                    ₹{Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Remaining Pending Balance:</span>
                  <span className={`font-bold font-mono ${Number(studentFee.pending_amount || 0) === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    ₹{Number(studentFee.pending_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
            {payment.remarks && (
              <div className="mt-3 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Remarks:</span> {payment.remarks}
              </div>
            )}
          </div>

          {/* Authentication & Signatures */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-end justify-between text-xs">
            <div className="text-[11px] text-slate-400 max-w-xs">
              <p>* Computer-generated official receipt. Valid without physical seal when verified via college portal.</p>
              <p className="mt-1 font-mono">Issued by: {payment.recorded_by || 'Accounts Section'}</p>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 pb-1 mb-1 font-cursive text-indigo-700 font-bold text-sm tracking-widest">
                XavierAccounts
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Authorized Finance Officer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
