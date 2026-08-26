import { Logo } from "@/components/layout/Logo";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { NavList } from "@/components/layout/NavList";
import type { Perfil } from "@/types";

const NAV_POR_ROL: Record<Perfil["rol"], { href: string; label: string }[]> = {
  admin: [
    { href: "/admin", label: "Productos" },
    { href: "/admin/vendedores", label: "Vendedores" },
    { href: "/admin/ferreterias", label: "Ferreterías" },
    { href: "/admin/marcas", label: "Marcas" },
    { href: "/catalogo", label: "Ver catálogo" },
  ],
  vendedor: [
    { href: "/vendedor", label: "Catálogo" },
    { href: "/vendedor/ferreterias", label: "Mis ferreterías" },
  ],
  ferreteria: [{ href: "/catalogo", label: "Catálogo" }],
};

export function Header({ perfil }: { perfil: Perfil }) {
  const nav = NAV_POR_ROL[perfil.rol];

  return (
    <header className="sticky top-0 z-40 border-b border-roca-negro/10 bg-roca-blanco">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />

        <NavList items={nav} />

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-roca-negro/60 sm:inline">
            {perfil.nombre} {perfil.apellido ?? ""} ·{" "}
            <span className="font-semibold uppercase">{perfil.rol}</span>
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
