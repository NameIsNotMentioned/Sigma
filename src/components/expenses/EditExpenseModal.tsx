import React from 'react';
import { useTrip } from '../../context/TripContext';
import { formatINR, formatDate } from '../../lib/formatters';
import { calculateExpenseShares } from '../../lib/settlement';
import { Dialog, Button, Badge } from 'open-glass-ui';
import { Check, X, Users, AlertTriangle, ShieldCheck, Sparkles, Building } from 'lucide-react';

export const EditExpenseModal: React.FC = () => {
  const {
    editingExpenseId,
    setEditingExpenseId,
    expenses,
    participants,
    setExpenseParticipants,
    toggleExpenseCancel,
  } = useTrip();

  const expense = expenses.find((e) => e.id === editingExpenseId);

  if (!expense) return null;

  const payer = participants.find((p) => p.id === expense.paidBy);
  const shares = calculateExpenseShares(expense);
  const currentCount = expense.participantIds.length;
  const perPersonShare = currentCount > 0 ? Math.round(expense.amount / currentCount) : 0;
  const isCancelled = expense.status === 'cancelled';

  const toggleParticipant = (participantId: string) => {
    let nextIds: string[];
    if (expense.participantIds.includes(participantId)) {
      // Cannot remove last participant
      if (expense.participantIds.length <= 1) return;
      nextIds = expense.participantIds.filter((id) => id !== participantId);
    } else {
      nextIds = [...expense.participantIds, participantId];
    }
    setExpenseParticipants(expense.id, nextIds);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setEditingExpenseId(null)}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-[#0A1728]/95 p-6 shadow-2xl backdrop-blur-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge tone={isCancelled ? 'danger' : 'accent'}>
                {expense.category.toUpperCase()}
              </Badge>
              <span className="text-xs text-slate-400">{formatDate(expense.date)}</span>
              {isCancelled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  CANCELLED / ZERO SHARE
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {expense.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Vendor: {expense.vendor || 'N/A'} • Paid by{' '}
              <span className="text-white font-medium">{payer?.name}</span>
            </p>
          </div>

          <button
            onClick={() => setEditingExpenseId(null)}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Calculation Callout Box (Master Plan Demo Core) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border border-cyan-400/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Dynamic Share Engine
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-300 font-semibold border border-cyan-400/30">
              Auto-Recalculating
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="text-2xl font-black text-white">
                {formatINR(expense.amount)}
              </div>
              <div className="text-[11px] text-slate-400">
                Total Expense Amount
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-cyan-400 animate-in zoom-in-95 duration-200">
                {isCancelled ? '₹0' : formatINR(perPersonShare)}
              </div>
              <div className="text-[11px] text-cyan-300 font-medium">
                Per-Person Share ({currentCount} travelers)
              </div>
            </div>
          </div>

          {/* Demonstration Notice */}
          <div className="pt-2 text-[11px] text-slate-300 border-t border-white/10 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              Toggle travelers below to observe instant live share redistribution.
            </span>
          </div>
        </div>

        {/* Participant Selection Roster */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Select Participants for this Booking</span>
            <span className="text-cyan-400">
              {currentCount} of {participants.length} included
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {participants.map((p) => {
              const isSelected = expense.participantIds.includes(p.id);
              const isPayer = expense.paidBy === p.id;
              const individualShare = shares[p.id] ?? 0;

              return (
                <div
                  key={p.id}
                  onClick={() => toggleParticipant(p.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-400/60 text-white shadow-sm shadow-cyan-500/10'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-400 text-slate-900'
                          : 'border-white/20 bg-black/20'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-7 h-7 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <div className="text-xs font-medium text-white flex items-center gap-1">
                        <span>{p.name}</span>
                        {isPayer && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
                            Payer
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isSelected
                          ? isCancelled
                            ? 'Cancelled'
                            : `Owes ${formatINR(individualShare)}`
                          : 'Not sharing'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={() => toggleExpenseCancel(expense.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              isCancelled
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                : 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:bg-rose-900/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isCancelled ? 'Reactivate Expense' : 'Cancel Expense (Simulation)'}</span>
          </button>

          <Button
            variant="primary"
            size="medium"
            onClick={() => setEditingExpenseId(null)}
          >
            Done & Recalculate
          </Button>
        </div>
      </div>
    </div>
  );
};

