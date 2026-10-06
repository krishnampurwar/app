import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BellRing, Inbox, MailCheck, ShieldCheck, Zap } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { LeadDestination } from "@/lib/types";
import { Container, PageHero, PrimaryLink, SectionHeading, WhatsAppButton } from "@/components/Shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const SOURCES = [
  { label: "Contact form", detail: "Contact page callback requests" },
  { label: "Maintenance plan signup", detail: "Basic / Premium / Complete subscriptions" },
  { label: "AI Landscape Designer", detail: "Space photo + 3 concepts generated" },
  { label: "AI Garden Visualizer", detail: "Rendered garden previews" },
  { label: "AI Plant Doctor", detail: "Plant diagnosis + ₹499 visit bookings" },
  { label: "Plant Match Quiz", detail: "Quiz completions with plant picks" },
  { label: "AI Proposal Generator", detail: "Proposal drafts + survey requests" },
  { label: "Ask AJ consultant", detail: "Nursery visit bookings from the chat" },
];

export default function Admin() {
  const { data: destination } = useQuery({
    queryKey: ["lead-destination"],
    queryFn: () => apiGet<LeadDestination>("/leads/destination"),
  });

  return (
    <div>
      <PageHero
        overline="Operations"
        title="Your leads come to your inbox"
        description="This site runs without a database — nothing is stored on the server. The moment someone submits any form or uses any AI tool, their details are emailed straight to you."
      />

      <Container className="py-14">
        <Card className="border-primary/40 bg-secondary" data-testid="admin-destination-card">
          <CardContent className="p-7 sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MailCheck className="size-6" />
                </span>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Lead delivery address</p>
                <p className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl" data-testid="admin-lead-email">
                  {destination?.email ?? "loading…"}
                </p>
              </div>
              <Badge
                variant={destination?.configured ? "default" : "outline"}
                className="mt-2"
                data-testid="admin-email-status"
              >
                {destination?.configured ? "Email delivery active" : "Email not configured"}
              </Badge>
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Every lead email carries the visitor's <strong className="text-foreground">name</strong>, their{" "}
              <strong className="text-foreground">phone number</strong> (tap to call) and{" "}
              <strong className="text-foreground">which tool they used</strong>, timestamped in IST. Reply or call
              straight from your inbox.
            </p>
          </CardContent>
        </Card>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            { icon: Zap, title: "Instant", detail: "Sent the second a form is submitted — no dashboard to check, nothing to log into." },
            { icon: ShieldCheck, title: "Nothing stored", detail: "No database, so no customer data sits on the server. Your inbox is the only record." },
            { icon: BellRing, title: "Every source", detail: "All 8 forms and AI tools route to the same inbox, each labelled by tool." },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-6" data-testid="admin-benefit-card">
              <c.icon className="size-5 text-primary" />
              <h3 className="mt-3 font-heading text-base font-semibold text-foreground">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <SectionHeading
            overline="Coverage"
            title="What triggers a lead email"
            description="Name and phone are compulsory on every one of these, so no enquiry arrives without a way to reach the customer."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {SOURCES.map((s) => (
              <div
                key={s.label}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                data-testid="admin-source-row"
              >
                <Inbox className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-3xl bg-[#0d1b13] p-8 text-[#f4f7f4] sm:p-12">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#8ed6b1]">Changing the address</p>
            <h2 className="mt-3 font-heading text-2xl font-semibold sm:text-3xl">Want leads sent somewhere else?</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#c2d4c9]">
              The destination is a single setting — <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">LEAD_EMAIL</code>{" "}
              in <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">backend/.env</code>. Change it to any
              address (or add a second one) and restart — no code changes needed.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryLink to="/contact" testid="admin-test-form-link" variant="outline" className="border-[#8ed6b1]/40 text-[#8ed6b1] hover:bg-[#8ed6b1]/10 hover:text-[#8ed6b1]">
                Send yourself a test lead
              </PrimaryLink>
              <WhatsAppButton
                text="Hi AJ team, I want to change where website leads are emailed."
                testid="admin-whatsapp-button"
                variant="default"
              >
                Ask for help
              </WhatsAppButton>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Looking for the website?{" "}
          <Link to="/" className="font-medium text-primary hover:underline" data-testid="admin-home-link">
            Back to the nursery
          </Link>
        </p>
      </Container>
    </div>
  );
}
