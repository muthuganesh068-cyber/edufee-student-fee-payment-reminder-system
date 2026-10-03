import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileSpreadsheet,
  CreditCard,
  History,
  BellRing,
  BarChart3,
  BookOpen,
  UserCheck,
  Receipt,
  GraduationCap,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { isAdmin, isStudent, user } = useAuth();

  const adminNavItems: NavItem[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-students', label: 'Students', icon: Users },
    { id: 'admin-departments', label: 'Departments & Courses', icon: Building2 },
    { id: 'admin-fee-structures', label: 'Fee Structures', icon: FileSpreadsheet },
    { id: 'admin-student-fees', label: 'Student Fees Ledger', icon: CreditCard },
    { id: 'admin-payments', label: 'Payments & History', icon: History },
    { id: 'admin-reminders', label: 'Payment Reminders', icon: BellRing, badge: 'Smart' },
    { id: 'admin-reports', label: 'Reports & Export', icon: BarChart3 },
    { id: 'docs-viva', label: 'Project Viva & Docs', icon: BookOpen }
  ];

  const studentNavItems: NavItem[] = [
    { id: 'student-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'student-fees', label: 'Fee Details', icon: CreditCard },
    { id: 'student-payments', label: 'Payment History', icon: History },
    { id: 'student-receipts', label: 'Download Receipts', icon: Receipt },
    { id: 'student-profile', label: 'My Profile', icon: UserCheck },
    { id: 'docs-viva', label: 'Project Viva & Docs', icon: BookOpen }
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">EduFee System</div>
            <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
              {isAdmin ? 'Admin Console' : 'Student Portal'}
            </div>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Main Navigation
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Current User Card at Bottom */}
      <div className="p-3 border-t border-slate-800/80 m-2 rounded-xl bg-slate-800/40 text-xs">
        <div className="font-bold text-white truncate">{user?.name}</div>
        <div className="text-[11px] text-slate-400 truncate mt-0.5">
          {isAdmin ? user?.email : `${user?.student_id || ''} • ${user?.department || ''}`}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:block w-64 shrink-0 border-r border-slate-200 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 left-0 w-64 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
