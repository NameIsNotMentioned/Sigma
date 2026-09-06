import React from 'react';
import { useTrip, type ActiveTab } from '../../context/TripContext';
import { Glass, Badge } from 'open-glass-ui';
import {
  Compass,
  Calendar,
  Receipt,
  Users,
  ArrowLeftRight,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { BrandLogo } from '../BrandLogo';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<{ isDarkTheme?: boolean }> = ({ isDarkTheme = true }) => {
  const { activeTab, setActiveTab, trip, participants, setSelectedParticipantId, setIsAddParticipantOpen, unoptimizedTransfers, optimizedTransfers } = useTrip();
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'people', label: 'People', icon: Users },
    {
      id: 'settlements',
      label: 'Settlements',
      icon: ArrowLeftRight,
      badge: unoptimizedTransfers.length > 0 ? `${unoptimizedTransfers.length}→${optimizedTransfers.length}` : undefined,
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <div className="sticky top-0 h-screen p-4 flex flex-col gap-4">
        {/* Glass Outer Shell using OpenGlass Glass component */}
        <Glass
          material="frosted"
          className="sidebar-glass flex-1 rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl"
        >
          {/* Top Brand & Trip Identity */}
          <div className="space-y-6">
            {/* Logo */}
            <BrandLogo isDarkTheme={isDarkTheme} compact />

            {/* Current Trip Card */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  Current Trip
                </span>
                <Badge tone="accent">Active</Badge>
              </div>
              <div className="font-semibold text-xs text-white truncate">
                {trip.name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{trip.destination}</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              <div className="px-2 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Menu
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-400/40 shadow-md shadow-cyan-500/10'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-cyan-400' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Participant Quick Roster */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Travelers ({participants.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setActiveTab('people'); setIsAddParticipantOpen(true); }}
                  className="text-[10px] text-cyan-400 hover:underline"
                >
                  View all
                </button>
                <button
                  onClick={() => setActiveTab('people')}
                  className="w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center hover:bg-cyan-500/25"
                  aria-label="Add people"
                  title="Add people"
                >
                  <span className="text-sm leading-none">+</span>
                </button>
              </div>
            </div>

            <div className="flex items-center -space-x-2 overflow-hidden px-1 py-1">
              {participants.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedParticipantId(p.id);
                  }}
                  title={`${p.name} - click to view ledger`}
                  className="relative group transition-transform hover:scale-110 hover:z-10 focus:outline-none"
                >
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-8 h-8 rounded-full border-2 border-[#07111F] object-cover ring-1 ring-white/20"
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[10px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Deterministic Settlement Active</span>
            </div>
          </div>
        </Glass>
      </div>
    </aside>
  );
};
