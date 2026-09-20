import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-md border border-tema-tinta/20 bg-tema-papel px-3 py-2 text-sm text-tema-tinta",
        "placeholder:text-tema-tinta/40",
        "focus:outline-none focus:ring-2 focus:ring-tema-primario focus:border-tema-primario",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
