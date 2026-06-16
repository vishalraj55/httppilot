'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message as string);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Geist, Inter, system-ui, -apple-system, sans-serif',
    }}>

      {/* Nav */}
      <nav style={{
        height: '64px',
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '6px',
            background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            HTTP<span style={{ color: 'var(--accent)' }}>Pilot</span>
          </span>
        </div>
      </nav>

      {/* Main */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Card */}
          <div style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0px 1px 1px rgba(0,0,0,0.08), 0px 2px 2px rgba(0,0,0,0.06)',
          }}>

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{
                fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)',
                letterSpacing: '-0.96px', margin: '0 0 6px',
              }}>
                {isSignUp ? 'Create your account.' : 'Welcome back.'}
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, letterSpacing: '-0.28px' }}>
                {isSignUp ? 'Start testing APIs in seconds.' : 'Sign in to continue to HTTPPilot.'}
              </p>
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-panel)')}
              style={{
                width: '100%', height: '40px', borderRadius: '6px',
                border: '1px solid var(--border)', background: 'var(--bg-panel)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', cursor: 'pointer', marginBottom: '16px',
                fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)',
                letterSpacing: '-0.28px', transition: 'background 0.15s',
                opacity: loading ? 0.5 : 1,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: 500,
                color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '-0.28px',
              }}>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void handleEmailAuth()}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                style={{
                  width: '100%', height: '40px', borderRadius: '6px',
                  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                  padding: '0 12px', fontSize: '14px', color: 'var(--text-primary)',
                  outline: 'none', boxSizing: 'border-box',
                  letterSpacing: '-0.28px', transition: 'border-color 0.15s',
                  fontFamily: 'Geist, Inter, system-ui, sans-serif',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: 500,
                color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '-0.28px',
              }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void handleEmailAuth()}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                style={{
                  width: '100%', height: '40px', borderRadius: '6px',
                  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                  padding: '0 12px', fontSize: '14px', color: 'var(--text-primary)',
                  outline: 'none', boxSizing: 'border-box',
                  letterSpacing: '-0.28px', transition: 'border-color 0.15s',
                  fontFamily: 'Geist, Inter, system-ui, sans-serif',
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(238,0,0,0.08)', border: '1px solid rgba(238,0,0,0.2)',
                borderRadius: '6px', padding: '10px 12px', marginBottom: '16px',
              }}>
                <p style={{ fontSize: '12px', color: 'var(--error)', margin: 0, letterSpacing: '-0.28px' }}>
                  {error.replace('Firebase: ', '').replace(/\(auth.*\)\.?/, '').trim()}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleEmailAuth}
              disabled={loading || !email || !password}
              onMouseEnter={e => { if (!loading) (e.currentTarget.style.opacity = '0.85'); }}
              onMouseLeave={e => { if (!loading) (e.currentTarget.style.opacity = '1'); }}
              style={{
                width: '100%', height: '40px', borderRadius: '100px',
                background: 'var(--accent)', color: '#ffffff', border: 'none',
                fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '-0.28px', transition: 'opacity 0.15s',
                opacity: loading || !email || !password ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontFamily: 'Geist, Inter, system-ui, sans-serif',
              }}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Please wait...
                </>
              ) : (
                isSignUp ? 'Create account' : 'Sign in'
              )}
            </button>

            {/* Toggle */}
            <p style={{
              textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)',
              margin: '20px 0 0', letterSpacing: '-0.28px',
            }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-primary)', fontWeight: 500, fontSize: '13px',
                  textDecoration: 'underline', textUnderlineOffset: '2px',
                  letterSpacing: '-0.28px', fontFamily: 'Geist, Inter, system-ui, sans-serif',
                }}
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
          {/* Footer note */}
          <p style={{
            textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)',
            marginTop: '20px', letterSpacing: '-0.28px',
          }}>
            By continuing, you agree to our{' '}
            <span style={{ color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer' }}>Terms</span>
            {' '}and{' '}
            <span style={{ color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}