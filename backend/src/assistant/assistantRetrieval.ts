import { prisma } from '../config/db'

export interface RetrievedChunk {
  id:        string
  title:     string
  content:   string
  category:  string
  relevance: number
}

// ── Detect language from message ─────────────────────────────

export const detectLanguage = (message: string): 'ne' | 'en' => {
  // Devanagari Unicode range: U+0900–U+097F
  const devanagariPattern = /[\u0900-\u097F]/
  const devanagariChars   = (message.match(devanagariPattern) ?? []).length
  const totalChars        = message.replace(/\s/g, '').length

  // If >20% of characters are Devanagari → Nepali
  if (totalChars > 0 && devanagariChars / totalChars > 0.2) return 'ne'

  // Romanized Nepali detection (common words)
  const nepaliRomanized = [
    'kasto', 'kasari', 'k cha', 'garnuhos', 'dhanyabad',
    'namaskar', 'tapai', 'malai', 'huncha', 'gardina',
    'booking', 'garnu', 'provider', 'trust', 'score',
  ]
  const lower = message.toLowerCase()
  const hasNepaliWords = nepaliRomanized.some((w) => lower.includes(w))

  return hasNepaliWords ? 'ne' : 'en'
}

// ── Classify user intent ──────────────────────────────────────

export const classifyIntent = (
  message:     string,
  contextType: string
): string => {
  if (contextType !== 'general') return contextType

  const lower = message.toLowerCase()

  const intentPatterns: Record<string, string[]> = {
    booking:   ['book', 'schedule', 'appointment', 'cancel', 'reschedule', 'booking', 'बुकिङ', 'बुक'],
    provider:  ['provider', 'plumber', 'electrician', 'compare', 'trust score', 'badge', 'प्रदायक'],
    complaint: ['complaint', 'issue', 'problem', 'refund', 'dispute', 'गुनासो', 'समस्या'],
    credits:   ['credit', 'boost', 'pack', 'recharge', 'visibility', 'क्रेडिट'],
    policy:    ['policy', 'terms', 'how does', 'what is', 'explain', 'नीति', 'कसरी'],
  }

  for (const [intent, keywords] of Object.entries(intentPatterns)) {
    if (keywords.some((kw) => lower.includes(kw))) return intent
  }

  return 'general'
}

// ── MySQL FULLTEXT search ─────────────────────────────────────

export const retrieveChunks = async (
  query:    string,
  lang:     'ne' | 'en',
  limit:    number = 5
): Promise<RetrievedChunk[]> => {
  if (!query.trim()) return []

  try {
    // Search in both languages, merge and deduplicate
    const results = await prisma.$queryRaw<Array<{
      id:        string
      title:     string
      content:   string
      category:  string
      relevance: number
    }>>`
      SELECT
        id,
        title,
        content,
        category,
        MATCH(title, content) AGAINST (${query} IN NATURAL LANGUAGE MODE) AS relevance
      FROM kb_articles
      WHERE
        MATCH(title, content) AGAINST (${query} IN NATURAL LANGUAGE MODE)
        AND lang IN (${lang}, 'en')
      ORDER BY
        relevance DESC,
        lang = ${lang} DESC
      LIMIT ${limit}
    `

    return results.map((r) => ({
      id:        r.id,
      title:     r.title,
      content:   r.content.slice(0, 1500),  // cap chunk size
      category:  r.category,
      relevance: Number(r.relevance),
    }))
  } catch (err) {
    // FTS index might not exist yet — fallback to LIKE search
    console.warn('FTS search failed, falling back to LIKE:', err)

    const fallback = await prisma.kbArticle.findMany({
      where: {
        OR: [
          { title:   { contains: query } },
          { content: { contains: query } },
        ],
        lang: { in: [lang, 'en'] },
      },
      take: limit,
    })

    return fallback.map((r) => ({
      id:        r.id,
      title:     r.title,
      content:   r.content.slice(0, 1500),
      category:  r.category,
      relevance: 0.5,
    }))
  }
}