import { obtenerCategorias } from "@/lib/catalogo";
import { crearProducto } from "@/lib/actions/productos";
import { ProductoForm } from "@/components/admin/ProductoForm";

export default async function NuevoProductoPage() {
  const categorias = await obtenerCategorias();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-roca-negro">
        Nuevo producto
      </h1>
      <ProductoForm accion={crearProducto} categorias={categorias} />
    </div>
  );
}
