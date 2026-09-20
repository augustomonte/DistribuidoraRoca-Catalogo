"use client";

import { eliminarCategoria } from "@/lib/actions/categorias";

export function EliminarCategoriaBoton({
  id,
  nombre,
  cantidadProductos,
}: {
  id: number;
  nombre: string;
  cantidadProductos: number;
}) {
  if (cantidadProductos > 0) {
    return (
      <button
        type="button"
        disabled
        title={`Tiene ${cantidadProductos} producto${
          cantidadProductos === 1 ? "" : "s"
        }: movelos a otra categoría antes de eliminarla.`}
        className="cursor-not-allowed rounded-md border border-tema-tinta/10 px-3 py-1.5 text-xs font-medium text-tema-tinta/30"
      >
        Eliminar
      </button>
    );
  }

  return (
    <form
      action={eliminarCategoria.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`¿Eliminar la categoría "${nombre}"?`)) e.preventDefault();
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
