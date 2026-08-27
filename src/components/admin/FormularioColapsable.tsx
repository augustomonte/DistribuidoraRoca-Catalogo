"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function FormularioColapsable({
  etiquetaBoton,
  children,
}: {
  etiquetaBoton: string;
  children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <Button variante="outline" onClick={() => setAbierto(true)}>
        + {etiquetaBoton}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variante="outline"
        className="w-fit"
        onClick={() => setAbierto(false)}
      >
        Cancelar
      </Button>
      {children}
    </div>
  );
}
