import Link from "next/link";
import { obtenerProductosAdmin, ADMIN_PRODUCTOS_POR_PAGINA } from "@/lib/admin";
import { obtenerMarcas } from "@/lib/marcas";
import { ProductosTable } from "@/components/admin/ProductosTable";
import { Paginacion } from "@/components/catalogo/Paginacion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string; q?: string; marca?: string }>;
}) {
  const { pagina: paginaParam, q, marca: marcaParam } = await searchParams;
  const pagina = Math.max(1, Number(paginaParam) || 1);
  const marcaId = marcaParam ? Number(marcaParam) : undefined;

  const [{ productos, total }, marcas] = await Promise.all([
    obtenerProductosAdmin({ pagina, busqueda: q, marcaId }),
    marcaId ? obtenerMarcas() : Promise.resolve([]),
  ]);
  const totalPaginas = Math.ceil(total / ADMIN_PRODUCTOS_POR_PAGINA);
  const marcaActual = marcas.find((m) => m.id === marcaId);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-roca-negro">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button>+ Nuevo producto</Button>
        </Link>
      </div>

      {marcaId && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-roca-rojo/10 px-3 py-2 text-sm text-roca-negro">
          <span>
            Filtrando por marca:{" "}
            <span className="font-semibold">
              {marcaActual?.nombre ?? `#${marcaId}`}
            </span>
          </span>
          <Link href="/admin" className="text-roca-rojo underline">
            Quitar filtro
          </Link>
        </div>
      )}

      <form className="mb-4 flex max-w-sm gap-2">
        {marcaId && <input type="hidden" name="marca" value={marcaId} />}
        <Input
          name="q"
          placeholder="Buscar por nombre o código..."
          defaultValue={q}
        />
        <Button type="submit" variante="outline">
          Buscar
        </Button>
      </form>

      <p className="mb-4 text-sm text-roca-negro/50">
        {total} producto{total === 1 ? "" : "s"} en total
      </p>

      <ProductosTable productos={productos} />

      <Paginacion
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        searchParams={{ q, marca: marcaParam }}
      />
    </div>
  );
}
