import { createClient } from "@/lib/supabase/server";
import type { Categoria, ProductoVista } from "@/types";

export const PRODUCTOS_POR_PAGINA = 50;

export interface FiltrosCatalogo {
  pagina?: number;
  categoriaId?: number;
  marca?: string;
  busqueda?: string;
}

export async function obtenerProductos({
  pagina = 1,
  categoriaId,
  marca,
  busqueda,
}: FiltrosCatalogo): Promise<{ productos: ProductoVista[]; total: number }> {
  const supabase = await createClient();

  const desde = (pagina - 1) * PRODUCTOS_POR_PAGINA;
  const hasta = desde + PRODUCTOS_POR_PAGINA - 1;

  let query = supabase
    .from("productos_vista")
    .select("*", { count: "exact" })
    .order("nombre", { ascending: true })
    .range(desde, hasta);

  if (categoriaId) {
    query = query.eq("categoria_id", categoriaId);
  }

  if (marca) {
    query = query.eq("marca", marca);
  }

  if (busqueda) {
    const termino = busqueda.trim();
    if (termino) {
      // Términos cortos alfanuméricos sin espacios (ej: "00100400") suelen
      // ser un código de producto: priorizamos coincidencia exacta/parcial
      // por ilike en vez de full-text search, que no maneja bien códigos.
      const pareceCodigo = /^[a-z0-9-]+$/i.test(termino) && termino.length <= 20;

      if (pareceCodigo) {
        const escapado = termino.replace(/[%,]/g, "");
        query = query.or(
          `codigo.ilike.%${escapado}%,nombre.ilike.%${escapado}%`
        );
      } else {
        query = query.textSearch("nombre", termino, {
          type: "websearch",
          config: "spanish",
        });
      }
    }
  }

  const { data, count, error } = await query;

  if (error) throw error;

  return { productos: data ?? [], total: count ?? 0 };
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
