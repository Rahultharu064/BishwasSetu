-- Adds the FULLTEXT index that src/assistant/assistantRetrieval.ts::retrieveChunks
-- relies on for `MATCH(title, content) AGAINST (...)`. This was referenced by a
-- comment in schema.prisma pointing at a migration file that was never actually
-- created, so every KB search has been silently falling back to a LIKE scan.
-- Prisma's schema DSL doesn't model MySQL FULLTEXT indexes, hence the raw SQL.
ALTER TABLE `kb_articles` ADD FULLTEXT INDEX `kb_articles_title_content_fulltext_idx` (`title`, `content`);
