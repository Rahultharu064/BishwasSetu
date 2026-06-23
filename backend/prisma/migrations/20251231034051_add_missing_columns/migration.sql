/*
  Warnings:

  - You are about to alter the column `icon` on the `category` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `VarChar(191)`.
  - You are about to drop the column `availability` on the `provider` table. All the data in the column will be lost.
  - You are about to drop the column `serviceArea` on the `provider` table. All the data in the column will be lost.
  - You are about to drop the column `availability` on the `service` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `service` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `category` MODIFY `icon` VARCHAR(191) NULL,
    MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `provider` DROP COLUMN `availability`,
    DROP COLUMN `serviceArea`,
    ADD COLUMN `availabilityDays` VARCHAR(191) NULL,
    ADD COLUMN `availabilityTime` VARCHAR(191) NULL,
    ADD COLUMN `categoryId` VARCHAR(191) NULL,
    ADD COLUMN `duration` VARCHAR(191) NULL,
    ADD COLUMN `emergencyExtraCharge` DOUBLE NULL,
    ADD COLUMN `emergencyResponseTime` VARCHAR(191) NULL,
    ADD COLUMN `isEmergencyAvailable` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `portfolioUrls` TEXT NULL,
    ADD COLUMN `prevCompany` VARCHAR(191) NULL,
    ADD COLUMN `prevRole` VARCHAR(191) NULL,
    ADD COLUMN `price` DOUBLE NULL,
    ADD COLUMN `serviceDistrict` VARCHAR(191) NULL,
    ADD COLUMN `serviceMunicipality` VARCHAR(191) NULL,
    ADD COLUMN `skills` TEXT NULL,
    ADD COLUMN `tradeLicenseUrl` VARCHAR(191) NULL,
    ADD COLUMN `workDuration` VARCHAR(191) NULL,
    MODIFY `bio` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `service` DROP COLUMN `availability`,
    DROP COLUMN `duration`,
    DROP COLUMN `price`,
    ADD COLUMN `icon` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `district` VARCHAR(191) NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `lastLogin` DATETIME(3) NULL,
    ADD COLUMN `municipality` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE `Booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NOT NULL,
    `providerId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `bookingDate` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Booking_customerId_fkey`(`customerId`),
    INDEX `Booking_providerId_fkey`(`providerId`),
    INDEX `Booking_serviceId_fkey`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `provider` ADD CONSTRAINT `Provider_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
