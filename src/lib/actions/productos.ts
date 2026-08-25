"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPerfilActual } from "@/lib/auth";

export interface ProductoFormState {
  error?: string;
}

async function requireAdmin() {
  const perfil = await getPerfilActual();
  if (!perfil || perfil.rol !== "admin") {
    throw new Error("No autorizado");
  }
  return perfil;
}

function leerCamposProducto(formData: FormData) {
  const codigo = String(formData.get("codigo") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const marca = String(formData.get("marca") ?? "").trim();
  const categoriaIdRaw = String(formData.get("categoria_id") ?? "");
  const precioAcordadoRaw = String(formData.get("precio_acordado") ?? "");
  const precioLista2Raw = String(formData.get("precio_lista2") ?? "");
  const ivaRaw = String(formData.get("iva_porcentaje") ?? "21");

  if (!codigo || !nombre) {
    return { error: "El código y el nombre son obligatorios." } as const;
  }

  const precioAcordado = Number(precioAcordadoRaw.replace(",", "."));
  const precioLista2 = Number(precioLista2Raw.replace(",", "."));
  const iva = Number(ivaRaw);

  if (Number.isNaN(precioAcordado) || precioAcordado < 0) {
    return { error: "El precio acordado no es válido." } as const;
  }
  if (Number.isNaN(precioLista2) || precioLista2 < 0) {
    return { error: "El precio de lista no es válido." } as const;
  }
  if (Number.isNaN(iva) || iva < 0) {
    return { error: "El % de IVA no es válido." } as const;
  }

  const categoriaId = categoriaIdRaw ? Number(categoriaIdRaw) : null;

  return {
    valores: {
      codigo,
      nombre,
      descripcion: descripcion || null,
      marca: marca || null,
      categoria_id: categoriaId,
      precio_acordado: precioAcordado,
      precio_lista2: precioLista2,
      iva_porcentaje: iva,
      stock_disponible: formData.get("stock_disponible") === "on",
    },
  } as const;
}

async function subirFotoSiCorresponde(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const foto = formData.get("foto");
  if (!(foto instanceof File) || foto.size === 0) return {};

  if (!foto.type.startsWith("image/")) {
    return { error: "El archivo de la foto debe ser una imagen." };
  }
  if (foto.size > 5 * 1024 * 1024) {
    return { error: "La foto no puede pesar más de 5MB." };
  }

  const supabase = await createClient();
  const extension = foto.name.split(".").pop() ?? "jpg";
  const nombreArchivo = `${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("productos-fotos")
    .upload(nombreArchivo, foto, { contentType: foto.type });

  if (uploadError) {
    return { error: `No se pudo subir la foto: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("productos-fotos").getPublicUrl(nombreArchivo);

  return { url: publicUrl };
}

export async function crearProducto(
  _prevState: ProductoFormState,
  formData: FormData
): Promise<ProductoFormState> {
  await requireAdmin();

  const resultado = leerCamposProducto(formData);
  if ("error" in resultado) return { error: resultado.error };

  const { url: fotoUrl, error: fotoError } = await subirFotoSiCorresponde(
    formData
  );
  if (fotoError) return { error: fotoError };

  const supabase = await createClient();
  const { error } = await supabase.from("productos").insert({
    ...resultado.valores,
    foto_url: fotoUrl ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un producto con ese código." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/catalogo");
  revalidatePath("/vendedor");
  redirect("/admin");
}

export async function actualizarProducto(
  id: string,
  _prevState: ProductoFormState,
  formData: FormData
): Promise<ProductoFormState> {
  await requireAdmin();

  const resultado = leerCamposProducto(formData);
  if ("error" in resultado) return { error: resultado.error };

  const { url: fotoUrl, error: fotoError } = await subirFotoSiCorresponde(
    formData
  );
  if (fotoError) return { error: fotoError };

  const supabase = await createClient();
  const { error } = await supabase
    .from("productos")
    .update({
      ...resultado.valores,
      ...(fotoUrl ? { foto_url: fotoUrl } : {}),
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un producto con ese código." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/catalogo");
  revalidatePath("/vendedor");
  redirect("/admin");
}

export async function alternarActivoProducto(id: string, activo: boolean) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("productos")
    .update({ activo: !activo })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/catalogo");
  revalidatePath("/vendedor");
}

export async function eliminarProducto(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/catalogo");
  revalidatePath("/vendedor");
}
