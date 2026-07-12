import * as React from "react";
import { cn } from "../../lib/utils";
import { Input } from "./input";

export type DatePickerProps = React.InputHTMLAttributes<HTMLInputElement>;

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, type = "datetime-local", ...props }, ref) => {
    return (
      <Input
        type={type}
        className={cn("cursor-pointer", className)}
        ref={ref}
        {...props}
      />
    );
  },
);
DatePicker.displayName = "DatePicker";
