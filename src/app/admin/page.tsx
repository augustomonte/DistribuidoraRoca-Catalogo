import Link from "next/link";
import {
  obtenerProductosAdmin,
  ADMIN_PRODUCTOS_POR_PAGINA,
  type OrdenProductosAdmin,
} from "@/lib/admin";
import { obtenerMarcas } from "@/lib/marcas";
import { ProductosTable } from "@/components/admin/ProductosTable";
import { OrdenSelect } from "@/components/admin/OrdenSelect";
import { Paginacion } from "@/components/catalogo/Paginacion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const ORDENES_VALIDOS: OrdenProductosAdmin[] = [
  "reciente",
  "nombre_asc",
  "nombre_desc",
];

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{
    pagina?: string;
    q?: string;
    marca?: string;
    orden?: string;
  }>;
}) {
  const { pagina: paginaParam, q, marca: marcaParam, orden: ordenParam } =
    await searchParams;
  const pagina = Math.max(1, Number(paginaParam) || 1);
  const marcaId = marcaParam ? Number(marcaParam) : undefined;
  const orden = ORDENES_VALIDOS.includes(ordenParam as OrdenProductosAdmin)
    ? (ordenParam as OrdenProductosAdmin)
    : "reciente";

  const [{ productos, total }, marcas] = await Promise.all([
    obtenerProductosAdmin({ pagina, busqueda: q, marcaId, orden }),
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

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form className="flex max-w-sm flex-1 gap-2">
          {marcaId && <input type="hidden" name="marca" value={marcaId} />}
          {ordenParam && <input type="hidden" name="orden" value={ordenParam} />}
          <Input
            name="q"
            placeholder="Buscar por nombre o código..."
            defaultValue={q}
          />
          <Button type="submit" variante="outline">
            Buscar
          </Button>
        </form>

        <OrdenSelect />
      </div>

      <p className="mb-4 text-sm text-roca-negro/50">
        {total} producto{total === 1 ? "" : "s"} en total
      </p>

      <ProductosTable productos={productos} />

      <Paginacion
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        searchParams={{ q, marca: marcaParam, orden: ordenParam }}
      />
    </div>
  );
}
