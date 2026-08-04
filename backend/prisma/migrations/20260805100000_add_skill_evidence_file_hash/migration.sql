-- AlterTable
ALTER TABLE `skill_evidence` ADD COLUMN `fileHash` VARCHAR(64) NULL;

-- CreateIndex
CREATE INDEX `skill_evidence_fileHash_idx` ON `skill_evidence`(`fileHash`);
