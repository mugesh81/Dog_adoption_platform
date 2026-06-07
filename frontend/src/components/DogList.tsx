import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, Tag, Heart, Activity } from 'lucide-react';
import { browseDogs } from '../utils/index';

interface Dog {
  _id: string;
  name: string;
  breed: string;
  age: number;
  location: string;
  vaccinated: boolean;
  adopted: boolean;
  health: string;
  imageUrl?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

const healthColor: Record<string, string> = {
  'Healthy': 'text-emerald-400',
  'Minor Care Required': 'text-amber-400',
  'Special Needs': 'text-rose-400',
};

const DogList = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await browseDogs();
        setDogs(res?.data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(n => (
          <div key={n} className="glass-card rounded-3xl p-4 h-[400px] animate-pulse flex flex-col gap-4">
            <div className="w-full h-52 rounded-2xl" style={{ background: 'rgba(30,41,59,0.8)' }} />
            <div className="h-7 rounded-xl w-3/4" style={{ background: 'rgba(30,41,59,0.8)' }} />
            <div className="h-4 rounded w-1/2" style={{ background: 'rgba(30,41,59,0.8)' }} />
            <div className="h-4 rounded w-2/3" style={{ background: 'rgba(30,41,59,0.8)' }} />
            <div className="mt-auto h-11 rounded-xl" style={{ background: 'rgba(30,41,59,0.8)' }} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 rounded-3xl border border-rose-500/20 max-w-lg mx-auto"
        style={{ background: 'rgba(239,68,68,0.05)' }}>
        <Heart className="w-12 h-12 mx-auto mb-4 opacity-50 text-rose-400" />
        <p className="font-bold text-lg text-rose-400 mb-1">Failed to load dogs</p>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  if (!dogs.length) {
    return (
      <div className="text-center py-20 rounded-3xl border border-slate-800/60"
        style={{ background: 'rgba(15,23,42,0.4)' }}>
        <Heart className="w-12 h-12 mx-auto mb-4 opacity-20 text-indigo-400" />
        <p className="text-xl font-semibold text-slate-200 mb-2">No dogs available yet</p>
        <p className="text-sm text-slate-500">Be the first to list a dog for adoption!</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {dogs.map(dog => (
        <motion.div
          key={dog._id}
          variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
          className="glass-card rounded-[2rem] overflow-hidden flex flex-col group"
        >
          {/* Image */}
          <div className="relative w-full h-56 overflow-hidden" style={{ background: '#0f172a' }}>
            {dog.imageUrl ? (
              <img
                src={dog.imageUrl.startsWith('http') ? dog.imageUrl : `${BACKEND_URL}${dog.imageUrl}`}
                alt={dog.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-indigo-500/20" />
              </div>
            )}

            {/* Vaccinated badge */}
            {dog.vaccinated && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-emerald-400/50"
                style={{ background: 'rgba(16,185,129,0.9)' }}>
                <ShieldCheck className="w-3 h-3" /> Vaccinated
              </div>
            )}

            {/* Health badge (non-healthy only) */}
            {dog.health !== 'Healthy' && (
              <div className="absolute top-3 left-3 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-400/30"
                style={{ background: 'rgba(245,158,11,0.15)' }}>
                {dog.health}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-5 flex flex-col flex-1 gap-3">
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-extrabold text-slate-100 tracking-tight">{dog.name}</h3>
              <span className="text-xs px-2.5 py-1 rounded-xl border border-slate-700/60 font-semibold text-slate-300"
                style={{ background: 'rgba(30,41,59,0.8)' }}>
                {dog.age === 0 ? 'Puppy' : `${dog.age} yrs`}
              </span>
            </div>

            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-300 font-medium truncate">{dog.breed}</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span className="text-slate-300 font-medium">{dog.location}</span>
              </p>
              <p className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className={`text-xs font-semibold ${healthColor[dog.health] || 'text-slate-400'}`}>
                  {dog.health}
                </span>
              </p>
            </div>

            <div className="mt-auto pt-2">
              <Link
                href={`/dog/${dog._id}`}
                className="block w-full text-center py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all duration-300 gradient-btn-indigo"
              >
                View Profile
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DogList;
