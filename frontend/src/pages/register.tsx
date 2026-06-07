import React, { useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';

export default function Register() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState('adopter');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameRef.current?.value || '';
    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
      if (res.data.success) {
        login(res.data.data.token, res.data.data);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: '12px 14px 12px 44px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    background: '#fafafa',
    color: '#1a1a1a',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <>
      <Head>
        <title>Register | Paws of Hope</title>
        <meta name="description" content="Create your Paws of Hope account" />
      </Head>
      <Navbar />

      <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', background: '#FFF9F0' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #f0e9df' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', background: '#F4C542', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>
              🐾
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px' }}>Create an account</h1>
            <p style={{ color: '#777', fontSize: '14px', margin: 0 }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#F4C542', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
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

            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
                <input
                  ref={nameRef}
                  type="text"
                  id="reg-name"
                  autoComplete="name"
                  placeholder="John Doe"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#F4C542'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
                <input
                  ref={emailRef}
                  type="email"
                  id="reg-email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#F4C542'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  id="reg-password"
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  style={{ ...inputStyle, paddingRight: '44px' }}
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

            {/* Role Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>I am a...</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { value: 'adopter', label: '🏠 Adopter', desc: 'Looking for a dog' },
                  { value: 'donor', label: '🎁 Donor', desc: 'Giving a dog' },
                  { value: 'shelter', label: '🏢 Shelter', desc: 'NGO / Rescue' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    style={{
                      flex: 1,
                      padding: '10px 6px',
                      borderRadius: '12px',
                      border: `2px solid ${role === opt.value ? '#F4C542' : '#e5e7eb'}`,
                      background: role === opt.value ? '#FFFBEB' : '#fafafa',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '18px' }}>{opt.label.split(' ')[0]}</div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#333', marginTop: '2px' }}>{opt.label.split(' ')[1]}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', padding: '14px', background: '#F4C542', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', color: '#1a1a1a', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, transition: 'all 0.2s', marginTop: '4px' }}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#aaa', margin: 0 }}>
              By registering, you agree to help save abandoned dogs in Tamil Nadu 🐶
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
