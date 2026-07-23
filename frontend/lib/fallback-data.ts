import type { Category } from "./types";

// Canonical Nepal home-service categories (ux.md §5.1 category grid).
// Used as graceful fallback content when the catalog API is unavailable,
// so the marketplace shell always renders (P4 — works on 3G / degraded paths).
export const FALLBACK_CATEGORIES: Category[] = [
  { id: "f-plumbing", name: "Plumbing", nameNp: "प्लम्बिङ", slug: "plumbing", icon: "plumbing", _count: { providers: 128 } },
  { id: "f-electrical", name: "Electrical", nameNp: "इलेक्ट्रिकल", slug: "electrical", icon: "electrical", _count: { providers: 96 } },
  { id: "f-cleaning", name: "Cleaning", nameNp: "सफाई", slug: "cleaning", icon: "cleaning", _count: { providers: 210 } },
  { id: "f-painting", name: "Painting", nameNp: "रङरोगन", slug: "painting", icon: "painting", _count: { providers: 54 } },
  { id: "f-carpentry", name: "Carpentry", nameNp: "काठको काम", slug: "carpentry", icon: "carpentry", _count: { providers: 61 } },
  { id: "f-appliance", name: "Appliance Repair", nameNp: "उपकरण मर्मत", slug: "appliance-repair", icon: "appliance", _count: { providers: 43 } },
  { id: "f-ac", name: "AC & Cooling", nameNp: "एसी तथा कूलिङ", slug: "ac-cooling", icon: "ac", _count: { providers: 38 } },
  { id: "f-pest", name: "Pest Control", nameNp: "किरा नियन्त्रण", slug: "pest-control", icon: "pest", _count: { providers: 22 } },
];
