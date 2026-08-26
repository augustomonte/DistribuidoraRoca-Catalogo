import {
  obtenerMarcas,
  obtenerProductos,
  PRODUCTOS_POR_PAGINA,
  type OrdenCatalogo,
} from "@/lib/catalogo";
import { ProductoCard } from "@/components/catalogo/ProductoCard";
import { Filtros } from "@/components/catalogo/Filtros";
import { Paginacion } from "@/components/catalogo/Paginacion";

export interface CatalogoSearchParams {
  [key: string]: string | undefined;
  pagina?: string;
  categoria?: string;
  marca?: string;
  q?: string;
  orden?: string;
}

export async function CatalogoView({
  searchParams,
}: {
  searchParams: CatalogoSearchParams;
}) {
  const pagina = Math.max(1, Number(searchParams.pagina) || 1);
  const categoriaId = searchParams.categoria
    ? Number(searchParams.categoria)
    : undefined;
  const orden: OrdenCatalogo =
    searchParams.orden === "nombre_desc" ? "nombre_desc" : "nombre_asc";

  const [{ productos, total }, marcas] = await Promise.all([
    obtenerProductos({
      pagina,
      categoriaId,
      marca: searchParams.marca,
      busqueda: searchParams.q,
      orden,
    }),
    obtenerMarcas(),
  ]);

  const totalPaginas = Math.ceil(total / PRODUCTOS_POR_PAGINA);

  return (
    <div>
      <Filtros marcas={marcas} />

      <p className="mb-4 text-sm text-roca-negro/50">
        {total} producto{total === 1 ? "" : "s"} encontrado
        {total === 1 ? "" : "s"}
      </p>

      {productos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-roca-negro/20 py-24 text-center text-roca-negro/50">
          No se encontraron productos con estos filtros.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {productos.map((producto, i) => (
            <ProductoCard key={producto.id} producto={producto} index={i} />
          ))}
        </div>
      )}

      <Paginacion
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        searchParams={searchParams}
      />
    </div>
  );
}
