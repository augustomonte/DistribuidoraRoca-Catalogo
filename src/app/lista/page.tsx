import { DescargarCatalogoExcel } from "@/components/lista/DescargarCatalogoExcel";

// Versión de "Lista" para vendedor y cliente: solo la descarga a Excel,
// sin el formulario de actualización masiva (eso sigue siendo exclusivo
// de admin, en /admin/precios).
export default function ListaPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-tema-tinta">Lista</h1>
      <DescargarCatalogoExcel />
    </div>
  );
}
