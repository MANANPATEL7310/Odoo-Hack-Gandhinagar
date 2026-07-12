import { useEffect, useMemo, useState } from "react";
import { getAssetsRepository } from "@/services/data/repositories";
import type {
  Asset,
  AssetCategory,
  Department,
} from "@/services/data/types/domain";
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
import { AssetDetailDrawer } from "./AssetDetailDrawer";
import { AssetFormDialog } from "./AssetFormDialog";

export function AssetRegistryPage() {
  const assetsRepository = getAssetsRepository();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchAssets = async () => {
    try {
      const data = await assetsRepository.listAssets();
      setAssets(data);
    } catch (error) {
      console.error("Failed to load assets", error);
    }
  };

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      try {
        const [assetsData, categoriesData, departmentsData] = await Promise.all(
          [
            assetsRepository.listAssets(),
            assetsRepository.listAssetCategories(),
            assetsRepository.listDepartments(),
          ],
        );

        setAssets(assetsData);
        setAssetCategories(categoriesData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Failed to bootstrap asset registry", error);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [assetsRepository]);

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
    const matchesStatus =
      status === "All" ||
      asset.status === status.toUpperCase().replace(" ", "_");

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
      value: assets.filter((asset) => asset.status === "AVAILABLE").length,
      icon: CheckCircle2,
      tone: "text-secondary",
    },
    {
      label: "Allocated",
      value: assets.filter((asset) => asset.status === "ALLOCATED").length,
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
    if (assetStatus === "AVAILABLE") return "bg-secondary/10 text-secondary";
    if (assetStatus === "ALLOCATED") return "bg-primary/10 text-primary";
    if (assetStatus === "UNDER_MAINTENANCE")
      return "bg-warning/10 text-warning";
    if (assetStatus === "RESERVED") return "bg-primary/10 text-primary";
    return "bg-danger/10 text-danger";
  };

  const StatusIcon = (assetStatus: Asset["status"]) => {
    if (assetStatus === "AVAILABLE") return CheckCircle2;
    if (assetStatus === "UNDER_MAINTENANCE") return Wrench;
    if (assetStatus === "RETIRED" || assetStatus === "DISPOSED") return Archive;
    if (assetStatus === "LOST") return ShieldAlert;
    return Tag;
  };

  const handleRowClick = async (asset: Asset) => {
    setIsDrawerOpen(true);
    setSelectedAsset(asset);
    try {
      const detail = await assetsRepository.getAsset(asset.id);
      setSelectedAsset(detail);
    } catch (error) {
      console.error("Failed to load asset detail", error);
    }
  };

  return (
    <div className="space-y-5">
      <AssetDetailDrawer
        asset={selectedAsset}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categoryName={
          selectedAsset
            ? selectedAsset.category?.name ||
              categoryById[selectedAsset.categoryId] ||
              "Unknown"
            : ""
        }
      />

      <AssetFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        categories={assetCategories}
        departments={departments}
        onSuccess={fetchAssets}
      />

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
          <Button
            className="shrink-0 shadow-lg shadow-primary/20"
            onClick={() => setIsFormOpen(true)}
          >
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
                      <TableRow
                        key={asset.id}
                        className="cursor-pointer hover:bg-white/40 dark:hover:bg-white/5"
                        onClick={() => handleRowClick(asset)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {asset.photoUrls?.length > 0 ? (
                              <img
                                src={asset.photoUrls[0]}
                                alt=""
                                className="size-10 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/50 bg-white/45 text-primary dark:border-white/10 dark:bg-white/5">
                                <Laptop className="size-4" />
                              </span>
                            )}
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
                            {asset.status.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {asset.isBookable ? "Yes" : "No"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(asset);
                            }}
                          >
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
