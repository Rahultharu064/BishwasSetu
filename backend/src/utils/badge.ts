// src/utils/badge.ts

export const resolveExperienceBadge = (
  years: number
): 'NAVIN' | 'ANUBHAVI' | 'PRABIN' => {
  if (years < 1)  return 'NAVIN'
  if (years <= 2) return 'ANUBHAVI'
  return 'PRABIN'
}

export const resolveMilestoneBadge = (
  completedBookings: number,
  trustScore: number
): 'NEW' | 'ESTABLISHED' | 'TRUSTED_PRO' | 'MASTER_PROVIDER' => {
  if (completedBookings >= 200 && trustScore > 80) {
    return 'MASTER_PROVIDER'
  }
  if (completedBookings >= 50 && trustScore > 70) {
    return 'TRUSTED_PRO'
  }
  if (completedBookings >= 5) {
    return 'ESTABLISHED'
  }
  return 'NEW'
}