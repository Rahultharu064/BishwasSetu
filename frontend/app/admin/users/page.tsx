"use client";

import { useMemo, useState } from "react";
import { Users, Search, ShieldCheck } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useToast } from "@/context/toast-context";
import { relativeTime } from "@/lib/format";
import type { AdminUser, AdminUsersResponse } from "@/lib/admin-types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";

const ROLE_FILTERS = [
  { value: "", label: "All roles" },
  { value: "CUSTOMER", label: "Customers" },
  { value: "PROVIDER", label: "Providers" },
  { value: "ADMIN", label: "Admins" },
  { value: "MODERATOR", label: "Moderators" },
];

const ROLE_BADGE: Record<
  string,
  "soft" | "skilled" | "neutral" | "urgentSoft"
> = {
  CUSTOMER: "neutral",
  PROVIDER: "soft",
  ADMIN: "urgentSoft",
  MODERATOR: "skilled",
};

function usersFrom(data: unknown): AdminUsersResponse {
  const empty: AdminUsersResponse = {
    users: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  };
  if (data && typeof data === "object" && "users" in data)
    return data as AdminUsersResponse;
  return empty;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [role, setRole] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  const req = useFetch(
    () =>
      api.adminUsers({
        role: role || undefined,
        search: search || undefined,
        page,
        limit: 20,
      }),
    [role, search, page]
  );
  const { users, pagination } = useMemo(() => usersFrom(req.data), [req.data]);

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function toggle(u: AdminUser) {
    setBusyId(u.id);
    try {
      await api.adminToggleUserStatus(u.id, !u.isActive);
      toast(
        u.isActive ? "User deactivated." : "User reactivated.",
        "success"
      );
      req.reload();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Couldn't update the user.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Search and manage every account. Deactivating blocks sign-in immediately.
      </p>

      {/* Filters */}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            onClick={() => {
              setPage(1);
              setRole(f.value);
            }}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium ${
              role === f.value
                ? "border-primary bg-primary-soft text-primary"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <form onSubmit={applySearch} className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="soft">
          Search
        </Button>
      </form>

      {/* List */}
      <div className="mt-5">
        {req.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Try a different role or search term."
            icon={<Users className="h-8 w-8" />}
          />
        ) : (
          <ul className="space-y-3">
            {users.map((u) => (
              <li
                key={u.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={u.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">{u.name}</p>
                      <Badge
                        variant={ROLE_BADGE[u.role] ?? "neutral"}
                        size="sm"
                      >
                        {u.role.toLowerCase()}
                      </Badge>
                      {!u.isActive && (
                        <Badge variant="warning" size="sm">
                          Deactivated
                        </Badge>
                      )}
                      {u.provider?.trustScore != null && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <ShieldCheck className="h-3 w-3" />
                          {Math.round(u.provider.trustScore)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {u.email ?? "—"}
                      {u.phone ? ` · ${u.phone}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Joined {relativeTime(u.createdAt)}
                    </p>
                  </div>
                  {u.role !== "ADMIN" && (
                    <Button
                      size="sm"
                      variant={u.isActive ? "outline" : "soft"}
                      disabled={busyId === u.id}
                      onClick={() => toggle(u)}
                    >
                      {busyId === u.id
                        ? "…"
                        : u.isActive
                          ? "Deactivate"
                          : "Reactivate"}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {!req.loading && !req.error && pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
