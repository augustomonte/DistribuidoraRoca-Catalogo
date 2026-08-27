import { alternarActivoPerfil } from "@/lib/actions/usuarios";
import { EliminarFerreteriaBoton } from "@/components/admin/EliminarFerreteriaBoton";
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
  accionEliminar?: "ferreteria" | "vendedor";
}) {
  if (perfiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-roca-negro/20 py-16 text-center text-roca-negro/50">
        Todavía no hay registros.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-roca-negro/10 bg-roca-blanco">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b border-roca-negro/10 bg-roca-gris text-xs uppercase text-roca-negro/60">
          <tr>
            <th className="px-4 py-3">Nombre</th>
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
              className="border-b border-roca-negro/5 transition-colors duration-150 last:border-0 hover:bg-roca-gris/60"
            >
              <td className="px-4 py-3 font-medium text-roca-negro">
                {perfil.nombre} {perfil.apellido ?? ""}
              </td>
              {columnaExtra === "razon_social" && (
                <>
                  <td className="px-4 py-3">{perfil.razon_social ?? "—"}</td>
                  <td className="px-4 py-3 text-roca-negro/70">
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
                      : "rounded bg-roca-negro/10 px-2 py-1 text-xs font-semibold text-roca-negro/50"
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
                        className="rounded-md border border-roca-negro/20 px-3 py-1.5 text-xs font-medium hover:bg-roca-negro/5"
                      >
                        {perfil.activo ? "Desactivar" : "Activar"}
                      </button>
                    </form>

                    {accionEliminar === "ferreteria" && (
                      <EliminarFerreteriaBoton
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
