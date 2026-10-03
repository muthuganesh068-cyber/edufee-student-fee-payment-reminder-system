import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Bell,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  BookOpen,
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDrawer } from './NotificationDrawer';
import { ProjectGuideModal } from './ProjectGuideModal';
import { api } from '../services/api';

interface NavbarProps {
  onOpenMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar }) => {
  const { user, logout, quickLogin, isAdmin } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchUnread = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setUnreadCount(res.unreadCount);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleResetData = async () => {
    if (window.confirm('Reset all fees, payments, and reminders to initial sample state?')) {
      try {
        setIsResetting(true);
        await api.resetDemoData();
        window.location.reload();
      } catch (e: any) {
        alert(e.message || 'Failed to reset demo data');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <>
      <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <span className="sr-only">Open menu</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900">EduFee</span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                  College Fee Management
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                    Quick Switch Account
                  </div>
                  <button
                    onClick={() => {
                      quickLogin('admin@example.com', 'admin123');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-900">System Admin</div>
                      <div className="text-[11px] text-slate-500">Full finance control & reports</div>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">ADMIN</span>
                  </button>

                  <div className="my-1 border-t border-slate-100"></div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                    Sample Students (All Scenarios)
                  </div>

                  <button
                    onClick={() => {
                      quickLogin('aarav.sharma@example.com', 'password123');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Aarav Sharma</div>
                      <div className="text-[11px] text-slate-500">CSE Sem 5</div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">PAID</span>
                  </button>

                  <button
                    onClick={() => {
                      quickLogin('priya.patel@example.com', 'password123');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Priya Patel</div>
                      <div className="text-[11px] text-slate-500">IT Sem 3</div>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">PARTIAL</span>
                  </button>

                  <button
                    onClick={() => {
                      quickLogin('rohan.verma@example.com', 'password123');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Rohan Verma</div>
                      <div className="text-[11px] text-slate-500">ECE Sem 7</div>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">OVERDUE</span>
                  </button>

                  <button
                    onClick={() => {
                      quickLogin('vikram.singh@example.com', 'password123');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Vikram Singh</div>
                      <div className="text-[11px] text-slate-500">MBA Sem 2</div>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">DUE TODAY</span>
                  </button>

                  <button
                    onClick={() => {
                      quickLogin('ananya.iyer@example.com', 'password123');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Ananya Iyer</div>
                      <div className="text-[11px] text-slate-500">CSE Sem 1</div>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">UPCOMING</span>
                  </button>
                </div>
              )}
            </div>

            {/* Project Guide Modal Trigger */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-xs"
              title="View Project Report, Architecture, ER Diagram, and Viva Q&A"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Project Guide & Viva</span>
            </button>

            {/* Admin Reset Demo Trigger */}
            {isAdmin && (
              <button
                onClick={handleResetData}
                disabled={isResetting}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Reset database to initial clean state"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>Reset Demo</span>
              </button>
            )}

            {/* Notifications Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            {/* User Profile Badge & Logout */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">{user?.name}</div>
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  {user?.role === 'admin' ? 'Administrator' : user?.student_id || 'Student'}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-over Drawers and Modals */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onUpdateCount={setUnreadCount}
      />
      <ProjectGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
};
