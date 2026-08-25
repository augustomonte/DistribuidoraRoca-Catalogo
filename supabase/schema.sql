-- =====================================================================
-- Mayorista Roca Ferretería — Esquema inicial de base de datos
-- Correr completo en Supabase Dashboard -> SQL Editor -> New query -> Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tipo enum de roles
-- ---------------------------------------------------------------------
create type public.rol_usuario as enum ('admin', 'vendedor', 'ferreteria');

-- ---------------------------------------------------------------------
-- 2. Tabla categorias
-- ---------------------------------------------------------------------
create table public.categorias (
  id int generated always as identity primary key,
  nombre text not null,
  sector_numero int not null
);

insert into public.categorias (nombre, sector_numero) values
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
  ('Riego / Maquinaria', 12);

-- ---------------------------------------------------------------------
-- 3. Tabla perfiles (extiende auth.users)
-- ---------------------------------------------------------------------
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  rol public.rol_usuario not null default 'ferreteria',
  nombre text not null,
  apellido text,
  razon_social text,
  telefono text,
  dni text,
  creado_por uuid references public.perfiles (id),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_perfiles_creado_por on public.perfiles (creado_por);
create index idx_perfiles_rol on public.perfiles (rol);

-- ---------------------------------------------------------------------
-- 4. Tabla productos
-- ---------------------------------------------------------------------
create table public.productos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nombre text not null,
  descripcion text,
  categoria_id int references public.categorias (id),
  marca text,
  precio_acordado numeric(12, 2) not null default 0,
  precio_lista2 numeric(12, 2) not null default 0,
  iva_porcentaje int not null default 21,
  foto_url text,
  stock_disponible boolean not null default true,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_productos_categoria on public.productos (categoria_id);
create index idx_productos_marca on public.productos (marca);
create index idx_productos_activo on public.productos (activo);

-- ---------------------------------------------------------------------
-- 5. Función helper: rol del usuario autenticado actual
--    (security definer para evitar recursión infinita en las policies
--    de la propia tabla perfiles)
-- ---------------------------------------------------------------------
create or replace function public.rol_actual()
returns public.rol_usuario
language sql
security definer
set search_path = public
stable
as $$
  select rol from public.perfiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- 6. Trigger: evitar que un usuario no-admin se autopromueva
--    (cambie su propio rol, se reactive, o cambie quién lo creó)
-- ---------------------------------------------------------------------
create or replace function public.prevenir_escalada_privilegios()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.rol_actual() is distinct from 'admin' then
    if new.rol is distinct from old.rol
       or new.activo is distinct from old.activo
       or new.creado_por is distinct from old.creado_por then
      raise exception 'No tenés permiso para modificar estos campos';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_prevenir_escalada_privilegios
  before update on public.perfiles
  for each row execute function public.prevenir_escalada_privilegios();

-- ---------------------------------------------------------------------
-- 7. Vista pública de productos: nunca expone precio_acordado como columna,
--    calcula el precio correcto según el rol de quien consulta.
--    Al ser una vista "security definer" (dueña por el owner, no por
--    quien consulta), no depende de las policies de la tabla productos.
-- ---------------------------------------------------------------------
create view public.productos_vista
with (security_invoker = false) as
select
  p.id,
  p.codigo,
  p.nombre,
  p.descripcion,
  p.categoria_id,
  c.nombre as categoria_nombre,
  p.marca,
  case
    when public.rol_actual() in ('admin', 'vendedor') then p.precio_acordado
    else p.precio_lista2
  end as precio,
  p.iva_porcentaje,
  p.foto_url,
  p.stock_disponible,
  p.activo,
  p.created_at
from public.productos p
left join public.categorias c on c.id = p.categoria_id
where p.activo = true;

grant select on public.productos_vista to authenticated;

-- ---------------------------------------------------------------------
-- 8. Row Level Security
-- ---------------------------------------------------------------------
alter table public.categorias enable row level security;
alter table public.perfiles enable row level security;
alter table public.productos enable row level security;

-- categorias: cualquier usuario logueado puede leerlas; solo admin escribe
create policy "categorias_select_authenticated"
  on public.categorias for select
  to authenticated
  using (true);

create policy "categorias_admin_write"
  on public.categorias for all
  to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

-- perfiles: cada quien ve el suyo; admin ve todo; vendedor ve las
-- ferreterías que él creó
create policy "perfiles_select_propio"
  on public.perfiles for select
  to authenticated
  using (id = auth.uid());

create policy "perfiles_select_admin"
  on public.perfiles for select
  to authenticated
  using (public.rol_actual() = 'admin');

create policy "perfiles_select_vendedor_creados"
  on public.perfiles for select
  to authenticated
  using (public.rol_actual() = 'vendedor' and creado_por = auth.uid());

create policy "perfiles_update_propio"
  on public.perfiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "perfiles_admin_all"
  on public.perfiles for all
  to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

-- productos (tabla cruda, con precio_acordado incluido):
-- SOLO admin y vendedor pueden verla directamente.
-- Las ferreterías NUNCA reciben select acá -> usan productos_vista.
create policy "productos_select_admin_vendedor"
  on public.productos for select
  to authenticated
  using (public.rol_actual() in ('admin', 'vendedor'));

create policy "productos_admin_write"
  on public.productos for insert
  to authenticated
  with check (public.rol_actual() = 'admin');

create policy "productos_admin_update"
  on public.productos for update
  to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

create policy "productos_admin_delete"
  on public.productos for delete
  to authenticated
  using (public.rol_actual() = 'admin');

-- ---------------------------------------------------------------------
-- 9. Storage: bucket para fotos de productos
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('productos-fotos', 'productos-fotos', true)
on conflict (id) do nothing;

create policy "fotos_lectura_publica"
  on storage.objects for select
  using (bucket_id = 'productos-fotos');

create policy "fotos_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'productos-fotos' and public.rol_actual() = 'admin');

create policy "fotos_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'productos-fotos' and public.rol_actual() = 'admin');

create policy "fotos_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'productos-fotos' and public.rol_actual() = 'admin');

-- =====================================================================
-- FIN. Después de correr este script:
-- 1. Andá a Authentication -> Users -> Add user y creá tu usuario admin
--    (con tu email y una contraseña).
-- 2. Copiá el UUID de ese usuario y corré, reemplazando los valores:
--
--    insert into public.perfiles (id, rol, nombre, apellido, activo)
--    values ('PEGAR-UUID-ACA', 'admin', 'Tu Nombre', 'Tu Apellido', true);
--
-- =====================================================================
