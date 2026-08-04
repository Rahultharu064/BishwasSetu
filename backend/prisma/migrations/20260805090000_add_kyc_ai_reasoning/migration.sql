-- AlterTable
ALTER TABLE `kyc_ai_decisions`
    ADD COLUMN `flags` JSON NULL,
    ADD COLUMN `faceReasoning` VARCHAR(500) NULL,
    ADD COLUMN `forgeryReasoning` VARCHAR(500) NULL;
