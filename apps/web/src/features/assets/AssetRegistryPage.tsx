import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api-client";
import { useMockDb, type Asset } from "../../stores/mock-db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Archive,
  Boxes,
  CheckCircle2,
  Filter,
  Laptop,
  Plus,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Tag,
  Wrench,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export function AssetRegistryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const assetCategories = useMockDb((state) => state.assetCategories);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await api.get("/assets");
        setAssets(res.data.data);
      } catch (error) {
        console.error("Failed to load assets", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, []);

  const categoryById = useMemo(
    () =>
      Object.fromEntries(
        assetCategories.map((category) => [category.id, category.name]),
      ),
    [assetCategories],
  );

  const filteredAssets = assets.filter((asset) => {
    const query = search.toLowerCase();
    const matchesSearch =
      asset.name.toLowerCase().includes(query) ||
      asset.assetTag.toLowerCase().includes(query) ||
      asset.serialNumber?.toLowerCase().includes(query);
    const matchesStatus = status === "All" || asset.status === status;

    return matchesSearch && matchesStatus;
  });

  const registryStats = [
    {
      label: "Total assets",
      value: assets.length,
      icon: Boxes,
      tone: "text-primary",
    },
    {
      label: "Available",
      value: assets.filter((asset) => asset.status === "Available").length,
      icon: CheckCircle2,
      tone: "text-secondary",
    },
    {
      label: "Allocated",
      value: assets.filter((asset) => asset.status === "Allocated").length,
      icon: Laptop,
      tone: "text-primary",
    },
    {
      label: "Bookable",
      value: assets.filter((asset) => asset.isBookable).length,
      icon: Tag,
      tone: "text-warning",
    },
  ];

  const statusTone = (assetStatus: Asset["status"]) => {
    if (assetStatus === "Available") {
      return "bg-secondary/10 text-secondary";
    }
    if (assetStatus === "Allocated") {
      return "bg-primary/10 text-primary";
    }
    if (assetStatus === "Under Maintenance") {
      return "bg-warning/10 text-warning";
    }
    return "bg-danger/10 text-danger";
  };

  const StatusIcon = (assetStatus: Asset["status"]) => {
    if (assetStatus === "Available") return CheckCircle2;
    if (assetStatus === "Under Maintenance") return Wrench;
    if (assetStatus === "Retired") return Archive;
    return ShieldAlert;
  };

  return (
    <div className="space-y-5">
      <section className="surface-card p-6 md:p-7">
        <div className="flex flex-col items-start justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-lg border border-white/50 bg-white/45 px-3 py-1 text-xs font-semibold tracking-widest text-primary uppercase backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <SlidersHorizontal className="size-3.5" />
              Registry control
            </p>
            <h1 className="page-title mt-4">Asset Registry</h1>
            <p className="page-copy mt-2">
              Manage devices, room gear, and shared equipment with clear
              ownership and availability signals.
            </p>
          </div>
          <Button className="shrink-0 shadow-lg shadow-primary/20">
            <Plus className="size-4" />
            <span>Register Asset</span>
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {registryStats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-lg border border-white/50 bg-white/35 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
              >
                <Icon className={`size-5 ${item.tone}`} />
                <p className="mt-4 text-3xl font-semibold">{item.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="surface-card p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, tag, or serial..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All statuses</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Allocated">Allocated</SelectItem>
                <SelectItem value="Under Maintenance">
                  Under Maintenance
                </SelectItem>
                <SelectItem value="Retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="justify-center">
              <Filter className="size-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-white/50 bg-white/30 dark:border-white/10 dark:bg-white/5">
            <Table>
              <TableHeader className="bg-white/50 backdrop-blur-xl dark:bg-white/5">
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bookable</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-28 text-center text-muted-foreground"
                    >
                      No assets match the current view.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map((asset) => {
                    const Icon = StatusIcon(asset.status);
                    return (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-lg border border-white/50 bg-white/45 text-primary dark:border-white/10 dark:bg-white/5">
                              <Laptop className="size-4" />
                            </span>
                            <div>
                              <p className="font-semibold">{asset.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {asset.assetTag}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {categoryById[asset.categoryId] ?? "Uncategorized"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${statusTone(asset.status)}`}
                          >
                            <Icon className="size-3.5" />
                            {asset.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {asset.isBookable ? "Yes" : "No"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
