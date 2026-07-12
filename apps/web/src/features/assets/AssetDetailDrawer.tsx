import { Asset } from "../../stores/mock-db";
import { Sheet } from "../../components/ui/sheet";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Archive, Laptop, MapPin, Tag } from "lucide-react";

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
          <Button className="bg-primary text-white hover:bg-primary/90">
            Edit Asset
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
              {asset.serialNumber || "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="size-4 text-muted-foreground" />
              {asset.locationDepartmentId || "Unassigned"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Bookable</p>
            <p className="text-sm font-medium">
              {asset.isBookable ? "Yes" : "No"}
            </p>
          </div>
        </div>

        {/* History mock section */}
        <div className="border-t border-white/10 pt-6">
          <h3 className="mb-4 font-semibold">Recent History</h3>
          <div className="space-y-3">
            <div className="flex gap-3 text-sm">
              <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Archive className="size-3" />
              </div>
              <div>
                <p className="font-medium">Registered in system</p>
                <p className="text-xs text-muted-foreground">
                  Oct 24, 2023 by Admin
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
