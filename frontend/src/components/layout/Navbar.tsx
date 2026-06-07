import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Heart, User, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-dark">
              <Heart size={24} fill="currentColor" />
            </div>
            <span className="font-bold text-xl text-dark tracking-tight">Paws of Hope</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/browse" className="text-gray-600 hover:text-dark font-medium transition-colors">Adopt a Dog</Link>
            <Link href="/" className="text-gray-600 hover:text-dark font-medium transition-colors">Home</Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="flex items-center space-x-2 text-dark font-medium">
                  <div className="w-10 h-10 bg-light-soft rounded-full flex items-center justify-center border border-gray-200">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <span className="hidden sm:block">{user.name}</span>
                </Link>
                <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-dark font-medium hover:text-primary transition-colors">Sign In</Link>
                <Link href="/register">
                  <Button variant="primary">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
