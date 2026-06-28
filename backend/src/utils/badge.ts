// src/utils/badge.ts

export const resolveExperienceBadge = (
  years: number
): 'NAVIN' | 'ANUBHAVI' | 'PRABIN' => {
  if (years < 1)  return 'NAVIN'
  if (years <= 2) return 'ANUBHAVI'
  return 'PRABIN'
}