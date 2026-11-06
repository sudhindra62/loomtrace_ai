import type { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { LifecycleTimeline } from "@/components/marketing/LifecycleTimeline";
import { TestimonialSection } from "@/components/marketing/TestimonialSection";
import { CTASection } from "@/components/marketing/CTASection";

export const metadata: Metadata = {
  title: "LoomTrace AI — Digital Identity & Market Access for Indian Handlooms",
  description:
    "National digital infrastructure verifying authentic Indian handloom products, connecting weavers to real markets, and giving policymakers real-time visibility into the handloom economy.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <LifecycleTimeline />
      <TestimonialSection />
      <CTASection />
    </>
  );
}
