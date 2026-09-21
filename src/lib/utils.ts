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

const formateadorRelativo = new Intl.RelativeTimeFormat("es-AR", {
  numeric: "auto",
});

/**
 * "hoy", "ayer", "hace 3 días", "hace 2 meses"... Se usa para mostrar
 * hace cuánto se actualizó el precio de un producto (ver
 * productos.precio_actualizado_en), para que se note cuando uno quedó
 * atrás en vez de recibir una actualización.
 */
export function formatearFechaRelativa(fechaIso: string): string {
  const fecha = new Date(fechaIso);
  const diffMs = fecha.getTime() - Date.now();
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDias) < 1) return "hoy";
  if (Math.abs(diffDias) < 30) return formateadorRelativo.format(diffDias, "day");

  const diffMeses = Math.round(diffDias / 30);
  if (Math.abs(diffMeses) < 12) {
    return formateadorRelativo.format(diffMeses, "month");
  }

  const diffAnios = Math.round(diffMeses / 12);
  return formateadorRelativo.format(diffAnios, "year");
}
