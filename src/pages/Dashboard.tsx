import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, LogOut, Plus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../lib/formatters';

type TripRow = { id: string; name: string; destination: string | null; start_date: string | null; end_date: string | null; created_at: string };
type ParticipantRow = { id: string; name: string; email: string | null };
type ExpenseRow = { id: string; description: string; amount: number; split_type: string; paid_by: string | null };

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const loadTrips = async () => {
    const { data, error } = await supabase.from('trips').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    setTrips(data ?? []);
    if (!selectedTrip && data?.[0]) setSelectedTrip(data[0].id);
  };

  const loadTripData = async (tripId: string) => {
    const [{ data: people, error: peopleError }, { data: tripExpenses, error: expensesError }] = await Promise.all([
      supabase.from('participants').select('id,name,email').eq('trip_id', tripId).order('created_at'),
      supabase.from('expenses').select('id,description,amount,split_type,paid_by').eq('trip_id', tripId).order('created_at', { ascending: false }),
    ]);
    if (peopleError) throw peopleError;
    if (expensesError) throw expensesError;
    setParticipants(people ?? []);
    setExpenses(tripExpenses ?? []);
  };

  useEffect(() => { void loadTrips().catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Could not load trips.')); }, []);
  useEffect(() => { if (selectedTrip) void loadTripData(selectedTrip).catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Could not load trip data.')); }, [selectedTrip]);

  const selected = trips.find((trip) => trip.id === selectedTrip);
  const total = useMemo(() => expenses.reduce((sum, expense) => sum + Number(expense.amount), 0), [expenses]);
  const share = participants.length ? Math.round(total / participants.length) : 0;

  const createTrip = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !name.trim()) return;
    setBusy(true); setMessage('');
    try {
      const { data, error } = await supabase.from('trips').insert({ owner_id: user.id, name: name.trim(), destination: destination.trim() || null }).select().single();
      if (error) throw error;
      setName(''); setDestination('');
      await loadTrips();
      if (data) setSelectedTrip(data.id);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not create trip.'); } finally { setBusy(false); }
  };

  const createExpense = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTrip || !expenseDescription.trim() || Number(expenseAmount) <= 0) return;
    setBusy(true); setMessage('');
    try {
      const { error } = await supabase.from('expenses').insert({ trip_id: selectedTrip, description: expenseDescription.trim(), amount: Number(expenseAmount), split_type: 'equal' });
      if (error) throw error;
      setExpenseDescription(''); setExpenseAmount('');
      await loadTripData(selectedTrip);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save expense.'); } finally { setBusy(false); }
  };

  const createParticipant = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTrip || !participantName.trim()) return;
    setBusy(true); setMessage('');
    try {
      const { error } = await supabase.from('participants').insert({ trip_id: selectedTrip, name: participantName.trim() });
      if (error) throw error;
      setParticipantName('');
      await loadTripData(selectedTrip);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save participant.'); } finally { setBusy(false); }
  };

  return <main className="data-page">
    <header className="data-header"><button className="marketing-brand" onClick={() => navigate('/')}><span className="marketing-brand-mark"><Sparkles className="w-4 h-4" /></span><span>GroupTrip <b>Ledger</b></span></button><div><span className="data-user">{user?.email}</span><button className="data-signout" onClick={() => void signOut()}><LogOut className="w-4 h-4" /> Sign out</button></div></header>
    <div className="data-container">
      <div className="data-heading"><div><span className="marketing-eyebrow">PRIVATE WORKSPACE</span><h1>Your saved trips.</h1><p>Everything here is fetched from Supabase and protected by your account.</p></div><button className="marketing-text-link" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4" /> Back to site</button></div>
      {message && <div className="auth-message">{message}</div>}
      <div className="data-grid">
        <section className="data-panel glass-panel"><h2>Create a trip</h2><form onSubmit={createTrip}><input placeholder="Trip name" value={name} onChange={(event) => setName(event.target.value)} required /><input placeholder="Destination (optional)" value={destination} onChange={(event) => setDestination(event.target.value)} /><button className="marketing-primary" disabled={busy}><Plus className="w-4 h-4" /> Save trip</button></form><div className="trip-list">{trips.map((trip) => <button className={trip.id === selectedTrip ? 'trip-list-row active' : 'trip-list-row'} key={trip.id} onClick={() => setSelectedTrip(trip.id)}><strong>{trip.name}</strong><span>{trip.destination || 'No destination yet'}</span></button>)}{trips.length === 0 && <p className="empty-state">Create your first trip to start saving data.</p>}</div></section>
        <section className="data-panel glass-panel"><span className="marketing-eyebrow">TRIP DETAIL</span><h2>{selected?.name || 'Select a trip'}</h2>{selected && <><p>{selected.destination || 'Destination not set'} · {participants.length} travelers</p><div className="data-stats"><div><span>Total expenses</span><strong>{formatINR(total)}</strong></div><div><span>Fair share</span><strong>{formatINR(share)}</strong></div></div><form className="expense-form" onSubmit={createParticipant}><input placeholder="Traveler name" value={participantName} onChange={(event) => setParticipantName(event.target.value)} required /><button className="marketing-primary" disabled={busy}>Add traveler</button></form><div className="saved-expenses">{participants.map((participant) => <div className="saved-row" key={participant.id}><span>{participant.name}<small>{participant.email || 'Trip participant'}</small></span></div>)}</div><form className="expense-form" onSubmit={createExpense}><input placeholder="Expense description" value={expenseDescription} onChange={(event) => setExpenseDescription(event.target.value)} required /><input type="number" min="1" placeholder="Amount" value={expenseAmount} onChange={(event) => setExpenseAmount(event.target.value)} required /><button className="marketing-primary" disabled={busy}>Add expense</button></form><div className="saved-expenses">{expenses.map((expense) => <div className="saved-row" key={expense.id}><span>{expense.description}<small>{expense.split_type} split</small></span><strong>{formatINR(Number(expense.amount))}</strong></div>)}{expenses.length === 0 && <p className="empty-state">No expenses saved yet.</p>}</div></>}</section>
      </div>
    </div>
  </main>;
};
