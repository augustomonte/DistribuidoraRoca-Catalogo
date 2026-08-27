"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function BuscadorOrdenUsuarios({
  paramBusqueda,
  paramOrden,
  placeholder,
}: {
  paramBusqueda: string;
  paramOrden: string;
  placeholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [busqueda, setBusqueda] = useState(searchParams.get(paramBusqueda) ?? "");

  function actualizarParametro(clave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set(clave, valor);
    } else {
      params.delete(clave);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleBuscar(e: FormEvent) {
    e.preventDefault();
    actualizarParametro(paramBusqueda, busqueda);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <form onSubmit={handleBuscar} className="flex flex-1 gap-2">
        <Input
          placeholder={placeholder}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Button type="submit" variante="outline">
          Buscar
        </Button>
      </form>

      <select
        className="rounded-md border border-roca-negro/20 bg-roca-blanco px-3 py-2 text-sm text-roca-negro focus:outline-none focus:ring-2 focus:ring-roca-rojo"
        value={searchParams.get(paramOrden) ?? "nombre_asc"}
        onChange={(e) => actualizarParametro(paramOrden, e.target.value)}
      >
        <option value="nombre_asc">Nombre A-Z</option>
        <option value="nombre_desc">Nombre Z-A</option>
      </select>
    </div>
  );
}
