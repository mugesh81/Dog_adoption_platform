import React, { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

const Header = () => (
  <header className="bg-black bg-opacity-70 backdrop-blur-sm py-4 shadow-md">
    <div className="container mx-auto flex items-center justify-between px-4">
      <h1 className="text-2xl font-bold text-white">Dog Adoption Platform</h1>
      {/* Add navigation links if needed */}
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-black bg-opacity-70 backdrop-blur-sm py-4 mt-8">
    <div className="container mx-auto text-center text-sm text-gray-400">
      © {new Date().getFullYear()} Dog Adoption Platform. All rights reserved.
    </div>
  </footer>
);

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white font-sans">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
