/*
  Warnings:

  - You are about to drop the column `experienceBadge` on the `providers` table. All the data in the column will be lost.
  - You are about to drop the column `experienceYears` on the `providers` table. All the data in the column will be lost.
  - You are about to drop the column `kycStatus` on the `providers` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `providers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `providers_kycStatus_idx` ON `providers`;

-- AlterTable
ALTER TABLE `providers` DROP COLUMN `experienceBadge`,
    DROP COLUMN `experienceYears`,
    DROP COLUMN `kycStatus`,
    DROP COLUMN `rejectionReason`,
    ADD COLUMN `completedBookings` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `identityRejectionReason` TEXT NULL,
    ADD COLUMN `identityStatus` VARCHAR(20) NOT NULL DEFAULT 'INCOMPLETE',
    ADD COLUMN `milestoneBadge` VARCHAR(20) NOT NULL DEFAULT 'NEW',
    ADD COLUMN `skillRejectionReason` TEXT NULL,
    ADD COLUMN `skillStatus` VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED',
    ADD COLUMN `yearsExperience` INTEGER NULL;

-- CreateTable
CREATE TABLE `skill_evidence` (
    `id` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `cloudinaryId` VARCHAR(200) NOT NULL,
    `fileUrl` VARCHAR(500) NOT NULL,
    `certNumber` VARCHAR(100) NULL,
    `issuerName` VARCHAR(200) NULL,
    `aiPrecheck` JSON NULL,
    `reviewStatus` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `authenticityTier` VARCHAR(10) NOT NULL DEFAULT 'NONE',
    `issuerVerified` BOOLEAN NOT NULL DEFAULT false,
    `issuerVerifiedAt` DATETIME(3) NULL,
    `rejectReason` VARCHAR(500) NULL,
    `reviewedBy` CHAR(36) NULL,
    `isPaidBadge` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,

    INDEX `skill_evidence_providerId_idx`(`providerId`),
    INDEX `skill_evidence_reviewStatus_idx`(`reviewStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `providers_identityStatus_idx` ON `providers`(`identityStatus`);

-- CreateIndex
CREATE INDEX `providers_skillStatus_idx` ON `providers`(`skillStatus`);

-- AddForeignKey
ALTER TABLE `skill_evidence` ADD CONSTRAINT `skill_evidence_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
