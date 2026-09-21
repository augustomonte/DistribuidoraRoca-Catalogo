import { ActualizarPreciosForm } from "@/components/admin/ActualizarPreciosForm";

export default function ActualizarPreciosPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-tema-tinta">Precios</h1>
      <ActualizarPreciosForm />
    </div>
  );
}
