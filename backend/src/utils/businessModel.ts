/**
 * "Business model" resolution — which providers are paying (credit-pack) members.
 *
 * Per PRD §6.3, credit packs grant "priority ranking". The AI Smart Match
 * surfaces the nearest qualified providers for a customer, but only providers
 * on the business model receive the priority boost + AI spotlight. This keeps
 * paid placement to a *tie-breaking boost among nearby, qualified providers* —
 * quality/trust stays the primary signal — which respects PRD §7's ban on a
 * pure paid-ranking override while still rewarding paying providers.
 *
 * Two tiers of "business":
 *   PRIORITY — an active `priority_ranking` boost slot (Redis). Strongest signal.
 *   MEMBER   — has bought a pack (positive wallet balance) but no active boost.
 *   NONE     — free provider; appears only as fallback below business members.
 */
import { prisma } from '../config/db'
import { redis } from '../config/redis'
import { features } from '../config/features'

export type BusinessTier = 'PRIORITY' | 'MEMBER' | 'NONE'

/** Numeric weight used by the matcher's ranking score. */
export const BUSINESS_TIER_WEIGHT: Record<BusinessTier, number> = {
  PRIORITY: 1.0,
  MEMBER: 0.5,
  NONE: 0,
}

/**
 * Resolve the business tier for many providers at once.
 * - Redis (if connected) tells us who has an active priority_ranking boost.
 * - The credit wallet (DB) tells us who has bought a pack (balance > 0).
 * Never throws — a Redis outage simply downgrades PRIORITY detection to MEMBER.
 */
export async function getBusinessTiers(
  providerIds: string[]
): Promise<Map<string, BusinessTier>> {
  const result = new Map<string, BusinessTier>()
  if (providerIds.length === 0) return result

  // Pilot scope (docs/MVP_SCOPE.md): paid ranking is meaningless before
  // there is competition for visibility — while CREDITS_ENABLED is off,
  // nobody gets a boost, even from stale/test wallet data.
  if (!features.credits) {
    for (const id of providerIds) result.set(id, 'NONE')
    return result
  }

  // Wallet balances (DB) — a provider who ever bought a pack has a wallet.
  const wallets = await prisma.creditWallet.findMany({
    where: { providerId: { in: providerIds } },
    select: { providerId: true, balance: true, totalEarned: true },
  })
  const hasPack = new Set(
    wallets
      .filter((w) => w.balance > 0 || w.totalEarned > 0)
      .map((w) => w.providerId)
  )

  // Active priority boosts (Redis) — best effort.
  const priority = new Set<string>()
  if (redis) {
    await Promise.all(
      providerIds.map(async (id) => {
        try {
          const raw = await redis!.get(`boost:${id}:priority_ranking`)
          if (raw && (JSON.parse(raw).slotsRemaining ?? 0) > 0) priority.add(id)
        } catch {
          /* ignore — treat as no active boost */
        }
      })
    )
  }

  for (const id of providerIds) {
    if (priority.has(id)) result.set(id, 'PRIORITY')
    else if (hasPack.has(id)) result.set(id, 'MEMBER')
    else result.set(id, 'NONE')
  }
  return result
}

export const isBusinessTier = (tier: BusinessTier): boolean => tier !== 'NONE'
