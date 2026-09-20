"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPerfilActual } from "@/lib/auth";

export interface CategoriaFormState {
  error?: string;
  ok?: boolean;
}

async function requireAdmin() {
  const perfil = await getPerfilActual();
  if (!perfil || perfil.rol !== "admin") {
    throw new Error("No autorizado");
  }
  return perfil;
}

function leerCampos(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const ordenRaw = String(formData.get("orden") ?? "").trim();

  if (!nombre) {
    return { error: "El nombre es obligatorio." } as const;
  }

  let orden: number | null = null;
  if (ordenRaw) {
    orden = Number(ordenRaw);
    if (!Number.isInteger(orden) || orden < 0) {
      return { error: "El orden debe ser un número entero, 0 o mayor." } as const;
    }
  }

  return { nombre, orden } as const;
}

function revalidarCategorias() {
  revalidatePath("/admin/categorias");
  revalidatePath("/admin");
  revalidatePath("/catalogo");
  revalidatePath("/vendedor");
}

export async function crearCategoria(
  _prevState: CategoriaFormState,
  formData: FormData
): Promise<CategoriaFormState> {
  await requireAdmin();

  const campos = leerCampos(formData);
  if ("error" in campos) return { error: campos.error };

  const supabase = await createClient();

  // Sin orden explícito, la categoría nueva va al final de la lista.
  let orden = campos.orden;
  if (orden === null) {
    const { data: ultima } = await supabase
      .from("categorias")
      .select("orden")
      .order("orden", { ascending: false })
      .limit(1)
      .maybeSingle();
    orden = (ultima?.orden ?? 0) + 1;
  }

  const { error } = await supabase
    .from("categorias")
    .insert({ nombre: campos.nombre, orden });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una categoría con ese nombre." };
    }
    return { error: error.message };
  }

  revalidarCategorias();
  return { ok: true };
}

export async function actualizarCategoria(
  id: number,
  _prevState: CategoriaFormState,
  formData: FormData
): Promise<CategoriaFormState> {
  await requireAdmin();

  const campos = leerCampos(formData);
  if ("error" in campos) return { error: campos.error };
  if (campos.orden === null) return { error: "El orden es obligatorio." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categorias")
    .update({ nombre: campos.nombre, orden: campos.orden })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una categoría con ese nombre." };
    }
    return { error: error.message };
  }

  revalidarCategorias();
  redirect("/admin/categorias");
}

export async function eliminarCategoria(id: number) {
  await requireAdmin();
  const supabase = await createClient();

  const { count } = await supabase
    .from("productos")
    .select("*", { count: "exact", head: true })
    .eq("categoria_id", id);

  if (count && count > 0) {
    throw new Error(
      `No se puede eliminar: tiene ${count} producto${count === 1 ? "" : "s"}.`
    );
  }

  const { error } = await supabase.from("categorias").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidarCategorias();
}
