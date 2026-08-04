import { describe, it, expect } from 'vitest'
import { normalizeIdNumber, hashIdNumber } from '../kyc/kycDuplicateCheck'
import { hashFileBuffer } from '../kyc/fileHash'

describe('normalizeIdNumber', () => {
  it('uppercases and strips non-alphanumeric characters', () => {
    expect(normalizeIdNumber('12-34-56789')).toBe('123456789')
    expect(normalizeIdNumber('ab 12 cd')).toBe('AB12CD')
  })
})

describe('hashIdNumber', () => {
  it('produces the same hash for formatting variants of the same ID', () => {
    expect(hashIdNumber('12-34-56789')).toBe(hashIdNumber('123456789'))
    expect(hashIdNumber('ab-12-cd')).toBe(hashIdNumber('AB 12 CD'))
  })

  it('produces different hashes for different IDs', () => {
    expect(hashIdNumber('123456789')).not.toBe(hashIdNumber('987654321'))
  })

  it('never returns the plaintext ID', () => {
    const hash = hashIdNumber('123456789')
    expect(hash).not.toContain('123456789')
    expect(hash).toMatch(/^[0-9a-f]{64}$/) // sha256 hex digest
  })
})

describe('hashFileBuffer', () => {
  it('produces the same hash for identical file bytes', () => {
    const a = Buffer.from('same image bytes')
    const b = Buffer.from('same image bytes')
    expect(hashFileBuffer(a)).toBe(hashFileBuffer(b))
  })

  it('produces different hashes for different files', () => {
    const a = Buffer.from('image one')
    const b = Buffer.from('image two')
    expect(hashFileBuffer(a)).not.toBe(hashFileBuffer(b))
  })
})
