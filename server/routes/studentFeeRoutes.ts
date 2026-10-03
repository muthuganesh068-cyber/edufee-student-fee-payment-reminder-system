import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../auth';

const router = Router();

// GET student fees (Admin: all, Student: only their own)
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { status, student_id } = req.query;
    let fees = db.getStudentFees();

    // Student access isolation
    if (req.user?.role === 'student') {
      const student = db.findStudentByUserId(req.user.id) || (req.user.student_id ? db.findStudentByStudentId(req.user.student_id) : null);
      if (!student) {
        res.json({ success: true, count: 0, studentFees: [] });
        return;
      }
      fees = fees.filter(f => f.student_id === student.student_id);
    } else if (student_id && typeof student_id === 'string') {
      fees = fees.filter(f => f.student_id.toUpperCase() === student_id.toUpperCase());
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      fees = fees.filter(f => f.status === status);
    }

    // Enrich with student details & fee structure details
    const enriched = fees.map(f => {
      const student = db.findStudentByStudentId(f.student_id);
      const structure = db.findFeeStructureById(f.fee_structure_id);
      return {
        ...f,
        studentName: student?.name || 'Unknown',
        department: student?.department || 'Unknown',
        course: student?.course || 'Unknown',
        semester: student?.semester || 1,
        feeStructure: structure || null
      };
    });

    res.json({ success: true, count: enriched.length, studentFees: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching student fees' });
  }
});

// POST assign fee structure to single student or entire department/course (Admin only)
router.post('/assign', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { target_type, student_id, department, course, fee_structure_id } = req.body;

    if (!fee_structure_id) {
      res.status(400).json({ success: false, message: 'Fee structure ID is required' });
      return;
    }

    const structure = db.findFeeStructureById(parseInt(fee_structure_id, 10));
    if (!structure) {
      res.status(404).json({ success: false, message: 'Selected fee structure not found' });
      return;
    }

    const assigned: any[] = [];

    if (target_type === 'single') {
      if (!student_id) {
        res.status(400).json({ success: false, message: 'Student ID is required for single assignment' });
        return;
      }
      const student = db.findStudentByStudentId(student_id.trim());
      if (!student) {
        res.status(404).json({ success: false, message: `Student with ID ${student_id} not found` });
        return;
      }

      // Check if already assigned
      const existing = db.getStudentFees().find(
        sf => sf.student_id === student.student_id && sf.fee_structure_id === structure.id
      );
      if (existing) {
        res.status(400).json({ success: false, message: `This fee structure is already assigned to student ${student.name}` });
        return;
      }

      const newFee = db.assignFeeToStudent(student.student_id, structure.id);
      assigned.push(newFee);

      // Create notification
      if (student.user_id) {
        db.createNotification({
          user_id: student.user_id,
          student_id: student.student_id,
          title: 'New Fee Assigned',
          message: `Fee of ₹${structure.total_fee.toLocaleString()} for ${structure.course} Semester ${structure.semester} has been assigned. Due Date: ${structure.due_date}.`,
          type: 'due_date',
          is_read: false
        });
      }
    } else {
      // Bulk assign by department and course
      let targetStudents = db.getStudents().filter(s => s.status === 'active');
      if (department && department !== 'ALL') {
        targetStudents = targetStudents.filter(s => s.department === department);
      }
      if (course && course !== 'ALL') {
        targetStudents = targetStudents.filter(s => s.course === course);
      }

      let count = 0;
      for (const s of targetStudents) {
        const already = db.getStudentFees().find(
          sf => sf.student_id === s.student_id && sf.fee_structure_id === structure.id
        );
        if (!already) {
          const newFee = db.assignFeeToStudent(s.student_id, structure.id);
          assigned.push(newFee);
          count++;

          if (s.user_id) {
            db.createNotification({
              user_id: s.user_id,
              student_id: s.student_id,
              title: 'New Fee Assigned',
              message: `Fee of ₹${structure.total_fee.toLocaleString()} for ${structure.course} Semester ${structure.semester} has been assigned. Due Date: ${structure.due_date}.`,
              type: 'due_date',
              is_read: false
            });
          }
        }
      }

      if (count === 0) {
        res.status(400).json({ success: false, message: 'All matching students already have this fee structure assigned' });
        return;
      }
    }

    res.status(201).json({
      success: true,
      message: `Fee assigned successfully to ${assigned.length} student(s)`,
      count: assigned.length
    });
  } catch (error) {
    console.error('Error assigning fee:', error);
    res.status(500).json({ success: false, message: 'Server error assigning fee' });
  }
});

export default router;
