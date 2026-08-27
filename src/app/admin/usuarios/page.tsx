import {
  obtenerVendedores,
  obtenerFerreterias,
  type OrdenPerfiles,
} from "@/lib/admin";
import { PerfilesTable } from "@/components/admin/PerfilesTable";
import { CrearVendedorForm } from "@/components/admin/CrearVendedorForm";
import { CrearFerreteriaForm } from "@/components/admin/CrearFerreteriaForm";
import { FormularioColapsable } from "@/components/admin/FormularioColapsable";
import { BuscadorOrdenUsuarios } from "@/components/admin/BuscadorOrdenUsuarios";

function leerOrden(valor?: string): OrdenPerfiles {
  return valor === "nombre_desc" ? "nombre_desc" : "nombre_asc";
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{
    vq?: string;
    vorden?: string;
    fq?: string;
    forden?: string;
  }>;
}) {
  const { vq, vorden, fq, forden } = await searchParams;

  const [vendedores, ferreterias] = await Promise.all([
    obtenerVendedores({ busqueda: vq, orden: leerOrden(vorden) }),
    obtenerFerreterias({ busqueda: fq, orden: leerOrden(forden) }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-roca-negro">Usuarios</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-roca-negro">
              Vendedores
            </h2>
            <FormularioColapsable etiquetaBoton="Nuevo vendedor">
              <CrearVendedorForm />
            </FormularioColapsable>
          </div>

          <BuscadorOrdenUsuarios
            paramBusqueda="vq"
            paramOrden="vorden"
            placeholder="Buscar vendedor..."
          />

          <p className="text-sm text-roca-negro/50">
            {vendedores.length} vendedor{vendedores.length === 1 ? "" : "es"}
          </p>

          <PerfilesTable perfiles={vendedores} accionEliminar="vendedor" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-roca-negro">
              Ferreterías
            </h2>
            <FormularioColapsable etiquetaBoton="Nueva ferretería">
              <CrearFerreteriaForm />
            </FormularioColapsable>
          </div>

          <BuscadorOrdenUsuarios
            paramBusqueda="fq"
            paramOrden="forden"
            placeholder="Buscar ferretería..."
          />

          <p className="text-sm text-roca-negro/50">
            {ferreterias.length} ferretería{ferreterias.length === 1 ? "" : "s"}
          </p>

          <PerfilesTable
            perfiles={ferreterias}
            columnaExtra="vendedor"
            accionEliminar="ferreteria"
          />
        </div>
      </div>
    </div>
  );
}
