-- =====================================================================
-- Migración: precio único + opción de facturación (1, 2 o 3)
-- Correr en Supabase Dashboard -> SQL Editor -> New query -> Run
--
-- Cambio de criterio: los precios ya vienen calculados en el Excel que
-- carga el admin, así que la app deja de derivar nada.
--   * Un solo precio para todos los roles (productos.precio_lista2). Se
--     abandona precio_acordado y el descuento del 10%: hasta hoy TODOS
--     los productos tenían acordado = lista2 * 0,90 (lo puso la 0007),
--     un dato que no reflejaba ninguna regla real.
--   * Cada producto tiene una opción de facturación (1, 2 o 3), que
--     también se actualiza desde el Excel.
--
-- Es ADITIVA a propósito: no borra columnas ni la función vieja, así el
-- código que ya está desplegado sigue andando mientras se corre esta
-- migración. Correrla ANTES de desplegar el código nuevo. Las columnas
-- precio_acordado, iva_porcentaje y nota_iva y la función
-- actualizar_precios_masivo quedan sin uso; se borran en una migración
-- posterior cuando el código nuevo ya esté en producción.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Columna opcion_facturacion
-- ---------------------------------------------------------------------
--    Equivalencia: 1 = IVA 21%, 2 = IVA 10,5%, 3 = precio directo. El
--    porcentaje NO se guarda aparte: se deduce del número (la etiqueta
--    de cada opción vive en src/config/cliente.ts).
--    Nullable para que un producto nuevo pueda crearse sin definirla.
alter table public.productos
  add column if not exists opcion_facturacion smallint
  check (opcion_facturacion in (1, 2, 3));

-- Carga inicial con lo que ya había, sin inventar nada: la "nota 3" que
-- mostraba la tarjeta (③) es "precio directo"; el resto se deduce del
-- porcentaje de IVA que tenían. El Excel la pisa después.
update public.productos
set opcion_facturacion = case
  when nota_iva = '3' then 3
  when iva_porcentaje = 21 then 1
  when iva_porcentaje = 10.5 then 2
end
where opcion_facturacion is null;

-- ---------------------------------------------------------------------
-- 2. Recrear productos_vista: precio único + opcion_facturacion
-- ---------------------------------------------------------------------
--    buscar_productos_ranked devuelve "setof productos_vista", así que se
--    da de baja antes que la vista y se recrea al final (idéntica a la
--    de 0006). Sin CASCADE a propósito.
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
  p.precio_lista2 as precio,
  p.iva_porcentaje,
  p.nota_iva,
  p.opcion_facturacion,
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

-- ---------------------------------------------------------------------
-- 3. Actualización masiva: precio + opción de facturación
-- ---------------------------------------------------------------------
--    Recibe [{codigo, precio, opcion}], donde "opcion" puede ser null (el
--    Excel no la trae o la celda está vacía): en ese caso se conserva la
--    que ya tenía el producto. Devuelve los códigos que existían.
--    Función nueva, con otro nombre, para no chocar con la vieja
--    (actualizar_precios_masivo), que el código desplegado todavía usa.
create or replace function public.actualizar_catalogo_masivo(items jsonb)
returns setof text
language plpgsql
security invoker
as $$
begin
  return query
  update public.productos p
  set
    precio_lista2 = v.precio,
    opcion_facturacion = coalesce(v.opcion, p.opcion_facturacion)
  from jsonb_to_recordset(items) as v(codigo text, precio numeric, opcion smallint)
  where p.codigo = v.codigo
  returning p.codigo;
end;
$$;

-- security invoker: la RLS "productos_admin_update" (rol_actual() = 'admin')
-- restringe el UPDATE a admin; un no-admin que la llame no actualiza nada.
-- El trigger marcar_precio_actualizado (0012) sigue pisando la fecha solo
-- cuando cambia precio_lista2.
grant execute on function public.actualizar_catalogo_masivo(jsonb) to authenticated;

-- =====================================================================
-- FIN.
-- =====================================================================
