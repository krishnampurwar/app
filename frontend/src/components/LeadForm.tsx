import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import type { LeadResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import ContactFields, { emptyContact, isContactValid, type Contact } from "@/components/ContactFields";

/**
 * Shared lead-capture form. Posts name + phone + source to /api/leads, which emails the
 * nursery owner directly — nothing is stored anywhere.
 */
export default function LeadForm({
  source,
  submitLabel = "Request callback",
  testid = "lead-form",
  note,
  onSuccess,
}: {
  source: string;
  submitLabel?: string;
  testid?: string;
  note?: string;
  onSuccess?: () => void;
}) {
  const [contact, setContact] = useState<Contact>(emptyContact);
  const [touched, setTouched] = useState(false);

  const mutation = useMutation({
    mutationFn: () => apiPost<LeadResponse>("/leads", { ...contact, source }),
    onSuccess: () => {
      toast.success("Request received — our team will call you shortly.");
      setContact(emptyContact);
      setTouched(false);
      onSuccess?.();
    },
    onError: () => toast.error("Could not send right now. Please WhatsApp us instead."),
  });

  return (
    <form
      data-testid={testid}
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!isContactValid(contact)) {
          toast.warning("Please add your name and phone number.");
          return;
        }
        mutation.mutate();
      }}
    >
      <ContactFields
        value={contact}
        onChange={setContact}
        idPrefix={testid}
        showErrors={touched}
        note={note ?? "We only need these two — our team calls you back on WhatsApp."}
      />
      <Button type="submit" data-testid={`${testid}-submit-button`} disabled={mutation.isPending} className="w-full sm:w-auto">
        {mutation.isPending ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
