import React, { useCallback, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "./button";

interface FileUploadProps {
  onUpload: (file: File) => Promise<{ url: string; key: string }>;
  onSuccess?: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  onUpload,
  onSuccess,
  accept,
  maxSizeMB = 5,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const processFile = async (file: File) => {
    setError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    if (accept && !file.type.match(accept.replace("*", ".*"))) {
      setError("File type not supported");
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    try {
      setUploading(true);
      const res = await onUpload(file);
      onSuccess?.(res.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0] as File);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative overflow-hidden rounded-lg border border-white/20 bg-surface/50 p-2 text-center">
          <img
            src={preview}
            alt="Preview"
            className="mx-auto max-h-48 rounded object-cover"
          />
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 right-3 bg-surface/80"
            onClick={() => setPreview(null)}
            disabled={uploading}
          >
            <X className="size-4" />
          </Button>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}
        </div>
      ) : (
        <div
          className={`relative flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-white/30 hover:border-primary/50 hover:bg-white/5 dark:border-white/10 dark:hover:bg-white/5"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 cursor-pointer opacity-0"
            accept={accept}
            onChange={handleChange}
            disabled={uploading}
          />
          <UploadCloud
            className={`mb-3 size-10 ${
              isDragging ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <p className="text-sm font-medium">
            Drag & drop a file or click to select
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Max size: {maxSizeMB}MB
          </p>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}
