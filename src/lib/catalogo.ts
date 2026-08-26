import { createClient } from "@/lib/supabase/server";
import type { Categoria, ProductoVista } from "@/types";

export const PRODUCTOS_POR_PAGINA = 50;

export type OrdenCatalogo = "nombre_asc" | "nombre_desc";

export interface FiltrosCatalogo {
  pagina?: number;
  categoriaId?: number;
  marca?: string;
  busqueda?: string;
  orden?: OrdenCatalogo;
}

export async function obtenerProductos({
  pagina = 1,
  categoriaId,
  marca,
  busqueda,
  orden = "nombre_asc",
}: FiltrosCatalogo): Promise<{ productos: ProductoVista[]; total: number }> {
  const supabase = await createClient();

  const desde = (pagina - 1) * PRODUCTOS_POR_PAGINA;
  const hasta = desde + PRODUCTOS_POR_PAGINA - 1;

  const termino = busqueda?.trim().replace(/[%_]/g, "");

  if (termino) {
    // Con término de búsqueda: usamos la función que rankea por relevancia
    // (código/nombre que empieza con el término primero, después palabra
    // completa en el nombre, después coincidencia parcial) en vez de
    // ordenar solo alfabéticamente.
    const [{ data: productos, error: errorBusqueda }, { count, error: errorConteo }] =
      await Promise.all([
        supabase.rpc("buscar_productos_ranked", {
          termino,
          filtro_categoria_id: categoriaId ?? null,
          filtro_marca: marca ?? null,
          orden_alfabetico: orden === "nombre_desc" ? "desc" : "asc",
          limite: PRODUCTOS_POR_PAGINA,
          desplazamiento: desde,
        }),
        contarConTermino({ termino, categoriaId, marca }),
      ]);

    if (errorBusqueda) throw errorBusqueda;
    if (errorConteo) throw errorConteo;

    return { productos: productos ?? [], total: count ?? 0 };
  }

  let query = supabase
    .from("productos_vista")
    .select("*", { count: "exact" })
    .order("nombre", { ascending: orden === "nombre_asc" })
    .range(desde, hasta);

  if (categoriaId) {
    query = query.eq("categoria_id", categoriaId);
  }

  if (marca) {
    query = query.eq("marca", marca);
  }

  const { data, count, error } = await query;

  if (error) throw error;

  return { productos: data ?? [], total: count ?? 0 };
}

async function contarConTermino({
  termino,
  categoriaId,
  marca,
}: {
  termino: string;
  categoriaId?: number;
  marca?: string;
}): Promise<{ count: number | null; error: null | { message: string } }> {
  const supabase = await createClient();

  let query = supabase
    .from("productos_vista")
    .select("id", { count: "exact", head: true })
    .or(`nombre.ilike.%${termino}%,codigo.ilike.%${termino}%`);

  if (categoriaId) {
    query = query.eq("categoria_id", categoriaId);
  }

  if (marca) {
    query = query.eq("marca", marca);
  }

  const { count, error } = await query;
  return { count, error };
}

export async function obtenerCategorias(): Promise<Categoria[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("sector_numero", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function obtenerMarcas(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marcas")
    .select("nombre")
    .order("nombre", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((m) => m.nombre);
}
