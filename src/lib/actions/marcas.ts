"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPerfilActual } from "@/lib/auth";

async function requireAdmin() {
  const perfil = await getPerfilActual();
  if (!perfil || perfil.rol !== "admin") {
    throw new Error("No autorizado");
  }
  return perfil;
}

export async function eliminarMarca(id: number) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("marcas").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/marcas");
  revalidatePath("/admin");
  revalidatePath("/catalogo");
  revalidatePath("/vendedor");
}
