import type { Asset } from "@/services/data/types/domain";
import { Sheet } from "../../components/ui/sheet";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Archive,
  ArrowRightLeft,
  Laptop,
  MapPin,
  Tag,
  Wrench,
} from "lucide-react";

interface AssetDetailDrawerProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
}

export function AssetDetailDrawer({
  asset,
  isOpen,
  onClose,
  categoryName,
}: AssetDetailDrawerProps) {
  if (!asset) return null;

  const historyItems = [
    ...(asset.allocations?.map((allocation) => ({
      id: `allocation-${allocation.id}`,
      title: allocation.returnedAt
        ? `Returned by ${
            allocation.holderEmployee?.name ||
            allocation.holderDepartment?.name ||
            "holder"
          }`
        : `Allocated to ${
            allocation.holderEmployee?.name ||
            allocation.holderDepartment?.name ||
            "holder"
          }`,
      date: allocation.returnedAt || allocation.allocatedAt,
      icon: ArrowRightLeft,
    })) ?? []),
    ...(asset.maintenanceRequests?.map((request) => ({
      id: `maintenance-${request.id}`,
      title: `${request.status.replace("_", " ")} maintenance request`,
      date: request.resolvedAt || request.createdAt,
      icon: Wrench,
    })) ?? []),
    ...(asset.createdAt
      ? [
          {
            id: `asset-${asset.id}`,
            title: "Registered in system",
            date: asset.createdAt,
            icon: Archive,
          },
        ]
      : []),
  ]
    .filter((item) => item.date)
    .sort(
      (a, b) =>
        new Date(b.date as string).getTime() -
        new Date(a.date as string).getTime(),
    );

  const locationName =
    asset.location?.name || asset.locationDepartmentId || "Unassigned";

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={asset.name}
      description={asset.assetTag}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {asset.photoUrls?.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-white/20">
            <img
              src={asset.photoUrls[0]}
              alt={asset.name}
              className="h-48 w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-white/30 bg-white/5">
            <Laptop className="size-8 text-muted-foreground opacity-50" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge
              variant={asset.status === "AVAILABLE" ? "success" : "default"}
            >
              {asset.status}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="flex items-center gap-2 font-medium">
              <Tag className="size-4 text-muted-foreground" />
              {categoryName}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Serial Number</p>
            <p className="font-mono text-sm font-medium">
              {asset.serialNumber || "Not recorded"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="size-4 text-muted-foreground" />
              {locationName}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Bookable</p>
            <p className="text-sm font-medium">
              {asset.isBookable ? "Yes" : "No"}
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h3 className="mb-4 font-semibold">Recent History</h3>
          {historyItems.length > 0 ? (
            <div className="space-y-3">
              {historyItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-3" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.date as string).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recorded asset activity yet.
            </p>
          )}
        </div>
      </div>
    </Sheet>
  );
}
