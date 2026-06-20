import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, PawPrint, ShieldCheck, Heart, MapPin, Tag,
  Activity, User, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import {
  getDogDetails, submitApplication, getApplications, V2Dog, getDogImageUrl, formatDogAge, getDogLocation
} from '../../utils/index';
import { useAuth } from '../../context/AuthContext';

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

export default function DogDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [dog, setDog] = useState<V2Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ApplyForm>({
    reasonForAdopting: '', hasOtherPets: false, otherPetsDescription: '', familyMembersCount: '1', agreeToHomeVisit: false,
    adopterPhone: '', adopterWhatsApp: '', adopterCity: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ApplyForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [myApplication, setMyApplication] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const dogRes: any = await getDogDetails(id as string);
        setDog(dogRes.data);
        // If user is an adopter, check if they have an existing application for this dog
        if (user && user.role === 'adopter') {
          try {
            const appsRes: any = await getApplications();
            if (appsRes.success) {
              const mine = appsRes.data.find((a: any) => a.dogId?._id === id || a.dogId === id);
              setMyApplication(mine || null);
            }
          } catch { /* non-critical */ }
        }
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [id, user]);

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

  const openModal = () => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'adopter') {
      alert('Only adopter accounts can submit adoption applications.');
      return;
    }
    setForm({ reasonForAdopting: '', hasOtherPets: false, otherPetsDescription: '', familyMembersCount: '1', agreeToHomeVisit: false, adopterPhone: '', adopterWhatsApp: '', adopterCity: '' });
    setFormErrors({}); setResult(null); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dog || !validate()) return;
    setSubmitting(true);
    try {
      await submitApplication({
        dogId: dog._id,
        reasonForAdopting: form.reasonForAdopting.trim(),
        hasOtherPets: form.hasOtherPets,
        otherPetsDescription: form.otherPetsDescription || undefined,
        familyMembersCount: Number(form.familyMembersCount),
        agreeToHomeVisit: form.agreeToHomeVisit,
        adopterPhone: form.adopterPhone.trim() || undefined,
        adopterWhatsApp: form.adopterWhatsApp.trim() || undefined,
        adopterCity: form.adopterCity.trim() || undefined,
      });
      setResult({ ok: true, msg: `Your application for ${dog.name} was submitted! Check your dashboard for updates.` });
    } catch (err: any) {
      setResult({ ok: false, msg: err.message });
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#020617' }}>
      <span className="text-slate-400 font-medium">Loading profile…</span>
    </div>
  );

  if (error || !dog) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background:'#020617' }}>
      <div className="text-center py-16 px-8 rounded-3xl max-w-lg space-y-6 border border-rose-500/20" style={{ background:'rgba(239,68,68,0.05)' }}>
        <Heart className="w-16 h-16 mx-auto opacity-50 text-rose-400" />
        <p className="text-3xl font-extrabold text-slate-100">Profile Not Found</p>
        <p className="text-base text-slate-400">{error || 'This dog profile could not be found.'}</p>
        <Link href="/browse" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs gradient-btn-indigo">
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </Link>
      </div>
    </div>
  );

  const imageUrl = getDogImageUrl(dog);
  const location = getDogLocation(dog);
  const healthColor = dog.healthStatus === 'Healthy' ? 'text-emerald-400' : dog.healthStatus === 'Minor Care Required' ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ background:'#020617' }}>
      <motion.nav initial={{ y:-50, opacity:0 }} animate={{ y:0, opacity:1 }}
        className="glass-panel sticky top-0 z-50 py-4 px-6 border-b border-white/5 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-extrabold flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-indigo-400" />
            <span className="gradient-text">Paws&Hearts</span>
          </Link>
          <Link href="/browse" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700/50 text-slate-300" style={{ background:'rgba(30,41,59,0.5)' }}>
            <ArrowLeft className="w-4 h-4" /> Browse
          </Link>
        </div>
      </motion.nav>

      <main className="max-w-5xl mx-auto px-4 py-12 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} className="lg:col-span-5 space-y-5">
            <div className="w-full h-80 lg:h-[420px] rounded-[2rem] overflow-hidden border border-slate-800 relative" style={{ background:'#0f172a' }}>
              {imageUrl
                ? <img src={imageUrl} alt={dog.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><Heart className="w-16 h-16 text-indigo-500/20" /></div>
              }
              {dog.vaccinated && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 text-white text-xs font-bold uppercase px-3 py-1.5 rounded-full" style={{ background:'rgba(16,185,129,0.9)' }}>
                  <ShieldCheck className="w-3.5 h-3.5" /> Vaccinated
                </div>
              )}
              {dog.adopted && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background:'rgba(2,6,23,0.8)' }}>
                  <span className="text-rose-400 font-extrabold uppercase tracking-widest text-lg">Adopted 🎉</span>
                </div>
              )}
            </div>
            <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-3">
              <h3 className="text-lg font-bold text-slate-100">Give {dog.name} a Home</h3>
              {!dog.adopted ? (
                <button onClick={openModal} className="w-full py-4 rounded-2xl font-bold uppercase tracking-wider text-sm gradient-btn-green flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" /> Apply to Adopt
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm border border-rose-500/20 text-rose-400" style={{ background:'rgba(239,68,68,0.08)' }}>
                  Already Adopted
                </div>
              )}
              {/* Only show apply button hint to non-logged-in visitors or logged-in non-adopters */}
              {!user || user.role !== 'adopter' ? (
                <p className="text-xs text-slate-500 text-center">Sign in as an adopter to submit an application</p>
              ) : myApplication ? (
                <p className="text-xs text-center px-2 py-1.5 rounded-lg border border-indigo-500/20 text-indigo-300" style={{ background: 'rgba(99,102,241,0.07)' }}>
                  ✅ You applied on {new Date(myApplication.createdAt).toLocaleDateString()} — Status: <strong className="capitalize">{myApplication.status.replace(/_/g, ' ')}</strong>
                </p>
              ) : null}
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }} className="lg:col-span-7 space-y-7">
            <div className="space-y-3">
              <h1 className="text-5xl font-extrabold text-slate-100">{dog.name}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-indigo-400 border border-indigo-500/20" style={{ background:'rgba(99,102,241,0.1)' }}>
                  <Tag className="w-3.5 h-3.5" /> {dog.breed}
                </span>
                <span className="px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-300 border border-slate-700/60" style={{ background:'rgba(30,41,59,0.8)' }}>
                  {formatDogAge(dog.age)}
                </span>
                {dog.gender && <span className="px-3 py-1.5 rounded-xl text-sm text-slate-400 border border-slate-700/60">{dog.gender}</span>}
                {dog.size && <span className="px-3 py-1.5 rounded-xl text-sm text-slate-400 border border-slate-700/60">{dog.size}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5 rounded-3xl space-y-2">
                <Activity className="w-5 h-5 text-pink-400" />
                <span className="block text-xs font-semibold text-slate-500 uppercase">Health</span>
                <span className={`text-base font-bold block ${healthColor}`}>{dog.healthStatus}</span>
              </div>
              <div className="glass-card p-5 rounded-3xl space-y-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="block text-xs font-semibold text-slate-500 uppercase">Location</span>
                <span className="text-base font-bold text-slate-200 block">{location}</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-100">About {dog.name}</h3>
              <p className="text-slate-300 leading-relaxed p-5 rounded-2xl border border-slate-800/40" style={{ background:'rgba(15,23,42,0.5)' }}>{dog.description}</p>
            </div>
            {dog.listedBy && (
              <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-3">
                <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2"><User className="w-4 h-4" /> Listed by</h3>
                <p className="text-slate-200 font-semibold">{dog.listedBy.name}</p>
                {/* Show contact details only if this adopter's application is approved */}
                {myApplication?.status === 'approved' ? (
                  <div className="space-y-1 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                    <p className="text-xs font-semibold text-emerald-400 mb-1">✅ Your application is approved! Contact the donor:</p>
                    {dog.listedBy.email && (
                      <p className="text-sm text-slate-300">📧 <a href={`mailto:${dog.listedBy.email}`} className="underline font-medium">{dog.listedBy.email}</a></p>
                    )}
                    {dog.listedBy.phone && (
                      <p className="text-sm text-slate-300">📞 <a href={`tel:${dog.listedBy.phone}`} className="underline font-medium">{dog.listedBy.phone}</a></p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Contact details shared after your application is approved.</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(2,6,23,0.85)', backdropFilter:'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              className="glass-panel rounded-3xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="text-xl font-bold text-slate-100">Apply for {dog.name}</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              {result ? (
                <div className="p-8 text-center space-y-4">
                  {result.ok ? (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                      <p className="text-slate-400 text-sm">{result.msg}</p>
                      <Link href="/dashboard" className="inline-block px-6 py-3 rounded-xl font-bold text-sm gradient-btn-green">Dashboard</Link>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-16 h-16 text-rose-400 mx-auto" />
                      <p className="text-rose-400 text-sm">{result.msg}</p>
                      <button onClick={() => setResult(null)} className="px-6 py-3 rounded-xl font-bold text-sm gradient-btn-indigo">Try Again</button>
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Contact info banner */}
                  <div className="p-3 rounded-xl border border-indigo-500/20 text-xs text-indigo-300" style={{ background: 'rgba(99,102,241,0.08)' }}>
                    📱 No in-app chat — the donor will reach you via WhatsApp or phone after reviewing your application.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number *</label>
                      <input value={form.adopterPhone} onChange={e => setForm(f => ({ ...f, adopterPhone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 border focus:outline-none focus:border-indigo-500 ${(formErrors as any).adopterPhone ? 'border-rose-500' : 'border-slate-700/60'}`}
                        style={{ background:'rgba(15,23,42,0.8)' }} />
                      {(formErrors as any).adopterPhone && <p className="text-rose-400 text-xs mt-1">{(formErrors as any).adopterPhone}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">WhatsApp</label>
                      <input value={form.adopterWhatsApp} onChange={e => setForm(f => ({ ...f, adopterWhatsApp: e.target.value }))}
                        placeholder="If different from phone"
                        className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 border border-slate-700/60 focus:outline-none focus:border-indigo-500"
                        style={{ background:'rgba(15,23,42,0.8)' }} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Your City *</label>
                    <input value={form.adopterCity} onChange={e => setForm(f => ({ ...f, adopterCity: e.target.value }))}
                      placeholder="e.g. Chennai"
                      className={`w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 border focus:outline-none focus:border-indigo-500 ${(formErrors as any).adopterCity ? 'border-rose-500' : 'border-slate-700/60'}`}
                      style={{ background:'rgba(15,23,42,0.8)' }} />
                    {(formErrors as any).adopterCity && <p className="text-rose-400 text-xs mt-1">{(formErrors as any).adopterCity}</p>}
                  </div>

                  <textarea value={form.reasonForAdopting} onChange={e => setForm(f => ({ ...f, reasonForAdopting: e.target.value }))} rows={4}
                    placeholder="Why do you want to adopt this dog? (min 20 chars)"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 border resize-none ${formErrors.reasonForAdopting ? 'border-rose-500' : 'border-slate-700/60'}`}
                    style={{ background:'rgba(15,23,42,0.8)' }} />
                  {formErrors.reasonForAdopting && <p className="text-rose-400 text-xs">{formErrors.reasonForAdopting}</p>}

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Family members at home</label>
                    <input type="number" min={1} value={form.familyMembersCount} onChange={e => setForm(f => ({ ...f, familyMembersCount: e.target.value }))}
                      placeholder="e.g. 3"
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 border border-slate-700/60" style={{ background:'rgba(15,23,42,0.8)' }} />
                  </div>

                  <label className="flex items-center gap-2"><input type="checkbox" checked={form.hasOtherPets} onChange={e => setForm(f => ({ ...f, hasOtherPets: e.target.checked }))} className="accent-indigo-500" /><span className="text-sm text-slate-300">I have other pets</span></label>
                  {form.hasOtherPets && (
                    <input value={form.otherPetsDescription} onChange={e => setForm(f => ({ ...f, otherPetsDescription: e.target.value }))}
                      placeholder="Describe your other pets…"
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 border border-slate-700/60"
                      style={{ background:'rgba(15,23,42,0.8)' }} />
                  )}
                  <label className="flex items-start gap-2"><input type="checkbox" checked={form.agreeToHomeVisit} onChange={e => setForm(f => ({ ...f, agreeToHomeVisit: e.target.checked }))} className="accent-indigo-500 mt-1" /><span className="text-sm text-slate-300">I agree to a home visit</span></label>
                  {formErrors.agreeToHomeVisit && <p className="text-rose-400 text-xs">{formErrors.agreeToHomeVisit}</p>}
                  <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-xl font-bold text-sm gradient-btn-green disabled:opacity-50">
                    {submitting ? 'Submitting…' : 'Submit Application'}
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
