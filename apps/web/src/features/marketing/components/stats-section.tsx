import { Animate } from "@/components/ui/animate";

const stats = [
  {
    value: "0",
    unit: "",
    label: "Double-Allocations Possible",
    sub: "DB-level unique constraint on active allocations",
  },
  {
    value: "7",
    unit: "",
    label: "Asset Lifecycle States",
    sub: "Available · Allocated · Reserved · Under Maintenance · Lost · Retired · Disposed",
  },
  {
    value: "4",
    unit: "",
    label: "Role-Gated Permission Tiers",
    sub: "Admin · Asset Manager · Department Head · Employee",
  },
  {
    value: "100%",
    unit: "",
    label: "Audit Trail Coverage",
    sub: "Every state change logged — append-only, never editable",
  },
];

export function StatsSection() {
  return (
    <section className="relative overflow-hidden py-20">
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10" />
        <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Animate variant="slide-up">
          <p className="mb-12 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Built on correctness, not promises
          </p>
        </Animate>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map(({ value, unit, label, sub }, i) => (
            <Animate key={label} variant="slide-up" delayMs={i * 70}>
              <div className="surface-card flex flex-col items-center gap-2 p-6 text-center transition-all hover:-translate-y-1">
                <p className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
                  {value}
                  <span className="text-primary">{unit}</span>
                </p>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {sub}
                </p>
              </div>
            </Animate>
          ))}
        </div>
      </div>
    </section>
  );
}
