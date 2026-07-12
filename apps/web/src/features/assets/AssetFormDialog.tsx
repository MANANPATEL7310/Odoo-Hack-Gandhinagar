import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { FileUpload } from "../../components/ui/file-upload";
import { getAssetsRepository } from "@/services/data/repositories";
import { X } from "lucide-react";

interface AssetFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  onSuccess: () => void;
}

export function AssetFormDialog({
  isOpen,
  onClose,
  categories,
  departments,
  onSuccess,
}: AssetFormDialogProps) {
  const assetsRepository = getAssetsRepository();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationDepartmentId, setLocationDepartmentId] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await assetsRepository.createAsset({
        name,
        categoryId,
        locationDepartmentId: locationDepartmentId || undefined,
        serialNumber: serialNumber || undefined,
        photoUrls: photoUrl ? [photoUrl] : undefined,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    return assetsRepository.uploadFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-in fade-in zoom-in-95 relative z-50 w-full max-w-lg overflow-y-auto rounded-xl border border-white/20 bg-surface p-6 shadow-2xl backdrop-blur-3xl dark:bg-surface/95">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Register New Asset</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Asset Name</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="MacBook Pro M3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={locationDepartmentId}
                onValueChange={setLocationDepartmentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serial">Serial Number (Optional)</Label>
            <Input
              id="serial"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="SN-12345"
            />
          </div>

          <div className="space-y-2">
            <Label>Asset Photo</Label>
            <FileUpload
              onUpload={handleFileUpload}
              onSuccess={setPhotoUrl}
              accept="image/*"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {loading ? "Registering..." : "Register Asset"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
