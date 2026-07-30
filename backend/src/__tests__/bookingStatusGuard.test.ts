import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../config/db', () => ({
  prisma: {
    booking: { findUnique: vi.fn() },
    escrowPayment: { findUnique: vi.fn() },
  },
}))

import { prisma } from '../config/db'
import { updateBookingStatus } from '../services/bookingService'

const mockedBookingFindUnique = vi.mocked(prisma.booking.findUnique)
const mockedEscrowFindUnique = vi.mocked(prisma.escrowPayment.findUnique)

const baseBooking = {
  id: 'booking-1',
  status: 'IN_PROGRESS' as const,
  customerId: 'customer-1',
  scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  provider: { id: 'provider-1', trustScore: 50, legalName: 'Test Provider' },
  category: { name: 'Plumbing' },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('updateBookingStatus — HELD escrow guard', () => {
  it('rejects marking COMPLETED with a 409 when escrow is HELD', async () => {
    mockedBookingFindUnique.mockResolvedValue(baseBooking as any)
    mockedEscrowFindUnique.mockResolvedValue({ id: 'escrow-1', status: 'HELD' } as any)

    await expect(
      updateBookingStatus('booking-1', 'provider-1', 'PROVIDER', { status: 'COMPLETED' } as any)
    ).rejects.toMatchObject({ code: 'ESCROW_HELD', status: 409 })
  })

  it('points the caller at the escrow release endpoint in the error message', async () => {
    mockedBookingFindUnique.mockResolvedValue(baseBooking as any)
    mockedEscrowFindUnique.mockResolvedValue({ id: 'escrow-42', status: 'HELD' } as any)

    await expect(
      updateBookingStatus('booking-1', 'provider-1', 'PROVIDER', { status: 'COMPLETED' } as any)
    ).rejects.toMatchObject({ message: expect.stringContaining('/escrow/escrow-42/release') })
  })

  // The rest of updateBookingStatus (risk-adaptive checks, booking.update,
  // notifications, trust-queue enqueue) isn't mocked here — these two cases
  // only assert the ESCROW_HELD guard specifically stays out of the way,
  // not that the whole downstream flow succeeds end-to-end.

  it('does not raise the ESCROW_HELD guard when there is no escrow row (cash booking)', async () => {
    mockedBookingFindUnique.mockResolvedValue(baseBooking as any)
    mockedEscrowFindUnique.mockResolvedValue(null)

    const err = await updateBookingStatus(
      'booking-1', 'provider-1', 'PROVIDER', { status: 'COMPLETED' } as any
    ).catch((e) => e)

    expect(err?.code).not.toBe('ESCROW_HELD')
  })

  it('does not raise the ESCROW_HELD guard when escrow is already RELEASED', async () => {
    mockedBookingFindUnique.mockResolvedValue(baseBooking as any)
    mockedEscrowFindUnique.mockResolvedValue({ id: 'escrow-1', status: 'RELEASED' } as any)

    const err = await updateBookingStatus(
      'booking-1', 'provider-1', 'PROVIDER', { status: 'COMPLETED' } as any
    ).catch((e) => e)

    expect(err?.code).not.toBe('ESCROW_HELD')
  })
})
