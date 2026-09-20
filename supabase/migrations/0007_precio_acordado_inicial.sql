-- =====================================================================
-- Migración: inicializar precio_acordado en los productos importados
-- Correr en Supabase Dashboard -> SQL Editor -> New query -> Run
-- =====================================================================
--
-- CONTEXTO
-- El script de importación (scripts/import-productos.ts) guardaba el mismo
-- valor en precio_acordado y en precio_lista2, porque el Excel maestro trae
-- una sola columna de precio (LISTA_5). Resultado: la vista productos_vista
-- devuelve el mismo número para todos los roles y el precio reservado para
-- admin y vendedores nunca existió.
--
-- Esta migración deriva el precio acordado del de catálogo aplicando el
-- descuento configurado.
--
-- IMPORTANTE: el 0.10 de acá abajo tiene que coincidir con
-- `precios.descuentoPrecioAcordado` en src/config/cliente.ts. Si cambiás uno,
-- cambiá el otro: es el único valor duplicado entre el código y la base.
--
-- Solo toca las filas donde ambos precios son iguales, que es el estado
-- "sin precio acordado propio". Los productos a los que ya se les cargó un
-- acordado distinto a mano quedan intactos.
-- ---------------------------------------------------------------------

-- 1. Antes de correr: cuántas filas se van a tocar
--    (descomentá para chequear primero)
-- select count(*) as a_actualizar
-- from public.productos
-- where precio_acordado = precio_lista2;

-- 2. El update
update public.productos
set precio_acordado = round(precio_lista2 * (1 - 0.10), 2)
where precio_acordado = precio_lista2
  and precio_lista2 > 0;

-- 3. Verificación: no debería quedar ninguna fila con ambos precios
--    iguales y precio mayor a cero.
-- select count(*) as sin_diferenciar
-- from public.productos
-- where precio_acordado = precio_lista2
--   and precio_lista2 > 0;

-- =====================================================================
-- NOTA sobre futuras importaciones
-- El script scripts/import-productos.ts sigue escribiendo ambos precios
-- iguales al correrse. Eso ya no rompe nada: es el estado "sin acordado
-- propio", y el formulario del panel lo recalcula al editar. Pero después
-- de cada importación masiva conviene volver a correr el update del punto
-- 2 para que el catálogo entero quede diferenciado de una.
-- =====================================================================
