import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { RUTA_POR_ROL } from "@/types";
import type { RolUsuario } from "@/types/database.types";

const RUTAS_POR_PREFIJO: { prefijo: string; rolesPermitidos: RolUsuario[] }[] = [
  { prefijo: "/admin", rolesPermitidos: ["admin"] },
  { prefijo: "/vendedor", rolesPermitidos: ["admin", "vendedor"] },
  { prefijo: "/catalogo", rolesPermitidos: ["admin", "vendedor", "ferreteria"] },
];

export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const rutaProtegida = RUTAS_POR_PREFIJO.find((r) =>
    pathname.startsWith(r.prefijo)
  );

  // Rutas protegidas sin sesión -> login
  if (rutaProtegida && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol, activo")
      .eq("id", user.id)
      .single();

    // Cuenta desactivada o sin perfil -> cerrar sesión y volver a login
    if (!perfil || !perfil.activo) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "cuenta-inactiva");
      return NextResponse.redirect(url);
    }

    // Usuario logueado que entra a /login -> mandarlo a su panel
    if (pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = RUTA_POR_ROL[perfil.rol];
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Rol sin permiso para esta sección -> mandarlo a su panel
    if (rutaProtegida && !rutaProtegida.rolesPermitidos.includes(perfil.rol)) {
      const url = request.nextUrl.clone();
      url.pathname = RUTA_POR_ROL[perfil.rol];
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
