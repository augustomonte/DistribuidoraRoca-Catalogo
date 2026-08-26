import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { Marca } from "@/types";

export async function obtenerMarcas(): Promise<Marca[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marcas")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function obtenerMarcasConConteo(): Promise<
  (Marca & { cantidadProductos: number })[]
> {
  const supabase = await createClient();

  const [{ data: marcas, error: errorMarcas }, { data: productos, error: errorProductos }] =
    await Promise.all([
      supabase.from("marcas").select("*").order("nombre", { ascending: true }),
      supabase.from("productos").select("marca_id").not("marca_id", "is", null),
    ]);

  if (errorMarcas) throw errorMarcas;
  if (errorProductos) throw errorProductos;

  const conteos = new Map<number, number>();
  for (const p of productos ?? []) {
    if (p.marca_id === null) continue;
    conteos.set(p.marca_id, (conteos.get(p.marca_id) ?? 0) + 1);
  }

  return (marcas ?? []).map((m) => ({
    ...m,
    cantidadProductos: conteos.get(m.id) ?? 0,
  }));
}

/**
 * Busca una marca por nombre (sin distinguir mayúsculas/minúsculas).
 * Si no existe, la crea. Devuelve su id.
 */
export async function obtenerOCrearMarcaId(
  supabase: SupabaseClient<Database>,
  nombre: string
): Promise<number> {
  const limpio = nombre.trim().toUpperCase();

  const { data: existente } = await supabase
    .from("marcas")
    .select("id")
    .ilike("nombre", limpio)
    .maybeSingle();

  if (existente) return existente.id;

  const { data: creada, error } = await supabase
    .from("marcas")
    .insert({ nombre: limpio })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return creada.id;
}
