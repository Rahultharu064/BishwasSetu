import Link from "next/link";
import { CalendarClock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatNpr } from "@/lib/utils";
import type { Booking } from "@/lib/types";

export function BookingCard({ booking, perspective }: { booking: Booking; perspective: "customer" | "provider" }) {
  const name = perspective === "customer" ? booking.provider?.legalName : booking.customer?.name;
  const photo = perspective === "customer" ? booking.provider?.profilePhoto : undefined;

  return (
    <Link href={`/bookings/${booking.id}`}>
      <Card className="flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lifted)] sm:p-5">
        <Avatar src={photo} name={name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold">{booking.category?.name ?? "Service"}</p>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {perspective === "customer" ? "with" : "for"} {name ?? "—"}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" /> {formatDateTime(booking.scheduledAt)}
            </span>
            {booking.neighborhood && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {booking.neighborhood}
              </span>
            )}
          </div>
        </div>
        <p className="shrink-0 font-semibold">{formatNpr(booking.priceNpr)}</p>
      </Card>
    </Link>
  );
}
