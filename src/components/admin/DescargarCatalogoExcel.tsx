"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { exportarCatalogo } from "@/lib/actions/precios";

/**
 * Descarga TODO el catálogo a un .xlsx, con las columnas tal cual las
 * pidió el usuario: CODIGO, DESCRIPCION, PRECIO, OPCION_FACTURACION,
 * ULTIMA_ACTUALIZACION. Pensado para reconciliar contra el sistema del
 * cliente o como base para armar el próximo archivo de precios.
 */
export function DescargarCatalogoExcel() {
  const [estado, setEstado] = useState<"listo" | "generando" | "error">(
    "listo"
  );

  async function handleDescargar() {
    setEstado("generando");
    try {
      const resultado = await exportarCatalogo();
      if (!resultado.ok) {
        setEstado("error");
        return;
      }

      // Import dinámico: SheetJS solo se descarga al navegador si el admin
      // realmente aprieta el botón.
      const XLSX = await import("xlsx");
      const hoja = XLSX.utils.json_to_sheet(
        resultado.filas.map((f) => ({
          CODIGO: f.codigo,
          DESCRIPCION: f.nombre,
          PRECIO: f.precio,
          OPCION_FACTURACION: f.opcionFacturacion ?? "",
          ULTIMA_ACTUALIZACION: new Date(f.precioActualizadoEn).toLocaleString(
            "es-AR"
          ),
        }))
      );
      hoja["!cols"] = [
        { wch: 14 },
        { wch: 45 },
        { wch: 14 },
        { wch: 20 },
        { wch: 20 },
      ];
      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, hoja, "Catálogo");
      const fecha = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(libro, `catalogo-${fecha}.xlsx`);
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-tema-tinta/10 bg-tema-papel p-5">
      <div>
        <h2 className="text-base font-semibold text-tema-tinta">
          Descargar catálogo completo
        </h2>
        <p className="mt-1 text-sm text-tema-tinta/60">
          Todos los productos (activos e inactivos), con código, nombre,
          precio, opción de facturación y última actualización de precio.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variante="outline"
          onClick={handleDescargar}
          disabled={estado === "generando"}
          className="w-fit"
        >
          {estado === "generando" ? "Generando..." : "Descargar Excel"}
        </Button>
        {estado === "error" && (
          <p className="text-sm text-red-700">
            No se pudo generar el archivo. Probá de nuevo.
          </p>
        )}
      </div>
    </div>
  );
}
