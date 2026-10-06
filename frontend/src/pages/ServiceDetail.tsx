import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, ChevronDown, ClipboardCheck, MessageCircle, Sparkles } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Service } from "@/lib/types";
import { Container, ErrorState, PrimaryLink, SectionHeading, WhatsAppButton, rupees } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ServiceDetail() {
  const { slug } = useParams();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { data: service, error } = useQuery({
    queryKey: ["service", slug],
    queryFn: () => apiGet<Service>(`/services/${slug}`),
  });

  if (error) {
    return (
      <Container className="py-24">
        <ErrorState title="We couldn't find that service." detail="Browse all eight services instead — or WhatsApp us what you need." />
        <div className="mt-6 text-center">
          <PrimaryLink to="/services" variant="outline" testid="service-back-link">All services</PrimaryLink>
        </div>
      </Container>
    );
  }

  if (!service) return null;

  return (
    <div>
      <section className="relative overflow-hidden bg-[#0d1b13]">
        <img src={service.hero_image} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b13]/85 via-[#0d1b13]/70 to-[#0d1b13]/95" />
        <Container className="relative py-16 sm:py-24">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-[#8ed6b1]">Services · Gurgaon</p>
          <h1 className="mt-3 max-w-3xl font-heading text-4xl font-semibold leading-[1.12] tracking-tight text-[#f7faf8] sm:text-5xl">
            {service.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#c2d4c9] sm:text-lg">{service.short}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <WhatsAppButton
              text={`Hi AJ Harvest Team, I'm interested in ${service.name} in Gurgaon. Please share a quote.`}
              testid="service-whatsapp-cta"
              variant="outline"
              size="lg"
              className="border-[#8ed6b1]/40 text-[#8ed6b1] hover:bg-[#8ed6b1]/10 hover:text-[#8ed6b1]"
            >
              <MessageCircle className="size-4" /> WhatsApp about {service.name}
            </WhatsAppButton>
            <PrimaryLink to="/ai-landscape-designer" size="lg" testid="service-ai-designer-cta" className="gap-2">
              <Sparkles className="size-4" /> Try the AI designer
            </PrimaryLink>
            <span className="font-mono text-xs uppercase tracking-widest text-[#a2b8aa]">From {rupees(service.price_from)}</span>
          </div>
        </Container>
      </section>

      <Container className="grid gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <SectionHeading overline="The craft" title={`Why ${service.name.toLowerCase()} works differently in Gurgaon`} />
          <div className="mt-6 space-y-4">
            {service.description.map((para, i) => (
              <p key={i} className="text-base leading-relaxed text-muted-foreground">{para}</p>
            ))}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {service.features.map((f) => (
              <div key={f} className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4" data-testid="service-feature-item">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{f}</span>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <SectionHeading overline="How it runs" title="From first visit to thriving garden" />
            <ol className="mt-8 space-y-0">
              {service.process.map((step, i) => (
                <li key={step.title} className="relative flex gap-5 pb-8 last:pb-0" data-testid="service-process-step">
                  {i < service.process.length - 1 ? <span className="absolute left-5 top-10 h-full w-px bg-border" aria-hidden /> : null}
                  <span className="z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12">
            <SectionHeading overline="Good to know" title="Frequently asked" />
            <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
              {service.faqs.map((faq, i) => (
                <div key={i}>
                  <button
                    type="button"
                    data-testid={`service-faq-toggle-${i}`}
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
          <Card>
            <CardContent className="p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">By the numbers</p>
              <dl className="mt-4 space-y-4">
                {service.stats.map((s) => (
                  <div key={s.label} className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <dt className="text-sm text-muted-foreground">{s.label}</dt>
                    <dd className="font-heading text-xl font-semibold text-foreground">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card className="bg-secondary">
            <CardContent className="p-6">
              <ClipboardCheck className="size-6 text-primary" />
              <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">Prefer to talk it through?</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Book a free site audit — a horticulturist visits, measures light and water, and leaves you a plan.
              </p>
              <WhatsAppButton
                text={`Hi AJ Harvest Team, please book a free site audit for ${service.name} in Gurgaon.`}
                testid="service-side-audit-cta"
                variant="default"
                className="mt-4 w-full justify-center"
              >
                Book free audit
              </WhatsAppButton>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">Explore more</h3>
              <div className="mt-3 space-y-2">
                <Link to="/maintenance" data-testid="service-link-maintenance" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary">
                  Maintenance plans <ArrowRight className="size-4 text-primary" />
                </Link>
                <Link to="/locations" data-testid="service-link-locations" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary">
                  Your area in Gurgaon <ArrowRight className="size-4 text-primary" />
                </Link>
                <Link to="/shop" data-testid="service-link-shop" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary">
                  Plants & pots shop <ArrowRight className="size-4 text-primary" />
                </Link>
              </div>
              <Button variant="link" render={<Link to="/case-studies" />} className="mt-2 px-3" data-testid="service-link-projects">
                See recent projects →
              </Button>
            </CardContent>
          </Card>
        </aside>
      </Container>
    </div>
  );
}
