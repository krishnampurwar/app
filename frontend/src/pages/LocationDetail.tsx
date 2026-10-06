import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ClipboardList, MessageCircle, Sparkles, Sun, Sprout, Wind } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { LocationPage } from "@/lib/types";
import { Container, ErrorState, PrimaryLink, SectionHeading, WhatsAppButton } from "@/components/Shared";
import { Card, CardContent } from "@/components/ui/card";
import { badgeVariants } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function LocationDetail() {
  const { slug } = useParams();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { data: loc, error } = useQuery({
    queryKey: ["location", slug],
    queryFn: () => apiGet<LocationPage>(`/locations/${slug}`),
  });
  const { data: all } = useQuery({ queryKey: ["locations"], queryFn: () => apiGet<LocationPage[]>("/locations") });

  if (error) {
    return (
      <Container className="py-24">
        <ErrorState title="We couldn't find that area." detail="See all Gurgaon areas we serve instead." />
        <div className="mt-6 text-center">
          <PrimaryLink to="/locations" variant="outline" testid="location-back-link">All areas</PrimaryLink>
        </div>
      </Container>
    );
  }
  if (!loc) return null;

  const others = (all ?? []).filter((l) => l.slug !== loc.slug);

  return (
    <div>
      <section className="relative overflow-hidden bg-[#0d1b13]">
        <img src={loc.image_url} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b13]/85 via-[#0d1b13]/70 to-[#0d1b13]/95" />
        <Container className="relative py-16 sm:py-20">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-[#8ed6b1]">
            Nursery & Landscaping · {loc.region}
          </p>
          <h1 className="mt-3 max-w-3xl font-heading text-4xl font-semibold leading-[1.12] tracking-tight text-[#f7faf8] sm:text-5xl">
            {loc.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#c2d4c9] sm:text-lg">{loc.intro}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <WhatsAppButton
              text={`Hi AJ Nursery Team, I'm in ${loc.name}, Gurgaon and want help with my garden. Can we talk?`}
              testid="location-whatsapp-cta"
              variant="outline"
              size="lg"
              className="border-[#8ed6b1]/40 text-[#8ed6b1] hover:bg-[#8ed6b1]/10 hover:text-[#8ed6b1]"
            >
              <MessageCircle className="size-4" /> WhatsApp about {loc.name}
            </WhatsAppButton>
            <PrimaryLink to="/ai-proposal-generator" size="lg" testid="location-proposal-cta" className="gap-2">
              <ClipboardList className="size-4" /> Get an instant proposal
            </PrimaryLink>
          </div>
        </Container>
      </section>

      <Container className="grid gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <Sun className="size-6 text-primary" />
                <h2 className="mt-3 font-heading text-lg font-semibold text-foreground">Microclimate</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{loc.microclimate}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Sprout className="size-6 text-primary" />
                <h2 className="mt-3 font-heading text-lg font-semibold text-foreground">Soil & water</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{loc.soil_note}</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10">
            <SectionHeading overline="What works here" title={`Plants that thrive in ${loc.name}`} />
            <div className="mt-5 flex flex-wrap gap-2">
              {loc.best_plants.map((p) => (
                <span key={p} className={badgeVariants({ variant: "secondary" }) + " px-3 py-1.5 text-sm"} data-testid="location-plant-chip">{p}</span>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <SectionHeading overline="Popular here" title="What your neighbours book most" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {loc.popular_services.map((ps) => (
                <Link
                  key={ps}
                  to="/services"
                  data-testid="location-service-link"
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-4 text-sm text-foreground transition-colors hover:border-primary/40"
                >
                  <Wind className="size-4 shrink-0 text-primary" /> {ps}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <SectionHeading overline="Good to know" title={`${loc.name} garden FAQs`} />
            <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
              {loc.faqs.map((faq, i) => (
                <div key={i}>
                  <button
                    type="button"
                    data-testid={`location-faq-toggle-${i}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="text-sm font-medium text-foreground">{faq.q}</span>
                    <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", openFaq === i && "rotate-180")} />
                  </button>
                  {openFaq === i ? <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="bg-secondary">
            <CardContent className="p-6">
              <Sparkles className="size-6 text-primary" />
              <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">Free AI concept for {loc.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Upload a photo of your space here and get three design directions with honest INR budgets — before
                anyone visits.
              </p>
              <PrimaryLink to="/ai-landscape-designer" testid="location-side-designer-cta" className="mt-4 w-full justify-center">
                Upload your space
              </PrimaryLink>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">Localities we cover</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {loc.neighborhoods.map((n) => (
                  <span key={n} className={badgeVariants({ variant: "outline" }) + " text-[11px]"}>{n}</span>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">Nearby areas</h3>
              <div className="mt-3 space-y-1.5">
                {others.slice(0, 6).map((o) => (
                  <Link
                    key={o.slug}
                    to={`/locations/${o.slug}`}
                    data-testid="location-nearby-link"
                    className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary"
                  >
                    {o.name}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </Container>
    </div>
  );
}
