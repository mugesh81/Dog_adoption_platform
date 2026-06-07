import React, { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, HeartPulse, HeartHandshake, ArrowRight, PawPrint, Dog, Users, Heart } from 'lucide-react';
import DonorForm from '../components/DonorForm';
import AdopterForm from '../components/AdopterForm';
import DogList from '../components/DogList';
import { getStats } from '../utils/index';

interface Stats { available: number; adopted: number; adopters: number; donors: number; }

const HomePage = () => {
  const dogListRef = useRef<HTMLElement>(null);
  const [dogListKey, setDogListKey] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getStats().then(r => r?.data && setStats(r.data)).catch(() => {});
  }, [dogListKey]);

  const scrollToDogs = useCallback(() => {
    dogListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const refreshDogList = useCallback(() => {
    setDogListKey(k => k + 1);
    setTimeout(() => dogListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500);
  }, []);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col overflow-x-hidden" style={{ background: '#020617' }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel sticky top-0 z-50 py-4 px-6 border-b border-white/5 backdrop-blur-2xl"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2 group">
            <div className="p-2 rounded-xl transition-colors" style={{ background: 'rgba(99,102,241,0.1)' }}>
              <PawPrint className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="gradient-text">Paws&Hearts</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/admin"
              className="hidden sm:flex items-center gap-2 text-indigo-400 hover:text-indigo-300 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              <ShieldCheck className="w-4 h-4" /> Admin
            </Link>
            <button onClick={scrollToDogs}
              className="hidden sm:block text-slate-400 hover:text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              Browse Dogs
            </button>
            <Link href="/browse"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all gradient-btn-indigo">
              All Dogs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <header className="relative pt-32 pb-28 px-4 overflow-hidden border-b border-white/5">
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', filter: 'blur(40px)', animationDelay: '2s' }} />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-indigo-300 border border-indigo-500/20 text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.08)' }}>
              <HeartHandshake className="w-3.5 h-3.5" /> Saving Lives in Tamil Nadu
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
            className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[1.05]"
          >
            Adopt, Don't{' '}
            <br className="hidden md:block" />
            <span className="gradient-text">Abandon.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Connecting caring dog owners with loving families across Tamil Nadu.
            Every abandoned dog deserves a second chance at life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center pt-2"
          >
            <button onClick={scrollToDogs}
              className="group px-8 py-4 rounded-2xl font-bold uppercase tracking-wider text-sm gradient-btn-indigo flex items-center gap-3">
              Find Your Best Friend
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link href="/browse"
              className="px-8 py-4 rounded-2xl font-bold uppercase tracking-wider text-sm text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition-all"
              style={{ background: 'rgba(30,41,59,0.5)' }}>
              Browse All
            </Link>
          </motion.div>

          {/* Live stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-10 pt-6"
          >
            {[
              { icon: Dog,   value: stats ? String(stats.available) : '…', label: 'Dogs Available' },
              { icon: Heart, value: stats ? String(stats.adopted)   : '…', label: 'Adopted' },
              { icon: Users, value: stats ? String(stats.adopters)  : '…', label: 'Adopters Registered' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-extrabold gradient-text">{s.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-24 w-full space-y-32">

        {/* Registration portals */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start relative">
          {/* Donor */}
          <motion.div
            initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6 relative"
          >
            <div className="absolute -left-10 top-10 w-40 h-40 rounded-full -z-10"
              style={{ background: 'rgba(99,102,241,0.08)', filter: 'blur(60px)' }} />
            <div className="space-y-3">
              <h2 className="text-4xl font-extrabold text-slate-100 flex items-center gap-3">
                <div className="p-3 rounded-2xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <PawPrint className="w-6 h-6 text-indigo-400" />
                </div>
                Owner Portal
              </h2>
              <p className="text-slate-400 text-base font-light leading-relaxed max-w-md">
                Register and list your dog. Your listing appears instantly in the dogs section below.
              </p>
            </div>
            <DonorForm onSuccess={refreshDogList} />
          </motion.div>

          {/* Adopter */}
          <motion.div
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="space-y-6 relative"
          >
            <div className="absolute -right-10 top-10 w-40 h-40 rounded-full -z-10"
              style={{ background: 'rgba(236,72,153,0.08)', filter: 'blur(60px)' }} />
            <div className="space-y-3">
              <h2 className="text-4xl font-extrabold text-slate-100 flex items-center gap-3">
                <div className="p-3 rounded-2xl" style={{ background: 'rgba(236,72,153,0.1)' }}>
                  <HeartHandshake className="w-6 h-6 text-pink-400" />
                </div>
                Adopter Portal
              </h2>
              <p className="text-slate-400 text-base font-light leading-relaxed max-w-md">
                Register as an adopter — after submitting you'll be scrolled straight to the dogs waiting for a home.
              </p>
            </div>
            <AdopterForm onSuccess={scrollToDogs} />
          </motion.div>
        </section>

        {/* Dog listings */}
        <section ref={dogListRef} className="space-y-12 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center space-y-3"
          >
            <span className="text-indigo-400 font-bold tracking-widest uppercase text-xs">Available Now</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-100">Dogs Looking for a Home</h2>
            <p className="text-slate-400 text-lg font-light max-w-xl mx-auto">
              Beautiful souls from across Tamil Nadu waiting for a warm bed and a loving family.
            </p>
          </motion.div>

          <DogList key={dogListKey} />

          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} className="text-center pt-4"
          >
            <Link href="/browse"
              className="inline-flex items-center gap-3 text-slate-200 border border-slate-700/80 px-8 py-4 rounded-2xl font-bold uppercase tracking-wider text-sm transition-all hover:border-indigo-500/50 hover:text-white group"
              style={{ background: 'rgba(30,41,59,0.6)' }}>
              View All Available Dogs
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </section>

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 1 }}
          className="glass-panel rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, rgba(99,102,241,0.05) 0%, transparent 60%)' }} />

          <div className="text-center space-y-3 mb-16 relative z-10">
            <span className="text-indigo-400 font-bold tracking-widest uppercase text-xs">The Paws&Hearts Difference</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight">How We Save Lives</h2>
            <p className="text-slate-400 text-lg font-light max-w-2xl mx-auto">
              A structured, safe system for animal welfare in Tamil Nadu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {[
              {
                icon: ShieldCheck, title: 'Verified Profiles',
                desc: 'Both dog owners and adopters go through validation checks to ensure responsible pet ownership.',
                color: 'text-indigo-400', bg: 'rgba(99,102,241,0.1)',
              },
              {
                icon: HeartPulse, title: 'Health Tracking',
                desc: 'We record health conditions and vaccination status so adopters can find healthy, happy pets.',
                color: 'text-pink-400', bg: 'rgba(236,72,153,0.1)',
              },
              {
                icon: HeartHandshake, title: '100% Free Adoption',
                desc: 'Our mission is saving lives. No commercial sales — only loving homes for abandoned dogs.',
                color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)',
              },
            ].map((f, i) => (
              <motion.div key={i} whileHover={{ y: -8 }} className="glass-card p-8 rounded-3xl space-y-5">
                <div className={`${f.color} w-14 h-14 rounded-2xl flex items-center justify-center`}
                  style={{ background: f.bg }}>
                  <f.icon className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-100">{f.title}</h3>
                  <p className="text-slate-400 font-light leading-relaxed text-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-4 mt-20 text-center text-slate-500 space-y-3"
        style={{ background: '#020617' }}>
        <div className="flex items-center justify-center gap-2 text-slate-300">
          <PawPrint className="w-5 h-5 text-indigo-500" />
          <span className="font-bold tracking-wide">Paws&Hearts</span>
        </div>
        <p className="text-sm font-light">Together, we can save lives and create happy endings for abandoned dogs.</p>
        <p className="text-xs opacity-40">Dog Adoption Platform © 2026 — Tamil Nadu Animal Welfare</p>
      </footer>
    </div>
  );
};

export default HomePage;
