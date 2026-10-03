import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string; // bcrypt hash
  role: 'admin' | 'student';
  phone?: string;
  createdAt: string;
}

export interface Department {
  id: number;
  department_name: string;
  department_code: string;
  description?: string;
  courses: string[];
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Student {
  id: number;
  student_id: string; // e.g. STU2026001
  user_id?: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  course: string;
  year: number;
  semester: number;
  academic_year: string;
  admission_date: string;
  status: 'active' | 'inactive' | 'graduated';
  created_at: string;
}

export interface FeeStructure {
  id: number;
  department: string;
  course: string;
  year: number;
  semester: number;
  academic_year: string;
  tuition_fee: number;
  exam_fee: number;
  library_fee: number;
  hostel_fee: number;
  other_fee: number;
  total_fee: number;
  due_date: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export type FeePaymentStatus = 'PAID' | 'PARTIALLY PAID' | 'PENDING' | 'OVERDUE';

export interface StudentFee {
  id: number;
  student_id: string;
  fee_structure_id: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  due_date: string;
  status: FeePaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  receipt_no: string;
  student_fee_id: number;
  student_id: string;
  amount: number;
  payment_method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other';
  transaction_id?: string;
  payment_date: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  remarks?: string;
  recorded_by: string;
  created_at: string;
}

export interface Reminder {
  id: number;
  student_id: string;
  student_fee_id: number;
  reminder_type: 'Upcoming' | 'Due Today' | 'Overdue' | 'Partial Payment' | 'Custom';
  channel: 'In-App' | 'Email' | 'SMS';
  message: string;
  pending_amount: number;
  due_date: string;
  status: 'SENT' | 'PENDING' | 'FAILED';
  sent_date: string;
}

export interface Notification {
  id: number;
  user_id?: number;
  student_id?: string;
  title: string;
  message: string;
  type: 'reminder' | 'payment' | 'due_date' | 'system';
  is_read: boolean;
  created_at: string;
}

interface DatabaseSchema {
  users: User[];
  departments: Department[];
  students: Student[];
  feeStructures: FeeStructure[];
  studentFees: StudentFee[];
  payments: Payment[];
  reminders: Reminder[];
  notifications: Notification[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

// Helper to determine status dynamically based on current date
export function computeFeeStatus(paid: number, total: number, dueDateStr: string): FeePaymentStatus {
  if (paid >= total && total > 0) {
    return 'PAID';
  }
  const today = new Date().toISOString().split('T')[0];
  if (dueDateStr < today && (total - paid) > 0) {
    return 'OVERDUE';
  }
  if (paid > 0 && paid < total) {
    return 'PARTIALLY PAID';
  }
  return 'PENDING';
}

function getInitialDatabase(): DatabaseSchema {
  const adminHashed = bcrypt.hashSync('admin123', 10);
  const studentHashed = bcrypt.hashSync('password123', 10);

  const users: User[] = [
    {
      id: 1,
      name: 'System Administrator',
      email: 'admin@example.com',
      password: adminHashed,
      role: 'admin',
      phone: '9876543210',
      createdAt: '2026-08-01T09:00:00.000Z'
    },
    {
      id: 2,
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      password: studentHashed,
      role: 'student',
      phone: '9876500001',
      createdAt: '2026-08-10T10:00:00.000Z'
    },
    {
      id: 3,
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      password: studentHashed,
      role: 'student',
      phone: '9876500002',
      createdAt: '2026-08-14T10:00:00.000Z'
    },
    {
      id: 4,
      name: 'Rohan Verma',
      email: 'rohan.verma@example.com',
      password: studentHashed,
      role: 'student',
      phone: '9876500003',
      createdAt: '2026-08-20T10:00:00.000Z'
    },
    {
      id: 5,
      name: 'Ananya Iyer',
      email: 'ananya.iyer@example.com',
      password: studentHashed,
      role: 'student',
      phone: '9876500004',
      createdAt: '2026-08-22T10:00:00.000Z'
    },
    {
      id: 6,
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      password: studentHashed,
      role: 'student',
      phone: '9876500005',
      createdAt: '2026-08-25T10:00:00.000Z'
    }
  ];

  const departments: Department[] = [
    {
      id: 1,
      department_name: 'Computer Science & Engineering',
      department_code: 'CSE',
      description: 'Department of Computer Science and Engineering with AI & Software Labs.',
      courses: ['B.Tech CSE', 'M.Tech CSE', 'B.Sc Computer Science'],
      status: 'active',
      created_at: '2026-08-01'
    },
    {
      id: 2,
      department_name: 'Information Technology',
      department_code: 'IT',
      description: 'Department of Information Technology specializing in web, cloud, and security.',
      courses: ['B.Tech IT', 'BCA', 'MCA'],
      status: 'active',
      created_at: '2026-08-01'
    },
    {
      id: 3,
      department_name: 'Electronics & Communication',
      department_code: 'ECE',
      description: 'Department of ECE focusing on embedded systems, IoT, and telecom.',
      courses: ['B.Tech ECE', 'M.Tech VLSI'],
      status: 'active',
      created_at: '2026-08-01'
    },
    {
      id: 4,
      department_name: 'Mechanical Engineering',
      department_code: 'MECH',
      description: 'Department of Mechanical Engineering with robotics and automation.',
      courses: ['B.Tech Mechanical'],
      status: 'active',
      created_at: '2026-08-01'
    },
    {
      id: 5,
      department_name: 'Management Studies',
      department_code: 'MBA',
      description: 'Department of Business Administration & Management.',
      courses: ['BBA', 'MBA'],
      status: 'active',
      created_at: '2026-08-01'
    }
  ];

  const students: Student[] = [
    {
      id: 1,
      student_id: 'STU2026001',
      user_id: 2,
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '9876500001',
      department: 'Computer Science & Engineering',
      course: 'B.Tech CSE',
      year: 3,
      semester: 5,
      academic_year: '2025-2026',
      admission_date: '2023-08-10',
      status: 'active',
      created_at: '2026-08-10'
    },
    {
      id: 2,
      student_id: 'STU2026002',
      user_id: 3,
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      phone: '9876500002',
      department: 'Information Technology',
      course: 'B.Tech IT',
      year: 2,
      semester: 3,
      academic_year: '2025-2026',
      admission_date: '2024-08-14',
      status: 'active',
      created_at: '2026-08-14'
    },
    {
      id: 3,
      student_id: 'STU2026003',
      user_id: 4,
      name: 'Rohan Verma',
      email: 'rohan.verma@example.com',
      phone: '9876500003',
      department: 'Electronics & Communication',
      course: 'B.Tech ECE',
      year: 4,
      semester: 7,
      academic_year: '2025-2026',
      admission_date: '2022-08-20',
      status: 'active',
      created_at: '2026-08-20'
    },
    {
      id: 4,
      student_id: 'STU2026004',
      user_id: 5,
      name: 'Ananya Iyer',
      email: 'ananya.iyer@example.com',
      phone: '9876500004',
      department: 'Computer Science & Engineering',
      course: 'B.Tech CSE',
      year: 1,
      semester: 1,
      academic_year: '2025-2026',
      admission_date: '2025-08-12',
      status: 'active',
      created_at: '2026-08-22'
    },
    {
      id: 5,
      student_id: 'STU2026005',
      user_id: 6,
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '9876500005',
      department: 'Management Studies',
      course: 'MBA',
      year: 1,
      semester: 2,
      academic_year: '2025-2026',
      admission_date: '2025-08-15',
      status: 'active',
      created_at: '2026-08-25'
    }
  ];

  const feeStructures: FeeStructure[] = [
    {
      id: 1,
      department: 'Computer Science & Engineering',
      course: 'B.Tech CSE',
      year: 3,
      semester: 5,
      academic_year: '2025-2026',
      tuition_fee: 45000,
      exam_fee: 2500,
      library_fee: 1500,
      hostel_fee: 18000,
      other_fee: 3000,
      total_fee: 70000,
      due_date: '2026-10-15',
      status: 'active',
      created_at: '2026-08-01'
    },
    {
      id: 2,
      department: 'Information Technology',
      course: 'B.Tech IT',
      year: 2,
      semester: 3,
      academic_year: '2025-2026',
      tuition_fee: 42000,
      exam_fee: 2500,
      library_fee: 1500,
      hostel_fee: 16000,
      other_fee: 3000,
      total_fee: 65000,
      due_date: '2026-10-25',
      status: 'active',
      created_at: '2026-08-01'
    },
    {
      id: 3,
      department: 'Electronics & Communication',
      course: 'B.Tech ECE',
      year: 4,
      semester: 7,
      academic_year: '2025-2026',
      tuition_fee: 40000,
      exam_fee: 3000,
      library_fee: 1500,
      hostel_fee: 0,
      other_fee: 3500,
      total_fee: 48000,
      due_date: '2026-09-15', // Past date -> OVERDUE
      status: 'active',
      created_at: '2026-08-01'
    },
    {
      id: 4,
      department: 'Computer Science & Engineering',
      course: 'B.Tech CSE',
      year: 1,
      semester: 1,
      academic_year: '2025-2026',
      tuition_fee: 50000,
      exam_fee: 2500,
      library_fee: 2000,
      hostel_fee: 18000,
      other_fee: 5000,
      total_fee: 77500,
      due_date: '2026-11-30', // Future date -> PENDING
      status: 'active',
      created_at: '2026-08-01'
    },
    {
      id: 5,
      department: 'Management Studies',
      course: 'MBA',
      year: 1,
      semester: 2,
      academic_year: '2025-2026',
      tuition_fee: 60000,
      exam_fee: 3000,
      library_fee: 2500,
      hostel_fee: 20000,
      other_fee: 4500,
      total_fee: 90000,
      due_date: '2026-10-03', // Today's date -> DUE TODAY
      status: 'active',
      created_at: '2026-08-01'
    }
  ];

  const studentFees: StudentFee[] = [
    {
      id: 1,
      student_id: 'STU2026001',
      fee_structure_id: 1,
      total_amount: 70000,
      paid_amount: 70000,
      pending_amount: 0,
      due_date: '2026-10-15',
      status: 'PAID',
      created_at: '2026-08-15',
      updated_at: '2026-09-28'
    },
    {
      id: 2,
      student_id: 'STU2026002',
      fee_structure_id: 2,
      total_amount: 65000,
      paid_amount: 35000,
      pending_amount: 30000,
      due_date: '2026-10-25',
      status: 'PARTIALLY PAID',
      created_at: '2026-08-15',
      updated_at: '2026-09-25'
    },
    {
      id: 3,
      student_id: 'STU2026003',
      fee_structure_id: 3,
      total_amount: 48000,
      paid_amount: 0,
      pending_amount: 48000,
      due_date: '2026-09-15',
      status: 'OVERDUE',
      created_at: '2026-08-15',
      updated_at: '2026-09-15'
    },
    {
      id: 4,
      student_id: 'STU2026004',
      fee_structure_id: 4,
      total_amount: 77500,
      paid_amount: 0,
      pending_amount: 77500,
      due_date: '2026-11-30',
      status: 'PENDING',
      created_at: '2026-08-25',
      updated_at: '2026-08-25'
    },
    {
      id: 5,
      student_id: 'STU2026005',
      fee_structure_id: 5,
      total_amount: 90000,
      paid_amount: 40000,
      pending_amount: 50000,
      due_date: '2026-10-03',
      status: 'PARTIALLY PAID',
      created_at: '2026-08-25',
      updated_at: '2026-09-20'
    }
  ];

  const payments: Payment[] = [
    {
      id: 1,
      receipt_no: 'REC-2026-0001',
      student_fee_id: 1,
      student_id: 'STU2026001',
      amount: 40000,
      payment_method: 'UPI',
      transaction_id: 'UPI/2026/8947219',
      payment_date: '2026-09-10',
      status: 'SUCCESS',
      remarks: 'First installment - Tuition fee',
      recorded_by: 'System Administrator',
      created_at: '2026-09-10T11:30:00.000Z'
    },
    {
      id: 2,
      receipt_no: 'REC-2026-0002',
      student_fee_id: 1,
      student_id: 'STU2026001',
      amount: 30000,
      payment_method: 'Bank Transfer',
      transaction_id: 'NEFT-AXIS-992104',
      payment_date: '2026-09-28',
      status: 'SUCCESS',
      remarks: 'Final balance clearance',
      recorded_by: 'System Administrator',
      created_at: '2026-09-28T14:15:00.000Z'
    },
    {
      id: 3,
      receipt_no: 'REC-2026-0003',
      student_fee_id: 2,
      student_id: 'STU2026002',
      amount: 35000,
      payment_method: 'UPI',
      transaction_id: 'UPI/2026/1129482',
      payment_date: '2026-09-25',
      status: 'SUCCESS',
      remarks: 'Partial fee installment',
      recorded_by: 'System Administrator',
      created_at: '2026-09-25T10:00:00.000Z'
    },
    {
      id: 4,
      receipt_no: 'REC-2026-0004',
      student_fee_id: 5,
      student_id: 'STU2026005',
      amount: 40000,
      payment_method: 'Card',
      transaction_id: 'POS-HDFC-582910',
      payment_date: '2026-09-20',
      status: 'SUCCESS',
      remarks: 'Term 1 payment',
      recorded_by: 'System Administrator',
      created_at: '2026-09-20T16:45:00.000Z'
    }
  ];

  const reminders: Reminder[] = [
    {
      id: 1,
      student_id: 'STU2026003',
      student_fee_id: 3,
      reminder_type: 'Overdue',
      channel: 'In-App',
      message: 'URGENT: Your fee payment of ₹48,000 for B.Tech ECE Semester 7 was due on 2026-09-15. Please clear your dues immediately to prevent exam hall-ticket holds.',
      pending_amount: 48000,
      due_date: '2026-09-15',
      status: 'SENT',
      sent_date: '2026-09-18 10:30:00'
    },
    {
      id: 2,
      student_id: 'STU2026005',
      student_fee_id: 5,
      reminder_type: 'Due Today',
      channel: 'In-App',
      message: 'REMINDER: Today is the due date for your remaining MBA fee balance of ₹50,000. Please complete the payment today.',
      pending_amount: 50000,
      due_date: '2026-10-03',
      status: 'SENT',
      sent_date: '2026-10-03 09:00:00'
    },
    {
      id: 3,
      student_id: 'STU2026002',
      student_fee_id: 2,
      reminder_type: 'Upcoming',
      channel: 'In-App',
      message: 'Friendly reminder: Your upcoming fee installment of ₹30,000 is due on 2026-10-25. You can pay online or at the accounts office.',
      pending_amount: 30000,
      due_date: '2026-10-25',
      status: 'SENT',
      sent_date: '2026-10-01 14:15:00'
    }
  ];

  const notifications: Notification[] = [
    {
      id: 1,
      user_id: 2,
      student_id: 'STU2026001',
      title: 'Payment Receipt Generated',
      message: 'Payment of ₹30,000 has been recorded. Your full fee for Semester 5 is PAID. Receipt: REC-2026-0002',
      type: 'payment',
      is_read: true,
      created_at: '2026-09-28 12:00:00'
    },
    {
      id: 2,
      user_id: 3,
      student_id: 'STU2026002',
      title: 'Upcoming Fee Due Date',
      message: 'Your remaining fee balance of ₹30,000 is due on 25 Oct 2026.',
      type: 'due_date',
      is_read: false,
      created_at: '2026-10-01 14:15:00'
    },
    {
      id: 3,
      user_id: 4,
      student_id: 'STU2026003',
      title: 'Fee Payment Overdue Alert',
      message: 'Your fee of ₹48,000 was due on 15 Sep 2026 and is currently OVERDUE. Please contact the college accounts desk.',
      type: 'reminder',
      is_read: false,
      created_at: '2026-09-18 10:30:00'
    },
    {
      id: 4,
      user_id: 6,
      student_id: 'STU2026005',
      title: 'Fee Due Today Alert',
      message: 'Your MBA Semester 2 fee balance of ₹50,000 is due today (03 Oct 2026).',
      type: 'due_date',
      is_read: false,
      created_at: '2026-10-03 09:00:00'
    }
  ];

  return {
    users,
    departments,
    students,
    feeStructures,
    studentFees,
    payments,
    reminders,
    notifications
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
    this.refreshStatuses();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.users && parsed.students && parsed.studentFees) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading database file, initializing defaults:', e);
    }

    const initial = getInitialDatabase();
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error persisting database:', e);
    }
  }

  public save() {
    this.persist();
  }

  public resetToDefaults(): DatabaseSchema {
    this.data = getInitialDatabase();
    this.persist();
    return this.data;
  }

  // Refresh status on date basis (e.g. mark pending overdue if past date)
  public refreshStatuses() {
    let changed = false;
    for (const sf of this.data.studentFees) {
      const computed = computeFeeStatus(sf.paid_amount, sf.total_amount, sf.due_date);
      if (sf.status !== computed) {
        sf.status = computed;
        changed = true;
      }
    }
    if (changed) {
      this.save();
    }
  }

  // Users
  public getUsers() { return this.data.users; }
  public findUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  public findUserById(id: number) {
    return this.data.users.find(u => u.id === id);
  }
  public createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const nextId = this.data.users.length ? Math.max(...this.data.users.map(u => u.id)) + 1 : 1;
    const newUser: User = {
      ...user,
      id: nextId,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }
  public updateUserPassword(userId: number, newHash: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;
    user.password = newHash;
    this.save();
    return true;
  }

  // Departments
  public getDepartments() { return this.data.departments; }
  public findDepartmentById(id: number) { return this.data.departments.find(d => d.id === id); }
  public createDepartment(dept: Omit<Department, 'id' | 'created_at'>): Department {
    const nextId = this.data.departments.length ? Math.max(...this.data.departments.map(d => d.id)) + 1 : 1;
    const newDept: Department = {
      ...dept,
      id: nextId,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.data.departments.push(newDept);
    this.save();
    return newDept;
  }
  public updateDepartment(id: number, updates: Partial<Department>): Department | null {
    const dept = this.findDepartmentById(id);
    if (!dept) return null;
    Object.assign(dept, updates);
    this.save();
    return dept;
  }
  public deleteDepartment(id: number): boolean {
    const idx = this.data.departments.findIndex(d => d.id === id);
    if (idx === -1) return false;
    this.data.departments.splice(idx, 1);
    this.save();
    return true;
  }

  // Students
  public getStudents() { return this.data.students; }
  public findStudentById(id: number) { return this.data.students.find(s => s.id === id); }
  public findStudentByStudentId(studentId: string) {
    return this.data.students.find(s => s.student_id.toUpperCase() === studentId.trim().toUpperCase());
  }
  public findStudentByUserId(userId: number) {
    return this.data.students.find(s => s.user_id === userId);
  }
  public createStudent(studentData: Omit<Student, 'id' | 'created_at'>): Student {
    const nextId = this.data.students.length ? Math.max(...this.data.students.map(s => s.id)) + 1 : 1;
    const newStudent: Student = {
      ...studentData,
      id: nextId,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.data.students.push(newStudent);
    this.save();
    return newStudent;
  }
  public updateStudent(id: number, updates: Partial<Student>): Student | null {
    const student = this.findStudentById(id);
    if (!student) return null;
    Object.assign(student, updates);
    this.save();
    return student;
  }
  public deleteStudent(id: number): boolean {
    const student = this.findStudentById(id);
    if (!student) return false;

    // Delete associated fees, payments, reminders
    this.data.studentFees = this.data.studentFees.filter(sf => sf.student_id !== student.student_id);
    this.data.payments = this.data.payments.filter(p => p.student_id !== student.student_id);
    this.data.reminders = this.data.reminders.filter(r => r.student_id !== student.student_id);
    if (student.user_id) {
      this.data.users = this.data.users.filter(u => u.id !== student.user_id);
    }
    this.data.students = this.data.students.filter(s => s.id !== id);
    this.save();
    return true;
  }

  // Fee Structures
  public getFeeStructures() { return this.data.feeStructures; }
  public findFeeStructureById(id: number) { return this.data.feeStructures.find(f => f.id === id); }
  public createFeeStructure(feeData: Omit<FeeStructure, 'id' | 'total_fee' | 'created_at'>): FeeStructure {
    const nextId = this.data.feeStructures.length ? Math.max(...this.data.feeStructures.map(f => f.id)) + 1 : 1;
    const total_fee = Number(feeData.tuition_fee) +
                      Number(feeData.exam_fee) +
                      Number(feeData.library_fee) +
                      Number(feeData.hostel_fee) +
                      Number(feeData.other_fee);
    const newStructure: FeeStructure = {
      ...feeData,
      id: nextId,
      total_fee,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.data.feeStructures.push(newStructure);
    this.save();
    return newStructure;
  }
  public updateFeeStructure(id: number, updates: Partial<FeeStructure>): FeeStructure | null {
    const fs = this.findFeeStructureById(id);
    if (!fs) return null;
    Object.assign(fs, updates);
    fs.total_fee = Number(fs.tuition_fee) +
                   Number(fs.exam_fee) +
                   Number(fs.library_fee) +
                   Number(fs.hostel_fee) +
                   Number(fs.other_fee);
    this.save();
    return fs;
  }
  public deleteFeeStructure(id: number): boolean {
    const idx = this.data.feeStructures.findIndex(f => f.id === id);
    if (idx === -1) return false;
    this.data.feeStructures.splice(idx, 1);
    this.save();
    return true;
  }

  // Student Fees
  public getStudentFees() {
    this.refreshStatuses();
    return this.data.studentFees;
  }
  public findStudentFeeById(id: number) {
    this.refreshStatuses();
    return this.data.studentFees.find(sf => sf.id === id);
  }
  public findStudentFeesByStudentId(studentId: string) {
    this.refreshStatuses();
    return this.data.studentFees.filter(sf => sf.student_id.toUpperCase() === studentId.trim().toUpperCase());
  }
  public assignFeeToStudent(studentId: string, feeStructureId: number): StudentFee {
    const structure = this.findFeeStructureById(feeStructureId);
    if (!structure) throw new Error('Fee structure not found');

    const nextId = this.data.studentFees.length ? Math.max(...this.data.studentFees.map(sf => sf.id)) + 1 : 1;
    const newStudentFee: StudentFee = {
      id: nextId,
      student_id: studentId,
      fee_structure_id: feeStructureId,
      total_amount: structure.total_fee,
      paid_amount: 0,
      pending_amount: structure.total_fee,
      due_date: structure.due_date,
      status: computeFeeStatus(0, structure.total_fee, structure.due_date),
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0]
    };
    this.data.studentFees.push(newStudentFee);
    this.save();
    return newStudentFee;
  }

  // Payments
  public getPayments() { return this.data.payments; }
  public findPaymentById(id: number) { return this.data.payments.find(p => p.id === id); }
  public findPaymentByReceiptNo(receiptNo: string) { return this.data.payments.find(p => p.receipt_no === receiptNo); }
  public recordPayment(params: {
    student_fee_id: number;
    amount: number;
    payment_method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other';
    transaction_id?: string;
    payment_date: string;
    remarks?: string;
    recorded_by: string;
  }): { payment: Payment; studentFee: StudentFee; receiptNo: string } {
    const studentFee = this.findStudentFeeById(params.student_fee_id);
    if (!studentFee) throw new Error('Student fee record not found');

    if (params.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }
    if (params.amount > studentFee.pending_amount) {
      throw new Error(`Payment amount (₹${params.amount}) exceeds pending balance (₹${studentFee.pending_amount})`);
    }

    const nextPayId = this.data.payments.length ? Math.max(...this.data.payments.map(p => p.id)) + 1 : 1;
    const year = new Date().getFullYear();
    const receiptNo = `REC-${year}-${String(nextPayId).padStart(4, '0')}`;

    const newPayment: Payment = {
      id: nextPayId,
      receipt_no: receiptNo,
      student_fee_id: studentFee.id,
      student_id: studentFee.student_id,
      amount: params.amount,
      payment_method: params.payment_method,
      transaction_id: params.transaction_id || `TXN-${Date.now()}`,
      payment_date: params.payment_date || new Date().toISOString().split('T')[0],
      status: 'SUCCESS',
      remarks: params.remarks || '',
      recorded_by: params.recorded_by,
      created_at: new Date().toISOString()
    };

    // Update student fee balance
    studentFee.paid_amount += params.amount;
    studentFee.pending_amount = Math.max(0, studentFee.total_amount - studentFee.paid_amount);
    studentFee.status = computeFeeStatus(studentFee.paid_amount, studentFee.total_amount, studentFee.due_date);
    studentFee.updated_at = new Date().toISOString().split('T')[0];

    this.data.payments.unshift(newPayment);

    // Create In-App Notification for Student
    const student = this.findStudentByStudentId(studentFee.student_id);
    if (student && student.user_id) {
      this.createNotification({
        user_id: student.user_id,
        student_id: student.student_id,
        title: 'Fee Payment Received',
        message: `₹${params.amount.toLocaleString()} received via ${params.payment_method}. Remaining balance: ₹${studentFee.pending_amount.toLocaleString()}. Receipt No: ${receiptNo}.`,
        type: 'payment',
        is_read: false
      });
    }

    this.save();
    return { payment: newPayment, studentFee, receiptNo };
  }

  // Reminders
  public getReminders() { return this.data.reminders; }
  public createReminder(reminder: Omit<Reminder, 'id' | 'sent_date'>): Reminder {
    const nextId = this.data.reminders.length ? Math.max(...this.data.reminders.map(r => r.id)) + 1 : 1;
    const newReminder: Reminder = {
      ...reminder,
      id: nextId,
      sent_date: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.data.reminders.unshift(newReminder);

    // Also push an in-app notification to the student
    const student = this.findStudentByStudentId(reminder.student_id);
    if (student && student.user_id) {
      this.createNotification({
        user_id: student.user_id,
        student_id: student.student_id,
        title: `Payment Reminder: ${reminder.reminder_type}`,
        message: reminder.message,
        type: 'reminder',
        is_read: false
      });
    }

    this.save();
    return newReminder;
  }

  // Notifications
  public getNotifications(userId?: number, studentId?: string) {
    if (userId) {
      return this.data.notifications.filter(n => n.user_id === userId);
    }
    if (studentId) {
      return this.data.notifications.filter(n => n.student_id === studentId);
    }
    return this.data.notifications;
  }
  public createNotification(notif: Omit<Notification, 'id' | 'created_at'>): Notification {
    const nextId = this.data.notifications.length ? Math.max(...this.data.notifications.map(n => n.id)) + 1 : 1;
    const newNotif: Notification = {
      ...notif,
      id: nextId,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }
  public markNotificationAsRead(id: number): boolean {
    const notif = this.data.notifications.find(n => n.id === id);
    if (!notif) return false;
    notif.is_read = true;
    this.save();
    return true;
  }
  public markAllNotificationsAsRead(userId?: number) {
    for (const notif of this.data.notifications) {
      if (!userId || notif.user_id === userId) {
        notif.is_read = true;
      }
    }
    this.save();
  }

  // Analytics & Dashboard Stats
  public getDashboardStats() {
    this.refreshStatuses();
    const students = this.data.students;
    const studentFees = this.data.studentFees;
    const payments = this.data.payments;

    const totalStudents = students.filter(s => s.status === 'active').length;
    const totalFeeAmount = studentFees.reduce((acc, sf) => acc + sf.total_amount, 0);
    const totalCollected = studentFees.reduce((acc, sf) => acc + sf.paid_amount, 0);
    const totalPending = studentFees.reduce((acc, sf) => acc + sf.pending_amount, 0);

    const overdueFees = studentFees
      .filter(sf => sf.status === 'OVERDUE')
      .reduce((acc, sf) => acc + sf.pending_amount, 0);

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const paymentsThisMonth = payments
      .filter(p => p.payment_date.startsWith(currentMonthPrefix) && p.status === 'SUCCESS')
      .reduce((acc, p) => acc + p.amount, 0);

    // Status counts
    const statusCounts = {
      PAID: studentFees.filter(sf => sf.status === 'PAID').length,
      PARTIALLY_PAID: studentFees.filter(sf => sf.status === 'PARTIALLY PAID').length,
      PENDING: studentFees.filter(sf => sf.status === 'PENDING').length,
      OVERDUE: studentFees.filter(sf => sf.status === 'OVERDUE').length,
    };

    // Department-wise collection
    const deptMap: { [key: string]: { total: number; collected: number; pending: number; count: number } } = {};
    for (const s of students) {
      if (!deptMap[s.department]) {
        deptMap[s.department] = { total: 0, collected: 0, pending: 0, count: 0 };
      }
      deptMap[s.department].count += 1;
      const sFees = studentFees.filter(sf => sf.student_id === s.student_id);
      for (const sf of sFees) {
        deptMap[s.department].total += sf.total_amount;
        deptMap[s.department].collected += sf.paid_amount;
        deptMap[s.department].pending += sf.pending_amount;
      }
    }

    const departmentStats = Object.keys(deptMap).map(dept => ({
      department: dept,
      ...deptMap[dept]
    }));

    // Monthly collection trend (last 6 months)
    const monthlyTrend: { [key: string]: number } = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyTrend[key] = 0;
    }
    for (const p of payments) {
      const monthKey = p.payment_date.substring(0, 7);
      if (monthlyTrend[monthKey] !== undefined) {
        monthlyTrend[monthKey] += p.amount;
      }
    }

    const monthlyStats = Object.keys(monthlyTrend).map(month => ({
      month,
      amount: monthlyTrend[month]
    }));

    // Recent payments (top 5) with student name
    const recentPayments = payments.slice(0, 8).map(p => {
      const stu = students.find(s => s.student_id === p.student_id);
      return {
        ...p,
        student_name: stu ? stu.name : 'Unknown Student',
        department: stu ? stu.department : 'General'
      };
    });

    return {
      totalStudents,
      totalFeeAmount,
      totalCollected,
      totalPending,
      overdueFees,
      paymentsThisMonth,
      statusCounts,
      departmentStats,
      monthlyStats,
      recentPayments
    };
  }
}

export const db = new Database();
