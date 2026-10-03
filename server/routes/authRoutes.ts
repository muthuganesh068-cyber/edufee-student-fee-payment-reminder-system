import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { generateToken, authenticateToken, AuthRequest } from '../auth';

const router = Router();

// Login for Admin or Student
router.post('/login', async (req, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ success: false, message: 'Please provide Email/Student ID and Password' });
      return;
    }

    let user = db.findUserByEmail(identifier.trim());
    let student = null;

    // If not found by email, check if it's a student ID
    if (!user) {
      student = db.findStudentByStudentId(identifier.trim());
      if (student && student.user_id) {
        user = db.findUserById(student.user_id);
      }
    } else if (user.role === 'student') {
      student = db.findStudentByUserId(user.id);
    }

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    // Verify bcrypt password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
      return;
    }

    const token = generateToken(user, student ? student.student_id : undefined);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        student_id: student ? student.student_id : undefined,
        department: student ? student.department : undefined,
        course: student ? student.course : undefined
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const user = db.findUserById(req.user.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  let student = null;
  if (user.role === 'student') {
    student = db.findStudentByUserId(user.id) || (req.user.student_id ? db.findStudentByStudentId(req.user.student_id) : null);
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      student_id: student?.student_id,
      studentDetails: student || null
    }
  });
});

// Change Password
router.post('/change-password', authenticateToken, (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const user = db.findUserById(req.user.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const isCurrentValid = bcrypt.compareSync(currentPassword, user.password);
  if (!isCurrentValid) {
    res.status(400).json({ success: false, message: 'Current password does not match' });
    return;
  }

  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    return;
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.updateUserPassword(user.id, newHash);

  res.json({ success: true, message: 'Password updated successfully' });
});

// Reset database to default demo state
router.post('/reset-demo', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Only admin can reset demo data' });
    return;
  }
  db.resetToDefaults();
  res.json({ success: true, message: 'Database reset to initial demo state successfully' });
});

export default router;
