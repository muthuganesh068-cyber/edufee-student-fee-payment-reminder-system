import {
  User,
  Department,
  Student,
  FeeStructure,
  StudentFee,
  Payment,
  Reminder,
  ReminderCandidate,
  Notification,
  DashboardStats
} from '../types';

const TOKEN_KEY = 'edufee_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed with status ' + response.status);
  }

  return data;
}

export const api = {
  // Auth
  async login(identifier: string, password: string): Promise<{ success: boolean; token: string; user: User; message: string }> {
    const res = await request<{ success: boolean; token: string; user: User; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    return request<{ success: boolean; user: User }>('/api/auth/me');
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    return request('/api/auth/reset-demo', { method: 'POST' });
  },

  // Departments
  async getDepartments(): Promise<{ success: boolean; departments: Department[] }> {
    return request('/api/departments');
  },

  async createDepartment(data: Partial<Department>): Promise<{ success: boolean; department: Department; message: string }> {
    return request('/api/departments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateDepartment(id: number, data: Partial<Department>): Promise<{ success: boolean; department: Department }> {
    return request(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteDepartment(id: number): Promise<{ success: boolean; message: string }> {
    return request(`/api/departments/${id}`, { method: 'DELETE' });
  },

  // Students
  async getStudents(params?: { search?: string; department?: string; status?: string; year?: string; semester?: string }): Promise<{ success: boolean; students: Student[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.department) query.append('department', params.department);
    if (params?.status) query.append('status', params.status);
    if (params?.year) query.append('year', params.year);
    if (params?.semester) query.append('semester', params.semester);
    return request(`/api/students?${query.toString()}`);
  },

  async getStudentById(id: string | number): Promise<{ success: boolean; student: any }> {
    return request(`/api/students/${id}`);
  },

  async createStudent(data: any): Promise<{ success: boolean; message: string; student: Student }> {
    return request('/api/students', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateStudent(id: number, data: Partial<Student>): Promise<{ success: boolean; student: Student; message: string }> {
    return request(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteStudent(id: number): Promise<{ success: boolean; message: string }> {
    return request(`/api/students/${id}`, { method: 'DELETE' });
  },

  // Fee Structures
  async getFeeStructures(params?: { department?: string; course?: string; academic_year?: string }): Promise<{ success: boolean; feeStructures: FeeStructure[] }> {
    const query = new URLSearchParams();
    if (params?.department) query.append('department', params.department);
    if (params?.course) query.append('course', params.course);
    if (params?.academic_year) query.append('academic_year', params.academic_year);
    return request(`/api/fee-structures?${query.toString()}`);
  },

  async createFeeStructure(data: any): Promise<{ success: boolean; feeStructure: FeeStructure; message: string }> {
    return request('/api/fee-structures', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateFeeStructure(id: number, data: any): Promise<{ success: boolean; feeStructure: FeeStructure; message: string }> {
    return request(`/api/fee-structures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteFeeStructure(id: number): Promise<{ success: boolean; message: string }> {
    return request(`/api/fee-structures/${id}`, { method: 'DELETE' });
  },

  // Student Fees
  async getStudentFees(params?: { status?: string; student_id?: string }): Promise<{ success: boolean; studentFees: StudentFee[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.student_id) query.append('student_id', params.student_id);
    return request(`/api/student-fees?${query.toString()}`);
  },

  async assignFee(data: {
    target_type: 'single' | 'bulk';
    student_id?: string;
    department?: string;
    course?: string;
    fee_structure_id: number;
  }): Promise<{ success: boolean; message: string; count: number }> {
    return request('/api/student-fees/assign', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Payments
  async getPayments(params?: {
    search?: string;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
    department?: string;
    student_id?: string;
  }): Promise<{ success: boolean; payments: Payment[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.payment_method) query.append('payment_method', params.payment_method);
    if (params?.date_from) query.append('date_from', params.date_from);
    if (params?.date_to) query.append('date_to', params.date_to);
    if (params?.department) query.append('department', params.department);
    if (params?.student_id) query.append('student_id', params.student_id);
    return request(`/api/payments?${query.toString()}`);
  },

  async getReceipt(id: number): Promise<{ success: boolean; receipt: any }> {
    return request(`/api/payments/${id}`);
  },

  async recordPayment(data: {
    student_fee_id: number;
    amount: number;
    payment_method: string;
    transaction_id?: string;
    payment_date?: string;
    remarks?: string;
  }): Promise<{ success: boolean; payment: Payment; receiptNo: string; message: string }> {
    return request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Reminders
  async getReminders(): Promise<{ success: boolean; reminders: Reminder[] }> {
    return request('/api/reminders');
  },

  async getReminderCandidates(): Promise<{
    success: boolean;
    candidates: ReminderCandidate[];
    counts: { total: number; overdue: number; dueToday: number; upcoming: number; partial: number };
  }> {
    return request('/api/reminders/candidates');
  },

  async sendReminder(data: {
    student_id: string;
    student_fee_id: number;
    reminder_type: string;
    channel?: string;
    message: string;
  }): Promise<{ success: boolean; message: string; reminder: Reminder }> {
    return request('/api/reminders/send', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async sendBulkReminders(target_category: 'overdue' | 'dueToday' | 'upcoming' | 'all', channel?: string): Promise<{
    success: boolean;
    message: string;
    sentCount: number;
  }> {
    return request('/api/reminders/send-bulk', {
      method: 'POST',
      body: JSON.stringify({ target_category, channel })
    });
  },

  // Reports
  async getDashboardStats(): Promise<{ success: boolean; stats: DashboardStats }> {
    return request('/api/reports/dashboard');
  },

  async getFeeReport(department?: string, status?: string): Promise<{ success: boolean; summary: any; data: any[] }> {
    const query = new URLSearchParams();
    if (department && department !== 'ALL') query.append('department', department);
    if (status && status !== 'ALL') query.append('status', status);
    return request(`/api/reports/fees?${query.toString()}`);
  },

  async getPendingReport(): Promise<{ success: boolean; totalPendingCount: number; totalPendingAmount: number; data: any[] }> {
    return request('/api/reports/pending');
  },

  async getOverdueReport(): Promise<{ success: boolean; totalOverdueCount: number; totalOverdueAmount: number; data: any[] }> {
    return request('/api/reports/overdue');
  },

  // Notifications
  async getNotifications(): Promise<{ success: boolean; count: number; unreadCount: number; notifications: Notification[] }> {
    return request('/api/notifications');
  },

  async markNotificationRead(id: number): Promise<{ success: boolean }> {
    return request(`/api/notifications/${id}/read`, { method: 'PUT' });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return request('/api/notifications/read-all', { method: 'PUT' });
  }
};
