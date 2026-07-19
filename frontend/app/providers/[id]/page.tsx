import type { Metadata } from "next";
import ProviderProfileClient from "./provider-profile-client";
import { ProviderApi } from "@/lib/endpoints";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const { provider } = await ProviderApi.publicProfile(id);
    const title = `${provider.legalName} — BishwasSetu`;
    const description =
      provider.bio?.slice(0, 160) ??
      `Verified home service provider on BishwasSetu${provider.serviceArea ? ` in ${provider.serviceArea}` : ""}. Trust score ${Math.round(provider.trustScore)}.`;
    return {
      title,
      description,
      openGraph: { title, description },
    };
  } catch {
    return { title: "Provider — BishwasSetu" };
  }
}

export default async function ProviderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProviderProfileClient id={id} />;
}
