import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../auth';

const router = Router();

// GET payments list (Admin: all with filters; Student: only their own)
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { search, payment_method, date_from, date_to, department, student_id } = req.query;

    let payments = db.getPayments();
    const students = db.getStudents();

    // Student role isolation
    if (req.user?.role === 'student') {
      const student = db.findStudentByUserId(req.user.id) || (req.user.student_id ? db.findStudentByStudentId(req.user.student_id) : null);
      if (!student) {
        res.json({ success: true, count: 0, payments: [] });
        return;
      }
      payments = payments.filter(p => p.student_id === student.student_id);
    } else if (student_id && typeof student_id === 'string') {
      payments = payments.filter(p => p.student_id.toUpperCase() === student_id.toUpperCase());
    }

    // Payment method filter
    if (payment_method && typeof payment_method === 'string' && payment_method !== 'ALL') {
      payments = payments.filter(p => p.payment_method === payment_method);
    }

    // Date range filter
    if (date_from && typeof date_from === 'string') {
      payments = payments.filter(p => p.payment_date >= date_from);
    }
    if (date_to && typeof date_to === 'string') {
      payments = payments.filter(p => p.payment_date <= date_to);
    }

    // Enrich with student details
    let enriched = payments.map(p => {
      const student = students.find(s => s.student_id === p.student_id);
      const studentFee = db.findStudentFeeById(p.student_fee_id);
      const feeStructure = studentFee ? db.findFeeStructureById(studentFee.fee_structure_id) : null;

      return {
        ...p,
        studentName: student?.name || 'Unknown',
        studentEmail: student?.email || '',
        department: student?.department || 'Unknown',
        course: student?.course || '',
        semester: student?.semester || 1,
        feeTotal: studentFee?.total_amount || 0,
        feePending: studentFee?.pending_amount || 0,
        feeStructureName: feeStructure ? `${feeStructure.course} Sem ${feeStructure.semester}` : 'Academic Fee'
      };
    });

    // Department filter
    if (department && typeof department === 'string' && department !== 'ALL') {
      enriched = enriched.filter(p => p.department === department);
    }

    // Search query
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      enriched = enriched.filter(p =>
        p.receipt_no.toLowerCase().includes(q) ||
        p.student_id.toLowerCase().includes(q) ||
        p.studentName.toLowerCase().includes(q) ||
        (p.transaction_id && p.transaction_id.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: enriched.length, payments: enriched });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Server error fetching payments' });
  }
});

// GET single payment / receipt
router.get('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const payment = db.findPaymentById(id);

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    const student = db.findStudentByStudentId(payment.student_id);
    const studentFee = db.findStudentFeeById(payment.student_fee_id);
    const feeStructure = studentFee ? db.findFeeStructureById(studentFee.fee_structure_id) : null;

    // Student security check
    if (req.user?.role === 'student' && student?.student_id !== req.user.student_id && student?.user_id !== req.user.id) {
      res.status(403).json({ success: false, message: 'Access denied to this receipt' });
      return;
    }

    res.json({
      success: true,
      receipt: {
        ...payment,
        student,
        studentFee,
        feeStructure,
        institution: {
          name: 'St. Xavier Institute of Engineering & Technology',
          address: '42 Academic Avenue, Knowledge City, Bangalore - 560100',
          phone: '+91 80 2345 6789',
          email: 'accounts@stxavier.edu.in',
          website: 'www.stxavier.edu.in'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching receipt' });
  }
});

// POST record a new payment (Admin only)
router.post('/', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const {
      student_fee_id,
      amount,
      payment_method,
      transaction_id,
      payment_date,
      remarks
    } = req.body;

    if (!student_fee_id || amount === undefined || !payment_method) {
      res.status(400).json({ success: false, message: 'Student fee, amount, and payment method are required' });
      return;
    }

    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
      return;
    }

    const studentFee = db.findStudentFeeById(parseInt(student_fee_id, 10));
    if (!studentFee) {
      res.status(404).json({ success: false, message: 'Student fee record not found' });
      return;
    }

    if (payAmount > studentFee.pending_amount) {
      res.status(400).json({
        success: false,
        message: `Payment amount (₹${payAmount.toLocaleString()}) cannot exceed the pending balance (₹${studentFee.pending_amount.toLocaleString()})`
      });
      return;
    }

    const result = db.recordPayment({
      student_fee_id: studentFee.id,
      amount: payAmount,
      payment_method,
      transaction_id: transaction_id?.trim() || `TXN-${Date.now()}`,
      payment_date: payment_date || new Date().toISOString().split('T')[0],
      remarks: remarks?.trim() || '',
      recorded_by: req.user?.name || 'Administrator'
    });

    res.status(201).json({
      success: true,
      message: `Payment of ₹${payAmount.toLocaleString()} successfully recorded! Receipt No: ${result.receiptNo}`,
      payment: result.payment,
      updatedFee: result.studentFee,
      receiptNo: result.receiptNo
    });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    res.status(400).json({ success: false, message: error.message || 'Error recording payment' });
  }
});

export default router;
