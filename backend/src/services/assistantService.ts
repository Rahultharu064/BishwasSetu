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
import { fetchContext, type Requester } from '../assistant/assistantContext'
import type { ChatInput }    from '../validators/assistantValidator'

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
  if (!redis) return { messages: [], contextType: 'general', lang: 'en' }
  const raw = await redis.get(`assistant:session:${sessionId}`)
  if (raw) {
    await redis.expire(`assistant:session:${sessionId}`, SESSION_TTL)
    return JSON.parse(raw)
  }
  return { messages: [], contextType: 'general', lang: 'en' }
}

// ── Save session to Redis ──────────────────────────────────────

const saveSession = async (
  sessionId: string,
  data:      SessionData
): Promise<void> => {
  if (!redis) return
  // Keep only last MAX_HISTORY messages to avoid token overflow
  data.messages = data.messages.slice(-MAX_HISTORY)
  await redis.set(
    `assistant:session:${sessionId}`,
    JSON.stringify(data),
    'EX',
    SESSION_TTL
  )
}

// ── Main chat handler (streaming) ─────────────────────────────

export const streamChat = async (
  input:      ChatInput,
  requester:  Requester | undefined,
  res:        Response
): Promise<void> => {
  const { message, sessionId, contextType, contextId } = input
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

  const lang = detectLanguage(message)

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

    // 6. Build system prompt
    const systemPrompt = buildSystemPrompt({
      lang,
      intent,
      retrievedChunks: chunks,
      liveContext,
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

export const getSessionHistory = async (
  sessionId: string,
  userId:    string
) => {
  const session = await prisma.assistantSession.findUnique({
    where:  { sessionId },
    select: {
      sessionId:   true,
      contextType: true,
      messages:    true,
      createdAt:   true,
      updatedAt:   true,
    },
  })

  if (!session) {
    throw { code: 'SESSION_NOT_FOUND', message: 'Session not found', status: 404 }
  }

  return session
}

// ── Admin: KB article management ─────────────────────────────

export const createKbArticle = async (input: {
  category: string
  title:    string
  content:  string
  lang:     string
}) => {
  const article = await prisma.kbArticle.create({ data: input })
  return article
}

export const updateKbArticle = async (
  id:    string,
  input: Partial<{ category: string; title: string; content: string; lang: string }>
) => {
  return prisma.kbArticle.update({ where: { id }, data: input })
}

export const deleteKbArticle = async (id: string) => {
  await prisma.kbArticle.delete({ where: { id } })
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


// Inside assistant.service.ts — defined here for clarity

const buildSystemPrompt = (params: {
  lang:             'ne' | 'en'
  intent:           string
  retrievedChunks:  Array<{ title: string; content: string; category: string }>
  liveContext:      string | null
}): string => {
  const { lang, intent, retrievedChunks, liveContext } = params

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

YOUR IDENTITY:
- You help customers find and book verified home service providers.
- You help providers understand their profile, KYC status, trust score, and credit system.
- You answer questions about bookings, complaints, and platform policies.
- You speak with warmth and clarity — like a knowledgeable friend, not a chatbot.

CRITICAL RULES:
1. ONLY answer using the information in the KNOWLEDGE BASE and LIVE CONTEXT sections below.
2. If the answer is not in the provided context, say: "I don't have enough information about that — please contact our support team."
3. Never invent platform policies, prices, or procedures.
4. Never make promises about refunds, approvals, or outcomes.
5. You CANNOT book, cancel, or modify anything — you are read-only.
6. Keep responses concise — under 150 words unless the user asks for detail.
7. LIVE CONTEXT, when present, belongs only to the signed-in user asking the question — never imply you can see or discuss any other person's bookings, complaints, or wallet.

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