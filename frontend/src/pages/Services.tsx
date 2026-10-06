import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { getServices } from "@/lib/content";
import type { Service } from "@/lib/types";
import { Container, PageHero, SectionHeading, SkeletonGrid, WhatsAppButton, rupees } from "@/components/Shared";
import { HERO_IMAGE } from "@/pages/imagePool";

export default function Services() {
  const { data: services } = useQuery({ queryKey: ["services"], queryFn: getServices });

  return (
    <div>
      <PageHero
        overline="Services"
        title="Everything a garden needs — designed, built, planted, maintained"
        description="Eight specialised teams covering Gurgaon: from a ₹299 tulsi pot to a ₹9L farmhouse estate."
        image={HERO_IMAGE}
      >
        <WhatsAppButton text="Hi AJ Harvest Team, I want a garden landscape consultation." testid="services-hero-whatsapp">
          Get a consultation
        </WhatsAppButton>
      </PageHero>

      <Container className="py-16">
        <SectionHeading overline="Pick your craft" title="Our service pillars" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(services ?? []).map((s) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}`}
              data-testid={`services-page-card-${s.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/10"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img src={s.hero_image} alt={s.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-heading text-xl font-semibold text-foreground">{s.name}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.short}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-primary">From {rupees(s.price_from)}</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-primary">
                    Explore <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {!services ? <SkeletonGrid count={6} className="sm:col-span-2 lg:col-span-3" /> : null}
        </div>
      </Container>
    </div>
  );
}
