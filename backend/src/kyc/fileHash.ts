import { createHash } from 'crypto'

/** SHA-256 of the raw upload — used for exact-duplicate detection across providers. */
export const hashFileBuffer = (buffer: Buffer): string =>
  createHash('sha256').update(buffer).digest('hex')
