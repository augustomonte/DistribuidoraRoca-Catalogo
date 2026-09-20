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
      className="rounded-md border border-tema-tinta/20 bg-tema-papel px-3 py-2 text-sm text-tema-tinta focus:outline-none focus:ring-2 focus:ring-tema-primario"
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
