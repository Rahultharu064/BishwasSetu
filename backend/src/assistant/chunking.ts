/**
 * Splits KB article content into overlapping chunks sized for embedding.
 *
 * Most seeded articles (src/scripts/seedKb.ts) are short enough to embed as
 * a single chunk, but admin-authored articles (POST /assistant/kb) can be
 * arbitrarily long — without chunking, a long article's most relevant
 * paragraph gets diluted by the rest of the text in a single embedding
 * vector, hurting retrieval precision. Overlap keeps a sentence that falls
 * right on a chunk boundary retrievable from either side of the split.
 */

export interface Chunk {
  index: number
  text:  string
}

const MAX_CHUNK_CHARS = 800
const OVERLAP_CHARS   = 120

// Splits on sentence-ending punctuation followed by whitespace. Includes the
// Devanagari danda (।) alongside .!? since the KB is bilingual (en/ne).
const SENTENCE_SPLIT = /(?<=[.!?।])\s+/

const hardSplit = (text: string): string[] => {
  const pieces: string[] = []
  for (let i = 0; i < text.length; i += MAX_CHUNK_CHARS) {
    pieces.push(text.slice(i, i + MAX_CHUNK_CHARS))
  }
  return pieces
}

export const chunkText = (content: string): Chunk[] => {
  const clean = content.trim().replace(/\s+/g, ' ')
  if (!clean) return []
  if (clean.length <= MAX_CHUNK_CHARS) return [{ index: 0, text: clean }]

  const sentences = clean
    .split(SENTENCE_SPLIT)
    .flatMap((s) => (s.length > MAX_CHUNK_CHARS ? hardSplit(s) : [s]))

  const rawChunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence
    if (candidate.length > MAX_CHUNK_CHARS && current) {
      rawChunks.push(current)
      // Only carry overlap forward if it still leaves room for the full
      // sentence — `sentence` itself is already guaranteed <= MAX_CHUNK_CHARS
      // (hard-split above), but a max-sized sentence plus overlap could
      // still blow the cap, so drop the overlap rather than violate it.
      const overlap = current.slice(-OVERLAP_CHARS)
      current = overlap.length + sentence.length + 1 <= MAX_CHUNK_CHARS
        ? `${overlap} ${sentence}`.trim()
        : sentence
    } else {
      current = candidate
    }
  }
  if (current.trim()) rawChunks.push(current.trim())

  return rawChunks.map((text, index) => ({ index, text }))
}
