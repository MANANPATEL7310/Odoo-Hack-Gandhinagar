import { useState } from "react";
import {
  Package,
  ArrowLeftRight,
  CalendarRange,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  Users,
} from "lucide-react";
import { Animate } from "@/components/ui/animate";
import { cn } from "@/lib/cn";

const features = [
  {
    icon: Package,
    title: "Asset Registry & Lifecycle",
    badge: "Core",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    description:
      "Register assets with auto-generated tags (AF-0001), serial number uniqueness, category-specific fields, and a strict 7-state lifecycle machine — Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed.",
    highlights: [
      "Auto-generated Asset Tags",
      "7 enforced lifecycle states",
      "Category-specific metadata schemas",
      "Serial number uniqueness (409 on duplicate)",
    ],
  },
  {
    icon: ArrowLeftRight,
    title: "Allocation & Transfer",
    badge: "P0",
    badgeColor: "bg-secondary/10 text-secondary border-secondary/20",
    description:
      "One active allocation per asset — enforced at service layer AND by a DB partial unique index. On conflict, the UI doesn't show a plain error; it guides you to a Transfer Request flow with the current holder's info.",
    highlights: [
      "Zero double-allocations guaranteed",
      "Conflict → guided Transfer Request path",
      "DB-level race-condition guard",
      "Expected Return Date tracking",
    ],
  },
  {
    icon: CalendarRange,
    title: "Resource Booking",
    badge: "P0",
    badgeColor: "bg-secondary/10 text-secondary border-secondary/20",
    description:
      "Time-slot booking with half-open interval overlap detection: a booking conflicts if start1 < end2 AND start2 < end1. Adjacent bookings (10:00–11:00 after 9:00–10:00) are correctly allowed. Concurrent requests are guarded by a DB exclusion constraint.",
    highlights: [
      "Mathematically precise overlap rule",
      "Adjacent bookings always succeed",
      "Conflict highlights the clashing slot on calendar",
      "Status: Upcoming → Ongoing → Completed",
    ],
  },
  {
    icon: Wrench,
    title: "Maintenance Workflow",
    badge: "P0",
    badgeColor: "bg-warning/10 text-warning border-warning/20",
    description:
      "5-stage approval workflow gated behind an Asset Manager. On Approved, the asset flips to Under Maintenance regardless of prior status — including Allocated. On Resolved, it correctly restores the prior allocation if it still exists.",
    highlights: [
      "Pending → Approved → In Progress → Resolved",
      "Maintenance overrides Allocated status",
      "Prior allocation restored on Resolved",
      "Rejection requires a reason (validated)",
    ],
  },
  {
    icon: ClipboardCheck,
    title: "Audit Cycles",
    badge: "P0",
    badgeColor: "bg-danger/10 text-danger border-danger/20",
    description:
      "Create audit cycles with a snapshotted scope (department/location), assign auditors, and let them mark each asset Verified, Missing, or Damaged. On close, Missing items auto-update to Lost and a discrepancy report is generated.",
    highlights: [
      "Scope snapshotted at cycle creation",
      "Auditor-facing per-item checklist",
      "Auto-generate discrepancy report on close",
      "Unverified items → Unresolved (not silently dropped)",
    ],
  },
  {
    icon: BarChart3,
    title: "Dashboard & Reports",
    badge: "P0/P1",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    description:
      "Role-scoped real-time KPI dashboard — Employee sees their own items, Department Head sees department scope, Admin/Asset Manager see org-wide. Reports surface utilization trends, maintenance frequency, and booking heatmaps.",
    highlights: [
      "KPI cards: Available, Allocated, Overdue, Pending",
      "Role-scoped data — no cross-department leakage",
      "Overdue items visually separated from upcoming",
      "Exportable analytics reports",
    ],
  },
  {
    icon: Bell,
    title: "Notifications & Activity Logs",
    badge: "P0",
    badgeColor: "bg-secondary/10 text-secondary border-secondary/20",
    description:
      "Every meaningful state change emits a notification to the relevant recipient. The Activity Log is an append-only, Admin-visible compliance trail covering every entity-level action — never credentials, always context.",
    highlights: [
      "Notification on every state transition",
      "Recipient-scoped visibility (no leakage)",
      "Append-only activity log for compliance",
      "Notification failure never blocks the transaction",
    ],
  },
  {
    icon: Users,
    title: "Org Setup & Role Management",
    badge: "Admin",
    badgeColor:
      "bg-neutral/10 text-neutral-dark dark:text-neutral-light border-neutral/20",
    description:
      "Admins define departments (with optional hierarchy), asset categories (with custom field schemas), and manage the employee directory. Roles are assigned — never self-selected — and Admin accounts are bootstrap-only (no UI promotion to Admin).",
    highlights: [
      "Department hierarchy with cycle detection",
      "Custom field schemas per category",
      "Role assignment: Employee → Dept Head / Asset Manager",
      "Admin provisioned out-of-band (no self-elevation ever)",
    ],
  },
];

export function FeaturesSection() {
  const [active, setActive] = useState(0);
  const feature = features[active]!;
  const Icon = feature.icon;

  return (
    <section id="features" className="relative py-24">
      {/* Background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <Animate variant="slide-up">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold tracking-widest text-primary uppercase">
              Features
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Every module your organization needs
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              10 features from the problem statement — all P0 correctness
              requirements implemented, not just displayed. Click any feature to
              see what makes it rigorous.
            </p>
          </div>
        </Animate>

        <div className="features-grid grid grid-cols-1 gap-8">
          {/* Feature list */}
          <Animate variant="slide-up" delayMs={100}>
            <div className="flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-x-visible lg:pb-0">
              {features.map(({ icon: FIcon, title, badge, badgeColor }, i) => (
                <button
                  key={title}
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 lg:w-full",
                    active === i
                      ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <FIcon className="size-4 shrink-0" />
                  <span className="text-sm font-medium">{title}</span>
                  <span
                    className={cn(
                      "ml-auto hidden shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold lg:inline-block",
                      badgeColor,
                    )}
                  >
                    {badge}
                  </span>
                </button>
              ))}
            </div>
          </Animate>

          {/* Feature detail */}
          <Animate key={active} variant="scale-in">
            <div className="surface-card flex h-full flex-col gap-6 p-8">
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-7" />
                </div>
                <div>
                  <span
                    className={cn(
                      "mb-2 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      feature.badgeColor,
                    )}
                  >
                    {feature.badge}
                  </span>
                  <h3 className="text-xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                </div>
              </div>

              <p className="text-base leading-relaxed text-muted-foreground">
                {feature.description}
              </p>

              <div className="mt-auto">
                <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Implementation Guarantees
                </p>
                <ul className="flex flex-col gap-2.5">
                  {feature.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2.5 text-sm text-foreground"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                        <svg viewBox="0 0 12 12" fill="none" className="size-3">
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Animate>
        </div>
      </div>
    </section>
  );
}
