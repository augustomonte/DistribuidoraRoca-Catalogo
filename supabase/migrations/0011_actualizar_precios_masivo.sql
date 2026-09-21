-- =====================================================================
-- Migración: función para actualización masiva de precios
-- Correr en Supabase Dashboard -> SQL Editor -> New query -> Run
--
-- Update set-based (una sola vuelta a la base) en vez de actualizar de a
-- un producto por vez: con catálogos de miles de productos, ida y vuelta
-- por fila sería lento e innecesario.
--
-- No es un upsert a propósito: un código mal tipeado en el archivo no
-- tiene que poder crear un producto nuevo e incompleto por accidente,
-- solo actualizar precio en los que ya existen. Los códigos que no
-- matchean ningún producto simplemente no aparecen en el resultado, y
-- el llamador (Server Action) los reporta como "no encontrados".
--
-- El descuento del precio acordado NO se hardcodea acá: se recibe como
-- parámetro desde cliente.precios.descuentoPrecioAcordado (la app es la
-- única fuente de verdad de ese valor, ver src/config/cliente.ts).
-- =====================================================================

create or replace function public.actualizar_precios_masivo(
  items jsonb,
  descuento numeric default 0.10
)
returns setof text
language plpgsql
security invoker
as $$
begin
  return query
  update public.productos p
  set
    precio_lista2 = v.precio,
    precio_acordado = round(v.precio * (1 - descuento), 2)
  from jsonb_to_recordset(items) as v(codigo text, precio numeric)
  where p.codigo = v.codigo
  returning p.codigo;
end;
$$;

-- security invoker: corre con los privilegios de quien llama. La RLS de
-- "productos_admin_update" (rol_actual() = 'admin') ya restringe el
-- UPDATE a admin; si un no-admin llegara a llamar esta función, la RLS
-- filtra las filas y no actualiza nada (no rompe, no hace nada).
grant execute on function public.actualizar_precios_masivo(jsonb, numeric) to authenticated;

-- =====================================================================
-- FIN.
-- =====================================================================
