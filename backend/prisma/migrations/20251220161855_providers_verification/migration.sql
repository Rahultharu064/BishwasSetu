/*
  Warnings:

  - You are about to drop the column `avgTrustScore` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `providerCount` on the `category` table. All the data in the column will be lost.
  - You are about to drop the `service` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `service` DROP FOREIGN KEY `Service_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `service` DROP FOREIGN KEY `Service_providerId_fkey`;

-- AlterTable
ALTER TABLE `category` DROP COLUMN `avgTrustScore`,
    DROP COLUMN `providerCount`;

-- DropTable
DROP TABLE `service`;

-- CreateTable
CREATE TABLE `Provider` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `legalName` VARCHAR(191) NOT NULL,
    `experienceYears` INTEGER NOT NULL,
    `bio` VARCHAR(191) NOT NULL,
    `serviceArea` VARCHAR(191) NOT NULL,
    `availability` VARCHAR(191) NOT NULL,
    `profilePhotoUrl` VARCHAR(191) NULL,
    `verificationStatus` ENUM('INCOMPLETE', 'DOCUMENTS_PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'INCOMPLETE',
    `trustScore` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Provider_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KYCDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `providerId` INTEGER NOT NULL,
    `type` ENUM('GOVERNMENT_ID', 'CERTIFICATE', 'PROFILE_PHOTO') NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Provider` ADD CONSTRAINT `Provider_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KYCDocument` ADD CONSTRAINT `KYCDocument_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `Provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
