import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, MapPin, Tag, Heart, PawPrint, ArrowLeft,
  Search, SlidersHorizontal, X, CheckCircle2, AlertCircle, LogIn
} from 'lucide-react';
import { browseDogs, submitApplication, V2Dog, getDogImageUrl, formatDogAge, getDogLocation } from '../utils/index';
import { useAuth } from '../context/AuthContext';

interface ApplyForm {
  reasonForAdopting: string;
  hasOtherPets: boolean;
  otherPetsDescription: string;
  familyMembersCount: string;
  agreeToHomeVisit: boolean;
  adopterPhone: string;
  adopterWhatsApp: string;
  adopterCity: string;
}

const LOCATIONS = ['Chennai','Coimbatore','Madurai','Trichy','Salem','Tirunelveli','Puducherry','Vellore','Erode','Thanjavur'];

export default function BrowsePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [dogs, setDogs] = useState<V2Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ location: '', vaccinated: '', healthStatus: '' });
  const [modal, setModal] = useState<V2Dog | null>(null);
  const [form, setForm] = useState<ApplyForm>({
    reasonForAdopting: '', hasOtherPets: false, otherPetsDescription: '', familyMembersCount: '1', agreeToHomeVisit: false,
    adopterPhone: '', adopterWhatsApp: '', adopterCity: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ApplyForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchDogs = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const params: Record<string, string> = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (filters.location) params.location = filters.location;
      if (filters.vaccinated) params.vaccinated = filters.vaccinated;
      if (filters.healthStatus) params.healthStatus = filters.healthStatus;
      const res: any = await browseDogs(params);
      setDogs(res?.data || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [debouncedSearch, filters]);

  useEffect(() => { fetchDogs(); }, [fetchDogs]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof ApplyForm, string>> = {};
    if (!form.reasonForAdopting.trim() || form.reasonForAdopting.trim().length < 20)
      errs.reasonForAdopting = 'Please share at least 20 characters about why you want to adopt';
    const count = Number(form.familyMembersCount);
    if (!count || count < 1) errs.familyMembersCount = 'Enter number of family members (min 1)';
    if (!form.agreeToHomeVisit) errs.agreeToHomeVisit = 'You must agree to a home visit';
    if (!form.adopterPhone.trim()) errs.adopterPhone = 'Phone number is required so the donor can contact you';
    if (!form.adopterCity.trim()) errs.adopterCity = 'City is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openModal = (dog: V2Dog) => {
    if (!user) {
      router.push(`/login?redirect=/browse`);
      return;
    }
    if (user.role !== 'adopter') {
      alert('Only adopter accounts can submit adoption applications. Please register as an adopter.');
      return;
    }
    setModal(dog);
    setForm({ reasonForAdopting: '', hasOtherPets: false, otherPetsDescription: '', familyMembersCount: '1', agreeToHomeVisit: false, adopterPhone: '', adopterWhatsApp: '', adopterCity: '' });
    setFormErrors({});
    setSubmitResult(null);
  };

  const handleAdopt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal || !validate()) return;
    setSubmitting(true);
    try {
      await submitApplication({
        dogId: modal._id,
        reasonForAdopting: form.reasonForAdopting.trim(),
        hasOtherPets: form.hasOtherPets,
        otherPetsDescription: form.otherPetsDescription || undefined,
        familyMembersCount: Number(form.familyMembersCount),
        agreeToHomeVisit: form.agreeToHomeVisit,
        adopterPhone: form.adopterPhone.trim() || undefined,
        adopterWhatsApp: form.adopterWhatsApp.trim() || undefined,
        adopterCity: form.adopterCity.trim() || undefined,
      });
      setSubmitResult({ ok: true, msg: `Your application for ${modal.name} was submitted! Track progress on your dashboard.` });
    } catch (err: any) {
      setSubmitResult({ ok: false, msg: err.message });
    } finally { setSubmitting(false); }
  };

  const clearFilters = () => { setFilters({ location:'', vaccinated:'', healthStatus:'' }); setSearch(''); };
  const activeFilterCount = [filters.location, filters.vaccinated, filters.healthStatus].filter(Boolean).length;

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ background: '#020617' }}>
      <motion.nav initial={{ y:-50, opacity:0 }} animate={{ y:0, opacity:1 }}
        className="glass-panel sticky top-0 z-50 py-4 px-6 border-b border-white/5 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-extrabold flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg transition-colors" style={{ background:'rgba(99,102,241,0.1)' }}>
              <PawPrint className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="gradient-text">Paws&Hearts</span>
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/dashboard" className="px-4 py-2 rounded-xl text-sm font-semibold text-indigo-400 border border-indigo-500/30">Dashboard</Link>
            ) : (
              <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 border border-slate-700/50 flex items-center gap-1"><LogIn className="w-4 h-4" /> Login</Link>
            )}
            <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-500 transition-all" style={{ background:'rgba(30,41,59,0.5)' }}>
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
          </div>
        </div>
      </motion.nav>

      <main className="max-w-7xl mx-auto px-4 py-10 w-full flex-grow">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8 space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">Browse Available Dogs</h1>
          <p className="text-slate-400">Find your perfect companion from across Tamil Nadu. Sign in as an adopter to apply.</p>
        </motion.div>

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

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="overflow-hidden mb-6">
              <div className="glass-panel rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                  <select value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 border border-slate-700/60 focus:outline-none focus:border-indigo-500" style={{ background:'rgba(15,23,42,0.9)' }}>
                    <option value="">All Locations</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vaccination</label>
                  <select value={filters.vaccinated} onChange={e => setFilters(f => ({ ...f, vaccinated: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 border border-slate-700/60 focus:outline-none focus:border-indigo-500" style={{ background:'rgba(15,23,42,0.9)' }}>
                    <option value="">Any</option>
                    <option value="true">Vaccinated Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Health Status</label>
                  <select value={filters.healthStatus} onChange={e => setFilters(f => ({ ...f, healthStatus: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 border border-slate-700/60 focus:outline-none focus:border-indigo-500" style={{ background:'rgba(15,23,42,0.9)' }}>
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

        {!loading && !error && <p className="text-sm text-slate-500 mb-6">{dogs.length} dog{dogs.length !== 1 ? 's' : ''} found</p>}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="glass-card rounded-2xl p-4 h-[380px] animate-pulse flex flex-col gap-4">
                <div className="w-full h-48 rounded-xl" style={{ background:'rgba(30,41,59,0.8)' }} />
                <div className="h-6 rounded-lg w-3/4" style={{ background:'rgba(30,41,59,0.8)' }} />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16 rounded-3xl border border-rose-500/20 max-w-lg mx-auto" style={{ background:'rgba(239,68,68,0.05)' }}>
            <Heart className="w-10 h-10 mx-auto mb-3 opacity-50 text-rose-400" />
            <p className="font-semibold text-rose-400 mb-1">Failed to load dogs</p>
            <p className="text-sm text-slate-500">{error}</p>
            <button onClick={fetchDogs} className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold gradient-btn-indigo">Retry</button>
          </div>
        )}

        {!loading && !error && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.length > 0 ? dogs.map((dog, i) => {
              const imageUrl = getDogImageUrl(dog);
              const location = getDogLocation(dog);
              return (
                <motion.div key={dog._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.04 }}
                  className="glass-card rounded-[2rem] overflow-hidden flex flex-col group">
                  <div className="relative w-full h-52 overflow-hidden" style={{ background:'#0f172a' }}>
                    {imageUrl
                      ? <img src={imageUrl} alt={dog.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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
                    {dog.healthStatus !== 'Healthy' && !dog.adopted && (
                      <div className="absolute top-3 left-3 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-400/30" style={{ background:'rgba(245,158,11,0.15)' }}>
                        {dog.healthStatus}
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-bold text-slate-100">{dog.name}</h2>
                      <span className="text-xs px-2.5 py-1 rounded-xl border border-slate-700/60 font-semibold text-slate-300" style={{ background:'rgba(30,41,59,0.8)' }}>
                        {formatDogAge(dog.age)}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm text-slate-400">
                      <p className="flex items-center gap-2"><Tag className="w-3.5 h-3.5 text-indigo-400" /><span className="text-slate-300 font-medium">{dog.breed}</span></p>
                      <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-pink-400" /><span className="text-slate-300 font-medium">{location}</span></p>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 flex-1">{dog.description}</p>
                    <div className="flex gap-2 pt-1">
                      <Link href={`/dog/${dog._id}`} className="flex-1 text-center py-2.5 rounded-xl font-semibold text-xs border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 transition-all" style={{ background:'rgba(30,41,59,0.5)' }}>
                        View Details
                      </Link>
                      {!dog.adopted && (
                        <button onClick={() => openModal(dog)} className="flex-1 py-2.5 rounded-xl font-bold text-xs gradient-btn-green flex items-center justify-center gap-1.5">
                          <Heart className="w-3.5 h-3.5" /> Apply
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="col-span-full text-center py-20 rounded-3xl border border-slate-800/60" style={{ background:'rgba(15,23,42,0.4)' }}>
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-20 text-indigo-400" />
                <p className="text-xl font-semibold text-slate-200 mb-2">No dogs found</p>
                <p className="text-sm text-slate-500">Try adjusting your search or run <code className="text-indigo-400">npm run seed</code> in the backend.</p>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-xs" style={{ background:'#020617' }}>
        <div className="flex items-center justify-center gap-1 mb-1"><PawPrint className="w-4 h-4 text-indigo-500/50" /><span className="font-semibold text-slate-500">Paws&Hearts</span></div>
        Dog Adoption Platform © 2026 — Tamil Nadu
      </footer>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(2,6,23,0.85)', backdropFilter:'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
            <motion.div initial={{ scale:0.9, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.9, opacity:0 }}
              className="glass-panel rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0" style={{ background:'rgba(15,23,42,0.95)' }}>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Apply for {modal.name}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">{modal.breed} · {getDogLocation(modal)}</p>
                </div>
                <button onClick={() => setModal(null)} className="p-2 rounded-xl text-slate-500 hover:text-slate-300"><X className="w-5 h-5" /></button>
              </div>

              {submitResult ? (
                <div className="p-8 text-center space-y-4">
                  {submitResult.ok ? (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                      <p className="text-lg font-bold text-slate-100">Application Submitted!</p>
                      <p className="text-slate-400 text-sm">{submitResult.msg}</p>
                      <Link href="/dashboard" className="inline-block mt-2 px-6 py-3 rounded-xl font-bold text-sm gradient-btn-green">Go to Dashboard</Link>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-16 h-16 text-rose-400 mx-auto" />
                      <p className="text-lg font-bold text-slate-100">Submission Failed</p>
                      <p className="text-rose-400 text-sm">{submitResult.msg}</p>
                      <button onClick={() => setSubmitResult(null)} className="mt-2 px-6 py-3 rounded-xl font-bold text-sm gradient-btn-indigo">Try Again</button>
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={handleAdopt} className="p-6 space-y-4">
                  <p className="text-sm text-slate-400">Signed in as <strong className="text-slate-200">{user?.name}</strong>. Complete this application to be considered.</p>
                  
                  {/* Contact Info — needed since there's no in-app chat */}
                  <div className="p-3 rounded-xl border border-indigo-500/20 text-xs text-indigo-300" style={{ background: 'rgba(99,102,241,0.08)' }}>
                    📱 Since we coordinate via WhatsApp/phone, your contact details are shared with the donor only after they review your application.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number *</label>
                      <input value={form.adopterPhone} onChange={e => setForm(f => ({ ...f, adopterPhone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 border focus:outline-none focus:border-indigo-500 ${formErrors.adopterPhone ? 'border-rose-500' : 'border-slate-700/60'}`}
                        style={{ background:'rgba(15,23,42,0.8)' }} />
                      {formErrors.adopterPhone && <p className="text-rose-400 text-xs mt-1">{formErrors.adopterPhone}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">WhatsApp Number</label>
                      <input value={form.adopterWhatsApp} onChange={e => setForm(f => ({ ...f, adopterWhatsApp: e.target.value }))}
                        placeholder="Same as phone or different"
                        className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 border border-slate-700/60 focus:outline-none focus:border-indigo-500"
                        style={{ background:'rgba(15,23,42,0.8)' }} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Your City *</label>
                    <input value={form.adopterCity} onChange={e => setForm(f => ({ ...f, adopterCity: e.target.value }))}
                      placeholder="e.g. Chennai, Coimbatore…"
                      className={`w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 border focus:outline-none focus:border-indigo-500 ${formErrors.adopterCity ? 'border-rose-500' : 'border-slate-700/60'}`}
                      style={{ background:'rgba(15,23,42,0.8)' }} />
                    {formErrors.adopterCity && <p className="text-rose-400 text-xs mt-1">{formErrors.adopterCity}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Why do you want to adopt {modal.name}?</label>
                    <textarea value={form.reasonForAdopting} onChange={e => setForm(f => ({ ...f, reasonForAdopting: e.target.value }))} rows={4}
                      placeholder="Tell us about your home, experience with pets, and why this dog is a good match…"
                      className={`w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 border focus:outline-none focus:border-indigo-500 resize-none ${formErrors.reasonForAdopting ? 'border-rose-500' : 'border-slate-700/60'}`}
                      style={{ background:'rgba(15,23,42,0.8)' }} />
                    {formErrors.reasonForAdopting && <p className="text-rose-400 text-xs mt-1">{formErrors.reasonForAdopting}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Family members at home</label>
                    <input type="number" min={1} value={form.familyMembersCount} onChange={e => setForm(f => ({ ...f, familyMembersCount: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 border focus:outline-none focus:border-indigo-500 ${formErrors.familyMembersCount ? 'border-rose-500' : 'border-slate-700/60'}`}
                      style={{ background:'rgba(15,23,42,0.8)' }} />
                    {formErrors.familyMembersCount && <p className="text-rose-400 text-xs mt-1">{formErrors.familyMembersCount}</p>}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.hasOtherPets} onChange={e => setForm(f => ({ ...f, hasOtherPets: e.target.checked }))} className="w-4 h-4 accent-indigo-500" />
                    <span className="text-sm text-slate-300">I have other pets at home</span>
                  </label>
                  {form.hasOtherPets && (
                    <input value={form.otherPetsDescription} onChange={e => setForm(f => ({ ...f, otherPetsDescription: e.target.value }))}
                      placeholder="Describe your other pets…"
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 border border-slate-700/60 focus:outline-none focus:border-indigo-500"
                      style={{ background:'rgba(15,23,42,0.8)' }} />
                  )}
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.agreeToHomeVisit} onChange={e => setForm(f => ({ ...f, agreeToHomeVisit: e.target.checked }))} className="w-4 h-4 mt-0.5 accent-indigo-500" />
                    <span className="text-sm text-slate-300">I agree to a home visit before adoption is finalized</span>
                  </label>
                  {formErrors.agreeToHomeVisit && <p className="text-rose-400 text-xs">{formErrors.agreeToHomeVisit}</p>}
                  <button type="submit" disabled={submitting || authLoading}
                    className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm gradient-btn-green disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? 'Submitting…' : <><Heart className="w-4 h-4" /> Submit Application</>}
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
