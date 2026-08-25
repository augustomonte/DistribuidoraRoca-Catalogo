import { obtenerCategorias } from "@/lib/catalogo";

export default async function CategoriasPage() {
  const categorias = await obtenerCategorias();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-roca-negro">Categorías</h1>
      <div className="overflow-x-auto rounded-lg border border-roca-negro/10 bg-roca-blanco">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-roca-negro/10 bg-roca-gris text-xs uppercase text-roca-negro/60">
            <tr>
              <th className="px-4 py-3">Sector</th>
              <th className="px-4 py-3">Nombre</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id} className="border-b border-roca-negro/5 last:border-0">
                <td className="px-4 py-3 text-roca-negro/60">
                  {c.sector_numero}
                </td>
                <td className="px-4 py-3 font-medium text-roca-negro">
                  {c.nombre}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
