import Link from "next/link";
import { obtenerCategoriasConConteo } from "@/lib/admin";
import { crearCategoria } from "@/lib/actions/categorias";
import { CategoriaForm } from "@/components/admin/CategoriaForm";
import { EliminarCategoriaBoton } from "@/components/admin/EliminarCategoriaBoton";
import { FormularioColapsable } from "@/components/admin/FormularioColapsable";

export default async function CategoriasPage() {
  const categorias = await obtenerCategoriasConConteo();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-tema-tinta">Categorías</h1>
        <FormularioColapsable etiquetaBoton="Nueva categoría">
          <CategoriaForm accion={crearCategoria} />
        </FormularioColapsable>
      </div>

      {categorias.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-tema-tinta/20 py-16 text-center text-tema-tinta/50">
          Todavía no hay categorías. Creá la primera con el botón de arriba.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-tema-tinta/10 bg-tema-papel">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-tema-tinta/10 bg-tema-fondo text-xs uppercase text-tema-tinta/60">
              <tr>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Productos</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr
                  key={categoria.id}
                  className="border-b border-tema-tinta/5 transition-colors duration-150 last:border-0 hover:bg-tema-fondo/60"
                >
                  <td className="px-4 py-3 text-tema-tinta/60">
                    {categoria.orden}
                  </td>
                  <td className="px-4 py-3 font-medium text-tema-tinta">
                    {categoria.nombre}
                  </td>
                  <td className="px-4 py-3">{categoria.cantidadProductos}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/categorias/${categoria.id}/editar`}
                        className="rounded-md border border-tema-tinta/20 px-3 py-1.5 text-xs font-medium hover:bg-tema-tinta/5"
                      >
                        Editar
                      </Link>
                      <EliminarCategoriaBoton
                        id={categoria.id}
                        nombre={categoria.nombre}
                        cantidadProductos={categoria.cantidadProductos}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
