import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { BookingCategory, Expense } from '../../types/trip';
import { formatINR } from '../../lib/formatters';
import { Button, Badge } from 'open-glass-ui';
import { X, Plus, Users, Check } from 'lucide-react';

export const AddExpenseModal: React.FC = () => {
  const {
    isAddExpenseOpen,
    setIsAddExpenseOpen,
    participants,
    addExpense,
  } = useTrip();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BookingCategory>('activity');
  const [amount, setAmount] = useState<number>(3000);
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState<string>(participants[0]?.id || '');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    participants.map((p) => p.id)
  );
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom'>('equal');
  const [notes, setNotes] = useState('');

  if (!isAddExpenseOpen) return null;

  const toggleParticipant = (id: string) => {
    if (selectedParticipants.includes(id)) {
      if (selectedParticipants.length <= 1) return;
      setSelectedParticipants(selectedParticipants.filter((p) => p !== id));
    } else {
      setSelectedParticipants([...selectedParticipants, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    addExpense({
      title: title.trim(),
      category,
      amount: Number(amount),
      vendor: vendor.trim() || undefined,
      date,
      paidBy,
      participantIds: selectedParticipants,
      splitMethod,
      status: 'active',
      notes: notes.trim() || undefined,
    });

    setIsAddExpenseOpen(false);
  };

  const perPersonShare =
    selectedParticipants.length > 0
      ? Math.round(amount / selectedParticipants.length)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-cyan-500/30 bg-[#0A1728]/95 p-6 shadow-2xl backdrop-blur-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Add New Expense
            </h2>
            <p className="text-xs text-slate-400">
              Record a booking or shared payment for the Goa trip
            </p>
          </div>
          <button
            onClick={() => setIsAddExpenseOpen(false)}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-300">Expense Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Scuba Diving Tickets"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BookingCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="activity">Activity</option>
                <option value="stay">Stay</option>
                <option value="transport">Transport</option>
                <option value="food">Food</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Amount & Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Total Amount (₹)</label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Vendor / Venue</label>
              <input
                type="text"
                placeholder="e.g. Goa Water Sports"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Date & Paid By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Paid By</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Participant Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Select Who Shares</span>
              <span className="text-cyan-400 font-semibold">
                {formatINR(perPersonShare)} / person ({selectedParticipants.length} people)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {participants.map((p) => {
                const isSelected = selectedParticipants.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleParticipant(p.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400/50 text-white'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-400 text-slate-900'
                          : 'border-white/20'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs truncate">{p.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Notes (optional)</label>
            <input
              type="text"
              placeholder="e.g. Card invoice #9928"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <Button variant="primary" size="medium" type="submit">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add to Ledger
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

