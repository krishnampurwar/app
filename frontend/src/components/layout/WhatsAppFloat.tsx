import { MessageCircle } from "lucide-react";
import { WA } from "@/lib/whatsapp";

export default function WhatsAppFloat() {
  return (
    <a
      href={WA.general}
      target="_blank"
      rel="noreferrer"
      data-testid="floating-whatsapp-trigger"
      aria-label="Chat with AJ Nursery on WhatsApp"
      className="no-print fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-[#1faa55] text-white shadow-lg shadow-emerald-900/30 transition-transform hover:scale-105"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
