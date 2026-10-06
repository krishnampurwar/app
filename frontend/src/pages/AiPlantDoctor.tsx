import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarCheck, Loader2, ScanSearch, Stethoscope } from "lucide-react";
import { apiPost } from "@/lib/api";
import type { Diagnosis } from "@/lib/types";
import { Container, PageHero, SectionHeading, WhatsAppButton } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ImageDropzone from "@/components/ImageDropzone";
import LeadForm from "@/components/LeadForm";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<Diagnosis["severity"], string> = {
  mild: "bg-amber-100 text-amber-800 border-amber-200",
  moderate: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

export default function AiPlantDoctor() {
  const [image, setImage] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [bookOpen, setBookOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      apiPost<Diagnosis>("/ai/plant-doctor", { image_b64: image ?? "", notes, name, phone }),
    onSuccess: (data) => {
      setDiagnosis(data);
      toast.success("Diagnosis ready — review the recovery plan below.");
    },
    onError: (e: Error) => toast.error(e.message || "Diagnosis failed. Please retry."),
  });

  return (
    <div>
      <PageHero
        overline="AI Garden Suite — Tool 3"
        title="AI Plant Doctor — show us the leaf"
        description="Upload a photo of a struggling plant. We diagnose watering, pests, nutrients, light or root problems — and hand you a recovery plan in plain language."
      />

      <Container className="grid gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8" data-testid="doctor-form">
          <SectionHeading overline="Step 1" title="The patient" />
          <div className="mt-6 space-y-5">
            <div className="space-y-1.5">
              <Label>Photo of the sick plant</Label>
              <div className="relative">
                <ImageDropzone value={image} onChange={setImage} testid="doctor-image-upload" hint="Close-up of the affected leaves — plus one of the whole plant if you can." />
                {mutation.isPending && image ? (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" data-testid="doctor-scanning">
                    <div className="absolute inset-0 bg-primary/10" />
                    <div className="animate-scanline absolute left-0 h-1 w-full bg-primary shadow-[0_0_18px_4px] shadow-primary/50" />
                  </div>
                ) : null}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doctor-notes">Symptoms you've noticed (optional)</Label>
              <Textarea id="doctor-notes" data-testid="doctor-notes-input" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Leaves yellowing from the tips, soil stays damp for days…" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="doctor-name">Name (optional)</Label>
                <Input id="doctor-name" data-testid="doctor-name-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="For the follow-up call" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doctor-phone">Phone (optional)</Label>
                <Input id="doctor-phone" data-testid="doctor-phone-input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="For a home-visit booking" />
              </div>
            </div>
            <Button data-testid="doctor-diagnose-button" size="lg" className="w-full gap-2" onClick={() => {
              if (!image) {
                toast.warning("Please upload a photo of the plant first.");
                return;
              }
              setDiagnosis(null);
              mutation.mutate();
            }} disabled={mutation.isPending}>
              {mutation.isPending ? (<><Loader2 className="size-4 animate-spin" /> Scanning the leaf…</>) : (<><Stethoscope className="size-4" /> Diagnose my plant</>)}
            </Button>
          </div>
        </div>

        <div>
          {diagnosis ? (
            <div className="space-y-5" data-testid="doctor-results">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span data-testid="doctor-severity-pill" className={cn(badgeVariants({ variant: "outline" }), "border", SEVERITY_STYLES[diagnosis.severity])}>
                    {diagnosis.severity.toUpperCase()}
                  </span>
                  <Badge variant="secondary">{diagnosis.confidence}% confidence</Badge>
                  <Badge variant="outline" className="capitalize">{diagnosis.recovery_days}-day recovery</Badge>
                </div>
                <h2 data-testid="doctor-problem-title" className="mt-4 font-heading text-2xl font-semibold text-foreground">{diagnosis.problem}</h2>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, diagnosis.confidence)}%` }} data-testid="doctor-confidence-bar" />
                </div>

                {diagnosis.causes.length ? (
                  <div className="mt-6">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Likely causes</p>
                    <ul className="mt-2 space-y-1.5">
                      {diagnosis.causes.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-sm text-foreground"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" /> {c}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {diagnosis.treatment.length ? (
                  <div className="mt-6">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">7-day recovery protocol</p>
                    <ol className="mt-2 space-y-2">
                      {diagnosis.treatment.map((t, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[10px] font-semibold text-primary">{i + 1}</span>
                          {t}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {diagnosis.cta ? <p className="mt-6 rounded-xl bg-secondary p-4 text-sm text-foreground">{diagnosis.cta}</p> : null}

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Button data-testid="doctor-book-visit-button" className="flex-1 justify-center gap-2" onClick={() => setBookOpen(true)}>
                    <CalendarCheck className="size-4" /> Book plant-doctor visit (₹499)
                  </Button>
                  <WhatsAppButton
                    text={`Hi AJ Nursery, my plant was diagnosed with: ${diagnosis.problem} (${diagnosis.severity}). Please suggest the organic treatment kit or book a visit.`}
                    testid="doctor-whatsapp-button"
                    variant="outline"
                    className="flex-1 justify-center"
                  >
                    WhatsApp for treatment kit
                  </WhatsAppButton>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground">AI diagnosis — for critical cases, a real horticulturist visit is strongly recommended.</p>
            </div>
          ) : (
            <div className={cn("flex h-full min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-10 text-center", mutation.isPending && "opacity-60")} data-testid="doctor-empty">
              <ScanSearch className={cn("size-8 text-primary/60", mutation.isPending && "animate-pulse")} />
              <p className="mt-4 font-heading text-lg font-semibold text-foreground">
                {mutation.isPending ? "The clinic is examining your plant…" : "The diagnosis will appear here"}
              </p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Overwatering, pests, nutrient deficiencies, light scorch — AJ has seen it all across 180+ maintained
                gardens in Gurgaon.
              </p>
            </div>
          )}
        </div>
      </Container>

      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="max-w-md" data-testid="doctor-book-dialog">
          <DialogTitle className="font-heading text-2xl font-semibold">Book a plant-doctor visit</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">₹499 home visit anywhere in Gurgaon — diagnosis, treatment and a care plan included.</p>
          <div className="mt-5">
            <LeadForm
              source="plant_doctor"
              interest="Plant doctor home visit (₹499)"
              message={diagnosis ? `Visit for: ${diagnosis.problem} (${diagnosis.severity})` : "Plant doctor home visit"}
              testid="doctor-lead"
              submitLabel="Confirm visit request"
              onSuccess={() => setBookOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
