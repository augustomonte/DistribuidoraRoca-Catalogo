import Link from "next/link";
import { cn } from "@/lib/utils";

export function Paginacion({
  paginaActual,
  totalPaginas,
  searchParams,
}: {
  paginaActual: number;
  totalPaginas: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPaginas <= 1) return null;

  function hrefParaPagina(pagina: number) {
    const params = new URLSearchParams();
    for (const [clave, valor] of Object.entries(searchParams)) {
      if (valor) params.set(clave, valor);
    }
    params.set("pagina", String(pagina));
    return `?${params.toString()}`;
  }

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPaginas || Math.abs(p - paginaActual) <= 2
  );

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1">
      {paginas.map((pagina, i) => {
        const anterior = paginas[i - 1];
        const mostrarPuntos = anterior && pagina - anterior > 1;

        return (
          <span key={pagina} className="flex items-center gap-1">
            {mostrarPuntos && (
              <span className="px-2 text-tema-tinta/40">…</span>
            )}
            <Link
              href={hrefParaPagina(pagina)}
              className={cn(
                "flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-medium",
                pagina === paginaActual
                  ? "bg-tema-primario text-tema-texto-claro"
                  : "text-tema-tinta/70 hover:bg-tema-tinta/5"
              )}
            >
              {pagina}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
