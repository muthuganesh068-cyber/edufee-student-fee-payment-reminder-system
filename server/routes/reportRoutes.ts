import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../auth';

const router = Router();

// GET Dashboard statistics
router.get('/dashboard', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const stats = db.getDashboardStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error calculating dashboard statistics' });
  }
});

// GET Student Fee Report
router.get('/fees', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { department, status } = req.query;
    const students = db.getStudents();
    const studentFees = db.getStudentFees();

    let report = students.map(student => {
      const fees = studentFees.filter(sf => sf.student_id === student.student_id);
      const totalAmount = fees.reduce((sum, f) => sum + f.total_amount, 0);
      const paidAmount = fees.reduce((sum, f) => sum + f.paid_amount, 0);
      const pendingAmount = fees.reduce((sum, f) => sum + f.pending_amount, 0);

      let overallStatus = 'PENDING';
      if (fees.some(f => f.status === 'OVERDUE')) {
        overallStatus = 'OVERDUE';
      } else if (fees.length > 0 && pendingAmount === 0) {
        overallStatus = 'PAID';
      } else if (paidAmount > 0) {
        overallStatus = 'PARTIALLY PAID';
      } else if (fees.length === 0) {
        overallStatus = 'NO FEES';
      }

      const earliestDue = fees.filter(f => f.pending_amount > 0).sort((a, b) => a.due_date.localeCompare(b.due_date))[0]?.due_date || 'N/A';

      return {
        student_id: student.student_id,
        name: student.name,
        department: student.department,
        course: student.course,
        year: student.year,
        semester: student.semester,
        totalAmount,
        paidAmount,
        pendingAmount,
        status: overallStatus,
        earliestDue
      };
    });

    if (department && typeof department === 'string' && department !== 'ALL') {
      report = report.filter(r => r.department === department);
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      report = report.filter(r => r.status === status);
    }

    const summary = {
      totalRecords: report.length,
      sumTotal: report.reduce((sum, r) => sum + r.totalAmount, 0),
      sumPaid: report.reduce((sum, r) => sum + r.paidAmount, 0),
      sumPending: report.reduce((sum, r) => sum + r.pendingAmount, 0)
    };

    res.json({ success: true, summary, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error generating fee report' });
  }
});

// GET Pending Fee Report
router.get('/pending', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const studentFees = db.getStudentFees().filter(sf => sf.pending_amount > 0);
    const students = db.getStudents();

    const report = studentFees.map(sf => {
      const stu = students.find(s => s.student_id === sf.student_id);
      return {
        id: sf.id,
        student_id: sf.student_id,
        studentName: stu?.name || 'Unknown',
        department: stu?.department || 'Unknown',
        course: stu?.course || '',
        total_amount: sf.total_amount,
        paid_amount: sf.paid_amount,
        pending_amount: sf.pending_amount,
        due_date: sf.due_date,
        status: sf.status
      };
    });

    res.json({
      success: true,
      totalPendingCount: report.length,
      totalPendingAmount: report.reduce((sum, r) => sum + r.pending_amount, 0),
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error generating pending fee report' });
  }
});

// GET Overdue Fee Report
router.get('/overdue', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const overdueFees = db.getStudentFees().filter(sf => sf.status === 'OVERDUE' || (sf.due_date < today && sf.pending_amount > 0));
    const students = db.getStudents();

    const report = overdueFees.map(sf => {
      const stu = students.find(s => s.student_id === sf.student_id);
      const daysOverdue = Math.ceil((new Date(today).getTime() - new Date(sf.due_date).getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: sf.id,
        student_id: sf.student_id,
        studentName: stu?.name || 'Unknown',
        phone: stu?.phone || '',
        email: stu?.email || '',
        department: stu?.department || 'Unknown',
        pending_amount: sf.pending_amount,
        due_date: sf.due_date,
        daysOverdue
      };
    });

    res.json({
      success: true,
      totalOverdueCount: report.length,
      totalOverdueAmount: report.reduce((sum, r) => sum + r.pending_amount, 0),
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error generating overdue report' });
  }
});

export default router;
