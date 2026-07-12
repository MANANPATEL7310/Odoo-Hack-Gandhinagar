import { useMockDb } from "../../stores/mock-db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { ClipboardCheck } from "lucide-react";
import { Button } from "../../components/ui/button";

export function AuditsPage() {
  const { auditCycles: audits, departments, users } = useMockDb();

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">Audits</h1>
          <p className="page-copy mt-2">
            View scheduled, ongoing, and past audits to ensure physical assets
            match system records.
          </p>
        </div>
        <Button className="shadow-lg shadow-primary/20">
          <ClipboardCheck className="mr-2 size-4" />
          Start New Audit
        </Button>
      </div>

      <div className="surface-card p-6">
        <div className="rounded-lg border border-white/20">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target Department</TableHead>
                <TableHead>Auditor</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Discrepancies</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.map((a) => {
                const dept = departments.find(
                  (x) => x.id === a.scopeDepartmentId,
                );
                const auditor = users.find(
                  (x) => x.id === a.createdByEmployeeId,
                );

                let badgeVariant: "default" | "success" | "warning" = "default";
                if (a.status === "OPEN") badgeVariant = "warning";
                if (a.status === "CLOSED") badgeVariant = "success";

                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      {dept?.name || "All Departments"}
                    </TableCell>
                    <TableCell>{auditor?.name}</TableCell>
                    <TableCell>
                      {new Date(a.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant}>
                        {a.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.status === "CLOSED" ? "0" : "-"}</TableCell>
                    <TableCell className="text-right">
                      {a.status === "OPEN" && (
                        <Button
                          size="sm"
                          className="bg-primary text-white hover:bg-primary/90"
                        >
                          Continue
                        </Button>
                      )}
                      {a.status === "CLOSED" && (
                        <Button size="sm" variant="ghost">
                          View Report
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
