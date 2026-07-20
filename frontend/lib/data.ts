import {
  Bug,
  Hammer,
  PaintRoller,
  Plug,
  Refrigerator,
  SprayCan,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type Tier = 1 | 2 | 3;

export type Category = {
  slug: string;
  label: string;
  labelNe: string;
  icon: LucideIcon;
};

export const categories: Category[] = [
  { slug: "plumbing", label: "Plumber", labelNe: "प्लम्बर", icon: Wrench },
  { slug: "electrical", label: "Electrician", labelNe: "बिजुली मिस्त्री", icon: Plug },
  { slug: "cleaning", label: "Cleaner", labelNe: "सरसफाई", icon: SprayCan },
  { slug: "painting", label: "Painter", labelNe: "रंगरोगन", icon: PaintRoller },
  { slug: "carpentry", label: "Carpenter", labelNe: "सिकर्मी", icon: Hammer },
  { slug: "ac-repair", label: "AC Repair", labelNe: "एसी मर्मत", icon: Wind },
  { slug: "appliance", label: "Appliance", labelNe: "उपकरण मर्मत", icon: Refrigerator },
  { slug: "pest-control", label: "Pest Control", labelNe: "किरा नियन्त्रण", icon: Bug },
];

export type Provider = {
  id: string;
  name: string;
  initials: string;
  category: string;
  tier: Tier;
  experienceBadge: "new" | "experienced" | "expert";
  trustScore: number;
  reviewCount: number;
  neighborhood: string;
  jobsThisMonth: number;
  priceFrom: number;
  fastResponder?: boolean;
};

export const featuredProviders: Provider[] = [
  {
    id: "p1",
    name: "Bikash Tamang",
    initials: "BT",
    category: "Electrician",
    tier: 3,
    experienceBadge: "expert",
    trustScore: 92,
    reviewCount: 214,
    neighborhood: "Maharajgunj",
    jobsThisMonth: 7,
    priceFrom: 500,
    fastResponder: true,
  },
  {
    id: "p2",
    name: "Sunita Gurung",
    initials: "SG",
    category: "House Cleaning",
    tier: 3,
    experienceBadge: "experienced",
    trustScore: 87,
    reviewCount: 156,
    neighborhood: "Baneshwor",
    jobsThisMonth: 11,
    priceFrom: 800,
  },
  {
    id: "p3",
    name: "Ramesh Shrestha",
    initials: "RS",
    category: "Plumber",
    tier: 2,
    experienceBadge: "experienced",
    trustScore: 78,
    reviewCount: 89,
    neighborhood: "Patan",
    jobsThisMonth: 5,
    priceFrom: 600,
    fastResponder: true,
  },
  {
    id: "p4",
    name: "Kabita Rai",
    initials: "KR",
    category: "Painter",
    tier: 2,
    experienceBadge: "new",
    trustScore: 71,
    reviewCount: 23,
    neighborhood: "Kirtipur",
    jobsThisMonth: 3,
    priceFrom: 450,
  },
];
