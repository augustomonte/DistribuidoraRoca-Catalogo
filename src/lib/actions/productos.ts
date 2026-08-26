"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPerfilActual } from "@/lib/auth";
import { obtenerOCrearMarcaId } from "@/lib/marcas";

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
  const precioRaw = String(formData.get("precio") ?? "");
  const ivaRaw = String(formData.get("iva_porcentaje") ?? "21");

  if (!codigo || !nombre) {
    return { error: "El código y el nombre son obligatorios." } as const;
  }

  const precio = Number(precioRaw.replace(",", "."));
  const iva = Number(ivaRaw);

  if (Number.isNaN(precio) || precio < 0) {
    return { error: "El precio no es válido." } as const;
  }
  if (iva !== 21 && iva !== 10.5) {
    return { error: "El % de IVA debe ser 21 o 10.5." } as const;
  }

  const categoriaId = categoriaIdRaw ? Number(categoriaIdRaw) : null;

  return {
    marcaTexto: marca,
    valores: {
      codigo,
      nombre,
      descripcion: descripcion || null,
      categoria_id: categoriaId,
      precio_acordado: precio,
      precio_lista2: precio,
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
  const marcaId = resultado.marcaTexto
    ? await obtenerOCrearMarcaId(supabase, resultado.marcaTexto)
    : null;

  const { error } = await supabase.from("productos").insert({
    ...resultado.valores,
    marca_id: marcaId,
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
  const marcaId = resultado.marcaTexto
    ? await obtenerOCrearMarcaId(supabase, resultado.marcaTexto)
    : null;

  const { error } = await supabase
    .from("productos")
    .update({
      ...resultado.valores,
      marca_id: marcaId,
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
