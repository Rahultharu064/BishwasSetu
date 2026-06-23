-- CreateTable
CREATE TABLE `kb_articles` (
    `id` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `lang` VARCHAR(191) NOT NULL DEFAULT 'ne',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assistant_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `contextType` VARCHAR(191) NULL,
    `contextId` VARCHAR(191) NULL,
    `messages` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assistant_sessions_sessionId_key`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trust_score_events` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` INTEGER NOT NULL,
    `score` DOUBLE NOT NULL,
    `prevScore` DOUBLE NOT NULL,
    `trigger` VARCHAR(191) NOT NULL,
    `inputs` JSON NOT NULL,
    `aiFlags` JSON NULL,
    `modelVer` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kyc_ai_decisions` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` INTEGER NOT NULL,
    `ocrResult` JSON NOT NULL,
    `faceScore` DOUBLE NULL,
    `forgeryRisk` VARCHAR(191) NOT NULL,
    `confidence` DOUBLE NOT NULL,
    `decision` VARCHAR(191) NOT NULL,
    `adminOverride` VARCHAR(191) NULL,
    `modelVer` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `moderation_logs` (
    `id` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `result` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `confidence` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_packs` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `credits` INTEGER NOT NULL,
    `priceNpr` INTEGER NOT NULL,
    `features` JSON NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_purchases` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` INTEGER NOT NULL,
    `packId` VARCHAR(191) NOT NULL,
    `creditsAdded` INTEGER NOT NULL,
    `amountNpr` INTEGER NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `paymentRef` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_wallets` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` INTEGER NOT NULL,
    `balance` INTEGER NOT NULL DEFAULT 0,
    `totalEarned` INTEGER NOT NULL DEFAULT 0,
    `totalSpent` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `credit_wallets_providerId_key`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_deductions` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `bookingId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provider_badges` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` INTEGER NOT NULL,
    `badgeType` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `verifiedBy` INTEGER NULL,
    `expiresAt` DATETIME(3) NULL,
    `amountNpr` INTEGER NOT NULL,
    `purchasedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` INTEGER NOT NULL,
    `customerId` INTEGER NOT NULL,
    `providerId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NOT NULL,
    `reply` TEXT NULL,
    `isAuthentic` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `complaints` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` INTEGER NULL,
    `customerId` INTEGER NOT NULL,
    `providerId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `adminResponse` TEXT NULL,
    `resolution` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `assistant_sessions` ADD CONSTRAINT `assistant_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trust_score_events` ADD CONSTRAINT `trust_score_events_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kyc_ai_decisions` ADD CONSTRAINT `kyc_ai_decisions_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_purchases` ADD CONSTRAINT `credit_purchases_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_purchases` ADD CONSTRAINT `credit_purchases_packId_fkey` FOREIGN KEY (`packId`) REFERENCES `credit_packs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_wallets` ADD CONSTRAINT `credit_wallets_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_deductions` ADD CONSTRAINT `credit_deductions_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_deductions` ADD CONSTRAINT `credit_deductions_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_badges` ADD CONSTRAINT `provider_badges_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_badges` ADD CONSTRAINT `provider_badges_verifiedBy_fkey` FOREIGN KEY (`verifiedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
