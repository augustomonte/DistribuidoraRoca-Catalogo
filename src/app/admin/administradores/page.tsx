import { obtenerAdministradores } from "@/lib/admin";
import { PerfilesTable } from "@/components/admin/PerfilesTable";
import { CrearAdminForm } from "@/components/admin/CrearAdminForm";

export default async function AdministradoresPage() {
  const administradores = await obtenerAdministradores();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-6 text-2xl font-bold text-roca-negro">
          Administradores
        </h1>
        <PerfilesTable perfiles={administradores} />
      </div>

      <CrearAdminForm />
    </div>
  );
}
