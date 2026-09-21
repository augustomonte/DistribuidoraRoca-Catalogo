"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Icono } from "@/components/layout/iconos";

export function LogoutButton({ compacto = false }: { compacto?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (compacto) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-tema-tinta/15 text-tema-tinta/60 hover:bg-tema-tinta/5 hover:text-tema-tinta"
      >
        <Icono nombre="salir" className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <Button variante="outline" onClick={handleLogout}>
      Cerrar sesión
    </Button>
  );
}
