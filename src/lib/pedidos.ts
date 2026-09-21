import { createClient } from "@/lib/supabase/server";
import type { Pedido, PedidoItem, Perfil } from "@/types";

export type PedidoConItems = Pedido & {
  pedido_items: PedidoItem[];
  cliente: Pick<Perfil, "nombre" | "apellido" | "razon_social"> | null;
};

/**
 * Todos los pedidos visibles para quien consulta. No hay que filtrar acá
 * por rol: la RLS de "pedidos" ya devuelve solo lo que corresponde
 * (el cliente ve los suyos, el vendedor los de sus clientes, el admin
 * todos), así que la misma consulta sirve para los tres roles.
 */
export async function obtenerPedidos(): Promise<PedidoConItems[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "*, pedido_items(*), cliente:perfiles!pedidos_cliente_id_fkey(nombre, apellido, razon_social)"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as PedidoConItems[];
}
