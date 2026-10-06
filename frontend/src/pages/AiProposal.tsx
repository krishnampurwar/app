import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarCheck, ClipboardList, Download, Loader2, MessageCircle } from "lucide-react";
import { apiPost } from "@/lib/api";
import type { Proposal } from "@/lib/types";
import { Container, PageHero, SectionHeading, WhatsAppButton } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import LeadForm from "@/components/LeadForm";
import { LOGO_URL } from "@/components/layout/Header";
import { rupees } from "@/lib/whatsapp";

const PROPERTY_TYPES = ["Balcony", "Terrace / Rooftop", "Villa Garden", "Farmhouse", "Corporate Office", "Café / Restaurant"];
const FEATURE_OPTIONS = ["Lawn", "Vertical garden", "Water feature", "Drip automation", "Lighting", "Fruit trees", "Seating deck", "Gazebo / Pergola"];
const BUDGETS = ["Under ₹50k", "₹50k – 1L", "₹1L – 3L", "₹3L – 5L", "₹5L – 10L", "₹10L+"];

export default function AiProposal() {
  const [propertyType, setPropertyType] = useState("Terrace / Rooftop");
  const [areaSqft, setAreaSqft] = useState("1200");
  const [location, setLocation] = useState("Gurgaon");
  const [features, setFeatures] = useState<string[]>(["Lawn", "Drip automation"]);
  const [budget, setBudget] = useState("₹1L – 3L");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [surveyOpen, setSurveyOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      apiPost<Proposal>("/ai/proposal", {
        property_type: propertyType,
        area_sqft: Number(areaSqft) || 0,
        location,
        features,
        budget_range: budget,
        notes,
        name,
        phone,
      }),
    onSuccess: (data) => {
      setProposal(data);
      toast.success("Proposal drafted — review, then print or share.");
    },
    onError: (e: Error) => toast.error(e.message || "Proposal failed. Please retry."),
  });

  const toggleFeature = (f: string) =>
    setFeatures((arr) => (arr.includes(f) ? arr.filter((x) => x !== f) : [...arr, f]));

  return (
    <div>
      <PageHero
        overline="AI Garden Suite — Tool 5"
        title="Instant AI landscape proposal"
        description="Describe the project in one line — a formal, itemised, phased proposal is drafted in under a minute, ready to print, share or survey."
      />

      <Container className="grid gap-10 py-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className={proposal ? "no-print" : ""} data-testid="proposal-form">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <SectionHeading overline="The brief" title="One form, one proposal" />
            <div className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Property type</Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger data-testid="proposal-property-select"><SelectValue>{propertyType}</SelectValue></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="proposal-area">Area (sq ft)</Label>
                  <Input id="proposal-area" data-testid="proposal-area-input" type="number" min={0} value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="proposal-location">Location</Label>
                  <Input id="proposal-location" data-testid="proposal-location-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Golf Course Road, Gurgaon" />
                </div>
                <div className="space-y-1.5">
                  <Label>Budget range</Label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger data-testid="proposal-budget-select"><SelectValue>{budget}</SelectValue></SelectTrigger>
                    <SelectContent>
                      {BUDGETS.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Desired features</Label>
                <div className="flex flex-wrap gap-2" data-testid="proposal-features">
                  {FEATURE_OPTIONS.map((f) => (
                    <label
                      key={f}
                      className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground transition-colors has-[:checked]:border-primary has-[:checked]:bg-secondary"
                    >
                      <Checkbox checked={features.includes(f)} onCheckedChange={() => toggleFeature(f)} data-testid={`proposal-feature-${f.toLowerCase().replaceAll(/[^a-z]+/g, "-")}`} />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proposal-notes">Notes for the designer (optional)</Label>
                <Textarea id="proposal-notes" data-testid="proposal-notes-input" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="We host family dinners; want evening ambience and privacy from neighbours…" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="proposal-name">Your name (optional)</Label>
                  <Input id="proposal-name" data-testid="proposal-name-input" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="proposal-phone">Phone (optional)</Label>
                  <Input id="proposal-phone" data-testid="proposal-phone-input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
                </div>
              </div>
              <Button size="lg" className="w-full gap-2" data-testid="proposal-generate-button" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                {mutation.isPending ? (<><Loader2 className="size-4 animate-spin" /> Drafting proposal…</>) : (<><ClipboardList className="size-4" /> Generate proposal</>)}
              </Button>
            </div>
          </div>
        </div>

        <div>
          {proposal ? (
            <div className="space-y-4" data-testid="proposal-result">
              <div className="no-print flex flex-wrap gap-2">
                <Button data-testid="proposal-print-button" className="gap-2" onClick={() => window.print()}>
                  <Download className="size-4" /> Print / Save as PDF
                </Button>
                <WhatsAppButton
                  text={`Hi AJ Harvest Team! You drafted proposal ${proposal.reference} (${proposal.title}, ${rupees(proposal.total_min)}–${rupees(proposal.total_max)}). Let's take it forward.`}
                  testid="proposal-share-whatsapp"
                  variant="outline"
                >
                  <MessageCircle className="size-4" /> Share on WhatsApp
                </WhatsAppButton>
                <Button variant="outline" data-testid="proposal-survey-button" className="gap-2" onClick={() => setSurveyOpen(true)}>
                  <CalendarCheck className="size-4" /> Request physical survey
                </Button>
              </div>

              {/* The printable document */}
              <article className="print-area rounded-2xl border border-border bg-white p-8 text-[#14261c] shadow-sm sm:p-12" data-testid="proposal-document">
                <header className="flex items-start justify-between gap-4 border-b-2 border-[#206d43] pb-6">
                  <div className="flex items-center gap-4">
                    <img src={LOGO_URL} alt="AJ Heaven's Harvest Nursery" className="h-16 w-auto" />
                    <div>
                      <p className="font-heading text-xl font-semibold">AJ Heaven's Harvest Nursery</p>
                      <p className="text-xs text-[#4e6155]">Nursery · Landscaping · Garden Care — Gurgaon</p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-[#4e6155]">
                    <p data-testid="proposal-reference">{proposal.reference}</p>
                    <p>{new Date(proposal.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </header>

                <h1 className="mt-8 font-heading text-3xl font-semibold leading-tight">{proposal.title}</h1>
                <p className="mt-4 text-sm leading-relaxed text-[#4e6155]">{proposal.executive_summary}</p>

                <section className="mt-8">
                  <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#206d43]">Scope of work</h2>
                  <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {proposal.scope.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-[#14261c]"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#206d43]" /> {s}</li>
                    ))}
                  </ul>
                </section>

                <section className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#206d43]">Botanical palette</h2>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {proposal.botanical_palette.map((p) => (
                        <span key={p} className="rounded-full bg-[#e8f5ec] px-2.5 py-1 text-[11px] text-[#164e2e]">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#206d43]">Hardscape palette</h2>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {proposal.hardscape_palette.map((p) => (
                        <span key={p} className="rounded-full bg-[#eef3ec] px-2.5 py-1 text-[11px] text-[#4e6155]">{p}</span>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="mt-8">
                  <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#206d43]">Phased timeline</h2>
                  <table className="mt-3 w-full text-sm">
                    <tbody>
                      {proposal.phases.map((ph, i) => (
                        <tr key={i} className="border-b border-[#dde6dc] last:border-0">
                          <td className="py-2.5 pr-4 font-medium">{ph.name}</td>
                          <td className="py-2.5 pr-4 whitespace-nowrap text-[#4e6155]">{ph.duration}</td>
                          <td className="py-2.5 text-[#4e6155]">{ph.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                <section className="mt-8">
                  <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#206d43]">Itemised estimate</h2>
                  <table className="mt-3 w-full text-sm">
                    <tbody>
                      {proposal.costs.map((c, i) => (
                        <tr key={i} className="border-b border-[#dde6dc] last:border-0">
                          <td className="py-2">{c.item}</td>
                          <td className="py-2 text-right font-medium whitespace-nowrap">{c.amount}</td>
                        </tr>
                      ))}
                      <tr className="bg-[#e8f5ec]">
                        <td className="py-3 pl-2 font-heading font-semibold">Indicative total</td>
                        <td className="py-3 pr-2 text-right font-heading font-semibold whitespace-nowrap" data-testid="proposal-total">
                          {rupees(proposal.total_min)} – {rupees(proposal.total_max)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-2 text-[11px] text-[#4e6155]">Indicative only; final BOQ follows the physical survey.</p>
                </section>

                <footer className="mt-8 grid gap-4 border-t border-[#dde6dc] pt-6 text-sm sm:grid-cols-2">
                  <p><span className="font-semibold">Warranty:</span> {proposal.warranty}</p>
                  <p><span className="font-semibold">Aftercare:</span> {proposal.maintenance_note}</p>
                </footer>
                <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-[#4e6155]">
                  Grown with patience · ajheavensharvest · +91 93362 39079
                </p>
              </article>
            </div>
          ) : (
            <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-10 text-center" data-testid="proposal-empty">
              <ClipboardList className="size-8 text-primary/60" />
              <p className="mt-4 font-heading text-lg font-semibold text-foreground">Your proposal will be drafted here</p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Executive summary, scope, plant palettes, phases, itemised INR estimate and warranty — printable on
                our letterhead.
              </p>
            </div>
          )}
        </div>
      </Container>

      <Dialog open={surveyOpen} onOpenChange={setSurveyOpen}>
        <DialogContent className="max-w-md" data-testid="proposal-survey-dialog">
          <DialogTitle className="font-heading text-2xl font-semibold">Request a physical survey</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {proposal ? `Referencing ${proposal.reference} — ` : ""}Our architect visits, measures and finalises the BOQ.
          </p>
          <div className="mt-5">
            <LeadForm
              source="proposal"
              interest={proposal ? `Physical survey for ${proposal.reference}` : "Physical survey"}
              message={proposal ? `Survey request for proposal ${proposal.reference}: ${proposal.title}` : "Survey request"}
              testid="proposal-survey-lead"
              submitLabel="Book the survey"
              onSuccess={() => setSurveyOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
