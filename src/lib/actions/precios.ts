"use server";

import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { getPerfilActual } from "@/lib/auth";
import { cliente } from "@/config/cliente";

interface ItemPrecio {
  codigo: string;
  precio: number;
  /** null = el archivo no la trae (o la celda está vacía): se conserva la actual. */
  opcion: number | null;
}

const MAX_PREVIEW_FILAS = 100;
const MAX_NO_ENCONTRADOS_MOSTRADOS = 50;
const LOTE_BUSQUEDA = 300;
const LOTES_EN_PARALELO = 4;
// Supabase corta las consultas de usuarios logueados a los ~8 s; actualizar
// los 12.000 productos de una vez con el trigger de fecha puede acercarse.
const LOTE_ACTUALIZACION = 1500;

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
 * Abre el archivo como .xlsx/.xls (binario) o como CSV (texto).
 *
 * Del CSV se ocupa esta función y no SheetJS por dos motivos:
 *  - Encoding: SheetJS lee los bytes como Latin-1, y un CSV en UTF-8 llega
 *    como "CÃ³digo" (la cabecera "Código" deja de reconocerse). Excel en
 *    español exporta UTF-8 con BOM o Windows-1252 según la versión, así
 *    que se prueba UTF-8 estricto y, si no es válido, Windows-1252.
 *  - raw: deja las celdas como texto. Sin esto SheetJS las "adivina" con
 *    formato inglés: "33800,9" pasa a 338009 (la coma como separador de
 *    miles) y el código "02130120" pierde el cero inicial.
 *    normalizarPrecio ya sabe leer el formato argentino desde el texto.
 */
function leerLibro(bytes: Uint8Array): XLSX.WorkBook {
  const esZip = bytes[0] === 0x50 && bytes[1] === 0x4b; // .xlsx
  const esOle = bytes[0] === 0xd0 && bytes[1] === 0xcf; // .xls viejo
  if (esZip || esOle) return XLSX.read(bytes, { type: "array" });

  let texto: string;
  try {
    texto = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    texto = new TextDecoder("windows-1252").decode(bytes);
  }
  if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1); // BOM de UTF-8
  return XLSX.read(texto, { type: "string", raw: true });
}

/**
 * "Opción de facturación " / "opcion_facturacion" / "Opción" -> "opcionfacturacion":
 * minúsculas, sin acentos ni símbolos. Así el archivo no falla por cómo
 * esté escrita la cabecera.
 */
function normalizarClave(clave: string): string {
  return clave
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // marcas de acento: "é" queda "e"
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const CLAVES_CODIGO = ["codigo"];
const CLAVES_PRECIO = ["precio"];
const CLAVES_OPCION = [
  "opcionfacturacion",
  "opciondefacturacion",
  "opcion",
  "facturacion",
];

function buscarValor(
  fila: Record<string, unknown>,
  claves: string[]
): unknown {
  for (const [clave, valor] of Object.entries(fila)) {
    if (claves.includes(normalizarClave(clave))) return valor;
  }
  return undefined;
}

/**
 * Devuelve el número de opción (1, 2 o 3), null si la celda está vacía
 * (= no tocar la que ya tiene el producto) o undefined si trae algo que
 * no es una opción válida.
 */
function normalizarOpcion(valor: unknown): number | null | undefined {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim();
  if (texto === "") return null;
  const numero = Number(texto.replace(",", "."));
  return String(numero) in cliente.facturacion.opciones ? numero : undefined;
}

/**
 * Separa las filas del archivo en válidas / con datos pero mal
 * formadas / vacías / duplicadas. Antes, cualquier fila que no pasara la
 * validación (por el motivo que fuera) desaparecía sin dejar rastro:
 * parecía que el archivo se había leído bien cuando en realidad se había
 * comido filas. Si un código aparece dos veces vale la ÚLTIMA fila.
 */
function parsearFilas(filas: Record<string, unknown>[]): {
  items: ItemPrecio[];
  filasInvalidas: number;
  filasDuplicadas: number;
} {
  const porCodigo = new Map<string, ItemPrecio>();
  let filasInvalidas = 0;
  let filasDuplicadas = 0;

  for (const fila of filas) {
    const codigoRaw = buscarValor(fila, CLAVES_CODIGO);
    const precioRaw = buscarValor(fila, CLAVES_PRECIO);
    const codigo = String(codigoRaw ?? "").trim();
    const precio = normalizarPrecio(precioRaw);
    const opcion = normalizarOpcion(buscarValor(fila, CLAVES_OPCION));

    const filaVacia =
      !codigo && (precioRaw === null || precioRaw === undefined || precioRaw === "");
    if (filaVacia) continue; // fila en blanco al final del archivo: no es un error

    if (!codigo || precio === null || opcion === undefined) {
      filasInvalidas++;
      continue;
    }

    if (porCodigo.has(codigo)) filasDuplicadas++;
    porCodigo.set(codigo, { codigo, precio, opcion });
  }

  return { items: [...porCodigo.values()], filasInvalidas, filasDuplicadas };
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
  /** Opción que va a quedar (null = no se toca). */
  opcionNueva: number | null;
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
  filasDuplicadas?: number;
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

  let filas: Record<string, unknown>[];
  try {
    const libro = leerLibro(new Uint8Array(await archivo.arrayBuffer()));
    const hoja = libro.Sheets[libro.SheetNames[0]];
    filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, {
      defval: null,
    });
  } catch {
    return {
      error: "No pudimos leer el archivo. Tiene que ser .xlsx o .csv.",
    };
  }

  const { items, filasInvalidas, filasDuplicadas } = parsearFilas(filas);

  if (items.length === 0) {
    return {
      error:
        filasInvalidas > 0
          ? `Ninguna fila se pudo leer bien (${filasInvalidas} con código, precio u opción de facturación inválidos). Revisá que las columnas se llamen "codigo", "precio" y, si la incluís, "opcion_facturacion" (1, 2 o 3).`
          : 'El archivo no tiene filas. Tiene que tener columnas "codigo" y "precio".',
    };
  }

  const supabase = await createClient();

  // .in() viaja en la URL: con los ~12.000 códigos de un catálogo completo
  // pasa de 130.000 caracteres y Supabase responde 414 (Request-URI Too
  // Large). Por eso se consulta por lotes. Probado contra la base real:
  // 300 por lote entra bien y trae las 1000 filas máximas por consulta.
  const codigos = items.map((i) => i.codigo);
  const lotes: string[][] = [];
  for (let i = 0; i < codigos.length; i += LOTE_BUSQUEDA) {
    lotes.push(codigos.slice(i, i + LOTE_BUSQUEDA));
  }

  const productos: { codigo: string; nombre: string; precio_lista2: number }[] =
    [];
  for (let i = 0; i < lotes.length; i += LOTES_EN_PARALELO) {
    const resultados = await Promise.all(
      lotes.slice(i, i + LOTES_EN_PARALELO).map((lote) =>
        supabase
          .from("productos")
          .select("codigo, nombre, precio_lista2")
          .in("codigo", lote)
      )
    );
    for (const { data, error } of resultados) {
      if (error) return { error: error.message };
      productos.push(...(data ?? []));
    }
  }

  const mapaProductos = new Map(productos.map((p) => [p.codigo, p]));

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
        opcionNueva: item.opcion,
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
    filasDuplicadas,
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

  // Por lotes y en orden. Cada lote es atómico, pero el conjunto no: si uno
  // falla a mitad de camino, los anteriores ya quedaron aplicados. Repetir
  // el mismo archivo es seguro (pisa con los mismos valores), y solo cambia
  // la fecha de los productos cuyo precio de verdad difiere.
  let actualizados = 0;
  for (let i = 0; i < items.length; i += LOTE_ACTUALIZACION) {
    const { data: codigos, error } = await supabase.rpc(
      "actualizar_catalogo_masivo",
      { items: items.slice(i, i + LOTE_ACTUALIZACION) }
    );

    if (error) {
      revalidatePath("/admin");
      return {
        error:
          actualizados > 0
            ? `Se actualizaron ${actualizados} productos y después falló: ${error.message}. Volvé a subir el mismo archivo para completar el resto; es seguro repetirlo.`
            : error.message,
      };
    }
    actualizados += (codigos ?? []).length;
  }

  revalidatePath("/admin");

  return { ok: true, actualizados };
}
