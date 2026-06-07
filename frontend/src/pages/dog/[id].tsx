import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, PawPrint, ShieldCheck, Heart, MapPin, Tag,
  Activity, Phone, Mail, User, Home, X, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { getDogDetails, sendAdoptionRequest, getRequestsByDog } from '../../utils/index';

interface Donor { name: string; email: string; phone: string; address: string; }
interface Dog {
  _id: string; name: string; breed: string; age: number; location: string;
  health: string; vaccinated: boolean; adopted: boolean; description: string;
  donorId?: Donor; imageUrl?: string; createdAt?: string;
}
interface AdoptForm { adopterName: string; adopterEmail: string; adopterPhone: string; message: string; }

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function DogDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [dog, setDog]           = useState<Dog | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [reqCount, setReqCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState<AdoptForm>({ adopterName:'', adopterEmail:'', adopterPhone:'', message:'' });
  const [formErrors, setFormErrors] = useState<Partial<AdoptForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]     = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const [dogRes, reqRes] = await Promise.all([
          getDogDetails(id as string),
          getRequestsByDog(id as string).catch(() => ({ data: [] }))
        ]);
        setDog(dogRes.data);
        setReqCount(reqRes?.data?.length || 0);
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const validate = (): boolean => {
    const errs: Partial<AdoptForm> = {};
    if (!form.adopterName.trim() || form.adopterName.trim().length < 2) errs.adopterName = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adopterEmail)) errs.adopterEmail = 'Enter a valid email address';
    if (!/^[6-9]\d{9}$/.test(form.adopterPhone)) errs.adopterPhone = 'Enter a valid 10-digit Indian mobile number';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openModal = () => {
    setForm({ adopterName:'', adopterEmail:'', adopterPhone:'', message:'' });
    setFormErrors({}); setResult(null); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dog || !validate()) return;
    setSubmitting(true);
    try {
      await sendAdoptionRequest({ dogId: dog._id, ...form });
      setResult({ ok: true, msg: `Your request for ${dog.name} has been submitted! The owner will contact you soon.` });
      setReqCount(c => c + 1);
    } catch (err: any) {
      setResult({ ok: false, msg: err.message });
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#020617' }}>
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <span className="text-slate-400 font-medium">Loading profile…</span>
      </div>
    </div>
  );

  if (error || !dog) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background:'#020617' }}>
      <div className="text-center py-16 px-8 rounded-3xl max-w-lg space-y-6 border border-rose-500/20" style={{ background:'rgba(239,68,68,0.05)' }}>
        <Heart className="w-16 h-16 mx-auto opacity-50 text-rose-400" />
        <p className="text-3xl font-extrabold text-slate-100">Profile Not Found</p>
        <p className="text-base text-slate-400">{error || 'This dog profile could not be found.'}</p>
        <Link href="/browse" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs gradient-btn-indigo">
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </Link>
      </div>
    </div>
  );

  const healthColor = dog.health === 'Healthy' ? 'text-emerald-400' : dog.health === 'Minor Care Required' ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ background:'#020617' }}>
      {/* Nav */}
      <motion.nav initial={{ y:-50, opacity:0 }} animate={{ y:0, opacity:1 }}
        className="glass-panel sticky top-0 z-50 py-4 px-6 border-b border-white/5 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-extrabold flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg" style={{ background:'rgba(99,102,241,0.1)' }}>
              <PawPrint className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="gradient-text">Paws&Hearts</span>
          </Link>
          <Link href="/browse" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700/50 text-slate-300 hover:text-white transition-all" style={{ background:'rgba(30,41,59,0.5)' }}>
            <ArrowLeft className="w-4 h-4" /> Browse
          </Link>
        </div>
      </motion.nav>

      <main className="max-w-5xl mx-auto px-4 py-12 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: Image + Action */}
          <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6 }}
            className="lg:col-span-5 space-y-5">
            <div className="w-full h-80 lg:h-[420px] rounded-[2rem] overflow-hidden border border-slate-800 relative group" style={{ background:'#0f172a' }}>
              {dog.imageUrl
                ? <img src={dog.imageUrl.startsWith('http') ? dog.imageUrl : `${BACKEND_URL}${dog.imageUrl}`} alt={dog.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                : <div className="w-full h-full flex items-center justify-center"><Heart className="w-16 h-16 text-indigo-500/20" /></div>
              }
              {dog.vaccinated && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-emerald-400/50" style={{ background:'rgba(16,185,129,0.9)' }}>
                  <ShieldCheck className="w-3.5 h-3.5" /> Vaccinated
                </div>
              )}
              {dog.adopted && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background:'rgba(2,6,23,0.8)' }}>
                  <span className="text-rose-400 font-extrabold uppercase tracking-widest text-lg">Adopted 🎉</span>
                </div>
              )}
            </div>

            {/* Adoption requests count */}
            {reqCount > 0 && !dog.adopted && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-amber-500/20 text-amber-300 text-sm font-medium" style={{ background:'rgba(245,158,11,0.08)' }}>
                <Clock className="w-4 h-4" />
                {reqCount} adoption request{reqCount !== 1 ? 's' : ''} already submitted
              </div>
            )}

            {/* CTA */}
            <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-3">
              <h3 className="text-lg font-bold text-slate-100">Give {dog.name} a Home</h3>
              {!dog.adopted ? (
                <button onClick={openModal}
                  className="w-full py-4 rounded-2xl font-bold uppercase tracking-wider text-sm gradient-btn-green flex items-center justify-center gap-2 shadow-lg">
                  <Heart className="w-5 h-5" /> Send Adoption Request
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold tracking-wide uppercase text-sm border border-rose-500/20 text-rose-400" style={{ background:'rgba(239,68,68,0.08)' }}>
                  <Heart className="w-5 h-5 fill-current" /> Already Adopted
                </div>
              )}
              <p className="text-xs text-slate-500 text-center">Free adoption · No fees · Tamil Nadu</p>
            </div>
          </motion.div>

          {/* Right: Details */}
          <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6, delay:0.1 }}
            className="lg:col-span-7 space-y-7">
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-100">{dog.name}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-indigo-400 border border-indigo-500/20" style={{ background:'rgba(99,102,241,0.1)' }}>
                  <Tag className="w-3.5 h-3.5" /> {dog.breed}
                </span>
                <span className="px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-300 border border-slate-700/60" style={{ background:'rgba(30,41,59,0.8)' }}>
                  {dog.age === 0 ? 'Puppy' : `${dog.age} years old`}
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5 rounded-3xl space-y-2">
                <Activity className="w-5 h-5 text-pink-400 mb-1" />
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Health</span>
                <span className={`text-base font-bold block ${healthColor}`}>{dog.health}</span>
              </div>
              <div className="glass-card p-5 rounded-3xl space-y-2">
                <MapPin className="w-5 h-5 text-blue-400 mb-1" />
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</span>
                <span className="text-base font-bold text-slate-200 block">{dog.location}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-100">About {dog.name}</h3>
              <p className="text-slate-300 font-light leading-relaxed p-5 rounded-2xl border border-slate-800/40" style={{ background:'rgba(15,23,42,0.5)' }}>
                {dog.description}
              </p>
            </div>

            {/* Owner contact */}
            {dog.donorId && (
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
                className="glass-panel rounded-3xl p-6 border border-white/5 space-y-5">
                <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2 border-b border-white/5 pb-4">
                  <div className="p-1.5 rounded-lg" style={{ background:'rgba(99,102,241,0.1)' }}><User className="w-4 h-4" /></div>
                  Owner Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <div><span className="text-slate-500 block text-xs uppercase tracking-wider">Name</span><strong className="text-slate-200 block mt-0.5">{dog.donorId.name}</strong></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <div><span className="text-slate-500 block text-xs uppercase tracking-wider">Phone</span><strong className="text-slate-200 block mt-0.5">{dog.donorId.phone}</strong></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <div><span className="text-slate-500 block text-xs uppercase tracking-wider">Email</span><strong className="text-indigo-400 block mt-0.5">{dog.donorId.email}</strong></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Home className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <div><span className="text-slate-500 block text-xs uppercase tracking-wider">Address</span><strong className="text-slate-200 block mt-0.5 leading-relaxed">{dog.donorId.address}</strong></div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-xs" style={{ background:'#020617' }}>
        <div className="flex items-center justify-center gap-1 mb-1"><PawPrint className="w-4 h-4 text-indigo-500/50" /><span className="font-semibold text-slate-500">Paws&Hearts</span></div>
        Dog Adoption Platform © 2026 — Tamil Nadu
      </footer>

      {/* ── Adoption Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(2,6,23,0.85)', backdropFilter:'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale:0.9, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.9, opacity:0 }}
              className="glass-panel rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Adopt {dog.name}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">{dog.breed} · {dog.location}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all"><X className="w-5 h-5" /></button>
              </div>

              {result ? (
                <div className="p-8 text-center space-y-4">
                  {result.ok
                    ? <><CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" /><p className="text-lg font-bold text-slate-100">Request Submitted!</p><p className="text-slate-400 text-sm leading-relaxed">{result.msg}</p><button onClick={() => setShowModal(false)} className="mt-2 px-6 py-3 rounded-xl font-bold text-sm gradient-btn-green">Done</button></>
                    : <><AlertCircle className="w-16 h-16 text-rose-400 mx-auto" /><p className="text-lg font-bold text-slate-100">Submission Failed</p><p className="text-rose-400 text-sm">{result.msg}</p><button onClick={() => setResult(null)} className="mt-2 px-6 py-3 rounded-xl font-bold text-sm gradient-btn-indigo">Try Again</button></>
                  }
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <p className="text-sm text-slate-400">Fill in your details and the owner will contact you to arrange the adoption.</p>
                  {[
                    { key:'adopterName', label:'Your Full Name', type:'text', icon:User, placeholder:'e.g. Priya Sharma' },
                    { key:'adopterEmail', label:'Email Address', type:'email', icon:Mail, placeholder:'name@example.com' },
                    { key:'adopterPhone', label:'Phone Number', type:'tel', icon:Phone, placeholder:'10-digit mobile number' },
                  ].map(({ key, label, type, icon: Icon, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type={type} value={(form as any)[key]} maxLength={key === 'adopterPhone' ? 10 : undefined}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                          className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-500 border focus:outline-none focus:border-indigo-500 transition-colors ${(formErrors as any)[key] ? 'border-rose-500' : 'border-slate-700/60'}`}
                          style={{ background:'rgba(15,23,42,0.8)' }} />
                      </div>
                      {(formErrors as any)[key] && <p className="text-rose-400 text-xs mt-1">{(formErrors as any)[key]}</p>}
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Message <span className="text-slate-600 normal-case">(optional)</span></label>
                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell the owner about yourself and why you'd like to adopt…" rows={3}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-500 border border-slate-700/60 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                      style={{ background:'rgba(15,23,42,0.8)' }} />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm gradient-btn-green disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting…</> : <><Heart className="w-4 h-4" /> Submit Adoption Request</>}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
