"use client";

import { useMemo, useState } from "react";
import {
  Layers,
  ChevronRight,
  Plus,
  Pencil,
  Power,
  Users,
  Search,
  X,
  FolderTree,
  ListTree,
  Wrench,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useToast } from "@/context/toast-context";
import { servicePrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  AdminCategoryRow,
  AdminSubCategoryRow,
  AdminServiceRow,
} from "@/lib/admin-types";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { StatCard } from "@/components/ui/stat-card";

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type FormTarget =
  | { level: "category"; mode: "create" }
  | { level: "category"; mode: "edit"; item: AdminCategoryRow }
  | { level: "subcategory"; mode: "create"; categoryId: string }
  | { level: "subcategory"; mode: "edit"; item: AdminSubCategoryRow }
  | { level: "service"; mode: "create"; subCategoryId: string }
  | { level: "service"; mode: "edit"; item: AdminServiceRow };

export default function AdminServicesPage() {
  const { toast } = useToast();
  const req = useFetch<AdminCategoryRow[]>(() => api.adminServiceTree(), []);

  const [openCats, setOpenCats] = useState<Set<string>>(new Set());
  const [openSubs, setOpenSubs] = useState<Set<string>>(new Set());
  const [target, setTarget] = useState<FormTarget | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  function toggleSet(
    set: Set<string>,
    setter: (s: Set<string>) => void,
    id: string
  ) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  }

  async function toggleActive(
    level: "category" | "subcategory" | "service",
    id: string,
    isActive: boolean
  ) {
    setBusyId(id);
    try {
      if (level === "category") await api.adminToggleCategory(id, !isActive);
      else if (level === "subcategory")
        await api.adminToggleSubCategory(id, !isActive);
      else await api.adminToggleService(id, !isActive);
      toast(!isActive ? "Activated." : "Deactivated.", "success");
      req.reload();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't update.", "error");
    } finally {
      setBusyId(null);
    }
  }

  const categories = useMemo(() => req.data ?? [], [req.data]);

  // Catalog-wide counters for the stat row — computed client-side from the
  // same tree the list renders, so there's no separate summary endpoint to
  // keep in sync.
  const catalogStats = useMemo(() => {
    let activeCategories = 0;
    let totalSubCategories = 0;
    let activeSubCategories = 0;
    let totalServices = 0;
    let activeServices = 0;
    let totalProviders = 0;
    for (const cat of categories) {
      if (cat.isActive) activeCategories++;
      totalProviders += cat._count.providers;
      for (const sub of cat.subCategories) {
        totalSubCategories++;
        if (sub.isActive) activeSubCategories++;
        for (const svc of sub.services) {
          totalServices++;
          if (svc.isActive) activeServices++;
        }
      }
    }
    return {
      totalCategories: categories.length,
      activeCategories,
      totalSubCategories,
      activeSubCategories,
      totalServices,
      activeServices,
      totalProviders,
    };
  }, [categories]);

  // Client-side search across all three levels — a category matches (and
  // shows in full) if its own name matches; otherwise only its matching
  // sub-categories/services survive the filter.
  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.flatMap((cat) => {
      const catMatches = cat.name.toLowerCase().includes(q);
      const subCategories = cat.subCategories.flatMap((sub) => {
        if (catMatches) return [sub];
        const subMatches = sub.name.toLowerCase().includes(q);
        const services = sub.services.filter((s) =>
          s.name.toLowerCase().includes(q)
        );
        if (subMatches) return [sub];
        if (services.length > 0) return [{ ...sub, services }];
        return [];
      });
      if (catMatches || subCategories.length > 0) {
        return [{ ...cat, subCategories }];
      }
      return [];
    });
  }, [categories, query]);

  const searching = query.trim().length > 0;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the category → sub-category → service catalog customers
            browse. Inactive rows stay here but drop off the public site.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setTarget({ level: "category", mode: "create" })}
        >
          <Plus className="h-4 w-4" /> New category
        </Button>
      </div>

      {!req.loading && !req.error && categories.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            tone="primary"
            icon={<FolderTree className="h-5 w-5" />}
            label="Categories"
            value={String(catalogStats.totalCategories)}
            sub={`${catalogStats.activeCategories} active`}
          />
          <StatCard
            tone="skilled"
            icon={<ListTree className="h-5 w-5" />}
            label="Sub-categories"
            value={String(catalogStats.totalSubCategories)}
            sub={`${catalogStats.activeSubCategories} active`}
          />
          <StatCard
            tone="skilled"
            icon={<Wrench className="h-5 w-5" />}
            label="Services"
            value={String(catalogStats.totalServices)}
            sub={`${catalogStats.activeServices} active`}
          />
          <StatCard
            tone="primary"
            icon={<Users className="h-5 w-5" />}
            label="Providers listed"
            value={catalogStats.totalProviders.toLocaleString()}
            sub="across all categories"
          />
        </div>
      )}

      {!req.loading && !req.error && categories.length > 0 && (
        <div className="relative mt-5 max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories, sub-categories, services…"
            className="pl-10 pr-9"
            aria-label="Search catalog"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="mt-5">
        {req.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Create the first category to start building the catalog."
            icon={<Layers className="h-8 w-8" />}
            action={{
              label: "New category",
              onClick: () => setTarget({ level: "category", mode: "create" }),
            }}
          />
        ) : searching && filteredCategories.length === 0 ? (
          <EmptyState
            title="No matches"
            description={`Nothing in the catalog matches "${query.trim()}".`}
            icon={<Search className="h-8 w-8" />}
            action={{ label: "Clear search", onClick: () => setQuery("") }}
          />
        ) : (
          <ul className="space-y-3">
            {filteredCategories.map((cat) => {
              const isOpen = searching || openCats.has(cat.id);
              return (
                <li
                  key={cat.id}
                  className="rounded-xl border border-border bg-card"
                >
                  <div className="flex items-center gap-3 p-4">
                    <button
                      onClick={() => toggleSet(openCats, setOpenCats, cat.id)}
                      className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
                      aria-label={isOpen ? "Collapse" : "Expand"}
                    >
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isOpen && "rotate-90"
                        )}
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{cat.name}</p>
                        <Badge variant={cat.isActive ? "soft" : "neutral"} size="sm">
                          {cat.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {cat.nameNp} · /{cat.slug} ·{" "}
                        {cat.subCategories.length} sub-categories ·{" "}
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" /> {cat._count.providers}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setTarget({ level: "category", mode: "edit", item: cat })
                        }
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busyId === cat.id}
                        onClick={() =>
                          toggleActive("category", cat.id, cat.isActive)
                        }
                      >
                        <Power className="h-3.5 w-3.5" />
                        {cat.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-border p-4 pl-11">
                      <div className="mb-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setTarget({
                              level: "subcategory",
                              mode: "create",
                              categoryId: cat.id,
                            })
                          }
                        >
                          <Plus className="h-3.5 w-3.5" /> Sub-category
                        </Button>
                      </div>

                      {cat.subCategories.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No sub-categories yet.
                        </p>
                      ) : (
                        <ul className="space-y-2.5">
                          {cat.subCategories.map((sub) => {
                            const subOpen = searching || openSubs.has(sub.id);
                            return (
                              <li
                                key={sub.id}
                                className="rounded-lg border border-border bg-background"
                              >
                                <div className="flex items-center gap-2.5 p-3">
                                  <button
                                    onClick={() =>
                                      toggleSet(openSubs, setOpenSubs, sub.id)
                                    }
                                    className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
                                    aria-label={subOpen ? "Collapse" : "Expand"}
                                  >
                                    <ChevronRight
                                      className={cn(
                                        "h-3.5 w-3.5 transition-transform",
                                        subOpen && "rotate-90"
                                      )}
                                    />
                                  </button>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-semibold">
                                        {sub.name}
                                      </p>
                                      <Badge
                                        variant={sub.isActive ? "soft" : "neutral"}
                                        size="sm"
                                      >
                                        {sub.isActive ? "Active" : "Inactive"}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      /{sub.slug} · {sub._count.services} services
                                    </p>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setTarget({
                                          level: "subcategory",
                                          mode: "edit",
                                          item: sub,
                                        })
                                      }
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={busyId === sub.id}
                                      onClick={() =>
                                        toggleActive(
                                          "subcategory",
                                          sub.id,
                                          sub.isActive
                                        )
                                      }
                                    >
                                      <Power className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>

                                {subOpen && (
                                  <div className="border-t border-border p-3 pl-9">
                                    <div className="mb-2.5">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          setTarget({
                                            level: "service",
                                            mode: "create",
                                            subCategoryId: sub.id,
                                          })
                                        }
                                      >
                                        <Plus className="h-3.5 w-3.5" /> Service
                                      </Button>
                                    </div>
                                    {sub.services.length === 0 ? (
                                      <p className="text-sm text-muted-foreground">
                                        No services yet.
                                      </p>
                                    ) : (
                                      <ul className="space-y-2">
                                        {sub.services.map((svc) => (
                                          <li
                                            key={svc.id}
                                            className="flex items-center gap-2.5 rounded-lg bg-secondary/60 p-2.5"
                                          >
                                            <div className="min-w-0 flex-1">
                                              <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-medium">
                                                  {svc.name}
                                                </p>
                                                <Badge
                                                  variant={
                                                    svc.isActive
                                                      ? "soft"
                                                      : "neutral"
                                                  }
                                                  size="sm"
                                                >
                                                  {svc.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                                </Badge>
                                              </div>
                                              <p className="text-xs text-muted-foreground">
                                                {servicePrice(svc)}
                                              </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  setTarget({
                                                    level: "service",
                                                    mode: "edit",
                                                    item: svc,
                                                  })
                                                }
                                              >
                                                <Pencil className="h-3.5 w-3.5" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={busyId === svc.id}
                                                onClick={() =>
                                                  toggleActive(
                                                    "service",
                                                    svc.id,
                                                    svc.isActive
                                                  )
                                                }
                                              >
                                                <Power className="h-3.5 w-3.5" />
                                              </Button>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Sheet
        open={!!target}
        onClose={() => setTarget(null)}
        title={
          target
            ? `${target.mode === "create" ? "New" : "Edit"} ${target.level === "subcategory" ? "sub-category" : target.level}`
            : undefined
        }
      >
        {target?.level === "category" && (
          <CategoryForm
            initial={target.mode === "edit" ? target.item : undefined}
            onDone={() => {
              setTarget(null);
              req.reload();
            }}
          />
        )}
        {target?.level === "subcategory" && (
          <SubCategoryForm
            categoryId={
              target.mode === "create" ? target.categoryId : target.item.categoryId
            }
            initial={target.mode === "edit" ? target.item : undefined}
            onDone={() => {
              setTarget(null);
              req.reload();
            }}
          />
        )}
        {target?.level === "service" && (
          <ServiceForm
            subCategoryId={
              target.mode === "create"
                ? target.subCategoryId
                : target.item.subCategoryId
            }
            initial={target.mode === "edit" ? target.item : undefined}
            onDone={() => {
              setTarget(null);
              req.reload();
            }}
          />
        )}
      </Sheet>
    </div>
  );
}

// ── Category form ────────────────────────────────

function CategoryForm({
  initial,
  onDone,
}: {
  initial?: AdminCategoryRow;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [nameNp, setNameNp] = useState(initial?.nameNp ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !nameNp.trim() || !slug.trim()) {
      setError("Name, Nepali name and slug are required.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        nameNp: nameNp.trim(),
        slug: slug.trim(),
        icon: icon.trim() || undefined,
        description: description.trim() || undefined,
      };
      if (initial) await api.adminUpdateCategory(initial.id, body);
      else await api.adminCreateCategory(body);
      toast(initial ? "Category updated." : "Category created.", "success");
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="cat-name">Name (English)</Label>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="Plumbing"
        />
      </div>
      <div>
        <Label htmlFor="cat-name-np">Name (Nepali)</Label>
        <Input
          id="cat-name-np"
          value={nameNp}
          onChange={(e) => setNameNp(e.target.value)}
          placeholder="प्लम्बिङ्"
        />
      </div>
      <div>
        <Label htmlFor="cat-slug">Slug</Label>
        <Input
          id="cat-slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          placeholder="plumbing"
        />
      </div>
      <div>
        <Label htmlFor="cat-icon">Icon (optional)</Label>
        <Input
          id="cat-icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="lucide icon name, e.g. wrench"
        />
      </div>
      <div>
        <Label htmlFor="cat-desc">Description (optional)</Label>
        <Textarea
          id="cat-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Shown on the category page."
        />
      </div>
      <FieldError>{error}</FieldError>
      <Button type="submit" full disabled={saving}>
        {saving ? "Saving…" : initial ? "Save changes" : "Create category"}
      </Button>
    </form>
  );
}

// ── Sub-category form ────────────────────────────

function SubCategoryForm({
  categoryId,
  initial,
  onDone,
}: {
  categoryId: string;
  initial?: AdminSubCategoryRow;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [nameNp, setNameNp] = useState(initial?.nameNp ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !nameNp.trim() || !slug.trim()) {
      setError("Name, Nepali name and slug are required.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        nameNp: nameNp.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      };
      if (initial) await api.adminUpdateSubCategory(initial.id, body);
      else await api.adminCreateSubCategory({ categoryId, ...body });
      toast(initial ? "Sub-category updated." : "Sub-category created.", "success");
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="sub-name">Name (English)</Label>
        <Input
          id="sub-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="Pipe work"
        />
      </div>
      <div>
        <Label htmlFor="sub-name-np">Name (Nepali)</Label>
        <Input
          id="sub-name-np"
          value={nameNp}
          onChange={(e) => setNameNp(e.target.value)}
          placeholder="पाइप कार्य"
        />
      </div>
      <div>
        <Label htmlFor="sub-slug">Slug</Label>
        <Input
          id="sub-slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          placeholder="pipe-work"
        />
      </div>
      <div>
        <Label htmlFor="sub-desc">Description (optional)</Label>
        <Textarea
          id="sub-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <FieldError>{error}</FieldError>
      <Button type="submit" full disabled={saving}>
        {saving ? "Saving…" : initial ? "Save changes" : "Create sub-category"}
      </Button>
    </form>
  );
}

// ── Service form ───────────────────────────────

const PRICING_TYPES = [
  { value: "fixed", label: "Fixed" },
  { value: "range", label: "Range" },
  { value: "quote", label: "Quote" },
] as const;

function ServiceForm({
  subCategoryId,
  initial,
  onDone,
}: {
  subCategoryId: string;
  initial?: AdminServiceRow;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [nameNp, setNameNp] = useState(initial?.nameNp ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [pricingType, setPricingType] = useState<"fixed" | "range" | "quote">(
    initial?.pricingType ?? "fixed"
  );
  const [priceFixed, setPriceFixed] = useState(
    initial?.priceFixed?.toString() ?? ""
  );
  const [priceMin, setPriceMin] = useState(initial?.priceMin?.toString() ?? "");
  const [priceMax, setPriceMax] = useState(initial?.priceMax?.toString() ?? "");
  const [priceUnit, setPriceUnit] = useState(initial?.priceUnit ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !nameNp.trim() || !slug.trim()) {
      setError("Name, Nepali name and slug are required.");
      return;
    }
    if (pricingType === "fixed" && !priceFixed) {
      setError("Enter a fixed price.");
      return;
    }
    if (pricingType === "range" && (!priceMin || !priceMax)) {
      setError("Enter both a minimum and maximum price.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        nameNp: nameNp.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        pricingType,
        priceFixed: pricingType === "fixed" ? Number(priceFixed) : undefined,
        priceMin: pricingType === "range" ? Number(priceMin) : undefined,
        priceMax: pricingType === "range" ? Number(priceMax) : undefined,
        priceUnit: priceUnit.trim() || undefined,
      };
      if (initial) await api.adminUpdateService(initial.id, body);
      else await api.adminCreateService({ subCategoryId, ...body });
      toast(initial ? "Service updated." : "Service created.", "success");
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="svc-name">Name (English)</Label>
        <Input
          id="svc-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="Fix leaking pipe"
        />
      </div>
      <div>
        <Label htmlFor="svc-name-np">Name (Nepali)</Label>
        <Input
          id="svc-name-np"
          value={nameNp}
          onChange={(e) => setNameNp(e.target.value)}
          placeholder="चुहिने पाइप मर्मत"
        />
      </div>
      <div>
        <Label htmlFor="svc-slug">Slug</Label>
        <Input
          id="svc-slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          placeholder="fix-leaking-pipe"
        />
      </div>

      <div>
        <Label>Pricing</Label>
        <div className="flex gap-2">
          {PRICING_TYPES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPricingType(p.value)}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium",
                pricingType === p.value
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {pricingType === "fixed" && (
        <div>
          <Label htmlFor="svc-price-fixed">Price (NPR)</Label>
          <Input
            id="svc-price-fixed"
            type="number"
            min={0}
            value={priceFixed}
            onChange={(e) => setPriceFixed(e.target.value)}
            placeholder="500"
          />
        </div>
      )}
      {pricingType === "range" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="svc-price-min">Min (NPR)</Label>
            <Input
              id="svc-price-min"
              type="number"
              min={0}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="500"
            />
          </div>
          <div>
            <Label htmlFor="svc-price-max">Max (NPR)</Label>
            <Input
              id="svc-price-max"
              type="number"
              min={0}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="1500"
            />
          </div>
        </div>
      )}
      {pricingType !== "quote" && (
        <div>
          <Label htmlFor="svc-price-unit">Unit (optional)</Label>
          <Input
            id="svc-price-unit"
            value={priceUnit}
            onChange={(e) => setPriceUnit(e.target.value)}
            placeholder="per visit"
          />
        </div>
      )}

      <div>
        <Label htmlFor="svc-desc">Description (optional)</Label>
        <Textarea
          id="svc-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {initial && (
        <p className="text-xs text-muted-foreground">
          Preview: {servicePrice({ ...initial, pricingType, priceFixed: Number(priceFixed) || null, priceMin: Number(priceMin) || null, priceMax: Number(priceMax) || null, priceUnit: priceUnit || null })}
        </p>
      )}

      <FieldError>{error}</FieldError>
      <Button type="submit" full disabled={saving}>
        {saving ? "Saving…" : initial ? "Save changes" : "Create service"}
      </Button>
    </form>
  );
}
