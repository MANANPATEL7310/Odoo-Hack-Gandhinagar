import { useMockDb } from "../../stores/mock-db";
import { Tabs } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Building, Network, Users } from "lucide-react";

export function OrgSetupPage() {
  const { departments, assetCategories, users } = useMockDb();

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div>
        <h1 className="page-title">Organization Setup</h1>
        <p className="page-copy mt-2">
          Manage departments, user roles, and asset categories to configure the
          system to your needs.
        </p>
      </div>

      <div className="surface-card p-6">
        <Tabs
          tabs={[
            {
              id: "departments",
              label: "Departments",
              content: (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <Network className="size-4" />
                      Department Hierarchy
                    </h3>
                    <Button size="sm">Add Department</Button>
                  </div>
                  <div className="rounded-lg border border-white/20">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Department</TableHead>
                          <TableHead>Head</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departments.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell className="font-medium">
                              {d.parentDepartmentId && (
                                <span className="mr-2 text-muted-foreground">
                                  ↳
                                </span>
                              )}
                              {d.name}
                            </TableCell>
                            <TableCell>
                              {users.find((u) => u.id === d.headEmployeeId)
                                ?.name || "Unassigned"}
                            </TableCell>
                            <TableCell>{d.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ),
            },
            {
              id: "categories",
              label: "Asset Categories",
              content: (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <Building className="size-4" />
                      Categories
                    </h3>
                    <Button size="sm">Add Category</Button>
                  </div>
                  <div className="rounded-lg border border-white/20">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assetCategories.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">
                              {c.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {c.description}
                            </TableCell>
                            <TableCell>{c.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ),
            },
            {
              id: "employees",
              label: "Employees",
              content: (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <Users className="size-4" />
                      Users
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search users..."
                        className="h-9 w-64"
                      />
                      <Button size="sm">Invite User</Button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/20">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">
                              {u.name}
                            </TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                {u.role.replace("_", " ")}
                              </span>
                            </TableCell>
                            <TableCell>
                              {departments.find((d) => d.id === u.departmentId)
                                ?.name || "Unassigned"}
                            </TableCell>
                            <TableCell>{u.status}</TableCell>
                          </TableRow>
                        ))}
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
