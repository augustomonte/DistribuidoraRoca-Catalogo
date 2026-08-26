import Link from "next/link";
import { formatearPrecioConIva } from "@/lib/utils";
import { alternarActivoProducto } from "@/lib/actions/productos";
import { EliminarProductoBoton } from "@/components/admin/EliminarProductoBoton";
import type { ProductoConMarca } from "@/lib/admin";

export function ProductosTable({
  productos,
}: {
  productos: ProductoConMarca[];
}) {
  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-roca-negro/20 py-24 text-center text-roca-negro/50">
        No hay productos cargados todavía.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-roca-negro/10 bg-roca-blanco">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="border-b border-roca-negro/10 bg-roca-gris text-xs uppercase text-roca-negro/60">
          <tr>
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Marca</th>
            <th className="px-4 py-3">Precio Catálogo</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr
              key={producto.id}
              className="border-b border-roca-negro/5 transition-colors duration-150 last:border-0 hover:bg-roca-gris/60"
            >
              <td className="px-4 py-3 text-roca-negro/60">
                {producto.codigo}
              </td>
              <td className="px-4 py-3 font-medium text-roca-negro">
                {producto.nombre}
              </td>
              <td className="px-4 py-3">{producto.marcas?.nombre ?? "—"}</td>
              <td className="px-4 py-3">
                {formatearPrecioConIva(
                  producto.precio_lista2,
                  producto.iva_porcentaje
                )}
              </td>
              <td className="px-4 py-3">
                {producto.stock_disponible ? "Sí" : "Sin stock"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    producto.activo
                      ? "rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700"
                      : "rounded bg-roca-negro/10 px-2 py-1 text-xs font-semibold text-roca-negro/50"
                  }
                >
                  {producto.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/productos/${producto.id}/editar`}
                    className="rounded-md border border-roca-negro/20 px-3 py-1.5 text-xs font-medium hover:bg-roca-negro/5"
                  >
                    Editar
                  </Link>

                  <form
                    action={alternarActivoProducto.bind(
                      null,
                      producto.id,
                      producto.activo
                    )}
                  >
                    <button
                      type="submit"
                      className="rounded-md border border-roca-negro/20 px-3 py-1.5 text-xs font-medium hover:bg-roca-negro/5"
                    >
                      {producto.activo ? "Desactivar" : "Activar"}
                    </button>
                  </form>

                  <EliminarProductoBoton
                    id={producto.id}
                    nombre={producto.nombre}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
