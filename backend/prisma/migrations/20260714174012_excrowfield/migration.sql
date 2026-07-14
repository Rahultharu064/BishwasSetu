-- AlterTable
ALTER TABLE `bookings` MODIFY `escrowStatus` ENUM('NONE', 'PENDING', 'HELD', 'RELEASED', 'REFUNDED', 'DISPUTED') NOT NULL DEFAULT 'NONE';

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
ALTER TABLE `ServiceGuarantee` ADD CONSTRAINT `ServiceGuarantee_escrowId_fkey` FOREIGN KEY (`escrowId`) REFERENCES `EscrowPayment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuaranteeClaim` ADD CONSTRAINT `GuaranteeClaim_guaranteeId_fkey` FOREIGN KEY (`guaranteeId`) REFERENCES `ServiceGuarantee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmergencyOffer` ADD CONSTRAINT `EmergencyOffer_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `EmergencyRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NeighborhoodCompletion` ADD CONSTRAINT `NeighborhoodCompletion_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `NeighborhoodArea`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
