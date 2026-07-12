import { Boxes } from "lucide-react";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex size-11 items-center justify-center rounded-lg border border-white/60 bg-primary text-white shadow-lg shadow-primary/20 dark:border-white/10">
        <span className="absolute inset-x-2 top-1 h-px bg-white/70" />
        <Boxes className="size-5" />
      </div>
      <div>
        <p className="text-xl font-semibold tracking-tight text-foreground">
          AssetFlow
        </p>
      </div>
    </div>
  );
}
