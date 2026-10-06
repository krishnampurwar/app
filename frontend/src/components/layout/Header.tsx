import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Menu, MessageCircle, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { WA, waLink, WHATSAPP_DISPLAY } from "@/lib/whatsapp";

export const LOGO_URL =
  "https://customer-assets-wrfwihn1.emergentagent.net/job_1a1a3934-60b8-404f-916a-c3e96e03d80a/artifacts/1lpk0rcn_AJ%20LOgo.png";

export const SERVICE_LINKS = [
  { name: "Garden Maintenance", slug: "garden-maintenance" },
  { name: "Plant Nursery", slug: "plant-nursery" },
  { name: "Landscaping & Hardscaping", slug: "landscaping" },
  { name: "Rooftop & Terrace Gardens", slug: "rooftop-gardens" },
  { name: "Vertical Green Walls", slug: "vertical-gardening" },
  { name: "Indoor Plant Styling", slug: "indoor-landscaping" },
  { name: "Outdoor Estate Gardens", slug: "outdoor-landscaping" },
  { name: "Plants Seller & Pots", slug: "plants-seller" },
];

export const AI_TOOL_LINKS = [
  { name: "Ask AJ — AI Consultant", href: "/ai-consultant", badge: "Streaming" },
  { name: "AI Landscape Designer", href: "/ai-landscape-designer", badge: "Free concept" },
  { name: "AI Garden Visualizer", href: "/ai-visualizer", badge: "Image models" },
  { name: "AI Plant Doctor", href: "/ai-plant-doctor", badge: "Photo diagnosis" },
  { name: "Plant Match Quiz", href: "/ai-plant-finder", badge: "Instant" },
  { name: "AI Proposal Generator", href: "/ai-proposal-generator", badge: "Printable" },
];

const navCls = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
    isActive ? "text-primary" : "text-foreground/70 hover:text-foreground",
  );

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" data-testid="header-logo-link" className="flex shrink-0 items-center gap-2.5">
          <img src={LOGO_URL} alt="AJ Heaven's Harvest Nursery logo" className="h-11 w-auto" />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-heading text-base font-semibold tracking-tight">AJ Heaven's Harvest</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Nursery · Gurgaon</span>
          </span>
        </Link>

        <nav data-testid="header-nav" className="ml-4 hidden items-center gap-0.5 lg:flex">
          <NavLink to="/shop" className={navCls}>Plants</NavLink>
          <DropdownMenu>
            <DropdownMenuTrigger
              data-testid="nav-services-menu"
              className={buttonVariants({ variant: "ghost", size: "sm" }) + " gap-1 text-sm"}
            >
              Services <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {SERVICE_LINKS.map((s) => (
                <DropdownMenuItem key={s.slug} render={<Link to={`/services/${s.slug}`} />}>
                  {s.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger
              data-testid="nav-ai-suite-menu"
              className={buttonVariants({ variant: "ghost", size: "sm" }) + " gap-1 text-sm"}
            >
              <Sparkles className="size-3.5 text-primary" /> AI Garden Suite <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {AI_TOOL_LINKS.map((t) => (
                <DropdownMenuItem key={t.href} render={<Link to={t.href} />} className="flex-col items-start gap-0.5">
                  <span className="text-sm font-medium">{t.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary">{t.badge}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <NavLink to="/maintenance" className={navCls}>Maintenance</NavLink>
          <NavLink to="/locations" className={navCls}>Gurgaon Areas</NavLink>
          <NavLink to="/case-studies" className={navCls}>Projects</NavLink>
          <NavLink to="/contact" className={navCls}>Contact</NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={WA.quote}
            target="_blank"
            rel="noreferrer"
            data-testid="nav-whatsapp-cta-button"
            className={buttonVariants({ variant: "outline", size: "sm" }) + " gap-1.5 border-primary/40 text-primary hover:bg-secondary hover:text-primary"}
          >
            <MessageCircle className="size-4" /> WhatsApp Quote
          </a>
          <Link
            to="/ai-landscape-designer"
            data-testid="nav-ai-designer-cta-button"
            className={buttonVariants({ size: "sm" }) + " gap-1.5"}
          >
            <Sparkles className="size-4" /> AI Space Scan
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              data-testid="mobile-menu-button"
              className={buttonVariants({ variant: "outline", size: "icon-sm" }) + " lg:hidden"}
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetTitle className="font-heading">AJ Heaven's Harvest</SheetTitle>
              <div className="mt-2 flex flex-col gap-1 pb-8">
                {[
                  { to: "/shop", label: "Plants & Nursery" },
                  { to: "/maintenance", label: "Maintenance Plans" },
                  { to: "/locations", label: "Gurgaon Areas" },
                  { to: "/case-studies", label: "Projects" },
                  { to: "/contact", label: "Contact" },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    data-testid={`mobile-nav-${l.to.replace(/\//g, "") || "home"}`}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                  >
                    {l.label}
                  </Link>
                ))}
                <p className="mt-3 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Services</p>
                {SERVICE_LINKS.map((s) => (
                  <Link
                    key={s.slug}
                    to={`/services/${s.slug}`}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-secondary"
                  >
                    {s.name}
                  </Link>
                ))}
                <p className="mt-3 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">AI Garden Suite</p>
                {AI_TOOL_LINKS.map((t) => (
                  <Link
                    key={t.href}
                    to={t.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-secondary"
                  >
                    {t.name}
                  </Link>
                ))}
                <a
                  href={waLink("Hello AJ Nursery Team! I need guidance for my garden in Gurgaon.")}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 rounded-md px-3 py-2.5 text-sm font-semibold text-primary"
                >
                  WhatsApp {WHATSAPP_DISPLAY}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
