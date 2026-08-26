-- =====================================================================
-- Migración: columnas nuevas para la importación del Excel de productos
-- Correr en Supabase Dashboard -> SQL Editor -> New query -> Run
-- (después de esto, correr scripts/import-productos.ts)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Columnas nuevas en productos
-- ---------------------------------------------------------------------
alter table public.productos
  add column if not exists nota_iva     text,
  add column if not exists unidad_venta text default 'UN',
  add column if not exists barcode      text;

-- ---------------------------------------------------------------------
-- 2. Borrar la vista ANTES de tocar el tipo de iva_porcentaje
--    (Postgres no deja alterar el tipo de una columna de la que
--    depende una vista)
-- ---------------------------------------------------------------------
drop view if exists public.productos_vista;

-- ---------------------------------------------------------------------
-- 3. iva_porcentaje pasa de int a numeric (necesitamos guardar 10.5)
-- ---------------------------------------------------------------------
alter table public.productos
  alter column iva_porcentaje type numeric(4, 2) using iva_porcentaje::numeric(4, 2);

-- ---------------------------------------------------------------------
-- 4. Índice full-text en español sobre el nombre, para la búsqueda
-- ---------------------------------------------------------------------
create index if not exists productos_nombre_fts_idx
  on public.productos using gin (to_tsvector('spanish', nombre));

-- ---------------------------------------------------------------------
-- 5. Recrear productos_vista con las columnas nuevas
-- ---------------------------------------------------------------------
create view public.productos_vista
with (security_invoker = false) as
select
  p.id,
  p.codigo,
  p.nombre,
  p.descripcion,
  p.categoria_id,
  c.nombre as categoria_nombre,
  p.marca,
  case
    when public.rol_actual() in ('admin', 'vendedor') then p.precio_acordado
    else p.precio_lista2
  end as precio,
  p.iva_porcentaje,
  p.nota_iva,
  p.unidad_venta,
  p.barcode,
  p.foto_url,
  p.stock_disponible,
  p.activo,
  p.created_at
from public.productos p
left join public.categorias c on c.id = p.categoria_id
where p.activo = true;

grant select on public.productos_vista to authenticated;

-- =====================================================================
-- FIN. Después de correr este script, ejecutar desde tu terminal:
--   npx tsx scripts/import-productos.ts
-- =====================================================================
