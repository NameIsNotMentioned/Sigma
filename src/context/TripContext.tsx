import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  Booking,
  Expense,
  Participant,
  ParticipantBalance,
  Payment,
  Transfer,
  Trip,
} from '../types/trip';
import {
  INITIAL_BOOKINGS,
  INITIAL_EXPENSES,
  INITIAL_PARTICIPANTS,
  INITIAL_TRIP,
} from '../data/mockTrip';
import {
  calculateBalances,
  calculateExpenseShares,
  calculateUnoptimizedSettlements,
  optimizeSettlements,
} from '../lib/settlement';

import { ToastContainer, type ToastMessage } from '../components/layout/ToastContainer';
import { formatINR } from '../lib/formatters';
import { supabase } from '../lib/supabaseClient';

export type ActiveTab = 'overview' | 'itinerary' | 'expenses' | 'people' | 'settlements';

interface TripContextType {
  trip: Trip;
  participants: Participant[];
  bookings: Booking[];
  expenses: Expense[];
  payments: Payment[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedParticipantId: string | null;
  setSelectedParticipantId: (id: string | null) => void;
  selectedBookingId: string | null;
  setSelectedBookingId: (id: string | null) => void;
  editingExpenseId: string | null;
  setEditingExpenseId: (id: string | null) => void;
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (open: boolean) => void;
  isAddBookingOpen: boolean;
  setIsAddBookingOpen: (open: boolean) => void;
  isSettlementOptimized: boolean;
  setIsSettlementOptimized: (opt: boolean) => void;

  // Derived Financial KPIs
  totalTripCost: number;
  totalPaid: number;
  totalOutstanding: number;
  averageShare: number;
  participantBalances: ParticipantBalance[];
  unoptimizedTransfers: Transfer[];
  optimizedTransfers: Transfer[];
  activeTransfers: Transfer[];

  // Mutations
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  toggleExpenseCancel: (expenseId: string) => void;
  setExpenseParticipants: (expenseId: string, participantIds: string[]) => void;
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  updateBooking: (booking: Booking) => void;
  toggleBookingCancel: (bookingId: string) => void;
  recordSettlementPayment: (fromId: string, toId: string, amount: number) => void;
  resetDemo: () => void;
  triggerDemoStep: (stepNumber: number) => void;
  currentDemoStep: number;
  showToast: (title: string, desc?: string, tone?: 'success' | 'warning' | 'info' | 'accent') => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode; tripId?: string }> = ({ children, tripId }) => {
  const isLive = Boolean(tripId);
  const [trip, setTrip] = useState<Trip>(INITIAL_TRIP);
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState<boolean>(false);
  const [isSettlementOptimized, setIsSettlementOptimized] = useState<boolean>(false);
  const [currentDemoStep, setCurrentDemoStep] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (!tripId) return;
    let cancelled = false;
    const loadLiveTrip = async () => {
      const [{ data: tripRow, error: tripError }, { data: people, error: peopleError }, { data: expenseRows, error: expenseError }, { data: bookingRows, error: bookingError }, { data: paymentRows, error: paymentError }] = await Promise.all([
        supabase.from('trips').select('*').eq('id', tripId).single(),
        supabase.from('participants').select('*').eq('trip_id', tripId).order('created_at'),
        supabase.from('expenses').select('*').eq('trip_id', tripId).order('created_at', { ascending: false }),
        supabase.from('bookings').select('*').eq('trip_id', tripId).order('date'),
        supabase.from('payments').select('*').eq('trip_id', tripId).order('created_at'),
      ]);
      if (tripError) throw tripError;
      if (peopleError) throw peopleError;
      if (expenseError) throw expenseError;
      if (bookingError) throw bookingError;
      if (paymentError) throw paymentError;
      const participantRows = people ?? [];
      const mappedParticipants = participantRows.map((person) => ({
        id: person.id,
        name: person.name,
        email: person.email ?? undefined,
        avatar: person.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=5144c7&color=fff`,
      }));
      const expenseIds = (expenseRows ?? []).map((expense) => expense.id);
      const bookingIds = (bookingRows ?? []).map((booking) => booking.id);
      const [{ data: expenseLinks }, { data: bookingLinks }] = await Promise.all([
        expenseIds.length ? supabase.from('expense_participants').select('expense_id,participant_id').in('expense_id', expenseIds) : Promise.resolve({ data: [] }),
        bookingIds.length ? supabase.from('booking_participants').select('booking_id,participant_id').in('booking_id', bookingIds) : Promise.resolve({ data: [] }),
      ]);
      if (!cancelled) {
        setTrip({ id: tripRow.id, name: tripRow.name, destination: tripRow.destination ?? '', startDate: tripRow.start_date ?? '', endDate: tripRow.end_date ?? '', participantIds: mappedParticipants.map((person) => person.id), bookingIds, expenseIds });
        setParticipants(mappedParticipants);
        setExpenses((expenseRows ?? []).map((expense) => ({
          id: expense.id, title: expense.description, category: expense.category ?? 'other', amount: Number(expense.amount), paidBy: expense.paid_by ?? mappedParticipants[0]?.id ?? '', participantIds: (expenseLinks ?? []).filter((link) => link.expense_id === expense.id).map((link) => link.participant_id),
          splitMethod: expense.split_method ?? 'equal', customShares: expense.custom_shares ?? undefined, status: expense.status === 'refunded' ? 'refunded' : expense.status === 'cancelled' ? 'cancelled' : 'active', date: expense.date ?? expense.created_at?.slice(0, 10) ?? '', vendor: expense.vendor ?? undefined, notes: expense.notes ?? undefined, bookingId: expense.booking_id ?? undefined,
        })));
        setBookings((bookingRows ?? []).map((booking) => ({
          id: booking.id, title: booking.title, category: booking.category ?? 'other', vendor: booking.vendor ?? '', date: booking.date ?? '', time: booking.time ?? undefined, amount: Number(booking.amount), participantIds: (bookingLinks ?? []).filter((link) => link.booking_id === booking.id).map((link) => link.participant_id), paidBy: booking.paid_by ?? mappedParticipants[0]?.id ?? '', status: booking.status ?? 'confirmed', location: booking.location ?? undefined, notes: booking.notes ?? undefined,
        })));
        setPayments((paymentRows ?? []).map((payment) => ({ id: payment.id, expenseId: 'settlement', paidBy: payment.from_participant, amount: Number(payment.amount), date: payment.created_at?.slice(0, 10) ?? '', note: payment.note ?? undefined })));
      }
    };
    void loadLiveTrip().catch((error: unknown) => showToast('Trip load failed', error instanceof Error ? error.message : 'Could not load trip data.', 'warning'));
    return () => { cancelled = true; };
  }, [tripId, showToast]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, desc?: string, tone: 'success' | 'warning' | 'info' | 'accent' = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, desc, tone }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  // Derived Financial Metrics
  const activeExpenses = useMemo(
    () => expenses.filter(e => e.status !== 'cancelled'),
    [expenses]
  );

  const totalTripCost = useMemo(
    () => activeExpenses.reduce((sum, e) => sum + e.amount, 0),
    [activeExpenses]
  );

  const totalPaid = useMemo(
    () => activeExpenses.reduce((sum, e) => sum + e.amount, 0),
    [activeExpenses]
  );

  const averageShare = useMemo(
    () => (participants.length > 0 ? Math.round(totalTripCost / participants.length) : 0),
    [totalTripCost, participants.length]
  );

  const participantBalances = useMemo(
    () => calculateBalances(participants, expenses, payments),
    [participants, expenses, payments]
  );

  const totalOutstanding = useMemo(() => {
    return participantBalances
      .filter(b => b.netBalance < 0)
      .reduce((sum, b) => sum + Math.abs(b.netBalance), 0);
  }, [participantBalances]);

  const unoptimizedTransfers = useMemo(
    () => calculateUnoptimizedSettlements(expenses, participants),
    [expenses, participants]
  );

  const optimizedTransfers = useMemo(
    () => optimizeSettlements(participantBalances),
    [participantBalances]
  );

  const activeTransfers = useMemo(() => {
    return isSettlementOptimized ? optimizedTransfers : unoptimizedTransfers;
  }, [isSettlementOptimized, optimizedTransfers, unoptimizedTransfers]);

  // Mutations
  const addExpense = useCallback((newExpenseData: Omit<Expense, 'id'>) => {
    const newId = `e-${Date.now()}`;
    const newExpense: Expense = { ...newExpenseData, id: newId };
    setExpenses(prev => [newExpense, ...prev]);
    if (isLive && tripId) {
      void supabase.from('expenses').insert({
        id: newId, trip_id: tripId, description: newExpense.title, amount: newExpense.amount, paid_by: newExpense.paidBy,
        split_method: newExpense.splitMethod, custom_shares: newExpense.customShares ?? null, status: newExpense.status === 'active' ? 'active' : newExpense.status,
        date: newExpense.date, vendor: newExpense.vendor ?? null, notes: newExpense.notes ?? null, category: newExpense.category, booking_id: newExpense.bookingId ?? null,
      }).then(({ error }) => { if (error) showToast('Save failed', error.message, 'warning'); });
      void supabase.from('expense_participants').insert(newExpense.participantIds.map((participantId) => ({ expense_id: newId, participant_id: participantId })));
    }
    showToast('Expense Added', `${newExpense.title} (${formatINR(newExpense.amount)}) added to ledger.`, 'success');
  }, [isLive, showToast, tripId]);

  const updateExpense = useCallback((updated: Expense) => {
    setExpenses(prev => prev.map(e => (e.id === updated.id ? updated : e)));
    if (isLive) {
      void supabase.from('expenses').update({ description: updated.title, amount: updated.amount, paid_by: updated.paidBy, split_method: updated.splitMethod, custom_shares: updated.customShares ?? null, status: updated.status, date: updated.date, vendor: updated.vendor ?? null, notes: updated.notes ?? null, category: updated.category }).eq('id', updated.id);
    }
    showToast('Expense Updated', `${updated.title} details updated.`, 'info');
  }, [isLive, showToast]);

  const setExpenseParticipants = useCallback(
    (expenseId: string, participantIds: string[]) => {
      setExpenses(prev =>
        prev.map(e => {
          if (e.id === expenseId) {
            const count = participantIds.length;
            const newShare = count > 0 ? Math.round(e.amount / count) : 0;
            showToast('Share Recalculated', `${e.title}: ${count} travelers @ ${formatINR(newShare)} each`, 'accent');
            return {
              ...e,
              participantIds,
            };
          }
          return e;
        })
      );
      if (isLive) {
        void supabase.from('expense_participants').delete().eq('expense_id', expenseId)
          .then(() => supabase.from('expense_participants').insert(participantIds.map((participantId) => ({ expense_id: expenseId, participant_id: participantId }))));
      }
    },
    [isLive, showToast]
  );

  const toggleExpenseCancel = useCallback((expenseId: string) => {
    const expense = expenses.find((item) => item.id === expenseId);
    const nextStatus = expense?.status === 'cancelled' ? 'active' : 'cancelled';
    setExpenses(prev =>
      prev.map(e => {
        if (e.id === expenseId) {
          showToast(
            nextStatus === 'cancelled' ? 'Expense Cancelled' : 'Expense Restored',
            `${e.title} (${formatINR(e.amount)}) ${nextStatus === 'cancelled' ? 'removed from' : 'restored to'} balances.`,
            nextStatus === 'cancelled' ? 'warning' : 'success'
          );
          return { ...e, status: nextStatus };
        }
        return e;
      })
    );
    if (isLive) void supabase.from('expenses').update({ status: nextStatus }).eq('id', expenseId);
  }, [expenses, isLive, showToast]);

  const addBooking = useCallback((newBookingData: Omit<Booking, 'id'>) => {
    const newId = `b-${Date.now()}`;
    const newBooking: Booking = { ...newBookingData, id: newId };
    setBookings(prev => [newBooking, ...prev]);
    if (isLive && tripId) {
      void supabase.from('bookings').insert({ id: newId, trip_id: tripId, title: newBooking.title, category: newBooking.category, vendor: newBooking.vendor ?? null, date: newBooking.date, time: newBooking.time ?? null, amount: newBooking.amount, paid_by: newBooking.paidBy, status: newBooking.status, location: newBooking.location ?? null, notes: newBooking.notes ?? null });
      void supabase.from('booking_participants').insert(newBooking.participantIds.map((participantId) => ({ booking_id: newId, participant_id: participantId })));
    }
  }, [isLive, tripId]);

  const updateBooking = useCallback((updated: Booking) => {
    setBookings(prev => prev.map(b => (b.id === updated.id ? updated : b)));
  }, []);

  const toggleBookingCancel = useCallback(
    (bookingId: string) => {
      setBookings(prev =>
        prev.map(b => {
          if (b.id === bookingId) {
            const nextStatus = b.status === 'cancelled' ? 'confirmed' : 'cancelled';
            return { ...b, status: nextStatus };
          }
          return b;
        })
      );
      // Also sync linked expense if any
      const matchingExpense = expenses.find(e => e.bookingId === bookingId);
      if (matchingExpense) {
        toggleExpenseCancel(matchingExpense.id);
      }
    },
    [expenses, toggleExpenseCancel]
  );

  const recordSettlementPayment = useCallback(
    (fromId: string, toId: string, amount: number) => {
      const debtor = participants.find(p => p.id === fromId);
      const creditor = participants.find(p => p.id === toId);
      const payment: Payment = {
        id: `pay-${Date.now()}`,
        expenseId: expenses[0]?.id || 'settlement',
        paidBy: fromId,
        amount,
        date: new Date().toISOString().split('T')[0],
        note: `Settled transfer to ${creditor?.name}`,
      };
      setPayments(prev => [...prev, payment]);
      showToast('Settlement Recorded', `${debtor?.name} paid ${formatINR(amount)} to ${creditor?.name}.`, 'success');
    },
    [expenses, participants, showToast]
  );

  const resetDemo = useCallback(() => {
    setBookings(INITIAL_BOOKINGS);
    setExpenses(INITIAL_EXPENSES);
    setPayments([]);
    setIsSettlementOptimized(false);
    setSelectedParticipantId(null);
    setSelectedBookingId(null);
    setEditingExpenseId(null);
    setActiveTab('overview');
    setCurrentDemoStep(0);
    showToast('Trip Reset', 'Restored original Goa 6-friend trip state.', 'info');
  }, [showToast]);

  // Guided demo steps implementing Master Plan Section 14
  const triggerDemoStep = useCallback(
    (stepNumber: number) => {
      setCurrentDemoStep(stepNumber);
      switch (stepNumber) {
        case 1:
          // Step 1: Overview dashboard
          setActiveTab('overview');
          setSelectedParticipantId(null);
          setEditingExpenseId(null);
          showToast('Step 1 — Dashboard', 'Viewing live trip KPIs: ₹64.8k total, 6 travelers', 'info');
          break;
        case 2:
          // Step 2: Open Expenses → open Hotel "Villa Sol" edit modal
          setActiveTab('expenses');
          setEditingExpenseId('e1');
          showToast('Step 2 — Hotel Expense', 'Villa Sol: 4 travelers @ ₹6,000 each', 'info');
          break;
        case 3:
          // Step 3: Remove Rohan from hotel → 4→3 people, ₹6k→₹8k
          setExpenseParticipants('e1', ['p1', 'p3', 'p4']); // Aarav, Kabir, Meera
          showToast('Step 3 — Roster Changed!', 'Rohan removed • 3 travelers @ ₹8,000 each ✦', 'accent');
          break;
        case 4:
          // Step 4: Settlements screen + optimized toggle ON
          setActiveTab('settlements');
          setEditingExpenseId(null);
          setIsSettlementOptimized(true);
          showToast('Step 4 — Optimized Settlements', '5 raw transfers reduced to 3 optimal transactions', 'success');
          break;
        case 5:
          // Step 5: Rohan's personal financial drawer
          setActiveTab('people');
          setSelectedParticipantId('p5');
          showToast('Step 5 — Rohan\'s Profile', 'Personal balance, itinerary & expense breakdown', 'info');
          break;
        case 6:
          // Step 6: Cancel Scuba Diving + go to overview to show impact
          toggleExpenseCancel('e3');
          setActiveTab('overview');
          showToast('Step 6 — Activity Cancelled', 'Scuba Diving removed — all balances auto-updated', 'warning');
          break;
        default:
          break;
      }
    },
    [setExpenseParticipants, toggleExpenseCancel, showToast]
  );

  return (
    <TripContext.Provider
      value={{
        trip,
        participants,
        bookings,
        expenses,
        payments,
        activeTab,
        setActiveTab,
        selectedParticipantId,
        setSelectedParticipantId,
        selectedBookingId,
        setSelectedBookingId,
        editingExpenseId,
        setEditingExpenseId,
        isAddExpenseOpen,
        setIsAddExpenseOpen,
        isAddBookingOpen,
        setIsAddBookingOpen,
        isSettlementOptimized,
        setIsSettlementOptimized,
        totalTripCost,
        totalPaid,
        totalOutstanding,
        averageShare,
        participantBalances,
        unoptimizedTransfers,
        optimizedTransfers,
        activeTransfers,
        addExpense,
        updateExpense,
        toggleExpenseCancel,
        setExpenseParticipants,
        addBooking,
        updateBooking,
        toggleBookingCancel,
        recordSettlementPayment,
        resetDemo,
        triggerDemoStep,
        currentDemoStep,
        showToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </TripContext.Provider>
  );
};

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
