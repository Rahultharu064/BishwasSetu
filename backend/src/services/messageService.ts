/**
 * In-booking messaging (anti-disintermediation friendly):
 * a conversation exists per booking and opens only once the booking is
 * ACCEPTED. Both parties are Users — the provider participates through
 * their linked User account (Provider.userId).
 */
import { prisma } from "../config/db";
import { BookingStatus } from "@prisma/client";
import { ApiError } from "../utils/apierror";
import { emitNewMessage } from "../config/socketHandlers";

const OPEN_STATUSES: BookingStatus[] = [
  BookingStatus.ACCEPTED,
  BookingStatus.IN_PROGRESS,
  BookingStatus.COMPLETED,
];

const bookingParties = {
  customer: { select: { id: true, name: true } },
  provider: {
    select: {
      id: true,
      legalName: true,
      profilePhoto: true,
      userId: true,
      user: { select: { name: true } },
    },
  },
  category: { select: { name: true } },
} as const;

/** Structural shape of the parts of a booking the helpers below read. */
type PartyBooking = {
  customer: { name: string };
  provider: {
    id: string;
    legalName: string;
    profilePhoto: string | null;
    user: { name: string } | null;
  };
};

/** Fetch a booking and assert `userId` is one of its two parties. */
async function loadBookingForUser(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: bookingParties,
  });

  if (!booking) throw new ApiError(404, "Booking not found");

  const isCustomer = booking.customerId === userId;
  const isProvider = booking.provider.userId === userId;
  if (!isCustomer && !isProvider)
    throw new ApiError(403, "You are not part of this conversation");

  return { booking, isCustomer };
}

function otherPartyOf(booking: PartyBooking, isCustomer: boolean) {
  return isCustomer
    ? {
        name: booking.provider.legalName || booking.provider.user?.name || "Provider",
        photo: booking.provider.profilePhoto ?? null,
        providerId: booking.provider.id,
      }
    : { name: booking.customer.name, photo: null, providerId: null };
}

/** All open conversations for a user, newest activity first. */
export async function listConversations(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: OPEN_STATUSES },
      OR: [{ customerId: userId }, { provider: { userId } }],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      ...bookingParties,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return Promise.all(
    bookings.map(async (b) => {
      const isCustomer = b.customerId === userId;
      const last = b.messages[0] ?? null;
      const unread = await prisma.message.count({
        where: { bookingId: b.id, senderId: { not: userId }, readAt: null },
      });
      return {
        bookingId: b.id,
        category: b.category?.name ?? null,
        status: b.status,
        other: otherPartyOf(b, isCustomer),
        lastMessage: last
          ? {
              body: last.body,
              createdAt: last.createdAt,
              mine: last.senderId === userId,
            }
          : null,
        unread,
      };
    })
  );
}

/** Thread for one booking. Marks the other party's messages as read. */
export async function getThread(userId: string, bookingId: string) {
  const { booking, isCustomer } = await loadBookingForUser(userId, bookingId);

  const messages = await prisma.message.findMany({
    where: { bookingId },
    orderBy: { createdAt: "asc" },
    select: { id: true, senderId: true, body: true, readAt: true, createdAt: true },
  });

  // Mark incoming unread as read now that they've been fetched.
  await prisma.message.updateMany({
    where: { bookingId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });

  return {
    bookingId,
    status: booking.status,
    canSend: OPEN_STATUSES.includes(booking.status),
    other: otherPartyOf(booking, isCustomer),
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt,
      mine: m.senderId === userId,
      readAt: m.readAt,
    })),
  };
}

/** Post a message. Only booking parties, only while the booking is open. */
export async function sendMessage(
  userId: string,
  bookingId: string,
  body: string
) {
  const text = body?.trim();
  if (!text) throw new ApiError(400, "Message cannot be empty");
  if (text.length > 2000)
    throw new ApiError(400, "Message is too long (2000 chars max)");

  const { booking, isCustomer } = await loadBookingForUser(userId, bookingId);
  if (!OPEN_STATUSES.includes(booking.status))
    throw new ApiError(
      409,
      "Messaging opens once the booking is accepted"
    );

  const message = await prisma.message.create({
    data: { bookingId, senderId: userId, body: text },
    select: { id: true, senderId: true, body: true, readAt: true, createdAt: true },
  });

  const recipientUserId = isCustomer ? booking.provider.userId : booking.customerId;
  emitNewMessage(recipientUserId, bookingId, message);

  return {
    id: message.id,
    body: message.body,
    createdAt: message.createdAt,
    mine: true,
    readAt: message.readAt,
  };
}
