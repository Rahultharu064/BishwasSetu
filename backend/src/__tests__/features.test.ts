import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const FLAG_VARS = [
  'KYC_MANUAL_REVIEW',
  'AI_ASSISTANT_ENABLED',
  'EMERGENCY_DISPATCH_ENABLED',
  'CREDITS_ENABLED',
  'NEIGHBORHOOD_TAGS_ENABLED',
  'AI_SMART_MATCH_ENABLED',
  'TRUST_BADGES_ENABLED',
]

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

describe('features.ts pilot-scope defaults', () => {
  it('defaults emergencyDispatch/credits/neighborhoodTags to OFF per docs/MVP_SCOPE.md', async () => {
    delete process.env.EMERGENCY_DISPATCH_ENABLED
    delete process.env.CREDITS_ENABLED
    delete process.env.NEIGHBORHOOD_TAGS_ENABLED
    const { features } = await import('../config/features')
    expect(features.emergencyDispatch).toBe(false)
    expect(features.credits).toBe(false)
    expect(features.neighborhoodTags).toBe(false)
  })

  it('defaults kycManualReview/aiSmartMatch/trustBadges to ON per docs/MVP_SCOPE.md', async () => {
    delete process.env.KYC_MANUAL_REVIEW
    delete process.env.AI_SMART_MATCH_ENABLED
    delete process.env.TRUST_BADGES_ENABLED
    const { features } = await import('../config/features')
    expect(features.kycManualReview).toBe(true)
    expect(features.aiSmartMatch).toBe(true)
    expect(features.trustBadges).toBe(true)
  })
})

describe('features.ts truthy() parsing', () => {
  it.each(['1', 'true', 'TRUE', 'yes', 'YES', 'on', 'On'])(
    '%s is treated as enabled',
    async (value) => {
      process.env.CREDITS_ENABLED = value
      const { features } = await import('../config/features')
      expect(features.credits).toBe(true)
    }
  )

  it.each(['0', 'false', 'no', 'off', 'garbage', ''])(
    '%j is treated as disabled',
    async (value) => {
      process.env.CREDITS_ENABLED = value
      const { features } = await import('../config/features')
      expect(features.credits).toBe(false)
    }
  )

  it('falls back to the documented default when unset or blank', async () => {
    delete process.env.CREDITS_ENABLED
    const { features } = await import('../config/features')
    expect(features.credits).toBe(false)
  })
})
