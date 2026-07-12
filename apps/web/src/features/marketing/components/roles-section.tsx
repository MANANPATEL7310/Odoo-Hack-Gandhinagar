import { ShieldCheck, Boxes, Building2, UserCircle } from "lucide-react";
import { Animate } from "@/components/ui/animate";
import { cn } from "@/lib/cn";

const roles = [
  {
    icon: ShieldCheck,
    name: "Admin",
    persona: "Priya",
    tagline: "Organization owner & role authority",
    accentColor: "#2563eb",
    iconClass: "text-primary bg-primary/10",
    borderClass: "border-primary/20",
    responsibilities: [
      "Set up departments with optional hierarchy",
      "Define asset categories & custom field schemas",
      "Promote employees to Department Head or Asset Manager",
      "View org-wide analytics and full activity log",
      "Bootstrap the organization — provisioned out-of-band",
    ],
    cannot: ["Promote anyone to Admin (prevents privilege escalation)"],
  },
  {
    icon: Boxes,
    name: "Asset Manager",
    persona: "Raj",
    tagline: "Day-to-day custodian of asset data",
    accentColor: "#0f766e",
    iconClass: "text-secondary bg-secondary/10",
    borderClass: "border-secondary/20",
    responsibilities: [
      "Register assets and assign Asset Tags",
      "Allocate and deallocate assets to employees",
      "Approve or reject maintenance requests",
      "Create and close audit cycles",
      "View all org-wide allocations and transfers",
    ],
    cannot: ["Modify department or category master data"],
  },
  {
    icon: Building2,
    name: "Department Head",
    persona: "Meera",
    tagline: "Departmental accountability lead",
    accentColor: "#d97706",
    iconClass: "text-warning bg-warning/10",
    borderClass: "border-warning/20",
    responsibilities: [
      "View all assets within their department",
      "Approve internal transfer requests (dept-scoped)",
      "Book shared resources for the team",
      "View department-scoped KPI dashboard",
      "Read-only view of department employees",
    ],
    cannot: ["Register assets or modify org structure"],
  },
  {
    icon: UserCircle,
    name: "Employee",
    persona: "Arjun",
    tagline: "End user of assets & shared resources",
    accentColor: "#475569",
    iconClass: "text-neutral bg-neutral/10",
    borderClass: "border-neutral/20",
    responsibilities: [
      "View assets currently allocated to them",
      "Book shared resources (rooms, vehicles, etc.)",
      "Raise maintenance requests for held assets",
      "Initiate transfer or return requests",
      "Receive notifications on every status change",
    ],
    cannot: ["View other employees' allocations or org-wide data"],
  },
];

export function RolesSection() {
  return (
    <section id="roles" className="relative py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-secondary/5 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <Animate variant="slide-up">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block rounded-full border border-warning/30 bg-warning/10 px-4 py-1 text-xs font-semibold tracking-widest text-warning uppercase">
              Roles
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Role clarity from the source of truth
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              Roles are{" "}
              <strong className="text-foreground">
                assigned, never self-selected.
              </strong>{" "}
              Every action is enforced server-side — the UI is a convenience
              layer, not the source of truth.
            </p>
          </div>
        </Animate>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {roles.map(
            (
              {
                icon: Icon,
                name,
                persona,
                tagline,
                accentColor,
                iconClass,
                borderClass,
                responsibilities,
                cannot,
              },
              i,
            ) => (
              <Animate key={name} variant="slide-up" delayMs={i * 80}>
                <div
                  className={cn(
                    "surface-card flex h-full flex-col overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
                    borderClass,
                  )}
                >
                  {/* Accent strip */}
                  <div
                    className="h-1.5 w-full"
                    style={{
                      background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`,
                    }}
                  />

                  <div className="flex flex-col gap-5 p-6">
                    {/* Role header */}
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-xl",
                          iconClass,
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{name}</h3>
                        <p className="text-xs text-muted-foreground">
                          aka{" "}
                          <span className="font-medium text-foreground">
                            {persona}
                          </span>
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground italic">
                      "{tagline}"
                    </p>

                    {/* Can do */}
                    <div>
                      <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Can
                      </p>
                      <ul className="flex flex-col gap-2">
                        {responsibilities.map((r) => (
                          <li
                            key={r}
                            className="flex items-start gap-2 text-sm text-foreground"
                          >
                            <svg
                              viewBox="0 0 12 12"
                              fill="none"
                              className="mt-0.5 size-4 shrink-0 text-success"
                            >
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cannot */}
                    {cannot.length > 0 && (
                      <div className="mt-auto border-t border-white/10 pt-4">
                        <p className="mb-2 text-xs font-semibold tracking-wider text-danger uppercase">
                          Cannot
                        </p>
                        <ul className="flex flex-col gap-1.5">
                          {cannot.map((c) => (
                            <li
                              key={c}
                              className="flex items-start gap-2 text-xs text-muted-foreground"
                            >
                              <span className="mt-0.5 text-danger">✕</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Animate>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
