import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-9xl font-extrabold tracking-widest text-indigo-500 animate-pulse">404</h1>
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-2">
          <h2 className="text-2xl font-bold text-slate-200">Page Not Found</h2>
          <p className="text-slate-400 font-light text-sm">
            The page you're searching for does not exist or has been relocated.
          </p>
        </div>
        <Link href="/" className="inline-block py-3 px-8 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-300 gradient-btn-indigo">
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
