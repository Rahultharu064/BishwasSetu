import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// These gates are written to short-circuit BEFORE any Prisma call, so they're
// testable without mocking the database — the flag check is the first thing
// each function does.

const FLAG_VARS = ['EMERGENCY_DISPATCH_ENABLED', 'CREDITS_ENABLED', 'NEIGHBORHOOD_TAGS_ENABLED']
const savedEnv: Record<string, string | undefined> = {}

beforeEach(() => {
  for (const key of FLAG_VARS) savedEnv[key] = process.env[key]
  vi.resetModules()
})

afterEach(() => {
  for (const key of FLAG_VARS) {
    if (savedEnv[key] === undefined) delete process.env[key]
    else process.env[key] = savedEnv[key]
  }
})

describe('emergency dispatch gate', () => {
  it('rejects createEmergencyRequest when EMERGENCY_DISPATCH_ENABLED is off', async () => {
    process.env.EMERGENCY_DISPATCH_ENABLED = 'false'
    const { createEmergencyRequest } = await import('../services/emergencyService')
    await expect(
      createEmergencyRequest('customer-1', {
        category: 'plumbing',
        latitude: 27.7,
        longitude: 85.3,
        description: 'leak',
      } as any)
    ).rejects.toThrow(/isn't available/i)
  })
})

describe('credits gate', () => {
  it('rejects purchaseCredits when CREDITS_ENABLED is off', async () => {
    process.env.CREDITS_ENABLED = 'false'
    const { purchaseCredits } = await import('../services/creditService')
    await expect(
      purchaseCredits('provider-1', {
        packId: 'pack-1',
        paymentMethod: 'khalti',
        paymentRef: 'ref-1',
        orderId: 'order-1',
      } as any)
    ).rejects.toMatchObject({ code: 'CREDITS_DISABLED', status: 403 })
  })

  it('rejects activateBoost when CREDITS_ENABLED is off', async () => {
    process.env.CREDITS_ENABLED = 'false'
    const { activateBoost } = await import('../services/creditService')
    await expect(
      activateBoost('provider-1', {
        placementType: 'priority_ranking',
        durationSlots: 1,
      } as any)
    ).rejects.toMatchObject({ code: 'CREDITS_DISABLED', status: 403 })
  })
})

describe('neighborhood tags gate', () => {
  it('degrades to an empty list (not an error) when NEIGHBORHOOD_TAGS_ENABLED is off', async () => {
    process.env.NEIGHBORHOOD_TAGS_ENABLED = 'false'
    const { getProviderNeighborhoodStats } = await import('../services/neighborhoodService')
    await expect(getProviderNeighborhoodStats('provider-1')).resolves.toEqual([])
  })
})
