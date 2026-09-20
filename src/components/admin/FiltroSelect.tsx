"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function FiltroSelect({
  paramNombre,
  placeholder,
  opciones,
}: {
  paramNombre: string;
  placeholder: string;
  opciones: { value: string; label: string }[];
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
    params.delete("pagina");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      className="rounded-md border border-tema-tinta/20 bg-tema-papel px-3 py-2 text-sm text-tema-tinta focus:outline-none focus:ring-2 focus:ring-tema-primario"
      value={searchParams.get(paramNombre) ?? ""}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {opciones.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
