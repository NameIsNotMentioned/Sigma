import React from 'react';
import { useTrip } from '../../context/TripContext';
import { formatINR, formatDate } from '../../lib/formatters';
import { Button, Badge } from 'open-glass-ui';
import { X, Calendar, MapPin, Building, Users, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export const BookingDrawer: React.FC = () => {
  const {
    selectedBookingId,
    setSelectedBookingId,
    bookings,
    participants,
    toggleBookingCancel,
    setEditingExpenseId,
    expenses,
  } = useTrip();

  const booking = bookings.find((b) => b.id === selectedBookingId);

  if (!booking) return null;

  const payer = participants.find((p) => p.id === booking.paidBy);
  const isCancelled = booking.status === 'cancelled';
  const matchingExpense = expenses.find((e) => e.bookingId === booking.id);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setSelectedBookingId(null)}
    >
      <div
        className="relative w-full max-w-md h-full bg-[#0A1728] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge tone={isCancelled ? 'danger' : 'accent'}>
                  {booking.category.toUpperCase()}
                </Badge>
                <span className="text-xs text-slate-400">{booking.time || 'All Day'}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {booking.title}
              </h2>
            </div>
            <button
              onClick={() => setSelectedBookingId(null)}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount & Status Card */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Booking Status</span>
              <Badge tone={isCancelled ? 'danger' : 'positive'}>
                {isCancelled ? 'Cancelled' : 'Confirmed & Paid'}
              </Badge>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {formatINR(booking.amount)}
            </div>
            <div className="text-xs text-cyan-400">
              Paid by {payer?.name} • {booking.participantIds.length} travelers included
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <Building className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Vendor / Operator</div>
                <div className="text-slate-400">{booking.vendor}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Date & Schedule</div>
                <div className="text-slate-400">
                  {formatDate(booking.date)} {booking.time ? `• ${booking.time}` : ''}
                </div>
              </div>
            </div>

            {booking.location && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Location</div>
                  <div className="text-slate-400">{booking.location}</div>
                </div>
              </div>
            )}

            {booking.notes && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="font-semibold text-white mb-1">Notes & Inclusions</div>
                <div className="text-slate-300 leading-relaxed">{booking.notes}</div>
              </div>
            )}
          </div>

          {/* Participating travelers */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">
              Participating Travelers ({booking.participantIds.length})
            </div>
            <div className="space-y-1.5">
              {booking.participantIds.map((pId) => {
                const person = participants.find((p) => p.id === pId);
                return (
                  <div
                    key={pId}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={person?.avatar}
                        alt={person?.name}
                        className="w-7 h-7 rounded-full object-cover border border-white/10"
                      />
                      <span className="text-xs font-medium text-white">{person?.name}</span>
                    </div>
                    <span className="text-xs text-cyan-400 font-medium">
                      {formatINR(Math.round(booking.amount / booking.participantIds.length))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="pt-6 border-t border-white/10 flex flex-col gap-2">
          {matchingExpense && (
            <Button
              variant="secondary"
              size="medium"
              onClick={() => {
                setSelectedBookingId(null);
                setEditingExpenseId(matchingExpense.id);
              }}
            >
              <Users className="w-4 h-4 mr-2 text-cyan-400" />
              Change Participants in Ledger
            </Button>
          )}

          <button
            onClick={() => toggleBookingCancel(booking.id)}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
              isCancelled
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                : 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:bg-rose-900/40'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>
              {isCancelled ? 'Reactivate This Booking' : 'Mark Booking Cancelled (Recalculate)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

