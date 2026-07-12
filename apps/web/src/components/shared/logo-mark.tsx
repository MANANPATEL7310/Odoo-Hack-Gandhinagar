import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/favicon.png"
        className="size-11 rounded-lg object-cover shadow-lg shadow-primary/10"
        alt="AssetFlow"
      />
      <div>
        <p className="text-xl font-semibold tracking-tight text-foreground">
          AssetFlow
        </p>
      </div>
    </div>
  );
}
