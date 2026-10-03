import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { StudentFee } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export const StudentFeeDetails: React.FC = () => {
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const res = await api.getStudentFees();
        if (res.success) setFees(res.studentFees);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Academic Fee Structure & Balance Details</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Detailed itemized breakdown of semester tuition, laboratory, exam, and hostel dues
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading fee structure...</div>
      ) : fees.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          No fees have been assigned to your academic profile yet.
        </div>
      ) : (
        <div className="space-y-6">
          {fees.map(fee => {
            const structure = fee.feeStructure;
            return (
              <div
                key={fee.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      Semester {fee.semester || structure?.semester || 1}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1">
                      {fee.course || structure?.course} - Academic Fee Package
                    </h2>
                    <p className="text-xs text-slate-500">{fee.department || structure?.department}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={fee.status} size="lg" />
                  </div>
                </div>

                <div className="p-6">
                  {/* Particulars Table */}
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
                    Component Fee Breakdown
                  </h3>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold text-left">
                        <th className="py-2">Fee Head / Description</th>
                        <th className="py-2 text-right">Applicable Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 text-slate-800 font-medium">Tuition & Instructional Fee</td>
                        <td className="py-2.5 text-right font-mono font-semibold">
                          ₹{(structure?.tuition_fee || 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-slate-800 font-medium">University Examination & Evaluation Fee</td>
                        <td className="py-2.5 text-right font-mono font-semibold">
                          ₹{(structure?.exam_fee || 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-slate-800 font-medium">Library, Digital Journals & E-Learning Subscription</td>
                        <td className="py-2.5 text-right font-mono font-semibold">
                          ₹{(structure?.library_fee || 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-slate-800 font-medium">Campus Hostel & Accommodation Fee</td>
                        <td className="py-2.5 text-right font-mono font-semibold">
                          ₹{(structure?.hostel_fee || 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-slate-800 font-medium">Student Activities, Sports & Laboratory Contingency</td>
                        <td className="py-2.5 text-right font-mono font-semibold">
                          ₹{(structure?.other_fee || 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Summary Bar */}
                  <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block">Total Assigned Fee</span>
                      <span className="text-base font-extrabold font-mono text-slate-900">
                        ₹{fee.total_amount.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block">Amount Cleared</span>
                      <span className="text-base font-extrabold font-mono text-emerald-600">
                        ₹{fee.paid_amount.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block">Remaining Due</span>
                      <span className={`text-base font-extrabold font-mono ${fee.pending_amount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        ₹{fee.pending_amount.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block">Due Date</span>
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {fee.due_date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
