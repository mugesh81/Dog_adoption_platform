import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { registerUser } from '../utils/index';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, PawPrint } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('adopter');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName || !trimmedEmail || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setIsLoading(true); setError('');
    try {
      const res: any = await registerUser({ name: trimmedName, email: trimmedEmail, password, role });
      if (res.success) { login(res.data.token, res.data); router.push('/dashboard'); }
      else setError(res.message || 'Failed to register. Please try again.');
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally { setIsLoading(false); }
  };

  const inputClass = `w-full pl-11 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-500 border border-slate-700/60 focus:outline-none focus:border-indigo-500 transition-colors`;
  const inputStyle = { background: 'rgba(15,23,42,0.8)' };

  const roles = [
    { value: 'adopter', emoji: '🏠', label: 'Adopter', desc: 'Looking for a dog' },
    { value: 'donor',   emoji: '🎁', label: 'Donor',   desc: 'Giving a dog' },
    { value: 'shelter', emoji: '🏢', label: 'Shelter', desc: 'NGO / Rescue' },
  ];

  return (
    <>
      <Head>
        <title>Register | Paws&Hearts</title>
        <meta name="description" content="Create your Paws&Hearts account" />
      </Head>

      <div className="min-h-screen flex flex-col" style={{ background: '#020617' }}>
        {/* Glow orbs */}
        <div className="fixed top-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="fixed bottom-0 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        {/* Nav */}
        <nav className="glass-panel py-4 px-6 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-extrabold flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <PawPrint className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="gradient-text">Paws&Hearts</span>
            </Link>
            <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-slate-200 px-4 py-2 rounded-xl border border-slate-700/50 transition-colors">
              Sign in
            </Link>
          </div>
        </nav>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="glass-panel rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/8">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                🐾
              </div>
              <h1 className="text-3xl font-extrabold text-slate-100">Create an account</h1>
              <p className="text-slate-400 text-sm mt-2">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300">Sign in</Link>
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input id="reg-name" type="text" value={name} onChange={e => setName(e.target.value)}
                    autoComplete="name" placeholder="Your full name" className={inputClass} style={inputStyle} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                    autoComplete="email" placeholder="you@example.com" className={inputClass} style={inputStyle} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input id="reg-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password" placeholder="Minimum 6 characters"
                    className={`${inputClass} pr-11`} style={inputStyle} />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">I am a…</label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                      className="flex flex-col items-center py-3 px-2 rounded-xl border transition-all"
                      style={{
                        background: role === opt.value ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.6)',
                        borderColor: role === opt.value ? 'rgba(99,102,241,0.5)' : 'rgba(51,65,85,0.5)',
                      }}>
                      <span className="text-xl mb-1">{opt.emoji}</span>
                      <span className={`text-xs font-bold ${role === opt.value ? 'text-indigo-300' : 'text-slate-300'}`}>{opt.label}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-sm gradient-btn-indigo disabled:opacity-50 disabled:cursor-not-allowed mt-2 uppercase tracking-wider">
                {isLoading ? 'Creating account…' : 'Create Account'}
              </button>

              <p className="text-center text-xs text-slate-600">
                By registering, you help save abandoned dogs in Tamil Nadu 🐶
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}
