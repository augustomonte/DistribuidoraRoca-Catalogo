"use server";

import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { getPerfilActual } from "@/lib/auth";
import { cliente } from "@/config/cliente";

export interface ActualizarPreciosState {
  error?: string;
  ok?: boolean;
  actualizados?: number;
  noEncontrados?: string[];
  totalNoEncontrados?: number;
}

interface FilaPrecio {
  codigo?: string | number | null;
  CODIGO?: string | number | null;
  Codigo?: string | number | null;
  precio?: number | string | null;
  PRECIO?: number | string | null;
  Precio?: number | string | null;
}

const MAX_NO_ENCONTRADOS_MOSTRADOS = 50;

/**
 * Actualiza precio_lista2 (y recalcula precio_acordado con el descuento
 * configurado) para todos los productos cuyo código aparece en el
 * archivo subido. Espera un .xlsx o .csv con columnas "codigo" y
 * "precio" (el precio de catálogo, ya con IVA incluido — igual que el
 * campo "Precio" del formulario de un producto).
 *
 * No crea productos nuevos: un código que no matchea ninguno existente
 * simplemente se reporta como no encontrado, no se inserta nada.
 */
export async function actualizarPreciosMasivo(
  _prevState: ActualizarPreciosState,
  formData: FormData
): Promise<ActualizarPreciosState> {
  const perfil = await getPerfilActual();
  if (!perfil || perfil.rol !== "admin") {
    return { error: "No autorizado" };
  }

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: "Subí un archivo." };
  }

  let filas: FilaPrecio[];
  try {
    const buffer = new Uint8Array(await archivo.arrayBuffer());
    const libro = XLSX.read(buffer, { type: "array" });
    const hoja = libro.Sheets[libro.SheetNames[0]];
    filas = XLSX.utils.sheet_to_json<FilaPrecio>(hoja, { defval: null });
  } catch {
    return {
      error: "No pudimos leer el archivo. Tiene que ser .xlsx o .csv.",
    };
  }

  const items = filas
    .map((fila) => {
      const codigo = String(
        fila.codigo ?? fila.CODIGO ?? fila.Codigo ?? ""
      ).trim();
      const precioRaw = fila.precio ?? fila.PRECIO ?? fila.Precio;
      const precio = Number(precioRaw);
      if (!codigo || !Number.isFinite(precio) || precio <= 0) return null;
      return { codigo, precio };
    })
    .filter((i): i is { codigo: string; precio: number } => i !== null);

  if (items.length === 0) {
    return {
      error:
        'El archivo no tiene filas válidas. Tiene que tener columnas "codigo" y "precio".',
    };
  }

  const supabase = await createClient();
  const { data: codigosActualizados, error } = await supabase.rpc(
    "actualizar_precios_masivo",
    {
      items,
      descuento: cliente.precios.descuentoPrecioAcordado,
    }
  );

  if (error) {
    return { error: error.message };
  }

  const encontrados = new Set(codigosActualizados ?? []);
  const noEncontrados = items
    .map((i) => i.codigo)
    .filter((codigo) => !encontrados.has(codigo));

  revalidatePath("/admin");

  return {
    ok: true,
    actualizados: encontrados.size,
    noEncontrados: noEncontrados.slice(0, MAX_NO_ENCONTRADOS_MOSTRADOS),
    totalNoEncontrados: noEncontrados.length,
  };
}
