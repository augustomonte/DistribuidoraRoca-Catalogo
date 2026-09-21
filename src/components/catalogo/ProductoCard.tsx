import Image from "next/image";
import Link from "next/link";
import { formatearPrecioConIva } from "@/lib/utils";
import { BotonAgregarCarrito } from "@/components/catalogo/BotonAgregarCarrito";
import type { ProductoVista } from "@/types";

export function ProductoCard({
  producto,
  index = 0,
  puedeComprar = false,
}: {
  producto: ProductoVista;
  index?: number;
  /** true solo para el rol "cliente": es el único que puede pedir. */
  puedeComprar?: boolean;
}) {
  return (
    <div
      className="producto-card-enter group flex flex-col overflow-hidden rounded-lg border border-tema-tinta/10 bg-tema-papel shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-md"
      style={{ "--i": Math.min(index, 12) } as React.CSSProperties}
    >
      {/* El botón de agregar va afuera de este Link: un <button> dentro de
          un <a> es HTML inválido (interactivos anidados) y trae problemas
          de foco/click. */}
      <Link href={`/catalogo/${producto.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-tema-fondo">
          {producto.foto_url ? (
            <Image
              src={producto.foto_url}
              alt={producto.nombre}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-tema-tinta/30">
              Sin foto
            </div>
          )}

          {!producto.stock_disponible && (
            <span className="absolute left-2 top-2 rounded bg-tema-tinta/80 px-2 py-1 text-xs font-semibold text-tema-papel">
              Sin stock
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3">
          {producto.marca && (
            <span className="text-xs font-bold uppercase tracking-wide text-tema-primario">
              {producto.marca}
            </span>
          )}
          <h3 className="text-sm font-medium text-tema-tinta">
            {producto.nombre}
          </h3>
          <p className="font-mono text-xs text-tema-tinta/40">
            {producto.codigo}
          </p>

          <div className="mt-auto pt-2">
            <p className="flex items-center gap-1.5 text-base font-bold text-tema-tinta">
              {formatearPrecioConIva(producto.precio, producto.iva_porcentaje)}
              {producto.nota_iva === "3" && (
                <span
                  title="Nota 3"
                  className="text-sm font-normal text-tema-tinta/40"
                >
                  ③
                </span>
              )}
            </p>
            {producto.unidad_venta && (
              <p className="text-xs text-tema-tinta/50">
                por {producto.unidad_venta.toLowerCase()}
              </p>
            )}
          </div>
        </div>
      </Link>

      {puedeComprar && (
        <div className="px-3 pb-3">
          <BotonAgregarCarrito producto={producto} compacto />
        </div>
      )}
    </div>
  );
}
