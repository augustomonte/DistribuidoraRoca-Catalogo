import { notFound } from "next/navigation";
import { obtenerCategoriaPorId } from "@/lib/admin";
import { actualizarCategoria } from "@/lib/actions/categorias";
import { CategoriaForm } from "@/components/admin/CategoriaForm";

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNumerico = Number(id);
  if (!Number.isInteger(idNumerico)) notFound();

  const categoria = await obtenerCategoriaPorId(idNumerico);
  if (!categoria) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-tema-tinta">
        Editar categoría
      </h1>
      <CategoriaForm
        accion={actualizarCategoria.bind(null, idNumerico)}
        categoria={categoria}
      />
    </div>
  );
}
