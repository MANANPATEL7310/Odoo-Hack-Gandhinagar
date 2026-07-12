import { useEffect, useState } from "react";
import { api } from "../../lib/api-client";
import { Package, ArrowRightLeft, CalendarClock, PenTool } from "lucide-react";

interface KPIResponse {
  assetsAvailable: number;
  assetsAllocated: number;
  maintenanceToday: number;
  activeBookings: number;
  pendingTransfers: number;
  upcomingReturns: number;
}

export function DashboardPage() {
  const [kpis, setKpis] = useState<KPIResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get("/dashboard");
        setKpis(res.data.data.kpis);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "50vh" }}
      >
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-copy mt-2">Overview of your asset ecosystem.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* KPI Cards */}
        <div className="surface-card flex flex-col gap-2 p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="size-4" />
            <h3 className="text-sm font-medium">Assets Available</h3>
          </div>
          <p className="text-3xl font-bold">{kpis?.assetsAvailable || 0}</p>
        </div>

        <div className="surface-card flex flex-col gap-2 p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowRightLeft className="size-4" />
            <h3 className="text-sm font-medium">Allocated Assets</h3>
          </div>
          <p className="text-3xl font-bold">{kpis?.assetsAllocated || 0}</p>
        </div>

        <div className="surface-card flex flex-col gap-2 p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="size-4" />
            <h3 className="text-sm font-medium">Active Bookings</h3>
          </div>
          <p className="text-3xl font-bold">{kpis?.activeBookings || 0}</p>
        </div>

        <div className="surface-card flex flex-col gap-2 p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <PenTool className="size-4" />
            <h3 className="text-sm font-medium">Maintenance Today</h3>
          </div>
          <p className="text-3xl font-bold">{kpis?.maintenanceToday || 0}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="surface-card min-h-75 p-6">
          <h3 className="mb-4 text-lg font-semibold">Overdue Items</h3>
          <div className="flex h-50 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No overdue items currently.
          </div>
        </div>
        <div className="surface-card min-h-75 p-6">
          <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
          <div className="flex h-50 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No recent activity.
          </div>
        </div>
      </div>
    </div>
  );
}
