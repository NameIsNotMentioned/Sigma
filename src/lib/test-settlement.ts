import {
  calculateExpenseShares,
  calculateBalances,
  calculateUnoptimizedSettlements,
  optimizeSettlements,
} from './settlement';
import { Expense, Participant } from '../types/trip';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log('Running Settlement Engine Test Suite...\n');

// Test 1: Equal Split ₹12,000 among 4 people
const hotelExpense: Expense = {
  id: 'e1',
  title: 'Villa Stay',
  category: 'stay',
  amount: 12000,
  paidBy: 'u1',
  participantIds: ['u1', 'u2', 'u3', 'u4'],
  splitMethod: 'equal',
  status: 'active',
  date: '2026-10-12',
};

const shares4 = calculateExpenseShares(hotelExpense);
assert(shares4['u1'] === 3000, '4 people hotel split: u1 owes ₹3,000');
assert(shares4['u2'] === 3000, '4 people hotel split: u2 owes ₹3,000');
assert(shares4['u3'] === 3000, '4 people hotel split: u3 owes ₹3,000');
assert(shares4['u4'] === 3000, '4 people hotel split: u4 owes ₹3,000');

// Test 2: Participant leaves -> 3 people
const hotelExpense3: Expense = {
  ...hotelExpense,
  participantIds: ['u1', 'u2', 'u3'],
};

const shares3 = calculateExpenseShares(hotelExpense3);
assert(shares3['u1'] === 4000, '3 people hotel split: u1 owes ₹4,000');
assert(shares3['u2'] === 4000, '3 people hotel split: u2 owes ₹4,000');
assert(shares3['u3'] === 4000, '3 people hotel split: u3 owes ₹4,000');
assert(shares3['u4'] === undefined, 'u4 is not participating');

// Test 3: Cancellation removes financial impact
const cancelledExpense: Expense = {
  ...hotelExpense,
  status: 'cancelled',
};
const cancelledShares = calculateExpenseShares(cancelledExpense);
assert(cancelledShares['u1'] === 0, 'Cancelled expense has 0 share');

// Test 4: Realistic 6-friend Goa trip debt simplification
const participants: Participant[] = [
  { id: 'u1', name: 'Aarav', avatar: 'A' },
  { id: 'u2', name: 'Diya', avatar: 'D' },
  { id: 'u3', name: 'Kabir', avatar: 'K' },
  { id: 'u4', name: 'Meera', avatar: 'M' },
  { id: 'u5', name: 'Rohan', avatar: 'R' },
  { id: 'u6', name: 'Sneha', avatar: 'S' },
];

const tripExpenses: Expense[] = [
  // Aarav paid ₹24,000 for Villa (shared by 4: Aarav, Diya, Kabir, Rohan) -> 6,000 each
  {
    id: 'e1',
    title: 'Villa Sol Goa',
    category: 'stay',
    amount: 24000,
    paidBy: 'u1',
    participantIds: ['u1', 'u2', 'u3', 'u5'],
    splitMethod: 'equal',
    status: 'active',
    date: '2026-10-12',
  },
  // Kabir paid ₹12,000 for Private SUV (shared by all 6) -> 2,000 each
  {
    id: 'e2',
    title: 'Private SUV Transport',
    category: 'transport',
    amount: 12000,
    paidBy: 'u3',
    participantIds: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
    splitMethod: 'equal',
    status: 'active',
    date: '2026-10-12',
  },
  // Diya paid ₹6,000 for Sunset Cruise (shared by Diya, Meera, Sneha) -> 2,000 each
  {
    id: 'e3',
    title: 'Sunset Cruise',
    category: 'activity',
    amount: 6000,
    paidBy: 'u2',
    participantIds: ['u2', 'u4', 'u6'],
    splitMethod: 'equal',
    status: 'active',
    date: '2026-10-13',
  },
];

const balances = calculateBalances(participants, tripExpenses);
const unoptimizedTransfers = calculateUnoptimizedSettlements(tripExpenses, participants);
const optimizedTransfers = optimizeSettlements(balances);

console.log(`\nUnoptimized transfers count: ${unoptimizedTransfers.length}`);
console.log(`Optimized transfers count: ${optimizedTransfers.length}`);

assert(
  optimizedTransfers.length < unoptimizedTransfers.length,
  `Optimized settlements reduced transfers from ${unoptimizedTransfers.length} to ${optimizedTransfers.length}`
);

// Verify net sum is zero (conservation of money)
const sumNet = balances.reduce((sum, b) => sum + b.netBalance, 0);
assert(Math.abs(sumNet) < 1e-6, `Net sum across all participants is 0 (got ${sumNet})`);

const settlementExpense: Expense = {
  id: 'settlement-expense',
  title: 'Shared dinner',
  category: 'food',
  amount: 1000,
  paidBy: 'u1',
  participantIds: ['u1', 'u2'],
  splitMethod: 'equal',
  status: 'active',
  date: '2026-10-14',
};
const settledBalances = calculateBalances(participants.slice(0, 2), [settlementExpense], [{
  id: 'payment-1',
  expenseId: 'settlement',
  paidBy: 'u2',
  paidTo: 'u1',
  amount: 500,
  date: '2026-10-14',
}]);
const settledPayer = settledBalances.find((balance) => balance.participantId === 'u2');
const settledRecipient = settledBalances.find((balance) => balance.participantId === 'u1');
const settledSumNet = settledBalances.reduce((sum, balance) => sum + balance.netBalance, 0);
assert(settledPayer?.netBalance === 0, 'Settlement payment clears the payer balance by the transferred amount');
assert(settledRecipient?.netBalance === 0, 'Settlement payment credits the recipient by the transferred amount');
assert(Math.abs(settledSumNet) < 1e-6, `Net sum remains zero after settlement (got ${settledSumNet})`);

console.log('\nAll Settlement Engine Tests Passed Successfully!');
