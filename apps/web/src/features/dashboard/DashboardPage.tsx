import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api-client";
import {
  Activity,
  ArrowRightLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Gauge,
  Package,
  PenTool,
  Radar,
  ShieldCheck,
} from "lucide-react";

interface DashboardResponse {
  kpis: {
    totalAssets: number;
    assetsAvailable: number;
    assetsAllocated: number;
    assetsUnderMaintenance: number;
    maintenanceToday: number;
    activeBookings: number;
    pendingTransfers: number;
    upcomingReturns: number;
    assetHealthPercent: number;
  };
  overdue: Array<{
    id: string;
    asset: { id: string; name: string; assetTag: string };
    holderEmployee?: { id: string; name: string };
    holderDepartment?: { id: string; name: string };
    expectedReturnDate: string;
  }>;
  upcomingReturns: Array<{
    id: string;
    resourceAsset: { id: string; name: string; assetTag: string };
    bookedBy: { id: string; name: string };
    startTime: string;
    endTime: string;
  }>;
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get("/dashboard");
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const kpis = data?.kpis;

  const totalTrackedAssets = kpis?.totalAssets ?? 0;
  const utilization = totalTrackedAssets
    ? Math.round(((kpis?.assetsAllocated ?? 0) / totalTrackedAssets) * 100)
    : 0;
  const maxOperationalCount = Math.max(
    kpis?.assetsAvailable ?? 0,
    kpis?.assetsAllocated ?? 0,
    kpis?.activeBookings ?? 0,
    kpis?.maintenanceToday ?? 0,
  );

  const statCards = useMemo(() => {
    const percentOfMax = (value: number) =>
      maxOperationalCount ? Math.round((value / maxOperationalCount) * 100) : 0;

    return [
      {
        label: "Assets Available",
        value: kpis?.assetsAvailable ?? 0,
        helper: "Ready to assign or book",
        icon: Package,
        tone: "text-secondary",
        bar: totalTrackedAssets
          ? Math.round(
              ((kpis?.assetsAvailable ?? 0) / totalTrackedAssets) * 100,
            )
          : 0,
      },
      {
        label: "Allocated Assets",
        value: kpis?.assetsAllocated ?? 0,
        helper: `${utilization}% utilization`,
        icon: ArrowRightLeft,
        tone: "text-primary",
        bar: utilization,
      },
      {
        label: "Active Bookings",
        value: kpis?.activeBookings ?? 0,
        helper: "Room and shared gear",
        icon: CalendarClock,
        tone: "text-warning",
        bar: percentOfMax(kpis?.activeBookings ?? 0),
      },
      {
        label: "Maintenance Today",
        value: kpis?.maintenanceToday ?? 0,
        helper: "Service queue load",
        icon: PenTool,
        tone: "text-danger",
        bar: percentOfMax(kpis?.maintenanceToday ?? 0),
      },
    ];
  }, [kpis, totalTrackedAssets, utilization, maxOperationalCount]);

  const readinessTotal = Math.max(
    totalTrackedAssets,
    (kpis?.pendingTransfers ?? 0) + (kpis?.upcomingReturns ?? 0),
  );

  const readinessRows = [
    {
      label: "Allocation capacity",
      value: `${100 - utilization}%`,
      width: 100 - utilization,
      tone: "bg-secondary",
    },
    {
      label: "Transfer queue",
      value: `${kpis?.pendingTransfers ?? 0} pending`,
      width: readinessTotal
        ? Math.round(((kpis?.pendingTransfers ?? 0) / readinessTotal) * 100)
        : 0,
      tone: "bg-primary",
    },
    {
      label: "Returns ahead",
      value: `${kpis?.upcomingReturns ?? 0} due`,
      width: readinessTotal
        ? Math.round(((kpis?.upcomingReturns ?? 0) / readinessTotal) * 100)
        : 0,
      tone: "bg-warning",
    },
  ];

  const activityItems = [
    ...(data?.overdue.slice(0, 2).map((item) => ({
      title: `${item.asset.name} is Overdue`,
      meta: `Expected back on ${new Date(item.expectedReturnDate).toLocaleDateString()}`,
      icon: Clock3,
      tone: "text-danger",
    })) || []),
    ...(data?.upcomingReturns.slice(0, 3).map((item) => ({
      title: `${item.resourceAsset.name} booked`,
      meta: `Booked by ${item.bookedBy.name} for ${new Date(item.startTime).toLocaleDateString()}`,
      icon: CalendarClock,
      tone: "text-secondary",
    })) || []),
  ];

  if (activityItems.length === 0) {
    activityItems.push({
      title: "Maintenance window clear",
      meta: "No service tickets or overdue items today",
      icon: CheckCircle2,
      tone: "text-success",
    });
  }

  const insightCards = [
    {
      label: "Overdue items",
      value: String(data?.overdue.length || 0),
      icon: Clock3,
    },
    {
      label: "Upcoming bookings",
      value: String(data?.upcomingReturns.length || 0),
      icon: Activity,
    },
    {
      label: "Pending transfers",
      value: String(kpis?.pendingTransfers || 0),
      icon: ArrowRightLeft,
    },
  ];

  if (loading) {
    return (
      <div
        className="surface-card flex items-center justify-center"
        style={{ height: "50vh" }}
      >
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="surface-card overflow-hidden p-6 md:p-8">
        <div className="dash-hero-grid gap-6 lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-lg border border-white/50 bg-white/45 px-3 py-1 text-xs font-semibold text-primary uppercase backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <Radar className="size-3.5" />
              Live fleet overview
            </p>
            <h2 className="mt-5 max-w-3xl text-4xl leading-tight font-semibold md:text-5xl">
              Every asset, booking, and handoff in one glassy command view.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Monitor availability, keep allocations moving, and spot work that
              needs attention before it slows down your teams.
            </p>
          </div>

          <div className="rounded-lg border border-white/50 bg-white/45 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Fleet utilization
                </p>
                <p className="mt-2 text-4xl font-semibold">{utilization}%</p>
              </div>
              <Gauge className="size-10 text-primary" />
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/70 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${utilization}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {totalTrackedAssets} assets currently tracked in the workspace.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-3 text-4xl font-semibold">{card.value}</p>
                </div>
                <span className="flex size-11 items-center justify-center rounded-lg border border-white/50 bg-white/45 dark:border-white/10 dark:bg-white/5">
                  <Icon className={`size-5 ${card.tone}`} />
                </span>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/70 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-current text-primary"
                  style={{ width: `${card.bar}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {card.helper}
              </p>
            </div>
          );
        })}
      </div>

      <div className="dash-content-grid gap-5">
        <section className="surface-card p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                Readiness
              </p>
              <h3 className="mt-1 text-xl font-semibold">Operations health</h3>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-secondary/10 px-3 py-2 text-sm font-medium text-secondary">
              <ShieldCheck className="size-4" />
              Clear to operate
            </span>
          </div>

          <div className="mt-6 space-y-5">
            {readinessRows.map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{row.label}</span>
                  <span className="text-muted-foreground">{row.value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/70 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full ${row.tone}`}
                    style={{ width: `${row.width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {insightCards.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-lg border border-white/50 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <Icon className="size-4 text-primary" />
                  <p className="mt-3 text-2xl font-semibold">{item.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="surface-card p-6">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Activity
          </p>
          <h3 className="mt-1 text-xl font-semibold">Recent movement</h3>
          <div className="mt-6 space-y-4">
            {activityItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/50 bg-white/40 dark:border-white/10 dark:bg-white/5">
                    <Icon className={`size-4 ${item.tone}`} />
                  </span>
                  <div className="min-w-0 border-b border-white/40 pb-4 last:border-0 last:pb-0 dark:border-white/10">
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.meta}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
