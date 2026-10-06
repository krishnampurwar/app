import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ClipboardList,
  ImageIcon,
  Leaf,
  MessageSquareText,
  ScanSearch,
  Sparkles,
  Stethoscope,
  Wand2,
} from "lucide-react";
import { getPlans, getPlants, getProjects, getServices } from "@/lib/content";
import type { Plan, Plant, Project, Service } from "@/lib/types";
import { Container, PageHero, PrimaryLink, SectionHeading, SkeletonGrid, WhatsAppButton, rupees } from "@/components/Shared";
import { badgeVariants } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { HERO_IMAGE } from "@/pages/imagePool";

const AI_TOOLS = [
  { href: "/ai-consultant", icon: MessageSquareText, name: "Ask AJ — AI Consultant", blurb: "Streaming garden advice with photo analysis, tuned to Gurgaon's climate.", badge: "Streaming" },
  { href: "/ai-landscape-designer", icon: Wand2, name: "AI Landscape Designer", blurb: "Upload your space photo — get 3 concept designs with INR budgets.", badge: "Free concept" },
  { href: "/ai-visualizer", icon: ImageIcon, name: "AI Garden Visualizer", blurb: "Describe your dream garden and watch it render photo-real.", badge: "Image models" },
  { href: "/ai-plant-doctor", icon: Stethoscope, name: "AI Plant Doctor", blurb: "A sick plant photo is all we need — diagnosis and a recovery plan.", badge: "Photo diagnosis" },
  { href: "/ai-plant-finder", icon: ScanSearch, name: "Plant Match Quiz", blurb: "30 seconds of questions, three perfect plants from our nursery.", badge: "Instant" },
  { href: "/ai-proposal-generator", icon: ClipboardList, name: "AI Proposal Generator", blurb: "A formal, itemised landscape proposal from a single sentence brief.", badge: "Printable" },
];

export default function Home() {
  const { data: services } = useQuery({ queryKey: ["services"], queryFn: getServices });
  const { data: plants } = useQuery({ queryKey: ["plants", "featured"], queryFn: getPlants });
  const { data: plans } = useQuery({ queryKey: ["plans"], queryFn: getPlans });
  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: getProjects });

  return (
    <div>
      {/* Hero — asymmetric botanical */}
      <section className="relative overflow-hidden bg-[#0d1b13]">
        <img src={HERO_IMAGE} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b13]/85 via-[#0d1b13]/65 to-[#0d1b13]" />
        <Container className="relative grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#8ed6b1]/30 bg-[#8ed6b1]/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#8ed6b1]">
              <Leaf className="size-3.5" /> Gurgaon's botanical studio — nursery & landscaping
            </span>
            <h1 className="mt-6 font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-[#f7faf8] sm:text-5xl lg:text-6xl">
              Your garden, designed by nature.
              <span className="block text-[#8ed6b1]">Delivered by AJ.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#c2d4c9]">
              From a single balcony to a full farmhouse — nursery-grown plants, rooftop gardens, green walls and
              year-round care, now with an AI garden consultant on every page.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PrimaryLink to="/ai-landscape-designer" size="lg" testid="hero-cta-ai-designer" className="gap-2">
                <Sparkles className="size-4" /> Get a free AI garden concept
              </PrimaryLink>
              <WhatsAppButton text="Hi AJ Harvest Team, I want a garden landscape consultation." testid="hero-cta-whatsapp" size="lg" variant="outline" className="border-[#8ed6b1]/40 text-[#8ed6b1] hover:bg-[#8ed6b1]/10 hover:text-[#8ed6b1]">
                WhatsApp Quote
              </WhatsAppButton>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#a2b8aa]">
              <span><strong className="font-heading text-xl text-[#f4f7f4]">500+</strong> plants in nursery</span>
              <span><strong className="font-heading text-xl text-[#f4f7f4]">320+</strong> landscapes built</span>
              <span><strong className="font-heading text-xl text-[#f4f7f4]">180+</strong> gardens under care</span>
            </div>
          </div>

          <div className="rounded-3xl border border-[#8ed6b1]/25 bg-[#0d1b13]/70 p-6 backdrop-blur-xl backdrop-saturate-150 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8ed6b1]">Free · 60 seconds</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-[#f4f7f4]">Not sure what your space needs?</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#a2b8aa]">
              Upload a photo of your balcony, terrace or garden. AJ's AI reads the light and space, then proposes
              three concepts — with honest budgets.
            </p>
            <PrimaryLink to="/ai-landscape-designer" testid="hero-glass-upload-cta" className="mt-5 w-full gap-2">
              <Sparkles className="size-4" /> Upload your space
            </PrimaryLink>
            <ul className="mt-6 space-y-2.5 text-sm text-[#c2d4c9]">
              {AI_TOOLS.slice(1).map((t) => (
                <li key={t.href}>
                  <Link to={t.href} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/5" data-testid="hero-ai-tool-link">
                    <span className="flex items-center gap-2.5">
                      <t.icon className="size-4 text-[#8ed6b1]" /> {t.name}
                    </span>
                    <ArrowRight className="size-3.5 text-[#8ed6b1]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* AI suite */}
      <Container className="py-16 sm:py-20">
        <SectionHeading
          overline="AI Garden Suite"
          title="Five AI tools that answer, design, diagnose and quote"
          description="Every tool feeds our sales team a proper brief — so the advice you get free is the service you can buy."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AI_TOOLS.map((t, i) => (
            <Link
              key={t.href}
              to={t.href}
              data-testid={`ai-tool-card-${i}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-emerald-900/10"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <t.icon className="size-5" />
              </span>
              <span className="mt-4 font-heading text-base font-semibold text-foreground">{t.name}</span>
              <span className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{t.blurb}</span>
              <span className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{t.badge} →</span>
            </Link>
          ))}
        </div>
      </Container>

      {/* Services */}
      <section className="bg-muted/60 py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading overline="What we do" title="Eight crafts, one green team" />
            <PrimaryLink to="/services" variant="outline" testid="home-all-services-link">All services</PrimaryLink>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(services ?? []).slice(0, 8).map((s) => (
              <Link
                key={s.slug}
                to={`/services/${s.slug}`}
                data-testid={`service-card-${s.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/10"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={s.hero_image} alt={s.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-lg font-semibold text-foreground">{s.name}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{s.short}</p>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-primary">
                    From {rupees(s.price_from)} →
                  </p>
                </div>
              </Link>
            ))}
            {!services ? <SkeletonGrid count={4} className="sm:col-span-2 lg:col-span-4" /> : null}
          </div>
        </Container>
      </section>

      {/* Featured plants */}
      <Container className="py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading overline="From the nursery" title="House favourites, nursery-direct" />
          <PrimaryLink to="/shop" variant="outline" testid="home-shop-link">Browse the shop</PrimaryLink>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(plants ?? []).slice(0, 4).map((p) => (
            <Link key={p.id} to="/shop" data-testid={`plant-card-${p.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-card">
              <div className="aspect-square overflow-hidden">
                <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{p.category} · {p.sunlight} light</p>
                </div>
                <span className="font-heading text-base font-semibold text-primary">{rupees(p.price)}</span>
              </div>
            </Link>
          ))}
          {!plants ? <SkeletonGrid count={4} className="sm:col-span-2 lg:col-span-4" /> : null}
        </div>
      </Container>

      {/* Maintenance teaser */}
      <section className="bg-[#0d1b13] py-16 text-[#f4f7f4] sm:py-20">
        <Container>
          <SectionHeading
            overline="Care subscriptions"
            title="A garden is a habit, not a project"
            description="Landscapes stay lush on a plan: monthly, bi-weekly or full weekly care with free plant replacement."
            style={{ color: '#FFFFFF' }}
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {(plans ?? []).map((pl) => (
              <div key={pl.id} data-testid={`plan-card-${pl.slug}`} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-semibold">{pl.name}</h3>
                  {pl.popular ? <span className={badgeVariants({ variant: "secondary" }) + " bg-[#8ed6b1]/15 text-[#8ed6b1]"}>Popular</span> : null}
                </div>
                <p className="mt-1 text-sm text-[#a2b8aa]">{pl.tagline}</p>
                <p className="mt-4 font-heading text-3xl font-semibold">{rupees(pl.price)}<span className="text-sm font-normal text-[#a2b8aa]"> {pl.cadence}</span></p>
              </div>
            ))}
            {!plans ? <SkeletonGrid count={3} className="md:col-span-3" /> : null}
          </div>
          <div className="mt-8">
            <PrimaryLink to="/maintenance" testid="home-maintenance-link" variant="outline" className="border-[#8ed6b1]/40 text-[#8ed6b1] hover:bg-[#8ed6b1]/10 hover:text-[#8ed6b1]">
              Compare maintenance plans
            </PrimaryLink>
          </div>
        </Container>
      </section>

      {/* Locations + projects */}
      <Container className="py-16 sm:py-20">
        <SectionHeading overline="Across Gurgaon" title="Local crews, local plants, local pages" description="Every micro-market gets its own climate notes and service mix — start with your neighbourhood." />
        <div className="mt-8 flex flex-wrap gap-2.5">
          {["dlf-phase-1-2-3-4-5", "golf-course-road", "golf-course-extension-road", "sohna-road", "new-gurgaon-sectors", "sector-14-sector-29-old-gurgaon", "manesar-industrial-farmhouses"].map((slug) => (
            <Link
              key={slug}
              to={`/locations/${slug}`}
              data-testid={`location-chip-${slug}`}
              className={buttonVariants({ variant: "secondary", size: "sm" }) + " capitalize"}
            >
              {slug.replaceAll("-", " ")}
            </Link>
          ))}
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(projects ?? []).slice(0, 3).map((pr) => (
            <Link key={pr.id} to="/case-studies" data-testid={`project-card-${pr.id}`} className="group overflow-hidden rounded-2xl border border-border bg-card">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={pr.image_url} alt={pr.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <span className={badgeVariants({ variant: "secondary" })}>{pr.category}</span>
                <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">{pr.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{pr.location} · {pr.area}</p>
              </div>
            </Link>
          ))}
          {!projects ? <SkeletonGrid count={3} className="sm:col-span-2 lg:col-span-3" /> : null}
        </div>
      </Container>

      {/* Final CTA */}
      <Container className="pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-secondary p-8 sm:p-12">
          <Leaf className="animate-float absolute -right-6 -top-6 size-40 text-primary/10" aria-hidden />
          <div className="relative max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">Ask AJ — your AI garden consultant</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Not sure what your garden needs? Ask a photo.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Upload a picture, get instant advice on plants, sunlight and budget — then walk into the nursery with
              a plan already made.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryLink to="/ai-consultant" testid="home-ask-aj-cta" className="gap-2">
                <MessageSquareText className="size-4" /> Ask AJ now
              </PrimaryLink>
              <PrimaryLink to="/contact" variant="outline" testid="home-contact-cta">Visit the nursery</PrimaryLink>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
