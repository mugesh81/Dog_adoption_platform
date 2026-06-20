import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, CheckCircle2, PawPrint, ArrowLeft, ExternalLink } from 'lucide-react';
import { forgotPassword } from '../utils';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [isDevMode, setIsDevMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage(''); setResetUrl('');
    if (!email.trim()) { setError('Please enter your email address'); return; }
    try {
      setLoading(true);
      const response = await forgotPassword(email.trim().toLowerCase());
      if (response.data.success) {
        setMessage(response.data.message);
        if (response.data._dev_resetUrl) {
          setIsDevMode(true);
          setResetUrl(response.data._dev_resetUrl);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password | Paws&Hearts</title>
      </Head>

      <div className="min-h-screen flex flex-col" style={{ background: '#020617' }}>
        {/* Glow */}
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
            <Link href="/login" className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 px-4 py-2 rounded-xl border border-slate-700/50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="glass-panel rounded-3xl p-8 w-full max-w-md shadow-2xl">

            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                🔑
              </div>
              <h1 className="text-3xl font-extrabold text-slate-100">Forgot Password</h1>
              <p className="text-slate-400 text-sm mt-2">Enter your email and we'll send you a reset link</p>
            </div>

            {/* Success */}
            {message && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 space-y-4">
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-emerald-500/20 text-emerald-300 text-sm"
                  style={{ background: 'rgba(16,185,129,0.08)' }}>
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{message}</span>
                </div>
                {isDevMode && resetUrl && (
                  <div className="p-4 rounded-xl border border-amber-500/30 space-y-3"
                    style={{ background: 'rgba(245,158,11,0.08)' }}>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">🔧 Dev Mode — Reset Link</p>
                    <p className="text-xs text-slate-400">Click to reset your password (in production this would be emailed):</p>
                    <a href={resetUrl} className="flex items-center gap-2 text-xs font-mono text-indigo-300 underline break-all hover:text-indigo-200">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {resetUrl}
                    </a>
                  </div>
                )}
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="fp-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input id="fp-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-500 border border-slate-700/60 focus:outline-none focus:border-indigo-500 transition-colors"
                    style={{ background: 'rgba(15,23,42,0.8)' }} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm gradient-btn-indigo disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider">
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link href="/login" className="block text-sm text-indigo-400 hover:text-indigo-300 font-medium">← Back to Login</Link>
              <Link href="/register" className="block text-sm text-slate-500 hover:text-slate-400">Don't have an account? Register</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
