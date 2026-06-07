import React, { useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login | Paws of Hope</title>
        <meta name="description" content="Sign in to your Paws of Hope account" />
      </Head>
      <Navbar />

      <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', background: '#FFF9F0' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #f0e9df' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', background: '#F4C542', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>
              🐾
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px' }}>Welcome back</h1>
            <p style={{ color: '#777', fontSize: '14px', margin: 0 }}>
              Don't have an account?{' '}
              <Link href="/register" style={{ color: '#F4C542', fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#DC2626', fontSize: '14px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
                <input
                  ref={emailRef}
                  type="email"
                  id="login-email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 44px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', background: '#fafafa', color: '#1a1a1a', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#F4C542'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Password</label>
                <a href="#" style={{ fontSize: '13px', color: '#F4C542', textDecoration: 'none', fontWeight: '500' }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 44px 12px 44px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', background: '#fafafa', color: '#1a1a1a', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#F4C542'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', padding: '14px', background: '#F4C542', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', color: '#1a1a1a', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, transition: 'all 0.2s', marginTop: '4px' }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
