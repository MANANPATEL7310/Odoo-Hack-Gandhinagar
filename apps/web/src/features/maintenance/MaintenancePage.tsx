import { useState } from "react";
import { useMockDb } from "../../stores/mock-db";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Plus } from "lucide-react";
import { MaintenanceFormDialog } from "./MaintenanceFormDialog";

export function MaintenancePage() {
  const { maintenanceRequests, assets, users } = useMockDb();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <MaintenanceFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        assets={assets}
      />

      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">Maintenance</h1>
          <p className="page-copy mt-2">
            Track repair requests, scheduled maintenance, and associated costs.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="shadow-lg shadow-primary/20"
        >
          <Plus className="mr-2 size-4" />
          Report Issue
        </Button>
      </div>

      <div className="surface-card p-6">
        <div className="rounded-lg border border-white/20">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenanceRequests.map((mr) => {
                const asset = assets.find((x) => x.id === mr.assetId);
                const user = users.find((x) => x.id === mr.raisedByEmployeeId);

                let badgeVariant: "default" | "success" | "warning" = "default";
                if (mr.status === "PENDING") badgeVariant = "default";
                if (mr.status === "IN_PROGRESS") badgeVariant = "warning";
                if (mr.status === "RESOLVED") badgeVariant = "success";

                return (
                  <TableRow key={mr.id}>
                    <TableCell className="font-medium">{asset?.name}</TableCell>
                    <TableCell>{user?.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {mr.issueDescription}
                    </TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant}>
                        {mr.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {mr.status === "PENDING" && (
                        <Button size="sm" variant="outline">
                          Start Work
                        </Button>
                      )}
                      {mr.status === "IN_PROGRESS" && (
                        <Button
                          size="sm"
                          className="bg-primary text-white hover:bg-primary/90"
                        >
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
