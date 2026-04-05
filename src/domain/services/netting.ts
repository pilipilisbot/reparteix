import type { Balance, Settlement } from './balances'

export interface NettingResult {
  /** Naive settlements: each debtor pays each creditor proportionally. */
  naive: Settlement[]
  /** Minimized settlements using greedy matching. */
  minimized: Settlement[]
  /** Number of naive transfers. */
  naiveCount: number
  /** Number of minimized transfers. */
  minimizedCount: number
  /** Absolute reduction in number of transfers. */
  savedTransfers: number
  /** Percentage reduction (0–100). */
  reductionPercent: number
}

const EPSILON = 0.01

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Generate naive settlements where each debtor pays each creditor
 * proportionally to their share of total credit.
 */
export function naiveSettlements(balances: Balance[]): Settlement[] {
  const creditors: { id: string; amount: number }[] = []
  const debtors: { id: string; amount: number }[] = []

  for (const b of balances) {
    if (b.total > EPSILON) {
      creditors.push({ id: b.memberId, amount: b.total })
    } else if (b.total < -EPSILON) {
      debtors.push({ id: b.memberId, amount: -b.total })
    }
  }

  if (creditors.length === 0 || debtors.length === 0) return []

  const totalCredit = creditors.reduce((sum, c) => sum + c.amount, 0)
  const settlements: Settlement[] = []

  for (const debtor of debtors) {
    for (const creditor of creditors) {
      const amount = round2(debtor.amount * (creditor.amount / totalCredit))
      if (amount > EPSILON) {
        settlements.push({
          fromId: debtor.id,
          toId: creditor.id,
          amount,
        })
      }
    }
  }

  return settlements
}

/**
 * Minimize settlements using greedy matching.
 * Identical algorithm to calculateSettlements — reused here for clarity.
 */
export function minimizeSettlements(balances: Balance[]): Settlement[] {
  const creditors: { id: string; amount: number }[] = []
  const debtors: { id: string; amount: number }[] = []

  for (const b of balances) {
    if (b.total > EPSILON) {
      creditors.push({ id: b.memberId, amount: b.total })
    } else if (b.total < -EPSILON) {
      debtors.push({ id: b.memberId, amount: -b.total })
    }
  }

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const settlements: Settlement[] = []
  let i = 0
  let j = 0

  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i].amount, debtors[j].amount)
    if (amount > EPSILON) {
      settlements.push({
        fromId: debtors[j].id,
        toId: creditors[i].id,
        amount: round2(amount),
      })
    }
    creditors[i].amount -= amount
    debtors[j].amount -= amount

    if (creditors[i].amount < EPSILON) i++
    if (debtors[j].amount < EPSILON) j++
  }

  return settlements
}

/**
 * Calculate netting result: compare naive vs minimized settlements.
 * Pure function — no side effects.
 */
export function calculateNetting(balances: Balance[]): NettingResult {
  const naive = naiveSettlements(balances)
  const minimized = minimizeSettlements(balances)

  const naiveCount = naive.length
  const minimizedCount = minimized.length
  const savedTransfers = naiveCount - minimizedCount
  const reductionPercent =
    naiveCount > 0 ? round2((savedTransfers / naiveCount) * 100) : 0

  return {
    naive,
    minimized,
    naiveCount,
    minimizedCount,
    savedTransfers,
    reductionPercent,
  }
}
