"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RUTA_POR_ROL } from "@/types";

const MENSAJES_ERROR: Record<string, string> = {
  "cuenta-inactiva":
    "Tu cuenta está desactivada. Contactá a tu administrador.",
};

export function LoginForm({
  next,
  errorInicial,
}: {
  next?: string;
  errorInicial?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(
    errorInicial ? MENSAJES_ERROR[errorInicial] ?? null : null
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const supabase = createClient();

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !signInData.user) {
      setError("Email o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    const { data: perfil, error: perfilError } = await supabase
      .from("perfiles")
      .select("rol, activo")
      .eq("id", signInData.user.id)
      .single();

    if (perfilError || !perfil) {
      setError("No se encontró un perfil asociado a esta cuenta.");
      await supabase.auth.signOut();
      setCargando(false);
      return;
    }

    if (!perfil.activo) {
      setError("Tu cuenta está desactivada. Contactá a tu administrador.");
      await supabase.auth.signOut();
      setCargando(false);
      return;
    }

    router.push(next || RUTA_POR_ROL[perfil.rol]);
    router.refresh();
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

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={cargando} className="mt-2 w-full">
        {cargando ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
