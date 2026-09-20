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
        "w-full rounded-md border border-tema-tinta/20 bg-tema-papel px-3 py-2 text-sm text-tema-tinta",
        "focus:outline-none focus:ring-2 focus:ring-tema-primario focus:border-tema-primario",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Select.displayName = "Select";
