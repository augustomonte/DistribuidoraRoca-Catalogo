import type { Database } from "@/types/database.types";

export type Perfil = Database["public"]["Tables"]["perfiles"]["Row"];
export type Producto = Database["public"]["Tables"]["productos"]["Row"];
export type ProductoVista = Database["public"]["Views"]["productos_vista"]["Row"];
export type Categoria = Database["public"]["Tables"]["categorias"]["Row"];
export type Marca = Database["public"]["Tables"]["marcas"]["Row"];

export const RUTA_POR_ROL: Record<Perfil["rol"], string> = {
  admin: "/admin",
  vendedor: "/vendedor",
  ferreteria: "/catalogo",
};
