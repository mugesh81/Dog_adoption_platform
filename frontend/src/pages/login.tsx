import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { loginUser } from '../utils/index';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Eye, EyeOff, PawPrint, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) { setError('Please fill in all fields'); return; }
    setIsLoading(true); setError('');
    try {
      const res: any = await loginUser(trimmedEmail, password);
      if (res.success) { login(res.data.token, res.data); router.push('/dashboard'); }
      else setError(res.message || 'Invalid credentials.');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please check your email and password.');
    } finally { setIsLoading(false); }
  };

  const inputClass = `w-full pl-11 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-500 border border-slate-700/60 focus:outline-none focus:border-indigo-500 transition-colors`;
  const inputStyle = { background: 'rgba(15,23,42,0.8)' };

  return (
    <>
      <Head>
        <title>Login | Paws&Hearts</title>
        <meta name="description" content="Sign in to your Paws&Hearts account" />
      </Head>

      <div className="min-h-screen flex flex-col" style={{ background: '#020617' }}>
        {/* Glow orbs */}
        <div className="fixed top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        {/* Nav */}
        <nav className="glass-panel py-4 px-6 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-extrabold flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <PawPrint className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="gradient-text">Paws&Hearts</span>
            </Link>
            <Link href="/register" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold gradient-btn-indigo">
              Register <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="glass-panel rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/8">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                🐾
              </div>
              <h1 className="text-3xl font-extrabold text-slate-100">Welcome back</h1>
              <p className="text-slate-400 text-sm mt-2">
                Don't have an account?{' '}
                <Link href="/register" className="text-indigo-400 font-semibold hover:text-indigo-300">Sign up</Link>
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm text-rose-300 border border-rose-500/20"
                style={{ background: 'rgba(239,68,68,0.08)' }}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="login-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={`${inputClass} pr-11`}
                    style={inputStyle}
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-sm gradient-btn-indigo disabled:opacity-50 disabled:cursor-not-allowed mt-2 uppercase tracking-wider">
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}
