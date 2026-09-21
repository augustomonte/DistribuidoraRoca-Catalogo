import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerProductoDetalle } from "@/lib/catalogo";
import { getPerfilActual } from "@/lib/auth";
import { formatearPrecioConFacturacion, formatearFechaRelativa } from "@/lib/utils";
import { BotonAgregarCarrito } from "@/components/catalogo/BotonAgregarCarrito";

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [producto, perfil] = await Promise.all([
    obtenerProductoDetalle(id),
    getPerfilActual(),
  ]);

  if (!producto) notFound();

  return (
    <div>
      <Link
        href="/catalogo"
        className="mb-4 inline-block text-sm text-tema-tinta/60 hover:text-tema-tinta"
      >
        ← Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-tema-tinta/10 bg-tema-fondo">
          {producto.foto_url ? (
            <Image
              src={producto.foto_url}
              alt={producto.nombre}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-6"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-tema-tinta/30">
              Sin foto
            </div>
          )}

          {!producto.stock_disponible && (
            <span className="absolute left-3 top-3 rounded bg-tema-superficie-oscura/80 px-2 py-1 text-xs font-semibold text-tema-texto-claro">
              Sin stock
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {producto.marca && (
            <span className="text-sm font-bold uppercase tracking-wide text-tema-primario">
              {producto.marca}
            </span>
          )}
          <h1 className="text-2xl font-bold text-tema-tinta">
            {producto.nombre}
          </h1>
          <p className="font-mono text-sm text-tema-tinta/50">
            Código: {producto.codigo}
          </p>
          {producto.categoria_nombre && (
            <p className="text-sm text-tema-tinta/60">
              Categoría: {producto.categoria_nombre}
            </p>
          )}

          <div className="mt-2 border-t border-tema-tinta/10 pt-4">
            <p className="text-2xl font-bold text-tema-tinta">
              {formatearPrecioConFacturacion(
                producto.precio,
                producto.opcion_facturacion
              )}
            </p>
            {producto.unidad_venta && (
              <p className="text-sm text-tema-tinta/50">
                por {producto.unidad_venta.toLowerCase()}
              </p>
            )}
            <p
              className="mt-1 text-xs text-tema-tinta/40"
              title={new Date(producto.precio_actualizado_en).toLocaleString(
                "es-AR"
              )}
            >
              Precio actualizado {formatearFechaRelativa(producto.precio_actualizado_en)}
            </p>
          </div>

          {producto.descripcion && (
            <p className="mt-2 whitespace-pre-line text-sm text-tema-tinta/70">
              {producto.descripcion}
            </p>
          )}

          {perfil?.rol === "cliente" && (
            <div className="mt-2 max-w-xs">
              <BotonAgregarCarrito producto={producto} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
