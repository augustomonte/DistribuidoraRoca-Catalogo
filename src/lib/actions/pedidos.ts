"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPerfilActual } from "@/lib/auth";

export interface CrearPedidoResultado {
  ok: boolean;
  error?: string;
  pedidoId?: string;
}

/**
 * Crea un pedido a partir del carrito. Del cliente solo se acepta
 * productoId + cantidad: el precio se vuelve a buscar acá por
 * productos_vista (ya resuelto según el rol de quien pide), así que no
 * importa qué precio tuviera guardado el carrito en localStorage —
 * pudo quedar viejo, o alguien pudo mandarlo manipulado llamando a esta
 * action directo. "Precio congelado al momento del pedido" tiene que
 * ser el precio real de ese momento, no el que diga el cliente.
 */
export async function crearPedido(
  itemsCarrito: { productoId: string; cantidad: number }[]
): Promise<CrearPedidoResultado> {
  const perfil = await getPerfilActual();
  if (!perfil || perfil.rol !== "cliente") {
    return { ok: false, error: "Solo los clientes pueden hacer pedidos." };
  }

  const cantidadesValidas = itemsCarrito.filter(
    (i) => Number.isFinite(i.cantidad) && i.cantidad > 0
  );
  if (cantidadesValidas.length === 0) {
    return { ok: false, error: "El carrito está vacío." };
  }

  const supabase = await createClient();

  const ids = cantidadesValidas.map((i) => i.productoId);
  const { data: productos, error: errorProductos } = await supabase
    .from("productos_vista")
    .select("id, codigo, nombre, precio, iva_porcentaje")
    .in("id", ids);

  if (errorProductos) {
    return { ok: false, error: errorProductos.message };
  }

  const mapaProductos = new Map((productos ?? []).map((p) => [p.id, p]));

  const itemsValidos = cantidadesValidas.flatMap((item) => {
    const producto = mapaProductos.get(item.productoId);
    if (!producto) return [];
    return [
      {
        producto_id: producto.id,
        producto_codigo: producto.codigo,
        producto_nombre: producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: producto.precio,
        iva_porcentaje: producto.iva_porcentaje,
      },
    ];
  });

  if (itemsValidos.length === 0) {
    return {
      ok: false,
      error: "Ninguno de los productos del carrito está disponible.",
    };
  }

  const { data: pedido, error: errorPedido } = await supabase
    .from("pedidos")
    .insert({ cliente_id: perfil.id })
    .select("id")
    .single();

  if (errorPedido || !pedido) {
    return {
      ok: false,
      error: errorPedido?.message ?? "No se pudo crear el pedido.",
    };
  }

  const { error: errorItems } = await supabase
    .from("pedido_items")
    .insert(itemsValidos.map((item) => ({ ...item, pedido_id: pedido.id })));

  if (errorItems) {
    // El pedido quedó creado sin ítems: lo borramos para no dejar un
    // pedido vacío. El cascade de pedido_items no aplica al revés.
    await supabase.from("pedidos").delete().eq("id", pedido.id);
    return { ok: false, error: errorItems.message };
  }

  revalidatePath("/pedidos");
  return { ok: true, pedidoId: pedido.id };
}
