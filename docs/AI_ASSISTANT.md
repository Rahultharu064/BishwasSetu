# AI Assistant — Architecture & Setup

The in-app assistant (`src/services/assistantService.ts`) is a retrieval-
augmented (RAG) chatbot: it answers only from a knowledge base (`kb_articles`)
plus live, access-controlled platform context (the signed-in user's own
booking/complaint/credits data), streamed from Groq (`llama-3.3-70b-versatile`).
It never invents policy, and it's read-only — it cannot book, cancel, or
modify anything.

Gated behind `AI_ASSISTANT_ENABLED` (off by default — see `docs/MVP_SCOPE.md`).

## Retrieval: FULLTEXT by default, semantic when configured

Two retrieval paths, both in `src/assistant/assistantRetrieval.ts`:

- **MySQL FULLTEXT** (`NATURAL LANGUAGE MODE`, LIKE fallback) — zero extra
  infra, always available. Keyword-based: a question has to share vocabulary
  with the KB article to match, so paraphrases and synonyms can miss.
- **Pinecone semantic search** — embeddings-based, catches paraphrases
  ("what happens if the guy doesn't show up" → the cancellation policy)
  that keyword search misses. Enabled via `AI_SEMANTIC_SEARCH_ENABLED` +
  `PINECONE_API_KEY`.

`retrieveChunks()` tries semantic first when enabled, and falls back to
FULLTEXT on any failure, empty config, or the flag being off — the assistant
degrades, it never breaks.

### Why Pinecone integrated inference, not a separate embeddings API

The index is created with a hosted embedding model (`multilingual-e5-large`,
1024-dim) via Pinecone's integrated inference. Upserts and searches send
plain text; Pinecone embeds it server-side. That means no second API key
(e.g. OpenAI) just for embeddings — Groq (chat) and Pinecone (retrieval +
optional reranking via `bge-reranker-v2-m3`) cover the whole pipeline.
`multilingual-e5-large` specifically because the KB is bilingual (en/ne) —
an English-only embedding model would silently degrade Nepali retrieval.

### Why chunking, and why no fine-tuning

KB articles are split into ~800-character overlapping chunks
(`src/assistant/chunking.ts`) before embedding. Most seeded articles are
short enough to stay a single chunk; longer admin-authored articles (up to
10,000 chars) get split so one embedding vector isn't diluted by unrelated
paragraphs, which is what actually hurts retrieval precision on longer
documents.

Fine-tuning the generation model was deliberately skipped: Groq serves fixed
hosted models (no fine-tuning endpoint), and for a support assistant that
must stay strictly grounded in changing platform policy, retrieval quality
(better chunking, semantic search, reranking) is both cheaper and more
correct than baking KB content into model weights — a fine-tuned model still
can't be trusted to *not* answer from memory once policy changes, whereas
swapping a KB article and re-running `assistant:reindex-kb` takes effect
immediately.

## Setup

```bash
# 1. Point retrieval at Pinecone
PINECONE_API_KEY=...
AI_SEMANTIC_SEARCH_ENABLED=true

# 2. Create the index (idempotent — safe to re-run)
npm run assistant:setup-index

# 3. Backfill every existing KB article into it
npm run assistant:reindex-kb
```

After setup, `createKbArticle` / `updateKbArticle` / `deleteKbArticle`
(`src/assistant/pineconeSync.ts`) keep the index in sync automatically on
every admin write — `assistant:reindex-kb` is only needed for the initial
backfill or a full resync after bulk DB edits that bypass the admin API.

## Trust & safety

- **Access-scoped live context** (`src/assistant/assistantContext.ts`) — a
  booking/complaint/credits context is only injected if the requester
  actually owns it (or is staff); anyone else gets an explicit denial, never
  data. The public provider-profile context is the one exception, since
  that's the same info anyone can see on the listing page.
- **Audience-tiered prompts** — guests get a shallow platform overview;
  signed-in customers/providers get operational depth; staff get full detail.
- **Answers are grounded and cited** — the system prompt forces "I don't
  have enough information" when the KB has no match, and the KB sources used
  for an answer are shown as citations in the widget with a thumbs up/down
  to flag bad ones (`assistant_feedback` table).
