import React, { useState } from 'react';
import { registerAdopter } from '../utils/index';
import { User, Mail, Phone, MapPin, Home, BookOpen, CheckCircle2 } from 'lucide-react';

interface AdopterFormProps { onSuccess?: () => void; }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

const field = 'w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-500 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors';
const fieldBg = { background: 'rgba(15,23,42,0.8)' };

export default function AdopterForm({ onSuccess }: AdopterFormProps) {
  const [form, setForm] = useState({ name:'', email:'', phone:'', address:'', experience:'', homeType:'' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const e: Record<string,string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email address';
    if (!PHONE_RE.test(form.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6-9)';
    if (!form.address.trim() || form.address.trim().length < 5) e.address = 'Please enter your full address';
    if (!form.experience.trim() || form.experience.trim().length < 10) e.experience = 'Please describe your experience (min 10 characters)';
    if (!form.homeType) e.homeType = 'Please select your home type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const touch = (name: string, value: string) => {
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setMessage('');
    try {
      await registerAdopter(form);
      setIsSuccess(true);
      setMessage('Profile created! Scroll down to browse dogs available for adoption.');
      setForm({ name:'', email:'', phone:'', address:'', experience:'', homeType:'' });
      setTimeout(() => onSuccess?.(), 1200);
    } catch (err: any) {
      setIsSuccess(false);
      setMessage(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl shadow-xl space-y-4" noValidate>
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-start gap-2 ${isSuccess ? 'text-emerald-400 border border-emerald-500/20' : 'text-rose-400 border border-rose-500/20'}`}
          style={{ background: isSuccess ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
          {isSuccess ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <span className="shrink-0">⚠️</span>}
          <span>{message}</span>
        </div>
      )}

      <h3 className="text-lg font-semibold text-emerald-400 border-b border-white/5 pb-2 flex items-center gap-2">
        <BookOpen className="w-4 h-4" /> Adopter Profile
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" value={form.name} onChange={e => touch('name', e.target.value)} placeholder="e.g. Priya Sharma"
              className={`${field} pl-9 ${errors.name ? 'border-rose-500' : 'border-slate-700/60'}`} style={fieldBg} />
          </div>
          {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
        </div>
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="email" value={form.email} onChange={e => touch('email', e.target.value)} placeholder="name@example.com"
              className={`${field} pl-9 ${errors.email ? 'border-rose-500' : 'border-slate-700/60'}`} style={fieldBg} />
          </div>
          {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
        </div>
        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="tel" value={form.phone} onChange={e => touch('phone', e.target.value)} placeholder="10-digit mobile" maxLength={10}
              className={`${field} pl-9 ${errors.phone ? 'border-rose-500' : 'border-slate-700/60'}`} style={fieldBg} />
          </div>
          {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone}</p>}
        </div>
        {/* Home type */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Home Environment</label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select value={form.homeType} onChange={e => touch('homeType', e.target.value)}
              className={`${field} pl-9 ${errors.homeType ? 'border-rose-500' : 'border-slate-700/60'}`} style={fieldBg}>
              <option value="">Select Home Type</option>
              <option value="apartment">Apartment</option>
              <option value="house">House with Yard</option>
              <option value="farm">Farm / Acreage</option>
            </select>
          </div>
          {errors.homeType && <p className="text-rose-400 text-xs mt-1">{errors.homeType}</p>}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <textarea value={form.address} onChange={e => touch('address', e.target.value)} placeholder="Where will the dog be living?" rows={2}
            className={`${field} pl-9 resize-none ${errors.address ? 'border-rose-500' : 'border-slate-700/60'}`} style={fieldBg} />
        </div>
        {errors.address && <p className="text-rose-400 text-xs mt-1">{errors.address}</p>}
      </div>

      {/* Experience */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Previous Pet Experience</label>
        <textarea value={form.experience} onChange={e => touch('experience', e.target.value)}
          placeholder="Describe your history with pets, training experience, lifestyle…" rows={3}
          className={`${field} resize-none ${errors.experience ? 'border-rose-500' : 'border-slate-700/60'}`} style={fieldBg} />
        {errors.experience && <p className="text-rose-400 text-xs mt-1">{errors.experience}</p>}
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm gradient-btn-green disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Processing…</> : 'Register as Adopter'}
      </button>
    </form>
  );
}
