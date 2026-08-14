"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "./auth-context";
import { getAccessToken } from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  /** For pages that need the raw connection (e.g. a chat thread) rather than the derived notification list. */
  socket: Socket | null;
}

const MAX_NOTIFICATIONS = 30;
const STORAGE_KEY = "bs_notifications";

const NotificationContext = createContext<NotificationState | undefined>(undefined);

function push(list: AppNotification[], next: AppNotification): AppNotification[] {
  return [next, ...list].slice(0, MAX_NOTIFICATIONS);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const currentUserId = useRef<string | undefined>(undefined);

  // Rehydrate the read/unread list from localStorage per-user, once.
  useEffect(() => {
    if (typeof window === "undefined" || !user?.id) return;
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setNotifications(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
  }, [user?.id]);

  useEffect(() => {
    if (typeof window === "undefined" || !user?.id) return;
    localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(notifications));
  }, [notifications, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSocket(null);
      currentUserId.current = undefined;
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    const s = connectSocket(token);
    setSocket(s);
    currentUserId.current = user?.id;

    function onNewBooking(payload: { booking: { id: string; category?: { name: string }; customer?: { name: string } } }) {
      const b = payload.booking;
      setNotifications((prev) =>
        push(prev, {
          id: `booking-new-${b.id}-${Date.now()}`,
          title: "New booking request",
          body: b.category?.name ? `${b.category.name} — from ${b.customer?.name ?? "a customer"}` : "You have a new booking request.",
          href: `/bookings/${b.id}`,
          createdAt: new Date().toISOString(),
          read: false,
        })
      );
    }

    function onStatusUpdate(payload: { booking: { id: string; status: string } }) {
      const b = payload.booking;
      setNotifications((prev) =>
        push(prev, {
          id: `booking-status-${b.id}-${b.status}-${Date.now()}`,
          title: "Booking update",
          body: `Status changed to ${b.status.replace(/_/g, " ").toLowerCase()}.`,
          href: `/bookings/${b.id}`,
          createdAt: new Date().toISOString(),
          read: false,
        })
      );
    }

    function onCancelled(payload: { booking: { id: string } }) {
      setNotifications((prev) =>
        push(prev, {
          id: `booking-cancelled-${payload.booking.id}-${Date.now()}`,
          title: "Booking cancelled",
          body: "One of your bookings was cancelled.",
          href: `/bookings/${payload.booking.id}`,
          createdAt: new Date().toISOString(),
          read: false,
        })
      );
    }

    function onNewMessage(payload: {
      bookingId: string;
      message: { id: string; body: string; senderId: string };
    }) {
      // A page already viewing this thread handles the message itself —
      // the bell is for messages that arrive while you're elsewhere.
      if (typeof window !== "undefined" && window.location.pathname === `/messages/${payload.bookingId}`) {
        return;
      }
      setNotifications((prev) =>
        push(prev, {
          id: `message-${payload.message.id}`,
          title: "New message",
          body: payload.message.body.slice(0, 80),
          href: `/messages/${payload.bookingId}`,
          createdAt: new Date().toISOString(),
          read: false,
        })
      );
    }

    s.on("booking:new", onNewBooking);
    s.on("booking:statusUpdate", onStatusUpdate);
    s.on("booking:cancelled", onCancelled);
    s.on("message:new", onNewMessage);

    return () => {
      s.off("booking:new", onNewBooking);
      s.off("booking:statusUpdate", onStatusUpdate);
      s.off("booking:cancelled", onCancelled);
      s.off("message:new", onNewMessage);
    };
  }, [isAuthenticated, user?.id]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, socket }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationState {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within <NotificationProvider>");
  return ctx;
}
