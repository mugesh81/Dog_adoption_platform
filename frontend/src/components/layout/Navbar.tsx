import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { PawPrint, LayoutDashboard, LogOut, User, Heart } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-panel sticky top-0 z-50 py-4 px-6 border-b border-white/5 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-extrabold flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg transition-colors" style={{ background: 'rgba(99,102,241,0.1)' }}>
            <PawPrint className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="gradient-text">Paws&Hearts</span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/browse" className="text-slate-400 hover:text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            Browse Dogs
          </Link>
          <Link href="/" className="text-slate-400 hover:text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            Home
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-500 transition-all"
                style={{ background: 'rgba(30,41,59,0.5)' }}>
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:block">{user.name}</span>
              </Link>
              <button onClick={logout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/30 transition-all"
                style={{ background: 'rgba(30,41,59,0.5)' }}>
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-400 hover:text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                Sign In
              </Link>
              <Link href="/register"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold gradient-btn-indigo">
                <Heart className="w-4 h-4" /> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
