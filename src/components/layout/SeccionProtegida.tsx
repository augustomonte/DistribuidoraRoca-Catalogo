import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BannerDev } from "@/components/layout/BannerDev";
import { CarritoProvider } from "@/lib/carrito";
import type { Perfil } from "@/types";

/**
 * Shell de toda sección logueada (admin, vendedor, catalogo, perfil,
 * carrito, pedidos): sidebar de navegación + contenido. Sin Footer acá
 * a propósito — es un elemento de sitio público (home, empresa), no de
 * panel; ver src/components/layout/Footer.tsx.
 */
export function SeccionProtegida({
  perfil,
  children,
}: {
  perfil: Perfil;
  children: ReactNode;
}) {
  return (
    <CarritoProvider>
      {/*
        h-dvh (no flex-1 suelto): así el alto de esta columna es
        exactamente el viewport, se lo coma o no el BannerDev. AppShell
        recibe el resto vía flex-1 + min-h-0, y es EL adentro el que
        scrollea (el sidebar se queda fijo), no la página entera.
      */}
      <div className="flex h-dvh flex-col">
        <BannerDev />
        <AppShell perfil={perfil}>{children}</AppShell>
      </div>
    </CarritoProvider>
  );
}
