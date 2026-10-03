import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../auth';

const router = Router();

// GET all departments
router.get('/', (req, res: Response) => {
  const departments = db.getDepartments();
  res.json({ success: true, departments });
});

// POST create department (Admin only)
router.post('/', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { department_name, department_code, description, courses } = req.body;

    if (!department_name || !department_code) {
      res.status(400).json({ success: false, message: 'Department name and code are required' });
      return;
    }

    const existingName = db.getDepartments().find(
      d => d.department_name.toLowerCase() === department_name.trim().toLowerCase() ||
           d.department_code.toLowerCase() === department_code.trim().toLowerCase()
    );

    if (existingName) {
      res.status(400).json({ success: false, message: 'Department with this name or code already exists' });
      return;
    }

    const courseList = Array.isArray(courses) ? courses : (courses ? courses.split(',').map((c: string) => c.trim()) : []);

    const newDept = db.createDepartment({
      department_name: department_name.trim(),
      department_code: department_code.trim().toUpperCase(),
      description: description?.trim() || '',
      courses: courseList,
      status: 'active'
    });

    res.status(201).json({ success: true, message: 'Department created successfully', department: newDept });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ success: false, message: 'Server error creating department' });
  }
});

// PUT update department (Admin only)
router.put('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { department_name, department_code, description, courses, status } = req.body;

    const courseList = Array.isArray(courses) ? courses : (courses ? courses.split(',').map((c: string) => c.trim()) : undefined);

    const updated = db.updateDepartment(id, {
      ...(department_name && { department_name: department_name.trim() }),
      ...(department_code && { department_code: department_code.trim().toUpperCase() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(courseList && { courses: courseList }),
      ...(status && { status })
    });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Department not found' });
      return;
    }

    res.json({ success: true, message: 'Department updated successfully', department: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating department' });
  }
});

// DELETE department (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const success = db.deleteDepartment(id);
  if (!success) {
    res.status(404).json({ success: false, message: 'Department not found' });
    return;
  }
  res.json({ success: true, message: 'Department deleted successfully' });
});

export default router;
