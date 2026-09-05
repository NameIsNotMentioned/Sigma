import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { Booking } from '../../types/trip';
import { formatINR, formatDate, formatShortDate } from '../../lib/formatters';
import { Button, Badge } from 'open-glass-ui';
import { BookingDrawer } from '../../components/itinerary/BookingDrawer';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building,
  Plane,
  Sparkles,
  Utensils,
  Plus,
  Filter,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  stay: Building,
  transport: Plane,
  activity: Sparkles,
  food: Utensils,
  other: Calendar,
};

export const Itinerary: React.FC = () => {
  const { bookings, participants, setSelectedBookingId, setIsAddExpenseOpen } = useTrip();
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedParticipant, setSelectedParticipant] = useState<string>('all');

  // Unique dates in the itinerary
  const dates = Array.from(new Set(bookings.map((b) => b.date))).sort();

  // Filtering
  const filteredBookings = bookings.filter((b) => {
    if (selectedDay !== 'all' && b.date !== selectedDay) return false;
    if (selectedParticipant !== 'all' && !b.participantIds.includes(selectedParticipant)) {
      return false;
    }
    return true;
  });

  // Group by date
  const groupedBookings: Record<string, Booking[]> = {};
  filteredBookings.forEach((b) => {
    if (!groupedBookings[b.date]) groupedBookings[b.date] = [];
    groupedBookings[b.date].push(b);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/80 via-[#07111F]/80 to-purple-950/30 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Trip Itinerary & Timeline
            </h1>
            <Badge tone="accent">4 Days</Badge>
          </div>
          <p className="text-xs text-slate-300">
            Interactive schedule for transport, villa accommodations, dining, and expeditions.
          </p>
        </div>

        <Button
          variant="primary"
          size="medium"
          onClick={() => setIsAddExpenseOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Schedule Item
        </Button>
      </div>

      {/* Filters Bar: Day & Participant */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
        {/* Day Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
              selectedDay === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
            }`}
          >
            All Days
          </button>
          {dates.map((date, idx) => (
            <button
              key={date}
              onClick={() => setSelectedDay(date)}
              className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                selectedDay === date
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              Day {idx + 1} ({formatShortDate(date)})
            </button>
          ))}
        </div>

        {/* Participant Filter Dropdown */}
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Filter Traveler:</span>
          <select
            value={selectedParticipant}
            onChange={(e) => setSelectedParticipant(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
          >
            <option value="all">Everyone ({participants.length})</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline grouped by Day */}
      <div className="space-y-8">
        {Object.entries(groupedBookings).map(([date, dayBookings], dayIdx) => (
          <div key={date} className="space-y-4">
            {/* Day Header Marker */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                Day {dayIdx + 1} • {formatDate(date)}
              </div>
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-slate-400">
                {dayBookings.length} bookings
              </span>
            </div>

            {/* Bookings under this day */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dayBookings.map((b) => {
                const isCancelled = b.status === 'cancelled';
                const Icon = CATEGORY_ICONS[b.category] || Calendar;
                const payer = participants.find((p) => p.id === b.paidBy);

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBookingId(b.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] group ${
                      isCancelled
                        ? 'bg-rose-950/10 border-rose-500/20 opacity-70'
                        : 'bg-white/[0.03] border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {b.category}
                          </span>
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {b.title}
                          </h3>
                        </div>
                      </div>

                      <Badge tone={isCancelled ? 'danger' : 'positive'}>
                        {isCancelled ? 'Cancelled' : 'Confirmed'}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{b.time || 'All Day'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span className="truncate">{b.location || b.vendor}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center -space-x-1.5">
                          {b.participantIds.map((pId) => {
                            const person = participants.find((p) => p.id === pId);
                            return (
                              <img
                                key={pId}
                                src={person?.avatar}
                                alt={person?.name}
                                title={person?.name}
                                className="w-5 h-5 rounded-full border border-[#07111F] object-cover"
                              />
                            );
                          })}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {b.participantIds.length} attending
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-bold ${isCancelled ? 'line-through text-slate-500' : 'text-cyan-400'}`}>
                          {formatINR(b.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Booking Drawer */}
      <BookingDrawer />
    </div>
  );
};

