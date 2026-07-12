import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Sheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
}: SheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="animate-in slide-in-from-right relative z-50 flex w-full max-w-md flex-col overflow-hidden border-l border-white/20 bg-surface/90 shadow-2xl backdrop-blur-3xl sm:max-w-lg dark:bg-surface/95">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="border-t border-white/10 bg-surface-muted/30 px-6 py-4 backdrop-blur-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
