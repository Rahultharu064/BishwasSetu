/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `categories` ADD COLUMN `descriptionNp` TEXT NULL,
    ADD COLUMN `slug` VARCHAR(100) NOT NULL,
    ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `sub_categories` (
    `id` CHAR(36) NOT NULL,
    `categoryId` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `nameNp` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `descriptionNp` TEXT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sub_categories_categoryId_idx`(`categoryId`),
    UNIQUE INDEX `sub_categories_categoryId_slug_key`(`categoryId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id` CHAR(36) NOT NULL,
    `subCategoryId` CHAR(36) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `nameNp` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `descriptionNp` TEXT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `pricingType` VARCHAR(20) NOT NULL,
    `priceMin` INTEGER NULL,
    `priceMax` INTEGER NULL,
    `priceFixed` INTEGER NULL,
    `priceUnit` VARCHAR(30) NULL,
    `estimatedMinutes` INTEGER NULL,
    `includedTasks` JSON NULL,
    `excludedTasks` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `services_subCategoryId_idx`(`subCategoryId`),
    UNIQUE INDEX `services_subCategoryId_slug_key`(`subCategoryId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `categories_slug_key` ON `categories`(`slug`);

-- AddForeignKey
ALTER TABLE `sub_categories` ADD CONSTRAINT `sub_categories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `sub_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
