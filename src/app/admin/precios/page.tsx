import { ActualizarPreciosForm } from "@/components/admin/ActualizarPreciosForm";
import { DescargarCatalogoExcel } from "@/components/lista/DescargarCatalogoExcel";

export default function ListaPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-bold text-tema-tinta">Lista</h1>
      <DescargarCatalogoExcel />
      <ActualizarPreciosForm />
    </div>
  );
}
