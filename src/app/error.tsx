"use client"; // Los error boundaries tienen que ser Client Components.

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/**
 * Error boundary raíz: envuelve toda la app (layout.js, page.js y layouts
 * anidados) en un React Error Boundary. Atrapa excepciones no controladas;
 * los errores esperados (validación de formularios, etc.) se siguen
 * modelando como valores de retorno en las Server Actions, no acá.
 *
 * `retry` reemplaza a `reset` desde Next 16.3 (estabilizado en esta misma
 * versión del proyecto): reintenta re-fetchear y re-renderizar el árbol
 * bajo este boundary, en vez de solo limpiar el estado de error.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-tema-fondo px-4 text-center">
      <h1 className="text-xl font-bold text-tema-tinta">Algo salió mal</h1>
      <p className="max-w-sm text-sm text-tema-tinta/60">
        Hubo un error inesperado. Podés intentar de nuevo, o volver al
        inicio si el problema persiste.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => retry()}>Reintentar</Button>
        <Link href="/">
          <Button variante="outline">Ir al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
