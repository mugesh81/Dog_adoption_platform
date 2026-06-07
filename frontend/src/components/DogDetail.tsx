import React, { useEffect, useState } from 'react';
import { getDogDetails, adoptDog } from '../utils/index';
import { ShieldCheck, MapPin, Tag, Activity, Heart } from 'lucide-react';

interface Donor {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Dog {
  _id: string;
  name: string;
  breed: string;
  age: number;
  location: string;
  health: string;
  vaccinated: boolean;
  adopted: boolean;
  description: string;
  donorId?: Donor;
  imageUrl?: string;
}

interface DogDetailProps {
  id: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

const DogDetail: React.FC<DogDetailProps> = ({ id }) => {
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adopting, setAdopting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDog = async () => {
      try {
        setLoading(true);
        const response = await getDogDetails(id);
        setDog(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDog();
  }, [id]);

  const handleAdopt = async () => {
    if (!dog) return;
    try {
      setAdopting(true);
      await adoptDog(dog._id);
      setDog(prev => prev ? { ...prev, adopted: true } : null);
    } catch (err: any) {
      alert(`Error: ${err.message || 'Adoption failed'}`);
    } finally {
      setAdopting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error || !dog) {
    return (
      <div className="text-center py-12 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl">
        <Heart className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="font-bold">{error || 'Dog not found'}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-3xl space-y-6">
      <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-900 relative">
        {dog.imageUrl ? (
          <img src={`${BACKEND_URL}${dog.imageUrl}`} alt={dog.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-indigo-500/20" />
          </div>
        )}
        {dog.vaccinated && (
          <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Vaccinated
          </div>
        )}
      </div>

      <div>
        <h2 className="text-3xl font-extrabold text-slate-100">{dog.name}</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-lg text-sm flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> {dog.breed}
          </span>
          <span className="bg-slate-800 text-slate-300 border border-slate-700/60 px-3 py-1 rounded-lg text-sm">
            {dog.age === 0 ? 'Puppy' : `${dog.age} yrs`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-2xl">
          <Activity className="w-4 h-4 text-pink-400 mb-2" />
          <span className="text-xs text-slate-500 uppercase tracking-wider block">Health</span>
          <span className="font-bold text-slate-200">{dog.health}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <MapPin className="w-4 h-4 text-blue-400 mb-2" />
          <span className="text-xs text-slate-500 uppercase tracking-wider block">Location</span>
          <span className="font-bold text-slate-200">{dog.location}</span>
        </div>
      </div>

      <p className="text-slate-300 font-light leading-relaxed bg-slate-900/40 border border-slate-800/40 p-4 rounded-2xl">
        {dog.description}
      </p>

      {!dog.adopted ? (
        <button
          onClick={handleAdopt}
          disabled={adopting}
          className="w-full py-3 rounded-2xl font-bold uppercase tracking-wider text-sm gradient-btn-green disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Heart className={`w-4 h-4 ${adopting ? 'animate-pulse' : ''}`} />
          {adopting ? 'Submitting...' : 'Send Adoption Request'}
        </button>
      ) : (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 py-3 px-5 rounded-2xl text-center font-bold uppercase tracking-wide flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 fill-current" /> Already Adopted
        </div>
      )}
    </div>
  );
};

export default DogDetail;
