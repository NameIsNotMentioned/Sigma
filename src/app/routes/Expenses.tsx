import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { BookingCategory, Expense } from '../../types/trip';
import { formatINR, formatDate } from '../../lib/formatters';
import { calculateExpenseShares } from '../../lib/settlement';
import { Button, Badge } from 'open-glass-ui';
import { EditExpenseModal } from '../../components/expenses/EditExpenseModal';
import { AddExpenseModal } from '../../components/expenses/AddExpenseModal';
import {
  Plus,
  Filter,
  Users,
  CreditCard,
  Building,
  Plane,
  Utensils,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Trash2,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  stay: Building,
  transport: Plane,
  activity: Sparkles,
  food: Utensils,
  other: CreditCard,
};

export const Expenses: React.FC = () => {
  const {
    expenses,
    participants,
    setEditingExpenseId,
    setIsAddExpenseOpen,
    totalTripCost,
    deleteExpense,
  } = useTrip();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory === 'all') return true;
    return e.category === selectedCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900/80 via-[#07111F]/80 to-indigo-950/40 border border-white/10 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Trip Expenses & Bookings
            </h1>
            <Badge tone="accent">Live Ledger</Badge>
          </div>
          <p className="text-xs text-slate-300">
            Click any expense to adjust participant rosters and observe immediate share recalculation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="medium"
            onClick={() => setIsAddExpenseOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          {['all', 'stay', 'transport', 'activity', 'food'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all border ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Expenses' : cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 hidden sm:block">
          Showing {filteredExpenses.length} of {expenses.length} records
        </div>
      </div>

      {/* Expenses Cards Grid / List */}
      <div className="space-y-3">
        {filteredExpenses.map((exp) => {
          const payer = participants.find((p) => p.id === exp.paidBy);
          const shares = calculateExpenseShares(exp);
          const count = exp.participantIds.length;
          const perPerson = count > 0 ? Math.round(exp.amount / count) : 0;
          const isCancelled = exp.status === 'cancelled';
          const Icon = CATEGORY_ICONS[exp.category] || CreditCard;

          const isHotelDemoCard = exp.id === 'e1';

          return (
            <div
              key={exp.id}
              onClick={() => setEditingExpenseId(exp.id)}
              className={`relative p-4 lg:p-5 rounded-2xl border transition-all cursor-pointer group ${
                isHotelDemoCard
                  ? 'bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-slate-900/80 border-cyan-400/40 shadow-lg hover:border-cyan-400'
                  : isCancelled
                  ? 'bg-rose-950/10 border-rose-500/20 opacity-70'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              {/* Highlight badge for Hotel Demo */}
              {isHotelDemoCard && (
                <div className="absolute -top-2.5 right-6 px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-900 text-[10px] font-extrabold uppercase tracking-wide shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Key Demo Target • Click to Change Travelers</span>
                </div>
              )}

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left info */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {exp.title}
                      </span>
                      <Badge tone={isCancelled ? 'danger' : 'neutral'}>
                        {exp.category}
                      </Badge>
                      {isCancelled && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                          CANCELLED
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400">
                      <span>Vendor: {exp.vendor || 'N/A'}</span>
                      <span>•</span>
                      <span>{formatDate(exp.date)}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <span>Paid by</span>
                        <img
                          src={payer?.avatar}
                          alt={payer?.name}
                          className="w-4 h-4 rounded-full object-cover inline-block"
                        />
                        <span className="text-slate-200 font-medium">{payer?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right participant faces & amounts */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  {/* Participant Avatars */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-2">
                      {exp.participantIds.map((pId) => {
                        const person = participants.find((p) => p.id === pId);
                        return (
                          <img
                            key={pId}
                            src={person?.avatar}
                            alt={person?.name}
                            title={person?.name}
                            className="w-6 h-6 rounded-full border border-[#07111F] object-cover"
                          />
                        );
                      })}
                    </div>
                    <span className="text-xs text-slate-400">
                      {count} shared
                    </span>
                  </div>

                  {/* Financials */}
                  <div className="text-right min-w-[120px]">
                    <div className={`text-base font-extrabold ${isCancelled ? 'line-through text-slate-500' : 'text-white'}`}>
                      {formatINR(exp.amount)}
                    </div>
                    <div className="text-xs font-semibold text-cyan-400">
                      {isCancelled ? '₹0 / person' : `${formatINR(perPerson)} / person`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      aria-label={`Delete ${exp.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (window.confirm(`Delete "${exp.title}"? This cannot be undone.`)) deleteExpense(exp.id);
                      }}
                      className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-300 hover:bg-rose-500/25 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <EditExpenseModal />
      <AddExpenseModal />
    </div>
  );
};
