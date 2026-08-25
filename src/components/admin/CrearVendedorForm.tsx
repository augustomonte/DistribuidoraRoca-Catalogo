"use client";

import { useActionState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { crearVendedor } from "@/lib/actions/usuarios";

export function CrearVendedorForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(crearVendedor, {});
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
        Nuevo vendedor
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="v_nombre" className="text-sm font-medium">
            Nombre *
          </label>
          <Input id="v_nombre" name="nombre" required />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="v_apellido" className="text-sm font-medium">
            Apellido
          </label>
          <Input id="v_apellido" name="apellido" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="v_dni" className="text-sm font-medium">
            DNI
          </label>
          <Input id="v_dni" name="dni" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="v_telefono" className="text-sm font-medium">
            Teléfono
          </label>
          <Input id="v_telefono" name="telefono" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="v_email" className="text-sm font-medium">
            Email *
          </label>
          <Input id="v_email" name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="v_password" className="text-sm font-medium">
            Contraseña temporal *
          </label>
          <Input
            id="v_password"
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
          Vendedor creado correctamente.
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Creando..." : "Crear vendedor"}
      </Button>
    </form>
  );
}
