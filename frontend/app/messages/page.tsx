import { MessageCircle, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Messages — BishwasSetu" };

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Chat with providers — after a booking is accepted.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <MessageCircle className="h-6 w-6" />
        </div>
        <p className="mt-3 font-semibold">No conversations yet</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          To protect you from spam, messaging opens only once a provider accepts
          your booking — never before.
        </p>
        <Link href="/services" className="mt-4 inline-block">
          <Button variant="soft" size="sm">
            Book a service
          </Button>
        </Link>
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> No pre-booking DMs — by design
        </p>
      </div>
    </div>
  );
}
