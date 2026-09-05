import React from 'react';
import { useTrip, ActiveTab } from '../../context/TripContext';
import { Button, Badge } from 'open-glass-ui';
import { Plus, Calendar, Compass, Receipt, Users, ArrowLeftRight, Sparkles, Menu } from 'lucide-react';
import { formatDate } from '../../lib/formatters';

export const Topbar: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
  const {
    trip,
    activeTab,
    setActiveTab,
    setIsAddExpenseOpen,
    setIsSettlementOptimized,
    isSettlementOptimized,
  } = useTrip();

  return (
    <header className="topbar sticky top-0 z-20 border-b border-white/10 bg-[#07111F]/80 backdrop-blur-xl px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Trip Title & Date Info */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="eyebrow">LIVE TRIP CONTROL</div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {trip.name}
            </h2>
            <Badge tone="accent">Goa, IN</Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3 h-3 text-cyan-400" />
            <span>
              {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Mobile Tabs Nav */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto py-1">
        {(
          [
            { id: 'overview', label: 'Overview', icon: Compass },
            { id: 'itinerary', label: 'Itinerary', icon: Calendar },
            { id: 'expenses', label: 'Expenses', icon: Receipt },
            { id: 'people', label: 'People', icon: Users },
            { id: 'settlements', label: 'Settle', icon: ArrowLeftRight },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-2 rounded-lg text-xs flex items-center gap-1 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2.5">
        <Button
          variant="secondary"
          size="small"
          onClick={() => {
            setActiveTab('settlements');
            setIsSettlementOptimized(!isSettlementOptimized);
          }}
          className="hidden sm:inline-flex"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
          {isSettlementOptimized ? 'Show 5 Transfers' : 'Optimize (5→3)'}
        </Button>

        <button className="menu-chip flex" onClick={onMenuToggle} aria-label="Open trip menu">
        <Menu className="w-4 h-4" />
        </button>

        <Button
          variant="primary"
          size="small"
          onClick={() => setIsAddExpenseOpen(true)}
          className="warm-cta"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Expense
        </Button>
      </div>
    </header>
  );
};
