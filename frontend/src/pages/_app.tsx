import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <main className={`${inter.variable} font-sans min-h-screen text-slate-100`}>
        <Component {...pageProps} />
      </main>
    </AuthProvider>
  );
}
