import { createClient } from "@/lib/supabase/server";
import type { Perfil, Producto } from "@/types";

export const ADMIN_PRODUCTOS_POR_PAGINA = 50;

export type ProductoConMarca = Producto & {
  marcas: { nombre: string } | null;
};

export async function obtenerProductosAdmin({
  pagina = 1,
  busqueda,
  marcaId,
}: {
  pagina?: number;
  busqueda?: string;
  marcaId?: number;
}): Promise<{ productos: ProductoConMarca[]; total: number }> {
  const supabase = await createClient();

  const desde = (pagina - 1) * ADMIN_PRODUCTOS_POR_PAGINA;
  const hasta = desde + ADMIN_PRODUCTOS_POR_PAGINA - 1;

  let query = supabase
    .from("productos")
    .select("*, marcas(nombre)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(desde, hasta);

  if (marcaId) {
    query = query.eq("marca_id", marcaId);
  }

  if (busqueda) {
    const termino = busqueda.trim().replace(/[%,]/g, "");
    if (termino) {
      query = query.or(`nombre.ilike.%${termino}%,codigo.ilike.%${termino}%`);
    }
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { productos: (data ?? []) as unknown as ProductoConMarca[], total: count ?? 0 };
}

export async function obtenerProductoPorId(
  id: string
): Promise<ProductoConMarca | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select("*, marcas(nombre)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as ProductoConMarca;
}

export async function obtenerVendedores(): Promise<Perfil[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("rol", "vendedor")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function obtenerFerreterias(): Promise<
  (Perfil & { vendedor: Pick<Perfil, "id" | "nombre" | "apellido"> | null })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfiles")
    .select("*, vendedor:creado_por(id, nombre, apellido)")
    .eq("rol", "ferreteria")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as (Perfil & {
    vendedor: Pick<Perfil, "id" | "nombre" | "apellido"> | null;
  })[];
}
