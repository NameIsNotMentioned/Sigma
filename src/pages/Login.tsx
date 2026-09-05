import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        navigate(searchParams.get('next') || '/dashboard');
      } else {
        const needsConfirmation = await signUp(email, password);
        setMessage(needsConfirmation ? 'Account created. Check your email to confirm it, then sign in.' : 'Account created. Your dashboard is ready.');
        if (!needsConfirmation) navigate(searchParams.get('next') || '/dashboard');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="auth-page">
    <section className="auth-card glass-panel">
      <button className="marketing-brand" onClick={() => navigate('/')}><span className="marketing-brand-mark"><Sparkles className="w-4 h-4" /></span><span>GroupTrip <b>Ledger</b></span></button>
      <span className="marketing-eyebrow">YOUR PRIVATE TRIP LEDGER</span>
      <h1>{mode === 'signin' ? 'Welcome back.' : 'Create your ledger.'}</h1>
      <p>Save trips, expenses, participants, and settlement calculations in one secure workspace.</p>
      {!isSupabaseConfigured && <div className="auth-notice">Add your Supabase URL and anon key to `.env` before signing in.</div>}
      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {message && <div className="auth-message">{message}</div>}
        <button className="marketing-primary auth-submit" disabled={submitting || !isSupabaseConfigured}>{submitting ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'} <ArrowRight className="w-4 h-4" /></button>
      </form>
      <button className="auth-switch" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(''); }}>{mode === 'signin' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button>
      <div className="auth-points"><span><Check className="w-3 h-3" /> Row-level protected</span><span><Check className="w-3 h-3" /> Your data only</span></div>
    </section>
  </main>;
};
