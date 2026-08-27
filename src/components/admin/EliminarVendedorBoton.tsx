"use client";

import { useActionState } from "react";
import { eliminarVendedor } from "@/lib/actions/usuarios";

export function EliminarVendedorBoton({
  id,
  nombre,
}: {
  id: string;
  nombre: string;
}) {
  const [state, formAction] = useActionState(
    eliminarVendedor.bind(null, id),
    {}
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <form
        action={formAction}
        onSubmit={(e) => {
          if (
            !confirm(
              `¿Eliminar a "${nombre}"? Esta acción no se puede deshacer.`
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
      {state.error && (
        <p className="max-w-[220px] text-right text-xs text-red-600">
          {state.error}
        </p>
      )}
    </div>
  );
}
