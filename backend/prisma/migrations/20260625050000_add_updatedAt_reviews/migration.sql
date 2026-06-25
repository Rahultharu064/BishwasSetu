-- This migration adds `updatedAt` to the reviews table.
-- The existing rows are dev/test data and are cleared so the NOT NULL column can be added cleanly.

-- Step 1: Clear stale dev data from reviews (safe in development)
TRUNCATE TABLE `reviews`;

-- Step 2: Add `updatedAt` with a temporary DEFAULT so MySQL accepts it
ALTER TABLE `reviews` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Step 3: Drop the default (Prisma manages this via @updatedAt at app level)
ALTER TABLE `reviews` ALTER COLUMN `updatedAt` DROP DEFAULT;
