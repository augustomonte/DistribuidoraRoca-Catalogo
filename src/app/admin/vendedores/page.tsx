import { obtenerVendedores } from "@/lib/admin";
import { PerfilesTable } from "@/components/admin/PerfilesTable";
import { CrearVendedorForm } from "@/components/admin/CrearVendedorForm";

export default async function VendedoresPage() {
  const vendedores = await obtenerVendedores();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-6 text-2xl font-bold text-roca-negro">Vendedores</h1>
        <PerfilesTable perfiles={vendedores} />
      </div>

      <CrearVendedorForm />
    </div>
  );
}
