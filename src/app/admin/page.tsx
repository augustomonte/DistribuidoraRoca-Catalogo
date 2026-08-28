import Link from "next/link";
import {
  obtenerProductosAdmin,
  ADMIN_PRODUCTOS_POR_PAGINA,
  type OrdenProductosAdmin,
} from "@/lib/admin";
import { obtenerMarcas } from "@/lib/marcas";
import { ProductosTable } from "@/components/admin/ProductosTable";
import { OrdenSelect } from "@/components/admin/OrdenSelect";
import { FiltroSelect } from "@/components/admin/FiltroSelect";
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
    activo?: string;
    orden?: string;
  }>;
}) {
  const {
    pagina: paginaParam,
    q,
    marca: marcaParam,
    activo: activoParam,
    orden: ordenParam,
  } = await searchParams;
  const pagina = Math.max(1, Number(paginaParam) || 1);
  const marcaId = marcaParam ? Number(marcaParam) : undefined;
  const activo =
    activoParam === "si" ? true : activoParam === "no" ? false : undefined;
  const orden = ORDENES_VALIDOS.includes(ordenParam as OrdenProductosAdmin)
    ? (ordenParam as OrdenProductosAdmin)
    : "reciente";

  const [{ productos, total }, marcas] = await Promise.all([
    obtenerProductosAdmin({ pagina, busqueda: q, marcaId, activo, orden }),
    obtenerMarcas(),
  ]);
  const totalPaginas = Math.ceil(total / ADMIN_PRODUCTOS_POR_PAGINA);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-roca-negro">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button>+ Nuevo producto</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form className="flex max-w-sm flex-1 gap-2">
          {marcaId && <input type="hidden" name="marca" value={marcaId} />}
          {activoParam && (
            <input type="hidden" name="activo" value={activoParam} />
          )}
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

        <FiltroSelect
          paramNombre="marca"
          placeholder="Todas las marcas"
          opciones={marcas.map((m) => ({
            value: String(m.id),
            label: m.nombre,
          }))}
        />

        <FiltroSelect
          paramNombre="activo"
          placeholder="Activos e inactivos"
          opciones={[
            { value: "si", label: "Activos" },
            { value: "no", label: "Inactivos" },
          ]}
        />

        <OrdenSelect />
      </div>

      <p className="mb-4 text-sm text-roca-negro/50">
        {total} producto{total === 1 ? "" : "s"} en total
      </p>

      <ProductosTable productos={productos} />

      <Paginacion
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        searchParams={{
          q,
          marca: marcaParam,
          activo: activoParam,
          orden: ordenParam,
        }}
      />
    </div>
  );
}
