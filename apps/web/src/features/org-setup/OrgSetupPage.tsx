import { useEffect, useState, useCallback } from "react";
import { getOrgRepository } from "@/services/data/repositories";
import type {
  AssetCategory,
  Department,
  Employee,
} from "@/services/data/types/domain";
import { Tabs } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
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
  const orgRepository = getOrgRepository();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
  const [users, setUsers] = useState<Employee[]>([]);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [departmentHeadId, setDepartmentHeadId] = useState("none");
  const [parentDepartmentId, setParentDepartmentId] = useState("none");
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const bootstrap = useCallback(async () => {
    try {
      const [departmentsData, categoriesData, employeesData] =
        await Promise.all([
          orgRepository.listDepartments(),
          orgRepository.listAssetCategories(),
          orgRepository.listEmployees(),
        ]);

      setDepartments(departmentsData);
      setAssetCategories(categoriesData);
      setUsers(employeesData);
    } catch (error) {
      console.error("Failed to load org setup data", error);
    }
  }, [orgRepository]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    bootstrap();
  }, [bootstrap]);

  const filteredUsers = users.filter((user) => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  const resetDepartmentForm = () => {
    setDepartmentName("");
    setDepartmentHeadId("none");
    setParentDepartmentId("none");
  };

  const resetCategoryForm = () => {
    setCategoryName("");
    setCategoryDescription("");
  };

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <Dialog
        open={isDepartmentDialogOpen}
        onOpenChange={setIsDepartmentDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>
              Create a department record in the database.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await orgRepository.createDepartment({
                name: departmentName,
                headEmployeeId:
                  departmentHeadId === "none" ? undefined : departmentHeadId,
                parentDepartmentId:
                  parentDepartmentId === "none"
                    ? undefined
                    : parentDepartmentId,
              });
              resetDepartmentForm();
              setIsDepartmentDialogOpen(false);
              await bootstrap();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="department-name">Name</Label>
              <Input
                id="department-name"
                value={departmentName}
                onChange={(event) => setDepartmentName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Head</Label>
              <Select
                value={departmentHeadId}
                onValueChange={setDepartmentHeadId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Parent Department</Label>
              <Select
                value={parentDepartmentId}
                onValueChange={setParentDepartmentId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetDepartmentForm}
              >
                Reset
              </Button>
              <Button type="submit">Create Department</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create an asset category record in the database.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await orgRepository.createAssetCategory({
                name: categoryName,
                description: categoryDescription || undefined,
              });
              resetCategoryForm();
              setIsCategoryDialogOpen(false);
              await bootstrap();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Input
                id="category-description"
                value={categoryDescription}
                onChange={(event) => setCategoryDescription(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetCategoryForm}
              >
                Reset
              </Button>
              <Button type="submit">Create Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                    <Button
                      size="sm"
                      onClick={() => setIsDepartmentDialogOpen(true)}
                    >
                      Add Department
                    </Button>
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
                    <Button
                      size="sm"
                      onClick={() => setIsCategoryDialogOpen(true)}
                    >
                      Add Category
                    </Button>
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
                        value={userSearch}
                        onChange={(event) => setUserSearch(event.target.value)}
                      />
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
                        {filteredUsers.map((u) => (
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
