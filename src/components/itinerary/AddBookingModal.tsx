import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { BookingCategory } from '../../types/trip';

export const AddBookingModal: React.FC = () => {
  const { isAddBookingOpen, setIsAddBookingOpen, participants, addBooking } = useTrip();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BookingCategory>('activity');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('');
  const [amount, setAmount] = useState(0);
  const [paidBy, setPaidBy] = useState(participants[0]?.id ?? '');
  const [participantIds, setParticipantIds] = useState(() => participants.map((participant) => participant.id));

  if (!isAddBookingOpen) return null;

  const toggleParticipant = (id: string) => {
    setParticipantIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || amount < 0 || participantIds.length === 0) return;
    addBooking({
      title: title.trim(), category, vendor: vendor.trim(), date, time: time || undefined,
      amount: Number(amount), participantIds, paidBy, status: 'confirmed',
    });
    setIsAddBookingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-cyan-500/30 bg-[#0A1728]/95 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div><h2 className="text-lg font-bold text-white">Add Schedule Item</h2><p className="text-xs text-slate-400">Add a booking to the shared itinerary.</p></div>
          <button onClick={() => setIsAddBookingOpen(false)} className="p-1.5 rounded-full bg-white/5 text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs text-slate-300">Title<input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sunset cruise" className="mt-1 w-full input-dark" /></label>
            <label className="text-xs text-slate-300">Category<select value={category} onChange={(e) => setCategory(e.target.value as BookingCategory)} className="mt-1 w-full input-dark"><option value="activity">Activity</option><option value="stay">Stay</option><option value="transport">Transport</option><option value="food">Food</option><option value="other">Other</option></select></label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs text-slate-300">Vendor<input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Operator or venue" className="mt-1 w-full input-dark" /></label>
            <label className="text-xs text-slate-300">Amount (₹)<input type="number" min="0" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1 w-full input-dark" /></label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-xs text-slate-300">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full input-dark" /></label>
            <label className="text-xs text-slate-300">Time<input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full input-dark" /></label>
            <label className="text-xs text-slate-300">Paid by<select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className="mt-1 w-full input-dark">{participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          </div>
          <div><span className="text-xs text-slate-300">Included travelers</span><div className="grid grid-cols-2 gap-2 mt-2">{participants.map((p) => <label key={p.id} className="flex items-center gap-2 text-xs text-white"><input type="checkbox" checked={participantIds.includes(p.id)} onChange={() => toggleParticipant(p.id)} />{p.name}</label>)}</div></div>
          <button type="submit" className="marketing-primary w-full">Add to itinerary</button>
        </form>
      </div>
    </div>
  );
};
