import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CreditCard,
  Building2,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { Student, Department, FeeStructure } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

interface StudentManagementProps {
  onRecordPaymentForStudent?: (studentId: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ onRecordPaymentForStudent }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    course: '',
    year: '1',
    semester: '1',
    academic_year: '2025-2026',
    admission_date: new Date().toISOString().split('T')[0],
    password: 'password123',
    assign_fee_structure_id: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stuRes, deptRes, feeRes] = await Promise.all([
        api.getStudents({ search, department: selectedDept, status: selectedStatus }),
        api.getDepartments(),
        api.getFeeStructures()
      ]);

      if (stuRes.success) setStudents(stuRes.students);
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
      if (feeRes.success) setFeeStructures(feeRes.feeStructures);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedDept, selectedStatus]);

  const handleOpenAdd = () => {
    const nextNum = String(students.length + 1).padStart(3, '0');
    const defaultDept = departments[0]?.department_name || '';
    const defaultCourse = departments[0]?.courses[0] || '';

    setFormData({
      student_id: `STU2026${nextNum}`,
      name: '',
      email: '',
      phone: '',
      department: defaultDept,
      course: defaultCourse,
      year: '1',
      semester: '1',
      academic_year: '2025-2026',
      admission_date: new Date().toISOString().split('T')[0],
      password: 'password123',
      assign_fee_structure_id: feeStructures[0]?.id ? String(feeStructures[0].id) : ''
    });
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setCurrentStudent(student);
    setFormData({
      student_id: student.student_id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      course: student.course,
      year: String(student.year),
      semester: String(student.semester),
      academic_year: student.academic_year,
      admission_date: student.admission_date,
      password: '',
      assign_fee_structure_id: ''
    });
    setFormError(null);
    setShowEditModal(true);
  };

  const handleViewDetail = async (studentId: string | number) => {
    try {
      const res = await api.getStudentById(studentId);
      if (res.success) {
        setCurrentStudent(res.student);
        setShowDetailModal(true);
      }
    } catch (err: any) {
      alert(err.message || 'Error fetching student details');
    }
  };

  const handleDelete = async (student: Student) => {
    if (window.confirm(`Are you sure you want to delete student "${student.name}" (${student.student_id}) and remove all associated fee records?`)) {
      try {
        await api.deleteStudent(student.id);
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete student');
      }
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError(null);
      const res = await api.createStudent(formData);
      if (res.success) {
        setShowAddModal(false);
        fetchData();
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    try {
      setSubmitting(true);
      setFormError(null);
      const res = await api.updateStudent(currentStudent.id, {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        course: formData.course,
        year: parseInt(formData.year, 10),
        semester: parseInt(formData.semester, 10),
        academic_year: formData.academic_year
      });
      if (res.success) {
        setShowEditModal(false);
        fetchData();
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  const activeDeptObj = departments.find(d => d.department_name === formData.department);
  const availableCourses = activeDeptObj ? activeDeptObj.courses : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Directory & Profiles</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student registrations, academic branches, fee assignments, and contact profiles
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, student ID, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-indigo-500 text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-indigo-500 font-medium"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.department_name}>
                {d.department_code} - {d.department_name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-indigo-500 font-medium"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student ID / Roll No</th>
                <th className="py-3 px-4">Name & Contact</th>
                <th className="py-3 px-4">Department & Course</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4 text-right">Fee Balance</th>
                <th className="py-3 px-4 text-center">Fee Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading student directory...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                        {student.student_id}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{student.email}</span>
                        <span>•</span>
                        <span>{student.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{student.department}</div>
                      <div className="text-[11px] text-slate-500">{student.course}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">Year {student.year}, Sem {student.semester}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono font-bold text-slate-900">
                        Pending: ₹{(student.pendingAmount || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Paid: ₹{(student.paidAmount || 0).toLocaleString()} / ₹{(student.totalAmount || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={student.paymentStatus || 'PENDING'} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetail(student.student_id)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details & Ledger"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-900">Register New Student</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student ID / Roll No *</label>
                  <input
                    type="text"
                    required
                    value={formData.student_id}
                    onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                    placeholder="e.g. Sanya Gupta"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                    placeholder="student@example.com"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={e => {
                      const deptName = e.target.value;
                      const dept = departments.find(d => d.department_name === deptName);
                      setFormData({
                        ...formData,
                        department: deptName,
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
                    {availableCourses.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Initial Fee Structure Assignment (Optional)
                </label>
                <select
                  value={formData.assign_fee_structure_id}
                  onChange={e => setFormData({ ...formData, assign_fee_structure_id: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                >
                  <option value="">-- Do not assign initial fee now --</option>
                  {feeStructures.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.course} (Sem {f.semester}) - Total ₹{f.total_fee.toLocaleString()} (Due: {f.due_date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] text-indigo-800">
                A student login account will be automatically created with default password <code>password123</code>. The student can sign in immediately using their email or Student ID.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && currentStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-900">Edit Student Profile ({currentStudent.student_id})</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.department_name}>{d.department_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course</label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details & Fee Ledger Modal */}
      {showDetailModal && currentStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {currentStudent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">{currentStudent.name}</h2>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {currentStudent.student_id} • {currentStudent.department} ({currentStudent.course})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-slate-500 font-semibold">Total Fee</div>
                  <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                    ₹{(currentStudent.summary?.totalAmount || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="text-emerald-700 font-semibold">Total Paid</div>
                  <div className="text-lg font-bold text-emerald-800 mt-1 font-mono">
                    ₹{(currentStudent.summary?.paidAmount || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-amber-700 font-semibold">Pending Balance</div>
                  <div className="text-lg font-bold text-amber-800 mt-1 font-mono">
                    ₹{(currentStudent.summary?.pendingAmount || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Assigned Fees Table */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">Assigned Semester Fees</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Fee Structure</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                        <th className="py-2.5 px-3 text-right">Paid</th>
                        <th className="py-2.5 px-3 text-right">Pending</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(!currentStudent.fees || currentStudent.fees.length === 0) ? (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-400">No fees assigned yet</td>
                        </tr>
                      ) : (
                        currentStudent.fees.map((fee: any) => (
                          <tr key={fee.id}>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {fee.feeStructure?.course || 'Academic Fee'} (Sem {fee.feeStructure?.semester || 1})
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">
                              ₹{fee.total_amount.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-bold">
                              ₹{fee.paid_amount.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-amber-600 font-bold">
                              ₹{fee.pending_amount.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-600">{fee.due_date}</td>
                            <td className="py-2.5 px-3 text-center">
                              <StatusBadge status={fee.status} size="sm" />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">Payment History & Receipts</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Receipt No</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3">Txn ID</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(!currentStudent.payments || currentStudent.payments.length === 0) ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400">No payments recorded</td>
                        </tr>
                      ) : (
                        currentStudent.payments.map((p: any) => (
                          <tr key={p.id}>
                            <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{p.receipt_no}</td>
                            <td className="py-2.5 px-3 text-slate-600">{p.payment_date}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">{p.payment_method}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{p.transaction_id || 'N/A'}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              ₹{p.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-300 cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
