import { useEffect, useState } from "react";
import {
  getAuditsRepository,
  getOrgRepository,
} from "@/services/data/repositories";
import type {
  AuditCycle,
  Department,
  Employee,
} from "@/services/data/types/domain";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { DatePicker } from "../../components/ui/date-picker";

async function fetchAuditPageData() {
  const [auditsData, departmentsData, employeesData] = await Promise.all([
    getAuditsRepository().listAuditCycles(),
    getOrgRepository().listDepartments(),
    getOrgRepository().listEmployees(),
  ]);

  return { auditsData, departmentsData, employeesData };
}

export function AuditsPage() {
  const [audits, setAudits] = useState<AuditCycle[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [scopeDepartmentId, setScopeDepartmentId] = useState("");
  const [auditorEmployeeId, setAuditorEmployeeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const applyPageData = ({
    auditsData,
    departmentsData,
    employeesData,
  }: Awaited<ReturnType<typeof fetchAuditPageData>>) => {
    setAudits(auditsData);
    setDepartments(departmentsData);
    setEmployees(employeesData);
  };

  useEffect(() => {
    let isMounted = true;

    fetchAuditPageData()
      .then((pageData) => {
        if (isMounted) {
          applyPageData(pageData);
        }
      })
      .catch((err: unknown) => {
        console.error(err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshData = async () => {
    const data = await getAuditsRepository().listAuditCycles();
    setAudits(data);
  };

  const resetCreateForm = () => {
    setScopeDepartmentId("");
    setAuditorEmployeeId("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Audit</DialogTitle>
            <DialogDescription>
              Create an audit cycle from live department and employee data.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await getAuditsRepository().createAuditCycle({
                scopeDepartmentId,
                startDate,
                endDate,
                auditorEmployeeIds: [auditorEmployeeId],
              });
              resetCreateForm();
              setIsCreateOpen(false);
              applyPageData(await fetchAuditPageData());
            }}
          >
            <div className="space-y-2">
              <Label>Target Department</Label>
              <Select
                value={scopeDepartmentId}
                onValueChange={setScopeDepartmentId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Auditor</Label>
              <Select
                value={auditorEmployeeId}
                onValueChange={setAuditorEmployeeId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select auditor..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audit-start">Start</Label>
                <DatePicker
                  id="audit-start"
                  type="datetime-local"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audit-end">End</Label>
                <DatePicker
                  id="audit-end"
                  type="datetime-local"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetCreateForm}>
                Reset
              </Button>
              <Button type="submit">Create Audit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">Audits</h1>
          <p className="page-copy mt-2">
            View scheduled, ongoing, and past audits to ensure physical assets
            match system records.
          </p>
        </div>
        <Button
          className="shadow-lg shadow-primary/20"
          onClick={() => setIsCreateOpen(true)}
        >
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
                const auditorName =
                  a.auditors
                    ?.map((auditor) => auditor.employee.name)
                    .join(", ") ||
                  a.createdBy?.name ||
                  "Unassigned";
                const discrepancyCount =
                  a.items?.filter((item) =>
                    ["MISSING", "DAMAGED", "UNRESOLVED"].includes(item.status),
                  ).length ?? 0;

                let badgeVariant: "default" | "success" | "warning" = "default";
                if (a.status === "OPEN") badgeVariant = "warning";
                if (a.status === "CLOSED") badgeVariant = "success";

                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      {a.scopeDepartment?.name ||
                        a.scopeLocation ||
                        "All Departments"}
                    </TableCell>
                    <TableCell>{auditorName}</TableCell>
                    <TableCell>
                      {new Date(a.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant}>
                        {a.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{discrepancyCount}</TableCell>
                    <TableCell className="text-right">
                      {a.status === "OPEN" && (
                        <Button
                          size="sm"
                          className="bg-primary text-white hover:bg-primary/90"
                          onClick={async () => {
                            try {
                              await getAuditsRepository().closeAuditCycle(a.id);
                              await refreshData();
                            } catch (e) {
                              console.error("Failed to close audit", e);
                            }
                          }}
                        >
                          Close Cycle
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
