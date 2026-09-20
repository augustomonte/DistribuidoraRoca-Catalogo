"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { actualizarPerfil } from "@/lib/actions/perfil";
import { PROVINCIAS_ARGENTINA } from "@/lib/provincias";
import type { Perfil } from "@/types";

export function EditarPerfilForm({
  perfil,
  email,
}: {
  perfil: Perfil;
  email: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(actualizarPerfil, {});
  const esCliente = perfil.rol === "cliente";

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-tema-tinta/10 bg-tema-papel p-5"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Email</label>
        <Input value={email} disabled readOnly />
      </div>

      {esCliente && (
        <div className="flex flex-col gap-1">
          <label htmlFor="p_razon_social" className="text-sm font-medium">
            Razón social *
          </label>
          <Input
            id="p_razon_social"
            name="razon_social"
            defaultValue={perfil.razon_social ?? ""}
            required
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="p_nombre" className="text-sm font-medium">
            {esCliente ? "Nombre de contacto" : "Nombre"} *
          </label>
          <Input
            id="p_nombre"
            name="nombre"
            defaultValue={perfil.nombre}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="p_apellido" className="text-sm font-medium">
            Apellido
          </label>
          <Input
            id="p_apellido"
            name="apellido"
            defaultValue={perfil.apellido ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="p_telefono" className="text-sm font-medium">
            Teléfono
          </label>
          <Input
            id="p_telefono"
            name="telefono"
            defaultValue={perfil.telefono ?? ""}
          />
        </div>
      </div>

      {esCliente && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label htmlFor="p_direccion" className="text-sm font-medium">
              Dirección
            </label>
            <Input
              id="p_direccion"
              name="direccion"
              defaultValue={perfil.direccion ?? ""}
              placeholder="Calle y número"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="p_ciudad" className="text-sm font-medium">
              Ciudad
            </label>
            <Input
              id="p_ciudad"
              name="ciudad"
              defaultValue={perfil.ciudad ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="p_provincia" className="text-sm font-medium">
              Provincia
            </label>
            <Select
              id="p_provincia"
              name="provincia"
              defaultValue={perfil.provincia ?? ""}
            >
              <option value="">Sin especificar</option>
              {PROVINCIAS_ARGENTINA.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Perfil actualizado.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-tema-tinta/10 pt-4">
        <Link
          href="/actualizar-contrasena"
          className="text-sm font-medium text-tema-primario hover:underline"
        >
          Cambiar contraseña
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
