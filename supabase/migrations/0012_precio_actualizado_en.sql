-- =====================================================================
-- Migración: fecha de última actualización de precio
-- Correr en Supabase Dashboard -> SQL Editor -> New query -> Run
--
-- Los productos NO tocados por una actualización (masiva o individual)
-- conservan su fecha vieja, así se puede distinguir un precio recién
-- puesto al día de uno que quedó atrás.
--
-- En vez de tocar cada lugar del código que puede cambiar un precio
-- (el formulario individual, la actualización masiva, o un UPDATE
-- manual futuro que nadie escribió todavía), se resuelve con un
-- trigger: cualquier UPDATE que cambie precio_lista2 pisa la fecha
-- solo, sin depender de que cada camino se acuerde de hacerlo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Columna nueva
-- ---------------------------------------------------------------------
--    Los productos existentes quedan con la fecha de esta migración: no
--    hay forma de saber cuándo se cargó cada uno originalmente, así que
--    "hoy" es el punto de partida honesto, no un dato inventado.
alter table public.productos
  add column if not exists precio_actualizado_en timestamptz not null default now();

-- ---------------------------------------------------------------------
-- 2. Trigger: pisa la fecha cuando cambia precio_lista2
-- ---------------------------------------------------------------------
create or replace function public.marcar_precio_actualizado()
returns trigger
language plpgsql
as $$
begin
  if new.precio_lista2 is distinct from old.precio_lista2 then
    new.precio_actualizado_en = now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_marcar_precio_actualizado on public.productos;
create trigger trg_marcar_precio_actualizado
  before update on public.productos
  for each row execute function public.marcar_precio_actualizado();

-- ---------------------------------------------------------------------
-- 3. Recrear productos_vista con la columna nueva
-- ---------------------------------------------------------------------
drop view if exists public.productos_vista;

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
  p.precio_actualizado_en,
  p.created_at
from public.productos p
left join public.categorias c on c.id = p.categoria_id
left join public.marcas m on m.id = p.marca_id
where p.activo = true;

grant select on public.productos_vista to authenticated;

-- =====================================================================
-- FIN.
-- =====================================================================
