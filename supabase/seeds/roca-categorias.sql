-- =====================================================================
-- Seed de categorías — Mayorista Roca Ferretería
-- Correr UNA vez, después de schema.sql y las migraciones, solo en el
-- proyecto de Supabase de Roca. Otro cliente arma su propio seed (o carga
-- las categorías desde el panel: Admin -> Categorías).
--
-- 'orden' coincide con el número de sector del Excel de Roca, que es lo
-- que usa scripts/import-productos.ts para asignar la categoría.
-- =====================================================================

insert into public.categorias (nombre, orden) values
  ('Electricidad / Plomería', 1),
  ('Ferretería General', 2),
  ('Fijaciones / Bulonería', 3),
  ('Pinturas / Antioxidantes', 4),
  ('Herramientas', 5),
  ('Gas / Gastronomía', 6),
  ('Lubricantes / Varios', 7),
  ('Equipos / Máquinas', 8),
  ('Sanitarios / Baño', 9),
  ('Piletas / Tejidos', 10),
  ('Andamios / Escaleras', 11),
  ('Riego / Maquinaria', 12)
on conflict do nothing;
