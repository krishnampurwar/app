import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface Contact {
  name: string;
  phone: string;
}

export const emptyContact: Contact = { name: "", phone: "" };

const digits = (v: string) => v.replace(/\D/g, "");

export const nameError = (name: string) =>
  name.trim().length < 2 ? "Please enter your name" : "";

export const phoneError = (phone: string) => {
  const d = digits(phone);
  if (!d) return "Phone number is required";
  if (d.length < 10) return "Enter at least 10 digits";
  if (d.length > 13) return "That number looks too long";
  return "";
};

export const isContactValid = (c: Contact) => !nameError(c.name) && !phoneError(c.phone);

/** Compulsory name + phone inputs, shared by every AI tool so validation is identical. */
export default function ContactFields({
  value,
  onChange,
  idPrefix,
  showErrors,
  note = "We need these to send your result and follow up — no spam, ever.",
}: {
  value: Contact;
  onChange: (c: Contact) => void;
  idPrefix: string;
  showErrors: boolean;
  note?: string;
}) {
  const nErr = showErrors ? nameError(value.name) : "";
  const pErr = showErrors ? phoneError(value.phone) : "";

  return (
    <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-name`}>
            Your name <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${idPrefix}-name`}
            data-testid={`${idPrefix}-name-input`}
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="Aarav Kapoor"
            required
            aria-invalid={!!nErr}
            className={cn(nErr && "border-destructive focus-visible:ring-destructive/30")}
          />
          {nErr ? (
            <p className="text-xs text-destructive" data-testid={`${idPrefix}-name-error`}>{nErr}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-phone`}>
            Phone / WhatsApp <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${idPrefix}-phone`}
            data-testid={`${idPrefix}-phone-input`}
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            placeholder="98XXX XXXXX"
            inputMode="tel"
            required
            aria-invalid={!!pErr}
            className={cn(pErr && "border-destructive focus-visible:ring-destructive/30")}
          />
          {pErr ? (
            <p className="text-xs text-destructive" data-testid={`${idPrefix}-phone-error`}>{pErr}</p>
          ) : null}
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">{note}</p>
    </div>
  );
}
