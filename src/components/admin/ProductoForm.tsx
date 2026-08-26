"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { ProductoFormState } from "@/lib/actions/productos";
import type { ProductoConMarca } from "@/lib/admin";
import type { Categoria } from "@/types";

type AccionProducto = (
  state: ProductoFormState,
  formData: FormData
) => Promise<ProductoFormState>;

export function ProductoForm({
  accion,
  categorias,
  marcas,
  producto,
}: {
  accion: AccionProducto;
  categorias: Categoria[];
  marcas: string[];
  producto?: ProductoConMarca;
}) {
  const [state, formAction, pending] = useActionState(accion, {});
  const inputFotoRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);

  function handleCambiarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) {
      setPreviewUrl(null);
      setNombreArchivo(null);
      return;
    }
    setNombreArchivo(archivo.name);
    setPreviewUrl(URL.createObjectURL(archivo));
  }

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="codigo" className="text-sm font-medium">
            Código *
          </label>
          <Input
            id="codigo"
            name="codigo"
            required
            defaultValue={producto?.codigo}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="marca" className="text-sm font-medium">
            Marca
          </label>
          <Input
            id="marca"
            name="marca"
            list="marcas-existentes"
            autoComplete="off"
            placeholder="Elegí una existente o escribí una nueva"
            defaultValue={producto?.marcas?.nombre ?? ""}
          />
          <datalist id="marcas-existentes">
            {marcas.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className="text-sm font-medium">
          Nombre *
        </label>
        <Input
          id="nombre"
          name="nombre"
          required
          defaultValue={producto?.nombre}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="descripcion" className="text-sm font-medium">
          Descripción
        </label>
        <Textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          defaultValue={producto?.descripcion ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="categoria_id" className="text-sm font-medium">
          Categoría
        </label>
        <Select
          id="categoria_id"
          name="categoria_id"
          defaultValue={producto?.categoria_id ?? ""}
        >
          <option value="">Sin categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="precio" className="text-sm font-medium">
            Precio Catálogo (con IVA incluido) *
          </label>
          <Input
            id="precio"
            name="precio"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={producto?.precio_lista2}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="iva_porcentaje" className="text-sm font-medium">
            % IVA
          </label>
          <Select
            id="iva_porcentaje"
            name="iva_porcentaje"
            defaultValue={producto?.iva_porcentaje ?? 21}
          >
            <option value="21">21%</option>
            <option value="10.5">10.5%</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Foto del producto</span>

        <div className="flex items-center gap-4">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview local, no es una URL remota
            <img
              src={previewUrl}
              alt="Vista previa"
              className="h-24 w-24 rounded border border-roca-negro/10 object-contain"
            />
          ) : producto?.foto_url ? (
            <Image
              src={producto.foto_url}
              alt={producto.nombre}
              width={96}
              height={96}
              className="h-24 w-24 rounded border border-roca-negro/10 object-contain"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded border border-dashed border-roca-negro/20 text-center text-xs text-roca-negro/40">
              Sin foto
            </div>
          )}

          <div className="flex flex-col gap-1">
            <input
              ref={inputFotoRef}
              id="foto"
              name="foto"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCambiarFoto}
            />
            <Button
              type="button"
              variante="outline"
              onClick={() => inputFotoRef.current?.click()}
            >
              {producto?.foto_url || nombreArchivo
                ? "Cambiar foto"
                : "Subir foto"}
            </Button>
            {nombreArchivo && (
              <span className="max-w-[200px] truncate text-xs text-roca-negro/60">
                {nombreArchivo}
              </span>
            )}
            {producto && !nombreArchivo && (
              <span className="text-xs text-roca-negro/40">
                Dejalo así para no cambiar la foto actual
              </span>
            )}
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="stock_disponible"
          defaultChecked={producto?.stock_disponible ?? true}
        />
        Con stock disponible
      </label>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : producto ? "Guardar cambios" : "Crear producto"}
      </Button>
    </form>
  );
}
