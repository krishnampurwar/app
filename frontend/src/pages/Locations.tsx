import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { LocationPage } from "@/lib/types";
import { Container, PageHero, SectionHeading, SkeletonGrid } from "@/components/Shared";
import { badgeVariants } from "@/components/ui/badge";

export default function Locations() {
  const { data: locations } = useQuery({ queryKey: ["locations"], queryFn: () => apiGet<LocationPage[]>("/locations") });

  return (
    <div>
      <PageHero
        overline="Gurgaon, area by area"
        title="Landscaping that knows your neighbourhood"
        description="Wind on the 22nd floor, hard water in New Gurgaon, heritage shade in Sector 14 — each area page carries its own climate notes, plant picks and service mix."
      />
      <Container className="py-16">
        <SectionHeading overline="Micro-markets" title="Where we work in Gurgaon" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(locations ?? []).map((loc) => (
            <Link
              key={loc.slug}
              to={`/locations/${loc.slug}`}
              data-testid={`location-card-${loc.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/10"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img src={loc.image_url} alt={loc.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <h2 className="font-heading text-lg font-semibold text-foreground">{loc.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{loc.intro}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {loc.popular_services.slice(0, 3).map((ps) => (
                    <span key={ps} className={badgeVariants({ variant: "secondary" }) + " text-[11px]"}>{ps}</span>
                  ))}
                </div>
                <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-primary" /> {loc.neighborhoods.length} localities covered
                </p>
              </div>
            </Link>
          ))}
          {!locations ? <SkeletonGrid count={6} className="sm:col-span-2 lg:col-span-3" /> : null}
        </div>
      </Container>
    </div>
  );
}
