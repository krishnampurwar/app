import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarClock, Droplets, Leaf, Loader2, RefreshCcw, Sparkles } from "lucide-react";
import { apiPost, apiGet } from "@/lib/api";
import type { DesignConcept, DesignResult, ImageModelOut, VisualizeResult } from "@/lib/types";
import { Container, PageHero, SectionHeading, WhatsAppButton, rupees } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageDropzone from "@/components/ImageDropzone";
import { cn } from "@/lib/utils";

const SPACES = [
  { value: "balcony", label: "Balcony (50–200 sq ft)" },
  { value: "terrace", label: "Terrace / Rooftop (300–2500 sq ft)" },
  { value: "villa", label: "Villa front / backyard (1000–8000 sq ft)" },
  { value: "office", label: "Corporate office" },
  { value: "atrium", label: "Indoor atrium / lobby" },
];

const STYLE_PLACEHOLDER: Record<string, string> = {
  "low-maintenance": "from-emerald-800 to-emerald-600",
  biophilic: "from-teal-800 to-green-600",
  "luxury-zen": "from-amber-700 to-emerald-700",
};

export default function AiLandscapeDesigner() {
  const [spaceType, setSpaceType] = useState("terrace");
  const [image, setImage] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<DesignResult | null>(null);
  const [imageModel, setImageModel] = useState("");
  const [regenIndex, setRegenIndex] = useState<number | null>(null);

  const { data: models } = useQuery({
    queryKey: ["image-models"],
    queryFn: () => apiGet<ImageModelOut[]>("/ai/image-models"),
  });
  const usable = (models ?? []).filter((m) => m.available);
  const activeModel = imageModel || usable[0]?.id || "";
  const modelLabel = (id: string) => (models ?? []).find((m) => m.id === id)?.label ?? id;

  const mutation = useMutation({
    mutationFn: () =>
      apiPost<DesignResult>("/ai/landscape-designer", {
        image_b64: image ?? undefined,
        space_type: spaceType,
        notes,
        name,
        phone,
        image_model: activeModel || undefined,
      }),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Three concepts are ready — pick your favourite.");
    },
    onError: (e: Error) => toast.error(e.message || "Designing failed. Please retry."),
  });

  async function regenerate(index: number, concept: DesignConcept) {
    setRegenIndex(index);
    try {
      const fresh = await apiPost<VisualizeResult>("/ai/regenerate-concept-image", {
        space_type: spaceType,
        style: concept.style,
        description: concept.description,
        image_model: activeModel || undefined,
      });
      setResult((prev) => {
        if (!prev) return prev;
        const concepts = [...prev.concepts];
        concepts[index] = { ...concepts[index], image_url: fresh.image_url, image_model: fresh.image_model };
        return { ...prev, concepts };
      });
      toast.success(`Re-rendered on ${modelLabel(fresh.image_model)}.`);
    } catch {
      toast.error("Could not re-render that concept — try another model.");
    } finally {
      setRegenIndex(null);
    }
  }

  return (
    <div>
      <PageHero
        overline="AI Garden Suite — Tool 2 · Free"
        title="Upload your space, get three garden concepts"
        description="Our AI Landscape Designer reads your photo — light, space, existing structure — and returns a low-maintenance, a biophilic and a luxury concept, each with an honest INR budget."
      />

      <Container className="grid gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8" data-testid="designer-form">
          <SectionHeading overline="Step 1" title="Tell us about the space" />
          <div className="mt-6 space-y-5">
            <div className="space-y-1.5">
              <Label>Space type</Label>
              <Select value={spaceType} onValueChange={setSpaceType}>
                <SelectTrigger data-testid="designer-space-select"><SelectValue>{SPACES.find((s) => s.value === spaceType)?.label}</SelectValue></SelectTrigger>
                <SelectContent>
                  {SPACES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Photo of your space</Label>
              <ImageDropzone value={image} onChange={setImage} testid="designer-image-upload" hint="One clear wide photo is perfect. No photo? We'll design from the details below." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="designer-notes">Anything we should know?</Label>
              <Textarea
                id="designer-notes"
                data-testid="designer-notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="West-facing, 12th floor, gets very windy, want a seating corner and low maintenance…"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="designer-name">Name (optional)</Label>
                <Input id="designer-name" data-testid="designer-name-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="For the quote follow-up" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="designer-phone">Phone (optional)</Label>
                <Input id="designer-phone" data-testid="designer-phone-input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="For an architect call-back" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Concept image model</Label>
              <Select value={activeModel} onValueChange={setImageModel}>
                <SelectTrigger data-testid="designer-image-model-select">
                  <SelectValue>{modelLabel(activeModel)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(models ?? []).filter((m) => m.available).map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.label} — {m.note}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">Auto-falls back to another model if this one fails.</p>
            </div>
            <Button
              data-testid="designer-generate-button"
              className="w-full gap-2"
              size="lg"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (<><Loader2 className="size-4 animate-spin" /> Designing your space…</>) : (<><Sparkles className="size-4" /> Generate 3 concepts</>)}
            </Button>
            <p className="text-center text-xs text-muted-foreground">Free · ~1 minute · concepts render with AI imagery</p>
          </div>
        </div>

        <div>
          {mutation.isPending ? (
            <div className="space-y-4" data-testid="designer-loading">
              {[0, 1, 2].map((i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <Loader2 className="size-5 animate-spin text-primary" />
                    <div className="flex-1">
                      <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted" />
                      <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {["Reading your space photo…", "Balancing plants, light and budget…", "Rendering concept imagery…"][i]}
                  </p>
                </div>
              ))}
            </div>
          ) : result ? (
            <div className="space-y-6" data-testid="designer-results">
              {result.space_analysis ? (
                <div className="rounded-2xl bg-secondary p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">AI space analysis</p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">{result.space_analysis}</p>
                </div>
              ) : null}
              {result.concepts.map((c, i) => (
                <article key={i} data-testid={`designer-concept-${i}`} className="overflow-hidden rounded-2xl border border-border bg-card">
                  {c.image_url ? (
                    <div className="relative aspect-[16/8] overflow-hidden">
                      <img src={c.image_url} alt={c.title} className="h-full w-full object-cover" />
                      {c.image_model ? (
                        <Badge variant="secondary" className="absolute left-3 top-3 bg-white/85 text-[10px] text-foreground backdrop-blur" data-testid={`designer-concept-model-${i}`}>
                          {modelLabel(c.image_model)}
                        </Badge>
                      ) : null}
                      <button
                        type="button"
                        data-testid={`designer-regenerate-${i}`}
                        onClick={() => void regenerate(i, c)}
                        disabled={regenIndex === i}
                        className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur transition-colors hover:bg-black/80 disabled:opacity-70"
                      >
                        <RefreshCcw className={cn("size-3", regenIndex === i && "animate-spin")} />
                        {regenIndex === i ? "Rendering…" : "Re-render"}
                      </button>
                    </div>
                  ) : (
                    <div className={cn("relative flex aspect-[16/8] items-center justify-center bg-gradient-to-br", STYLE_PLACEHOLDER[c.style] ?? "from-emerald-800 to-emerald-600")}>
                      <Leaf className="size-10 text-white/70" />
                      <button
                        type="button"
                        data-testid={`designer-regenerate-${i}`}
                        onClick={() => void regenerate(i, c)}
                        disabled={regenIndex === i}
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur hover:bg-black/70 disabled:opacity-70"
                      >
                        <RefreshCcw className={cn("size-3", regenIndex === i && "animate-spin")} />
                        {regenIndex === i ? "Rendering…" : "Render image"}
                      </button>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={badgeVariants({ variant: "secondary" })}>{c.style}</span>
                      <Badge variant="outline" className="capitalize">{c.maintenance} maintenance</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarClock className="size-3.5" /> ~{c.timeline_days} days</span>
                    </div>
                    <h3 className="mt-3 font-heading text-xl font-semibold text-foreground">{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                    <p className="mt-4 font-heading text-2xl font-semibold text-primary">
                      {rupees(c.budget_min)} – {rupees(c.budget_max)}
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Plant palette</p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {c.plants.slice(0, 5).map((p) => (
                            <span key={p} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground">{p}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Includes</p>
                        <ul className="mt-1.5 space-y-0.5 text-[11px] text-muted-foreground">
                          {c.features.slice(0, 5).map((f) => (<li key={f}>· {f}</li>))}
                        </ul>
                      </div>
                    </div>
                    <WhatsAppButton
                      text={`Hi AJ Harvest Team! I loved the "${c.title}" concept for my ${spaceType} (${rupees(c.budget_min)}–${rupees(c.budget_max)}). Please arrange an architect on-site survey.`}
                      testid={`designer-concept-whatsapp-${i}`}
                      variant="default"
                      className="mt-5 w-full justify-center"
                    >
                      Get an architect survey for this concept
                    </WhatsAppButton>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-10 text-center" data-testid="designer-empty">
              <Droplets className="size-8 text-primary/60" />
              <p className="mt-4 font-heading text-lg font-semibold text-foreground">Three concepts will appear here</p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                A low-maintenance starter, a biophilic mid-tier with a green wall, and a luxury zen build — each
                scaled to your space with real INR ranges.
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
