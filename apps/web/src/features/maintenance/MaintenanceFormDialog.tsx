import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { X } from "lucide-react";

import type {
  CreateMaintenanceRequestInput,
  MaintenancePriority,
} from "@/services/data/types/domain";

interface MaintenanceFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assets: { id: string; name: string }[];
  onSubmit: (payload: CreateMaintenanceRequestInput) => Promise<void>;
}

export function MaintenanceFormDialog({
  isOpen,
  onClose,
  assets,
  onSubmit,
}: MaintenanceFormDialogProps) {
  const [assetId, setAssetId] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<MaintenancePriority | "">("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-in fade-in zoom-in-95 relative z-50 w-full max-w-md rounded-xl border border-white/20 bg-surface p-6 shadow-2xl backdrop-blur-3xl dark:bg-surface/95">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Report Maintenance</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await onSubmit({
              assetId,
              issueDescription: description,
              priority: priority as MaintenancePriority,
            });
            onClose();
          }}
        >
          <div className="space-y-2">
            <Label>Asset</Label>
            <Select value={assetId} onValueChange={setAssetId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select asset..." />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description of Issue</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="What's wrong with it?"
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) =>
                setPriority(value as MaintenancePriority)
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-white hover:bg-primary/90"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
