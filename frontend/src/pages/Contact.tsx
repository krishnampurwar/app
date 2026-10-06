import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container, PageHero, SectionHeading } from "@/components/Shared";
import { Card, CardContent } from "@/components/ui/card";
import { badgeVariants } from "@/components/ui/badge";
import LeadForm from "@/components/LeadForm";
import { WA, WHATSAPP_DISPLAY } from "@/lib/whatsapp";

const AREAS = [
  "DLF Phases 1-5", "Golf Course Road", "Golf Course Ext. Road", "Sohna Road", "South City 1 & 2",
  "Nirvana Country", "New Gurgaon (82-95)", "Sector 14 / 29", "Manesar", "NH-48 Farmhouses",
];

export default function Contact() {
  return (
    <div>
      <PageHero
        overline="Visit · Call · WhatsApp"
        title="Come, walk the nursery"
        description="Touch the plants before you commit. Open every day — and on WhatsApp within minutes, always."
      />
      <Container className="grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionHeading overline="Consultation" title="Tell us about your space" description="Free audit, honest advice, no pressure. We reply within a few hours." />
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <LeadForm source="contact" interest="Contact / consultation" submitLabel="Request a callback" testid="contact-lead" />
          </div>
        </div>

        <aside className="space-y-5">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <a href="tel:+919336239079" data-testid="contact-call-card" className="flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-secondary">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Phone className="size-5" /></span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Call the nursery</span>
                    <span className="block text-sm text-muted-foreground">{WHATSAPP_DISPLAY}</span>
                  </span>
                </a>
                <a href={WA.general} target="_blank" rel="noreferrer" data-testid="contact-whatsapp-card" className="flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-secondary">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><MessageCircle className="size-5" /></span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">WhatsApp us</span>
                    <span className="block text-sm text-muted-foreground">Stock checks, quotes, plant photos — fastest route</span>
                  </span>
                </a>
                <div className="flex items-start gap-4 rounded-xl p-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><MapPin className="size-5" /></span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">The nursery — Gurgaon</span>
                    <span className="block text-sm text-muted-foreground">Serving every sector; WhatsApp for today's directions & stock</span>
                  </span>
                </div>
                <div className="flex items-start gap-4 rounded-xl p-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Clock className="size-5" /></span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Open daily</span>
                    <span className="block text-sm text-muted-foreground">9:00 AM – 7:00 PM, all seven days</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">Areas we serve</h3>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {AREAS.map((a) => (
                  <span key={a} className={badgeVariants({ variant: "secondary" }) + " text-[11px]"}>{a}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </Container>
    </div>
  );
}
