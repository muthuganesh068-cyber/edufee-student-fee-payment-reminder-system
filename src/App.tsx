import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentManagement } from './pages/admin/StudentManagement';
import { DepartmentManagement } from './pages/admin/DepartmentManagement';
import { FeeStructureManagement } from './pages/admin/FeeStructureManagement';
import { StudentFeeManagement } from './pages/admin/StudentFeeManagement';
import { PaymentManagement } from './pages/admin/PaymentManagement';
import { ReminderManagement } from './pages/admin/ReminderManagement';
import { ReportsManagement } from './pages/admin/ReportsManagement';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentFeeDetails } from './pages/student/StudentFeeDetails';
import { StudentReceipts } from './pages/student/StudentReceipts';
import { StudentProfile } from './pages/student/StudentProfile';
import { DocsAndVivaPage } from './pages/DocsAndVivaPage';

function AppContent() {
  const { user, isLoading, isAdmin, isStudent } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('default');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedFeeIdForPayment, setSelectedFeeIdForPayment] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-indigo-300">Initializing EduFee System...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Set default tab based on role if default
  const activeTab = currentTab === 'default'
    ? (isAdmin ? 'admin-dashboard' : 'student-dashboard')
    : currentTab;

  const handleRecordPaymentForFee = (studentFeeId: number) => {
    setSelectedFeeIdForPayment(studentFeeId);
    setCurrentTab('admin-payments');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

      <div className="flex-1 flex">
        <Sidebar
          currentTab={activeTab}
          onSelectTab={tab => {
            setCurrentTab(tab);
            setSelectedFeeIdForPayment(null);
          }}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Admin Views */}
          {isAdmin && (
            <>
              {activeTab === 'admin-dashboard' && (
                <AdminDashboard
                  onNavigateTab={setCurrentTab}
                  onOpenRecordPayment={() => setCurrentTab('admin-payments')}
                />
              )}
              {activeTab === 'admin-students' && (
                <StudentManagement />
              )}
              {activeTab === 'admin-departments' && (
                <DepartmentManagement />
              )}
              {activeTab === 'admin-fee-structures' && (
                <FeeStructureManagement />
              )}
              {activeTab === 'admin-student-fees' && (
                <StudentFeeManagement onRecordPayment={handleRecordPaymentForFee} />
              )}
              {activeTab === 'admin-payments' && (
                <PaymentManagement
                  initialStudentFeeId={selectedFeeIdForPayment}
                  onClearInitialFeeId={() => setSelectedFeeIdForPayment(null)}
                />
              )}
              {activeTab === 'admin-reminders' && (
                <ReminderManagement />
              )}
              {activeTab === 'admin-reports' && (
                <ReportsManagement />
              )}
            </>
          )}

          {/* Student Views */}
          {isStudent && (
            <>
              {activeTab === 'student-dashboard' && (
                <StudentDashboard onNavigateTab={setCurrentTab} />
              )}
              {activeTab === 'student-fees' && (
                <StudentFeeDetails />
              )}
              {activeTab === 'student-payments' && (
                <StudentReceipts />
              )}
              {activeTab === 'student-receipts' && (
                <StudentReceipts />
              )}
              {activeTab === 'student-profile' && (
                <StudentProfile />
              )}
            </>
          )}

          {/* Shared Documentation & Viva Page */}
          {activeTab === 'docs-viva' && (
            <DocsAndVivaPage />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
