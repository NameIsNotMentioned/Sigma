import { Expense, Participant, Payment, ParticipantBalance, Transfer } from '../types/trip';

/**
 * 1. calculateExpenseShares(expense)
 * Calculates the exact share for each participant in a single expense.
 * - Active expenses: equal split (amount / count) or custom amounts.
 * - Cancelled or refunded expenses: all shares are 0.
 */
export function calculateExpenseShares(expense: Expense): Record<string, number> {
  const shares: Record<string, number> = {};

  // If the expense is cancelled or refunded, no participant owes any share
  if (expense.status === 'cancelled' || expense.status === 'refunded') {
    expense.participantIds.forEach(id => {
      shares[id] = 0;
    });
    return shares;
  }

  const count = expense.participantIds.length;
  if (count === 0) return shares;

  if (expense.splitMethod === 'custom' && expense.customShares) {
    for (const id of expense.participantIds) {
      shares[id] = expense.customShares[id] ?? 0;
    }
  } else {
    // Equal split with integer-safe rounding (avoid fractional rupee drift)
    const baseShare = Math.floor(expense.amount / count);
    const remainder = expense.amount - baseShare * count;

    expense.participantIds.forEach((id, index) => {
      // distribute 1-rupee remainder to initial participants
      shares[id] = baseShare + (index < remainder ? 1 : 0);
    });
  }

  return shares;
}

/**
 * 2. calculateParticipantTotals(expenses)
 * Calculates the total share owed and total amount paid for each participant across all expenses.
 */
export function calculateParticipantTotals(expenses: Expense[]): {
  sharesByParticipant: Record<string, number>;
  paidByParticipant: Record<string, number>;
  activitiesCountByParticipant: Record<string, number>;
} {
  const sharesByParticipant: Record<string, number> = {};
  const paidByParticipant: Record<string, number> = {};
  const activitiesCountByParticipant: Record<string, number> = {};

  for (const exp of expenses) {
    if (exp.status !== 'cancelled') {
      // Track who paid for this active expense
      paidByParticipant[exp.paidBy] = (paidByParticipant[exp.paidBy] ?? 0) + exp.amount;

      // Track shares
      const expenseShares = calculateExpenseShares(exp);
      for (const [id, share] of Object.entries(expenseShares)) {
        sharesByParticipant[id] = (sharesByParticipant[id] ?? 0) + share;
      }

      // Track active activity count
      for (const id of exp.participantIds) {
        activitiesCountByParticipant[id] = (activitiesCountByParticipant[id] ?? 0) + 1;
      }
    }
  }

  return { sharesByParticipant, paidByParticipant, activitiesCountByParticipant };
}

/**
 * 3. calculateBalances(participants, expenses, payments)
 * Returns a complete financial profile for each participant, with derived net balances.
 * Rule: netBalance = totalPaid - totalShare.
 * - Positive: Creditor (gets back money)
 * - Negative: Debtor (owes money)
 * - Zero: Settled
 */
export function calculateBalances(
  participants: Participant[],
  expenses: Expense[],
  payments: Payment[] = []
): ParticipantBalance[] {
  const { sharesByParticipant, paidByParticipant, activitiesCountByParticipant } =
    calculateParticipantTotals(expenses);

  // Apply direct peer payments (repayments)
  const directPaid: Record<string, number> = {};
  const directReceived: Record<string, number> = {};

  for (const payment of payments) {
    directPaid[payment.paidBy] = (directPaid[payment.paidBy] ?? 0) + payment.amount;
    if (payment.paidTo) {
      directReceived[payment.paidTo] = (directReceived[payment.paidTo] ?? 0) + payment.amount;
      continue;
    }
    // Backward compatibility for expense-reimbursement payment records.
    const matchingExpense = expenses.find(e => e.id === payment.expenseId);
    if (matchingExpense) {
      directReceived[matchingExpense.paidBy] =
        (directReceived[matchingExpense.paidBy] ?? 0) + payment.amount;
    }
  }

  return participants.map(participant => {
    const id = participant.id;
    const share = sharesByParticipant[id] ?? 0;
    const expensePaid = paidByParticipant[id] ?? 0;
    const extraPaid = directPaid[id] ?? 0;
    const extraReceived = directReceived[id] ?? 0;

    const totalPaid = expensePaid + extraPaid;
    const effectiveShare = share + extraReceived;
    const netBalance = totalPaid - effectiveShare;

    return {
      participantId: id,
      name: participant.name,
      avatar: participant.avatar,
      totalPaid: expensePaid, // display amount paid towards trip expenses
      totalShare: share,      // display total trip share
      netBalance,
      activitiesJoined: activitiesCountByParticipant[id] ?? 0,
    };
  });
}

/**
 * 4. calculateUnoptimizedSettlements(expenses, participants)
 * Generates pairwise unoptimized debt settlements.
 * Shows the raw, multiple back-and-forth transfers before algorithmic debt reduction.
 */
export function calculateUnoptimizedSettlements(
  expenses: Expense[],
  participants: Participant[]
): Transfer[] {
  // Pairwise net debts between pairs [debtor][creditor]
  const pairDebts: Record<string, Record<string, number>> = {};
  const participantIds = participants.map(p => p.id);

  participantIds.forEach(id1 => {
    pairDebts[id1] = {};
    participantIds.forEach(id2 => {
      pairDebts[id1][id2] = 0;
    });
  });

  for (const exp of expenses) {
    if (exp.status === 'cancelled') continue;
    const shares = calculateExpenseShares(exp);
    const payerId = exp.paidBy;

    for (const [consumerId, share] of Object.entries(shares)) {
      if (consumerId !== payerId && share > 0) {
        pairDebts[consumerId][payerId] += share;
      }
    }
  }

  // Net between pairs
  const transfers: Transfer[] = [];
  let transferIndex = 1;

  for (let i = 0; i < participantIds.length; i++) {
    for (let j = i + 1; j < participantIds.length; j++) {
      const u = participantIds[i];
      const v = participantIds[j];
      const uOwesV = pairDebts[u][v] ?? 0;
      const vOwesU = pairDebts[v][u] ?? 0;
      const net = uOwesV - vOwesU;

      if (net > 0) {
        transfers.push({
          id: `unopt-${transferIndex++}`,
          fromId: u,
          toId: v,
          amount: Math.round(net),
        });
      } else if (net < 0) {
        transfers.push({
          id: `unopt-${transferIndex++}`,
          fromId: v,
          toId: u,
          amount: Math.round(-net),
        });
      }
    }
  }

  return transfers;
}

/**
 * 5. optimizeSettlements(balances)
 * Implements the greedy debt simplification / minimum cash flow algorithm.
 * Drastically minimizes the required transactions (e.g. from 5 transfers down to 3).
 */
export function optimizeSettlements(balances: ParticipantBalance[]): Transfer[] {
  interface Account {
    id: string;
    amount: number;
  }

  // Debtors owe money (amount > 0)
  const debtors: Account[] = [];
  // Creditors are owed money (amount > 0)
  const creditors: Account[] = [];

  for (const bal of balances) {
    if (bal.netBalance < -0.5) {
      debtors.push({ id: bal.participantId, amount: Math.abs(bal.netBalance) });
    } else if (bal.netBalance > 0.5) {
      creditors.push({ id: bal.participantId, amount: bal.netBalance });
    }
  }

  // Sort descending by amount to greedily pair largest debts
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;
  let transferId = 1;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const settledAmount = Math.min(debtor.amount, creditor.amount);
    const rounded = Math.round(settledAmount);

    if (rounded > 0) {
      transfers.push({
        id: `opt-${transferId++}`,
        fromId: debtor.id,
        toId: creditor.id,
        amount: rounded,
      });
    }

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount < 0.5) debtorIndex++;
    if (creditor.amount < 0.5) creditorIndex++;
  }

  return transfers;
}
