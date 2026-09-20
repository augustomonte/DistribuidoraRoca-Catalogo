-- =====================================================================
-- Migración: categorías configurables por cliente
-- Correr en Supabase Dashboard -> SQL Editor -> New query -> Run
--
-- IMPORTANTE: correrla ANTES de levantar la versión del código que usa
-- categorias.orden (ABM de categorías en el panel de admin).
--
-- - 'sector_numero' era jerga de Roca (sector del depósito). Pasa a
--   'orden': el número que define en qué posición aparece la categoría en
--   el catálogo. Los valores existentes se conservan.
-- - Nombre único (sin distinguir mayúsculas) para que el panel no permita
--   crear dos veces la misma categoría.
--
-- Es idempotente: en una base nueva creada con schema.sql no hace nada.
-- =====================================================================

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'categorias'
      and column_name = 'sector_numero'
  ) then
    alter table public.categorias rename column sector_numero to orden;
  end if;
end $$;

create unique index if not exists categorias_nombre_unico
  on public.categorias (lower(nombre));

-- =====================================================================
-- FIN.
-- =====================================================================
