import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint, Plus, Edit2, Trash2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyListings, deleteDog, toggleDogAdoptedStatus, getDogImageUrl, formatDogAge, V2Dog } from '../utils/index';

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<V2Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const canManage = user && ['donor', 'shelter', 'admin'].includes(user.role);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    else if (!authLoading && user && !canManage) router.push('/dashboard');
  }, [user, authLoading, canManage, router]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res: any = await getMyListings();
      setListings(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) fetchListings();
  }, [canManage]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    
    setActionLoading(id);
    try {
      await deleteDog(id);
      setListings(prev => prev.filter(d => d._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAdopted = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    try {
      await toggleDogAdoptedStatus(id, !currentStatus);
      setListings(prev => prev.map(d => d._id === id ? { ...d, adopted: !currentStatus } : d));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || !user || !canManage) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020617' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <>
      <Head><title>My Listings | Paws&Hearts</title></Head>
      <div className="min-h-screen text-slate-100" style={{ background: '#020617' }}>
        {/* Nav */}
        <motion.nav initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="glass-panel sticky top-0 z-50 py-4 px-6 border-b border-white/5 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-extrabold flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <PawPrint className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="gradient-text">Paws&Hearts</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white border border-slate-700/50" style={{ background: 'rgba(30,41,59,0.5)' }}>
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-100">My Listings</h1>
              <p className="text-slate-400 mt-2">Manage your dog listings</p>
            </div>
            <Link href="/#donor-form" className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm gradient-btn-indigo">
              <Plus className="w-4 h-4" /> Add New Dog
            </Link>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6">{error}</div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="glass-card rounded-2xl p-4 h-96 animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-3xl">
              <PawPrint className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-300 mb-2">No listings yet</h3>
              <p className="text-slate-500 mb-6">Create your first dog listing to get started</p>
              <Link href="/#donor-form" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm gradient-btn-indigo">
                <Plus className="w-4 h-4" /> Add Your First Dog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {listings.map((dog, i) => {
                  const imageUrl = getDogImageUrl(dog);
                  const isProcessing = actionLoading === dog._id;
                  return (
                    <motion.div key={dog._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                      className="glass-card rounded-2xl overflow-hidden flex flex-col">
                      <div className="relative w-full h-48" style={{ background: '#0f172a' }}>
                        {imageUrl ? (
                          <img src={imageUrl} alt={dog.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><PawPrint className="w-12 h-12 text-slate-700" /></div>
                        )}
                        {dog.adopted && (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(2,6,23,0.8)' }}>
                            <span className="text-emerald-400 font-bold uppercase tracking-widest text-sm">✓ Adopted</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1 gap-3">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-slate-100">{dog.name}</h3>
                          <span className="text-xs px-2 py-1 rounded-lg border border-slate-700/60 font-semibold text-slate-300" style={{ background: 'rgba(30,41,59,0.8)' }}>
                            {formatDogAge(dog.age)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{dog.breed} • {dog.gender}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 flex-1">{dog.description}</p>
                        <div className="flex gap-2 pt-2">
                          <Link href={`/edit-listing/${dog._id}`} className="flex-1 text-center py-2 rounded-xl text-xs font-semibold border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-1">
                            <Edit2 className="w-3 h-3" /> Edit
                          </Link>
                          <button onClick={() => handleToggleAdopted(dog._id, dog.adopted)} disabled={isProcessing}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${dog.adopted ? 'border border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'} disabled:opacity-50`}>
                            {isProcessing ? '...' : dog.adopted ? <><XCircle className="w-3 h-3" /> Mark Available</> : <><CheckCircle className="w-3 h-3" /> Mark Adopted</>}
                          </button>
                          <button onClick={() => handleDelete(dog._id, dog.name)} disabled={isProcessing}
                            className="px-3 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
