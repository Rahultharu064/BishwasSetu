import { getKbIndex, CHUNK_TEXT_FIELD, type KbChunkMetadata } from '../config/pinecone'
import { chunkText } from './chunking'

export interface SyncableArticle {
  id:       string
  title:    string
  content:  string
  category: string
  lang:     string
}

// KbArticleSchema caps content at 10,000 chars; at ~800 chars/chunk that's
// at most ~13 chunks, even in the worst case (no sentence breaks to split
// on). This cap just bounds how many stale chunk ids we clean up on
// re-sync — deleting ids that were never written is a harmless no-op.
const MAX_CHUNKS_PER_ARTICLE = 20

const chunkId = (articleId: string, chunkIndex: number) => `${articleId}::${chunkIndex}`

const allPossibleChunkIds = (articleId: string) =>
  Array.from({ length: MAX_CHUNKS_PER_ARTICLE }, (_, i) => chunkId(articleId, i))

/**
 * Re-embeds one KB article's chunks in Pinecone. Called after create/update
 * so the semantic index stays in sync with `kb_articles` — best-effort, so
 * a Pinecone outage never blocks KB admin actions (the FULLTEXT path in
 * assistantRetrieval.ts keeps working regardless).
 */
export const syncArticleToPinecone = async (article: SyncableArticle): Promise<void> => {
  const index = getKbIndex()
  if (!index) return

  try {
    // Clear any chunks from a previous, longer version of this article
    // before writing the current set, so a shrink doesn't leave orphans.
    await index.deleteMany({ ids: allPossibleChunkIds(article.id) })

    const chunks = chunkText(article.content)
    if (chunks.length === 0) return

    const records = chunks.map((chunk) => ({
      id:                       chunkId(article.id, chunk.index),
      [CHUNK_TEXT_FIELD]:       chunk.text,
      article_id:               article.id,
      title:                    article.title,
      category:                 article.category,
      lang:                     article.lang,
    })) satisfies Array<{ id: string } & KbChunkMetadata>

    await index.upsertRecords({ records })
  } catch (err) {
    console.warn(`⚠️ Pinecone sync failed for KB article ${article.id}:`, err)
  }
}

export const deleteArticleFromPinecone = async (articleId: string): Promise<void> => {
  const index = getKbIndex()
  if (!index) return

  try {
    await index.deleteMany({ ids: allPossibleChunkIds(articleId) })
  } catch (err) {
    console.warn(`⚠️ Pinecone delete failed for KB article ${articleId}:`, err)
  }
}
