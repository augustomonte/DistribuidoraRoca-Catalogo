import { redirect } from "next/navigation";
import { getPerfilActual } from "@/lib/auth";
import { obtenerPedidos } from "@/lib/pedidos";
import { PedidoCard } from "@/components/pedidos/PedidoCard";

export default async function PedidosPage() {
  const perfil = await getPerfilActual();
  if (!perfil) redirect("/login");

  const pedidos = await obtenerPedidos();
  const puedeGestionar = perfil.rol === "admin" || perfil.rol === "vendedor";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-bold text-tema-tinta">
        {puedeGestionar ? "Pedidos" : "Mis pedidos"}
      </h1>

      {pedidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-tema-tinta/20 py-24 text-center text-tema-tinta/50">
          Todavía no hay pedidos.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              puedeGestionar={puedeGestionar}
            />
          ))}
        </div>
      )}
    </div>
  );
}
