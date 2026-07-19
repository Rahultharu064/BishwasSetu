import type { Metadata } from "next";
import ServicesBrowse from "./services-browse";

export const metadata: Metadata = {
  title: "Browse services — BishwasSetu",
  description: "Browse verified, trust-scored home service providers by category across Kathmandu Valley.",
};

export default function ServicesPage() {
  return <ServicesBrowse />;
}
