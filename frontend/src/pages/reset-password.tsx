import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, CheckCircle2, PawPrint, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../utils';

export default function ResetPassword() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (router.query.token) setToken(router.query.token as string);
  }, [router.query.token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!token) { setError('Invalid or missing reset token'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    try {
      setLoading(true);
      const response = await resetPassword(token, newPassword);
      if (response.data.success) {
        setSuccess(true);
        setMessage(response.data.message);
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally { setLoading(false); }
  };

  const inputClass = `w-full pl-11 pr-11 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-500 border border-slate-700/60 focus:outline-none focus:border-indigo-500 transition-colors`;
  const inputStyle = { background: 'rgba(15,23,42,0.8)' };

  return (
    <>
      <Head>
        <title>Reset Password | Paws&Hearts</title>
      </Head>

      <div className="min-h-screen flex flex-col" style={{ background: '#020617' }}>
        <div className="fixed top-0 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        {/* Nav */}
        <nav className="glass-panel py-4 px-6 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-extrabold flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <PawPrint className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="gradient-text">Paws&Hearts</span>
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="glass-panel rounded-3xl p-8 w-full max-w-md shadow-2xl">

            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                🔒
              </div>
              <h1 className="text-3xl font-extrabold text-slate-100">Reset Password</h1>
              <p className="text-slate-400 text-sm mt-2">Enter your new password below</p>
            </div>

            {/* Success */}
            {success && message && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mb-6 space-y-3">
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-emerald-500/20 text-emerald-300 text-sm"
                  style={{ background: 'rgba(16,185,129,0.08)' }}>
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p>{message}</p>
                    <p className="text-emerald-500 text-xs mt-1">Redirecting to login page…</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm text-rose-300 border border-rose-500/20"
                style={{ background: 'rgba(239,68,68,0.08)' }}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="rp-new" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input id="rp-new" type={showNew ? 'text' : 'password'} value={newPassword}
                      onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters"
                      className={inputClass} style={inputStyle} minLength={6} required />
                    <button type="button" onClick={() => setShowNew(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters</p>
                </div>

                <div>
                  <label htmlFor="rp-confirm" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input id="rp-confirm" type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password"
                      className={inputClass} style={inputStyle} minLength={6} required />
                    <button type="button" onClick={() => setShowConfirm(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading || !token}
                  className="w-full py-3.5 rounded-xl font-bold text-sm gradient-btn-indigo disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider">
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">← Back to Login</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
