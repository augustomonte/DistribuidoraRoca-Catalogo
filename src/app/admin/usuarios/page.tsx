import {
  obtenerVendedores,
  obtenerClientes,
  type OrdenPerfiles,
} from "@/lib/admin";
import { PerfilesTable } from "@/components/admin/PerfilesTable";
import { CrearVendedorForm } from "@/components/admin/CrearVendedorForm";
import { CrearClienteForm } from "@/components/admin/CrearClienteForm";
import { cliente } from "@/config/cliente";
import { FormularioColapsable } from "@/components/admin/FormularioColapsable";
import { BuscadorOrdenUsuarios } from "@/components/admin/BuscadorOrdenUsuarios";
import { FiltroVendedor } from "@/components/admin/FiltroVendedor";

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
    fvendedor?: string;
  }>;
}) {
  const { vq, vorden, fq, forden, fvendedor } = await searchParams;
  const { clienteSingular, clientePlural } = cliente.etiquetas;

  const [vendedores, todosLosVendedores, clientes] = await Promise.all([
    obtenerVendedores({ busqueda: vq, orden: leerOrden(vorden) }),
    obtenerVendedores(),
    obtenerClientes({
      busqueda: fq,
      orden: leerOrden(forden),
      vendedorId: fvendedor,
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-tema-tinta">Usuarios</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-tema-tinta">
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

          <p className="text-sm text-tema-tinta/50">
            {vendedores.length} vendedor{vendedores.length === 1 ? "" : "es"}
          </p>

          <PerfilesTable perfiles={vendedores} accionEliminar="vendedor" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-tema-tinta">
              {clientePlural}
            </h2>
            <FormularioColapsable
              etiquetaBoton={`Agregar ${clienteSingular.toLowerCase()}`}
            >
              <CrearClienteForm />
            </FormularioColapsable>
          </div>

          <BuscadorOrdenUsuarios
            paramBusqueda="fq"
            paramOrden="forden"
            placeholder={`Buscar ${clienteSingular.toLowerCase()}...`}
          />

          <FiltroVendedor
            paramNombre="fvendedor"
            vendedores={todosLosVendedores}
          />

          <p className="text-sm text-tema-tinta/50">
            {clientes.length}{" "}
            {(clientes.length === 1
              ? clienteSingular
              : clientePlural
            ).toLowerCase()}
          </p>

          <PerfilesTable
            perfiles={clientes}
            columnaExtra="vendedor"
            accionEliminar="cliente"
          />
        </div>
      </div>
    </div>
  );
}
