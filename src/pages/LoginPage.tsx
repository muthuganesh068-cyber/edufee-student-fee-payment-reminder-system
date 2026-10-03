import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProjectGuideModal } from '../components/ProjectGuideModal';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter both Email/Student ID and Password');
      return;
    }

    try {
      setError(null);
      setSubmitting(true);
      await login(identifier, password);
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoClick = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    quickLogin(id, pass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          EduFee System
        </h2>
        <p className="mt-1 text-xs text-indigo-300">
          Student Fee & Payment Reminder Management Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white text-slate-800 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email or Student ID (Roll No)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="admin@example.com or STU2026001"
                  required
                  className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts for College Presentation */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                1-Click Demo Logins
              </span>
              <button
                onClick={() => setShowGuide(true)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3 h-3" />
                Project Guide
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleDemoClick('admin@example.com', 'admin123')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Admin Account
                  </div>
                  <div className="text-[11px] text-slate-500">admin@example.com (Full Management)</div>
                </div>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                  ADMIN
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  onClick={() => handleDemoClick('aarav.sharma@example.com', 'password123')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left cursor-pointer transition-colors"
                >
                  <div className="font-bold text-slate-800">Aarav (CSE)</div>
                  <div className="text-emerald-600 font-semibold flex items-center gap-1 text-[10px] mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Fully Paid
                  </div>
                </button>

                <button
                  onClick={() => handleDemoClick('priya.patel@example.com', 'password123')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left cursor-pointer transition-colors"
                >
                  <div className="font-bold text-slate-800">Priya (IT)</div>
                  <div className="text-amber-600 font-semibold flex items-center gap-1 text-[10px] mt-0.5">
                    <Clock className="w-3 h-3" /> Partially Paid
                  </div>
                </button>

                <button
                  onClick={() => handleDemoClick('rohan.verma@example.com', 'password123')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-left cursor-pointer transition-colors"
                >
                  <div className="font-bold text-slate-800">Rohan (ECE)</div>
                  <div className="text-rose-600 font-semibold flex items-center gap-1 text-[10px] mt-0.5">
                    <AlertTriangle className="w-3 h-3" /> Overdue Fee
                  </div>
                </button>

                <button
                  onClick={() => handleDemoClick('vikram.singh@example.com', 'password123')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left cursor-pointer transition-colors"
                >
                  <div className="font-bold text-slate-800">Vikram (MBA)</div>
                  <div className="text-purple-600 font-semibold flex items-center gap-1 text-[10px] mt-0.5">
                    <Clock className="w-3 h-3" /> Due Today
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Institution Footer Notice */}
        <p className="mt-4 text-center text-xs text-indigo-300/80">
          St. Xavier Institute of Engineering & Technology • College Mini-Project Demo
        </p>
      </div>

      <ProjectGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
};
