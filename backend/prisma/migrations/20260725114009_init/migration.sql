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
    `yearsExperience` INTEGER NULL,
    `identityStatus` VARCHAR(20) NOT NULL DEFAULT 'INCOMPLETE',
    `skillStatus` VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED',
    `milestoneBadge` VARCHAR(20) NOT NULL DEFAULT 'NEW',
    `kycTier` ENUM('TIER_1_BASIC', 'TIER_2_SKILLED', 'TIER_3_VERIFIED') NOT NULL DEFAULT 'TIER_1_BASIC',
    `completedBookings` INTEGER NOT NULL DEFAULT 0,
    `trustScore` FLOAT NOT NULL DEFAULT 0,
    `totalRevenue` INTEGER NOT NULL DEFAULT 0,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `embedding` JSON NULL,
    `identityRejectionReason` TEXT NULL,
    `skillRejectionReason` TEXT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `providers_userId_key`(`userId`),
    INDEX `providers_identityStatus_idx`(`identityStatus`),
    INDEX `providers_skillStatus_idx`(`skillStatus`),
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

-- CreateTable
CREATE TABLE `kyc_ai_decisions` (
    `id` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `ocrResult` JSON NOT NULL,
    `faceScore` FLOAT NULL,
    `forgeryRisk` VARCHAR(10) NOT NULL,
    `confidence` FLOAT NOT NULL,
    `decision` VARCHAR(20) NOT NULL,
    `adminOverride` VARCHAR(10) NULL,
    `modelVer` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `kyc_ai_decisions_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` CHAR(36) NOT NULL,
    `customerId` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `categoryId` CHAR(36) NOT NULL,
    `status` ENUM('REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
    `escrowStatus` ENUM('NONE', 'PENDING', 'HELD', 'RELEASED', 'REFUNDED', 'DISPUTED') NOT NULL DEFAULT 'NONE',
    `isEmergency` BOOLEAN NOT NULL DEFAULT false,
    `hasGuarantee` BOOLEAN NOT NULL DEFAULT true,
    `neighborhood` VARCHAR(100) NULL,
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
CREATE TABLE `reviews` (
    `id` CHAR(36) NOT NULL,
    `bookingId` CHAR(36) NOT NULL,
    `customerId` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` VARCHAR(500) NULL,
    `isAuthentic` BOOLEAN NULL,
    `authenticityScore` FLOAT NULL,
    `providerReply` VARCHAR(500) NULL,
    `isVisible` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reviews_bookingId_key`(`bookingId`),
    INDEX `reviews_providerId_idx`(`providerId`),
    INDEX `reviews_isVisible_idx`(`isVisible`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `complaints` (
    `id` CHAR(36) NOT NULL,
    `bookingId` CHAR(36) NOT NULL,
    `customerId` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `type` ENUM('SERVICE_QUALITY', 'NO_SHOW', 'OVERCHARGING', 'ABUSIVE_BEHAVIOR', 'FRAUD') NOT NULL,
    `status` ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'OPEN',
    `description` TEXT NOT NULL,
    `aiCategory` VARCHAR(50) NULL,
    `resolution` TEXT NULL,
    `resolvedBy` CHAR(36) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `complaints_bookingId_key`(`bookingId`),
    INDEX `complaints_status_idx`(`status`),
    INDEX `complaints_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trust_score_events` (
    `id` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `score` FLOAT NOT NULL,
    `prevScore` FLOAT NOT NULL,
    `trigger` VARCHAR(20) NOT NULL,
    `inputs` JSON NOT NULL,
    `aiFlags` JSON NULL,
    `modelVer` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `trust_score_events_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_packs` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(20) NOT NULL,
    `credits` INTEGER NOT NULL,
    `priceNpr` INTEGER NOT NULL,
    `features` JSON NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_purchases` (
    `id` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `packId` CHAR(36) NOT NULL,
    `creditsAdded` INTEGER NOT NULL,
    `amountNpr` INTEGER NOT NULL,
    `paymentMethod` ENUM('KHALTI', 'ESEWA', 'CASH') NOT NULL,
    `paymentRef` VARCHAR(100) NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `credit_purchases_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_wallets` (
    `id` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `balance` INTEGER NOT NULL DEFAULT 0,
    `totalEarned` INTEGER NOT NULL DEFAULT 0,
    `totalSpent` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `credit_wallets_providerId_key`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_deductions` (
    `id` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `amount` INTEGER NOT NULL,
    `reason` ENUM('BOOST_BOOKING_ACCEPTED', 'FEATURED_SLOT') NOT NULL,
    `bookingId` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `credit_deductions_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provider_badges` (
    `id` CHAR(36) NOT NULL,
    `providerId` CHAR(36) NOT NULL,
    `badgeType` ENUM('SKILL_VERIFIED', 'BACKGROUND_CHECKED', 'INSURED', 'FAST_RESPONDER') NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `verifiedBy` CHAR(36) NULL,
    `expiresAt` DATETIME(3) NULL,
    `amountNpr` INTEGER NOT NULL,
    `purchasedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `provider_badges_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `moderation_logs` (
    `id` CHAR(36) NOT NULL,
    `entityType` VARCHAR(20) NOT NULL,
    `entityId` CHAR(36) NOT NULL,
    `result` VARCHAR(10) NOT NULL,
    `category` VARCHAR(50) NULL,
    `confidence` FLOAT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `moderation_logs_entityId_idx`(`entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kb_articles` (
    `id` CHAR(36) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `content` TEXT NOT NULL,
    `lang` VARCHAR(5) NOT NULL DEFAULT 'ne',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assistant_sessions` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NULL,
    `sessionId` VARCHAR(100) NOT NULL,
    `contextType` VARCHAR(20) NULL,
    `contextId` CHAR(36) NULL,
    `messages` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assistant_sessions_sessionId_key`(`sessionId`),
    INDEX `assistant_sessions_sessionId_idx`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `nameNp` VARCHAR(100) NOT NULL,
    `icon` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `descriptionNp` TEXT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `categories_name_key`(`name`),
    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `EscrowPayment` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `gateway` ENUM('KHALTI', 'ESEWA') NOT NULL,
    `status` ENUM('NONE', 'PENDING', 'HELD', 'RELEASED', 'REFUNDED', 'DISPUTED') NOT NULL DEFAULT 'PENDING',
    `amountPaisa` INTEGER NOT NULL,
    `commissionPct` DECIMAL(5, 2) NOT NULL,
    `commissionPaisa` INTEGER NOT NULL DEFAULT 0,
    `payoutPaisa` INTEGER NOT NULL DEFAULT 0,
    `gatewayRef` VARCHAR(191) NULL,
    `gatewayTxnId` VARCHAR(191) NULL,
    `heldAt` DATETIME(3) NULL,
    `releasedAt` DATETIME(3) NULL,
    `refundedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EscrowPayment_bookingId_key`(`bookingId`),
    INDEX `EscrowPayment_customerId_idx`(`customerId`),
    INDEX `EscrowPayment_providerId_status_idx`(`providerId`, `status`),
    INDEX `EscrowPayment_gatewayRef_idx`(`gatewayRef`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceGuarantee` (
    `id` VARCHAR(191) NOT NULL,
    `escrowId` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'CLAIMED', 'RESOLVED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ServiceGuarantee_escrowId_key`(`escrowId`),
    UNIQUE INDEX `ServiceGuarantee_bookingId_key`(`bookingId`),
    INDEX `ServiceGuarantee_providerId_status_idx`(`providerId`, `status`),
    INDEX `ServiceGuarantee_status_expiresAt_idx`(`status`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuaranteeClaim` (
    `id` VARCHAR(191) NOT NULL,
    `guaranteeId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `photoUrls` JSON NULL,
    `resolution` TEXT NULL,
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GuaranteeClaim_guaranteeId_idx`(`guaranteeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RevenuePointLedger` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RevenuePointLedger_providerId_createdAt_idx`(`providerId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeakageFlag` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `bookingId` VARCHAR(191) NULL,
    `signal` VARCHAR(191) NOT NULL,
    `details` JSON NULL,
    `status` ENUM('OPEN', 'REVIEWED', 'DISMISSED', 'ACTIONED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,

    INDEX `LeakageFlag_providerId_status_idx`(`providerId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmergencyRequest` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `latitude` DECIMAL(10, 7) NOT NULL,
    `longitude` DECIMAL(10, 7) NOT NULL,
    `addressLabel` VARCHAR(191) NULL,
    `status` ENUM('SEARCHING', 'DISPATCHED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'SEARCHING',
    `commissionPct` DECIMAL(5, 2) NOT NULL DEFAULT 12.00,
    `acceptedById` VARCHAR(191) NULL,
    `acceptedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `bookingId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EmergencyRequest_bookingId_key`(`bookingId`),
    INDEX `EmergencyRequest_customerId_idx`(`customerId`),
    INDEX `EmergencyRequest_status_expiresAt_idx`(`status`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmergencyOffer` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `distanceKm` DECIMAL(6, 2) NOT NULL,
    `status` ENUM('SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED') NOT NULL DEFAULT 'SENT',
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `respondedAt` DATETIME(3) NULL,

    INDEX `EmergencyOffer_providerId_status_idx`(`providerId`, `status`),
    UNIQUE INDEX `EmergencyOffer_requestId_providerId_key`(`requestId`, `providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `earned_badges` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `badge` VARCHAR(191) NOT NULL,
    `awardedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,

    INDEX `earned_badges_badge_idx`(`badge`),
    UNIQUE INDEX `earned_badges_providerId_badge_key`(`providerId`, `badge`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NeighborhoodArea` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `latitude` DECIMAL(10, 7) NOT NULL,
    `longitude` DECIMAL(10, 7) NOT NULL,
    `radiusKm` DECIMAL(5, 2) NOT NULL DEFAULT 1.50,

    UNIQUE INDEX `NeighborhoodArea_name_key`(`name`),
    INDEX `NeighborhoodArea_city_idx`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NeighborhoodCompletion` (
    `id` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `latitude` DECIMAL(10, 7) NOT NULL,
    `longitude` DECIMAL(10, 7) NOT NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `NeighborhoodCompletion_bookingId_key`(`bookingId`),
    INDEX `NeighborhoodCompletion_providerId_completedAt_idx`(`providerId`, `completedAt`),
    INDEX `NeighborhoodCompletion_areaId_completedAt_idx`(`areaId`, `completedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
ALTER TABLE `skill_evidence` ADD CONSTRAINT `skill_evidence_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE `sub_categories` ADD CONSTRAINT `sub_categories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `sub_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceGuarantee` ADD CONSTRAINT `ServiceGuarantee_escrowId_fkey` FOREIGN KEY (`escrowId`) REFERENCES `EscrowPayment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuaranteeClaim` ADD CONSTRAINT `GuaranteeClaim_guaranteeId_fkey` FOREIGN KEY (`guaranteeId`) REFERENCES `ServiceGuarantee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmergencyOffer` ADD CONSTRAINT `EmergencyOffer_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `EmergencyRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NeighborhoodCompletion` ADD CONSTRAINT `NeighborhoodCompletion_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `NeighborhoodArea`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
