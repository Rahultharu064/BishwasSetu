-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `completionLatitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `completionLongitude` DECIMAL(10, 7) NULL;

-- AlterTable
ALTER TABLE `providers` ADD COLUMN `latitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `longitude` DECIMAL(10, 7) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `fcmToken` VARCHAR(255) NULL;
