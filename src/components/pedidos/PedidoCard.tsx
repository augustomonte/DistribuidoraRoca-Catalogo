"use client";

import { useState, useTransition } from "react";
import { actualizarEstadoPedido } from "@/lib/actions/pedidos";
import { Select } from "@/components/ui/Select";
import { formatearPrecio } from "@/lib/utils";
import type { PedidoConItems } from "@/lib/pedidos";
import type { EstadoPedido } from "@/types/database.types";

const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

const COLOR_ESTADO: Record<EstadoPedido, string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  confirmado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
};

export function PedidoCard({
  pedido,
  puedeGestionar,
}: {
  pedido: PedidoConItems;
  /** true para admin y vendedor: pueden cambiar el estado. */
  puedeGestionar: boolean;
}) {
  const [estado, setEstado] = useState(pedido.estado);
  const [pending, startTransition] = useTransition();

  function handleCambiarEstado(nuevo: EstadoPedido) {
    const anterior = estado;
    setEstado(nuevo);
    startTransition(async () => {
      const resultado = await actualizarEstadoPedido(pedido.id, nuevo);
      if (!resultado.ok) setEstado(anterior);
    });
  }

  const nombreCliente = pedido.cliente
    ? pedido.cliente.razon_social ||
      `${pedido.cliente.nombre} ${pedido.cliente.apellido ?? ""}`.trim()
    : null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-tema-tinta/10 bg-tema-papel p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-tema-tinta/40">
            #{pedido.id.slice(0, 8)}
          </p>
          <p className="text-xs text-tema-tinta/50">
            {new Date(pedido.created_at).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {nombreCliente && (
            <p className="text-sm font-medium text-tema-tinta">
              {nombreCliente}
            </p>
          )}
        </div>

        {puedeGestionar ? (
          <Select
            value={estado}
            disabled={pending}
            onChange={(e) =>
              handleCambiarEstado(e.target.value as EstadoPedido)
            }
            className="w-auto"
          >
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </Select>
        ) : (
          <span
            className={`rounded px-2 py-1 text-xs font-semibold ${COLOR_ESTADO[estado]}`}
          >
            {ETIQUETA_ESTADO[estado]}
          </span>
        )}
      </div>

      <div className="flex flex-col divide-y divide-tema-tinta/5 border-t border-tema-tinta/5 pt-2">
        {pedido.pedido_items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-1.5 text-sm"
          >
            <span className="text-tema-tinta/80">
              {item.cantidad} x {item.producto_nombre}
              <span className="ml-1 font-mono text-xs text-tema-tinta/40">
                ({item.producto_codigo})
              </span>
            </span>
            <span className="text-tema-tinta/60">
              {formatearPrecio(item.precio_unitario * item.cantidad)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-tema-tinta/10 pt-2">
        <span className="text-sm font-medium text-tema-tinta">Total</span>
        <span className="text-base font-bold text-tema-tinta">
          {formatearPrecio(pedido.total)}
        </span>
      </div>
    </div>
  );
}
