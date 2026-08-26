"use client";

import { eliminarMarca } from "@/lib/actions/marcas";

export function EliminarMarcaBoton({
  id,
  nombre,
  cantidadProductos,
}: {
  id: number;
  nombre: string;
  cantidadProductos: number;
}) {
  const mensaje =
    cantidadProductos > 0
      ? `¿Eliminar "${nombre}"? Hay ${cantidadProductos} producto${
          cantidadProductos === 1 ? "" : "s"
        } con esta marca; se quedarán sin marca asignada.`
      : `¿Eliminar "${nombre}"?`;

  return (
    <form
      action={eliminarMarca.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(mensaje)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
      >
        Eliminar
      </button>
    </form>
  );
}
