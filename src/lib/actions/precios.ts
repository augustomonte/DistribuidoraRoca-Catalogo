"use server";

import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { getPerfilActual } from "@/lib/auth";
import { cliente } from "@/config/cliente";

interface FilaPrecio {
  codigo?: string | number | null;
  CODIGO?: string | number | null;
  Codigo?: string | number | null;
  precio?: number | string | null;
  PRECIO?: number | string | null;
  Precio?: number | string | null;
}

interface ItemPrecio {
  codigo: string;
  precio: number;
}

const MAX_PREVIEW_FILAS = 100;
const MAX_NO_ENCONTRADOS_MOSTRADOS = 50;

/**
 * "1234.56" -> 1234.56, pero también "1234,56" y "1.234,56" (formato
 * argentino: "." de miles, "," decimal) -> 1234.56. Number() solo
 * entiende el primer caso; sin esto, un archivo armado con coma
 * decimal (lo más probable si alguien lo arma a mano o lo exporta como
 * CSV desde una planilla en español) se leía como NaN y la fila se
 * perdía en silencio.
 */
function normalizarPrecio(valor: unknown): number | null {
  if (typeof valor === "number") {
    return Number.isFinite(valor) && valor > 0 ? valor : null;
  }
  if (typeof valor !== "string") return null;

  let texto = valor.trim();
  if (!texto) return null;
  if (texto.includes(",")) {
    texto = texto.replace(/\./g, "").replace(",", ".");
  }

  const numero = Number(texto);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

/**
 * Separa las filas del archivo en válidas / con datos pero mal
 * formadas / vacías. Antes, cualquier fila que no pasara la validación
 * (por el motivo que fuera) desaparecía sin dejar rastro: parecía que
 * el archivo se había leído bien cuando en realidad se había comido
 * filas.
 */
function parsearFilas(filas: FilaPrecio[]): {
  items: ItemPrecio[];
  filasInvalidas: number;
} {
  const items: ItemPrecio[] = [];
  let filasInvalidas = 0;

  for (const fila of filas) {
    const codigoRaw = fila.codigo ?? fila.CODIGO ?? fila.Codigo;
    const precioRaw = fila.precio ?? fila.PRECIO ?? fila.Precio;
    const codigo = String(codigoRaw ?? "").trim();
    const precio = normalizarPrecio(precioRaw);

    const filaVacia =
      !codigo && (precioRaw === null || precioRaw === undefined || precioRaw === "");
    if (filaVacia) continue; // fila en blanco al final del archivo: no es un error

    if (!codigo || precio === null) {
      filasInvalidas++;
      continue;
    }

    items.push({ codigo, precio });
  }

  return { items, filasInvalidas };
}

async function requireAdmin() {
  const perfil = await getPerfilActual();
  if (!perfil || perfil.rol !== "admin") {
    throw new Error("No autorizado");
  }
  return perfil;
}

export interface FilaPreview {
  codigo: string;
  nombre: string;
  precioActual: number;
  precioNuevo: number;
}

export interface PreviewPreciosState {
  error?: string;
  ok?: boolean;
  /** El set completo a mandar de vuelta si se confirma (solo los que matchean). */
  items?: ItemPrecio[];
  /** Recorte para mostrar en pantalla; puede ser menor a totalMatcheados. */
  preview?: FilaPreview[];
  totalMatcheados?: number;
  noEncontrados?: string[];
  totalNoEncontrados?: number;
  filasInvalidas?: number;
}

/**
 * Lee el archivo y arma una vista previa (código, nombre, precio actual
 * -> precio nuevo) sin escribir nada en la base todavía. La
 * confirmación es un paso aparte (confirmarPreciosMasivo).
 */
export async function previsualizarPreciosMasivo(
  _prevState: PreviewPreciosState,
  formData: FormData
): Promise<PreviewPreciosState> {
  await requireAdmin();

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: "Subí un archivo." };
  }

  let filas: FilaPrecio[];
  try {
    const buffer = new Uint8Array(await archivo.arrayBuffer());
    // raw: en un .csv deja las celdas como texto. Sin esto SheetJS las
    // "adivina" con formato inglés: "33800,9" pasa a 338009 (la coma como
    // separador de miles) y el código "02130120" pierde el cero inicial.
    // normalizarPrecio ya sabe leer el formato argentino desde el texto.
    const libro = XLSX.read(buffer, { type: "array", raw: true });
    const hoja = libro.Sheets[libro.SheetNames[0]];
    filas = XLSX.utils.sheet_to_json<FilaPrecio>(hoja, { defval: null });
  } catch {
    return {
      error: "No pudimos leer el archivo. Tiene que ser .xlsx o .csv.",
    };
  }

  const { items, filasInvalidas } = parsearFilas(filas);

  if (items.length === 0) {
    return {
      error:
        filasInvalidas > 0
          ? `Ninguna fila se pudo leer bien (${filasInvalidas} con código o precio inválido). Revisá que las columnas se llamen "codigo" y "precio".`
          : 'El archivo no tiene filas. Tiene que tener columnas "codigo" y "precio".',
    };
  }

  const supabase = await createClient();
  const { data: productos, error } = await supabase
    .from("productos")
    .select("codigo, nombre, precio_lista2")
    .in(
      "codigo",
      items.map((i) => i.codigo)
    );

  if (error) return { error: error.message };

  const mapaProductos = new Map((productos ?? []).map((p) => [p.codigo, p]));

  const itemsMatcheados: ItemPrecio[] = [];
  const preview: FilaPreview[] = [];
  const noEncontrados: string[] = [];

  for (const item of items) {
    const producto = mapaProductos.get(item.codigo);
    if (!producto) {
      noEncontrados.push(item.codigo);
      continue;
    }
    itemsMatcheados.push(item);
    if (preview.length < MAX_PREVIEW_FILAS) {
      preview.push({
        codigo: item.codigo,
        nombre: producto.nombre,
        precioActual: producto.precio_lista2,
        precioNuevo: item.precio,
      });
    }
  }

  if (itemsMatcheados.length === 0) {
    return {
      error:
        "Ninguno de los códigos del archivo coincide con un producto existente.",
    };
  }

  return {
    ok: true,
    items: itemsMatcheados,
    preview,
    totalMatcheados: itemsMatcheados.length,
    noEncontrados: noEncontrados.slice(0, MAX_NO_ENCONTRADOS_MOSTRADOS),
    totalNoEncontrados: noEncontrados.length,
    filasInvalidas,
  };
}

export interface ConfirmarPreciosState {
  error?: string;
  ok?: boolean;
  actualizados?: number;
}

/**
 * Aplica de verdad los cambios que ya se mostraron en la vista previa.
 * Se llama directo desde el cliente (no vía <form action>), pasándole
 * los items que devolvió previsualizarPreciosMasivo.
 */
export async function confirmarPreciosMasivo(
  items: ItemPrecio[]
): Promise<ConfirmarPreciosState> {
  await requireAdmin();

  if (items.length === 0) {
    return { error: "No hay nada para actualizar." };
  }

  const supabase = await createClient();
  const { data: codigosActualizados, error } = await supabase.rpc(
    "actualizar_precios_masivo",
    {
      items,
      descuento: cliente.precios.descuentoPrecioAcordado,
    }
  );

  if (error) return { error: error.message };

  revalidatePath("/admin");

  return { ok: true, actualizados: (codigosActualizados ?? []).length };
}
