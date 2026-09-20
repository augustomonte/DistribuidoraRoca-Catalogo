import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variante = "primario" | "secundario" | "outline" | "peligro";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

const variantes: Record<Variante, string> = {
  primario:
    "bg-tema-primario text-tema-papel hover:bg-tema-primario-oscuro focus-visible:outline-tema-primario",
  secundario:
    "bg-tema-secundario text-tema-tinta hover:brightness-95 focus-visible:outline-tema-secundario",
  outline:
    "border border-tema-tinta/20 bg-transparent text-tema-tinta hover:bg-tema-tinta/5 focus-visible:outline-tema-tinta",
  peligro:
    "bg-red-700 text-tema-papel hover:bg-red-800 focus-visible:outline-red-700",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variante = "primario", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold",
          "transition-[background-color,color,transform] duration-150 ease-out",
          "active:scale-[0.97]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
          variantes[variante],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
