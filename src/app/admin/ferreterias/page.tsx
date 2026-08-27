import { obtenerFerreterias } from "@/lib/admin";
import { PerfilesTable } from "@/components/admin/PerfilesTable";

export default async function FerreteriasPage() {
  const ferreterias = await obtenerFerreterias();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-roca-negro">Ferreterías</h1>
      <PerfilesTable
        perfiles={ferreterias}
        columnaExtra="vendedor"
        mostrarEliminar
      />
    </div>
  );
}
