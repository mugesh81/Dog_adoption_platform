import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchApplications = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/applications', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.data.success) {
            setApplications(res.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch applications", error);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchApplications();
    }
  }, [user]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="text-green-500" />;
      case 'rejected': return <XCircle className="text-red-500" />;
      default: return <Clock className="text-primary-dark" />;
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard | Paws of Hope</title>
      </Head>
      <Navbar />
      
      <div className="min-h-[calc(100vh-80px)] bg-light py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-dark">Welcome back, {user.name}</h1>
            <p className="text-gray-500 mt-2">Manage your {user.role === 'adopter' ? 'adoption applications' : 'dog listings and requests'} here.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Applications</h3>
              <p className="text-3xl font-bold text-primary mt-2">{applications.length}</p>
            </Card>
            {/* Add more stats cards here */}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-dark mb-4">Recent Applications</h2>
            {isLoadingData ? (
              <p>Loading applications...</p>
            ) : applications.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                No applications found.
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((app, idx) => (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="p-6 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden">
                          {app.dogId?.imageUrl ? (
                             <img 
                               src={app.dogId.imageUrl.startsWith('http') ? app.dogId.imageUrl : `http://localhost:5000${app.dogId.imageUrl}`} 
                               alt="Dog" 
                               className="w-full h-full object-cover" 
                             />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-dark">{app.dogId?.name || 'Unknown Dog'}</h4>
                          <p className="text-sm text-gray-500">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(app.status)}
                        <span className="font-medium text-gray-700 capitalize">{app.status.replace('_', ' ')}</span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
