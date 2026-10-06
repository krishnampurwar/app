import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, ShoppingCart, Sparkles } from "lucide-react";
import { apiPost } from "@/lib/api";
import type { QuizResult } from "@/lib/types";
import { Container, PageHero, PrimaryLink, SectionHeading, WhatsAppButton, rupees } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const QUESTIONS = [
  {
    key: "placement",
    title: "Where will the plant live?",
    options: [
      { value: "living_room", label: "Living room" },
      { value: "bedroom", label: "Bedroom" },
      { value: "balcony", label: "Balcony" },
      { value: "terrace", label: "Terrace garden" },
      { value: "office", label: "Office / cabin" },
      { value: "garden", label: "Outdoor garden" },
    ],
  },
  {
    key: "sunlight",
    title: "How much sunlight does it get?",
    options: [
      { value: "low", label: "Low — mostly artificial light" },
      { value: "medium", label: "Medium — bright indirect" },
      { value: "direct", label: "Direct sun for hours" },
    ],
  },
  {
    key: "care",
    title: "How much will you water it?",
    options: [
      { value: "very_low", label: "Very low — I forget" },
      { value: "medium", label: "Medium — weekend care" },
      { value: "high", label: "High — I'm an enthusiast" },
    ],
  },
] as const;

const TRAITS = [
  { value: "pet_safe", label: "Pet-safe" },
  { value: "air_purifying", label: "Air-purifying" },
  { value: "flowering", label: "Flowering" },
  { value: "night_oxygen", label: "Night oxygen" },
];

export default function AiPlantFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{ placement: string; sunlight: string; care: string; traits: string[] }>({
    placement: "",
    sunlight: "",
    care: "",
    traits: [],
  });
  const [result, setResult] = useState<QuizResult | null>(null);

  const mutation = useMutation({
    mutationFn: () => apiPost<QuizResult>("/ai/plant-finder", answers),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Your plant matches are ready.");
    },
    onError: () => toast.error("Matching failed — please try again."),
  });

  const pick = (key: "placement" | "sunlight" | "care", value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep((s) => s + 1);
  };

  const toggleTrait = (value: string) =>
    setAnswers((a) => ({ ...a, traits: a.traits.includes(value) ? a.traits.filter((t) => t !== value) : [...a.traits, value] }));

  const restart = () => {
    setAnswers({ placement: "", sunlight: "", care: "", traits: [] });
    setResult(null);
    setStep(0);
  };

  const totalSteps = 4;

  return (
    <div>
      <PageHero
        overline="AI Garden Suite — Tool 4 · 30 seconds"
        title="What plant should I buy?"
        description="Four quick questions. Three perfect matches from our nursery — with prices and one-tap WhatsApp buying."
      />

      <Container className="max-w-3xl py-14">
        {result ? (
          <div data-testid="finder-results">
            <div className="text-center">
              <Sparkles className="mx-auto size-8 text-primary" />
              <h2 className="mt-3 font-heading text-3xl font-semibold text-foreground">Recommended for you</h2>
              {result.intro ? <p className="mt-2 text-muted-foreground">{result.intro}</p> : null}
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {result.picks.map((p, i) => (
                <article key={`${p.slug}-${i}`} data-testid={`finder-pick-${i}`} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                  {p.image_url ? (
                    <div className="aspect-square overflow-hidden">
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex aspect-square items-center justify-center bg-secondary">
                      <Sparkles className="size-8 text-primary/50" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <Badge variant="secondary" className="w-fit">Match #{i + 1}</Badge>
                    <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">{p.name}</h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{p.reason}</p>
                    <p className="mt-3 font-heading text-lg font-semibold text-primary">{rupees(p.price)}</p>
                    <WhatsAppButton
                      text={`Hi AJ Nursery! The plant quiz matched me with the ${p.name} (${rupees(p.price)}). Is it available?`}
                      testid={`finder-buy-whatsapp-${i}`}
                      variant="default"
                      size="sm"
                      className="mt-3 justify-center"
                    >
                      <ShoppingCart className="size-3.5" /> Buy this plant
                    </WhatsAppButton>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="outline" data-testid="finder-restart-button" onClick={restart}>Retake the quiz</Button>
              <PrimaryLink to="/shop" variant="secondary" testid="finder-shop-link">Browse the full nursery</PrimaryLink>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-10" data-testid="finder-quiz">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Question {Math.min(step + 1, totalSteps)} of {totalSteps}</p>
              {step > 0 && step < 3 ? (
                <Button variant="ghost" size="sm" data-testid="finder-back-button" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
              ) : null}
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }} data-testid="finder-progress-bar" />
            </div>

            {step < 3 ? (
              <div key={step} className="mt-8 animate-grow-in" data-testid={`plant-quiz-step-${step + 1}`}>
                <h2 className="font-heading text-2xl font-semibold text-foreground">{QUESTIONS[step].title}</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {QUESTIONS[step].options.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      data-testid={`finder-option-${o.value}`}
                      onClick={() => pick(QUESTIONS[step].key, o.value)}
                      className={cn(
                        "rounded-xl border border-border bg-background p-4 text-left text-sm font-medium text-foreground transition-all hover:border-primary/50 hover:bg-secondary",
                        answers[QUESTIONS[step].key] === o.value && "border-primary bg-secondary",
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-8 animate-grow-in" data-testid="plant-quiz-step-4">
                <h2 className="font-heading text-2xl font-semibold text-foreground">Anything special? (optional)</h2>
                <div className="mt-6 flex flex-wrap gap-3">
                  {TRAITS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      data-testid={`finder-trait-${t.value}`}
                      onClick={() => toggleTrait(t.value)}
                      className={cn(
                        "rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-secondary",
                        answers.traits.includes(t.value) && "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <Button size="lg" className="mt-8 w-full gap-2" data-testid="finder-submit-button" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                  {mutation.isPending ? "Matching…" : (<><ArrowRight className="size-4" /> Show my matches</>)}
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
