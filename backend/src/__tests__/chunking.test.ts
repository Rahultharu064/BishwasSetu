import { describe, it, expect } from 'vitest'
import { chunkText } from '../assistant/chunking'

describe('chunkText', () => {
  it('returns nothing for empty content', () => {
    expect(chunkText('')).toEqual([])
    expect(chunkText('   ')).toEqual([])
  })

  it('keeps short content as a single chunk', () => {
    const chunks = chunkText('BishwasSetu connects customers with verified providers.')
    expect(chunks).toHaveLength(1)
    expect(chunks[0].index).toBe(0)
  })

  it('splits long content into multiple chunks without exceeding the size cap', () => {
    const sentence = 'Providers must complete KYC verification before taking bookings. '
    const long = sentence.repeat(30) // ~2000 chars
    const chunks = chunkText(long)

    expect(chunks.length).toBeGreaterThan(1)
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(800 + 130) // cap + overlap slack
    }
    // indices are sequential starting at 0
    expect(chunks.map((c) => c.index)).toEqual(chunks.map((_, i) => i))
  })

  it('carries overlap so a boundary sentence is retrievable from both chunks', () => {
    const sentence = 'Escrow protects payment until the job is completed. '
    const long = sentence.repeat(30)
    const chunks = chunkText(long)

    const firstEnd = chunks[0].text.slice(-50)
    expect(chunks[1].text.startsWith(firstEnd.split(' ').slice(0, 3).join(' '))).toBe(false) // sanity: not identical chunks
    expect(chunks[1].text).toContain(chunks[0].text.slice(-40).trim().split(' ').slice(-3).join(' '))
  })

  it('force-splits a single sentence longer than the chunk cap', () => {
    const noSpaces = 'a'.repeat(2000) + '.'
    const chunks = chunkText(noSpaces)
    expect(chunks.length).toBeGreaterThan(1)
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(800)
    }
  })

  it('splits on the Devanagari danda as a sentence boundary', () => {
    const nepaliSentence = 'बिश्वाससेतुले ग्राहकलाई प्रमाणित प्रदायकसँग जोड्छ। '
    const long = nepaliSentence.repeat(30)
    const chunks = chunkText(long)
    expect(chunks.length).toBeGreaterThan(1)
  })
})
