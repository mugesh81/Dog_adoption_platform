import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle, XCircle, Calendar, X, Info,
  AlertTriangle, Phone, CheckCircle2, AlertCircle
} from 'lucide-react';
import {
  getApplications, updateApplicationStatus, proposeInterview,
  respondToInterview, getDogImageUrl
} from '../utils/index';

// ─── Interview Rules ──────────────────────────────────────────────────────────
const DONOR_INTERVIEW_RULES = [
  { icon: '📅', text: 'Pick a date at least 24 hours from now to give the adopter enough time.' },
  { icon: '📍', text: 'Include a clear meeting location in your notes — shelter address, a public spot, or video call link.' },
  { icon: '📱', text: "The adopter's phone and WhatsApp are shown below. Coordinate the final details via WhatsApp after proposing here." },
  { icon: '🔁', text: 'Max 3 reschedule rounds. After that, approve or reject the application directly.' },
  { icon: '✅', text: 'Once the adopter confirms, you can approve the adoption from your dashboard.' },
];

const ADOPTER_INTERVIEW_RULES = [
  { icon: '📅', text: 'The donor has proposed a meeting time. Confirm it or request a different time.' },
  { icon: '📱', text: 'Contact the donor directly via phone or WhatsApp to discuss any questions before the meeting.' },
  { icon: '📋', text: 'Bring a valid ID and be prepared to answer questions about your home and lifestyle.' },
  { icon: '🐶', text: 'If you have other pets, bring photos or be ready to describe them.' },
  { icon: '❌', text: 'You can decline the interview — this will withdraw your application.' },
];

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium max-w-sm border glass-panel ${
        type === 'success'
          ? 'text-emerald-300 border-emerald-500/30'
          : 'text-rose-300 border-rose-500/30'
      }`}
    >
      {type === 'success'
        ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
        : <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />}
      <span>{message}</span>
      <button type="button" onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Interview modal state
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRules, setShowRules] = useState(false); // collapsed by default so date picker is visible

  // Counter-proposal inline state per app card
  const [counterAppId, setCounterAppId] = useState<string | null>(null);
  const [counterDate, setCounterDate] = useState('');

  // Decline confirmation state
  const [declineAppId, setDeclineAppId] = useState<string | null>(null);

  // Toast notifications (replacing alert/confirm/prompt)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const canReview = user && ['donor', 'shelter', 'admin'].includes(user.role);

  const fetchApplications = async () => {
    try {
      const res: any = await getApplications();
      if (res.success) setApplications(res.data);
      else showToast(res.message || 'Failed to load applications', 'error');
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load applications');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  // ── Approve / Reject ────────────────────────────────────────────────────────
  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateApplicationStatus(
        id,
        status,
        status === 'rejected' ? { rejectionReason: 'Not selected at this time.' } : undefined
      );
      showToast(
        status === 'approved'
          ? '✅ Application approved successfully!'
          : '❌ Application rejected.',
        status === 'approved' ? 'success' : 'error'
      );
      await fetchApplications();
    } catch (err: any) {
      showToast(err.message || 'Action failed. Please try again.', 'error');
    }
  };

  // ── Open Interview Modal ────────────────────────────────────────────────────
  const openInterviewModal = (app: any) => {
    setSelectedApp(app);
    setInterviewDate('');
    setInterviewNotes('');
    setShowRules(false); // always start collapsed so date picker is visible immediately
    setShowInterviewModal(true);
  };

  // ── Propose Interview ───────────────────────────────────────────────────────
  const handleProposeInterview = async () => {
    if (!selectedApp || !interviewDate) {
      showToast('Please select an interview date and time.', 'error');
      return;
    }

    // Validate: must be at least 24h from now
    const picked = new Date(interviewDate);
    const min24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (picked < min24h) {
      showToast('Interview must be at least 24 hours from now.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await proposeInterview(selectedApp._id, interviewDate, interviewNotes);
      setShowInterviewModal(false);
      showToast('📅 Interview proposed successfully! The adopter will be notified.', 'success');
      await fetchApplications();
    } catch (err: any) {
      showToast(err.message || 'Failed to propose interview. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Adopter: Respond to Interview ──────────────────────────────────────────
  const handleRespondToInterview = async (
    appId: string,
    response: 'confirm' | 'request_change' | 'decline',
    counterProposalDate?: string
  ) => {
    try {
      await respondToInterview(
        appId,
        response,
        counterProposalDate,
        response === 'request_change' ? 'Adopter requested different time' : undefined
      );
      setCounterAppId(null);
      setCounterDate('');
      setDeclineAppId(null);

      if (response === 'confirm') showToast('✅ Interview confirmed! Check the details on your card.', 'success');
      else if (response === 'decline') showToast('Interview declined. Your application has been withdrawn.', 'error');
      else showToast('🔄 Counter-proposal sent to the donor.', 'success');

      await fetchApplications();
    } catch (err: any) {
      showToast(err.message || 'Failed to respond. Please try again.', 'error');
    }
  };

  if (loading || !user)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020617' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="text-emerald-400" />;
      case 'rejected': return <XCircle className="text-rose-400" />;
      case 'interview_scheduled': return <Calendar className="text-indigo-400" />;
      default: return <Clock className="text-amber-400" />;
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      interview_scheduled: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      under_review: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    return map[status] || 'bg-slate-700/30 text-slate-400 border-slate-600/30';
  };

  // Min date for datetime-local: 24h from now
  const minDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <>
      <Head><title>Dashboard | Paws&Hearts</title></Head>
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8" style={{ background: '#020617' }}>
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-100">Welcome back, <span className="gradient-text">{user.name}</span></h1>
              <p className="text-slate-400 mt-2">
                {user.role === 'adopter'
                  ? 'Track your adoption applications below.'
                  : 'Review adoption applications for your listings.'}
              </p>
            </div>
            {canReview && (
              <a href="/my-listings"
                className="px-5 py-2.5 rounded-xl font-bold text-sm gradient-btn-indigo flex items-center gap-2">
                Manage My Listings
              </a>
            )}
          </div>

          {/* Stats */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Applications</h3>
            <p className="text-4xl font-extrabold gradient-text mt-1">{applications.length}</p>
          </Card>

          {/* Applications List */}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-100 mb-6">
              {canReview ? 'Incoming Applications' : 'My Applications'}
            </h2>
            {loadError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm text-rose-300 border border-rose-500/20" style={{ background: 'rgba(239,68,68,0.08)' }}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loadError}</span>
              </div>
            )}

            {isLoadingData ? (
              <div className="space-y-4">
                {[1,2,3].map(n => <div key={n} className="glass-card rounded-2xl h-28 animate-pulse" />)}
              </div>
            ) : applications.length === 0 ? (
              <Card className="p-10 text-center space-y-3">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-semibold">No applications yet</p>
                <p className="text-slate-500 text-sm">
                  {user.role === 'adopter'
                    ? 'Browse dogs and apply to get started.'
                    : 'List a dog to receive applications.'}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((app, idx) => {
                  const imageUrl = app.dogId ? getDogImageUrl(app.dogId) : null;
                  const hasInterview = app.interviewDate && app.interviewStatus;
                  const isCounterOpen = counterAppId === app._id;
                  const isDeclineOpen = declineAppId === app._id;

                  return (
                    <motion.div
                      key={app._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                          {/* Left — dog info + interview */}
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700/50" style={{ background: '#0f172a' }}>
                              {imageUrl
                                ? <img src={imageUrl} alt="Dog" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">🐾</div>
                              }
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-slate-100">{app.dogId?.name || 'Unknown Dog'}</h4>
                              {canReview && app.adopterId && (
                                <p className="text-sm text-slate-400">
                                  Applicant: <span className="text-slate-300 font-medium">{app.adopterId.name}</span> ({app.adopterId.email})
                                </p>
                              )}
                              <p className="text-sm text-slate-500">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                              {app.reasonForAdopting && (
                                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{app.reasonForAdopting}</p>
                              )}

                              {/* Adopter contact — donor view only */}
                              {canReview && (app.adopterPhone || app.adopterWhatsApp || app.adopterCity) && (
                                <div className="mt-2 p-2 rounded-lg border border-emerald-500/20 space-y-0.5" style={{ background: 'rgba(16,185,129,0.06)' }}>
                                  <p className="text-xs font-semibold text-emerald-400">📱 Contact Details</p>
                                  {app.adopterPhone && (
                                    <p className="text-xs text-emerald-300">
                                      📞 Phone:{' '}
                                      <a href={`tel:${app.adopterPhone}`} className="font-bold underline text-emerald-200">{app.adopterPhone}</a>
                                    </p>
                                  )}
                                  {app.adopterWhatsApp && (
                                    <p className="text-xs text-emerald-300">
                                      💬 WhatsApp:{' '}
                                      <a href={`https://wa.me/${app.adopterWhatsApp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                                        className="font-bold underline text-emerald-200">{app.adopterWhatsApp}</a>
                                    </p>
                                  )}
                                  {app.adopterCity && (
                                    <p className="text-xs text-emerald-300">📍 City: <strong className="text-emerald-200">{app.adopterCity}</strong></p>
                                  )}
                                </div>
                              )}

                              {/* Interview info panel */}
                              {hasInterview && (
                                <div className="mt-3 p-3 rounded-xl border border-indigo-500/20" style={{ background: 'rgba(99,102,241,0.08)' }}>
                                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1">
                                    <Calendar className="w-4 h-4" />
                                    Interview: <span className="capitalize">{app.interviewStatus.replace(/_/g, ' ')}</span>
                                  </div>
                                  <p className="text-sm text-slate-300">
                                    📅 {new Date(app.interviewDate).toLocaleString()}
                                  </p>
                                  {app.interviewNotes && (
                                    <p className="text-xs text-slate-400 mt-1">Note: {app.interviewNotes}</p>
                                  )}

                                  {/* ── ADOPTER response section ── */}
                                  {!canReview && (
                                    <div className="mt-3 space-y-3">
                                      {/* Collapsible guidelines */}
                                      <div className="rounded-xl border border-indigo-500/20 overflow-hidden">
                                        <details className="group">
                                          <summary className="flex items-center justify-between px-3 py-2.5 cursor-pointer list-none hover:opacity-80 transition-opacity" style={{ background: 'rgba(99,102,241,0.1)' }}>
                                            <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                                              📋 Interview Guidelines & Next Steps
                                            </span>
                                            <span className="text-indigo-400 text-xs font-medium group-open:hidden">Show ▼</span>
                                            <span className="text-indigo-400 text-xs font-medium hidden group-open:block">Hide ▲</span>
                                          </summary>
                                          <div className="px-3 py-2.5 border-t border-indigo-500/20" style={{ background: 'rgba(15,23,42,0.6)' }}>
                                            <ul className="space-y-1.5">
                                              {ADOPTER_INTERVIEW_RULES.map((rule, i) => (
                                                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                                                  <span className="shrink-0">{rule.icon}</span>
                                                  <span>{rule.text}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </details>
                                      </div>

                                      {/* Action buttons — only when response needed */}
                                      {(app.interviewStatus === 'proposed' || app.interviewStatus === 'rescheduled') && (
                                        <div className="space-y-2">
                                          {/* Main buttons */}
                                          {!isCounterOpen && !isDeclineOpen && (
                                            <div className="flex gap-2 flex-wrap pt-1">
                                              <button type="button" onClick={() => handleRespondToInterview(app._id, 'confirm')}
                                                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                                                ✓ Confirm this time
                                              </button>
                                              <button type="button" onClick={() => { setCounterAppId(app._id); setCounterDate(''); }}
                                                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors">
                                                🔄 Request different time
                                              </button>
                                              <button type="button" onClick={() => setDeclineAppId(app._id)}
                                                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors">
                                                ✗ Decline & withdraw
                                              </button>
                                            </div>
                                          )}

                                          {/* Inline counter-proposal */}
                                          {isCounterOpen && (
                                            <div className="p-3 rounded-xl border border-amber-500/20 space-y-2" style={{ background: 'rgba(245,158,11,0.08)' }}>
                                              <p className="text-xs font-semibold text-amber-400">Propose a different time:</p>
                                              <input type="datetime-local" value={counterDate}
                                                onChange={e => setCounterDate(e.target.value)}
                                                min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                                                className="w-full px-3 py-2 rounded-xl text-xs text-slate-100 border border-amber-500/30 focus:outline-none focus:border-amber-400"
                                                style={{ background: 'rgba(15,23,42,0.8)', colorScheme: 'dark' }}
                                              />
                                              <div className="flex gap-2">
                                                <button type="button"
                                                  onClick={() => counterDate && handleRespondToInterview(app._id, 'request_change', counterDate)}
                                                  disabled={!counterDate}
                                                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 disabled:opacity-40 transition-colors">
                                                  Send Counter-Proposal
                                                </button>
                                                <button type="button"
                                                  onClick={() => { setCounterAppId(null); setCounterDate(''); }}
                                                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-600/50 text-slate-400 hover:text-slate-200 transition-colors">
                                                  Cancel
                                                </button>
                                              </div>
                                            </div>
                                          )}

                                          {/* Inline decline confirm */}
                                          {isDeclineOpen && (
                                            <div className="p-3 rounded-xl border border-rose-500/20 space-y-2" style={{ background: 'rgba(239,68,68,0.08)' }}>
                                              <p className="text-xs font-semibold text-rose-300">
                                                ⚠️ Declining will withdraw your application. This cannot be undone.
                                              </p>
                                              <div className="flex gap-2">
                                                <button type="button" onClick={() => handleRespondToInterview(app._id, 'decline')}
                                                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors">
                                                  Yes, Decline & Withdraw
                                                </button>
                                                <button type="button" onClick={() => setDeclineAppId(null)}
                                                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-600/50 text-slate-400 hover:text-slate-200 transition-colors">
                                                  Keep Application
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Donor counter-proposal notice */}
                                  {canReview && app.interviewStatus === 'rescheduled' && (
                                    <p className="text-xs text-amber-400 mt-1 font-semibold">
                                      ⚠️ Adopter requested a different time
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right — status + donor action buttons */}
                          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border capitalize ${statusBadge(app.status)}`}>
                              {getStatusIcon(app.status)}
                              <span>{app.status.replace(/_/g, ' ')}</span>
                            </div>

                            {canReview && ['pending', 'under_review', 'interview_scheduled'].includes(app.status) && (
                              <div className="flex gap-2 flex-wrap justify-end">
                                <button type="button" onClick={() => openInterviewModal(app)}
                                  className="px-3 py-2 rounded-xl text-xs font-bold border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-1.5 transition-colors">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {app.status === 'interview_scheduled' ? 'Re-propose' : 'Schedule Interview'}
                                </button>
                                <button type="button" onClick={() => handleStatus(app._id, 'approved')}
                                  className="px-3 py-2 rounded-xl text-xs font-bold border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                                  Approve
                                </button>
                                <button type="button" onClick={() => handleStatus(app._id, 'rejected')}
                                  className="px-3 py-2 rounded-xl text-xs font-bold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors">
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Interview Proposal Modal ── */}
      <AnimatePresence>
        {showInterviewModal && selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowInterviewModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel rounded-3xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-5 border-b border-white/5 sticky top-0" style={{ background: 'rgba(15,23,42,0.95)' }}>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    Schedule Interview
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedApp.adopterId?.name} → {selectedApp.dogId?.name}
                  </p>
                </div>
                <button type="button" onClick={() => setShowInterviewModal(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">

                {/* Date & Time FIRST */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Interview Date & Time <span className="text-rose-400">*</span>
                  </label>
                  <input id="interview-date-input" type="datetime-local"
                    value={interviewDate} min={minDateTime}
                    onChange={e => setInterviewDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full px-3 py-2.5 rounded-xl text-slate-100 border border-slate-700/60 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
                    {...{ style: { colorScheme: 'dark', background: 'rgba(15,23,42,0.8)', color: '#f1f5f9' } } as any}
                  />
                  <p className="text-xs text-slate-500 mt-1">Must be at least 24 hours from now</p>
                  {interviewDate && new Date(interviewDate) < new Date(Date.now() + 24 * 60 * 60 * 1000) && (
                    <p className="text-xs text-rose-400 mt-1">⚠️ Please pick a time at least 24 hours from now.</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Notes for adopter <span className="text-slate-600 font-normal normal-case">(recommended)</span>
                  </label>
                  <textarea value={interviewNotes} onChange={e => setInterviewNotes(e.target.value)}
                    rows={3} spellCheck={false}
                    placeholder="e.g. Meet at our shelter gate (123 Anna Nagar, Chennai). Bring valid ID. WhatsApp me to confirm."
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-500 border border-slate-700/60 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                    style={{ background: 'rgba(15,23,42,0.8)' }}
                  />
                </div>

                {/* Adopter contact */}
                {(selectedApp.adopterPhone || selectedApp.adopterWhatsApp) ? (
                  <div className="rounded-xl border border-emerald-500/20 p-4 space-y-1.5" style={{ background: 'rgba(16,185,129,0.07)' }}>
                    <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Phone className="w-4 h-4" /> Adopter Contact
                    </p>
                    {selectedApp.adopterPhone && (
                      <p className="text-sm text-emerald-300">📞 Phone:{' '}<a href={`tel:${selectedApp.adopterPhone}`} className="font-bold underline text-emerald-200">{selectedApp.adopterPhone}</a></p>
                    )}
                    {selectedApp.adopterWhatsApp && (
                      <p className="text-sm text-emerald-300">💬 WhatsApp:{' '}<a href={`https://wa.me/${selectedApp.adopterWhatsApp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="font-bold underline text-emerald-200">{selectedApp.adopterWhatsApp}</a></p>
                    )}
                    {selectedApp.adopterCity && (
                      <p className="text-sm text-emerald-300">📍 City: <strong className="text-emerald-200">{selectedApp.adopterCity}</strong></p>
                    )}
                    <p className="text-xs text-emerald-600 pt-1 border-t border-emerald-500/20">
                      Tip: Use WhatsApp to send your location and confirm final details.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-500/20 text-sm text-amber-300" style={{ background: 'rgba(245,158,11,0.08)' }}>
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>No WhatsApp/phone provided. Use the email shown on the application card to reach the adopter.</span>
                  </div>
                )}

                {/* Interview rules — collapsible */}
                <div className="rounded-xl border border-indigo-500/20 overflow-hidden">
                  <button type="button" onClick={() => setShowRules(r => !r)}
                    className="w-full flex items-center justify-between px-4 py-3 transition-opacity hover:opacity-80 text-left"
                    style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <span className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
                      <Info className="w-4 h-4" /> Interview Rules & Guidelines
                    </span>
                    <span className="text-indigo-400 text-xs font-medium">{showRules ? 'Hide ▲' : 'Show ▼'}</span>
                  </button>
                  {showRules && (
                    <ul className="px-4 py-3 space-y-2 border-t border-indigo-500/20" style={{ background: 'rgba(15,23,42,0.6)' }}>
                      {DONOR_INTERVIEW_RULES.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="shrink-0">{rule.icon}</span>
                          <span>{rule.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Reschedule warning */}
                {selectedApp.rescheduleCount > 0 && (
                  <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-500/20 text-sm text-amber-300" style={{ background: 'rgba(245,158,11,0.08)' }}>
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Rescheduled <strong>{selectedApp.rescheduleCount}</strong> time
                      {selectedApp.rescheduleCount > 1 ? 's' : ''} (max 3).
                      {selectedApp.rescheduleCount >= 2 ? ' Consider approving or rejecting directly.' : ''}
                    </span>
                  </div>
                )}

                {/* Submit */}
                <button type="button" onClick={handleProposeInterview}
                  disabled={!interviewDate || isSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold text-sm gradient-btn-indigo disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider">
                  {isSubmitting ? 'Proposing…' : '📅 Propose Interview Time'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast Notifications ── */}
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.message}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
