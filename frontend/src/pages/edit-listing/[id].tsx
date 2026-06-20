import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { PawPrint, ArrowLeft, Save, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDogDetails, updateDog, getDogImageUrl, V2Dog } from '../../utils/index';

export default function EditListingPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [dog, setDog] = useState<V2Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    dogName: '', dogBreed: '', dogAge: '', dogHealth: 'Healthy',
    dogVaccinated: false, dogLocation: '', dogDescription: '',
    dogGender: 'Male', dogSize: 'Medium',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canManage = user && ['donor', 'shelter', 'admin'].includes(user.role);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    else if (!authLoading && user && !canManage) router.push('/dashboard');
  }, [user, authLoading, canManage, router]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res: any = await getDogDetails(id as string);
        const dogData = res.data;
        setDog(dogData);

        // Populate form
        setForm({
          dogName: dogData.name,
          dogBreed: dogData.breed,
          dogAge: String(Math.round(dogData.age / 12)),
          dogHealth: dogData.healthStatus,
          dogVaccinated: dogData.vaccinated,
          dogLocation: dogData.location?.address || '',
          dogDescription: dogData.description,
          dogGender: dogData.gender || 'Male',
          dogSize: dogData.size || 'Medium',
        });

        const imageUrl = getDogImageUrl(dogData);
        if (imageUrl) setImagePreview(imageUrl);
      } catch (err: any) {
        setMessage(err.message || 'Failed to load listing');
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.dogName.trim()) e.dogName = 'Dog name is required';
    if (!form.dogBreed.trim()) e.dogBreed = 'Breed is required';
    const age = Number(form.dogAge);
    if (form.dogAge === '' || isNaN(age) || age < 0 || age > 30) e.dogAge = 'Age must be between 0 and 30 years';
    if (!form.dogLocation.trim()) e.dogLocation = 'Location is required';
    if (!form.dogDescription.trim() || form.dogDescription.trim().length < 10) e.dogDescription = 'Description must be at least 10 characters';
    if (imageFile && imageFile.size > 5 * 1024 * 1024) e.image = 'Image must be smaller than 5MB';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const touch = (name: string, value: any) => {
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !dog) return;

    setSubmitting(true);
    setMessage('');

    try {
      const payload = new FormData();
      payload.append('name', form.dogName);
      payload.append('breed', form.dogBreed);
      payload.append('age', form.dogAge);
      payload.append('healthStatus', form.dogHealth);
      payload.append('vaccinated', String(form.dogVaccinated));
      payload.append('location', form.dogLocation);
      payload.append('description', form.dogDescription);
      payload.append('gender', form.dogGender);
      payload.append('size', form.dogSize);
      if (imageFile) payload.append('image', imageFile);

      await updateDog(dog._id, payload);
      setIsSuccess(true);
      setMessage('Listing updated successfully!');
      setTimeout(() => router.push('/my-listings'), 1500);
    } catch (err: any) {
      setIsSuccess(false);
      setMessage(err.message || 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading || !user || !canManage) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020617' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020617' }}>
        <div className="text-center">
          <p className="text-rose-400 text-lg">Listing not found</p>
          <Link href="/my-listings" className="text-indigo-400 hover:underline mt-4 inline-block">Back to Listings</Link>
        </div>
      </div>
    );
  }

  // Authorization check
  if (user.role !== 'admin' && dog.listedBy?._id !== user._id) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020617' }}>
        <div className="text-center">
          <p className="text-rose-400 text-lg">Not authorized to edit this listing</p>
          <Link href="/my-listings" className="text-indigo-400 hover:underline mt-4 inline-block">Back to Listings</Link>
        </div>
      </div>
    );
  }

  const inp = 'w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-500 border focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors';
  const bg = { background: 'rgba(15,23,42,0.8)' };

  return (
    <>
      <Head><title>Edit {dog.name} | Paws&Hearts</title></Head>
      <div className="min-h-screen text-slate-100" style={{ background: '#020617' }}>
        {/* Nav */}
        <motion.nav initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="glass-panel sticky top-0 z-50 py-4 px-6 border-b border-white/5 backdrop-blur-2xl">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-extrabold flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <PawPrint className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="gradient-text">Paws&Hearts</span>
            </Link>
            <Link href="/my-listings" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white border border-slate-700/50" style={{ background: 'rgba(30,41,59,0.5)' }}>
              <ArrowLeft className="w-4 h-4" /> My Listings
            </Link>
          </div>
        </motion.nav>

        {/* Main */}
        <main className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-extrabold text-slate-100 mb-8">Edit Listing: {dog.name}</h1>

          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-6">
            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium flex items-start gap-2 ${isSuccess ? 'text-emerald-400 border border-emerald-500/20' : 'text-rose-400 border border-rose-500/20'}`}
                style={{ background: isSuccess ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
                {isSuccess ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <span className="shrink-0">⚠️</span>}
                <span>{message}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dog's Name</label>
                <input type="text" value={form.dogName} onChange={e => touch('dogName', e.target.value)} placeholder="e.g. Rocky"
                  className={`${inp} ${errors.dogName ? 'border-rose-500' : 'border-slate-700/60'}`} style={bg} />
                {errors.dogName && <p className="text-rose-400 text-xs mt-1">{errors.dogName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Breed</label>
                <input type="text" value={form.dogBreed} onChange={e => touch('dogBreed', e.target.value)} placeholder="e.g. Rajapalayam"
                  className={`${inp} ${errors.dogBreed ? 'border-rose-500' : 'border-slate-700/60'}`} style={bg} />
                {errors.dogBreed && <p className="text-rose-400 text-xs mt-1">{errors.dogBreed}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Age (Years)</label>
                <input type="number" value={form.dogAge} onChange={e => touch('dogAge', e.target.value)} placeholder="0–30"
                  className={`${inp} ${errors.dogAge ? 'border-rose-500' : 'border-slate-700/60'}`} style={bg} />
                {errors.dogAge && <p className="text-rose-400 text-xs mt-1">{errors.dogAge}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Health Status</label>
                <select value={form.dogHealth} onChange={e => touch('dogHealth', e.target.value)} className={`${inp} border-slate-700/60`} style={bg}>
                  <option value="Healthy">Healthy</option>
                  <option value="Minor Care Required">Minor Care Required</option>
                  <option value="Special Needs">Special Needs</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
                <select value={form.dogGender} onChange={e => touch('dogGender', e.target.value)} className={`${inp} border-slate-700/60`} style={bg}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Size</label>
                <select value={form.dogSize} onChange={e => touch('dogSize', e.target.value)} className={`${inp} border-slate-700/60`} style={bg}>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Extra Large">Extra Large</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Location
              </label>
              <input type="text" value={form.dogLocation} onChange={e => touch('dogLocation', e.target.value)} placeholder="City, Tamil Nadu"
                className={`${inp} ${errors.dogLocation ? 'border-rose-500' : 'border-slate-700/60'}`} style={bg} />
              {errors.dogLocation && <p className="text-rose-400 text-xs mt-1">{errors.dogLocation}</p>}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.dogVaccinated} onChange={e => touch('dogVaccinated', e.target.checked)} className="w-4 h-4 accent-indigo-500" />
              <span className="text-sm text-slate-300">Vaccinated</span>
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={form.dogDescription} onChange={e => touch('dogDescription', e.target.value)} rows={4}
                placeholder="Friendly, energetic…"
                className={`${inp} resize-none ${errors.dogDescription ? 'border-rose-500' : 'border-slate-700/60'}`} style={bg} />
              {errors.dogDescription && <p className="text-rose-400 text-xs mt-1">{errors.dogDescription}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dog Photo</label>
              {imagePreview && <img src={imagePreview} alt="preview" className="w-full h-48 object-cover rounded-xl mb-2 border border-slate-700/60" />}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImage}
                className={`${inp} border-slate-700/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:text-indigo-400`}
                style={{ ...bg, paddingTop: '0.5rem', paddingBottom: '0.5rem' }} />
              {errors.image && <p className="text-rose-400 text-xs mt-1">{errors.image}</p>}
              <p className="text-xs text-slate-500 mt-1">Leave empty to keep current image</p>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm gradient-btn-indigo disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? 'Saving…' : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
