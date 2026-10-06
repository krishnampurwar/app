import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, RefreshCcw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { rupees, waLink } from "@/lib/whatsapp";

// re-exported for page convenience
export { rupees };

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function SectionHeading({
  overline,
  title,
  description,
  center,
}: {
  overline: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">{overline}</p>
      <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function PageHero({
  overline,
  title,
  description,
  image,
  children,
}: {
  overline: string;
  title: string;
  description: string;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[#0d1b13]">
      {image ? (
        <img src={image} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-45" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b13]/85 via-[#0d1b13]/70 to-[#0d1b13]/95" />
      <Container className="relative py-16 sm:py-20">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-[#8ed6b1]">{overline}</p>
        <h1 className="mt-3 max-w-3xl font-heading text-4xl font-semibold leading-[1.12] tracking-tight text-[#f7faf8] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#c2d4c9] sm:text-lg">{description}</p>
        {children ? <div className="mt-7 flex flex-wrap items-center gap-3">{children}</div> : null}
      </Container>
    </section>
  );
}

export function WhatsAppButton({
  text,
  children,
  testid,
  variant = "outline",
  size = "default",
  className,
}: {
  text: string;
  children: ReactNode;
  testid?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  className?: string;
}) {
  return (
    <a
      href={waLink(text)}
      target="_blank"
      rel="noreferrer"
      data-testid={testid}
      className={cn(
        buttonVariants({ variant, size }),
        variant === "outline" && "border-primary/40 text-primary hover:bg-secondary hover:text-primary",
        className,
      )}
    >
      <MessageCircle className="size-4" />
      {children}
    </a>
  );
}

export function PrimaryLink({
  to,
  children,
  testid,
  variant = "default",
  size = "default",
  className,
}: {
  to: string;
  children: ReactNode;
  testid?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "xs" | "sm" | "lg";
  className?: string;
}) {
  return (
    <Link to={to} data-testid={testid} className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </Link>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
      <p className="font-heading text-lg font-semibold text-foreground">{title}</p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function SkeletonGrid({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-border bg-card/60 p-4">
          <div className="aspect-[4/3] rounded-xl bg-muted" />
          <div className="mt-4 h-4 w-2/3 rounded bg-muted" />
          <div className="mt-2 h-3 w-full rounded bg-muted" />
          <div className="mt-1.5 h-3 w-3/4 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ title = "Something wilted on our side.", detail }: { title?: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <p className="font-heading text-lg font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail ?? "Please try again in a moment."}</p>
      <a
        href={window.location.href}
        className={buttonVariants({ variant: "outline", size: "sm" }) + " mx-auto mt-4 gap-1.5"}
        data-testid="retry-button"
      >
        <RefreshCcw className="size-3.5" /> Retry
      </a>
    </div>
  );
}

export function Rupees({ value, className }: { value: number; className?: string }) {
  return <span className={className}>{rupees(value)}</span>;
}
