/**
 * AI Smart Match — "find me the nearest right pro".
 *
 * A customer asks for a category; we return the nearest, most-trustworthy
 * VERIFIED providers, ranked. Providers on the business model (credit-pack
 * members, see utils/businessModel) get a priority boost + an AI spotlight;
 * free providers appear only as fallback below them.
 *
 * Ranking is deterministic first (distance + trust + experience + business
 * boost). If features.aiSmartMatch is on AND Groq is configured, we then let
 * the LLM re-order the shortlist and explain the top pick — but that step runs
 * behind a short timeout and can never block or break the response.
 */
import { prisma } from '../config/db'
import { groq, GROQ_MODELS } from '../config/groq'
import { features } from '../config/features'
import { haversineKm } from '../utils/geo'
import {
  getBusinessTiers,
  BUSINESS_TIER_WEIGHT,
  isBusinessTier,
  type BusinessTier,
} from '../utils/businessModel'
import { ApiError } from '../utils/apierror'
import type { SmartMatchInput } from '../validators/matchValidator'

// Ranking tunables ------------------------------------------------------------
const SEARCH_RADIUS_KM = 15 // only consider providers within this radius (when coords known)
const MAX_RESULTS = 12
const AI_SHORTLIST = 8 // how many top candidates the LLM re-ranks
const AI_TIMEOUT_MS = 4000 // never let the AI step stall the request

// Score weights (sum ~1.0). Business boost is deliberately a *tie-breaker among
// nearby qualified pros*, not an override of quality — see PRD §7.
const W_PROXIMITY = 0.4
const W_TRUST = 0.3
const W_EXPERIENCE = 0.15
const W_BUSINESS = 0.15

interface RankedProvider {
  id: string
  legalName: string
  profilePhoto: string | null
  bio: string | null
  trustScore: number
  completedBookings: number
  milestoneBadge: string
  kycTier: string
  city: string | null
  serviceArea: string | null
  distanceKm: number | null
  businessTier: BusinessTier
  isPriorityPartner: boolean
  skills: string[]
  categories: string[]
  score: number
  rank: number
  aiReason?: string | null
}

/** Resolve either a category UUID or a slug/name to the canonical category row. */
async function resolveCategory(input: SmartMatchInput) {
  if (input.categoryId) {
    const c = await prisma.category.findFirst({
      where: { id: input.categoryId, isActive: true },
      select: { id: true, name: true, slug: true },
    })
    if (c) return c
  }
  if (input.category) {
    const c = await prisma.category.findFirst({
      where: {
        isActive: true,
        OR: [{ slug: input.category }, { name: { contains: input.category } }],
      },
      select: { id: true, name: true, slug: true },
    })
    if (c) return c
  }
  throw new ApiError(404, 'Service category not found')
}

export async function smartMatch(customerId: string, input: SmartMatchInput) {
  // 1. Resolve the customer's service location: request override → profile.
  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    select: { city: true, district: true, latitude: true, longitude: true },
  })

  const lat = input.latitude ?? (customer?.latitude != null ? Number(customer.latitude) : null)
  const lon = input.longitude ?? (customer?.longitude != null ? Number(customer.longitude) : null)
  const city = input.city ?? customer?.city ?? null
  const district = input.district ?? customer?.district ?? null

  if (lat == null && !district && !city) {
    throw new ApiError(
      400,
      'We need your location to find nearby providers. Add a district/city to your profile or share your location.'
    )
  }

  // 2. Resolve category.
  const category = await resolveCategory(input)

  // 3. Candidate pool: VERIFIED, available, in-category, not deleted.
  //    When we have no coordinates, narrow by district/city text so we don't
  //    pull the whole country.
  const where: Record<string, unknown> = {
    identityStatus: 'VERIFIED',
    isAvailable: true,
    deletedAt: null,
    categories: { some: { categoryId: category.id } },
  }
  if (lat == null) {
    const area = district || city!
    where.OR = [
      { serviceArea: { contains: area } },
      { city: { contains: city ?? area } },
    ]
  }

  const candidates = await prisma.provider.findMany({
    where,
    select: {
      id: true,
      legalName: true,
      profilePhoto: true,
      bio: true,
      trustScore: true,
      completedBookings: true,
      milestoneBadge: true,
      kycTier: true,
      city: true,
      serviceArea: true,
      latitude: true,
      longitude: true,
      skills: { select: { skill: true } },
      categories: { select: { category: { select: { name: true } } } },
    },
    take: 200, // hard cap; ranked & trimmed below
  })

  // 4. Distance + radius filter (only meaningful when both sides have coords).
  const withDistance = candidates.map((p) => {
    let distanceKm: number | null = null
    if (lat != null && lon != null && p.latitude != null && p.longitude != null) {
      distanceKm = haversineKm(lat, lon, Number(p.latitude), Number(p.longitude))
    }
    return { p, distanceKm }
  })

  const inRange =
    lat != null
      ? withDistance.filter((x) => x.distanceKm == null || x.distanceKm <= SEARCH_RADIUS_KM)
      : withDistance

  // 5. Business tiers for the candidate set.
  const tiers = await getBusinessTiers(inRange.map((x) => x.p.id))

  // Normalisers for the proximity/experience terms.
  const maxDist = Math.max(1, ...inRange.map((x) => x.distanceKm ?? SEARCH_RADIUS_KM))
  const maxDone = Math.max(1, ...inRange.map((x) => x.p.completedBookings))

  // 6. Deterministic score.
  let ranked: RankedProvider[] = inRange.map(({ p, distanceKm }) => {
    const proximity = distanceKm == null ? 0.5 : 1 - distanceKm / maxDist
    const trust = Math.min(1, Math.max(0, p.trustScore / 100))
    const experience = p.completedBookings / maxDone
    const businessTier = tiers.get(p.id) ?? 'NONE'
    const business = BUSINESS_TIER_WEIGHT[businessTier]

    const score =
      W_PROXIMITY * proximity +
      W_TRUST * trust +
      W_EXPERIENCE * experience +
      W_BUSINESS * business

    return {
      id: p.id,
      legalName: p.legalName,
      profilePhoto: p.profilePhoto,
      bio: p.bio,
      trustScore: p.trustScore,
      completedBookings: p.completedBookings,
      milestoneBadge: p.milestoneBadge,
      kycTier: p.kycTier,
      city: p.city,
      serviceArea: p.serviceArea,
      distanceKm: distanceKm == null ? null : Math.round(distanceKm * 10) / 10,
      businessTier,
      isPriorityPartner: isBusinessTier(businessTier),
      skills: p.skills.map((s) => s.skill),
      categories: p.categories.map((c) => c.category.name),
      score,
      rank: 0,
    }
  })

  // 7. Business-first ordering: paying providers (the "business model") always
  //    rank above free ones — the priority boost the credit pack pays for —
  //    then by composite score. Free providers remain as fallback below.
  ranked.sort((a, b) => {
    const at = isBusinessTier(a.businessTier) ? 1 : 0
    const bt = isBusinessTier(b.businessTier) ? 1 : 0
    if (at !== bt) return bt - at
    return b.score - a.score
  })
  ranked = ranked.slice(0, MAX_RESULTS)

  // 8. AI spotlight — re-rank the shortlist and explain the top pick.
  let aiUsed = false
  let aiReason: string | null = null
  if (features.aiSmartMatch && process.env.GROQ_API_KEY && ranked.length > 1) {
    try {
      const ai = await withTimeout(
        aiRerank(ranked.slice(0, AI_SHORTLIST), { category: category.name, district, city, description: input.description }),
        AI_TIMEOUT_MS
      )
      if (ai) {
        aiUsed = true
        aiReason = ai.reason
        // Move the AI's chosen provider to the top of the shortlist, but only
        // within its own business/free group so paid priority is preserved.
        const idx = ranked.findIndex((r) => r.id === ai.topPickId)
        if (idx > 0) {
          const [pick] = ranked.splice(idx, 1)
          const firstFreeIdx = ranked.findIndex((r) => !isBusinessTier(r.businessTier))
          const insertAt = isBusinessTier(pick.businessTier)
            ? 0
            : firstFreeIdx === -1
              ? ranked.length
              : firstFreeIdx
          ranked.splice(insertAt, 0, pick)
        }
        ranked[0].aiReason = ai.reason
      }
    } catch {
      /* fall back to deterministic order */
    }
  }

  ranked.forEach((r, i) => (r.rank = i + 1))

  return {
    match: {
      location: { city, district, hasCoords: lat != null && lon != null, radiusKm: SEARCH_RADIUS_KM },
      category,
      aiEnabled: aiUsed,
      topPickId: ranked[0]?.id ?? null,
      aiReason,
      count: ranked.length,
    },
    providers: ranked,
  }
}

// ── AI re-rank (Groq) ────────────────────────────────────────────────────────

async function aiRerank(
  shortlist: RankedProvider[],
  ctx: { category: string; district: string | null; city: string | null; description?: string }
): Promise<{ topPickId: string; reason: string } | null> {
  const roster = shortlist.map((p, i) => ({
    ref: i,
    id: p.id,
    trustScore: Math.round(p.trustScore),
    distanceKm: p.distanceKm,
    completedJobs: p.completedBookings,
    tier: p.kycTier,
    priorityPartner: p.isPriorityPartner,
    skills: p.skills.slice(0, 6),
  }))

  const sys =
    'You are the matching engine for BishwasSetu, a Nepal home-services marketplace. ' +
    'From the candidate providers, choose the single best match for the customer, ' +
    'balancing proximity, trust score, relevant skills and completed jobs. ' +
    'Prefer a provider flagged priorityPartner ONLY when they are otherwise comparable — never recommend a far or low-trust pro over a clearly better one. ' +
    'Reply with STRICT JSON only: {"topPickRef": <number>, "reason": "<one short customer-facing sentence>"}.'

  const user = JSON.stringify({
    need: {
      category: ctx.category,
      district: ctx.district,
      city: ctx.city,
      description: ctx.description ?? null,
    },
    candidates: roster,
  })

  const completion = await groq.chat.completions.create({
    model: GROQ_MODELS.ASSISTANT,
    max_tokens: 200,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: user },
    ],
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) return null

  const parsed = JSON.parse(raw) as { topPickRef?: number; reason?: string }
  const ref = parsed.topPickRef
  if (ref == null || ref < 0 || ref >= shortlist.length) return null

  const reason = (parsed.reason ?? '').toString().slice(0, 200).trim()
  return {
    topPickId: shortlist[ref].id,
    reason: reason || 'Closest verified provider with a strong trust score for this job.',
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    p,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ])
}
