import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Users,
  Smartphone,
  Mail,
  X,
  History,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { Reminder, ReminderCandidate } from '../../types';

export const ReminderManagement: React.FC = () => {
  const [candidates, setCandidates] = useState<ReminderCandidate[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [counts, setCounts] = useState({ total: 0, overdue: 0, dueToday: 0, upcoming: 0, partial: 0 });
  const [loading, setLoading] = useState(true);

  // Active Category Filter
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'dueToday' | 'upcoming' | 'partial' | 'history'>('all');

  // Send Single Reminder Modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<ReminderCandidate | null>(null);
  const [channel, setChannel] = useState<'In-App' | 'Email' | 'SMS'>('In-App');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  // Bulk Send State
  const [bulkSending, setBulkSending] = useState(false);

  const fetchRemindersData = async () => {
    try {
      setLoading(true);
      const [candRes, remRes] = await Promise.all([
        api.getReminderCandidates(),
        api.getReminders()
      ]);

      if (candRes.success) {
        setCandidates(candRes.candidates);
        setCounts(candRes.counts);
      }
      if (remRes.success) {
        setReminders(remRes.reminders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemindersData();
  }, []);

  const handleOpenSend = (candidate: ReminderCandidate) => {
    setSelectedCandidate(candidate);
    setMessageText(candidate.defaultMessage);
    setChannel('In-App');
    setSendSuccess(null);
    setShowSendModal(true);
  };

  const handleSendSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    try {
      setSending(true);
      const res = await api.sendReminder({
        student_id: selectedCandidate.student_id,
        student_fee_id: selectedCandidate.student_fee_id,
        reminder_type: selectedCandidate.category,
        channel,
        message: messageText
      });

      if (res.success) {
        setSendSuccess(`Reminder successfully delivered to ${selectedCandidate.studentName} via ${channel}`);
        setTimeout(() => {
          setShowSendModal(false);
          setSendSuccess(null);
          fetchRemindersData();
        }, 1500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch reminder');
    } finally {
      setSending(false);
    }
  };

  const handleBulkSend = async (category: 'overdue' | 'dueToday' | 'upcoming' | 'all') => {
    const label = category === 'overdue'
      ? 'all OVERDUE accounts'
      : category === 'dueToday'
      ? 'all students with fees DUE TODAY'
      : category === 'upcoming'
      ? 'all students with UPCOMING dues'
      : 'ALL pending student fees';

    if (window.confirm(`Are you sure you want to dispatch bulk reminders to ${label}?`)) {
      try {
        setBulkSending(true);
        const res = await api.sendBulkReminders(category, 'In-App');
        alert(res.message);
        fetchRemindersData();
      } catch (err: any) {
        alert(err.message || 'Error sending bulk reminders');
      } finally {
        setBulkSending(false);
      }
    }
  };

  // Filter candidates by category tab
  const filteredCandidates = candidates.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'overdue') return c.category === 'Overdue';
    if (activeTab === 'dueToday') return c.category === 'Due Today';
    if (activeTab === 'upcoming') return c.category === 'Upcoming';
    if (activeTab === 'partial') return c.category === 'Partial Payment';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Intelligent Payment Reminder Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated categorization of upcoming deadlines, due today, and overdue student fee balances
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleBulkSend('overdue')}
            disabled={bulkSending || counts.overdue === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 disabled:opacity-50 shadow-xs transition-all cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Remind All Overdue ({counts.overdue})</span>
          </button>

          <button
            onClick={() => handleBulkSend('dueToday')}
            disabled={bulkSending || counts.dueToday === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 shadow-xs transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Remind Due Today ({counts.dueToday})</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>All Pending Fees</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">{counts.total}</span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overdue'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Overdue</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-200/50">{counts.overdue}</span>
        </button>

        <button
          onClick={() => setActiveTab('dueToday')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'dueToday'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Due Today</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-200/50">{counts.dueToday}</span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Upcoming Due Dates</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-200/50">{counts.upcoming}</span>
        </button>

        <button
          onClick={() => setActiveTab('partial')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'partial'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          <span>Partially Paid</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200/50">{counts.partial}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ml-auto ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Dispatch History ({reminders.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab !== 'history' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Department & Course</th>
                  <th className="py-3 px-4 text-right">Total Fee</th>
                  <th className="py-3 px-4 text-right">Pending Balance</th>
                  <th className="py-3 px-4">Due Date & Timeline</th>
                  <th className="py-3 px-4 text-center">Urgency</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">Loading reminder engine...</td>
                  </tr>
                ) : filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No student accounts found in this category. All clear!
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map(cand => (
                    <tr key={cand.student_fee_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{cand.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <span>{cand.student_id}</span>
                          <span>•</span>
                          <span>{cand.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{cand.department}</div>
                        <div className="text-[11px] text-slate-500">{cand.course}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        ₹{cand.total_amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-600 text-sm">
                        ₹{cand.pending_amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{cand.due_date}</div>
                        <div className="text-[11px]">
                          {cand.diffDays < 0 ? (
                            <span className="text-rose-600 font-bold">{Math.abs(cand.diffDays)} days overdue</span>
                          ) : cand.diffDays === 0 ? (
                            <span className="text-purple-600 font-bold">Due today</span>
                          ) : (
                            <span className="text-blue-600 font-medium">{cand.diffDays} days remaining</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            cand.category === 'Overdue'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : cand.category === 'Due Today'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : cand.category === 'Partial Payment'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {cand.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenSend(cand)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Notice</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Dispatch History Table */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-bold text-slate-800 text-xs flex justify-between items-center">
            <span>Sent Payment Reminders & Notifications Log</span>
            <span className="font-normal text-slate-500">Total sent: {reminders.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Type & Channel</th>
                  <th className="py-3 px-4">Reminder Message</th>
                  <th className="py-3 px-4 text-right">Pending Dues</th>
                  <th className="py-3 px-4">Dispatched At</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reminders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">No reminders sent yet.</td>
                  </tr>
                ) : (
                  reminders.map(rem => (
                    <tr key={rem.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{rem.studentName}</div>
                        <span className="font-mono text-[11px] text-slate-500">{rem.student_id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{rem.reminder_type}</div>
                        <span className="text-[11px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                          {rem.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-sm leading-relaxed">
                        {rem.message}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">
                        ₹{rem.pending_amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{rem.sent_date}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> SENT
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Send Single Reminder Modal */}
      {showSendModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-900">Send Payment Reminder</h2>
              </div>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendSingle} className="p-6 space-y-4 text-xs">
              {sendSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{sendSuccess}</span>
                </div>
              )}

              {/* Student Metadata Overview */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-900">
                    {selectedCandidate.studentName} ({selectedCandidate.student_id})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pending Amount:</span>
                  <span className="font-mono font-bold text-amber-700">
                    ₹{selectedCandidate.pending_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="font-bold text-slate-800">{selectedCandidate.due_date}</span>
                </div>
              </div>

              {/* Dispatch Channel Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Notification Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['In-App', 'Email', 'SMS'] as const).map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannel(ch)}
                      className={`p-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        channel === ch
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {ch === 'In-App' && <BellRing className="w-3.5 h-3.5" />}
                      {ch === 'Email' && <Mail className="w-3.5 h-3.5" />}
                      {ch === 'SMS' && <Smartphone className="w-3.5 h-3.5" />}
                      <span>{ch}</span>
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  * In-App delivers instantly to the student portal bell inbox. Email/SMS are logged for evaluation with gateway hook readiness.
                </span>
              </div>

              {/* Message Text */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reminder Message *</label>
                <textarea
                  rows={4}
                  required
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-slate-900 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Dispatching...' : 'Dispatch Reminder'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
