import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-md border border-roca-negro/20 bg-roca-blanco px-3 py-2 text-sm text-roca-negro",
        "focus:outline-none focus:ring-2 focus:ring-roca-rojo focus:border-roca-rojo",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Select.displayName = "Select";
