import {
  Copy,
  Calendar,
  Wrench,
  ClipboardList,
  Users,
  GitBranch,
} from "lucide-react";
import { Animate } from "@/components/ui/animate";

const problems = [
  {
    icon: Copy,
    title: "Double-Allocations",
    description:
      "The same laptop assigned to two people at once — spreadsheets have no enforced uniqueness. AssetFlow blocks this at the database level.",
    color: "text-danger",
    bg: "bg-danger/10",
  },
  {
    icon: Calendar,
    title: "Booking Conflicts",
    description:
      "Conference rooms double-booked, discovered only on arrival. AssetFlow rejects overlapping bookings with half-open interval math, not hopes.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Wrench,
    title: "Unauthorized Maintenance",
    description:
      "Repairs starting without approval and asset status frozen on 'under repair' indefinitely. AssetFlow gates every step behind a role-checked workflow.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: ClipboardList,
    title: "Missing Audit Trails",
    description:
      "No formal verification process means missing assets discovered months late. AssetFlow closes audit cycles with auto-generated discrepancy reports.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Self-Reported Roles",
    description:
      "Anyone with sheet access can informally escalate authority. In AssetFlow, roles are assigned by Admins only — never self-selected or client-supplied.",
    color: "text-danger",
    bg: "bg-danger/10",
  },
  {
    icon: GitBranch,
    title: "Manual Reconciliation",
    description:
      "Hours lost asking 'who actually has this?' across departments. AssetFlow keeps a live custody record per asset, updated on every transition.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

export function ProblemSection() {
  return (
    <section
      id="problem"
      className="relative mx-auto max-w-7xl px-4 py-24 md:px-6"
    >
      {/* Section header */}
      <Animate variant="slide-up">
        <div className="mb-16 text-center">
          <span className="mb-3 inline-block rounded-full border border-danger/30 bg-danger/10 px-4 py-1 text-xs font-semibold tracking-widest text-danger uppercase">
            The Problem
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Why spreadsheets will always fail you
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Manual tracking fails not because of missing data — but because
            there are{" "}
            <strong className="text-foreground">no enforced rules</strong> on
            top of it. Every pain point below is a structural impossibility in a
            spreadsheet, and a guarantee in AssetFlow.
          </p>
        </div>
      </Animate>

      {/* Pain point cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map(({ icon: Icon, title, description, color, bg }, i) => (
          <Animate key={title} variant="slide-up" delayMs={i * 60}>
            <div className="surface-card group flex flex-col gap-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}
              >
                <Icon className="size-5" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          </Animate>
        ))}
      </div>
    </section>
  );
}
