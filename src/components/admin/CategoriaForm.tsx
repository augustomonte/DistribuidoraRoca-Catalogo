"use client";

import { useActionState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { CategoriaFormState } from "@/lib/actions/categorias";
import type { Categoria } from "@/types";

export function CategoriaForm({
  accion,
  categoria,
}: {
  accion: (
    prevState: CategoriaFormState,
    formData: FormData
  ) => Promise<CategoriaFormState>;
  categoria?: Categoria;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(accion, {});
  const formRef = useRef<HTMLFormElement>(null);
  const editando = Boolean(categoria);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex max-w-xl flex-col gap-4 rounded-lg border border-tema-tinta/10 bg-tema-papel p-5"
    >
      <h2 className="text-base font-semibold text-tema-tinta">
        {editando ? "Editar categoría" : "Nueva categoría"}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="cat_nombre" className="text-sm font-medium">
            Nombre *
          </label>
          <Input
            id="cat_nombre"
            name="nombre"
            required
            defaultValue={categoria?.nombre}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="cat_orden" className="text-sm font-medium">
            Orden{editando ? " *" : ""}
          </label>
          <Input
            id="cat_orden"
            name="orden"
            type="number"
            min={0}
            step={1}
            required={editando}
            defaultValue={categoria?.orden}
            placeholder={editando ? undefined : "Al final"}
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-tema-tinta/50">
        El orden define en qué posición aparece la categoría en los filtros y
        formularios: primero las de número más bajo.
      </p>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Categoría creada correctamente.
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending
          ? "Guardando..."
          : editando
            ? "Guardar cambios"
            : "Crear categoría"}
      </Button>
    </form>
  );
}
