import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, ImageIcon, Loader2, RefreshCcw, Sparkles, Wand2 } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import type { ImageModelOut, VisualizeResult } from "@/lib/types";
import { Container, PageHero, SectionHeading, WhatsAppButton } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SPACES = [
  { value: "balcony", label: "Balcony" },
  { value: "terrace", label: "Terrace / Rooftop" },
  { value: "villa garden", label: "Villa garden" },
  { value: "farmhouse lawn", label: "Farmhouse lawn" },
  { value: "office lobby", label: "Office lobby" },
  { value: "indoor atrium", label: "Indoor atrium" },
];

const STYLES = [
  { value: "minimalist low-maintenance", label: "Minimalist & low-maintenance" },
  { value: "modern biophilic", label: "Modern biophilic" },
  { value: "luxury zen oasis", label: "Luxury zen oasis" },
  { value: "tropical jungle", label: "Tropical jungle" },
  { value: "mughal-inspired formal", label: "Mughal-inspired formal" },
  { value: "kitchen garden productive", label: "Productive kitchen garden" },
];

const IDEAS = [
  "A 400 sq ft terrace with a timber deck, a green wall, and string lights for evening dinners",
  "A narrow 12th-floor balcony that gets harsh west sun — want privacy and flowers",
  "A villa front lawn with a frangipani tree, stone path and low hedges",
];

export default function AiVisualizer() {
  const [spaceType, setSpaceType] = useState("terrace");
  const [style, setStyle] = useState("modern biophilic");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<VisualizeResult | null>(null);

  const { data: models } = useQuery({
    queryKey: ["image-models"],
    queryFn: () => apiGet<ImageModelOut[]>("/ai/image-models"),
  });

  const usable = (models ?? []).filter((m) => m.available);
  const activeModel = model || usable[0]?.id || "";

  const mutation = useMutation({
    mutationFn: () =>
      apiPost<VisualizeResult>("/ai/visualize", {
        space_type: spaceType,
        style,
        description,
        image_model: activeModel || undefined,
        name,
        phone,
      }),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Your garden has been visualised.");
    },
    onError: () => toast.error("Rendering failed — please try again or pick another model."),
  });

  const modelLabel = (id: string) => (models ?? []).find((m) => m.id === id)?.label ?? id;

  function download() {
    if (!result?.image_url) return;
    const a = document.createElement("a");
    a.href = result.image_url;
    a.download = `aj-garden-visual-${Date.now()}.jpg`;
    a.click();
  }

  return (
    <div>
      <PageHero
        overline="AI Garden Suite — Visualizer"
        title="See your garden before we plant it"
        description="Describe the space you dream of. Our AI art-directs it for Gurgaon's climate, then renders a photoreal preview you can hold up and say: that one."
      />

      <Container className="grid gap-10 py-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8" data-testid="visualizer-form">
          <SectionHeading overline="The brief" title="Describe your dream garden" />
          <div className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Space</Label>
                <Select value={spaceType} onValueChange={setSpaceType}>
                  <SelectTrigger data-testid="visualizer-space-select">
                    <SelectValue>{SPACES.find((s) => s.value === spaceType)?.label}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SPACES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger data-testid="visualizer-style-select">
                    <SelectValue>{STYLES.find((s) => s.value === style)?.label}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="visualizer-description">What do you picture?</Label>
              <Textarea
                id="visualizer-description"
                data-testid="visualizer-description-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="A 400 sq ft terrace with a timber deck, a green wall behind a bench, and warm lights for evening dinners…"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {IDEAS.map((idea, i) => (
                  <button
                    key={i}
                    type="button"
                    data-testid={`visualizer-idea-${i}`}
                    onClick={() => setDescription(idea)}
                    className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    Idea {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image model</Label>
              <div className="grid gap-2" data-testid="visualizer-model-picker">
                {(models ?? []).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    disabled={!m.available}
                    data-testid={`visualizer-model-${m.id}`}
                    onClick={() => setModel(m.id)}
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-xl border p-3 text-left transition-colors",
                      activeModel === m.id ? "border-primary bg-secondary" : "border-border hover:border-primary/40",
                      !m.available && "cursor-not-allowed opacity-55",
                    )}
                  >
                    <span>
                      <span className="block text-sm font-medium text-foreground">{m.label}</span>
                      <span className="block text-[11px] text-muted-foreground">{m.note}</span>
                    </span>
                    <Badge variant={m.available ? "secondary" : "outline"} className="shrink-0 text-[10px] capitalize">
                      {m.available ? m.provider : "unavailable"}
                    </Badge>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                If the chosen model fails, we automatically retry on the next available one.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="visualizer-name">Name (optional)</Label>
                <Input id="visualizer-name" data-testid="visualizer-name-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="visualizer-phone">Phone (optional)</Label>
                <Input id="visualizer-phone" data-testid="visualizer-phone-input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
              </div>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              data-testid="visualizer-generate-button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (<><Loader2 className="size-4 animate-spin" /> Rendering your garden…</>) : (<><Wand2 className="size-4" /> Visualise my garden</>)}
            </Button>
            <p className="text-center text-xs text-muted-foreground">Takes 15–40 seconds · free</p>
          </div>
        </div>

        <div>
          {mutation.isPending ? (
            <div className="relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-card" data-testid="visualizer-loading">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
              <div className="animate-scanline absolute left-0 h-1 w-full bg-primary/70 shadow-[0_0_18px_4px] shadow-primary/40" />
              <Sparkles className="relative size-8 animate-pulse text-primary" />
              <p className="relative mt-4 font-heading text-lg font-semibold text-foreground">Art-directing, then rendering…</p>
              <p className="relative mt-1 text-sm text-muted-foreground">{modelLabel(activeModel)}</p>
            </div>
          ) : result ? (
            <div className="space-y-4" data-testid="visualizer-result">
              <figure className="overflow-hidden rounded-2xl border border-border bg-card">
                <img src={result.image_url} alt={result.caption || "AI generated garden visual"} className="w-full object-cover" data-testid="visualizer-image" />
                <figcaption className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <span className="text-sm text-foreground">{result.caption || "Your AI garden concept"}</span>
                  <Badge variant="secondary" data-testid="visualizer-used-model">{modelLabel(result.image_model)}</Badge>
                </figcaption>
              </figure>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-1.5" data-testid="visualizer-download-button" onClick={download}>
                  <Download className="size-4" /> Download image
                </Button>
                <Button variant="outline" className="gap-1.5" data-testid="visualizer-regenerate-button" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                  <RefreshCcw className="size-4" /> Render again
                </Button>
                <WhatsAppButton
                  text={`Hi AJ Harvest Team! I visualised a ${style} ${spaceType} with your AI tool. Can we build something like it? ${description}`}
                  testid="visualizer-whatsapp-button"
                  variant="default"
                >
                  Build this for me
                </WhatsAppButton>
              </div>
              <details className="rounded-xl border border-border bg-card p-4">
                <summary className="cursor-pointer text-sm font-medium text-foreground" data-testid="visualizer-prompt-toggle">
                  See the art direction we generated
                </summary>
                <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted-foreground">{result.prompt_used}</p>
              </details>
            </div>
          ) : (
            <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-10 text-center" data-testid="visualizer-empty">
              <ImageIcon className="size-8 text-primary/60" />
              <p className="mt-4 font-heading text-lg font-semibold text-foreground">Your rendered garden appears here</p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                We art-direct your words into a Gurgaon-appropriate planting scheme, then render it photo-real — so
                you can approve a look before anyone digs.
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
