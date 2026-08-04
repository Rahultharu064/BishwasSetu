-- CreateTable
CREATE TABLE `assistant_feedback` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NULL,
    `sessionId` VARCHAR(100) NOT NULL,
    `messageIndex` INTEGER NOT NULL,
    `rating` VARCHAR(4) NOT NULL,
    `sources` JSON NULL,
    `comment` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `assistant_feedback_sessionId_idx`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `assistant_feedback` ADD CONSTRAINT `assistant_feedback_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
