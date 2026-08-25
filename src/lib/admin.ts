import { createClient } from "@/lib/supabase/server";
import type { Perfil, Producto } from "@/types";

export const ADMIN_PRODUCTOS_POR_PAGINA = 50;

export async function obtenerProductosAdmin({
  pagina = 1,
  busqueda,
}: {
  pagina?: number;
  busqueda?: string;
}): Promise<{ productos: Producto[]; total: number }> {
  const supabase = await createClient();

  const desde = (pagina - 1) * ADMIN_PRODUCTOS_POR_PAGINA;
  const hasta = desde + ADMIN_PRODUCTOS_POR_PAGINA - 1;

  let query = supabase
    .from("productos")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(desde, hasta);

  if (busqueda) {
    const termino = busqueda.trim().replace(/[%,]/g, "");
    if (termino) {
      query = query.or(`nombre.ilike.%${termino}%,codigo.ilike.%${termino}%`);
    }
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { productos: data ?? [], total: count ?? 0 };
}

export async function obtenerProductoPorId(id: string): Promise<Producto | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
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
