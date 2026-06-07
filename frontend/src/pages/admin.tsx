import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, PawPrint, CheckCircle2, XCircle, ArrowLeft, Clock } from 'lucide-react';
import { getAdoptionRequests, updateAdoptionRequest } from '../utils/index';

interface AdoptionRequest {
  _id: string;
  dogId: {
    _id: string;
    name: string;
    breed: string;
    imageUrl?: string;
  };
  adopterName: string;
  adopterEmail: string;
  adopterPhone: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const AdminDashboard = () => {
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      const res: any = await getAdoptionRequests();
      setRequests(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch adoption requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateAdoptionRequest(id, status);
      // Optimistic update
      setRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, status } : req))
      );
      // Re-fetch to get correct state (in case others were rejected automatically)
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to update request status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020617' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 p-6 md:p-12 overflow-x-hidden" style={{ background: '#020617' }}>
      <div className="max-w-6xl mx-auto space-y-10">
        
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-4 text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-4xl font-extrabold flex items-center gap-3">
              <ShieldCheck className="w-10 h-10 text-indigo-500" />
              Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Manage adoption requests and approve loving homes.</p>
          </div>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 border border-white/5 rounded-3xl glass-panel">
            <PawPrint className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300">No requests yet</h3>
            <p className="text-slate-500 mt-2">When someone applies to adopt, it will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {requests.map((req) => (
                <motion.div
                  key={req._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden"
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    req.status === 'pending' ? 'bg-amber-500' :
                    req.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'
                  }`} />

                  {/* Dog Info */}
                  <div className="w-full md:w-1/3 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                        {req.dogId?.imageUrl ? (
                          <img 
                            src={req.dogId.imageUrl.startsWith('http') ? req.dogId.imageUrl : `http://localhost:5000${req.dogId.imageUrl}`} 
                            alt={req.dogId.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <PawPrint className="w-6 h-6 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{req.dogId?.name || 'Unknown Dog'}</h3>
                        <p className="text-sm text-slate-400">{req.dogId?.breed || 'Unknown Breed'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Adopter Info */}
                  <div className="w-full md:w-2/3 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-200">{req.adopterName}</h4>
                        <div className="text-sm text-slate-400 mt-1 flex flex-col gap-1">
                          <span>📧 {req.adopterEmail}</span>
                          <span>📞 {req.adopterPhone}</span>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
                        req.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {req.status === 'pending' && <Clock className="w-4 h-4" />}
                        {req.status === 'approved' && <CheckCircle2 className="w-4 h-4" />}
                        {req.status === 'rejected' && <XCircle className="w-4 h-4" />}
                        <span className="capitalize">{req.status}</span>
                      </div>
                    </div>

                    {req.message && (
                      <div className="p-4 rounded-2xl bg-slate-800/50 text-slate-300 text-sm border border-slate-700/50">
                        "{req.message}"
                      </div>
                    )}
                    
                    <div className="text-xs text-slate-500 mt-2">
                      Requested on: {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString()}
                    </div>

                    {/* Actions */}
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-3 pt-4 mt-4 border-t border-white/5">
                        <button
                          onClick={() => handleUpdateStatus(req._id, 'approved')}
                          className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req._id, 'rejected')}
                          className="px-6 py-2.5 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
