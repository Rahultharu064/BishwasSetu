/**
 * Backfills the semantic KB index from every row in `kb_articles`.
 *
 * Run after setupPineconeIndex.ts, and any time the index needs a full
 * resync (e.g. after bulk-editing articles directly in the DB, bypassing
 * the admin API that keeps Pinecone in sync incrementally).
 *
 * Run standalone: npx tsx src/scripts/reindexKbToPinecone.ts
 */

import 'dotenv/config'
import { prisma } from '../config/db'
import { pinecone } from '../config/pinecone'
import { syncArticleToPinecone } from '../assistant/pineconeSync'

const main = async () => {
  if (!pinecone) {
    console.error('❌ PINECONE_API_KEY is not set — nothing to reindex.')
    process.exit(1)
  }

  const articles = await prisma.kbArticle.findMany()
  console.log(`⏳ Reindexing ${articles.length} KB articles into Pinecone...`)

  let done = 0
  for (const article of articles) {
    await syncArticleToPinecone(article)
    done += 1
    if (done % 10 === 0 || done === articles.length) {
      console.log(`  ${done}/${articles.length}`)
    }
  }

  console.log('✅ Reindex complete.')
}

main()
  .catch((err) => {
    console.error('❌ KB reindex failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
