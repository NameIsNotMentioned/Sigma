import React from 'react';
import { useTrip } from '../../context/TripContext';
import { TripSphere } from '../../components/dashboard/TripSphere';
import { formatINR, formatShortDate } from '../../lib/formatters';
import { Stat, Card, Badge, Button } from 'open-glass-ui';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Users,
  Calendar,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Tag,
  AlertCircle,
} from 'lucide-react';

export const Overview: React.FC = () => {
  const {
    trip,
    participants,
    bookings,
    expenses,
    totalTripCost,
    totalPaid,
    totalOutstanding,
    averageShare,
    setActiveTab,
    setIsAddExpenseOpen,
    setSelectedBookingId,
    toggleExpenseCancel,
  } = useTrip();

  // Upcoming bookings preview
  const upcomingBookings = bookings.slice(0, 3);
  const activeExpenses = expenses.filter((e) => e.status !== 'cancelled');

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  activeExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.amount;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header Section */}
      <div className="reveal-on-scroll interactive-card editorial-hero relative p-6 lg:p-8 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900/90 via-[#07111F]/80 to-indigo-950/40 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE TRIP, REIMAGINED · 2026</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Your entire trip,
            <span className="hero-accent"> beautifully in sync.</span>
          </h1>

          <p className="text-sm lg:text-base text-slate-300 leading-relaxed">
            Coordinate bookings, track shared expenses, and settle every rupee without the
            spreadsheet chaos.
          </p>

          {/* Hero Quick Stats Strip */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>{participants.length} Active Travelers</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>4 Days • 5 Key Itinerary Stops</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Spreadsheets • Live Ledger</span>
            </div>
          </div>

          <div className="hero-orbit" aria-hidden="true">
            <div className="hero-orbit-ring ring-one" />
            <div className="hero-orbit-ring ring-two" />
            <div className="hero-orbit-core">
              <span className="hero-orbit-dot" />
              <span>LIVE<br />LEDGER</span>
            </div>
            <div className="hero-floating-note note-top">6 TRAVELERS</div>
            <div className="hero-floating-note note-bottom">₹64.8K TRACKED</div>
          </div>
        </div>

        <div className="section-kicker reveal-on-scroll">
          <span>01 / OVERVIEW</span>
          <span className="section-line" />
          <span>EVERYTHING IN MOTION</span>
        </div>
      </div>

      {/* KPI Stats Row using OpenGlass Stat Component */}
      <div className="reveal-on-scroll grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="interactive-card p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg hover:border-cyan-400/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Trip Cost</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatINR(totalTripCost)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across {activeExpenses.length} verified bookings</span>
          </div>
        </div>

        <div className="interactive-card p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg hover:border-purple-400/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Average Per Person</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatINR(averageShare)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-purple-400">
            <span>Dynamic share for {participants.length} friends</span>
          </div>
        </div>

        <div className="interactive-card p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg hover:border-emerald-400/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Amount Paid</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatINR(totalPaid)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% paid upfront to vendors</span>
          </div>
        </div>

        <div className="interactive-card p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg hover:border-amber-400/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Outstanding Settle</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatINR(totalOutstanding)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400">
            <span>Ready for algorithmic settlement</span>
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Trip Sphere + Upcoming Itinerary */}
      <div className="reveal-on-scroll grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: 3D Trip Sphere */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Trip Sphere & Spatial Waypoints
              </h3>
              <Badge tone="accent">R3F 3D</Badge>
            </div>
            <span className="text-xs text-slate-400">Real-time route geometry</span>
          </div>

          {/* Interactive 3D Sphere Canvas */}
          <TripSphere />
        </div>

        {/* Right 5 cols: Upcoming Itinerary Preview */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">
              Upcoming Schedule
            </h3>
            <button
              onClick={() => setActiveTab('itinerary')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Full Itinerary</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  setSelectedBookingId(b.id);
                  setActiveTab('itinerary');
                }}
                className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 cursor-pointer transition-all hover:bg-white/[0.07] group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-cyan-400">
                    {formatShortDate(b.date)} • {b.time}
                  </span>
                  <Badge tone={b.status === 'confirmed' ? 'positive' : 'warning'}>
                    {b.category}
                  </Badge>
                </div>
                <div className="font-semibold text-xs text-white group-hover:text-cyan-300 transition-colors">
                  {b.title}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{b.vendor}</span>
                  <span className="font-medium text-slate-200">{formatINR(b.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Overview & Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
          <h3 className="text-sm font-bold text-white mb-4">
            Trip Expense Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(categoryTotals).map(([cat, amount]) => {
              const pct = Math.round((amount / (totalTripCost || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize text-slate-300 font-medium">{cat}</span>
                    <span className="text-white font-semibold">{formatINR(amount)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Ledger Activity (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">
              Recent Ledger Activity
            </h3>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-xs text-cyan-400 hover:underline"
            >
              View All Expenses
            </button>
          </div>

          <div className="space-y-3">
            {expenses.slice(0, 4).map((exp) => {
              const payer = participants.find((p) => p.id === exp.paidBy);
              const isCancelled = exp.status === 'cancelled';
              return (
                <div
                  key={exp.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCancelled
                      ? 'bg-rose-950/20 border-rose-500/20 opacity-70'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={payer?.avatar}
                      alt={payer?.name}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <div className={`text-xs font-semibold ${isCancelled ? 'line-through text-slate-400' : 'text-white'}`}>
                        {exp.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Paid by {payer?.name} • {exp.participantIds.length} travelers
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold ${isCancelled ? 'text-rose-400' : 'text-cyan-400'}`}>
                      {isCancelled ? 'Cancelled' : formatINR(exp.amount)}
                    </div>
                    {!isCancelled && (
                      <div className="text-[10px] text-slate-400">
                        {formatINR(Math.round(exp.amount / exp.participantIds.length))}/person
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
