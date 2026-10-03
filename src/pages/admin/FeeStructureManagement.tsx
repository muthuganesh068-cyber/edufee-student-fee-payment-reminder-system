import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Plus, Edit, Trash2, Calendar, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { FeeStructure, Department } from '../../types';

export const FeeStructureManagement: React.FC = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Form
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    department: '',
    course: '',
    year: '1',
    semester: '1',
    academic_year: '2025-2026',
    tuition_fee: 40000,
    exam_fee: 2500,
    library_fee: 1500,
    hostel_fee: 15000,
    other_fee: 3000,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Live total calculation
  const liveTotal =
    Number(formData.tuition_fee || 0) +
    Number(formData.exam_fee || 0) +
    Number(formData.library_fee || 0) +
    Number(formData.hostel_fee || 0) +
    Number(formData.other_fee || 0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feeRes, deptRes] = await Promise.all([
        api.getFeeStructures(),
        api.getDepartments()
      ]);
      if (feeRes.success) setFeeStructures(feeRes.feeStructures);
      if (deptRes.success) {
        setDepartments(deptRes.departments);
        if (deptRes.departments.length > 0 && !formData.department) {
          const firstDept = deptRes.departments[0];
          setFormData(prev => ({
            ...prev,
            department: firstDept.department_name,
            course: firstDept.courses[0] || ''
          }));
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
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    const firstDept = departments[0];
    setFormData({
      department: firstDept?.department_name || '',
      course: firstDept?.courses[0] || '',
      year: '1',
      semester: '1',
      academic_year: '2025-2026',
      tuition_fee: 40000,
      exam_fee: 2500,
      library_fee: 1500,
      hostel_fee: 15000,
      other_fee: 3000,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (fee: FeeStructure) => {
    setIsEditing(true);
    setCurrentId(fee.id);
    setFormData({
      department: fee.department,
      course: fee.course,
      year: String(fee.year),
      semester: String(fee.semester),
      academic_year: fee.academic_year,
      tuition_fee: fee.tuition_fee,
      exam_fee: fee.exam_fee,
      library_fee: fee.library_fee,
      hostel_fee: fee.hostel_fee,
      other_fee: fee.other_fee,
      due_date: fee.due_date
    });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = async (id: number, courseName: string) => {
    if (window.confirm(`Are you sure you want to delete fee structure for "${courseName}"?`)) {
      try {
        await api.deleteFeeStructure(id);
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete fee structure');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      if (
        formData.tuition_fee < 0 ||
        formData.exam_fee < 0 ||
        formData.library_fee < 0 ||
        formData.hostel_fee < 0 ||
        formData.other_fee < 0
      ) {
        throw new Error('Fee amounts cannot be negative');
      }

      if (isEditing && currentId) {
        await api.updateFeeStructure(currentId, formData);
      } else {
        await api.createFeeStructure(formData);
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save fee structure');
    } finally {
      setSubmitting(false);
    }
  };

  const activeDept = departments.find(d => d.department_name === formData.department);
  const activeCourses = activeDept?.courses || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Course Fee Structures</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure tuition, laboratory, exam, library, and hostel breakdowns with automated total calculation
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Fee Structure</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Loading fee configurations...
          </div>
        ) : feeStructures.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            No fee structures configured yet.
          </div>
        ) : (
          feeStructures.map(fee => (
            <div
              key={fee.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md uppercase">
                      Year {fee.year} • Semester {fee.semester}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5">{fee.course}</h3>
                    <p className="text-xs text-slate-500">{fee.department}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(fee)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fee.id, fee.course)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Breakdown List */}
                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Tuition Fee:</span>
                    <span className="font-mono font-medium">₹{fee.tuition_fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Examination Fee:</span>
                    <span className="font-mono font-medium">₹{fee.exam_fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Library & Digital Resources:</span>
                    <span className="font-mono font-medium">₹{fee.library_fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Hostel / Maintenance:</span>
                    <span className="font-mono font-medium">₹{fee.hostel_fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Other Academic Dues:</span>
                    <span className="font-mono font-medium">₹{fee.other_fee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Total Course Fee</span>
                  <span className="text-base font-extrabold text-indigo-700 font-mono">
                    ₹{fee.total_fee.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Due: <span className="font-semibold text-slate-700">{fee.due_date}</span>
                </span>
                <span className="font-mono">{fee.academic_year}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-900">
                {isEditing ? 'Edit Fee Structure' : 'Create New Fee Structure'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={e => {
                      const dName = e.target.value;
                      const dept = departments.find(d => d.department_name === dName);
                      setFormData({
                        ...formData,
                        department: dName,
                        course: dept?.courses[0] || ''
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.department_name}>{d.department_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course *</label>
                  <select
                    value={formData.course}
                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                  >
                    {activeCourses.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year</label>
                  <select
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={formData.academic_year}
                    onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">Fee Heads Breakdown (in INR)</span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Tuition Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.tuition_fee}
                      onChange={e => setFormData({ ...formData, tuition_fee: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Examination Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.exam_fee}
                      onChange={e => setFormData({ ...formData, exam_fee: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Library Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.library_fee}
                      onChange={e => setFormData({ ...formData, library_fee: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Hostel Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.hostel_fee}
                      onChange={e => setFormData({ ...formData, hostel_fee: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Other Dues (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.other_fee}
                      onChange={e => setFormData({ ...formData, other_fee: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Computed Total Fee:</span>
                  <span className="text-lg font-extrabold text-indigo-700 font-mono">
                    ₹{liveTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Due Date *</label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900 font-mono"
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
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Fee Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
