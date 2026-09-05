import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { formatINR, formatDate, formatShortDate } from '../../lib/formatters';
import { calculateExpenseShares } from '../../lib/settlement';
import { Button, Badge } from 'open-glass-ui';
import {
  X,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const ParticipantDrawer: React.FC = () => {
  const {
    selectedParticipantId,
    setSelectedParticipantId,
    participants,
    bookings,
    expenses,
    payments,
    participantBalances,
  } = useTrip();

  const [activeTab, setActiveTab] = useState<'itinerary' | 'expenses'>('itinerary');

  const participant = participants.find((p) => p.id === selectedParticipantId);
  const balance = participantBalances.find((b) => b.participantId === selectedParticipantId);

  if (!participant || !balance) return null;

  // Personal bookings
  const personalBookings = bookings.filter((b) =>
    b.participantIds.includes(participant.id)
  );

  // Personal expenses (where they are either payer or consumer)
  const personalExpenses = expenses.filter(
    (e) => e.paidBy === participant.id || e.participantIds.includes(participant.id)
  );

  const isCreditor = balance.netBalance > 0.5;
  const isDebtor = balance.netBalance < -0.5;
  const isSettled = !isCreditor && !isDebtor;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setSelectedParticipantId(null)}
    >
      <div
        className="relative w-full max-w-lg h-full bg-[#0A1728] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Top Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={participant.avatar}
                alt={participant.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400/40 shadow-lg shadow-cyan-500/10"
              />
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {participant.name}
                </h2>
                <p className="text-xs text-cyan-400 font-medium">{participant.role}</p>
                <p className="text-[11px] text-slate-400">{participant.email}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedParticipantId(null)}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Financial Identity Hero Card */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Net Balance
              </span>
              <Badge tone={isCreditor ? 'positive' : isDebtor ? 'danger' : 'neutral'}>
                {isCreditor ? 'Gets Back (Creditor)' : isDebtor ? 'Owes Money (Debtor)' : 'Settled'}
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <div
                className={`text-3xl font-extrabold tracking-tight ${
                  isCreditor
                    ? 'text-emerald-400'
                    : isDebtor
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}
              >
                {isSettled
                  ? '₹0'
                  : isCreditor
                  ? `+${formatINR(balance.netBalance)}`
                  : `-${formatINR(Math.abs(balance.netBalance))}`}
              </div>
              <div className="text-xs text-slate-400">
                {isCreditor
                  ? 'To collect from group'
                  : isDebtor
                  ? 'To pay into settlement'
                  : 'All shares even'}
              </div>
            </div>

            {/* Breakdown strip */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
              <div className="p-2 rounded-xl bg-white/[0.02]">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">
                  Paid for Trip
                </div>
                <div className="text-sm font-bold text-white">
                  {formatINR(balance.totalPaid)}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/[0.02]">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">
                  Total Share Owed
                </div>
                <div className="text-sm font-bold text-white">
                  {formatINR(balance.totalShare)}
                </div>
              </div>
            </div>
          </div>

          {/* Inner Drawer Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'itinerary'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Personal Itinerary ({personalBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'expenses'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Personal Expenses ({personalExpenses.length})
            </button>
          </div>

          {/* Tab 1: Personal Itinerary */}
          {activeTab === 'itinerary' && (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {personalBookings.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Not participating in any upcoming events yet.
                </div>
              ) : (
                personalBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white truncate">{b.title}</span>
                      <Badge tone={b.status === 'confirmed' ? 'positive' : 'warning'}>
                        {b.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>{formatShortDate(b.date)} • {b.time || 'All Day'}</span>
                      <span className="font-medium text-cyan-400">
                        Share: {formatINR(Math.round(b.amount / b.participantIds.length))}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Personal Expenses */}
          {activeTab === 'expenses' && (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {personalExpenses.map((exp) => {
                const isPayer = exp.paidBy === participant.id;
                const shares = calculateExpenseShares(exp);
                const shareAmount = shares[participant.id] ?? 0;

                return (
                  <div
                    key={exp.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-white">{exp.title}</div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isPayer
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {isPayer ? 'Paid Full Bill' : 'Sharing Cost'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>{formatDate(exp.date)}</span>
                      <div className="text-right">
                        {isPayer && (
                          <div className="text-slate-300">Paid: {formatINR(exp.amount)}</div>
                        )}
                        <div className="text-cyan-400 font-semibold">
                          Share: {formatINR(shareAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10">
          <Button
            variant="secondary"
            size="medium"
            className="w-full justify-center"
            onClick={() => setSelectedParticipantId(null)}
          >
            Close Personal View
          </Button>
        </div>
      </div>
    </div>
  );
};

