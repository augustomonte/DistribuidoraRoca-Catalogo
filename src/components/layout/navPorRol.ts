import { cliente } from "@/config/cliente";
import type { NombreIcono } from "@/components/layout/iconos";
import type { RolUsuario } from "@/types/database.types";

export interface ItemNav {
  href: string;
  label: string;
  icono: NombreIcono;
}

export interface GrupoNav {
  /** null = sin título, para roles con pocos ítems (vendedor, cliente). */
  titulo: string | null;
  items: ItemNav[];
}

/**
 * Navegación agrupada por rol. Admin tiene bastantes secciones (y va a
 * seguir creciendo), por eso está agrupada; vendedor y cliente, con 2-3
 * ítems, no lo necesitan. "Mi perfil" se agrega aparte en el Sidebar,
 * no vive acá: es común a los tres roles.
 */
export function obtenerNavPorRol(rol: RolUsuario): GrupoNav[] {
  switch (rol) {
    case "admin":
      return [
        {
          titulo: "Catálogo",
          items: [
            { href: "/admin", label: "Productos", icono: "productos" },
            { href: "/admin/marcas", label: "Marcas", icono: "marcas" },
            {
              href: "/admin/categorias",
              label: "Categorías",
              icono: "categorias",
            },
            { href: "/admin/precios", label: "Precios", icono: "precios" },
          ],
        },
        {
          titulo: "Cuentas",
          items: [
            {
              href: "/admin/administradores",
              label: "Administradores",
              icono: "administradores",
            },
            { href: "/admin/usuarios", label: "Usuarios", icono: "usuarios" },
          ],
        },
        {
          titulo: "General",
          items: [
            { href: "/catalogo", label: "Ver catálogo", icono: "catalogo" },
            { href: "/pedidos", label: "Pedidos", icono: "pedidos" },
          ],
        },
      ];
    case "vendedor":
      return [
        {
          titulo: null,
          items: [
            { href: "/vendedor", label: "Catálogo", icono: "catalogo" },
            {
              href: "/vendedor/clientes",
              label: `Mis ${cliente.etiquetas.clientePlural.toLowerCase()}`,
              icono: "clientes",
            },
            { href: "/pedidos", label: "Pedidos", icono: "pedidos" },
          ],
        },
      ];
    case "cliente":
      return [
        {
          titulo: null,
          items: [
            { href: "/catalogo", label: "Catálogo", icono: "catalogo" },
            { href: "/carrito", label: "Carrito", icono: "carrito" },
            { href: "/pedidos", label: "Mis pedidos", icono: "pedidos" },
          ],
        },
      ];
  }
}
