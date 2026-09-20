/**
 * Indicador de carga liviano, para usar dentro de los `loading.tsx` de
 * cada segmento de ruta. Ver AGENTS.md: `loading.tsx` envuelve la página
 * (y layouts anidados) en un Suspense, pero no el layout del mismo
 * segmento, así que esto solo tapa la espera de la data que carga la
 * página en sí.
 */
export function Spinner({ etiqueta = "Cargando..." }: { etiqueta?: string }) {
  return (
    <div
      role="status"
      className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3 text-tema-tinta/50"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-tema-tinta/15 border-t-tema-primario" />
      <span className="text-sm">{etiqueta}</span>
    </div>
  );
}
