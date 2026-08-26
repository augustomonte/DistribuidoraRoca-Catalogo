import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formateadorArs = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formatea un precio en pesos argentinos: "$ 3.247,02" */
export function formatearPrecio(precio: number): string {
  return `$ ${formateadorArs.format(precio)}`;
}

/**
 * Formatea el precio (ya con el IVA incluido) junto a la alícuota
 * correspondiente, a modo informativo: "$ 1.785,86 · IVA 21%"
 */
export function formatearPrecioConIva(
  precio: number,
  ivaPorcentaje: number
): string {
  return `${formatearPrecio(precio)} · IVA ${ivaPorcentaje}%`;
}
