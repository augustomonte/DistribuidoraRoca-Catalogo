import { obtenerMisFerreterias } from "@/lib/vendedor";
import { PerfilesTable } from "@/components/admin/PerfilesTable";
import { CrearFerreteriaForm } from "@/components/admin/CrearFerreteriaForm";

export default async function MisFerreteriasPage() {
  const ferreterias = await obtenerMisFerreterias();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-6 text-2xl font-bold text-roca-negro">
          Mis ferreterías
        </h1>
        <PerfilesTable
          perfiles={ferreterias}
          columnaExtra="razon_social"
          soloLectura
        />
      </div>

      <CrearFerreteriaForm />
    </div>
  );
}
