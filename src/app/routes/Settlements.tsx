import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { formatINR } from '../../lib/formatters';
import { Button, Badge } from 'open-glass-ui';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Layers,
  ArrowLeftRight,
  ShieldCheck,
  Check,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Settlements: React.FC = () => {
  const {
    participants,
    totalTripCost,
    totalPaid,
    totalOutstanding,
    unoptimizedTransfers,
    optimizedTransfers,
    isSettlementOptimized,
    setIsSettlementOptimized,
    recordSettlementPayment,
    participantBalances,
  } = useTrip();

  const [settledTransferIds, setSettledTransferIds] = useState<string[]>([]);

  const displayedTransfers = isSettlementOptimized
    ? optimizedTransfers
    : unoptimizedTransfers;

  const handleSettle = (transferId: string, fromId: string, toId: string, amount: number) => {
    setSettledTransferIds((prev) => [...prev, transferId]);
    recordSettlementPayment(fromId, toId, amount);

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00F0FF', '#A78BFA', '#10B981'],
      });
    } catch {
      // ignore
    }
  };

  const reductionCount = unoptimizedTransfers.length - optimizedTransfers.length;
  const reductionPct = Math.round(
    ((unoptimizedTransfers.length - optimizedTransfers.length) / (unoptimizedTransfers.length || 1)) * 100
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Header & Optimization Controller */}
      <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#07111F]/90 to-purple-950/40 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                Algorithmic Debt Simplification
              </span>
              <Badge tone="positive">Zero Loss</Badge>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Final Trip Settlement Engine
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">
              Eliminate circular payments and confusing multiple transfers. Our settlement engine
              minimizes cash flows so everyone settles with the fewest possible transactions.
            </p>
          </div>

          {/* Toggle / Action Button */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <span className={!isSettlementOptimized ? 'text-white font-bold' : 'text-slate-400'}>
                Pairwise ({unoptimizedTransfers.length})
              </span>
              <button
                onClick={() => setIsSettlementOptimized(!isSettlementOptimized)}
                className={`relative w-12 h-6 rounded-full transition-colors p-0.5 border ${
                  isSettlementOptimized
                    ? 'bg-cyan-500 border-cyan-400'
                    : 'bg-slate-700 border-white/10'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                    isSettlementOptimized ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={isSettlementOptimized ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                Optimized ({optimizedTransfers.length})
              </span>
            </div>

            <Button
              variant={isSettlementOptimized ? 'secondary' : 'primary'}
              size="medium"
              onClick={() => setIsSettlementOptimized(!isSettlementOptimized)}
              className="w-full justify-center text-xs"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" />
              {isSettlementOptimized ? 'Show Raw Pairwise' : 'Optimize Settlements'}
            </Button>
          </div>
        </div>

        {/* Before vs After Metric Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[11px] text-slate-400 font-medium">Standard Pairwise</div>
            <div className="text-xl font-extrabold text-slate-300">
              {unoptimizedTransfers.length} Transfers
            </div>
            <div className="text-[10px] text-slate-500">Unoptimized peer back-and-forth</div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
            <div className="text-[11px] text-cyan-300 font-medium">After Optimization</div>
            <div className="text-xl font-extrabold text-cyan-400">
              {optimizedTransfers.length} Transfers
            </div>
            <div className="text-[10px] text-cyan-300 font-semibold">
              Reduced by {reductionCount > 0 ? reductionCount : 0} transfers ({reductionPct > 0 ? reductionPct : 0}% reduction)
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="text-[11px] text-emerald-300 font-medium">Mathematical Guarantee</div>
            <div className="text-xl font-extrabold text-emerald-400">100% Exact</div>
            <div className="text-[10px] text-emerald-300">Every rupee accounted for</div>
          </div>
        </div>
      </div>

      {/* Transfers List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isSettlementOptimized ? 'Optimized Payment Plan' : 'Pairwise Payment Plan'}
            </h2>
            <Badge tone={isSettlementOptimized ? 'positive' : 'warning'}>
              {displayedTransfers.length} Transfers Required
            </Badge>
          </div>

          <span className="text-xs text-slate-400">
            Click "Record Settle" when payments are cleared
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedTransfers.map((t) => {
            const debtor = participants.find((p) => p.id === t.fromId);
            const creditor = participants.find((p) => p.id === t.toId);
            const isSettled = settledTransferIds.includes(t.id);

            return (
              <div
                key={t.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isSettled
                    ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75'
                    : 'bg-white/[0.03] border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Transfer #{t.id}</span>
                    {isSettled && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Settled
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-extrabold text-white">
                    {formatINR(t.amount)}
                  </div>
                </div>

                {/* Transfer Path: Debtor -> Creditor */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
                  {/* From (Debtor) */}
                  <div className="flex items-center gap-2.5">
                    <img
                      src={debtor?.avatar}
                      alt={debtor?.name}
                      className="w-9 h-9 rounded-full object-cover border border-rose-500/30"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{debtor?.name}</div>
                      <div className="text-[10px] text-rose-400 font-medium">Sends Money</div>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* To (Creditor) */}
                  <div className="flex items-center gap-2.5 text-right">
                    <div>
                      <div className="text-xs font-bold text-white">{creditor?.name}</div>
                      <div className="text-[10px] text-emerald-400 font-medium">Receives</div>
                    </div>
                    <img
                      src={creditor?.avatar}
                      alt={creditor?.name}
                      className="w-9 h-9 rounded-full object-cover border border-emerald-500/30"
                    />
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    {isSettled
                      ? 'Recorded in ledger'
                      : `Awaiting ${debtor?.name.split(' ')[0]} to transfer ${formatINR(t.amount)}`}
                  </div>

                  <button
                    disabled={isSettled}
                    onClick={() => handleSettle(t.id, t.fromId, t.toId, t.amount)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSettled
                        ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
                    }`}
                  >
                    {isSettled ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Record Settle</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

