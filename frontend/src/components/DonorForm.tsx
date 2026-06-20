import React, { useState } from 'react';
import Link from 'next/link';
import { createDog } from '../utils/index';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, CheckCircle2, LogIn } from 'lucide-react';

interface DonorFormProps { onSuccess?: () => void; }

const inp = 'w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-500 border focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors';
const bg  = { background: 'rgba(15,23,42,0.8)' };

const FormField = ({ name, label, type='text', placeholder='', icon: Icon, rows=0, maxLen, form, touch, errors }: any) => (
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />}
      {rows > 0
        ? <textarea value={(form as any)[name]} onChange={e => touch(name, e.target.value)} placeholder={placeholder} rows={rows}
            className={`${inp} ${Icon ? 'pl-9' : ''} resize-none ${errors[name] ? 'border-rose-500' : 'border-slate-700/60'}`} style={bg} />
        : <input type={type} value={(form as any)[name]} onChange={e => touch(name, e.target.value)} placeholder={placeholder}
            maxLength={maxLen} className={`${inp} ${Icon ? 'pl-9' : ''} ${errors[name] ? 'border-rose-500' : 'border-slate-700/60'}`} style={bg} />
      }
    </div>
    {errors[name] && <p className="text-rose-400 text-xs mt-1">{errors[name]}</p>}
  </div>
);

export default function DonorForm({ onSuccess }: DonorFormProps) {
  const { user, loading } = useAuth();
  const [form, setForm] = useState({
    dogName:'', dogBreed:'', dogAge:'', dogHealth:'Healthy',
    dogVaccinated: false, dogLocation:'', dogDescription:'',
    dogGender: 'Male', dogSize: 'Medium',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const canList = user && ['donor', 'shelter', 'admin'].includes(user.role);

  const validate = (): boolean => {
    const e: Record<string,string> = {};
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
    } else setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canList || !validate()) return;
    setSubmitting(true); setMessage('');
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

      await createDog(payload);
      setIsSuccess(true);
      setMessage(`${form.dogName} is now listed for adoption!`);
      setForm({ dogName:'', dogBreed:'', dogAge:'', dogHealth:'Healthy', dogVaccinated:false, dogLocation:'', dogDescription:'', dogGender:'Male', dogSize:'Medium' });
      setImageFile(null); setImagePreview(null);
      setTimeout(() => {
        onSuccess?.();
        // Redirect to My Listings after a short delay
        window.location.href = '/my-listings';
      }, 1500);
    } catch (err: any) {
      setIsSuccess(false);
      setMessage(err.message || 'Something went wrong');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="glass-panel p-6 rounded-2xl text-slate-400 text-sm">Loading…</div>;

  if (!user) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-4">
        <LogIn className="w-10 h-10 text-indigo-400 mx-auto" />
        <p className="text-slate-300">Sign in as a donor or shelter to list a dog.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="px-5 py-2.5 rounded-xl text-sm font-bold gradient-btn-indigo">Sign In</Link>
          <Link href="/register" className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-600 text-slate-300">Register</Link>
        </div>
      </div>
    );
  }

  if (!canList) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
        <p className="text-slate-300">Your account is registered as an <strong>adopter</strong>.</p>
        <p className="text-slate-500 text-sm">To list dogs, register a separate donor or shelter account.</p>
        <Link href="/register" className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold gradient-btn-indigo">Create Donor Account</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl shadow-xl space-y-6" noValidate>
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-start gap-2 ${isSuccess ? 'text-emerald-400 border border-emerald-500/20' : 'text-rose-400 border border-rose-500/20'}`}
          style={{ background: isSuccess ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
          {isSuccess ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <span className="shrink-0">⚠️</span>}
          <span>{message}</span>
        </div>
      )}

      <p className="text-sm text-slate-400">Listing as <strong className="text-slate-200">{user.name}</strong> ({user.role})</p>

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-pink-400 border-b border-white/5 pb-2">🐕 Dog Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <FormField name="dogName" label="Dog's Name" placeholder="e.g. Rocky" form={form} touch={touch} errors={errors} />
          <FormField name="dogBreed" label="Breed" placeholder="e.g. Rajapalayam" form={form} touch={touch} errors={errors} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField name="dogAge" label="Age (Years)" type="number" placeholder="0–30" form={form} touch={touch} errors={errors} />
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Health Status</label>
            <select value={form.dogHealth} onChange={e => touch('dogHealth', e.target.value)} className={`${inp} border-slate-700/60`} style={bg}>
              <option value="Healthy">Healthy</option>
              <option value="Minor Care Required">Minor Care Required</option>
              <option value="Special Needs">Special Needs</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
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
        <FormField name="dogLocation" label="Location" placeholder="City, Tamil Nadu" icon={MapPin} form={form} touch={touch} errors={errors} />
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.dogVaccinated} onChange={e => touch('dogVaccinated', e.target.checked)} className="w-4 h-4 accent-indigo-500" />
          <span className="text-sm text-slate-300">Vaccinated</span>
        </label>
        <FormField name="dogDescription" label="Description" placeholder="Friendly, energetic…" rows={3} form={form} touch={touch} errors={errors} />
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dog Photo</label>
          {imagePreview && <img src={imagePreview} alt="preview" className="w-full h-32 object-cover rounded-xl mb-2 border border-slate-700/60" />}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImage}
            className={`${inp} border-slate-700/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:text-indigo-400`}
            style={{ ...bg, paddingTop: '0.5rem', paddingBottom: '0.5rem' }} />
          {errors.image && <p className="text-rose-400 text-xs mt-1">{errors.image}</p>}
        </div>
      </div>

      <button type="submit" disabled={submitting}
        className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm gradient-btn-indigo disabled:opacity-50 flex items-center justify-center gap-2">
        {submitting ? 'Listing…' : 'List Dog for Adoption'}
      </button>
    </form>
  );
}
