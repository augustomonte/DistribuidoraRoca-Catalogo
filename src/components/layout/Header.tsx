import { Logo } from "@/components/layout/Logo";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { NavList } from "@/components/layout/NavList";
import { cliente } from "@/config/cliente";
import type { Perfil } from "@/types";

const NAV_POR_ROL: Record<Perfil["rol"], { href: string; label: string }[]> = {
  admin: [
    { href: "/admin", label: "Productos" },
    { href: "/admin/administradores", label: "Administradores" },
    { href: "/admin/usuarios", label: "Usuarios" },
    { href: "/admin/marcas", label: "Marcas" },
    { href: "/admin/categorias", label: "Categorías" },
    { href: "/catalogo", label: "Ver catálogo" },
  ],
  vendedor: [
    { href: "/vendedor", label: "Catálogo" },
    {
      href: "/vendedor/clientes",
      label: `Mis ${cliente.etiquetas.clientePlural.toLowerCase()}`,
    },
  ],
  cliente: [{ href: "/catalogo", label: "Catálogo" }],
};

export function Header({ perfil }: { perfil: Perfil }) {
  const nav = NAV_POR_ROL[perfil.rol];

  return (
    <header className="sticky top-0 z-40 border-b border-tema-tinta/10 bg-tema-papel">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />

        <NavList items={nav} />

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-tema-tinta/60 sm:inline">
            {perfil.nombre} {perfil.apellido ?? ""} ·{" "}
            <span className="font-semibold uppercase">
              {perfil.rol === "cliente"
                ? cliente.etiquetas.clienteSingular
                : perfil.rol}
            </span>
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
