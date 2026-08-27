"use client";

import { useActionState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { crearAdmin } from "@/lib/actions/usuarios";

export function CrearAdminForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(crearAdmin, {});
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
        Nuevo administrador
      </h2>
      <p className="-mt-2 text-xs text-roca-negro/50">
        Un administrador tiene acceso total: productos, marcas, vendedores,
        ferreterías y puede crear otros administradores.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="a_nombre" className="text-sm font-medium">
            Nombre *
          </label>
          <Input id="a_nombre" name="nombre" required />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="a_apellido" className="text-sm font-medium">
            Apellido
          </label>
          <Input id="a_apellido" name="apellido" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="a_telefono" className="text-sm font-medium">
            Teléfono
          </label>
          <Input id="a_telefono" name="telefono" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="a_email" className="text-sm font-medium">
            Email *
          </label>
          <Input id="a_email" name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="a_password" className="text-sm font-medium">
            Contraseña temporal *
          </label>
          <Input
            id="a_password"
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
          Administrador creado correctamente.
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Creando..." : "Crear administrador"}
      </Button>
    </form>
  );
}
