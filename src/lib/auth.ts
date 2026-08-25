import { createClient } from "@/lib/supabase/server";
import type { Perfil } from "@/types";

/**
 * Devuelve el perfil (rol, nombre, activo, etc.) del usuario logueado,
 * o null si no hay sesión. Para usar en Server Components / Server Actions.
 */
export async function getPerfilActual(): Promise<Perfil | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return perfil ?? null;
}
