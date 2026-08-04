import { Pinecone, type Index, type RecordMetadata } from '@pinecone-database/pinecone'

// Semantic KB search — optional, like redis.ts. Absent PINECONE_API_KEY (or
// the feature flag off) simply means every consumer falls back to the
// MySQL FULLTEXT path already in assistantRetrieval.ts; nothing here is
// load-bearing for the assistant to function.

export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'bishwassetu-kb'
export const PINECONE_CLOUD      = process.env.PINECONE_CLOUD      || 'aws'
export const PINECONE_REGION     = process.env.PINECONE_REGION     || 'us-east-1'
export const PINECONE_NAMESPACE  = 'kb'

// multilingual-e5-large: 1024-dim, trained across 100+ languages including
// Nepali — the KB is bilingual (en/ne), so a Nepali-only or English-only
// embedding model would silently degrade half the content. Pinecone hosts
// the model itself (integrated inference), so no separate embeddings API
// key (e.g. OpenAI) is needed on top of what this project already runs.
export const PINECONE_EMBED_MODEL = 'multilingual-e5-large'
export const PINECONE_RERANK_MODEL = 'bge-reranker-v2-m3'

// The field name upsertRecords/searchRecords embed against, per the index's
// `embed.fieldMap` (set at index-creation time in setupPineconeIndex.ts).
export const CHUNK_TEXT_FIELD = 'chunk_text'

export interface KbChunkMetadata extends RecordMetadata {
  chunk_text: string
  article_id: string
  title:      string
  category:   string
  lang:       string
}

const apiKey = process.env.PINECONE_API_KEY

export const pinecone: Pinecone | null = apiKey ? new Pinecone({ apiKey }) : null

let cachedIndex: Index<KbChunkMetadata> | null = null

/** Namespace-scoped handle to the KB index, or null if Pinecone isn't configured. */
export const getKbIndex = (): Index<KbChunkMetadata> | null => {
  if (!pinecone) return null
  if (!cachedIndex) {
    cachedIndex = pinecone
      .index<KbChunkMetadata>({ name: PINECONE_INDEX_NAME })
      .namespace(PINECONE_NAMESPACE)
  }
  return cachedIndex
}
