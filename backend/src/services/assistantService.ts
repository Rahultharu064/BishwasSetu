import { Response }          from 'express'
import { prisma }            from '../config/db'
import { groq, GROQ_MODELS } from '../config/groq'
import { redis }             from '../config/redis'
import { features }          from '../config/features'
import {
  detectLanguage,
  classifyIntent,
  retrieveChunks,
  RetrievedChunk,
} from '../assistant/assistantRetrieval'
import { fetchContext, isStaff, type Requester } from '../assistant/assistantContext'
import { syncArticleToPinecone, deleteArticleFromPinecone } from '../assistant/pineconeSync'
import type { ChatInput, FeedbackInput } from '../validators/assistantValidator'

const SESSION_TTL = 30 * 60          // 30 minutes in seconds
const MAX_HISTORY = 10               // keep last 10 turns in context

// ── Message types ─────────────────────────────────────────────

interface Message {
  role:    'user' | 'assistant'
  content: string
}

interface SessionData {
  messages:    Message[]
  contextType: string
  contextId?:  string
  userId?:     string
  lang:        'ne' | 'en'
}


// ── Load session from Redis ────────────────────────────────────

const loadSession = async (sessionId: string): Promise<SessionData> => {
  const empty = { messages: [], contextType: 'general', lang: 'en' as const }
  if (!redis) return empty
  try {
    const raw = await redis.get(`assistant:session:${sessionId}`)
    if (raw) {
      await redis.expire(`assistant:session:${sessionId}`, SESSION_TTL)
      return JSON.parse(raw)
    }
    return empty
  } catch (err) {
    console.error('Assistant session load failed (Redis unavailable):', err)
    return empty
  }
}

// ── Save session to Redis ──────────────────────────────────────

const saveSession = async (
  sessionId: string,
  data:      SessionData
): Promise<void> => {
  if (!redis) return
  // Keep only last MAX_HISTORY messages to avoid token overflow
  data.messages = data.messages.slice(-MAX_HISTORY)
  try {
    await redis.set(
      `assistant:session:${sessionId}`,
      JSON.stringify(data),
      'EX',
      SESSION_TTL
    )
  } catch (err) {
    console.error('Assistant session save failed (Redis unavailable):', err)
  }
}

// ── Main chat handler (streaming) ─────────────────────────────

export const streamChat = async (
  input:      ChatInput,
  requester:  Requester | undefined,
  res:        Response
): Promise<void> => {
  const { message, sessionId, contextType, contextId, uiLang } = input
  const userId = requester?.id

  // 1. Set SSE headers
  res.setHeader('Content-Type',  'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection',    'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')   // disable nginx buffering
  res.flushHeaders()

  const sendEvent = (data: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  const lang = detectLanguage(message, uiLang)

  // Pilot scope (docs/MVP_SCOPE.md): Groq streaming is opt-in per
  // AI_ASSISTANT_ENABLED so a low-volume launch doesn't pay for AI infra
  // it doesn't need yet. Respond over the same SSE protocol so the widget
  // shows a normal message instead of a broken connection.
  if (!features.aiAssistant) {
    sendEvent({
      type:    'error',
      message: lang === 'ne'
        ? 'माफ गर्नुहोस्, यो सुविधा अहिले उपलब्ध छैन। कृपया फोन वा ह्वाट्सएपमार्फत सम्पर्क गर्नुहोस्।'
        : "The assistant isn't available yet — please reach out via phone or WhatsApp support.",
    })
    res.end()
    return
  }

  try {
    // 2. Load session from Redis
    const session = await loadSession(sessionId)

    // 3. Detect language and intent
    const intent = classifyIntent(message, contextType)

    // 4. Retrieve KB chunks via MySQL FULLTEXT search
    const chunks = await retrieveChunks(message, lang, 5)

    // 5. Fetch live platform context — scoped to the requester so a guest or
    // another user can never pull someone else's booking/complaint/wallet.
    const liveContextObj = await fetchContext(contextType, contextId, requester ?? {})
    const liveContext    = liveContextObj?.summary ?? null

    // 6. Build system prompt — tailored to who's actually asking
    const audience = resolveAudience(requester)
    const systemPrompt = buildSystemPrompt({
      lang,
      intent,
      retrievedChunks: chunks,
      liveContext,
      audience,
    })

    // 7. Build message history for Groq
    const historyMessages: Array<{ role: 'user' | 'assistant'; content: string }> =
      session.messages.slice(-MAX_HISTORY)

    const groqMessages = [
      ...historyMessages,
      { role: 'user' as const, content: message },
    ]

    // 8. Stream from Groq
    let fullResponse = ''

    // Send metadata event first
    sendEvent({
      type:    'meta',
      intent,
      lang,
      sources: chunks.map((c) => ({ title: c.title, category: c.category })),
    })

    const stream = await groq.chat.completions.create({
      model:       GROQ_MODELS.ASSISTANT,
      max_tokens:  512,
      temperature: 0.4,
      stream:      true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...groqMessages,
      ],
    })

    // 9. Stream each token to client
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? ''
      if (token) {
        fullResponse += token
        sendEvent({ type: 'token', content: token })
      }
    }

    // 10. Send done event
    sendEvent({ type: 'done' })

    // 11. Update session
    session.messages.push(
      { role: 'user',      content: message      },
      { role: 'assistant', content: fullResponse }
    )
    session.contextType = contextType
    session.contextId   = contextId
    session.userId      = userId
    session.lang        = lang

    await saveSession(sessionId, session)

    // 12. Persist session to DB (async — don't block stream close)
    persistSessionToDB(sessionId, session, chunks, userId).catch(
      (err) => console.error('Session persist failed:', err)
    )

  } catch (err: any) {
    console.error('Assistant stream error:', err)
    sendEvent({
      type:    'error',
      message: lang === 'ne'
        ? 'माफ गर्नुहोस्, अहिले सहायता उपलब्ध छैन। कृपया पछि प्रयास गर्नुहोस्।'
        : 'Sorry, the assistant is temporarily unavailable. Please try again.',
    })
  } finally {
    res.end()
  }
}

// ── Persist session to DB (async, non-blocking) ───────────────

const persistSessionToDB = async (
  sessionId: string,
  session:   SessionData,
  chunks:    RetrievedChunk[],
  userId?:   string
): Promise<void> => {
  const messages = session.messages.map((m, i) => ({
    ...m,
    retrieved_chunks: i % 2 === 0 ? chunks : [],  // attach chunks to user messages
  })) as any

  await prisma.assistantSession.upsert({
    where:  { sessionId },
    update: { messages, updatedAt: new Date() },
    create: {
      sessionId,
      userId,
      contextType: session.contextType,
      contextId:   session.contextId,
      messages,
    },
  })
}

// ── GET session history ───────────────────────────────────────
// Scoped to whoever owns the session (or staff) — sessionId alone must never
// be enough to read another user's conversation, since it's a client-chosen,
// fairly guessable string (see newSessionId() in the frontend widget).

export const getSessionHistory = async (
  sessionId: string,
  requester: Requester
) => {
  const session = await prisma.assistantSession.findUnique({
    where:  { sessionId },
    select: {
      sessionId:   true,
      userId:      true,
      contextType: true,
      messages:    true,
      createdAt:   true,
      updatedAt:   true,
    },
  })

  if (!session) {
    throw { code: 'SESSION_NOT_FOUND', message: 'Session not found', status: 404 }
  }

  const owns = isStaff(requester) || (!!requester.id && session.userId === requester.id)
  if (!owns) {
    throw { code: 'SESSION_NOT_FOUND', message: 'Session not found', status: 404 }
  }

  const { userId: _userId, ...rest } = session
  return rest
}

// ── POST feedback (thumbs up/down) on a specific answer ───────────────────

export const submitFeedback = async (
  input:     FeedbackInput,
  requester: Requester | undefined
) => {
  return prisma.assistantFeedback.create({
    data: {
      userId:       requester?.id,
      sessionId:    input.sessionId,
      messageIndex: input.messageIndex,
      rating:       input.rating,
      sources:      input.sources,
      comment:      input.comment,
    },
  })
}

// ── Admin: KB article management ─────────────────────────────
// Every write keeps the Pinecone semantic index in sync (best-effort — see
// pineconeSync.ts) so admins never have to remember to run a manual reindex
// after editing an article through this API.

export const createKbArticle = async (input: {
  category: string
  title:    string
  content:  string
  lang:     string
}) => {
  const article = await prisma.kbArticle.create({ data: input })
  await syncArticleToPinecone(article)
  return article
}

export const updateKbArticle = async (
  id:    string,
  input: Partial<{ category: string; title: string; content: string; lang: string }>
) => {
  const article = await prisma.kbArticle.update({ where: { id }, data: input })
  await syncArticleToPinecone(article)
  return article
}

export const deleteKbArticle = async (id: string) => {
  await prisma.kbArticle.delete({ where: { id } })
  await deleteArticleFromPinecone(id)
  return { message: 'Article deleted' }
}

export const listKbArticles = async (params: {
  category?: string
  lang?:     string
  page:      number
  limit:     number
}) => {
  const { category, lang, page, limit } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (category) where.category = category
  if (lang)     where.lang     = lang

  const [articles, total] = await Promise.all([
    prisma.kbArticle.findMany({ where, skip, take: limit, orderBy: { updatedAt: 'desc' } }),
    prisma.kbArticle.count({ where }),
  ])

  return { articles, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }
}


// ── Audience resolution ────────────────────────────────────────
// Who's actually asking decides both the assistant's tone and how much
// depth it's allowed to go into — a real product wouldn't hand a public
// visitor the same operational detail it gives a signed-in member.

type Audience = 'guest' | 'customer' | 'provider' | 'staff'

const resolveAudience = (requester?: Requester): Audience => {
  if (!requester?.id) return 'guest'
  if (requester.role === 'ADMIN' || requester.role === 'MODERATOR') return 'staff'
  if (requester.role === 'PROVIDER') return 'provider'
  return 'customer'
}

const AUDIENCE_PROMPTS: Record<Audience, string> = {
  guest: `
YOUR IDENTITY:
- You are a public guide for people considering BishwasSetu — this visitor is NOT signed in and has no account yet.
- You explain what BishwasSetu is and how it broadly works, in plain, welcoming language.
- You speak with warmth and clarity — like a knowledgeable friend, not a chatbot.

SCOPE FOR THIS VISITOR (important — this is what makes you different from the in-app assistant):
- Give only a GENERAL OVERVIEW: what the platform does, the broad shape of booking/escrow/trust, what service categories exist, how someone would sign up.
- Do NOT walk through step-by-step operational mechanics, policy fine print, dispute/complaint procedure detail, KYC document specifics, or credit/pricing mechanics — even if the knowledge base below contains that detail.
- If asked something that goes deeper than a general overview, give a one-sentence plain-language gist and then say: "Sign up or log in to see the full details for your account."
- Keep responses SHORT — under 80 words — this is a first-touch overview, not a policy manual.`,

  customer: `
YOUR IDENTITY:
- You help this signed-in customer find and book verified home service providers, understand escrow protection and trust scores, and manage their bookings and complaints.
- You speak with warmth and clarity — like a knowledgeable friend, not a chatbot.
- If LIVE CONTEXT below shows one of their bookings or complaints, use it naturally when relevant.

Keep responses concise — under 150 words unless they ask for detail.`,

  provider: `
YOUR IDENTITY:
- You help this signed-in provider understand their profile, KYC verification status, trust score, credit wallet, and boosts, and how jobs/dispatch work.
- You speak with warmth and clarity — like a knowledgeable friend, not a chatbot.
- If LIVE CONTEXT below shows their credits or provider profile, use it naturally when relevant.

Keep responses concise — under 150 words unless they ask for detail.`,

  staff: `
YOUR IDENTITY:
- You are an internal assistant for BishwasSetu staff (admin/moderator) — full platform detail is appropriate.
- You speak with warmth and clarity — like a knowledgeable friend, not a chatbot.

Keep responses concise — under 150 words unless they ask for detail.`,
}

const buildSystemPrompt = (params: {
  lang:             'ne' | 'en'
  intent:           string
  retrievedChunks:  Array<{ title: string; content: string; category: string }>
  liveContext:      string | null
  audience:         Audience
}): string => {
  const { lang, intent, retrievedChunks, liveContext, audience } = params

  const chunkText = retrievedChunks.length > 0
    ? retrievedChunks
        .map((c, i) => `[Source ${i + 1} — ${c.category}]\n${c.title}\n${c.content}`)
        .join('\n\n---\n\n')
    : 'No relevant knowledge base articles found.'

  const langInstruction = lang === 'ne'
    ? 'IMPORTANT: The user is writing in Nepali. Respond entirely in Nepali (Devanagari script). Do not mix English into your response unless quoting a specific technical term.'
    : 'Respond in clear, simple English.'

  return `
You are the BishwasSetu AI Assistant — a helpful, trustworthy guide for Nepal's home services marketplace.

${langInstruction}
${AUDIENCE_PROMPTS[audience]}

CRITICAL RULES (apply regardless of audience):
1. ONLY answer using the information in the KNOWLEDGE BASE and LIVE CONTEXT sections below.
2. If the answer is not in the provided context, say: "I don't have enough information about that — please contact our support team."
3. Never invent platform policies, prices, or procedures.
4. Never make promises about refunds, approvals, or outcomes.
5. You CANNOT book, cancel, or modify anything — you are read-only.
6. LIVE CONTEXT, when present, belongs only to the signed-in user asking the question — never imply you can see or discuss any other person's bookings, complaints, or wallet.

CURRENT INTENT: ${intent}

═══════════════════════════════════════
KNOWLEDGE BASE (use this to answer)
═══════════════════════════════════════
${chunkText}

${liveContext ? `
═══════════════════════════════════════
LIVE CONTEXT (current user state)
═══════════════════════════════════════
${liveContext}
` : ''}
`.trim()
}