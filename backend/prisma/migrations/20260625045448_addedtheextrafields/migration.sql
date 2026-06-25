/*
  Warnings:

  - The primary key for the `assistant_sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `assistant_sessions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `sessionId` on the `assistant_sessions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `contextType` on the `assistant_sessions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `contextId` on the `assistant_sessions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - The primary key for the `complaints` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `adminResponse` on the `complaints` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `complaints` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `type` on the `complaints` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(5))`.
  - You are about to alter the column `status` on the `complaints` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(6))`.
  - The primary key for the `credit_deductions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `credit_deductions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `reason` on the `credit_deductions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(9))`.
  - The primary key for the `credit_packs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `credit_packs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `name` on the `credit_packs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - The primary key for the `credit_purchases` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `credit_purchases` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `packId` on the `credit_purchases` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `paymentMethod` on the `credit_purchases` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(7))`.
  - You are about to alter the column `paymentRef` on the `credit_purchases` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `status` on the `credit_purchases` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(8))`.
  - The primary key for the `credit_wallets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `credit_wallets` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - The primary key for the `kb_articles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `kb_articles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `category` on the `kb_articles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `lang` on the `kb_articles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(5)`.
  - The primary key for the `kyc_ai_decisions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `kyc_ai_decisions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `forgeryRisk` on the `kyc_ai_decisions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(10)`.
  - You are about to alter the column `decision` on the `kyc_ai_decisions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `adminOverride` on the `kyc_ai_decisions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(10)`.
  - You are about to alter the column `modelVer` on the `kyc_ai_decisions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - The primary key for the `moderation_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `moderation_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `entityType` on the `moderation_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `entityId` on the `moderation_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `result` on the `moderation_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(10)`.
  - You are about to alter the column `category` on the `moderation_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - The primary key for the `provider_badges` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `provider_badges` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `badgeType` on the `provider_badges` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(10))`.
  - You are about to alter the column `status` on the `provider_badges` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(11))`.
  - The primary key for the `reviews` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `reply` on the `reviews` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `reviews` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - The primary key for the `trust_score_events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `trust_score_events` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `trigger` on the `trust_score_events` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `modelVer` on the `trust_score_events` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to drop the `booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kycdocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `provider` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bookingId]` on the table `complaints` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bookingId]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - Made the column `bookingId` on table `complaints` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `assistant_sessions` DROP FOREIGN KEY `assistant_sessions_userId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `complaints` DROP FOREIGN KEY `complaints_bookingId_fkey`;

-- DropForeignKey
ALTER TABLE `complaints` DROP FOREIGN KEY `complaints_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `complaints` DROP FOREIGN KEY `complaints_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `credit_deductions` DROP FOREIGN KEY `credit_deductions_bookingId_fkey`;

-- DropForeignKey
ALTER TABLE `credit_deductions` DROP FOREIGN KEY `credit_deductions_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `credit_purchases` DROP FOREIGN KEY `credit_purchases_packId_fkey`;

-- DropForeignKey
ALTER TABLE `credit_purchases` DROP FOREIGN KEY `credit_purchases_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `credit_wallets` DROP FOREIGN KEY `credit_wallets_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `kyc_ai_decisions` DROP FOREIGN KEY `kyc_ai_decisions_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `kycdocument` DROP FOREIGN KEY `KYCDocument_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `provider` DROP FOREIGN KEY `Provider_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `provider` DROP FOREIGN KEY `Provider_userId_fkey`;

-- DropForeignKey
ALTER TABLE `provider_badges` DROP FOREIGN KEY `provider_badges_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `provider_badges` DROP FOREIGN KEY `provider_badges_verifiedBy_fkey`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_bookingId_fkey`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `service` DROP FOREIGN KEY `Service_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `service` DROP FOREIGN KEY `Service_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `trust_score_events` DROP FOREIGN KEY `trust_score_events_providerId_fkey`;

-- DropIndex
DROP INDEX `assistant_sessions_userId_fkey` ON `assistant_sessions`;

-- DropIndex
DROP INDEX `complaints_bookingId_fkey` ON `complaints`;

-- DropIndex
DROP INDEX `complaints_customerId_fkey` ON `complaints`;

-- DropIndex
DROP INDEX `credit_deductions_bookingId_fkey` ON `credit_deductions`;

-- DropIndex
DROP INDEX `credit_purchases_packId_fkey` ON `credit_purchases`;

-- DropIndex
DROP INDEX `provider_badges_verifiedBy_fkey` ON `provider_badges`;

-- DropIndex
DROP INDEX `reviews_bookingId_fkey` ON `reviews`;

-- DropIndex
DROP INDEX `reviews_customerId_fkey` ON `reviews`;

-- AlterTable
ALTER TABLE `assistant_sessions` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `userId` CHAR(36) NULL,
    MODIFY `sessionId` VARCHAR(100) NOT NULL,
    MODIFY `contextType` VARCHAR(20) NULL,
    MODIFY `contextId` CHAR(36) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `complaints` DROP PRIMARY KEY,
    DROP COLUMN `adminResponse`,
    ADD COLUMN `aiCategory` VARCHAR(50) NULL,
    ADD COLUMN `resolvedAt` DATETIME(3) NULL,
    ADD COLUMN `resolvedBy` CHAR(36) NULL,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `bookingId` CHAR(36) NOT NULL,
    MODIFY `customerId` CHAR(36) NOT NULL,
    MODIFY `providerId` CHAR(36) NOT NULL,
    MODIFY `type` ENUM('SERVICE_QUALITY', 'NO_SHOW', 'OVERCHARGING', 'ABUSIVE_BEHAVIOR', 'FRAUD') NOT NULL,
    MODIFY `status` ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'OPEN',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `credit_deductions` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `providerId` CHAR(36) NOT NULL,
    MODIFY `reason` ENUM('BOOST_BOOKING_ACCEPTED', 'FEATURED_SLOT') NOT NULL,
    MODIFY `bookingId` CHAR(36) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `credit_packs` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `name` VARCHAR(20) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `credit_purchases` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `providerId` CHAR(36) NOT NULL,
    MODIFY `packId` CHAR(36) NOT NULL,
    MODIFY `paymentMethod` ENUM('KHALTI', 'ESEWA', 'CASH') NOT NULL,
    MODIFY `paymentRef` VARCHAR(100) NULL,
    MODIFY `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `credit_wallets` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `providerId` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `kb_articles` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `category` VARCHAR(50) NOT NULL,
    MODIFY `title` VARCHAR(500) NOT NULL,
    MODIFY `lang` VARCHAR(5) NOT NULL DEFAULT 'ne',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `kyc_ai_decisions` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `providerId` CHAR(36) NOT NULL,
    MODIFY `faceScore` FLOAT NULL,
    MODIFY `forgeryRisk` VARCHAR(10) NOT NULL,
    MODIFY `confidence` FLOAT NOT NULL,
    MODIFY `decision` VARCHAR(20) NOT NULL,
    MODIFY `adminOverride` VARCHAR(10) NULL,
    MODIFY `modelVer` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `moderation_logs` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `entityType` VARCHAR(20) NOT NULL,
    MODIFY `entityId` CHAR(36) NOT NULL,
    MODIFY `result` VARCHAR(10) NOT NULL,
    MODIFY `category` VARCHAR(50) NULL,
    MODIFY `confidence` FLOAT NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `provider_badges` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `providerId` CHAR(36) NOT NULL,
    MODIFY `badgeType` ENUM('SKILL_VERIFIED', 'BACKGROUND_CHECKED', 'INSURED') NOT NULL,
    MODIFY `status` ENUM('PENDING', 'ACTIVE', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    MODIFY `verifiedBy` CHAR(36) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `reviews` DROP PRIMARY KEY,
    DROP COLUMN `reply`,
    ADD COLUMN `authenticityScore` FLOAT NULL,
    ADD COLUMN `isVisible` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `providerReply` VARCHAR(500) NULL,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `bookingId` CHAR(36) NOT NULL,
    MODIFY `customerId` CHAR(36) NOT NULL,
    MODIFY `providerId` CHAR(36) NOT NULL,
    MODIFY `comment` VARCHAR(500) NULL,
    MODIFY `isAuthentic` BOOLEAN NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `trust_score_events` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `providerId` CHAR(36) NOT NULL,
    MODIFY `score` FLOAT NOT NULL,
    MODIFY `prevScore` FLOAT NOT NULL,
    MODIFY `trigger` VARCHAR(20) NOT NULL,
    MODIFY `modelVer` VARCHAR(50) NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `booking`;

-- DropTable
DROP TABLE `category`;

-- DropTable
DROP TABLE `kycdocument`;

-- DropTable
DROP TABLE `provider`;

-- DropTable
DROP TABLE `service`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `passwordHash` VARCHAR(255) NULL,
    `role` ENUM('CUSTOMER', 'PROVIDER', 'MODERATOR', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otps` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `code` VARCHAR(6) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `otps_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `token` VARCHAR(512) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    INDEX `refresh_tokens_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `providers` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `legalName` VARCHAR(100) NOT NULL,
    `profilePhoto` VARCHAR(500) NULL,
    `bio` TEXT NULL,
    `serviceArea` VARCHAR(100) NULL,
    `experienceYears` INTEGER NOT NULL DEFAULT 0,
    `experienceBadge` ENUM('NAVIN', 'ANUBHAVI', 'PRABIN') NOT NULL DEFAULT 'NAVIN',
    `kycStatus` ENUM('INCOMPLETE', 'PENDING_DOCUMENTS', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'INCOMPLETE',
    `trustScore` FLOAT NOT NULL DEFAULT 0,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `embedding` JSON NULL,
    `rejectionReason` TEXT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `providers_userId_key`(`userId`),
    INDEX `providers_kycStatus_idx`(`kycStatus`),
    INDEX `providers_trustScore_idx`(`trustScore`),
    INDEX `providers_serviceArea_idx`(`serviceArea`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provider_skills` (
    `id` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `skill` VARCHAR(100) NOT NULL,

    INDEX `provider_skills_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `nameNp` VARCHAR(100) NOT NULL,
    `icon` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `categories_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provider_categories` (
    `id` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `categoryId` CHAR(36) NOT NULL,

    UNIQUE INDEX `provider_categories_providerId_categoryId_key`(`providerId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provider_availability` (
    `id` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `dayOfWeek` INTEGER NOT NULL,
    `startTime` VARCHAR(5) NOT NULL,
    `endTime` VARCHAR(5) NOT NULL,

    INDEX `provider_availability_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kyc_documents` (
    `id` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `type` VARCHAR(30) NOT NULL,
    `cloudinaryId` VARCHAR(200) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `kyc_documents_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` CHAR(36) NOT NULL,
    `customerId` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `categoryId` CHAR(36) NOT NULL,
    `status` ENUM('REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
    `description` TEXT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,
    `priceNpr` INTEGER NULL,
    `commission` INTEGER NULL,
    `paymentMethod` ENUM('KHALTI', 'ESEWA', 'CASH') NOT NULL DEFAULT 'CASH',
    `isBoosted` BOOLEAN NOT NULL DEFAULT false,
    `cancelReason` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `bookings_customerId_idx`(`customerId`),
    INDEX `bookings_providerId_idx`(`providerId`),
    INDEX `bookings_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vouches` (
    `id` CHAR(36) NOT NULL,
    `voucherId` CHAR(36) NOT NULL,
    `voucheeId` CHAR(36) NOT NULL,
    `weight` FLOAT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `vouches_voucheeId_idx`(`voucheeId`),
    UNIQUE INDEX `vouches_voucherId_voucheeId_key`(`voucherId`, `voucheeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `assistant_sessions_sessionId_idx` ON `assistant_sessions`(`sessionId`);

-- CreateIndex
CREATE UNIQUE INDEX `complaints_bookingId_key` ON `complaints`(`bookingId`);

-- CreateIndex
CREATE INDEX `complaints_status_idx` ON `complaints`(`status`);

-- CreateIndex
CREATE INDEX `moderation_logs_entityId_idx` ON `moderation_logs`(`entityId`);

-- CreateIndex
CREATE UNIQUE INDEX `reviews_bookingId_key` ON `reviews`(`bookingId`);

-- CreateIndex
CREATE INDEX `reviews_isVisible_idx` ON `reviews`(`isVisible`);

-- AddForeignKey
ALTER TABLE `otps` ADD CONSTRAINT `otps_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `providers` ADD CONSTRAINT `providers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_skills` ADD CONSTRAINT `provider_skills_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_categories` ADD CONSTRAINT `provider_categories_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_categories` ADD CONSTRAINT `provider_categories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_availability` ADD CONSTRAINT `provider_availability_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kyc_documents` ADD CONSTRAINT `kyc_documents_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kyc_ai_decisions` ADD CONSTRAINT `kyc_ai_decisions_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trust_score_events` ADD CONSTRAINT `trust_score_events_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_purchases` ADD CONSTRAINT `credit_purchases_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_purchases` ADD CONSTRAINT `credit_purchases_packId_fkey` FOREIGN KEY (`packId`) REFERENCES `credit_packs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_wallets` ADD CONSTRAINT `credit_wallets_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_deductions` ADD CONSTRAINT `credit_deductions_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_badges` ADD CONSTRAINT `provider_badges_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assistant_sessions` ADD CONSTRAINT `assistant_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `complaints` RENAME INDEX `complaints_providerId_fkey` TO `complaints_providerId_idx`;

-- RenameIndex
ALTER TABLE `credit_deductions` RENAME INDEX `credit_deductions_providerId_fkey` TO `credit_deductions_providerId_idx`;

-- RenameIndex
ALTER TABLE `credit_purchases` RENAME INDEX `credit_purchases_providerId_fkey` TO `credit_purchases_providerId_idx`;

-- RenameIndex
ALTER TABLE `kyc_ai_decisions` RENAME INDEX `kyc_ai_decisions_providerId_fkey` TO `kyc_ai_decisions_providerId_idx`;

-- RenameIndex
ALTER TABLE `provider_badges` RENAME INDEX `provider_badges_providerId_fkey` TO `provider_badges_providerId_idx`;

-- RenameIndex
ALTER TABLE `reviews` RENAME INDEX `reviews_providerId_fkey` TO `reviews_providerId_idx`;

-- RenameIndex
ALTER TABLE `trust_score_events` RENAME INDEX `trust_score_events_providerId_fkey` TO `trust_score_events_providerId_idx`;
