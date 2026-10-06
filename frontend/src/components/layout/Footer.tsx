import { Link } from "react-router-dom";
import { MessageCircle, Phone } from "lucide-react";
import { AI_TOOL_LINKS, LOGO_URL, SERVICE_LINKS } from "@/components/layout/Header";
import { Container } from "@/components/Shared";
import { WA, WHATSAPP_DISPLAY } from "@/lib/whatsapp";

export default function Footer() {
  return (
    <footer className="no-print mt-24 bg-[#0d1b13] text-[#f4f7f4]">
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src={LOGO_URL} alt="AJ Heaven's Harvest Nursery" className="h-16 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#a2b8aa]">
            Gurgaon's premier botanical studio — nursery-grown plants, landscape craftsmanship and an AI garden
            suite that turns any space green.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-sm">
            <a href="tel:+919336239079" className="flex items-center gap-2 text-[#c2d4c9] hover:text-white" data-testid="footer-phone-link">
              <Phone className="size-4" /> {WHATSAPP_DISPLAY}
            </a>
            <a href={WA.general} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#c2d4c9] hover:text-white" data-testid="footer-whatsapp-link">
              <MessageCircle className="size-4" /> WhatsApp the nursery
            </a>
          </div>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8ed6b1]">Services</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[#c2d4c9]">
            {SERVICE_LINKS.map((s) => (
              <li key={s.slug}>
                <Link to={`/services/${s.slug}`} className="hover:text-white" data-testid="footer-service-link">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8ed6b1]">AI Garden Suite</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[#c2d4c9]">
            {AI_TOOL_LINKS.map((t) => (
              <li key={t.href}>
                <Link to={t.href} className="hover:text-white" data-testid="footer-ai-link">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8ed6b1]">Serving Gurgaon</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[#c2d4c9]">
            {["DLF Phases 1-5", "Golf Course Road", "Golf Course Extension Road", "Sohna Road & South City", "New Gurgaon", "Manesar & NH-48"].map((n) => (
              <li key={n}>
                <Link to="/locations" className="hover:text-white" data-testid="footer-location-link">
                  {n}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-[#a2b8aa] sm:flex-row">
          <span>© {new Date().getFullYear()} AJ Heaven's Harvest Nursery, Gurgaon.</span>
          <span className="font-mono uppercase tracking-widest">Grown with patience, built with care.</span>
        </Container>
      </div>
    </footer>
  );
}
