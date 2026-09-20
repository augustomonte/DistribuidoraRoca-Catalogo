-- =====================================================================
-- Migración: renombrar el rol 'ferreteria' a 'cliente'
-- Correr en Supabase Dashboard -> SQL Editor -> New query -> Run
--
-- IMPORTANTE: correrla ANTES de levantar la versión del código que usa
-- 'cliente'. Con el código nuevo y la base vieja, el login de los usuarios
-- existentes con rol 'ferreteria' deja de funcionar.
--
-- ALTER TYPE ... RENAME VALUE cambia solo la etiqueta: las filas de
-- perfiles, las policies y las vistas que ya referencian ese valor siguen
-- funcionando sin tocar nada.
--
-- Es idempotente: en una base nueva creada con schema.sql el valor ya se
-- llama 'cliente' y no hace nada.
-- =====================================================================

do $$
begin
  if exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'rol_usuario' and e.enumlabel = 'ferreteria'
  ) then
    alter type public.rol_usuario rename value 'ferreteria' to 'cliente';
  end if;
end $$;

-- =====================================================================
-- FIN.
-- =====================================================================
