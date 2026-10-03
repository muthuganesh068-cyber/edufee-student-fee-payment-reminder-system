import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../auth';

const router = Router();

// GET all sent reminders (Admin: all, Student: only their own)
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    let reminders = db.getReminders();
    const students = db.getStudents();

    if (req.user?.role === 'student') {
      const student = db.findStudentByUserId(req.user.id) || (req.user.student_id ? db.findStudentByStudentId(req.user.student_id) : null);
      if (!student) {
        res.json({ success: true, count: 0, reminders: [] });
        return;
      }
      reminders = reminders.filter(r => r.student_id === student.student_id);
    }

    const enriched = reminders.map(r => {
      const stu = students.find(s => s.student_id === r.student_id);
      return {
        ...r,
        studentName: stu?.name || 'Unknown',
        studentEmail: stu?.email || '',
        studentPhone: stu?.phone || '',
        department: stu?.department || ''
      };
    });

    res.json({ success: true, count: enriched.length, reminders: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching reminders' });
  }
});

// GET automated candidate list for reminders (categorized into Overdue, Due Today, Upcoming, Partial)
router.get('/candidates', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const studentFees = db.getStudentFees().filter(sf => sf.pending_amount > 0);
    const students = db.getStudents();
    const today = new Date().toISOString().split('T')[0];

    const candidates = studentFees.map(sf => {
      const stu = students.find(s => s.student_id === sf.student_id);
      const structure = db.findFeeStructureById(sf.fee_structure_id);

      const dueDate = new Date(sf.due_date);
      const currDate = new Date(today);
      const diffTime = dueDate.getTime() - currDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let category: 'Overdue' | 'Due Today' | 'Upcoming' | 'Partial Payment' = 'Upcoming';
      if (diffDays < 0) {
        category = 'Overdue';
      } else if (diffDays === 0) {
        category = 'Due Today';
      } else if (sf.paid_amount > 0) {
        category = 'Partial Payment';
      }

      // Default suggested message
      let defaultMessage = '';
      if (category === 'Overdue') {
        defaultMessage = `URGENT NOTICE: Your college fee balance of ₹${sf.pending_amount.toLocaleString()} was due on ${sf.due_date} (${Math.abs(diffDays)} days overdue). Please clear the dues immediately to prevent academic holds.`;
      } else if (category === 'Due Today') {
        defaultMessage = `REMINDER: Today (${sf.due_date}) is the last date to submit your college fee balance of ₹${sf.pending_amount.toLocaleString()}. Please complete the payment today.`;
      } else if (category === 'Partial Payment') {
        defaultMessage = `PARTIAL PAYMENT NOTICE: You have paid ₹${sf.paid_amount.toLocaleString()}. The remaining balance of ₹${sf.pending_amount.toLocaleString()} is due on ${sf.due_date}.`;
      } else {
        defaultMessage = `REMINDER: Your fee payment of ₹${sf.pending_amount.toLocaleString()} is due on ${sf.due_date} (${diffDays} days remaining). Please plan your payment on time.`;
      }

      return {
        student_fee_id: sf.id,
        student_id: sf.student_id,
        studentName: stu?.name || 'Unknown',
        email: stu?.email || '',
        phone: stu?.phone || '',
        department: stu?.department || '',
        course: stu?.course || '',
        total_amount: sf.total_amount,
        paid_amount: sf.paid_amount,
        pending_amount: sf.pending_amount,
        due_date: sf.due_date,
        diffDays,
        category,
        defaultMessage
      };
    });

    res.json({
      success: true,
      candidates,
      counts: {
        total: candidates.length,
        overdue: candidates.filter(c => c.category === 'Overdue').length,
        dueToday: candidates.filter(c => c.category === 'Due Today').length,
        upcoming: candidates.filter(c => c.category === 'Upcoming').length,
        partial: candidates.filter(c => c.category === 'Partial Payment').length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error analyzing reminder candidates' });
  }
});

// POST send single reminder (Admin only)
router.post('/send', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { student_id, student_fee_id, reminder_type, channel, message } = req.body;

    if (!student_id || !student_fee_id || !message) {
      res.status(400).json({ success: false, message: 'Student, fee record, and reminder message are required' });
      return;
    }

    const studentFee = db.findStudentFeeById(parseInt(student_fee_id, 10));
    if (!studentFee) {
      res.status(404).json({ success: false, message: 'Student fee record not found' });
      return;
    }

    const reminder = db.createReminder({
      student_id: student_id.trim().toUpperCase(),
      student_fee_id: studentFee.id,
      reminder_type: reminder_type || 'Upcoming',
      channel: channel || 'In-App',
      message: message.trim(),
      pending_amount: studentFee.pending_amount,
      due_date: studentFee.due_date,
      status: 'SENT'
    });

    res.status(201).json({
      success: true,
      message: `Reminder sent to student ${student_id} via ${reminder.channel}`,
      reminder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error dispatching reminder' });
  }
});

// POST bulk send reminders (e.g. to all OVERDUE or all DUE TODAY)
router.post('/send-bulk', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { target_category, channel } = req.body; // 'overdue' | 'dueToday' | 'upcoming' | 'all'

    const studentFees = db.getStudentFees().filter(sf => sf.pending_amount > 0);
    const today = new Date().toISOString().split('T')[0];
    let sentCount = 0;

    for (const sf of studentFees) {
      const isOverdue = sf.due_date < today;
      const isDueToday = sf.due_date === today;
      const isUpcoming = sf.due_date > today;

      let shouldSend = false;
      let reminderType: 'Overdue' | 'Due Today' | 'Upcoming' | 'Partial Payment' = 'Upcoming';

      if (target_category === 'overdue' && isOverdue) {
        shouldSend = true;
        reminderType = 'Overdue';
      } else if (target_category === 'dueToday' && isDueToday) {
        shouldSend = true;
        reminderType = 'Due Today';
      } else if (target_category === 'upcoming' && isUpcoming) {
        shouldSend = true;
        reminderType = 'Upcoming';
      } else if (target_category === 'all') {
        shouldSend = true;
        reminderType = isOverdue ? 'Overdue' : (isDueToday ? 'Due Today' : 'Upcoming');
      }

      if (shouldSend) {
        const msg = reminderType === 'Overdue'
          ? `URGENT FEE OVERDUE NOTICE: Your fee balance of ₹${sf.pending_amount.toLocaleString()} was due on ${sf.due_date}. Please clear your balance immediately.`
          : reminderType === 'Due Today'
          ? `FINAL NOTICE: Today is the due date for your fee balance of ₹${sf.pending_amount.toLocaleString()}. Please submit fee before close of banking hours.`
          : `REMINDER: Your college fee balance of ₹${sf.pending_amount.toLocaleString()} is due on ${sf.due_date}.`;

        db.createReminder({
          student_id: sf.student_id,
          student_fee_id: sf.id,
          reminder_type: reminderType,
          channel: channel || 'In-App',
          message: msg,
          pending_amount: sf.pending_amount,
          due_date: sf.due_date,
          status: 'SENT'
        });
        sentCount++;
      }
    }

    res.json({
      success: true,
      message: `Successfully dispatched ${sentCount} reminders via ${channel || 'In-App'}.`,
      sentCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during bulk reminder dispatch' });
  }
});

export default router;
