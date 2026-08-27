import { createClient } from "@/lib/supabase/server";
import type { Perfil, Producto } from "@/types";

export const ADMIN_PRODUCTOS_POR_PAGINA = 50;

export type ProductoConMarca = Producto & {
  marcas: { nombre: string } | null;
};

export type OrdenProductosAdmin = "reciente" | "nombre_asc" | "nombre_desc";

export async function obtenerProductosAdmin({
  pagina = 1,
  busqueda,
  marcaId,
  orden = "reciente",
}: {
  pagina?: number;
  busqueda?: string;
  marcaId?: number;
  orden?: OrdenProductosAdmin;
}): Promise<{ productos: ProductoConMarca[]; total: number }> {
  const supabase = await createClient();

  const desde = (pagina - 1) * ADMIN_PRODUCTOS_POR_PAGINA;
  const hasta = desde + ADMIN_PRODUCTOS_POR_PAGINA - 1;

  let query = supabase
    .from("productos")
    .select("*, marcas(nombre)", { count: "exact" })
    .range(desde, hasta);

  if (orden === "nombre_asc") {
    query = query.order("nombre", { ascending: true });
  } else if (orden === "nombre_desc") {
    query = query.order("nombre", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

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

export async function obtenerAdministradores(): Promise<Perfil[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("rol", "admin")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export type OrdenPerfiles = "nombre_asc" | "nombre_desc";

export async function obtenerVendedores({
  busqueda,
  orden = "nombre_asc",
}: {
  busqueda?: string;
  orden?: OrdenPerfiles;
} = {}): Promise<Perfil[]> {
  const supabase = await createClient();

  let query = supabase
    .from("perfiles")
    .select("*")
    .eq("rol", "vendedor")
    .order("nombre", { ascending: orden !== "nombre_desc" });

  if (busqueda) {
    const termino = busqueda.trim().replace(/[%,]/g, "");
    if (termino) {
      query = query.or(`nombre.ilike.%${termino}%,apellido.ilike.%${termino}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function obtenerFerreterias({
  busqueda,
  orden = "nombre_asc",
  vendedorId,
}: {
  busqueda?: string;
  orden?: OrdenPerfiles;
  vendedorId?: string;
} = {}): Promise<
  (Perfil & { vendedor: Pick<Perfil, "id" | "nombre" | "apellido"> | null })[]
> {
  const supabase = await createClient();

  let query = supabase
    .from("perfiles")
    .select("*, vendedor:creado_por(id, nombre, apellido)")
    .eq("rol", "ferreteria")
    .order("razon_social", { ascending: orden !== "nombre_desc" });

  if (vendedorId) {
    query = query.eq("creado_por", vendedorId);
  }

  if (busqueda) {
    const termino = busqueda.trim().replace(/[%,]/g, "");
    if (termino) {
      query = query.or(
        `nombre.ilike.%${termino}%,razon_social.ilike.%${termino}%`
      );
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as (Perfil & {
    vendedor: Pick<Perfil, "id" | "nombre" | "apellido"> | null;
  })[];
}
