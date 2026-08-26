-- =====================================================================
-- Migración: búsqueda del catálogo con ranking de relevancia
-- Correr en Supabase Dashboard -> SQL Editor -> New query -> Run
--
-- Prioridad al ordenar resultados de una búsqueda:
--   0. código empieza con el término (ej: buscar "001004")
--   1. nombre empieza con el término (ej: buscar "pala" -> "PALA PUNTA...")
--   2. el término aparece como palabra completa en otra parte del nombre
--      (ej: "SOPORTE PARA PALA")
--   3. coincidencia parcial en cualquier parte (ej: "DESPALADORA")
-- Dentro de cada grupo, ordena alfabéticamente.
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
    and (
      pv.nombre ilike '%' || termino || '%'
      or pv.codigo ilike '%' || termino || '%'
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
