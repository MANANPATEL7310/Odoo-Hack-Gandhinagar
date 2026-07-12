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
import type { CreateBookingInput } from "@/services/data/types/domain";

interface BookingFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assets: { id: string; name: string }[];
  onSubmit: (payload: CreateBookingInput) => Promise<void>;
}

export function BookingFormDialog({
  isOpen,
  onClose,
  assets,
  onSubmit,
}: BookingFormDialogProps) {
  const [assetId, setAssetId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-in fade-in zoom-in-95 relative z-50 w-full max-w-md rounded-xl border border-white/20 bg-surface p-6 shadow-2xl backdrop-blur-3xl dark:bg-surface/95">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">New Booking</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await onSubmit({
              resourceAssetId: assetId,
              startTime,
              endTime,
            });
            onClose();
          }}
        >
          <div className="space-y-2">
            <Label>Asset (Bookable Only)</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <DatePicker
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <DatePicker
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-white hover:bg-primary/90"
            >
              Confirm Booking
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
