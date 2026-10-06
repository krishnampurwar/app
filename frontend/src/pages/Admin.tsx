import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Flame, Lock, MessageCircle, Snowflake, Sun, Waves } from "lucide-react";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type { Lead } from "@/lib/types";
import { Container, PageHero, SectionHeading, rupees } from "@/components/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { waLink } from "@/lib/whatsapp";

const SCORE_STYLE: Record<string, string> = {
  hot: "bg-red-100 text-red-800 border-red-200",
  warm: "bg-amber-100 text-amber-800 border-amber-200",
  cold: "bg-muted text-muted-foreground border-border",
};

const STATUS_OPTIONS = ["new", "in_progress", "converted", "closed"];

export default function Admin() {
  const qc = useQueryClient();
  const [pin, setPin] = useState(() => sessionStorage.getItem("aj-admin-pin") ?? "");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem("aj-admin-pin"));

  const login = useMutation({
    mutationFn: () => apiPost<{ ok: boolean }>("/admin/login", { pin }),
    onSuccess: () => {
      sessionStorage.setItem("aj-admin-pin", pin);
      setAuthed(true);
      toast.success("Welcome back — here's the pipeline.");
    },
    onError: () => toast.error("Wrong PIN. Default demo PIN is 9079."),
  });

  const { data: leads, isPending } = useQuery({
    queryKey: ["admin-leads", pin],
    queryFn: () => apiGet<Lead[]>("/admin/leads", { "X-Admin-PIN": pin }),
    enabled: authed,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch<Lead>(`/admin/leads/${id}`, { status }, { "X-Admin-PIN": pin }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-leads"] }),
    onError: () => toast.error("Could not update status."),
  });

  const filtered = useMemo(
    () => (leads ?? []).filter((l) => scoreFilter === "all" || l.score === scoreFilter),
    [leads, scoreFilter],
  );

  const stats = useMemo(() => {
    const all = leads ?? [];
    return {
      total: all.length,
      hot: all.filter((l) => l.score === "hot").length,
      warm: all.filter((l) => l.score === "warm").length,
      cold: all.filter((l) => l.score === "cold").length,
      pipeline: all.reduce((sum, l) => sum + (l.budget_max ?? l.budget_min ?? 0), 0),
    };
  }, [leads]);

  function exportCsv() {
    const rows = [["created", "name", "phone", "source", "interest", "score", "status", "location", "message", "budget_min", "budget_max"]];
    (filtered ?? []).forEach((l) =>
      rows.push([l.created_at, l.name, l.phone, l.source, l.interest, l.score, l.status, l.location, l.message.replace(/[\n,]/g, " "), String(l.budget_min ?? ""), String(l.budget_max ?? "")]),
    );
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aj-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!authed) {
    return (
      <div>
        <PageHero overline="Operations" title="Lead command center" description="PIN-gated view of every enquiry captured across the AI suite, shop and contact forms." />
        <Container className="max-w-md py-16">
          <form
            className="rounded-2xl border border-border bg-card p-8"
            data-testid="admin-login-form"
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate();
            }}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary"><Lock className="size-5" /></span>
            <h2 className="mt-4 font-heading text-xl font-semibold text-foreground">Enter the admin PIN</h2>
            <Input
              data-testid="admin-pin-input"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="mt-4 text-center font-mono text-lg tracking-[0.4em]"
            />
            <Button type="submit" className="mt-4 w-full" data-testid="admin-login-button" disabled={login.isPending || !pin}>
              {login.isPending ? "Checking…" : "Unlock dashboard"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Demo PIN: 9079 — change via ADMIN_PIN in backend/.env</p>
          </form>
        </Container>
      </div>
    );
  }

  const cards = [
    { icon: Waves, label: "Total leads", value: String(stats.total) },
    { icon: Flame, label: "Hot", value: String(stats.hot) },
    { icon: Sun, label: "Warm", value: String(stats.warm) },
    { icon: Snowflake, label: "Cold", value: String(stats.cold) },
  ];

  return (
    <div>
      <PageHero overline="Operations" title="Lead command center" description="Every AI tool, quiz, proposal and contact form lands here — scored and timestamped." />
      <Container className="py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border bg-card p-5" data-testid={`admin-stat-${c.label.toLowerCase()}`}>
              <c.icon className="size-5 text-primary" />
              <p className="mt-3 font-heading text-3xl font-semibold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-primary/40 bg-secondary p-5" data-testid="admin-stat-pipeline">
            <p className="text-xs font-medium text-primary">Revenue pipeline</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-foreground">{rupees(stats.pipeline)}</p>
            <p className="text-xs text-muted-foreground">Sum of quoted budgets</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" data-testid="admin-score-filter">
            {["all", "hot", "warm", "cold"].map((s) => (
              <button
                key={s}
                type="button"
                data-testid={`admin-filter-${s}`}
                onClick={() => setScoreFilter(s)}
                className={
                  badgeVariants({ variant: scoreFilter === s ? "default" : "outline" }) + " cursor-pointer capitalize"
                }
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" data-testid="admin-export-csv" className="gap-1.5" onClick={exportCsv}>
              <Download className="size-3.5" /> Export CSV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              data-testid="admin-logout"
              onClick={() => {
                sessionStorage.removeItem("aj-admin-pin");
                setAuthed(false);
                setPin("");
              }}
            >
              Lock dashboard
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card" data-testid="admin-leads-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Interest / message</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Dispatch</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Loading leads…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No leads yet — submit any AI tool on the site and it lands here instantly.</TableCell></TableRow>
              ) : (
                filtered.map((l) => (
                  <TableRow key={l.id} data-testid={`admin-lead-row-${l.id}`}>
                    <TableCell>
                      <p className="font-medium text-foreground">{l.name || <span className="text-muted-foreground">—</span>}</p>
                      <p className="text-xs text-muted-foreground">{l.phone || "no phone"}</p>
                      <p className="text-[11px] text-muted-foreground">{new Date(l.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{l.source.replaceAll("_", " ")}</Badge></TableCell>
                    <TableCell className="max-w-72">
                      {l.interest ? <p className="text-sm text-foreground">{l.interest}</p> : null}
                      {l.message ? <p className="line-clamp-2 text-xs text-muted-foreground">{l.message}</p> : null}
                      {l.has_photo ? <Badge variant="outline" className="mt-1 text-[10px]">📷 photo attached</Badge> : null}
                    </TableCell>
                    <TableCell>
                      <span className={badgeVariants({ variant: "outline" }) + " border capitalize " + (SCORE_STYLE[l.score] ?? "")} data-testid={`admin-lead-score-${l.score}`}>{l.score}</span>
                    </TableCell>
                    <TableCell>
                      <Select value={l.status} onValueChange={(v) => statusMutation.mutate({ id: l.id, status: v })}>
                        <SelectTrigger size="sm" data-testid={`admin-lead-status-${l.id}`} className="capitalize"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (<SelectItem key={s} value={s} className="capitalize">{s.replaceAll("_", " ")}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      {l.phone ? (
                        <a
                          href={waLink(`Hello ${l.name || "there"}, this is AJ Heaven's Harvest Nursery following up on your ${l.interest || "garden enquiry"}.`)}
                          target="_blank"
                          rel="noreferrer"
                          data-testid={`admin-lead-whatsapp-${l.id}`}
                          className={badgeVariants({ variant: "secondary" }) + " cursor-pointer gap-1 text-[#206d43]"}
                        >
                          <MessageCircle className="size-3.5" /> WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Container>
    </div>
  );
}
