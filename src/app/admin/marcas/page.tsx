import Link from "next/link";
import { obtenerMarcasConConteo } from "@/lib/marcas";
import { EliminarMarcaBoton } from "@/components/admin/EliminarMarcaBoton";

export default async function MarcasPage() {
  const marcas = await obtenerMarcasConConteo();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-roca-negro">Marcas</h1>
      <p className="mb-6 text-sm text-roca-negro/50">
        Las marcas se crean automáticamente al cargar o editar un producto.
        Acá solo podés eliminarlas.
      </p>

      {marcas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-roca-negro/20 py-16 text-center text-roca-negro/50">
          Todavía no hay marcas cargadas.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-roca-negro/10 bg-roca-blanco">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-roca-negro/10 bg-roca-gris text-xs uppercase text-roca-negro/60">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Productos</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {marcas.map((marca) => (
                <tr
                  key={marca.id}
                  className="border-b border-roca-negro/5 transition-colors duration-150 last:border-0 hover:bg-roca-gris/60"
                >
                  <td className="px-4 py-3 font-medium text-roca-negro">
                    {marca.nombre}
                  </td>
                  <td className="px-4 py-3">{marca.cantidadProductos}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin?marca=${marca.id}`}
                        className="rounded-md border border-roca-negro/20 px-3 py-1.5 text-xs font-medium hover:bg-roca-negro/5"
                      >
                        Productos
                      </Link>
                      <EliminarMarcaBoton
                        id={marca.id}
                        nombre={marca.nombre}
                        cantidadProductos={marca.cantidadProductos}
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
