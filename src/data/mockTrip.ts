import { Booking, Expense, Participant, Trip } from '../types/trip';

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'p1',
    name: 'Aarav Sharma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    email: 'aarav@grouptrip.io',
    role: 'Trip Organizer',
  },
  {
    id: 'p2',
    name: 'Diya Patel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    email: 'diya@grouptrip.io',
    role: 'Activity Lead',
  },
  {
    id: 'p3',
    name: 'Kabir Mehta',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    email: 'kabir@grouptrip.io',
    role: 'Logistics Lead',
  },
  {
    id: 'p4',
    name: 'Meera Rao',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'meera@grouptrip.io',
    role: 'Food & Dining',
  },
  {
    id: 'p5',
    name: 'Rohan Gupta',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'rohan@grouptrip.io',
    role: 'Photographer',
  },
  {
    id: 'p6',
    name: 'Sneha Joshi',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    email: 'sneha@grouptrip.io',
    role: 'Social & Vibe',
  },
];

export const INITIAL_TRIP: Trip = {
  id: 'trip-goa-2026',
  name: 'Goa Coastal Odyssey',
  destination: 'North & South Goa, India',
  startDate: '2026-10-12',
  endDate: '2026-10-16',
  participantIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
  bookingIds: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'],
  expenseIds: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'],
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    title: 'Villa Sol Vagator Luxury House',
    category: 'stay',
    vendor: 'Villa Sol Goa',
    date: '2026-10-12',
    amount: 24000,
    participantIds: ['p1', 'p3', 'p4', 'p5'], // 4 people: Aarav, Kabir, Meera, Rohan
    paidBy: 'p1', // Aarav
    status: 'confirmed',
    location: 'Vagator Beach Rd, North Goa',
    notes: 'Private 4-bedroom sea-view villa with pool & breakfast included.',
    time: 'Check-in: 02:00 PM',
  },
  {
    id: 'b2',
    title: 'Private 7-Seater AC Cruiser & Fuel',
    category: 'transport',
    vendor: 'Goa Cruiser Fleet',
    date: '2026-10-12',
    amount: 12000,
    participantIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], // all 6
    paidBy: 'p3', // Kabir
    status: 'confirmed',
    location: 'Mopa Airport Pickup (GOX)',
    notes: 'Dedicated driver for all 4 days with luggage rack and toll passes.',
    time: '09:30 AM',
  },
  {
    id: 'b3',
    title: 'Scuba Diving & Dolphin Cruise',
    category: 'activity',
    vendor: 'Aquasports Goa',
    date: '2026-10-13',
    amount: 9000,
    participantIds: ['p2', 'p5', 'p6'], // Diya, Rohan, Sneha
    paidBy: 'p2', // Diya
    status: 'confirmed',
    location: 'Grand Island Boat Pier',
    notes: 'Certified PADI instructor dive + video kit + boat equipment.',
    time: '07:00 AM - 01:00 PM',
  },
  {
    id: 'b4',
    title: 'Chef\'s Table Coastal Seafood Feast',
    category: 'food',
    vendor: "Fisherman's Wharf",
    date: '2026-10-13',
    amount: 7200,
    participantIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], // all 6
    paidBy: 'p1', // Aarav
    status: 'confirmed',
    location: 'Sal River, Cavelossim',
    notes: 'Special Goan curry crab platter, prawns recheado, and mocktails.',
    time: '08:30 PM',
  },
  {
    id: 'b5',
    title: 'Dudhsagar Jungle Trek & Safari',
    category: 'activity',
    vendor: 'Goa Eco Adventures',
    date: '2026-10-14',
    amount: 6000,
    participantIds: ['p1', 'p3', 'p4', 'p6'], // 4 people: Aarav, Kabir, Meera, Sneha
    paidBy: 'p4', // Meera
    status: 'confirmed',
    location: 'Mollem National Park Entry',
    notes: 'Forest permits, 4x4 open safari jeep, life jackets, and guide fee.',
    time: '06:00 AM - 02:00 PM',
  },
  {
    id: 'b6',
    title: 'Sunset Cocktails & Greek Dinner',
    category: 'food',
    vendor: 'Thalassa Siolim',
    date: '2026-10-15',
    amount: 6600,
    participantIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], // all 6
    paidBy: 'p5', // Rohan
    status: 'confirmed',
    location: 'Vaddy, Siolim Backwaters',
    notes: 'Sunset cliff table reserved with live acoustic performance.',
    time: '06:30 PM',
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'e1',
    title: 'Villa Sol Beach House (4 Nights)',
    category: 'stay',
    amount: 24000,
    paidBy: 'p1', // Aarav
    participantIds: ['p1', 'p3', 'p4', 'p5'], // Aarav, Kabir, Meera, Rohan (₹6,000 each)
    splitMethod: 'equal',
    status: 'active',
    date: '2026-10-12',
    vendor: 'Villa Sol Goa',
    notes: '4 travelers reserved rooms in the main villa.',
    bookingId: 'b1',
  },
  {
    id: 'e2',
    title: 'Private AC Minivan & Airport Pickup',
    category: 'transport',
    amount: 12000,
    paidBy: 'p3', // Kabir
    participantIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], // all 6 (₹2,000 each)
    splitMethod: 'equal',
    status: 'active',
    date: '2026-10-12',
    vendor: 'Goa Cruiser Fleet',
    notes: 'Shared transportation across the entire trip.',
    bookingId: 'b2',
  },
  {
    id: 'e3',
    title: 'Grand Island Scuba Diving & Gear',
    category: 'activity',
    amount: 9000,
    paidBy: 'p2', // Diya
    participantIds: ['p2', 'p5', 'p6'], // Diya, Rohan, Sneha (₹3,000 each)
    splitMethod: 'equal',
    status: 'active',
    date: '2026-10-13',
    vendor: 'Aquasports Goa',
    notes: 'Deep water diving excursion. Can be cancelled to demo recalculation.',
    bookingId: 'b3',
  },
  {
    id: 'e4',
    title: 'Fisherman\'s Wharf Dinner',
    category: 'food',
    amount: 7200,
    paidBy: 'p1', // Aarav
    participantIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], // all 6 (₹1,200 each)
    splitMethod: 'equal',
    status: 'active',
    date: '2026-10-13',
    vendor: "Fisherman's Wharf",
    notes: 'Group dinner bill paid on card.',
    bookingId: 'b4',
  },
  {
    id: 'e5',
    title: 'Dudhsagar Jeep Safari & Permits',
    category: 'activity',
    amount: 6000,
    paidBy: 'p4', // Meera
    participantIds: ['p1', 'p3', 'p4', 'p6'], // Aarav, Kabir, Meera, Sneha (₹1,500 each)
    splitMethod: 'equal',
    status: 'active',
    date: '2026-10-14',
    vendor: 'Goa Eco Adventures',
    notes: 'Wildlife sanctuary entrance & jeep hire.',
    bookingId: 'b5',
  },
  {
    id: 'e6',
    title: 'Thalassa Sunset Drinks & Dinner',
    category: 'food',
    amount: 6600,
    paidBy: 'p5', // Rohan
    participantIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], // all 6 (₹1,100 each)
    splitMethod: 'equal',
    status: 'active',
    date: '2026-10-15',
    vendor: 'Thalassa Siolim',
    notes: 'Farewell feast by the backwaters.',
    bookingId: 'b6',
  },
];

