import { createClient } from "@/lib/supabase/server";
import { getPerfilActual } from "@/lib/auth";
import type { Perfil } from "@/types";

export async function obtenerMisFerreterias(): Promise<Perfil[]> {
  const perfil = await getPerfilActual();
  if (!perfil) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("rol", "ferreteria")
    .eq("creado_por", perfil.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
