import { prisma }            from '../config/db'
import { groq, GROQ_MODELS } from '../config/groq'

export interface AnomalyResult {
  flagged: boolean
  signals: string[]
  severity: 'none' | 'low' | 'medium' | 'high'
}

// ── Review spike detection ────────────────────────────────────

const detectReviewSpike = async (providerId: string): Promise<string[]> => {
  const flags: string[] = []

  const now            = new Date()
  const oneDayAgo      = new Date(now.getTime() -  1 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo   = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo  = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [last24h, last7d, last30d] = await Promise.all([
    prisma.review.count({ where: { providerId, createdAt: { gte: oneDayAgo } } }),
    prisma.review.count({ where: { providerId, createdAt: { gte: sevenDaysAgo } } }),
    prisma.review.count({ where: { providerId, createdAt: { gte: thirtyDaysAgo } } }),
  ])

  if (last24h > 5)                              flags.push(`Unusual review spike: ${last24h} reviews in 24h`)
  if (last7d > 20)                              flags.push(`High review volume: ${last7d} reviews in 7 days`)
  if (last30d > 0 && last24h / last30d > 0.5)  flags.push('More than 50% of monthly reviews arrived in 24h')

  return flags
}

// ── Review sentiment vs message sentiment ─────────────────────

const detectSentimentDivergence = async (
  providerId: string
): Promise<string[]> => {
  const flags: string[] = []

  // Get last 5 reviews that have comments
  const recentReviews = await prisma.review.findMany({
    where:   { providerId, isVisible: true, comment: { not: null } },
    orderBy: { createdAt: 'desc' },
    take:    5,
    select:  { rating: true, comment: true },
  })

  if (recentReviews.length < 3) return flags

  // Check if average rating is 5 but comments are suspiciously generic
  const avgRating = recentReviews.reduce((s, r) => s + r.rating, 0) / recentReviews.length
  const genericComments = recentReviews.filter(
    (r) => r.comment && r.comment.length < 20
  ).length

  if (avgRating === 5 && genericComments >= 3) {
    flags.push('Multiple 5-star reviews with very short/generic comments')
  }

  // Groq-based sentiment check (batch all comments)
  if (recentReviews.length >= 3) {
    try {
      const commentText = recentReviews
        .map((r, i) => `Review ${i + 1} (${r.rating}★): "${r.comment}"`)
        .join('\n')

      const completion = await groq.chat.completions.create({
        model:       GROQ_MODELS.MODERATION,
        max_tokens:  200,
        temperature: 0,
        messages: [
          {
            role:    'system',
            content: `Analyze these reviews for authenticity.
Return JSON: { "authentic": true/false, "concern": "one sentence or null" }
Flag if: ratings and comment sentiment strongly disagree, 
or comments seem copy-pasted/templated.`,
          },
          { role: 'user', content: commentText },
        ],
      })

      const raw    = completion.choices[0]?.message?.content ?? '{}'
      const result = JSON.parse(raw.replace(/```json|```/g, '').trim())

      if (!result.authentic && result.concern) {
        flags.push(`AI sentiment concern: ${result.concern}`)
      }
    } catch {
      // Non-critical — skip if Groq fails
    }
  }

  return flags
}

// ── IP / device clustering detection ─────────────────────────
// Basic version — checks if reviews come from suspiciously
// similar accounts (same day registration + review pattern)

const detectCoordinatedActivity = async (
  providerId: string
): Promise<string[]> => {
  const flags: string[] = []

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Customers who reviewed this provider in last 7 days
  const recentReviewers = await prisma.review.findMany({
    where:   { providerId, createdAt: { gte: sevenDaysAgo } },
    select:  {
      customerId: true,
      createdAt:  true,
      customer:   { select: { createdAt: true } },
    },
  })

  // Flag: multiple reviewers registered within 7 days of each other
  const newAccounts = recentReviewers.filter((r) => {
    const accountAgeDays =
      (r.createdAt.getTime() - r.customer.createdAt.getTime()) /
      (1000 * 60 * 60 * 24)
    return accountAgeDays < 7   // reviewed within 7 days of account creation
  })

  if (newAccounts.length >= 3) {
    flags.push(`${newAccounts.length} reviews from accounts created < 7 days before review`)
  }

  return flags
}

// ── Main anomaly check ────────────────────────────────────────

export const checkAnomalies = async (
  providerId: string
): Promise<AnomalyResult> => {
  const [spikeFlags, sentimentFlags, coordinationFlags] = await Promise.all([
    detectReviewSpike(providerId),
    detectSentimentDivergence(providerId),
    detectCoordinatedActivity(providerId),
  ])

  const allSignals = [...spikeFlags, ...sentimentFlags, ...coordinationFlags]
  const flagged    = allSignals.length > 0

  let severity: AnomalyResult['severity'] = 'none'
  if (allSignals.length === 1)  severity = 'low'
  if (allSignals.length === 2)  severity = 'medium'
  if (allSignals.length >= 3)   severity = 'high'

  return { flagged, signals: allSignals, severity }
}