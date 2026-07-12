import { BarChart3, Download, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "../../components/ui/button";

export function ReportsPage() {
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
        <Button className="shadow-lg shadow-primary/20">
          <Download className="mr-2 size-4" />
          Export All Data
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="surface-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <TrendingUp className="size-5" />
            </div>
            <h3 className="font-semibold">Asset Value</h3>
          </div>
          <p className="text-3xl font-bold">$124,500</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Across 142 active assets
          </p>
        </div>

        <div className="surface-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-danger/10 p-2 text-danger">
              <TrendingDown className="size-5" />
            </div>
            <h3 className="font-semibold">Depreciation</h3>
          </div>
          <p className="text-3xl font-bold">-$12,400</p>
          <p className="mt-2 text-sm text-muted-foreground">
            YTD estimated loss
          </p>
        </div>

        <div className="surface-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-warning/10 p-2 text-warning">
              <BarChart3 className="size-5" />
            </div>
            <h3 className="font-semibold">Maintenance Costs</h3>
          </div>
          <p className="text-3xl font-bold">$3,250</p>
          <p className="mt-2 text-sm text-muted-foreground">
            YTD repair expenses
          </p>
        </div>
      </div>

      <div className="surface-card flex min-h-72 items-center justify-center border-dashed p-6">
        <div className="text-center text-muted-foreground">
          <BarChart3 className="mx-auto mb-4 size-12 opacity-20" />
          <p>Detailed reporting charts will appear here</p>
          <p className="mt-1 text-sm">
            Connect to analytics backend to unlock visualization
          </p>
        </div>
      </div>
    </div>
  );
}
