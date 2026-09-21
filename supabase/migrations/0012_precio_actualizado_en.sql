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
--    buscar_productos_ranked devuelve "setof productos_vista", o sea que
--    depende del tipo de la vista y Postgres no deja borrarla mientras la
--    función exista. Se da de baja acá y se recrea en el paso 4 (idéntica
--    a la de 0006). Sin CASCADE a propósito: si algo más dependiera de la
--    vista, preferimos que falle a que se lleve puesto algo sin avisar.
drop function if exists public.buscar_productos_ranked(text, int, text, text, int, int);

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

-- ---------------------------------------------------------------------
-- 4. Recrear buscar_productos_ranked (copia de 0006, sin cambios)
-- ---------------------------------------------------------------------
create or replace function public.buscar_productos_ranked(
  termino text,
  filtro_categoria_id int default null,
  filtro_marca text default null,
  orden_alfabetico text default 'asc',
  limite int default 50,
  desplazamiento int default 0
)
returns setof productos_vista
language sql
stable
security invoker
as $$
  select pv.*
  from public.productos_vista pv
  where
    (filtro_categoria_id is null or pv.categoria_id = filtro_categoria_id)
    and (filtro_marca is null or pv.marca = filtro_marca)
    and not exists (
      select 1
      from unnest(string_to_array(trim(termino), ' ')) as palabra
      where palabra <> ''
        and pv.nombre not ilike '%' || palabra || '%'
        and pv.codigo not ilike '%' || palabra || '%'
    )
  order by
    case
      when pv.codigo ilike termino || '%' then 0
      when pv.nombre ilike termino || '%' then 1
      when (' ' || pv.nombre || ' ') ilike ('% ' || termino || ' %') then 2
      else 3
    end,
    case when orden_alfabetico = 'desc' then pv.nombre end desc,
    case when orden_alfabetico <> 'desc' then pv.nombre end asc
  limit limite offset desplazamiento;
$$;

grant execute on function public.buscar_productos_ranked to authenticated;

-- =====================================================================
-- FIN.
-- =====================================================================
