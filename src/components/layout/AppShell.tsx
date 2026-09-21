"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sidebar } from "@/components/layout/Sidebar";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Icono } from "@/components/layout/iconos";
import { cliente } from "@/config/cliente";
import { cn } from "@/lib/utils";
import type { Perfil } from "@/types";

/**
 * Sidebar fijo en desktop (>= lg); en mobile es un drawer que se abre
 * con el botón de la barra superior. El estado de abierto/cerrado vive
 * acá porque tiene que coordinar tres piezas (botón, drawer, backdrop).
 */
export function AppShell({
  perfil,
  children,
}: {
  perfil: Perfil;
  children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    // min-h-0 es lo que deja que este row respete el alto que le da
    // SeccionProtegida (h-dvh) en vez de estirarse con el contenido.
    <div className="flex min-h-0 flex-1">
      {abierto && (
        <div
          className="fixed inset-0 z-30 bg-tema-tinta/40 lg:hidden"
          onClick={() => setAbierto(false)}
          aria-hidden="true"
        />
      )}

      {/*
        Mobile: overlay fijo al viewport (position: fixed no depende del
        alto del padre, por eso acá "h-screen" nunca fue un problema).
        Desktop (lg): vuelve al flujo normal con h-full, tomando el alto
        exacto de este row — no el del viewport entero.
      */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 -translate-x-full transition-transform duration-200 ease-out",
          "lg:static lg:z-auto lg:h-full lg:translate-x-0",
          abierto && "translate-x-0"
        )}
      >
        <Sidebar perfil={perfil} onNavegar={() => setAbierto(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-tema-tinta/10 bg-tema-papel px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setAbierto(true)}
            aria-label="Abrir menú"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-tema-tinta/15 text-tema-tinta"
          >
            <Icono nombre="menu" className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={cliente.marca.logo.isotipo}
              alt={cliente.marca.nombreCorto}
              width={cliente.marca.logo.isotipoLado}
              height={cliente.marca.logo.isotipoLado}
              className="h-7 w-7 rounded-md"
            />
            <span className="text-sm font-semibold text-tema-tinta">
              {cliente.marca.nombreCorto}
            </span>
          </Link>
        </div>

        {/* El que scrollea es este panel, no la página: así el sidebar
            se queda fijo con una tabla de 50 filas debajo. */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
            {children}
          </div>
        </main>
      </div>

      <WhatsAppButton />
    </div>
  );
}
