import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../auth';

const router = Router();

// GET all students (with search, filter, and enriched fee info)
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { search, department, status, year, semester } = req.query;

    let students = db.getStudents();
    const studentFees = db.getStudentFees();

    // Student role can only see their own profile
    if (req.user?.role === 'student') {
      const student = db.findStudentByUserId(req.user.id) || (req.user.student_id ? db.findStudentByStudentId(req.user.student_id) : null);
      students = student ? [student] : [];
    }

    // Apply search filter
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      students = students.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q)
      );
    }

    // Apply Department filter
    if (department && typeof department === 'string' && department !== 'ALL') {
      students = students.filter(s => s.department === department);
    }

    // Apply Status filter
    if (status && typeof status === 'string' && status !== 'ALL') {
      students = students.filter(s => s.status === status);
    }

    // Apply Year filter
    if (year && typeof year === 'string' && year !== 'ALL') {
      students = students.filter(s => s.year === parseInt(year, 10));
    }

    // Apply Semester filter
    if (semester && typeof semester === 'string' && semester !== 'ALL') {
      students = students.filter(s => s.semester === parseInt(semester, 10));
    }

    // Enrich with fee information
    const enriched = students.map(student => {
      const fees = studentFees.filter(sf => sf.student_id === student.student_id);
      const totalAmount = fees.reduce((sum, f) => sum + f.total_amount, 0);
      const paidAmount = fees.reduce((sum, f) => sum + f.paid_amount, 0);
      const pendingAmount = fees.reduce((sum, f) => sum + f.pending_amount, 0);
      
      // Determine overall payment status
      let paymentStatus: string = 'PENDING';
      if (fees.some(f => f.status === 'OVERDUE')) {
        paymentStatus = 'OVERDUE';
      } else if (fees.length > 0 && pendingAmount === 0) {
        paymentStatus = 'PAID';
      } else if (paidAmount > 0) {
        paymentStatus = 'PARTIALLY PAID';
      } else if (fees.length === 0) {
        paymentStatus = 'NO FEES ASSIGNED';
      }

      const earliestDue = fees.filter(f => f.pending_amount > 0).sort((a, b) => a.due_date.localeCompare(b.due_date))[0]?.due_date || 'N/A';

      return {
        ...student,
        totalAmount,
        paidAmount,
        pendingAmount,
        paymentStatus,
        earliestDue,
        assignedFeesCount: fees.length
      };
    });

    res.json({ success: true, count: enriched.length, students: enriched });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error fetching students' });
  }
});

// GET single student details with fee structures and payment history
router.get('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const studentIdParam = req.params.id;
    let student = null;

    if (!isNaN(Number(studentIdParam))) {
      student = db.findStudentById(Number(studentIdParam));
    }
    if (!student) {
      student = db.findStudentByStudentId(studentIdParam);
    }

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    // Role check: Student can only view their own record
    if (req.user?.role === 'student' && student.student_id !== req.user.student_id && student.user_id !== req.user.id) {
      res.status(403).json({ success: false, message: 'Access forbidden: You cannot view other student profiles' });
      return;
    }

    const fees = db.getStudentFees().filter(sf => sf.student_id === student.student_id);
    const enrichedFees = fees.map(f => {
      const structure = db.findFeeStructureById(f.fee_structure_id);
      return {
        ...f,
        feeStructure: structure || null
      };
    });

    const payments = db.getPayments().filter(p => p.student_id === student.student_id);
    const reminders = db.getReminders().filter(r => r.student_id === student.student_id);

    const totalAmount = fees.reduce((sum, f) => sum + f.total_amount, 0);
    const paidAmount = fees.reduce((sum, f) => sum + f.paid_amount, 0);
    const pendingAmount = fees.reduce((sum, f) => sum + f.pending_amount, 0);

    res.json({
      success: true,
      student: {
        ...student,
        fees: enrichedFees,
        payments,
        reminders,
        summary: {
          totalAmount,
          paidAmount,
          pendingAmount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching student details' });
  }
});

// POST create student (Admin only)
router.post('/', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const {
      student_id,
      name,
      email,
      phone,
      department,
      course,
      year,
      semester,
      academic_year,
      admission_date,
      password,
      assign_fee_structure_id
    } = req.body;

    // Validation
    if (!student_id || !name || !email || !phone || !department || !course) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    // Check duplicate Student ID
    if (db.findStudentByStudentId(student_id.trim())) {
      res.status(400).json({ success: false, message: `Student ID "${student_id}" is already registered` });
      return;
    }

    // Check duplicate Email
    if (db.findUserByEmail(email.trim())) {
      res.status(400).json({ success: false, message: `Email "${email}" is already registered` });
      return;
    }

    // Create user authentication account for student
    const defaultPassword = password || 'password123';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
    const newUser = db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'student',
      phone: phone.trim()
    });

    // Create student profile
    const newStudent = db.createStudent({
      student_id: student_id.trim().toUpperCase(),
      user_id: newUser.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      department: department.trim(),
      course: course.trim(),
      year: parseInt(year || '1', 10),
      semester: parseInt(semester || '1', 10),
      academic_year: academic_year || '2025-2026',
      admission_date: admission_date || new Date().toISOString().split('T')[0],
      status: 'active'
    });

    // Optional initial fee structure assignment
    if (assign_fee_structure_id) {
      try {
        db.assignFeeToStudent(newStudent.student_id, parseInt(assign_fee_structure_id, 10));
      } catch (err) {
        console.warn('Initial fee assignment notice:', err);
      }
    }

    res.status(201).json({
      success: true,
      message: `Student "${name}" registered successfully with ID ${newStudent.student_id}. Default login password is "${defaultPassword}".`,
      student: newStudent
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ success: false, message: 'Server error creating student' });
  }
});

// PUT update student (Admin only)
router.put('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = db.findStudentById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const { name, phone, department, course, year, semester, academic_year, status } = req.body;

    const updated = db.updateStudent(id, {
      ...(name && { name: name.trim() }),
      ...(phone && { phone: phone.trim() }),
      ...(department && { department: department.trim() }),
      ...(course && { course: course.trim() }),
      ...(year && { year: parseInt(year, 10) }),
      ...(semester && { semester: parseInt(semester, 10) }),
      ...(academic_year && { academic_year: academic_year.trim() }),
      ...(status && { status })
    });

    // Also update linked user's name/phone if changed
    if (existing.user_id && (name || phone)) {
      const user = db.findUserById(existing.user_id);
      if (user) {
        if (name) user.name = name.trim();
        if (phone) user.phone = phone.trim();
        db.save();
      }
    }

    res.json({ success: true, message: 'Student updated successfully', student: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating student' });
  }
});

// DELETE student (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const success = db.deleteStudent(id);
  if (!success) {
    res.status(404).json({ success: false, message: 'Student not found' });
    return;
  }
  res.json({ success: true, message: 'Student and associated fee records deleted successfully' });
});

export default router;
