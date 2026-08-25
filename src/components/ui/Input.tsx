import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border border-roca-negro/20 bg-roca-blanco px-3 py-2 text-sm text-roca-negro",
        "placeholder:text-roca-negro/40",
        "focus:outline-none focus:ring-2 focus:ring-roca-rojo focus:border-roca-rojo",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
