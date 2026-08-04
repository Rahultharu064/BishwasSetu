-- AlterTable
ALTER TABLE `providers` ADD COLUMN `idNumberHash` VARCHAR(64) NULL;

-- CreateIndex
CREATE INDEX `providers_idNumberHash_idx` ON `providers`(`idNumberHash`);
