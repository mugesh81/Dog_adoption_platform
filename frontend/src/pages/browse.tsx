import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, MapPin, Tag, Heart, PawPrint, ArrowLeft,
  Search, SlidersHorizontal, X, Phone, Mail, User, CheckCircle2, AlertCircle
} from 'lucide-react';
import { browseDogs, sendAdoptionRequest } from '../utils/index';

interface Dog {
  _id: string; name: string; breed: string; age: number;
  location: string; vaccinated: boolean; adopted: boolean;
  health: string; description: string; imageUrl?: string;
}
interface AdoptForm {
  adopterName: string; adopterEmail: string; adopterPhone: string; message: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const LOCATIONS = ['Chennai','Coimbatore','Madurai','Trichy','Salem','Tirunelveli','Puducherry','Vellore','Erode','Thanjavur'];

export default function BrowsePage() {
  const [dogs, setDogs]           = useState<Dog[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]     = useState({ location: '', vaccinated: '', health: '' });
  const [modal, setModal]         = useState<Dog | null>(null);
  const [form, setForm]           = useState<AdoptForm>({ adopterName:'', adopterEmail:'', adopterPhone:'', message:'' });
  const [formErrors, setFormErrors] = useState<Partial<AdoptForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const fetchDogs = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const params: Record<string,string> = {};
      if (search.trim()) params.search = search.trim();
      if (filters.location) params.location = filters.location;
      if (filters.vaccinated) params.vaccinated = filters.vaccinated;
      if (filters.health) params.health = filters.health;
      const res = await browseDogs(params);
      setDogs(res?.data || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [search, filters]);

  useEffect(() => { fetchDogs(); }, [fetchDogs]);

  // ── Form validation ────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Partial<AdoptForm> = {};
    if (!form.adopterName.trim() || form.adopterName.trim().length < 2) errs.adopterName = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adopterEmail)) errs.adopterEmail = 'Enter a valid email address';
    if (!/^[6-9]\d{9}$/.test(form.adopterPhone)) errs.adopterPhone = 'Enter a valid 10-digit Indian mobile number';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openModal = (dog: Dog) => {
    setModal(dog);
    setForm({ adopterName:'', adopterEmail:'', adopterPhone:'', message:'' });
    setFormErrors({});
    setSubmitResult(null);
  };

  const handleAdopt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal || !validate()) return;
    setSubmitting(true);
    try {
      await sendAdoptionRequest({ dogId: modal._id, ...form });
      setSubmitResult({ ok: true, msg: `Your adoption request for ${modal.name} has been submitted! The owner will contact you soon.` });
    } catch (err: any) {
      setSubmitResult({ ok: false, msg: err.message });
    } finally { setSubmitting(false); }
  };

  const clearFilters = () => { setFilters({ location:'', vaccinated:'', health:'' }); setSearch(''); };
  const activeFilterCount = [filters.location, filters.vaccinated, filters.health].filter(Boolean).length;

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ background: '#020617' }}>
      {/* Nav */}
      <motion.nav initial={{ y:-50, opacity:0 }} animate={{ y:0, opacity:1 }}
        className="glass-panel sticky top-0 z-50 py-4 px-6 border-b border-white/5 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-extrabold flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg transition-colors" style={{ background:'rgba(99,102,241,0.1)' }}>
              <PawPrint className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="gradient-text">Paws&Hearts</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-500 transition-all" style={{ background:'rgba(30,41,59,0.5)' }}>
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </div>
      </motion.nav>

      <main className="max-w-7xl mx-auto px-4 py-10 w-full flex-grow">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8 space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">Browse Available Dogs</h1>
          <p className="text-slate-400">Find your perfect companion from across Tamil Nadu.</p>
        </motion.div>

        {/* Search + Filter bar */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, breed, or location…"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-500 border border-slate-700/60 focus:outline-none focus:border-indigo-500 transition-colors"
              style={{ background:'rgba(15,23,42,0.8)' }} />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>}
          </div>
          <button onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border transition-all"
            style={{ background: showFilters ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.8)', borderColor: showFilters ? 'rgba(99,102,241,0.4)' : 'rgba(51,65,85,0.6)', color: showFilters ? '#a5b4fc' : '#94a3b8' }}>
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFilterCount > 0 && <span className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>}
          </button>
          {(activeFilterCount > 0 || search) && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-all">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </motion.div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
              className="overflow-hidden mb-6">
              <div className="glass-panel rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                  <select value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 border border-slate-700/60 focus:outline-none focus:border-indigo-500 transition-colors"
                    style={{ background:'rgba(15,23,42,0.9)' }}>
                    <option value="">All Locations</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vaccination</label>
                  <select value={filters.vaccinated} onChange={e => setFilters(f => ({ ...f, vaccinated: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 border border-slate-700/60 focus:outline-none focus:border-indigo-500 transition-colors"
                    style={{ background:'rgba(15,23,42,0.9)' }}>
                    <option value="">Any</option>
                    <option value="true">Vaccinated Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Health Status</label>
                  <select value={filters.health} onChange={e => setFilters(f => ({ ...f, health: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 border border-slate-700/60 focus:outline-none focus:border-indigo-500 transition-colors"
                    style={{ background:'rgba(15,23,42,0.9)' }}>
                    <option value="">Any</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Minor Care Required">Minor Care Required</option>
                    <option value="Special Needs">Special Needs</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        {!loading && !error && (
          <p className="text-sm text-slate-500 mb-6">{dogs.length} dog{dogs.length !== 1 ? 's' : ''} found</p>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="glass-card rounded-2xl p-4 h-[380px] animate-pulse flex flex-col gap-4">
                <div className="w-full h-48 rounded-xl" style={{ background:'rgba(30,41,59,0.8)' }} />
                <div className="h-6 rounded-lg w-3/4" style={{ background:'rgba(30,41,59,0.8)' }} />
                <div className="h-4 rounded w-1/2" style={{ background:'rgba(30,41,59,0.8)' }} />
                <div className="mt-auto h-10 rounded-xl" style={{ background:'rgba(30,41,59,0.8)' }} />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16 rounded-3xl border border-rose-500/20 max-w-lg mx-auto" style={{ background:'rgba(239,68,68,0.05)' }}>
            <Heart className="w-10 h-10 mx-auto mb-3 opacity-50 text-rose-400" />
            <p className="font-semibold text-rose-400 mb-1">Failed to load dogs</p>
            <p className="text-sm text-slate-500">{error}</p>
            <button onClick={fetchDogs} className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold gradient-btn-indigo">Retry</button>
          </div>
        )}

        {/* Dog grid */}
        {!loading && !error && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.length > 0 ? dogs.map((dog, i) => (
              <motion.div key={dog._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.04 }}
                className="glass-card rounded-[2rem] overflow-hidden flex flex-col group">
                {/* Image */}
                <div className="relative w-full h-52 overflow-hidden" style={{ background:'#0f172a' }}>
                  {dog.imageUrl
                    ? <img src={dog.imageUrl.startsWith('http') ? dog.imageUrl : `${BACKEND_URL}${dog.imageUrl}`} alt={dog.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    : <div className="w-full h-full flex items-center justify-center"><Heart className="w-12 h-12 text-indigo-500/20" /></div>
                  }
                  {dog.vaccinated && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-emerald-400/50" style={{ background:'rgba(16,185,129,0.9)' }}>
                      <ShieldCheck className="w-3 h-3" /> Vaccinated
                    </div>
                  )}
                  {dog.adopted && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background:'rgba(2,6,23,0.85)' }}>
                      <span className="text-rose-400 font-extrabold uppercase tracking-widest text-sm">Adopted 🎉</span>
                    </div>
                  )}
                  {/* Health badge */}
                  {dog.health !== 'Healthy' && !dog.adopted && (
                    <div className="absolute top-3 left-3 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-400/30" style={{ background:'rgba(245,158,11,0.15)' }}>
                      {dog.health}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-slate-100">{dog.name}</h2>
                    <span className="text-xs px-2.5 py-1 rounded-xl border border-slate-700/60 font-semibold text-slate-300" style={{ background:'rgba(30,41,59,0.8)' }}>
                      {dog.age === 0 ? 'Puppy' : `${dog.age} yrs`}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm text-slate-400">
                    <p className="flex items-center gap-2"><Tag className="w-3.5 h-3.5 text-indigo-400" /><span className="text-slate-300 font-medium">{dog.breed}</span></p>
                    <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-pink-400" /><span className="text-slate-300 font-medium">{dog.location}</span></p>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 flex-1">{dog.description}</p>
                  <div className="flex gap-2 pt-1">
                    <Link href={`/dog/${dog._id}`} className="flex-1 text-center py-2.5 rounded-xl font-semibold text-xs border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 transition-all" style={{ background:'rgba(30,41,59,0.5)' }}>
                      View Details
                    </Link>
                    {!dog.adopted && (
                      <button onClick={() => openModal(dog)}
                        className="flex-1 py-2.5 rounded-xl font-bold text-xs gradient-btn-green flex items-center justify-center gap-1.5">
                        <Heart className="w-3.5 h-3.5" /> Adopt
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-20 rounded-3xl border border-slate-800/60" style={{ background:'rgba(15,23,42,0.4)' }}>
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-20 text-indigo-400" />
                <p className="text-xl font-semibold text-slate-200 mb-2">No dogs found</p>
                <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
                <button onClick={clearFilters} className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold gradient-btn-indigo">Clear Filters</button>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-xs" style={{ background:'#020617' }}>
        <div className="flex items-center justify-center gap-1 mb-1"><PawPrint className="w-4 h-4 text-indigo-500/50" /><span className="font-semibold text-slate-500">Paws&Hearts</span></div>
        Dog Adoption Platform © 2026 — Tamil Nadu
      </footer>

      {/* ── Adoption Request Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(2,6,23,0.85)', backdropFilter:'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
            <motion.div initial={{ scale:0.9, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.9, opacity:0 }}
              className="glass-panel rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Adopt {modal.name}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">{modal.breed} · {modal.location}</p>
                </div>
                <button onClick={() => setModal(null)} className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all"><X className="w-5 h-5" /></button>
              </div>

              {submitResult ? (
                <div className="p-8 text-center space-y-4">
                  {submitResult.ok
                    ? <><CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" /><p className="text-lg font-bold text-slate-100">Request Submitted!</p><p className="text-slate-400 text-sm leading-relaxed">{submitResult.msg}</p><button onClick={() => setModal(null)} className="mt-2 px-6 py-3 rounded-xl font-bold text-sm gradient-btn-green">Done</button></>
                    : <><AlertCircle className="w-16 h-16 text-rose-400 mx-auto" /><p className="text-lg font-bold text-slate-100">Submission Failed</p><p className="text-rose-400 text-sm">{submitResult.msg}</p><button onClick={() => setSubmitResult(null)} className="mt-2 px-6 py-3 rounded-xl font-bold text-sm gradient-btn-indigo">Try Again</button></>
                  }
                </div>
              ) : (
                <form onSubmit={handleAdopt} className="p-6 space-y-4">
                  <p className="text-sm text-slate-400 leading-relaxed">Fill in your details and the dog owner will contact you to arrange the adoption.</p>
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Your Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" value={form.adopterName} onChange={e => setForm(f => ({ ...f, adopterName: e.target.value }))}
                        placeholder="e.g. Priya Sharma" className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-500 border focus:outline-none focus:border-indigo-500 transition-colors ${formErrors.adopterName ? 'border-rose-500' : 'border-slate-700/60'}`}
                        style={{ background:'rgba(15,23,42,0.8)' }} />
                    </div>
                    {formErrors.adopterName && <p className="text-rose-400 text-xs mt-1">{formErrors.adopterName}</p>}
                  </div>
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="email" value={form.adopterEmail} onChange={e => setForm(f => ({ ...f, adopterEmail: e.target.value }))}
                        placeholder="name@example.com" className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-500 border focus:outline-none focus:border-indigo-500 transition-colors ${formErrors.adopterEmail ? 'border-rose-500' : 'border-slate-700/60'}`}
                        style={{ background:'rgba(15,23,42,0.8)' }} />
                    </div>
                    {formErrors.adopterEmail && <p className="text-rose-400 text-xs mt-1">{formErrors.adopterEmail}</p>}
                  </div>
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="tel" value={form.adopterPhone} onChange={e => setForm(f => ({ ...f, adopterPhone: e.target.value }))}
                        placeholder="10-digit mobile number" maxLength={10} className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-500 border focus:outline-none focus:border-indigo-500 transition-colors ${formErrors.adopterPhone ? 'border-rose-500' : 'border-slate-700/60'}`}
                        style={{ background:'rgba(15,23,42,0.8)' }} />
                    </div>
                    {formErrors.adopterPhone && <p className="text-rose-400 text-xs mt-1">{formErrors.adopterPhone}</p>}
                  </div>
                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Message to Owner <span className="text-slate-600 normal-case">(optional)</span></label>
                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell the owner a bit about yourself and why you'd like to adopt…" rows={3}
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
