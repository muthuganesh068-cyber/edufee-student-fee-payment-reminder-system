import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Filter,
  Search,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { StudentFee, Student, FeeStructure, Department } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

interface StudentFeeManagementProps {
  onRecordPayment?: (studentFeeId: number) => void;
}

export const StudentFeeManagement: React.FC<StudentFeeManagementProps> = ({ onRecordPayment }) => {
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Assign Fee Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetType, setTargetType] = useState<'single' | 'bulk'>('single');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedFeeStructureId, setSelectedFeeStructureId] = useState<number | ''>('');
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sfRes, stuRes, fsRes, deptRes] = await Promise.all([
        api.getStudentFees({ status: statusFilter }),
        api.getStudents(),
        api.getFeeStructures(),
        api.getDepartments()
      ]);

      if (sfRes.success) setStudentFees(sfRes.studentFees);
      if (stuRes.success) {
        setStudents(stuRes.students);
        if (stuRes.students.length > 0 && !selectedStudentId) {
          setSelectedStudentId(stuRes.students[0].student_id);
        }
      }
      if (fsRes.success) {
        setFeeStructures(fsRes.feeStructures);
        if (fsRes.feeStructures.length > 0 && !selectedFeeStructureId) {
          setSelectedFeeStructureId(fsRes.feeStructures[0].id);
        }
      }
      if (deptRes.success) {
        setDepartments(deptRes.departments);
        if (deptRes.departments.length > 0 && !selectedDept) {
          setSelectedDept(deptRes.departments[0].department_name);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleAssignFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeStructureId) {
      setAssignError('Please select a fee structure');
      return;
    }

    try {
      setAssigning(true);
      setAssignError(null);

      await api.assignFee({
        target_type: targetType,
        student_id: targetType === 'single' ? selectedStudentId : undefined,
        department: targetType === 'bulk' ? selectedDept : undefined,
        course: targetType === 'bulk' && selectedCourse !== 'ALL' ? selectedCourse : undefined,
        fee_structure_id: Number(selectedFeeStructureId)
      });

      setShowAssignModal(false);
      fetchData();
    } catch (err: any) {
      setAssignError(err.message || 'Error assigning fee');
    } finally {
      setAssigning(false);
    }
  };

  const filteredFees = studentFees.filter(sf => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      sf.student_id.toLowerCase().includes(q) ||
      (sf.studentName && sf.studentName.toLowerCase().includes(q)) ||
      (sf.department && sf.department.toLowerCase().includes(q))
    );
  });

  const activeDeptObj = departments.find(d => d.department_name === selectedDept);
  const availableCourses = activeDeptObj ? activeDeptObj.courses : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Fee Management Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time student balances, payment statuses, due dates, and fee assignments
          </p>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Fee Structure</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by student ID, name, or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['ALL', 'PENDING', 'PARTIALLY PAID', 'OVERDUE', 'PAID'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Fees' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student ID / Name</th>
                <th className="py-3 px-4">Course & Department</th>
                <th className="py-3 px-4 text-right">Total Fee</th>
                <th className="py-3 px-4 text-right">Paid Amount</th>
                <th className="py-3 px-4 text-right">Pending Balance</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Loading student fee ledger...</td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No student fees found matching current status filter.
                  </td>
                </tr>
              ) : (
                filteredFees.map(fee => (
                  <tr key={fee.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{fee.studentName}</div>
                      <span className="font-mono text-[11px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">
                        {fee.student_id}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{fee.department}</div>
                      <div className="text-[11px] text-slate-500">{fee.course} (Sem {fee.semester})</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{fee.total_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      ₹{fee.paid_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={fee.pending_amount > 0 ? 'text-amber-600' : 'text-slate-400'}>
                        ₹{fee.pending_amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{fee.due_date}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={fee.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {fee.pending_amount > 0 ? (
                        <button
                          onClick={() => onRecordPayment && onRecordPayment(fee.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Pay</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Fee Structure Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-900">Assign Fee Structure</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignFee} className="p-6 space-y-4 text-xs">
              {assignError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{assignError}</span>
                </div>
              )}

              {/* Assignment Mode: Single Student vs Bulk Department */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Assignment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetType('single')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      targetType === 'single'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Single Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType('bulk')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      targetType === 'bulk'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Batch Department
                  </button>
                </div>
              </div>

              {targetType === 'single' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.student_id}>
                        {s.name} ({s.student_id}) - {s.course} (Sem {s.semester})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Department *</label>
                    <select
                      value={selectedDept}
                      onChange={e => {
                        setSelectedDept(e.target.value);
                        setSelectedCourse('ALL');
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.department_name}>{d.department_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Course</label>
                    <select
                      value={selectedCourse}
                      onChange={e => setSelectedCourse(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                    >
                      <option value="ALL">All Courses in Department</option>
                      {availableCourses.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee Structure to Assign *</label>
                <select
                  value={selectedFeeStructureId}
                  onChange={e => setSelectedFeeStructureId(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                >
                  {feeStructures.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.course} (Sem {f.semester}) • Total ₹{f.total_fee.toLocaleString()} • Due {f.due_date}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                  {assigning ? 'Assigning...' : 'Assign Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
