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

  const { data: marcas, error: errorMarcas } = await supabase
    .from("marcas")
    .select("*")
    .order("nombre", { ascending: true });

  if (errorMarcas) throw errorMarcas;

  // Un count por marca (en vez de traer todas las filas de productos y
  // contarlas en JS): Supabase corta las consultas normales en 1000 filas
  // por defecto, y ya tenemos más de 1000 productos con marca asignada,
  // así que ese enfoque subcontaba las marcas cargadas más tarde.
  return Promise.all(
    (marcas ?? []).map(async (marca) => {
      const { count } = await supabase
        .from("productos")
        .select("*", { count: "exact", head: true })
        .eq("marca_id", marca.id);

      return { ...marca, cantidadProductos: count ?? 0 };
    })
  );
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
