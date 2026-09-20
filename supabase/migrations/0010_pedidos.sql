-- =====================================================================
-- Migración: carrito y pedidos (v1)
-- Correr en Supabase Dashboard -> SQL Editor -> New query -> Run
--
-- Alcance v1: ítems + cantidad, precio congelado al momento del pedido,
-- estado simple (pendiente / confirmado / cancelado). Sin pagos, sin
-- control de stock en tiempo real.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tipo enum de estado
-- ---------------------------------------------------------------------
create type public.estado_pedido as enum ('pendiente', 'confirmado', 'cancelado');

-- ---------------------------------------------------------------------
-- 2. Tabla pedidos
-- ---------------------------------------------------------------------
create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.perfiles (id) on delete cascade,
  -- Se fija solo, con el trigger de más abajo: nunca se confía en un
  -- vendedor_id que mande el cliente.
  vendedor_id uuid references public.perfiles (id) on delete set null,
  estado public.estado_pedido not null default 'pendiente',
  total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index idx_pedidos_cliente on public.pedidos (cliente_id);
create index idx_pedidos_vendedor on public.pedidos (vendedor_id);
create index idx_pedidos_estado on public.pedidos (estado);

-- ---------------------------------------------------------------------
-- 3. Tabla pedido_items
-- ---------------------------------------------------------------------
--    Guarda código y nombre del producto en el momento del pedido (no
--    solo el id): si el producto se edita o se desactiva después, el
--    pedido sigue mostrando lo que se pidió en su momento.
create table public.pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  producto_id uuid references public.productos (id) on delete set null,
  producto_codigo text not null,
  producto_nombre text not null,
  cantidad int not null check (cantidad > 0),
  -- Precio unitario con IVA incluido, igual que precio_lista2 /
  -- precio_acordado en productos.
  precio_unitario numeric(12, 2) not null,
  iva_porcentaje numeric(4, 2) not null default 21
);

create index idx_pedido_items_pedido on public.pedido_items (pedido_id);

-- ---------------------------------------------------------------------
-- 4. Trigger: fijar vendedor_id desde el creado_por del cliente
-- ---------------------------------------------------------------------
create or replace function public.fijar_vendedor_pedido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select creado_por into new.vendedor_id
  from public.perfiles
  where id = new.cliente_id;
  return new;
end;
$$;

create trigger trg_fijar_vendedor_pedido
  before insert on public.pedidos
  for each row execute function public.fijar_vendedor_pedido();

-- ---------------------------------------------------------------------
-- 5. Trigger: recalcular el total del pedido cuando se insertan ítems
-- ---------------------------------------------------------------------
create or replace function public.recalcular_total_pedido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.pedidos
  set total = (
    select coalesce(sum(precio_unitario * cantidad), 0)
    from public.pedido_items
    where pedido_id = new.pedido_id
  )
  where id = new.pedido_id;
  return new;
end;
$$;

create trigger trg_recalcular_total_pedido
  after insert on public.pedido_items
  for each row execute function public.recalcular_total_pedido();

-- ---------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------
alter table public.pedidos enable row level security;
alter table public.pedido_items enable row level security;

-- pedidos: el cliente ve y crea los suyos
create policy "pedidos_select_propio"
  on public.pedidos for select
  to authenticated
  using (cliente_id = auth.uid());

create policy "pedidos_insert_propio"
  on public.pedidos for insert
  to authenticated
  with check (cliente_id = auth.uid() and public.rol_actual() = 'cliente');

-- pedidos: el vendedor ve y actualiza el estado de los pedidos de las
-- cuentas que él mismo creó (mismo patrón que perfiles_select_vendedor_creados)
create policy "pedidos_select_vendedor"
  on public.pedidos for select
  to authenticated
  using (
    public.rol_actual() = 'vendedor'
    and exists (
      select 1 from public.perfiles p
      where p.id = pedidos.cliente_id and p.creado_por = auth.uid()
    )
  );

create policy "pedidos_update_vendedor"
  on public.pedidos for update
  to authenticated
  using (
    public.rol_actual() = 'vendedor'
    and exists (
      select 1 from public.perfiles p
      where p.id = pedidos.cliente_id and p.creado_por = auth.uid()
    )
  )
  with check (
    public.rol_actual() = 'vendedor'
    and exists (
      select 1 from public.perfiles p
      where p.id = pedidos.cliente_id and p.creado_por = auth.uid()
    )
  );

-- pedidos: admin ve y gestiona todo
create policy "pedidos_admin_all"
  on public.pedidos for all
  to authenticated
  using (public.rol_actual() = 'admin')
  with check (public.rol_actual() = 'admin');

-- pedido_items: visible para quien pueda ver el pedido dueño (cliente
-- propio, su vendedor, o admin)
create policy "pedido_items_select"
  on public.pedido_items for select
  to authenticated
  using (
    exists (
      select 1 from public.pedidos pe
      where pe.id = pedido_items.pedido_id
        and (
          pe.cliente_id = auth.uid()
          or public.rol_actual() = 'admin'
          or (
            public.rol_actual() = 'vendedor'
            and exists (
              select 1 from public.perfiles p
              where p.id = pe.cliente_id and p.creado_por = auth.uid()
            )
          )
        )
    )
  );

-- pedido_items: el cliente inserta ítems solo en un pedido propio
create policy "pedido_items_insert_propio"
  on public.pedido_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.pedidos pe
      where pe.id = pedido_items.pedido_id and pe.cliente_id = auth.uid()
    )
  );

-- =====================================================================
-- FIN.
-- =====================================================================
