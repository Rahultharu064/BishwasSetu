-- AlterTable
ALTER TABLE `providers` ADD COLUMN `city` VARCHAR(80) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `city` VARCHAR(80) NULL,
    ADD COLUMN `district` VARCHAR(80) NULL,
    ADD COLUMN `latitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `longitude` DECIMAL(10, 7) NULL;

-- CreateIndex
CREATE INDEX `providers_city_idx` ON `providers`(`city`);
