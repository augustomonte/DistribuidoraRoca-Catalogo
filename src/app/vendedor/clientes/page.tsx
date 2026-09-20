import { obtenerMisClientes } from "@/lib/vendedor";
import { PerfilesTable } from "@/components/admin/PerfilesTable";
import { CrearClienteForm } from "@/components/admin/CrearClienteForm";
import { cliente } from "@/config/cliente";

export default async function MisClientesPage() {
  const clientes = await obtenerMisClientes();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-6 text-2xl font-bold text-tema-tinta">
          Mis {cliente.etiquetas.clientePlural.toLowerCase()}
        </h1>
        <PerfilesTable
          perfiles={clientes}
          columnaExtra="razon_social"
          soloLectura
        />
      </div>

      <CrearClienteForm />
    </div>
  );
}
