"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { actualizarPreciosMasivo } from "@/lib/actions/precios";

export function ActualizarPreciosForm() {
  const [state, formAction, pending] = useActionState(
    actualizarPreciosMasivo,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-tema-tinta/10 bg-tema-papel p-5"
    >
      <div>
        <h2 className="text-base font-semibold text-tema-tinta">
          Actualización masiva de precios
        </h2>
        <p className="mt-1 text-sm text-tema-tinta/60">
          Subí un archivo .xlsx o .csv con columnas <code>codigo</code> y{" "}
          <code>precio</code> (el precio de catálogo, ya con IVA incluido).
          Se actualiza el precio de cada producto cuyo código coincida; el
          precio acordado se recalcula solo con el descuento configurado,
          así que si le pisaste un acordado a mano a algún producto, se
          pierde ese ajuste.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="archivo" className="text-sm font-medium">
          Archivo *
        </label>
        <input
          id="archivo"
          name="archivo"
          type="file"
          accept=".xlsx,.xls,.csv"
          required
          className="rounded-md border border-tema-tinta/20 bg-tema-papel text-sm text-tema-tinta file:mr-3 file:rounded file:border-0 file:bg-tema-tinta/5 file:px-3 file:py-2 file:text-sm file:font-medium file:text-tema-tinta hover:file:bg-tema-tinta/10"
        />
      </div>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {state.ok && (
        <div className="rounded-md bg-green-50 px-3 py-3 text-sm text-green-700">
          <p>
            {state.actualizados} producto
            {state.actualizados === 1 ? "" : "s"} actualizado
            {state.actualizados === 1 ? "" : "s"}.
          </p>
          {!!state.totalNoEncontrados && (
            <div className="mt-2 text-amber-700">
              <p>
                {state.totalNoEncontrados} código
                {state.totalNoEncontrados === 1 ? "" : "s"} del archivo no{" "}
                {state.totalNoEncontrados === 1 ? "coincide" : "coinciden"}{" "}
                con ningún producto:
              </p>
              <p className="mt-1 font-mono text-xs">
                {state.noEncontrados?.join(", ")}
                {state.totalNoEncontrados >
                  (state.noEncontrados?.length ?? 0) &&
                  ` … y ${
                    state.totalNoEncontrados - (state.noEncontrados?.length ?? 0)
                  } más`}
              </p>
            </div>
          )}
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Actualizando..." : "Actualizar precios"}
      </Button>
    </form>
  );
}
