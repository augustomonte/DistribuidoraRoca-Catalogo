"use client";

import { eliminarProducto } from "@/lib/actions/productos";

export function EliminarProductoBoton({
  id,
  nombre,
}: {
  id: string;
  nombre: string;
}) {
  return (
    <form
      action={eliminarProducto.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) {
          e.preventDefault();
        }
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
