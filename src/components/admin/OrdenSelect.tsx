"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function OrdenSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor === "reciente") {
      params.delete("orden");
    } else {
      params.set("orden", valor);
    }
    params.delete("pagina");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      className="rounded-md border border-tema-tinta/20 bg-tema-papel px-3 py-2 text-sm text-tema-tinta focus:outline-none focus:ring-2 focus:ring-tema-primario"
      value={searchParams.get("orden") ?? "reciente"}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="reciente">Más recientes</option>
      <option value="nombre_asc">Nombre A-Z</option>
      <option value="nombre_desc">Nombre Z-A</option>
    </select>
  );
}
