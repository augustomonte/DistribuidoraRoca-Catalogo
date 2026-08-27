"use client";

import { eliminarFerreteria } from "@/lib/actions/usuarios";

export function EliminarFerreteriaBoton({
  id,
  nombre,
}: {
  id: string;
  nombre: string;
}) {
  return (
    <form
      action={eliminarFerreteria.bind(null, id)}
      onSubmit={(e) => {
        if (
          !confirm(
            `¿Eliminar la cuenta de "${nombre}"? Esta acción no se puede deshacer y borra también su acceso para iniciar sesión.`
          )
        ) {
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
