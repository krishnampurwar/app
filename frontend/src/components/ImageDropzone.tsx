import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Resize an uploaded photo client-side so the AI payload stays small (max edge px, JPEG). */
function resizeImage(file: File, maxEdge: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("could not read image"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("could not read file"));
    reader.readAsDataURL(file);
  });
}

export default function ImageDropzone({
  value,
  onChange,
  testid,
  hint = "Clear daylight photos give the best results (JPG/PNG).",
  aspect = "aspect-[4/3]",
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  testid: string;
  hint?: string;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function accept(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      onChange(await resizeImage(file, 1280));
    } finally {
      setBusy(false);
    }
  }

  if (value) {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-card", aspect)} data-testid={`${testid}-preview`}>
        <img src={value} alt="Uploaded" className="h-full w-full object-cover" />
        <button
          type="button"
          data-testid={`${testid}-remove`}
          onClick={() => onChange(null)}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
          aria-label="Remove photo"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      data-testid={testid}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void accept(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "flex aspect-[16/7] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-card/70 p-6 text-center transition-colors",
        dragging ? "border-primary bg-secondary" : "border-input hover:border-primary/50 hover:bg-secondary/60",
      )}
    >
      {busy ? (
        <Loader2 className="size-7 animate-spin text-primary" />
      ) : (
        <ImagePlus className="size-7 text-primary" />
      )}
      <span className="text-sm font-medium text-foreground">
        {busy ? "Preparing photo…" : "Upload a photo — click or drag & drop"}
      </span>
      <span className="max-w-xs text-xs text-muted-foreground">{hint}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          void accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </button>
  );
}
