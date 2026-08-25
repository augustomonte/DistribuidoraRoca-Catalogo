import { notFound } from "next/navigation";
import { obtenerCategorias } from "@/lib/catalogo";
import { obtenerProductoPorId } from "@/lib/admin";
import { actualizarProducto } from "@/lib/actions/productos";
import { ProductoForm } from "@/components/admin/ProductoForm";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [producto, categorias] = await Promise.all([
    obtenerProductoPorId(id),
    obtenerCategorias(),
  ]);

  if (!producto) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-roca-negro">
        Editar producto
      </h1>
      <ProductoForm
        accion={actualizarProducto.bind(null, id)}
        categorias={categorias}
        producto={producto}
      />
    </div>
  );
}
