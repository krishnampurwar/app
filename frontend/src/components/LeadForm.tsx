import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import type { Lead, LeadCreate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Shared lead-capture form — posts to /api/leads with the given source. */
export default function LeadForm({
  source,
  interest = "",
  message = "",
  extra,
  submitLabel = "Request callback",
  testid = "lead-form",
  onSuccess,
}: {
  source: string;
  interest?: string;
  message?: string;
  extra?: Partial<LeadCreate>;
  submitLabel?: string;
  testid?: string;
  onSuccess?: (lead: Lead) => void;
}) {
  const [form, setForm] = useState({ name: "", phone: "", location: "Gurgaon", message });

  const mutation = useMutation({
    mutationFn: () =>
      apiPost<Lead>("/leads", {
        ...form,
        source,
        interest,
        ...extra,
      }),
    onSuccess: (lead) => {
      toast.success("Request received — our team will reach out shortly.", {
        description: lead.score === "hot" ? "Marked priority: expect a call within a few hours." : undefined,
      });
      onSuccess?.(lead);
    },
    onError: () => toast.error("Could not send right now. Please WhatsApp us instead."),
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form
      data-testid={`${testid}`}
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${testid}-name`}>Your name</Label>
          <Input
            id={`${testid}-name`}
            data-testid={`${testid}-name-input`}
            value={form.name}
            onChange={set("name")}
            placeholder="Aarav Kapoor"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${testid}-phone`}>Phone / WhatsApp</Label>
          <Input
            id={`${testid}-phone`}
            data-testid={`${testid}-phone-input`}
            value={form.phone}
            onChange={set("phone")}
            placeholder="98XXX XXXXX"
            inputMode="tel"
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${testid}-location`}>Locality in Gurgaon</Label>
        <Input
          id={`${testid}-location`}
          data-testid={`${testid}-location-input`}
          value={form.location}
          onChange={set("location")}
          placeholder="DLF Phase 4, Golf Course Road…"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${testid}-message`}>What do you need?</Label>
        <Textarea
          id={`${testid}-message`}
          data-testid={`${testid}-message-input`}
          value={form.message}
          onChange={set("message")}
          placeholder="1,200 sq ft terrace in Sector 57 — want a low-maintenance garden…"
          rows={3}
        />
      </div>
      <Button type="submit" data-testid={`${testid}-submit-button`} disabled={mutation.isPending} className="w-full sm:w-auto">
        {mutation.isPending ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
