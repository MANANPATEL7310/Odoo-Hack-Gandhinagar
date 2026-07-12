import {
  Settings,
  PackagePlus,
  ArrowLeftRight,
  Wrench,
  ClipboardCheck,
  LayoutDashboard,
} from "lucide-react";
import { Animate } from "@/components/ui/animate";

const steps = [
  {
    icon: Settings,
    label: "Setup",
    title: "Admin bootstraps the org",
    description:
      "Create departments with optional hierarchy, define asset categories with custom field schemas, and promote trusted employees to Asset Manager or Department Head.",
    color: "text-primary",
    ring: "ring-primary/30",
    bg: "bg-primary/10",
    glow: "shadow-primary/20",
  },
  {
    icon: PackagePlus,
    label: "Register",
    title: "Asset Manager registers assets",
    description:
      "Every physical asset is registered with a serial number, condition, location, and category. The system generates the asset tag and keeps the current status in the database.",
    color: "text-secondary",
    ring: "ring-secondary/30",
    bg: "bg-secondary/10",
    glow: "shadow-secondary/20",
  },
  {
    icon: ArrowLeftRight,
    label: "Assign",
    title: "Allocate or Book resources",
    description:
      "Assets are allocated to employees or departments. Shared resources are booked by time slot, with conflicts rejected at both service and database level.",
    color: "text-primary",
    ring: "ring-primary/30",
    bg: "bg-primary/10",
    glow: "shadow-primary/20",
  },
  {
    icon: Wrench,
    label: "Maintain",
    title: "Maintenance requests flow through approval",
    description:
      "Employees raise maintenance requests. Asset Manager approves or rejects. On approval, the asset flips to Under Maintenance. On resolution, prior custody is correctly restored.",
    color: "text-warning",
    ring: "ring-warning/30",
    bg: "bg-warning/10",
    glow: "shadow-warning/20",
  },
  {
    icon: ClipboardCheck,
    label: "Audit",
    title: "Audit cycles verify and report",
    description:
      "Admin or Asset Manager creates a cycle with scoped assets and assigned auditors. Auditors mark items Verified, Missing, or Damaged. On close, a discrepancy report is auto-generated.",
    color: "text-danger",
    ring: "ring-danger/30",
    bg: "bg-danger/10",
    glow: "shadow-danger/20",
  },
  {
    icon: LayoutDashboard,
    label: "Monitor",
    title: "Dashboard keeps everyone informed",
    description:
      "Every role sees a real-time, scoped KPI view — overdue items, pending transfers, active bookings. Notifications fire on every state change. No manual follow-up needed.",
    color: "text-secondary",
    ring: "ring-secondary/30",
    bg: "bg-secondary/10",
    glow: "shadow-secondary/20",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative mx-auto max-w-7xl px-4 py-24 md:px-6"
    >
      {/* Header */}
      <Animate variant="slide-up">
        <div className="mb-16 text-center">
          <span className="mb-3 inline-block rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1 text-xs font-semibold tracking-widest text-secondary uppercase">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            From setup to fully tracked operations
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            AssetFlow mirrors the real-world workflow your organization already
            follows — and adds enforced rules at every step so nothing slips
            through.
          </p>
        </div>
      </Animate>

      {/* Steps */}
      <div className="relative">
        {/* Vertical connector line (desktop) */}
        <div
          aria-hidden
          className="how-it-works-connector absolute top-0 hidden h-full w-px bg-gradient-to-b from-primary/30 via-secondary/30 to-transparent lg:block"
        />

        <div className="flex flex-col gap-8">
          {steps.map(
            (
              { icon: Icon, label, title, description, color, ring, bg, glow },
              i,
            ) => {
              const isEven = i % 2 === 0;
              return (
                <Animate key={label} variant="slide-up" delayMs={i * 80}>
                  <div
                    className={`flex flex-col items-center gap-6 lg:flex-row ${
                      isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Card — left or right */}
                    <div className="how-it-works-card w-full">
                      <div
                        className={`surface-card flex flex-col gap-4 p-6 transition-all hover:-translate-y-1 hover:shadow-xl ${glow}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex size-10 items-center justify-center rounded-xl ${bg} ${color}`}
                          >
                            <Icon className="size-5" />
                          </div>
                          <span className="text-sm font-semibold text-muted-foreground">
                            {label}
                          </span>
                        </div>
                        <div>
                          <h3 className="mb-2 text-lg font-bold text-foreground">
                            {title}
                          </h3>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Center node */}
                    <div className="flex shrink-0 items-center justify-center">
                      <div
                        className={`flex size-12 items-center justify-center rounded-full border-2 bg-surface text-sm font-bold ring-4 ${color} ${ring}`}
                      >
                        <Icon className="size-5" />
                      </div>
                    </div>

                    {/* Empty spacer on opposite side */}
                    <div className="how-it-works-card hidden lg:block" />
                  </div>
                </Animate>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}
