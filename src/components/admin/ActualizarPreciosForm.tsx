"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { formatearPrecio } from "@/lib/utils";
import { etiquetaFacturacion } from "@/config/cliente";
import {
  previsualizarPreciosMasivo,
  confirmarPreciosMasivo,
  type ConfirmarPreciosState,
} from "@/lib/actions/precios";

export function ActualizarPreciosForm() {
  const [preview, formAction, pendingPreview] = useActionState(
    previsualizarPreciosMasivo,
    {}
  );
  const [confirmando, startConfirmar] = useTransition();
  const [resultado, setResultado] = useState<ConfirmarPreciosState | null>(
    null
  );

  function handleConfirmar() {
    if (!preview.items) return;
    startConfirmar(async () => {
      setResultado(await confirmarPreciosMasivo(preview.items!));
    });
  }

  // Volver a "Subí un archivo" desde cero es más simple y más confiable
  // que tratar de resetear a mano el estado de useActionState.
  function handleVolver() {
    window.location.reload();
  }

  if (resultado) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-tema-tinta/10 bg-tema-papel p-5">
        {resultado.ok ? (
          <p className="rounded-md bg-green-50 px-3 py-3 text-sm text-green-700">
            {resultado.actualizados} producto
            {resultado.actualizados === 1 ? "" : "s"} actualizado
            {resultado.actualizados === 1 ? "" : "s"}.
          </p>
        ) : (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {resultado.error}
          </p>
        )}
        <Button variante="outline" onClick={handleVolver} className="w-fit">
          Actualizar otro archivo
        </Button>
      </div>
    );
  }

  if (preview.ok) {
    const faltanEnPreview =
      (preview.totalMatcheados ?? 0) - (preview.preview?.length ?? 0);

    return (
      <div className="flex flex-col gap-4 rounded-lg border border-tema-tinta/10 bg-tema-papel p-5">
        <div>
          <h2 className="text-base font-semibold text-tema-tinta">
            Revisá los cambios antes de confirmar
          </h2>
          <p className="mt-1 text-sm text-tema-tinta/60">
            {preview.totalMatcheados} producto
            {preview.totalMatcheados === 1 ? "" : "s"}{" "}
            {preview.totalMatcheados === 1 ? "se va" : "se van"} a actualizar.
            Nada se guardó todavía.
          </p>
        </div>

        {!!preview.filasInvalidas && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {preview.filasInvalidas} fila
            {preview.filasInvalidas === 1 ? "" : "s"} del archivo no se{" "}
            {preview.filasInvalidas === 1 ? "pudo" : "pudieron"} leer (código,
            precio u opción de facturación inválidos) y no se van a tocar.
          </p>
        )}

        {!!preview.filasDuplicadas && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {preview.filasDuplicadas} código
            {preview.filasDuplicadas === 1 ? "" : "s"} aparece
            {preview.filasDuplicadas === 1 ? "" : "n"} más de una vez en el
            archivo: se usa la última fila de cada uno.
          </p>
        )}

        {!!preview.totalNoEncontrados && (
          <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
            <p>
              {preview.totalNoEncontrados} código
              {preview.totalNoEncontrados === 1 ? "" : "s"} del archivo no{" "}
              {preview.totalNoEncontrados === 1 ? "coincide" : "coinciden"}{" "}
              con ningún producto:
            </p>
            <p className="mt-1 font-mono text-xs">
              {preview.noEncontrados?.join(", ")}
              {preview.totalNoEncontrados >
                (preview.noEncontrados?.length ?? 0) &&
                ` … y ${
                  preview.totalNoEncontrados -
                  (preview.noEncontrados?.length ?? 0)
                } más`}
            </p>
          </div>
        )}

        <div className="max-h-96 overflow-y-auto rounded-md border border-tema-tinta/10">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 border-b border-tema-tinta/10 bg-tema-fondo text-xs uppercase text-tema-tinta/60">
              <tr>
                <th className="px-3 py-2">Código</th>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2 text-right">Precio actual</th>
                <th className="px-3 py-2 text-right">Precio nuevo</th>
                <th className="px-3 py-2">Facturación</th>
              </tr>
            </thead>
            <tbody>
              {preview.preview?.map((fila) => (
                <tr
                  key={fila.codigo}
                  className="border-b border-tema-tinta/5 last:border-0"
                >
                  <td className="px-3 py-2 font-mono text-xs text-tema-tinta/60">
                    {fila.codigo}
                  </td>
                  <td className="px-3 py-2 text-tema-tinta">{fila.nombre}</td>
                  <td className="px-3 py-2 text-right text-tema-tinta/50">
                    {formatearPrecio(fila.precioActual)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-tema-tinta">
                    {formatearPrecio(fila.precioNuevo)}
                  </td>
                  <td className="px-3 py-2 text-xs text-tema-tinta/60">
                    {etiquetaFacturacion(fila.opcionNueva) ?? "sin cambio"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {faltanEnPreview > 0 && (
          <p className="text-xs text-tema-tinta/50">
            Mostrando los primeros {preview.preview?.length} de{" "}
            {preview.totalMatcheados}.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleConfirmar} disabled={confirmando}>
            {confirmando
              ? "Actualizando..."
              : `Confirmar y actualizar ${preview.totalMatcheados} producto${
                  preview.totalMatcheados === 1 ? "" : "s"
                }`}
          </Button>
          <Button
            variante="outline"
            onClick={handleVolver}
            disabled={confirmando}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-tema-tinta/10 bg-tema-papel p-5"
    >
      <div>
        <h2 className="text-base font-semibold text-tema-tinta">
          Actualización masiva de precios
        </h2>
        <p className="mt-1 text-sm text-tema-tinta/60">
          Subí un archivo .xlsx o .csv con las columnas <code>codigo</code>,{" "}
          <code>precio</code> y <code>opcion_facturacion</code> (1, 2 o 3).
          El precio se guarda tal cual está en el archivo, sin cálculos. Si
          la columna de facturación no está o una celda viene vacía, se
          conserva la que ya tenía el producto.
        </p>
        <a
          href="/plantilla-precios.xlsx"
          download
          className="mt-2 inline-block text-sm font-medium text-tema-primario hover:underline"
        >
          Descargar plantilla de ejemplo
        </a>
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

      {preview.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {preview.error}
        </p>
      )}

      <Button type="submit" disabled={pendingPreview} className="w-fit">
        {pendingPreview ? "Leyendo archivo..." : "Ver cambios"}
      </Button>
    </form>
  );
}
