import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft,
  Building2,
  CalendarClock,
  FileBarChart,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

type ModulePreview = {
  title: string;
  eyebrow: string;
  copy: string;
  icon: LucideIcon;
  highlights: string[];
};

export type ModuleKey =
  | "orgSetup"
  | "allocations"
  | "bookings"
  | "maintenance"
  | "audits"
  | "reports";

const modulePreviews: Record<ModuleKey, ModulePreview> = {
  orgSetup: {
    title: "Org Setup",
    eyebrow: "People and departments",
    copy: "Shape departments, roles, and approval paths before assets move across the organization.",
    icon: Users,
    highlights: [
      "Department hierarchy",
      "Role-based visibility",
      "Employee ownership",
    ],
  },
  allocations: {
    title: "Allocations",
    eyebrow: "Asset movement",
    copy: "Review handoffs, ownership changes, and transfers through a focused operations queue.",
    icon: ArrowRightLeft,
    highlights: ["Transfer approvals", "Custodian history", "Return tracking"],
  },
  bookings: {
    title: "Resource Bookings",
    eyebrow: "Shared equipment",
    copy: "Coordinate projectors, meeting-room gear, and bookable devices without calendar confusion.",
    icon: CalendarClock,
    highlights: [
      "Availability windows",
      "Booking conflicts",
      "Upcoming returns",
    ],
  },
  maintenance: {
    title: "Maintenance Requests",
    eyebrow: "Service operations",
    copy: "Prioritize service tickets, keep repair notes close, and bring assets back into circulation faster.",
    icon: Wrench,
    highlights: ["Ticket priority", "Repair status", "Vendor notes"],
  },
  audits: {
    title: "Asset Audits",
    eyebrow: "Control checks",
    copy: "Run department checks, reconcile physical inventory, and close compliance gaps quickly.",
    icon: ShieldCheck,
    highlights: ["Audit batches", "Exception tracking", "Verification logs"],
  },
  reports: {
    title: "Reports & Analytics",
    eyebrow: "Fleet intelligence",
    copy: "Turn inventory, utilization, and maintenance data into leadership-ready operational insight.",
    icon: FileBarChart,
    highlights: ["Utilization trends", "Cost visibility", "Export-ready views"],
  },
};

export function ModulePlaceholder({ feature }: { feature: ModuleKey }) {
  const preview = modulePreviews[feature];
  const Icon = preview.icon;

  return (
    <section className="surface-card overflow-hidden p-6 md:p-8">
      <div className="placeholder-grid gap-8 lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-lg border border-white/50 bg-white/45 px-3 py-1 text-xs font-semibold tracking-widest text-primary uppercase backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <Building2 className="size-3.5" />
            {preview.eyebrow}
          </p>
          <h2 className="mt-5 text-4xl leading-tight font-semibold md:text-5xl">
            {preview.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            {preview.copy}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {preview.highlights.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-white/50 bg-white/35 p-4 text-sm font-medium dark:border-white/10 dark:bg-white/5"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex aspect-square items-center justify-center rounded-lg border border-white/50 bg-white/35 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <Icon className="size-24 text-primary" />
        </div>
      </div>
    </section>
  );
}
