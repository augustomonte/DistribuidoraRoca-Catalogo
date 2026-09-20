"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPerfilActual } from "@/lib/auth";
import type { Database } from "@/types/database.types";

type CambiosPerfil = Database["public"]["Tables"]["perfiles"]["Update"];

export interface PerfilFormState {
  error?: string;
  ok?: boolean;
}

/**
 * Actualiza los datos propios del perfil logueado (nunca los de otra
 * cuenta: el UPDATE va filtrado por el id resuelto de la sesión actual,
 * y la policy RLS "perfiles_update_propio" exige id = auth.uid() de
 * cualquier forma). No toca rol, activo ni creado_por: esos campos ni
 * siquiera se leen del form, y el trigger prevenir_escalada_privilegios
 * los bloquea en la base si alguien intentara mandarlos igual.
 */
export async function actualizarPerfil(
  _prevState: PerfilFormState,
  formData: FormData
): Promise<PerfilFormState> {
  const perfil = await getPerfilActual();
  if (!perfil) {
    return { error: "No autorizado" };
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();

  if (!nombre) {
    return { error: "El nombre es obligatorio." };
  }

  const cambios: CambiosPerfil = {
    nombre,
    apellido: apellido || null,
    telefono: telefono || null,
  };

  if (perfil.rol === "cliente") {
    const razonSocial = String(formData.get("razon_social") ?? "").trim();
    if (!razonSocial) {
      return { error: "La razón social es obligatoria." };
    }

    cambios.razon_social = razonSocial;
    cambios.direccion = String(formData.get("direccion") ?? "").trim() || null;
    cambios.ciudad = String(formData.get("ciudad") ?? "").trim() || null;
    cambios.provincia =
      String(formData.get("provincia") ?? "").trim() || null;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("perfiles")
    .update(cambios)
    .eq("id", perfil.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/perfil");
  return { ok: true };
}
