import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Perfil } from "@/types";

/**
 * Devuelve el perfil (rol, nombre, activo, etc.) del usuario logueado,
 * o null si no hay sesión. Para usar en Server Components / Server Actions.
 *
 * El proxy (middleware) ya resuelve este mismo perfil para decidir si deja
 * pasar la request, y lo reenvía en el header "x-perfil" para no repetir
 * la consulta acá. Si por algún motivo no está (ruta fuera del matcher del
 * proxy, llamada directa, etc.) cae al camino original consultando Supabase.
 */
export async function getPerfilActual(): Promise<Perfil | null> {
  const headersList = await headers();
  const perfilHeader = headersList.get("x-perfil");

  if (perfilHeader) {
    try {
      return JSON.parse(perfilHeader) as Perfil;
    } catch {
      // header corrupto/inesperado: seguimos con la consulta directa
    }
  }

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
