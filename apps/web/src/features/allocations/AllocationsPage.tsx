import { useEffect, useState } from "react";
import {
  getAllocationsRepository,
  getAssetsRepository,
  getOrgRepository,
} from "@/services/data/repositories";
import type {
  Allocation,
  TransferRequest,
  Asset,
  Department,
} from "@/services/data/types/domain";
import { Tabs } from "../../components/ui/tabs";
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
import { HandHeart, Plus } from "lucide-react";
import { AllocationFormDialog } from "./AllocationFormDialog";

export function AllocationsPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>(
    [],
  );
  const [assets, setAssets] = useState<Asset[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [allocationsData, transfersData, assetsData, departmentsData] =
          await Promise.all([
            getAllocationsRepository()
              .listAllocations()
              .catch(() => []),
            getAllocationsRepository()
              .listTransferRequests()
              .catch(() => []),
            getAssetsRepository()
              .listAssets()
              .catch(() => []),
            getOrgRepository()
              .listDepartments()
              .catch(() => []),
          ]);
        setAllocations(allocationsData);
        setTransferRequests(transfersData);
        setAssets(assetsData);
        setDepartments(departmentsData);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const availableAssets = assets.filter((a) => a.status === "AVAILABLE");

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <AllocationFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        assets={availableAssets}
        employees={[]}
        onSubmit={async (payload) => {
          console.log("Submit allocation", payload);
          // In real implementation, call repository:
          // await getAllocationsRepository().createAllocation(payload);
        }}
      />

      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">Allocations & Transfers</h1>
          <p className="page-copy mt-2">
            Track who has what, and manage requests to transfer assets between
            employees or departments.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="shadow-lg shadow-primary/20"
        >
          <Plus className="mr-2 size-4" />
          Allocate Asset
        </Button>
      </div>

      <div className="surface-card p-6">
        <Tabs
          tabs={[
            {
              id: "active",
              label: "Active Allocations",
              content: (
                <div className="space-y-4 pt-4">
                  <div className="rounded-lg border border-white/20">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Asset</TableHead>
                          <TableHead>Holder</TableHead>
                          <TableHead>Allocated On</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allocations.map((a) => {
                          const asset = assets.find((x) => x.id === a.assetId);
                          const holderName = "Employee";
                          return (
                            <TableRow key={a.id}>
                              <TableCell className="font-medium">
                                {asset?.name}
                              </TableCell>
                              <TableCell>{holderName}</TableCell>
                              <TableCell>
                                {new Date(a.allocatedAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    a.status === "ACTIVE"
                                      ? "success"
                                      : "secondary"
                                  }
                                >
                                  {a.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {a.status === "ACTIVE" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary hover:text-primary/80"
                                  >
                                    <HandHeart className="mr-1 size-4" /> Return
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
              ),
            },
            {
              id: "transfers",
              label: "Transfer Requests",
              content: (
                <div className="space-y-4 pt-4">
                  <div className="rounded-lg border border-white/20">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Asset</TableHead>
                          <TableHead>Requested By</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transferRequests.map((tr) => {
                          const asset = assets.find((x) => x.id === tr.assetId);
                          const requesterName = "Employee";
                          const targetDept = departments.find(
                            (x) => x.id === tr.targetDepartmentId,
                          );

                          let badgeVariant:
                            | "default"
                            | "warning"
                            | "success"
                            | "danger" = "default";
                          if (tr.status === "REQUESTED")
                            badgeVariant = "warning";
                          if (tr.status === "APPROVED")
                            badgeVariant = "success";
                          if (tr.status === "REJECTED") badgeVariant = "danger";

                          return (
                            <TableRow key={tr.id}>
                              <TableCell className="font-medium">
                                {asset?.name}
                              </TableCell>
                              <TableCell>{requesterName}</TableCell>
                              <TableCell>
                                {targetDept?.name || "Unknown"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={badgeVariant}>
                                  {tr.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {tr.status === "REQUESTED" && (
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-danger hover:bg-danger/10 hover:text-danger"
                                    >
                                      Reject
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-primary text-white hover:bg-primary/90"
                                    >
                                      Approve
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
