import React, { useEffect, useState } from 'react';
import { ArrowRight, LogOut, Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { TripProvider } from '../context/TripContext';
import { Workspace } from '../app/Workspace';
import { BrandLogo } from '../components/BrandLogo';

type TripRow = { id: string; name: string; destination: string | null; created_at: string };
type TripDraft = { name?: string; travelers?: string[]; expenses?: { title: string; amount: string; paidBy: number }[] };

export const Dashboard: React.FC<{ isDarkTheme: boolean; onThemeToggle: () => void }> = ({ isDarkTheme, onThemeToggle }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const tripId = searchParams.get('trip');
  const [draft] = useState<TripDraft | null>(() => {
    const raw = sessionStorage.getItem('grouptrip-draft');
    if (!raw) return null;
    sessionStorage.removeItem('grouptrip-draft');
    try { return JSON.parse(raw) as TripDraft; } catch { return null; }
  });

  useEffect(() => {
    void supabase.from('trips').select('id,name,destination,created_at').order('created_at', { ascending: false })
      .then(({ data, error }) => { if (error) setMessage(error.message); else setTrips(data ?? []); });
  }, []);

  if (tripId) {
    return <TripProvider tripId={tripId}><Workspace isDarkTheme={isDarkTheme} onThemeToggle={onThemeToggle} /></TripProvider>;
  }

  const createTrip = async (event: React.FormEvent) => {
    event.preventDefault();
    const tripName = name.trim() || draft?.name?.trim() || '';
    if (!user || !tripName) return;
    setBusy(true); setMessage('');
    const { data, error } = await supabase.from('trips').insert({ owner_id: user.id, name: tripName, destination: destination.trim() || null, start_date: startDate || null, end_date: endDate || null }).select().single();
    if (error) setMessage(error.message);
    else if (data) {
      const travelers = draft?.travelers ?? [];
      const { data: people, error: peopleError } = travelers.length
        ? await supabase.from('participants').insert(travelers.map((traveler) => ({ trip_id: data.id, name: traveler }))).select('id')
        : { data: [], error: null };
      if (peopleError) setMessage(peopleError.message);
      const draftExpenses = draft?.expenses ?? [];
      if (!peopleError && draftExpenses.length) {
        const { data: savedExpenses, error: expenseError } = await supabase.from('expenses').insert(draftExpenses.map((expense) => ({
          trip_id: data.id, description: expense.title || 'Trip expense', amount: Number(expense.amount) || 0,
          paid_by: people?.[expense.paidBy]?.id ?? people?.[0]?.id ?? null, category: 'other', split_method: 'equal',
        }))).select('id');
        if (expenseError) setMessage(expenseError.message);
        if (!expenseError && savedExpenses?.length && people?.length) {
          const { error: linkError } = await supabase.from('expense_participants').insert(savedExpenses.flatMap((expense) => people.map((person) => ({ expense_id: expense.id, participant_id: person.id }))));
          if (linkError) setMessage(linkError.message);
        }
      }
      navigate(`/dashboard?trip=${data.id}`);
    }
    setBusy(false);
  };

  return <div className={isDarkTheme ? 'theme-dark' : undefined}><main className="data-page">
    <header className="data-header"><button className="marketing-brand logo-brand" onClick={() => navigate('/')} aria-label="Go to homepage"><BrandLogo isDarkTheme={isDarkTheme} /></button><button className="data-signout" onClick={() => void signOut()}><LogOut className="w-4 h-4" /> Sign out</button></header>
    <div className="data-container">
      <div className="data-heading"><div><span className="marketing-eyebrow">PRIVATE WORKSPACE</span><h1>Your saved trips.</h1><p>Choose a trip to open the full live ledger workspace.</p></div></div>
      {message && <div className="auth-message">{message}</div>}
      <div className="data-grid">
        <section className="data-panel glass-panel"><h2>Create a trip</h2><form onSubmit={createTrip}><input placeholder="Trip name" value={name || draft?.name || ''} onChange={(event) => setName(event.target.value)} required /><input placeholder="Destination (optional)" value={destination} onChange={(event) => setDestination(event.target.value)} /><div className="date-fields"><label>Start date<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>End date<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div><button className="marketing-primary" disabled={busy}><Plus className="w-4 h-4" /> Save trip</button></form>{draft && <p className="empty-state">Your setup draft includes {draft.travelers?.length ?? 0} travelers and {draft.expenses?.length ?? 0} expenses. They will be saved with this trip.</p>}</section>
        <section className="data-panel glass-panel"><span className="marketing-eyebrow">YOUR TRIPS</span><h2>Open a ledger</h2><div className="trip-list">{trips.map((trip) => <button className="trip-list-row" key={trip.id} onClick={() => navigate(`/dashboard?trip=${trip.id}`)}><strong>{trip.name}</strong><span>{trip.destination || 'No destination yet'} <ArrowRight className="inline w-3 h-3" /></span></button>)}{trips.length === 0 && <p className="empty-state">Create your first trip to get started.</p>}</div></section>
      </div>
    </div>
  </main></div>;
};
