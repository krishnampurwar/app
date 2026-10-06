import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Search, ShoppingCart } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Plant } from "@/lib/types";
import { Container, PageHero, SectionHeading, SkeletonGrid, WhatsAppButton, rupees } from "@/components/Shared";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORY_LABELS: Record<string, string> = {
  all: "All plants",
  indoor: "Indoor",
  succulent: "Succulents & Cacti",
  flowering: "Flowering",
  bonsai: "Bonsai",
  outdoor: "Outdoor",
  herb: "Herbs & Medicinal",
};

const SUN_LABELS: Record<string, string> = { all: "Any light", low: "Low light", medium: "Bright indirect", direct: "Direct sun" };
const CARE_LABELS: Record<string, string> = { all: "Any care", low: "Very low", medium: "Medium", high: "High" };
const PLACE_LABELS: Record<string, string> = {
  all: "Any space",
  balcony: "Balcony",
  bedroom: "Bedroom",
  living_room: "Living room",
  office: "Office",
  terrace: "Terrace",
  garden: "Garden",
};

const BADGE_LABELS: Record<string, string> = {
  air_purifying: "Air purifying",
  pet_safe: "Pet safe",
  night_oxygen: "Night oxygen",
  flowering: "Flowering",
  hardy: "Hardy",
  rare: "Rare find",
};

export default function Shop() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sunlight, setSunlight] = useState("all");
  const [maintenance, setMaintenance] = useState("all");
  const [placement, setPlacement] = useState("all");
  const [selected, setSelected] = useState<Plant | null>(null);

  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (sunlight !== "all") params.set("sunlight", sunlight);
  if (maintenance !== "all") params.set("maintenance", maintenance);
  if (placement !== "all") params.set("location", placement);
  if (search.trim()) params.set("search", search.trim());

  const { data: plants, isPending } = useQuery({
    queryKey: ["plants", params.toString()],
    queryFn: () => apiGet<Plant[]>(`/plants?${params.toString()}`),
  });

  return (
    <div>
      <PageHero
        overline="Plant nursery — shop"
        title="Nursery-direct plants, hardened for Gurgaon"
        description="500+ varieties acclimatised to NCR summers, monsoons and winters. Free repotting, 14-day establishment guarantee, same-day delivery."
      />

      <Container className="py-14">
        {/* Filter bar */}
        <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid="shop-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plants…"
              className="pl-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="shop-filter-category"><SelectValue>{CATEGORY_LABELS[category]}</SelectValue></SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Sunlight</Label>
            <Select value={sunlight} onValueChange={setSunlight}>
              <SelectTrigger data-testid="shop-filter-sunlight"><SelectValue>{SUN_LABELS[sunlight]}</SelectValue></SelectTrigger>
              <SelectContent>
                {Object.entries(SUN_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Care effort</Label>
            <Select value={maintenance} onValueChange={setMaintenance}>
              <SelectTrigger data-testid="shop-filter-maintenance"><SelectValue>{CARE_LABELS[maintenance]}</SelectValue></SelectTrigger>
              <SelectContent>
                {Object.entries(CARE_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Placement</Label>
            <Select value={placement} onValueChange={setPlacement}>
              <SelectTrigger data-testid="shop-filter-placement"><SelectValue>{PLACE_LABELS[placement]}</SelectValue></SelectTrigger>
              <SelectContent>
                {Object.entries(PLACE_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(plants ?? []).map((p) => (
            <article key={p.id} data-testid={`shop-plant-card-${p.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative aspect-square overflow-hidden">
                <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                  {p.badges.slice(0, 2).map((b) => (
                    <span key={b} className={badgeVariants({ variant: "secondary" }) + " bg-white/85 text-[10px] text-foreground backdrop-blur"}>
                      {BADGE_LABELS[b] ?? b}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-heading text-base font-semibold leading-tight text-foreground">{p.name}</h2>
                  <span className="shrink-0 font-heading text-base font-semibold text-primary">{rupees(p.price)}</span>
                </div>
                <p className="mt-1 text-xs capitalize text-muted-foreground">
                  {CATEGORY_LABELS[p.category] ?? p.category} · {SUN_LABELS[p.sunlight] ?? p.sunlight}
                </p>
                <div className="mt-3 flex flex-1 items-end gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelected(p)} data-testid={`shop-plant-details-${p.slug}`}>
                    Details
                  </Button>
                  <WhatsAppButton
                    text={`Hi AJ Nursery! I want to buy the ${p.name} (${rupees(p.price)}). Is it available?`}
                    testid={`shop-plant-buy-${p.slug}`}
                    variant="default"
                    size="sm"
                  >
                    <ShoppingCart className="size-3.5" /> Buy
                  </WhatsAppButton>
                </div>
              </div>
            </article>
          ))}
          {isPending ? <SkeletonGrid count={8} className="sm:col-span-2 lg:col-span-4" /> : null}
          {plants && plants.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-4">
              <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                <p className="font-heading text-lg font-semibold">No plants match those filters</p>
                <p className="mt-1 text-sm text-muted-foreground">Loosen a filter — or WhatsApp us, new stock lands weekly.</p>
              </div>
            </div>
          ) : null}
        </div>
      </Container>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden" data-testid="shop-plant-dialog">
          {selected ? (
            <div>
              <div className="aspect-[16/9] overflow-hidden">
                <img src={selected.image_url} alt={selected.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <DialogTitle className="font-heading text-2xl font-semibold text-foreground">{selected.name}</DialogTitle>
                  <span className="font-heading text-xl font-semibold text-primary">{rupees(selected.price)}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selected.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {selected.badges.map((b) => (
                    <Badge key={b} variant="secondary">{BADGE_LABELS[b] ?? b}</Badge>
                  ))}
                  <Badge variant="outline" className="capitalize">{selected.maintenance} maintenance</Badge>
                  <Badge variant="outline" className="capitalize">{selected.sunlight} light</Badge>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Great for: {selected.locations.map((l) => PLACE_LABELS[l] ?? l).join(", ")}
                </p>
                <div className="mt-5 flex gap-2">
                  <WhatsAppButton
                    text={`Hi AJ Nursery! I want to buy the ${selected.name} (${rupees(selected.price)}). Is it available?`}
                    testid="shop-dialog-buy-whatsapp"
                    variant="default"
                    className="flex-1 justify-center"
                  >
                    Buy on WhatsApp
                  </WhatsAppButton>
                  <a
                    href="/shop"
                    data-testid="shop-dialog-close"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelected(null);
                    }}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Keep browsing
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Container className="pb-16">
        <div className="rounded-3xl bg-secondary p-8 text-center sm:p-10">
          <SectionHeading
            center
            overline="Bulk & corporate"
            title="Outfitting an office, café or event?"
            description="We supply and style plants at scale — with monthly replenishment contracts and branded gifting."
          />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <WhatsAppButton text="Hi AJ Nursery, I need a bulk / corporate plant supply quote." testid="shop-bulk-whatsapp" variant="default">
              <MessageCircle className="size-4" /> Ask for bulk rates
            </WhatsAppButton>
          </div>
        </div>
      </Container>
    </div>
  );
}
