import { createHash } from 'crypto'
import { prisma } from '../config/db'

/**
 * Normalizes an OCR-extracted government ID number before hashing, so minor
 * formatting differences between two submissions of the *same* ID (spaces,
 * dashes, case) don't produce different hashes and silently defeat the
 * duplicate check.
 */
export const normalizeIdNumber = (raw: string): string =>
  raw.toUpperCase().replace(/[^A-Z0-9]/g, '')

/**
 * SHA-256 of the normalized ID — this is what gets persisted
 * (Provider.idNumberHash), never the plaintext number. See
 * docs/DATA_RETENTION_AND_SECURITY.md §4.
 */
export const hashIdNumber = (raw: string): string =>
  createHash('sha256').update(normalizeIdNumber(raw)).digest('hex')

export interface DuplicateCheckResult {
  hash:              string
  matchedProviderId: string | null
}

/**
 * Checks whether this government ID (by hash) is already associated with a
 * *different* provider account — e.g. a rejected/blacklisted provider
 * re-registering under a new phone number with the same ID. Never
 * auto-approves on a match; the caller is expected to force HUMAN_QUEUE.
 */
export const checkDuplicateIdentity = async (
  providerId: string,
  idNumber:   string | null
): Promise<DuplicateCheckResult | null> => {
  if (!idNumber?.trim()) return null

  const hash = hashIdNumber(idNumber)

  const match = await prisma.provider.findFirst({
    where:  { idNumberHash: hash, id: { not: providerId } },
    select: { id: true },
  })

  return { hash, matchedProviderId: match?.id ?? null }
}
