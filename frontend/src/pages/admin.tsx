import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, PawPrint, CheckCircle2, XCircle, ArrowLeft, Clock } from 'lucide-react';
import { getApplications, updateApplicationStatus, getDogImageUrl } from '../utils/index';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/admin');
    else if (!authLoading && user && user.role !== 'admin') router.push('/dashboard');
  }, [user, authLoading, router]);

  const fetchApplications = async () => {
    try {
      const res: any = await getApplications();
      setApplications(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchApplications();
  }, [user]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateApplicationStatus(id, status, status === 'rejected' ? { rejectionReason: 'Rejected by admin.' } : undefined);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020617' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020617' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 p-6 md:p-12" style={{ background: '#020617' }}>
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-indigo-500" />
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-2">Manage all adoption applications platform-wide.</p>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">{error}</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 border border-white/5 rounded-3xl glass-panel">
            <PawPrint className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300">No applications yet</h3>
          </div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {applications.map((app) => {
                const imageUrl = app.dogId ? getDogImageUrl(app.dogId) : null;
                return (
                  <motion.div key={app._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      app.status === 'pending' ? 'bg-amber-500' : app.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />
                    <div className="w-full md:w-1/3 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800">
                        {imageUrl ? <img src={imageUrl} alt="" className="w-full h-full object-cover" /> : <PawPrint className="w-6 h-6 text-slate-500 m-3" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{app.dogId?.name || 'Unknown'}</h3>
                        <p className="text-sm text-slate-400">{app.dogId?.breed}</p>
                      </div>
                    </div>
                    <div className="w-full md:w-2/3 space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-200">{app.adopterId?.name}</h4>
                        <p className="text-sm text-slate-400">{app.adopterId?.email} · {app.adopterId?.phone}</p>
                        <p className="text-sm text-slate-500 mt-2">{app.reasonForAdopting}</p>
                      </div>
                      <div className={`inline-flex px-4 py-2 rounded-xl text-sm font-bold capitalize ${
                        app.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                        app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {app.status === 'pending' && <Clock className="w-4 h-4 mr-2 inline" />}
                        {app.status.replace(/_/g, ' ')}
                      </div>
                      {app.status === 'pending' && (
                        <div className="flex gap-3 pt-2">
                          <button onClick={() => handleUpdateStatus(app._id, 'approved')}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </button>
                          <button onClick={() => handleUpdateStatus(app._id, 'rejected')}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
