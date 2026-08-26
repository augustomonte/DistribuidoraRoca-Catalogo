-- =====================================================================
-- Migración: tabla marcas + productos.marca_id (reemplaza productos.marca)
-- Correr en Supabase Dashboard -> SQL Editor -> New query -> Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tabla marcas
-- ---------------------------------------------------------------------
create table public.marcas (
  id int generated always as identity primary key,
  nombre text not null unique,
  created_at timestamptz not null default now()
);

alter table public.marcas enable row level security;

create policy "marcas_select_authenticated"
  on public.marcas for select
  to authenticated
  using (true);

create policy "marcas_admin_write"
  on public.marcas for all
  to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

-- ---------------------------------------------------------------------
-- 2. Borrar la vista ANTES de tocar columnas de productos
-- ---------------------------------------------------------------------
drop view if exists public.productos_vista;

-- ---------------------------------------------------------------------
-- 3. Reemplazar productos.marca (texto libre) por marca_id (FK)
--    Hoy todos los productos tienen marca = null, así que no hay
--    datos que migrar.
-- ---------------------------------------------------------------------
alter table public.productos
  add column if not exists marca_id int references public.marcas (id) on delete set null;

alter table public.productos
  drop column if exists marca;

create index if not exists productos_marca_id_idx
  on public.productos (marca_id);

-- ---------------------------------------------------------------------
-- 4. Recrear productos_vista con join a marcas
--    (sigue exponiendo "marca" como texto, para no romper el resto
--    de la app que ya lo usa así)
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
  p.marca_id,
  m.nombre as marca,
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
left join public.marcas m on m.id = p.marca_id
where p.activo = true;

grant select on public.productos_vista to authenticated;

-- =====================================================================
-- FIN.
-- =====================================================================
