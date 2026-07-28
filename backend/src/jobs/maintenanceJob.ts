/**
 * Scheduled maintenance workers (§5.2):
 * - "expire-guarantees": hourly — closes 7-day guarantees past their window.
 * - "leakage-scan": daily — flags off-platform behaviour patterns for admin
 *   review (cancel-after-contact and complaint-pattern heuristics).
 *
 * Register once at boot: import "./jobs/maintenance.job";
 */
import { maintenanceQueue } from "../config/queues";
import { prisma } from "../config/db";

// Repeatable schedules (Bull dedupes repeatable jobs by name + cron)
void maintenanceQueue.add(
  "expire-guarantees",
  {},
  { repeat: { cron: "0 * * * *" } } // hourly
);
void maintenanceQueue.add(
  "leakage-scan",
  {},
  { repeat: { cron: "30 2 * * *" } } // daily 02:30 NPT server time
);
void maintenanceQueue.add(
  "expire-badges",
  {},
  { repeat: { cron: "15 1 * * *" } } // daily 01:15 — expire lapsed annual badges (Insured)
);

maintenanceQueue.process("expire-guarantees", async () => {
  await prisma.serviceGuarantee.updateMany({
    where: { status: "ACTIVE", expiresAt: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });
});

maintenanceQueue.process("expire-badges", async () => {
  const { expireLapsedBadges } = await import("../services/badgeService");
  const expired = await expireLapsedBadges();
  if (expired > 0) console.log(`🎖️  Expired ${expired} lapsed trust badge(s)`);
});

maintenanceQueue.process("leakage-scan", async () => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Heuristic 1: providers with a high rate of bookings cancelled by the
  // customer shortly after the provider accepted (classic "take it offline").
  const suspiciousCancels = await prisma.booking.groupBy({
    by: ["providerId"],
    where: {
      status: "CANCELLED",
      createdAt: { gte: since },
    },
    _count: { _all: true },
    having: { providerId: { _count: { gte: 3 } } },
  });

  for (const row of suspiciousCancels) {
    const alreadyFlagged = await prisma.leakageFlag.findFirst({
      where: {
        providerId: row.providerId,
        signal: "CANCEL_AFTER_CONTACT",
        status: "OPEN",
      },
    });
    if (alreadyFlagged) continue;
    await prisma.leakageFlag.create({
      data: {
        providerId: row.providerId,
        signal: "CANCEL_AFTER_CONTACT",
        details: { cancelledCount: row._count._all, windowDays: 30 },
      },
    });
  }

  // Heuristic 2: complaints referencing off-platform cash deals.
  const cashComplaints = await prisma.complaint.findMany({
    where: {
      createdAt: { gte: since },
      OR: [
        { description: { contains: "cash" } },
        { description: { contains: "नगद" } },
        { description: { contains: "off platform" } },
        { description: { contains: "phone number" } },
      ],
    },
    select: { id: true, providerId: true, bookingId: true, customerId: true },
  });

  for (const complaint of cashComplaints) {
    const exists = await prisma.leakageFlag.findFirst({
      where: {
        providerId: complaint.providerId,
        bookingId: complaint.bookingId,
        signal: "COMPLAINT_PATTERN",
      },
    });
    if (exists) continue;
    await prisma.leakageFlag.create({
      data: {
        providerId: complaint.providerId,
        customerId: complaint.customerId,
        bookingId: complaint.bookingId,
        signal: "COMPLAINT_PATTERN",
        details: { complaintId: complaint.id },
      },
    });
  }
});
