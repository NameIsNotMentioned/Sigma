export type Participant = {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  role?: string;
};

export type BookingCategory = "transport" | "stay" | "activity" | "food" | "other";

export type Booking = {
  id: string;
  title: string;
  category: BookingCategory;
  vendor: string;
  date: string;
  amount: number;
  participantIds: string[];
  paidBy: string;
  status: "confirmed" | "pending" | "cancelled";
  location?: string;
  notes?: string;
  time?: string;
};

export type Payment = {
  id: string;
  expenseId: string;
  paidBy: string;
  paidTo?: string;
  amount: number;
  date: string;
  note?: string;
};

export type Expense = {
  id: string;
  title: string;
  category: BookingCategory;
  amount: number;
  paidBy: string;
  participantIds: string[];
  splitMethod: "equal" | "custom";
  customShares?: Record<string, number>;
  status: "active" | "cancelled" | "refunded";
  date: string;
  vendor?: string;
  notes?: string;
  bookingId?: string;
};

export type Trip = {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  participantIds: string[];
  bookingIds: string[];
  expenseIds: string[];
};

export type Transfer = {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  settled?: boolean;
};

export type ParticipantBalance = {
  participantId: string;
  name: string;
  avatar: string;
  totalPaid: number;
  totalShare: number;
  netBalance: number; // positive = gets back money (creditor), negative = owes money (debtor)
  activitiesJoined: number;
};
