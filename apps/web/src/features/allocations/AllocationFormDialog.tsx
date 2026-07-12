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
import { DatePicker } from "../../components/ui/date-picker";
import { X } from "lucide-react";
import type { CreateAllocationInput } from "@/services/data/types/domain";

interface AllocationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assets: { id: string; name: string }[];
  employees: { id: string; name: string }[];
  onSubmit: (payload: CreateAllocationInput) => Promise<void>;
}

export function AllocationFormDialog({
  isOpen,
  onClose,
  assets,
  employees,
  onSubmit,
}: AllocationFormDialogProps) {
  const [assetId, setAssetId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [returnDate, setReturnDate] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-in fade-in zoom-in-95 relative z-50 w-full max-w-md rounded-xl border border-white/20 bg-surface p-6 shadow-2xl backdrop-blur-3xl dark:bg-surface/95">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Allocate Asset</h2>
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
              holderEmployeeId: employeeId,
              expectedReturnDate: returnDate || undefined,
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
            <Label>Assign To (Employee)</Label>
            <Select value={employeeId} onValueChange={setEmployeeId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select employee..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Expected Return Date</Label>
            <DatePicker
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-white hover:bg-primary/90"
            >
              Allocate
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
