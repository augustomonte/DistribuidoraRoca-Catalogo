"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCarrito } from "@/lib/carrito";
import { crearPedido } from "@/lib/actions/pedidos";
import { Button } from "@/components/ui/Button";
import { formatearPrecio } from "@/lib/utils";
import { cliente } from "@/config/cliente";

export function CarritoView() {
  const router = useRouter();
  const { items, actualizarCantidad, quitarItem, vaciarCarrito, totalConIva } =
    useCarrito();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<{
    id: string;
    mensajeWhatsapp: string;
  } | null>(null);

  async function handleConfirmar() {
    setError(null);
    setEnviando(true);

    const resultado = await crearPedido(
      items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad }))
    );

    if (!resultado.ok || !resultado.pedidoId) {
      setError(resultado.error ?? "No se pudo confirmar el pedido.");
      setEnviando(false);
      return;
    }

    const resumen = items
      .map((i) => `• ${i.cantidad} x ${i.nombre} (${i.codigo})`)
      .join("\n");
    const mensajeWhatsapp = `Hola, acabo de hacer un pedido (#${resultado.pedidoId.slice(
      0,
      8
    )}):\n${resumen}\n\nTotal: ${formatearPrecio(totalConIva)}`;

    setConfirmado({ id: resultado.pedidoId, mensajeWhatsapp });
    vaciarCarrito();
    setEnviando(false);
    router.refresh();
  }

  if (confirmado) {
    const urlWhatsapp = `https://wa.me/${
      cliente.contacto.whatsapp
    }?text=${encodeURIComponent(confirmado.mensajeWhatsapp)}`;

    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-tema-tinta/10 bg-tema-papel p-8 text-center">
        <h1 className="text-xl font-bold text-tema-tinta">
          ¡Pedido enviado!
        </h1>
        <p className="text-sm text-tema-tinta/60">
          Tu pedido #{confirmado.id.slice(0, 8)} quedó registrado. Para que
          te lo confirmen más rápido, avisale a tu vendedor por WhatsApp.
        </p>
        <a
          href={urlWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button className="w-full">Avisar por WhatsApp</Button>
        </a>
        <Link
          href="/pedidos"
          className="text-sm text-tema-tinta/60 underline hover:text-tema-tinta"
        >
          Ver mis pedidos
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-tema-tinta/20 py-24 text-center text-tema-tinta/50">
        <p>Tu carrito está vacío.</p>
        <Link
          href="/catalogo"
          className="text-sm font-medium text-tema-primario hover:underline"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-bold text-tema-tinta">Mi carrito</h1>

      <div className="flex flex-col divide-y divide-tema-tinta/10 rounded-lg border border-tema-tinta/10 bg-tema-papel">
        {items.map((item) => (
          <div key={item.productoId} className="flex items-center gap-3 p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-tema-fondo">
              {item.fotoUrl ? (
                <Image
                  src={item.fotoUrl}
                  alt={item.nombre}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-tema-tinta">
                {item.nombre}
              </p>
              <p className="font-mono text-xs text-tema-tinta/40">
                {item.codigo}
              </p>
              <p className="text-sm text-tema-tinta/60">
                {formatearPrecio(item.precio)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={item.cantidad}
                onChange={(e) =>
                  actualizarCantidad(
                    item.productoId,
                    Number(e.target.value) || 0
                  )
                }
                className="w-16 rounded-md border border-tema-tinta/20 px-2 py-1 text-center text-sm"
              />
              <button
                type="button"
                onClick={() => quitarItem(item.productoId)}
                className="text-xs text-tema-tinta/40 hover:text-red-600"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-lg border border-tema-tinta/10 bg-tema-papel p-4">
        <span className="text-sm font-medium text-tema-tinta">Total</span>
        <span className="text-xl font-bold text-tema-tinta">
          {formatearPrecio(totalConIva)}
        </span>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button onClick={handleConfirmar} disabled={enviando} className="w-full">
        {enviando ? "Enviando..." : "Confirmar pedido"}
      </Button>
    </div>
  );
}
