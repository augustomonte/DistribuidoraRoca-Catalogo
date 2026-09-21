"use client";

import { useEffect, useState } from "react";
import { useCarrito } from "@/lib/carrito";
import { Button } from "@/components/ui/Button";
import type { ProductoVista } from "@/types";

export function BotonAgregarCarrito({
  producto,
  compacto = false,
}: {
  producto: ProductoVista;
  /** Botón chico para la tarjeta del catálogo; el detalle usa el normal. */
  compacto?: boolean;
}) {
  const { items, agregarItem } = useCarrito();
  const [agregado, setAgregado] = useState(false);

  const enCarrito = items.find((i) => i.productoId === producto.id);

  useEffect(() => {
    if (!agregado) return;
    const t = setTimeout(() => setAgregado(false), 1500);
    return () => clearTimeout(t);
  }, [agregado]);

  function handleClick(e: React.MouseEvent) {
    // Cuando está dentro de la tarjeta, no es hijo de un <Link> (lo
    // sacamos a propósito), pero por las dudas frenamos igual cualquier
    // burbujeo hacia un contenedor clickeable.
    e.preventDefault();
    e.stopPropagation();

    agregarItem({
      productoId: producto.id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      marca: producto.marca,
      precio: producto.precio,
      ivaPorcentaje: producto.iva_porcentaje,
      unidadVenta: producto.unidad_venta,
      fotoUrl: producto.foto_url,
    });
    setAgregado(true);
  }

  return (
    <Button
      type="button"
      variante={enCarrito ? "outline" : "primario"}
      onClick={handleClick}
      className={compacto ? "w-full text-xs" : "w-full"}
    >
      {agregado
        ? "¡Agregado!"
        : enCarrito
          ? `En el carrito (${enCarrito.cantidad})`
          : "Agregar al carrito"}
    </Button>
  );
}
