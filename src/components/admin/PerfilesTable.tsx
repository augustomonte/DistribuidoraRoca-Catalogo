import { alternarActivoPerfil } from "@/lib/actions/usuarios";
import { EliminarClienteBoton } from "@/components/admin/EliminarClienteBoton";
import { EliminarVendedorBoton } from "@/components/admin/EliminarVendedorBoton";
import type { Perfil } from "@/types";

export function PerfilesTable({
  perfiles,
  columnaExtra,
  soloLectura = false,
  accionEliminar,
}: {
  perfiles: (Perfil & { vendedor?: Pick<Perfil, "nombre" | "apellido"> | null })[];
  columnaExtra?: "razon_social" | "vendedor";
  soloLectura?: boolean;
  accionEliminar?: "cliente" | "vendedor";
}) {
  if (perfiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-tema-tinta/20 py-16 text-center text-tema-tinta/50">
        Todavía no hay registros.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-tema-tinta/10 bg-tema-papel">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b border-tema-tinta/10 bg-tema-fondo text-xs uppercase text-tema-tinta/60">
          <tr>
            <th className="px-4 py-3">
              {columnaExtra === "vendedor" ? "Razón social" : "Nombre"}
            </th>
            {columnaExtra === "razon_social" && (
              <>
                <th className="px-4 py-3">Razón social</th>
                <th className="px-4 py-3">Ubicación</th>
              </>
            )}
            {columnaExtra === "vendedor" && (
              <th className="px-4 py-3">Creado por</th>
            )}
            <th className="px-4 py-3">Teléfono</th>
            <th className="px-4 py-3">Estado</th>
            {!soloLectura && <th className="px-4 py-3 text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {perfiles.map((perfil) => (
            <tr
              key={perfil.id}
              className="border-b border-tema-tinta/5 transition-colors duration-150 last:border-0 hover:bg-tema-fondo/60"
            >
              <td className="px-4 py-3 font-medium text-tema-tinta">
                {columnaExtra === "vendedor"
                  ? perfil.razon_social || "—"
                  : `${perfil.nombre} ${perfil.apellido ?? ""}`}
              </td>
              {columnaExtra === "razon_social" && (
                <>
                  <td className="px-4 py-3">{perfil.razon_social ?? "—"}</td>
                  <td className="px-4 py-3 text-tema-tinta/70">
                    {perfil.ciudad || perfil.provincia
                      ? [perfil.ciudad, perfil.provincia]
                          .filter(Boolean)
                          .join(", ")
                      : "—"}
                  </td>
                </>
              )}
              {columnaExtra === "vendedor" && (
                <td className="px-4 py-3">
                  {perfil.vendedor
                    ? `${perfil.vendedor.nombre} ${perfil.vendedor.apellido ?? ""}`
                    : "—"}
                </td>
              )}
              <td className="px-4 py-3">{perfil.telefono ?? "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={
                    perfil.activo
                      ? "rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700"
                      : "rounded bg-tema-tinta/10 px-2 py-1 text-xs font-semibold text-tema-tinta/50"
                  }
                >
                  {perfil.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              {!soloLectura && (
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <form
                      action={alternarActivoPerfil.bind(
                        null,
                        perfil.id,
                        perfil.activo
                      )}
                    >
                      <button
                        type="submit"
                        className="rounded-md border border-tema-tinta/20 px-3 py-1.5 text-xs font-medium hover:bg-tema-tinta/5"
                      >
                        {perfil.activo ? "Desactivar" : "Activar"}
                      </button>
                    </form>

                    {accionEliminar === "cliente" && (
                      <EliminarClienteBoton
                        id={perfil.id}
                        nombre={perfil.razon_social || perfil.nombre}
                      />
                    )}
                    {accionEliminar === "vendedor" && (
                      <EliminarVendedorBoton
                        id={perfil.id}
                        nombre={`${perfil.nombre} ${perfil.apellido ?? ""}`.trim()}
                      />
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
