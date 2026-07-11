/*
  Warnings:

  - You are about to drop the `vouches` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `escrowStatus` ENUM('NONE', 'HELD', 'RELEASED', 'REFUNDED') NOT NULL DEFAULT 'NONE',
    ADD COLUMN `hasGuarantee` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isEmergency` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `neighborhood` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `providers` ADD COLUMN `kycTier` ENUM('TIER_1_BASIC', 'TIER_2_SKILLED', 'TIER_3_VERIFIED') NOT NULL DEFAULT 'TIER_1_BASIC';

-- DropTable
DROP TABLE `vouches`;
