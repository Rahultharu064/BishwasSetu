-- AlterTable
ALTER TABLE `provider_badges` ADD COLUMN `documentId` VARCHAR(200) NULL,
    ADD COLUMN `documentUrl` VARCHAR(500) NULL,
    ADD COLUMN `paymentMethod` VARCHAR(10) NULL,
    ADD COLUMN `paymentRef` VARCHAR(100) NULL,
    ADD COLUMN `rejectionReason` VARCHAR(500) NULL,
    ADD COLUMN `reviewedAt` DATETIME(3) NULL,
    MODIFY `status` ENUM('PENDING', 'ACTIVE', 'EXPIRED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `messages` (
    `id` CHAR(36) NOT NULL,
    `bookingId` CHAR(36) NOT NULL,
    `senderId` CHAR(36) NOT NULL,
    `body` VARCHAR(2000) NOT NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `messages_bookingId_createdAt_idx`(`bookingId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `provider_badges_status_idx` ON `provider_badges`(`status`);

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
