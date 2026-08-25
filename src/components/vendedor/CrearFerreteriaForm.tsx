"use client";

import { useActionState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { crearFerreteria } from "@/lib/actions/usuarios";

export function CrearFerreteriaForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(crearFerreteria, {});
  const formRef = useRef<HTMLFormElement>(null);

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
      className="flex flex-col gap-4 rounded-lg border border-roca-negro/10 bg-roca-blanco p-5"
    >
      <h2 className="text-base font-semibold text-roca-negro">
        Nueva ferretería
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="f_razon_social" className="text-sm font-medium">
            Razón social *
          </label>
          <Input id="f_razon_social" name="razon_social" required />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="f_nombre" className="text-sm font-medium">
            Nombre de contacto *
          </label>
          <Input id="f_nombre" name="nombre" required />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="f_telefono" className="text-sm font-medium">
            Teléfono
          </label>
          <Input id="f_telefono" name="telefono" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="f_email" className="text-sm font-medium">
            Email *
          </label>
          <Input id="f_email" name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="f_password" className="text-sm font-medium">
            Contraseña temporal *
          </label>
          <Input
            id="f_password"
            name="password"
            type="text"
            minLength={6}
            required
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Ferretería creada correctamente.
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Creando..." : "Crear ferretería"}
      </Button>
    </form>
  );
}
