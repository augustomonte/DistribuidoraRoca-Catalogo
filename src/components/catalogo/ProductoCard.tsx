import Image from "next/image";
import { formatearPrecioConIva } from "@/lib/utils";
import type { ProductoVista } from "@/types";

export function ProductoCard({
  producto,
  index = 0,
}: {
  producto: ProductoVista;
  index?: number;
}) {
  return (
    <div
      className="producto-card-enter group flex flex-col overflow-hidden rounded-lg border border-roca-negro/10 bg-roca-blanco shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-md"
      style={{ "--i": Math.min(index, 12) } as React.CSSProperties}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-roca-gris">
        {producto.foto_url ? (
          <Image
            src={producto.foto_url}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-roca-negro/30">
            Sin foto
          </div>
        )}

        {!producto.stock_disponible && (
          <span className="absolute left-2 top-2 rounded bg-roca-negro/80 px-2 py-1 text-xs font-semibold text-roca-blanco">
            Sin stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {producto.marca && (
          <span className="text-xs font-bold uppercase tracking-wide text-roca-rojo">
            {producto.marca}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium text-roca-negro">
          {producto.nombre}
        </h3>
        <p className="font-mono text-xs text-roca-negro/40">
          {producto.codigo}
        </p>

        <div className="mt-auto pt-2">
          <p className="flex items-center gap-1.5 text-base font-bold text-roca-negro">
            {formatearPrecioConIva(producto.precio, producto.iva_porcentaje)}
            {producto.nota_iva === "3" && (
              <span
                title="Nota 3"
                className="text-sm font-normal text-roca-negro/40"
              >
                ③
              </span>
            )}
          </p>
          {producto.unidad_venta && (
            <p className="text-xs text-roca-negro/50">
              por {producto.unidad_venta.toLowerCase()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
