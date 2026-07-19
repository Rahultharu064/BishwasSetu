import type { Metadata } from "next";
import CategoryClient from "./category-client";
import { ServiceApi } from "@/lib/endpoints";

interface CategoryDetail {
  name: string;
  description?: string | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = (await ServiceApi.category(slug)) as CategoryDetail;
    const title = `${category.name} — BishwasSetu`;
    const description = category.description ?? `Browse verified, trust-scored ${category.name.toLowerCase()} providers on BishwasSetu.`;
    return { title, description, openGraph: { title, description } };
  } catch {
    return { title: "Browse services — BishwasSetu" };
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryClient slug={slug} />;
}
