import { useEffect, useMemo, useState } from "react";
import { Download, TrendingUp, Package, Wrench } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAssetsRepository } from "@/services/data/repositories";
import { apiClient } from "@/services/http/api-client";
import type { ApiSuccess } from "@/services/http/api-response";
import type { Asset } from "@/services/data/types/domain";

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

interface MaintenanceFrequencyRow {
  assetTag: string;
  assetName: string;
  totalRequests: number;
  resolvedRequests: number;
  avgResolutionHours: number;
}

interface UtilizationRow {
  categoryId: string;
  categoryName: string;
  totalAssets: number;
  allocatedAssets: number;
  utilizationRate: number;
}

export function ReportsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [maintenanceRows, setMaintenanceRows] = useState<
    MaintenanceFrequencyRow[]
  >([]);
  const [utilizationRows, setUtilizationRows] = useState<UtilizationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [assetsData, maintenanceResponse, utilizationResponse] =
          await Promise.all([
            getAssetsRepository().listAssets(),
            apiClient.get<ApiSuccess<MaintenanceFrequencyRow[]>>(
              "/reports/maintenance-frequency",
            ),
            apiClient.get<ApiSuccess<UtilizationRow[]>>("/reports/utilization"),
          ]);
        setAssets(assetsData);
        setMaintenanceRows(maintenanceResponse.data.data);
        setUtilizationRows(utilizationResponse.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalValue = assets.reduce(
    (sum, asset) => sum + (asset.acquisitionCost || 0),
    0,
  );

  const statusData = useMemo(() => {
    const counts = assets.reduce(
      (acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const utilizationData = useMemo(
    () =>
      utilizationRows
        .filter((row) => row.totalAssets > 0)
        .map((row) => ({
          name: row.categoryName,
          value: row.utilizationRate,
          allocatedAssets: row.allocatedAssets,
          totalAssets: row.totalAssets,
        })),
    [utilizationRows],
  );

  const maintenanceData = useMemo(
    () =>
      maintenanceRows.map((row) => ({
        name: row.assetTag,
        value: row.totalRequests,
        assetName: row.assetName,
        resolvedRequests: row.resolvedRequests,
      })),
    [maintenanceRows],
  );

  const totalMaintenanceRequests = maintenanceRows.reduce(
    (sum, row) => sum + row.totalRequests,
    0,
  );

  const handleExport = async () => {
    const response = await apiClient.get<Blob>("/reports/utilization/export", {
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "utilization_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

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
    <div className="space-y-6 p-2 lg:p-0">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-copy mt-2">
            Generate and export insights on asset utilization, loss rates, and
            maintenance costs.
          </p>
        </div>
        <Button className="shadow-lg shadow-primary/20" onClick={handleExport}>
          <Download className="mr-2 size-4" />
          Export Utilization
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="surface-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Package className="size-5" />
            </div>
            <h3 className="font-semibold">Total Assets</h3>
          </div>
          <p className="text-3xl font-bold">{assets.length}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tracked in the system
          </p>
        </div>

        <div className="surface-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2 text-success">
              <TrendingUp className="size-5" />
            </div>
            <h3 className="font-semibold">Asset Value</h3>
          </div>
          <p className="text-3xl font-bold">
            $
            {totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Total purchase value
          </p>
        </div>

        <div className="surface-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-warning/10 p-2 text-warning">
              <Wrench className="size-5" />
            </div>
            <h3 className="font-semibold">Maintenance Issues</h3>
          </div>
          <p className="text-3xl font-bold">{totalMaintenanceRequests}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Total reported issues
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="surface-card p-6">
          <h3 className="mb-6 font-semibold">Asset Status Distribution</h3>
          {statusData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>

        <div className="surface-card p-6">
          <h3 className="mb-6 font-semibold">Maintenance Requests by Asset</h3>
          {maintenanceData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.2}
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      backdropFilter: "blur(12px)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  >
                    {maintenanceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </div>
      <div className="surface-card p-6">
        <h3 className="mb-6 font-semibold">Utilization by Category</h3>
        {utilizationData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.2}
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    backdropFilter: "blur(12px)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
