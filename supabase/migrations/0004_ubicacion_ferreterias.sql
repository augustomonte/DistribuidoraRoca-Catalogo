-- =====================================================================
-- Migración: dirección, ciudad y provincia para ferreterías
-- Correr en Supabase Dashboard -> SQL Editor -> New query -> Run
-- =====================================================================

alter table public.perfiles
  add column if not exists direccion text,
  add column if not exists ciudad text,
  add column if not exists provincia text;

alter table public.perfiles
  add constraint perfiles_provincia_valida check (
    provincia is null or provincia in (
      'Buenos Aires',
      'CABA',
      'Catamarca',
      'Chaco',
      'Chubut',
      'Córdoba',
      'Corrientes',
      'Entre Ríos',
      'Formosa',
      'Jujuy',
      'La Pampa',
      'La Rioja',
      'Mendoza',
      'Misiones',
      'Neuquén',
      'Río Negro',
      'Salta',
      'San Juan',
      'San Luis',
      'Santa Cruz',
      'Santa Fe',
      'Santiago del Estero',
      'Tierra del Fuego',
      'Tucumán'
    )
  );

-- =====================================================================
-- FIN.
-- =====================================================================
