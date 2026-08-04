/**
 * One-time (idempotent) setup for the semantic KB index.
 *
 * Creates a Pinecone serverless index configured with integrated inference
 * (multilingual-e5-large) so upsert/search can send plain text — Pinecone
 * embeds it server-side, no separate embeddings API key needed.
 *
 * Run standalone:  npx tsx src/scripts/setupPineconeIndex.ts
 * Safe to re-run: no-ops if the index already exists.
 */

import 'dotenv/config'
import {
  pinecone,
  PINECONE_INDEX_NAME,
  PINECONE_CLOUD,
  PINECONE_REGION,
  PINECONE_EMBED_MODEL,
  CHUNK_TEXT_FIELD,
} from '../config/pinecone'

const main = async () => {
  if (!pinecone) {
    console.error('❌ PINECONE_API_KEY is not set — nothing to do.')
    process.exit(1)
  }

  const existing = await pinecone.listIndexes()
  if (existing.indexes?.some((i) => i.name === PINECONE_INDEX_NAME)) {
    console.log(`ℹ️ Index "${PINECONE_INDEX_NAME}" already exists — skipping creation.`)
    return
  }

  console.log(`⏳ Creating index "${PINECONE_INDEX_NAME}" (${PINECONE_CLOUD}/${PINECONE_REGION}, model=${PINECONE_EMBED_MODEL})...`)
  await pinecone.createIndexForModel({
    name:   PINECONE_INDEX_NAME,
    cloud:  PINECONE_CLOUD,
    region: PINECONE_REGION,
    embed: {
      model:    PINECONE_EMBED_MODEL,
      fieldMap: { text: CHUNK_TEXT_FIELD },
    },
    waitUntilReady: true,
  })

  console.log(`✅ Index "${PINECONE_INDEX_NAME}" ready. Run "npm run assistant:reindex-kb" to populate it.`)
}

main()
  .catch((err) => {
    console.error('❌ Pinecone index setup failed:', err)
    process.exit(1)
  })
