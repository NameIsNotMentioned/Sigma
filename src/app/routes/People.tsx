import React from 'react';
import { useTrip } from '../../context/TripContext';
import { formatINR } from '../../lib/formatters';
import { Button, Badge } from 'open-glass-ui';
import { ParticipantDrawer } from '../../components/people/ParticipantDrawer';
import { Users, ShieldCheck, ArrowRight, Wallet, CheckCircle2, TrendingUp } from 'lucide-react';

export const People: React.FC = () => {
  const { participants, participantBalances, setSelectedParticipantId } = useTrip();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/80 via-[#07111F]/80 to-blue-950/30 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Travelers & Financial Profiles
            </h1>
            <Badge tone="accent">{participants.length} Active</Badge>
          </div>
          <p className="text-xs text-slate-300">
            Each traveler has a deterministic balance derived from upfront payments minus consumed shares.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Conservation of Value: Net Sum = ₹0</span>
        </div>
      </div>

      {/* Grid of Participant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.map((p) => {
          const bal = participantBalances.find((b) => b.participantId === p.id);
          const net = bal?.netBalance ?? 0;
          const isCreditor = net > 0.5;
          const isDebtor = net < -0.5;
          const isSettled = !isCreditor && !isDebtor;

          return (
            <div
              key={p.id}
              onClick={() => setSelectedParticipantId(p.id)}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.06] transition-all cursor-pointer shadow-lg group flex flex-col justify-between space-y-4"
            >
              {/* Top row: Avatar & Identity */}
              <div className="flex items-start gap-3.5">
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-white/15 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {p.name}
                    </h3>
                  </div>
                  <p className="text-xs text-cyan-400 font-medium truncate">{p.role}</p>
                  <p className="text-[11px] text-slate-400 truncate">{p.email}</p>
                </div>
              </div>

              {/* Middle Financial Status Pill */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Net Ledger Status</span>
                  <span className="text-[10px] text-slate-300">
                    {bal?.activitiesJoined} activities
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span
                    className={`text-lg font-black ${
                      isCreditor
                        ? 'text-emerald-400'
                        : isDebtor
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {isSettled
                      ? 'Settled'
                      : isCreditor
                      ? `+${formatINR(net)}`
                      : `-${formatINR(Math.abs(net))}`}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCreditor
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : isDebtor
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {isCreditor ? 'Gets Back' : isDebtor ? 'Owes Money' : 'Even'}
                  </span>
                </div>
              </div>

              {/* Bottom Breakdown stats */}
              <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">
                    Paid Out
                  </div>
                  <div className="font-semibold text-white">
                    {formatINR(bal?.totalPaid ?? 0)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">
                    Total Share
                  </div>
                  <div className="font-semibold text-white">
                    {formatINR(bal?.totalShare ?? 0)}
                  </div>
                </div>
              </div>

              {/* Drawer prompt */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 group-hover:text-cyan-300 transition-colors pt-1">
                <span>View personal ledger</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Participant Drawer */}
      <ParticipantDrawer />
    </div>
  );
};

