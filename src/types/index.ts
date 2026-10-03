export type Role = 'admin' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  student_id?: string;
  department?: string;
  course?: string;
  studentDetails?: Student;
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
  student_id: string;
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
  totalAmount?: number;
  paidAmount?: number;
  pendingAmount?: number;
  paymentStatus?: string;
  earliestDue?: string;
  assignedFeesCount?: number;
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
  studentName?: string;
  department?: string;
  course?: string;
  semester?: number;
  feeStructure?: FeeStructure;
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
  studentName?: string;
  studentEmail?: string;
  department?: string;
  course?: string;
  semester?: number;
  feeTotal?: number;
  feePending?: number;
  feeStructureName?: string;
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
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  department?: string;
}

export interface ReminderCandidate {
  student_fee_id: number;
  student_id: string;
  studentName: string;
  email: string;
  phone: string;
  department: string;
  course: string;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  due_date: string;
  diffDays: number;
  category: 'Overdue' | 'Due Today' | 'Upcoming' | 'Partial Payment';
  defaultMessage: string;
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

export interface DashboardStats {
  totalStudents: number;
  totalFeeAmount: number;
  totalCollected: number;
  totalPending: number;
  overdueFees: number;
  paymentsThisMonth: number;
  statusCounts: {
    PAID: number;
    PARTIALLY_PAID: number;
    PENDING: number;
    OVERDUE: number;
  };
  departmentStats: Array<{
    department: string;
    total: number;
    collected: number;
    pending: number;
    count: number;
  }>;
  monthlyStats: Array<{
    month: string;
    amount: number;
  }>;
  recentPayments: Array<Payment & { student_name: string; department: string }>;
}
