"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Perfil } from "@/types";

export function FiltroVendedor({
  paramNombre,
  vendedores,
}: {
  paramNombre: string;
  vendedores: Perfil[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set(paramNombre, valor);
    } else {
      params.delete(paramNombre);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      className="rounded-md border border-roca-negro/20 bg-roca-blanco px-3 py-2 text-sm text-roca-negro focus:outline-none focus:ring-2 focus:ring-roca-rojo"
      value={searchParams.get(paramNombre) ?? ""}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="">Todos los vendedores</option>
      {vendedores.map((v) => (
        <option key={v.id} value={v.id}>
          {v.nombre} {v.apellido ?? ""}
        </option>
      ))}
    </select>
  );
}
