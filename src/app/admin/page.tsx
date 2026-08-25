import Link from "next/link";
import { obtenerProductosAdmin, ADMIN_PRODUCTOS_POR_PAGINA } from "@/lib/admin";
import { ProductosTable } from "@/components/admin/ProductosTable";
import { Paginacion } from "@/components/catalogo/Paginacion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string; q?: string }>;
}) {
  const { pagina: paginaParam, q } = await searchParams;
  const pagina = Math.max(1, Number(paginaParam) || 1);

  const { productos, total } = await obtenerProductosAdmin({
    pagina,
    busqueda: q,
  });
  const totalPaginas = Math.ceil(total / ADMIN_PRODUCTOS_POR_PAGINA);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-roca-negro">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button>+ Nuevo producto</Button>
        </Link>
      </div>

      <form className="mb-4 flex max-w-sm gap-2">
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
        searchParams={{ q }}
      />
    </div>
  );
}
