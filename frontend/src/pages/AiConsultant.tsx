import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Send, Sparkles } from "lucide-react";
import { apiStreamPost } from "@/lib/api";
import { Container, PageHero } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageDropzone from "@/components/ImageDropzone";
import LeadForm from "@/components/LeadForm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const QUICK_PROMPTS = [
  "Best balcony plants for morning sun in DLF Phase 5?",
  "How do I fix yellowing Areca Palm leaves?",
  "Cost of a 500 sq ft terrace garden on Golf Course Ext?",
];

export default function AiConsultant() {
  const qc = useQueryClient();
  const [sessionId] = useState(() => {
    const existing = sessionStorage.getItem("aj-session");
    if (existing) return existing;
    const id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem("aj-session", id);
    return id;
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Namaste! I'm AJ, your AI garden consultant. Ask me anything about plants, landscaping or budgets — or upload a photo of your space and I'll read its light and conditions. ☀️🪴",
    },
  ]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if ((!trimmed && !image) || busy) return;
    setBusy(true);
    const userMsg: ChatMessage = { role: "user", text: trimmed + (image ? " 📷" : "") };
    setMessages((m) => [...m, userMsg, { role: "assistant", text: "" }]);
    setInput("");
    const hadImage = !!image;
    setImage(null);

    try {
      // Backend is stateless — we send the recent turns so AJ keeps context.
      const priorTurns = messages
        .filter((m) => m.text)
        .slice(-8)
        .map((m) => ({ role: m.role, text: m.text }));
      const res = await apiStreamPost("/ai/ask-aj", {
        message: trimmed || "Please assess this photo of my space.",
        image_b64: hadImage ? image : undefined,
        history: priorTurns,
      });
      if (!res.ok || !res.body) throw new Error(`status ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      stream: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          try {
            const payload = JSON.parse(line.slice(5).trim());
            if (payload.delta) {
              const delta = payload.delta as string;
              setMessages((m) => {
                const copy = [...m];
                const last = copy[copy.length - 1];
                copy[copy.length - 1] = { ...last, text: last.text + delta };
                return copy;
              });
            }
            if (payload.error) {
              toast.error("AJ hit a snag — please retry, or WhatsApp the nursery.");
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { ...copy[copy.length - 1], text: payload.error };
                return copy;
              });
              break stream;
            }
          } catch {
            // partial JSON across chunks — ignore, next chunk completes it
          }
        }
      }
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
    } catch {
      toast.error("Couldn't reach AJ right now. Please try again in a moment.");
      setMessages((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last.role === "assistant" && !last.text) {
          copy[copy.length - 1] = { ...last, text: "I couldn't connect just now — please try again, or WhatsApp the nursery on +91 93362 39079." };
        }
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHero
        overline="AI Garden Suite — Tool 1"
        title="Ask AJ — your AI garden consultant"
        description="Streaming advice from a consultant who knows Gurgaon's sun, water and wind. Free, instant, and it ends with a real nursery on WhatsApp."
      />

      <Container className="grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">Add a photo (optional)</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A balcony, terrace, garden or a sick plant — AJ reads light, space and health from the picture.
            </p>
            <div className="mt-4">
              <ImageDropzone value={image} onChange={setImage} testid="ask-aj-image-upload" aspect="aspect-[16/8]" />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-card p-6">
            <h3 className="font-heading text-base font-semibold text-foreground">Try asking</h3>
            <div className="mt-3 flex flex-col gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  data-testid="ask-aj-quick-chip"
                  onClick={() => void send(q)}
                  disabled={busy}
                  className="rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-secondary disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-secondary p-6">
            <Sparkles className="size-5 text-primary" />
            <h3 className="mt-2 font-heading text-base font-semibold text-foreground">Want a real horticulturist too?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Export this conversation and book a nursery visit — we'll pick up exactly where AJ left off.
            </p>
            <Button data-testid="ask-aj-book-visit-button" className="mt-4 w-full" onClick={() => setLeadOpen(true)}>
              Book a nursery visit
            </Button>
          </div>
        </div>

        <div className="flex h-[600px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-5 py-3">
            <span className="flex size-2.5 items-center justify-center rounded-full bg-primary" />
            <p className="text-sm font-semibold text-foreground">AJ — AI Garden Consultant</p>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-primary">Streaming</span>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-5" data-testid="ask-aj-messages">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  data-testid={`ask-aj-message-${m.role}`}
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground",
                  )}
                >
                  {m.text || (busy && i === messages.length - 1 ? <span className="inline-block animate-pulse">AJ is thinking…</span> : "")}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form
            className="flex items-center gap-2 border-t border-border p-4"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <Input
              data-testid="ask-aj-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={image ? "Ask about this photo…" : "Ask about plants, design, budgets…"}
              disabled={busy}
            />
            <Button type="button" variant="outline" size="icon" data-testid="ask-aj-attach-button" onClick={() => document.getElementById("ask-aj-file-proxy")?.click()} aria-label="Attach photo">
              <ImagePlus className="size-4" />
            </Button>
            <Button type="submit" size="icon" data-testid="ask-aj-send-button" disabled={busy || (!input.trim() && !image)} aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </Container>

      <Dialog open={leadOpen} onOpenChange={setLeadOpen}>
        <DialogContent className="max-w-md" data-testid="ask-aj-lead-dialog">
          <DialogTitle className="font-heading text-2xl font-semibold">Book a nursery visit</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            We'll continue your AJ conversation with a real horticulturist — bring the plants, the photos, the plans.
          </p>
          <div className="mt-5">
            <LeadForm source="ask_aj" testid="ask-aj-lead" submitLabel="Book my visit" onSuccess={() => setLeadOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
