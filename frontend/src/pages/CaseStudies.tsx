import { useQuery } from "@tanstack/react-query";
import { Check, MapPin, Ruler, Timer } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Project } from "@/lib/types";
import { Container, PageHero, PrimaryLink, SectionHeading, SkeletonGrid, WhatsAppButton } from "@/components/Shared";
import { badgeVariants } from "@/components/ui/badge";

export default function CaseStudies() {
  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: () => apiGet<Project[]>("/projects") });

  return (
    <div>
      <PageHero
        overline="Case studies"
        title="Gurgaon landscapes we've built"
        description="Real transformations — with areas, timelines and honest budgets. Every one of these started with a photo upload or a site visit."
      />
      <Container className="py-16">
        <SectionHeading overline="Recent work" title="From dead balconies to green retreats" />
        <div className="mt-10 grid gap-8">
          {(projects ?? []).map((p, i) => (
            <article
              key={p.id}
              data-testid={`case-study-card-${p.id}`}
              className={`grid overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-2 ${i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}
            >
              <div className="min-h-64 overflow-hidden">
                <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-7 sm:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={badgeVariants({ variant: "secondary" })}>{p.category}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5 text-primary" /> {p.location}</span>
                </div>
                <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground">{p.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{p.summary}</p>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-muted p-3">
                    <Ruler className="mx-auto size-4 text-primary" />
                    <p className="mt-1.5 text-sm font-semibold text-foreground">{p.area}</p>
                    <p className="text-[11px] text-muted-foreground">Area</p>
                  </div>
                  <div className="rounded-xl bg-muted p-3">
                    <Timer className="mx-auto size-4 text-primary" />
                    <p className="mt-1.5 text-sm font-semibold text-foreground">{p.duration}</p>
                    <p className="text-[11px] text-muted-foreground">Build time</p>
                  </div>
                  <div className="rounded-xl bg-muted p-3">
                    <p className="mt-0.5 font-heading text-sm font-semibold text-foreground">{p.budget_band}</p>
                    <p className="text-[11px] text-muted-foreground">Budget</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-2">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {h}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
          {!projects ? <SkeletonGrid count={2} /> : null}
        </div>

        <div className="mt-14 rounded-3xl bg-secondary p-8 text-center sm:p-12">
          <SectionHeading
            center
            overline="Your space next"
            title="Every project starts with a photo"
            description="Upload a picture of your balcony, terrace or garden — get three AI concepts with budgets in minutes."
          />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <PrimaryLink to="/ai-landscape-designer" size="lg" testid="case-studies-ai-cta">Try the AI designer</PrimaryLink>
            <WhatsAppButton text="Hi AJ Harvest Team, I saw your case studies and want something similar." testid="case-studies-whatsapp" size="lg" variant="outline">
              WhatsApp us
            </WhatsAppButton>
          </div>
        </div>
      </Container>
    </div>
  );
}
