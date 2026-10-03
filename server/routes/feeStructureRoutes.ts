import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../auth';

const router = Router();

// GET all fee structures
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const { department, course, academic_year } = req.query;
  let structures = db.getFeeStructures();

  if (department && typeof department === 'string' && department !== 'ALL') {
    structures = structures.filter(s => s.department === department);
  }
  if (course && typeof course === 'string' && course !== 'ALL') {
    structures = structures.filter(s => s.course === course);
  }
  if (academic_year && typeof academic_year === 'string' && academic_year !== 'ALL') {
    structures = structures.filter(s => s.academic_year === academic_year);
  }

  res.json({ success: true, count: structures.length, feeStructures: structures });
});

// POST create fee structure (Admin only)
router.post('/', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const {
      department,
      course,
      year,
      semester,
      academic_year,
      tuition_fee,
      exam_fee,
      library_fee,
      hostel_fee,
      other_fee,
      due_date
    } = req.body;

    if (!department || !course || !due_date) {
      res.status(400).json({ success: false, message: 'Department, course, and due date are required' });
      return;
    }

    const tFee = Math.max(0, parseFloat(tuition_fee || 0));
    const eFee = Math.max(0, parseFloat(exam_fee || 0));
    const lFee = Math.max(0, parseFloat(library_fee || 0));
    const hFee = Math.max(0, parseFloat(hostel_fee || 0));
    const oFee = Math.max(0, parseFloat(other_fee || 0));

    if (tFee < 0 || eFee < 0 || lFee < 0 || hFee < 0 || oFee < 0) {
      res.status(400).json({ success: false, message: 'Fee amounts cannot be negative' });
      return;
    }

    const newStructure = db.createFeeStructure({
      department: department.trim(),
      course: course.trim(),
      year: parseInt(year || 1, 10),
      semester: parseInt(semester || 1, 10),
      academic_year: academic_year?.trim() || '2025-2026',
      tuition_fee: tFee,
      exam_fee: eFee,
      library_fee: lFee,
      hostel_fee: hFee,
      other_fee: oFee,
      due_date: due_date.trim(),
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: `Fee structure created with Total Fee of ₹${newStructure.total_fee.toLocaleString()}`,
      feeStructure: newStructure
    });
  } catch (error) {
    console.error('Error creating fee structure:', error);
    res.status(500).json({ success: false, message: 'Server error creating fee structure' });
  }
});

// PUT update fee structure (Admin only)
router.put('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = db.findFeeStructureById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Fee structure not found' });
      return;
    }

    const {
      department,
      course,
      year,
      semester,
      academic_year,
      tuition_fee,
      exam_fee,
      library_fee,
      hostel_fee,
      other_fee,
      due_date,
      status
    } = req.body;

    const updated = db.updateFeeStructure(id, {
      ...(department && { department: department.trim() }),
      ...(course && { course: course.trim() }),
      ...(year && { year: parseInt(year, 10) }),
      ...(semester && { semester: parseInt(semester, 10) }),
      ...(academic_year && { academic_year: academic_year.trim() }),
      ...(tuition_fee !== undefined && { tuition_fee: Math.max(0, parseFloat(tuition_fee)) }),
      ...(exam_fee !== undefined && { exam_fee: Math.max(0, parseFloat(exam_fee)) }),
      ...(library_fee !== undefined && { library_fee: Math.max(0, parseFloat(library_fee)) }),
      ...(hostel_fee !== undefined && { hostel_fee: Math.max(0, parseFloat(hostel_fee)) }),
      ...(other_fee !== undefined && { other_fee: Math.max(0, parseFloat(other_fee)) }),
      ...(due_date && { due_date: due_date.trim() }),
      ...(status && { status })
    });

    res.json({ success: true, message: 'Fee structure updated successfully', feeStructure: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating fee structure' });
  }
});

// DELETE fee structure (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const success = db.deleteFeeStructure(id);
  if (!success) {
    res.status(404).json({ success: false, message: 'Fee structure not found' });
    return;
  }
  res.json({ success: true, message: 'Fee structure deleted successfully' });
});

export default router;
