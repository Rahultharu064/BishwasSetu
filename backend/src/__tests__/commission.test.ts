import { describe, it, expect } from 'vitest'
import { commissionPctForAmount, computeSplit, revenuePointsFor, EMERGENCY_COMMISSION_PCT } from '../utils/commission'

describe('commissionPctForAmount', () => {
  it('charges 8% at or below NPR 1000', () => {
    expect(commissionPctForAmount(100000)).toBe(8)   // NPR 1000
    expect(commissionPctForAmount(50000)).toBe(8)    // NPR 500
  })

  it('charges 10% between NPR 1000 and 5000', () => {
    expect(commissionPctForAmount(100001)).toBe(10)  // NPR 1000.01
    expect(commissionPctForAmount(500000)).toBe(10)  // NPR 5000
  })

  it('charges 12% above NPR 5000', () => {
    expect(commissionPctForAmount(500001)).toBe(12)
    expect(commissionPctForAmount(10_000_00)).toBe(12) // NPR 10000
  })

  it('matches the flat emergency-tier rate', () => {
    expect(EMERGENCY_COMMISSION_PCT).toBe(12)
  })
})

describe('computeSplit', () => {
  it('splits commission and payout without losing paisa to rounding', () => {
    const { commissionPaisa, payoutPaisa } = computeSplit(100000, 8) // NPR 1000 @ 8%
    expect(commissionPaisa).toBe(8000)
    expect(payoutPaisa).toBe(92000)
    expect(commissionPaisa + payoutPaisa).toBe(100000)
  })

  it('rounds commission to the nearest paisa', () => {
    // 333 paisa * 10% = 33.3 -> rounds to 33
    const { commissionPaisa, payoutPaisa } = computeSplit(333, 10)
    expect(commissionPaisa).toBe(33)
    expect(payoutPaisa).toBe(300)
  })

  it('never lets commission+payout exceed the original amount', () => {
    for (const amount of [1, 99, 101, 100001, 999999]) {
      const { commissionPaisa, payoutPaisa } = computeSplit(amount, 12)
      expect(commissionPaisa + payoutPaisa).toBe(amount)
    }
  })
})

describe('revenuePointsFor', () => {
  it('awards 1 point per NPR 100 of payout', () => {
    expect(revenuePointsFor(10000)).toBe(1)   // NPR 100
    expect(revenuePointsFor(95000)).toBe(9)   // NPR 950 -> floors to 9
    expect(revenuePointsFor(0)).toBe(0)
  })
})
