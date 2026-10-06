import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Camera, MessageCircle, Repeat, ShieldCheck } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Plan } from "@/lib/types";
import { Container, PageHero, SectionHeading, SkeletonGrid, WhatsAppButton, rupees } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import LeadForm from "@/components/LeadForm";
import { Check } from "lucide-react";

const PROMISES = [
  { icon: CalendarCheck, title: "Named lead gardener", detail: "The same trained crew every visit — they know your garden's history." },
  { icon: Camera, title: "Photo report, every visit", detail: "A 22-point health check with photos, sent on WhatsApp the same day." },
  { icon: Repeat, title: "Free plant replacement", detail: "Plants under the plan's guarantee window are replaced at no cost." },
  { icon: ShieldCheck, title: "No lock-in on Basic", detail: "Premium and Complete run on 3-month cycles with replanting credits." },
];

export default function Maintenance() {
  const { data: plans } = useQuery({ queryKey: ["plans"], queryFn: () => apiGet<Plan[]>("/plans") });
  const [plan, setPlan] = useState<Plan | null>(null);

  return (
    <div>
      <PageHero
        overline="Care & maintenance memberships"
        title="A garden is a habit, not a project"
        description="Gurgaon's heat, hard water and monsoon washouts end gardens that nobody tends. Our crews keep yours photo-ready — with guaranteed replacement and reports you can actually read."
      />

      <Container className="py-16">
        <SectionHeading overline="Memberships" title="Pick your cadence" description="Every plan starts with a free garden audit. Cancel Basic anytime." />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {(plans ?? []).map((pl) => (
            <Card
              key={pl.id}
              data-testid={`maintenance-plan-card-${pl.slug}`}
              className={pl.popular ? "relative border-primary/50 shadow-lg shadow-emerald-900/10" : "relative"}
            >
              {pl.popular ? (
                <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground">Most popular</Badge>
              ) : null}
              <CardContent className="p-7">
                <h2 className="font-heading text-2xl font-semibold text-foreground">{pl.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{pl.tagline}</p>
                <p className="mt-5 font-heading text-4xl font-semibold text-foreground">
                  {rupees(pl.price)}
                  <span className="ml-2 font-sans text-sm font-normal text-muted-foreground">{pl.cadence}</span>
                </p>
                <ul className="mt-6 space-y-2.5">
                  {pl.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex flex-col gap-2">
                  <Button data-testid={`maintenance-subscribe-${pl.slug}`} onClick={() => setPlan(pl)}>
                    Subscribe to {pl.name}
                  </Button>
                  <WhatsAppButton
                    text={`Hi AJ Harvest Team, I want to know more about the ${pl.name} maintenance plan (${rupees(pl.price)} ${pl.cadence}).`}
                    testid={`maintenance-whatsapp-${pl.slug}`}
                    variant="outline"
                  >
                    Ask on WhatsApp
                  </WhatsAppButton>
                </div>
              </CardContent>
            </Card>
          ))}
          {!plans ? <SkeletonGrid count={3} className="lg:col-span-3" /> : null}
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6" data-testid="maintenance-promise-card">
              <p.icon className="size-6 text-primary" />
              <h3 className="mt-3 font-heading text-base font-semibold text-foreground">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-[#0d1b13] p-8 text-[#f4f7f4] sm:p-12">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#8ed6b1]">Seasonal rhythm</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold">What we do through the Gurgaon year</h2>
            <div className="mt-6 grid gap-4 text-sm text-[#c2d4c9] sm:grid-cols-2">
              <p><strong className="text-[#f4f7f4]">Jan–Feb:</strong> winter pruning, lawn renovation, seasonal flower beds.</p>
              <p><strong className="text-[#f4f7f4]">Mar–Jun:</strong> heat-proofing, mulching, drip tuning, shade sails.</p>
              <p><strong className="text-[#f4f7f4]">Jul–Sep:</strong> monsoon drainage, fungus control, plantation drives.</p>
              <p><strong className="text-[#f4f7f4]">Oct–Dec:</strong> rejuvenation, winter flowers, corporate festive styling.</p>
            </div>
          </div>
        </div>
      </Container>

      <Dialog open={!!plan} onOpenChange={(o) => !o && setPlan(null)}>
        <DialogContent className="max-w-md" data-testid="maintenance-subscribe-dialog">
          {plan ? (
            <div>
              <DialogTitle className="font-heading text-2xl font-semibold">Subscribe — {plan.name}</DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {rupees(plan.price)} {plan.cadence}. We'll call to schedule your free garden audit.
              </p>
              <div className="mt-5">
                <LeadForm
                  source="maintenance"
                  interest={`${plan.name} maintenance plan`}
                  message={`I want the ${plan.name} plan (${rupees(plan.price)} ${plan.cadence}).`}
                  testid="maintenance-lead"
                  submitLabel="Subscribe & book audit"
                  onSuccess={() => setPlan(null)}
                />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
