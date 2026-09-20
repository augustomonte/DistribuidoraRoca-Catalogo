-- =====================================================================
-- Migración: búsqueda del catálogo por palabras sueltas
-- Correr en Supabase Dashboard -> SQL Editor -> New query -> Run
--
-- Antes: "BULON 1/4" se buscaba como frase literal, así que no
-- encontraba "BULON HEXAGONAL 1/4" (no aparece "BULON 1/4" tal cual).
-- Ahora: el término se separa en palabras y cada una tiene que
-- aparecer en el nombre o el código (en cualquier orden/posición).
-- =====================================================================

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

-- =====================================================================
-- FIN.
-- =====================================================================
