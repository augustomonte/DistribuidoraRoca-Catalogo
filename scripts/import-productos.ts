/**
 * Importa productos reales desde el Excel maestro de Roca a Supabase.
 *
 * Mapeo de columnas (confirmado con el dueño del negocio, corregido dos
 * veces sobre el mapeo inicial supuesto por nombre de columna):
 *   CODIGO        -> codigo (único, sin duplicados)
 *   DESCRIPCION   -> nombre
 *   SECTOR        -> categoria_id (via categorias.sector_numero, 1-12)
 *   BIEN_USO      -> iva_porcentaje ('S'=10.5, 'N'=21; único criterio,
 *                    OPCIFAC/IVA_APLICADO ya NO se usan)
 *   LISTA_5       -> precio base; el precio final que se guarda en
 *                    precio_lista2 y precio_acordado (mismo valor, único
 *                    precio disponible por ahora) YA INCLUYE el IVA:
 *                    precio = LISTA_5 * (1 + iva_porcentaje / 100)
 *   NOTA_IVA      -> nota_iva (informativo, ya no afecta el % de IVA)
 *   STOCK         -> stock_disponible ('S'/'N', no es numérico)
 *   UNIDAD_VENTA  -> unidad_venta
 *   BARCODE       -> barcode
 *   marca_id NO se toca: no existe esa columna en este archivo, y así
 *   no se pisa una marca asignada a mano desde el panel admin si este
 *   script se vuelve a correr más adelante (ej: para actualizar precios).
 *
 * Uso: npx tsx scripts/import-productos.ts [ruta-al-excel.xlsx]
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const RUTA_EXCEL =
  process.argv[2] ??
  "C:/Users/augus/Downloads/ABMPIEZA_ROCA_FINAL_V4.xlsx";

const LOTE = 500;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface FilaExcel {
  CODIGO: string | number | null;
  DESCRIPCION: string | null;
  SECTOR: number | null;
  LISTA_5: number | null;
  BIEN_USO: string | null;
  NOTA_IVA: string | number | null;
  STOCK: string | null;
  UNIDAD_VENTA: string | null;
  BARCODE: string | number | null;
}

interface ProductoFila {
  codigo: string;
  nombre: string;
  categoria_id: number | null;
  precio_acordado: number;
  precio_lista2: number;
  iva_porcentaje: number;
  nota_iva: string | null;
  unidad_venta: string;
  barcode: string | null;
  stock_disponible: boolean;
  activo: true;
}

function calcularIva(fila: FilaExcel): number {
  return fila.BIEN_USO === "S" ? 10.5 : 21;
}

async function main() {
  console.log(`Leyendo ${RUTA_EXCEL}...`);
  const libro = XLSX.readFile(RUTA_EXCEL);
  const hoja = libro.Sheets[libro.SheetNames[0]];
  const filas = XLSX.utils.sheet_to_json<FilaExcel>(hoja, { defval: null });
  console.log(`Total filas leídas: ${filas.length}`);

  // Categorías ya existen (seed inicial 1-12); mapeamos por sector_numero.
  const { data: categorias, error: errorCategorias } = await supabase
    .from("categorias")
    .select("id, sector_numero");

  if (errorCategorias) {
    console.error("Error leyendo categorías:", errorCategorias.message);
    process.exit(1);
  }

  const mapaCategorias = new Map<number, number>();
  for (const c of categorias ?? []) {
    mapaCategorias.set(c.sector_numero, c.id);
  }
  console.log(`✓ Categorías disponibles: ${mapaCategorias.size}`);

  const productos: ProductoFila[] = [];
  let descartados = 0;

  for (const fila of filas) {
    const codigo = String(fila.CODIGO ?? "").trim();
    const precio = Number(fila.LISTA_5);

    if (!codigo || !Number.isFinite(precio) || precio <= 0) {
      descartados++;
      continue;
    }

    const sector = Number(fila.SECTOR);
    const categoria_id = mapaCategorias.get(sector) ?? null;

    const notaIva =
      fila.NOTA_IVA === null || fila.NOTA_IVA === undefined
        ? null
        : String(fila.NOTA_IVA).trim() || null;

    const unidad = (fila.UNIDAD_VENTA ?? "").toString().trim();
    const barcode = fila.BARCODE ? String(fila.BARCODE).trim() : null;

    const iva = calcularIva(fila);
    const precioConIva = Math.round(precio * (1 + iva / 100) * 100) / 100;

    productos.push({
      codigo,
      nombre: (fila.DESCRIPCION ?? "").toString().trim() || codigo,
      categoria_id,
      precio_acordado: precioConIva,
      precio_lista2: precioConIva,
      iva_porcentaje: iva,
      nota_iva: notaIva,
      unidad_venta: unidad || "UN",
      barcode,
      stock_disponible: fila.STOCK === "S",
      activo: true,
    });
  }

  console.log(
    `✓ Productos válidos: ${productos.length}, descartados: ${descartados}`
  );

  const totalLotes = Math.ceil(productos.length / LOTE);
  let importados = 0;

  for (let i = 0; i < productos.length; i += LOTE) {
    const lote = productos.slice(i, i + LOTE);
    const numeroLote = i / LOTE + 1;
    console.log(`Importando lote ${numeroLote}/${totalLotes}...`);

    const { error } = await supabase
      .from("productos")
      .upsert(lote, { onConflict: "codigo" });

    if (error) {
      console.error(`✗ Error en lote ${numeroLote}:`, error.message);
      process.exit(1);
    }

    importados += lote.length;
  }

  console.log(
    `✓ Total: ${importados} productos importados, ${descartados} descartados`
  );
}

main().catch((err) => {
  console.error("Error inesperado:", err);
  process.exit(1);
});
