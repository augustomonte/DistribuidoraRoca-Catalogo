"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { cliente } from "@/config/cliente";
import { obtenerNavPorRol, type GrupoNav } from "@/components/layout/navPorRol";
import { Icono } from "@/components/layout/iconos";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { useCarrito } from "@/lib/carrito";
import type { Perfil } from "@/types";

export function Sidebar({
  perfil,
  onNavegar,
}: {
  perfil: Perfil;
  /** Cierra el drawer en mobile al navegar; no hace nada en desktop. */
  onNavegar?: () => void;
}) {
  const pathname = usePathname();
  const { cantidadTotal } = useCarrito();
  const grupos = obtenerNavPorRol(perfil.rol);

  const inicial = perfil.nombre?.[0]?.toUpperCase() ?? "?";
  const nombreCompleto = `${perfil.nombre} ${perfil.apellido ?? ""}`.trim();
  const etiquetaRol =
    perfil.rol === "cliente" ? cliente.etiquetas.clienteSingular : perfil.rol;

  return (
    <div className="flex h-full w-64 flex-col border-r border-tema-tinta/10 bg-tema-papel">
      <Link
        href="/"
        className="flex items-center gap-2.5 border-b border-tema-tinta/10 px-4 py-3.5"
      >
        <Image
          src={cliente.marca.logo.isotipo}
          alt={cliente.marca.nombreCorto}
          width={cliente.marca.logo.isotipoLado}
          height={cliente.marca.logo.isotipoLado}
          className="h-7 w-7 rounded-md"
        />
        <span className="truncate text-sm font-semibold text-tema-tinta">
          {cliente.marca.nombreCorto}
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2.5 py-3">
        {grupos.map((grupo, i) => (
          <GrupoDeNav
            key={grupo.titulo ?? i}
            grupo={grupo}
            pathname={pathname}
            onNavegar={onNavegar}
            badges={{ "/carrito": cantidadTotal }}
          />
        ))}

        <div className="mt-auto flex flex-col gap-1">
          <Link
            href="/perfil"
            onClick={onNavegar}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors duration-150",
              esActivo(pathname, "/perfil")
                ? "bg-tema-primario/10 text-tema-primario"
                : "text-tema-tinta/70 hover:bg-tema-tinta/5 hover:text-tema-tinta"
            )}
          >
            <Icono nombre="perfil" className="h-4 w-4 flex-shrink-0" />
            Mi perfil
          </Link>
        </div>
      </nav>

      <div className="flex items-center gap-2.5 border-t border-tema-tinta/10 p-2.5">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-tema-secundario text-xs font-bold text-tema-tinta">
          {inicial}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-tema-tinta">
            {nombreCompleto}
          </p>
          <p className="truncate text-xs uppercase tracking-wide text-tema-tinta/40">
            {etiquetaRol}
          </p>
        </div>
        <LogoutButton compacto />
      </div>
    </div>
  );
}

function esActivo(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function GrupoDeNav({
  grupo,
  pathname,
  onNavegar,
  badges,
}: {
  grupo: GrupoNav;
  pathname: string;
  onNavegar?: () => void;
  badges: Record<string, number>;
}) {
  // Coincidencia más específica gana (ej: /admin/marcas sobre /admin).
  const activoHref = [...grupo.items]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => esActivo(pathname, item.href))?.href;

  return (
    <div className="flex flex-col gap-0.5">
      {grupo.titulo && (
        <p className="px-2.5 pb-1 text-xs font-semibold uppercase tracking-wide text-tema-tinta/40">
          {grupo.titulo}
        </p>
      )}
      {grupo.items.map((item) => {
        const activo = item.href === activoHref;
        const badge = badges[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavegar}
            aria-current={activo ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors duration-150",
              activo
                ? "bg-tema-primario/10 text-tema-primario"
                : "text-tema-tinta/70 hover:bg-tema-tinta/5 hover:text-tema-tinta"
            )}
          >
            <Icono nombre={item.icono} className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {!!badge && (
              <span className="rounded-full bg-tema-primario px-1.5 py-0.5 text-[10px] font-bold leading-none text-tema-papel">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
