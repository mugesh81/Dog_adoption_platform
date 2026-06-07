import React, { useState } from 'react';
import { registerDonor, addDog } from '../utils/index';
import { User, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

interface DonorFormProps { onSuccess?: () => void; }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

const inp = 'w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-500 border focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors';
const bg  = { background: 'rgba(15,23,42,0.8)' };

// Move input helper component outside the main form component to avoid re-creation & focus loss on state changes
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
  const [form, setForm] = useState({
    name:'', email:'', phone:'', address:'',
    dogName:'', dogBreed:'', dogAge:'', dogHealth:'Healthy',
    dogVaccinated: false, dogLocation:'', dogDescription:'',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const e: Record<string,string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email address';
    if (!PHONE_RE.test(form.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!form.address.trim() || form.address.trim().length < 5) e.address = 'Please enter your full address';
    if (!form.dogName.trim()) e.dogName = 'Dog name is required';
    if (!form.dogBreed.trim()) e.dogBreed = 'Breed is required';
    const age = Number(form.dogAge);
    if (form.dogAge === '' || isNaN(age) || age < 0 || age > 30) e.dogAge = 'Age must be between 0 and 30';
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
      if (file.size > 5 * 1024 * 1024) { setErrors(p => ({ ...p, image: 'Image must be smaller than 5MB' })); return; }
      const reader = new FileReader();
      reader.onload = ev => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else { setImagePreview(null); }
    if (errors.image) setErrors(p => { const n = { ...p }; delete n.image; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setMessage('');
    try {
      const donorRes = await registerDonor({ name: form.name, email: form.email, phone: form.phone, address: form.address });
      const donorId  = donorRes?.data?._id;
      if (!donorId) throw new Error('Donor registration failed');

      const payload = new FormData();
      payload.append('name', form.dogName);
      payload.append('breed', form.dogBreed);
      payload.append('age', form.dogAge);
      payload.append('health', form.dogHealth);
      payload.append('vaccinated', String(form.dogVaccinated));
      payload.append('location', form.dogLocation);
      payload.append('description', form.dogDescription);
      if (imageFile) payload.append('image', imageFile);

      await addDog(donorId, payload);
      setIsSuccess(true);
      setMessage(`${form.dogName} is now listed for adoption!`);
      setForm({ name:'', email:'', phone:'', address:'', dogName:'', dogBreed:'', dogAge:'', dogHealth:'Healthy', dogVaccinated:false, dogLocation:'', dogDescription:'' });
      setImageFile(null); setImagePreview(null);
      setTimeout(() => onSuccess?.(), 800);
    } catch (err: any) {
      setIsSuccess(false);
      setMessage(err.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl shadow-xl space-y-6" noValidate>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-start gap-2 ${isSuccess ? 'text-emerald-400 border border-emerald-500/20' : 'text-rose-400 border border-rose-500/20'}`}
          style={{ background: isSuccess ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
          {isSuccess ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <span className="shrink-0">⚠️</span>}
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Owner Details */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-indigo-400 border-b border-white/5 pb-2 flex items-center gap-2">
            <User className="w-4 h-4" /> Owner Details
          </h3>
          <FormField name="name"    label="Your Name"      placeholder="e.g. Arjun Kumar"     icon={User} form={form} touch={touch} errors={errors} />
          <FormField name="email"   label="Email Address"  placeholder="name@example.com"     icon={Mail} type="email" form={form} touch={touch} errors={errors} />
          <FormField name="phone"   label="Phone Number"   placeholder="10-digit mobile"      icon={Phone} maxLen={10} form={form} touch={touch} errors={errors} />
          <FormField name="address" label="Address/Region" placeholder="City, Tamil Nadu"     icon={MapPin} rows={2} form={form} touch={touch} errors={errors} />
        </div>

        {/* Dog Details */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-pink-400 border-b border-white/5 pb-2 flex items-center gap-2">
            🐕 Dog Details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <FormField name="dogName"  label="Dog's Name" placeholder="e.g. Rocky" form={form} touch={touch} errors={errors} />
            <FormField name="dogBreed" label="Breed"      placeholder="e.g. Rajapalayam" form={form} touch={touch} errors={errors} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField name="dogAge" label="Age (Years)" type="number" placeholder="0–30" form={form} touch={touch} errors={errors} />
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Health Status</label>
              <select value={form.dogHealth} onChange={e => touch('dogHealth', e.target.value)}
                className={`${inp} border-slate-700/60`} style={bg}>
                <option value="Healthy">Healthy</option>
                <option value="Minor Care Required">Minor Care Required</option>
                <option value="Special Needs">Special Needs</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField name="dogLocation" label="Location" placeholder="City/Region" form={form} touch={touch} errors={errors} />
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.dogVaccinated} onChange={e => touch('dogVaccinated', e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500" />
                <span className="text-sm font-medium text-slate-300">Vaccinated</span>
              </label>
            </div>
          </div>
          <FormField name="dogDescription" label="Description / Temperament" placeholder="Friendly, energetic, potty-trained…" rows={2} form={form} touch={touch} errors={errors} />

          {/* Image upload with preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dog Photo</label>
            {imagePreview && (
              <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2 border border-slate-700/60">
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 p-1 rounded-full text-white" style={{ background:'rgba(0,0,0,0.6)' }}>
                  ✕
                </button>
              </div>
            )}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImage}
              className={`${inp} border-slate-700/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:text-indigo-400 hover:file:text-indigo-300`}
              style={{ ...bg, paddingTop: '0.5rem', paddingBottom: '0.5rem' }} />
            <p className="text-slate-600 text-xs mt-1">JPEG, PNG, WebP or GIF · Max 5MB</p>
            {errors.image && <p className="text-rose-400 text-xs mt-1">{errors.image}</p>}
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm gradient-btn-indigo disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Processing…</> : 'Register & List Dog for Adoption'}
      </button>
    </form>
  );
}
