"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function RecuperarContrasenaForm() {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const supabase = createClient();

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirmar?next=/actualizar-contrasena`,
      });
    } catch {
      setError("No pudimos procesar el pedido. Probá de nuevo en un rato.");
      setCargando(false);
      return;
    }

    // Mostramos siempre el mismo mensaje, exista o no una cuenta con ese
    // email: así no revelamos qué emails están registrados.
    setEnviado(true);
    setCargando(false);
  }

  if (enviado) {
    return (
      <p className="rounded-md bg-tema-fondo px-3 py-3 text-sm text-tema-tinta/70">
        Si existe una cuenta con ese email, te enviamos un link para
        restablecer tu contraseña.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={cargando} className="mt-2 w-full">
        {cargando ? "Enviando..." : "Enviar link de recuperación"}
      </Button>
    </form>
  );
}
