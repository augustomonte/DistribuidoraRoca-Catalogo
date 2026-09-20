import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { RUTA_POR_ROL } from "@/types";
import { devSinLogin, rolDevSinLogin } from "@/lib/dev-sin-login";
import type { RolUsuario } from "@/types/database.types";

const RUTAS_POR_PREFIJO: { prefijo: string; rolesPermitidos: RolUsuario[] }[] = [
  { prefijo: "/admin", rolesPermitidos: ["admin"] },
  { prefijo: "/vendedor", rolesPermitidos: ["admin", "vendedor"] },
  { prefijo: "/catalogo", rolesPermitidos: ["admin", "vendedor", "cliente"] },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Nunca confiar en un "x-perfil" que venga del pedido original: es un
  // header interno que solo esta misma función debe poder fijar, más abajo,
  // después de resolver el perfil real contra la sesión. Si no lo borramos
  // acá, un cliente sin sesión podría mandarlo con un rol inventado (ej.
  // "admin") y colarlo en cualquier respuesta que no lo pise explícitamente
  // (por ejemplo, cuando no hay usuario logueado).
  request.headers.delete("x-perfil");

  // TEMPORAL — modo desarrollo sin login (ver src/lib/dev-sin-login.ts).
  // Dejamos pasar todo sin mirar sesión ni rol. getPerfilActual() devuelve
  // un perfil simulado, así que los layouts protegidos siguen funcionando.
  if (devSinLogin) {
    // En este modo el login no tiene sentido: si caés ahí (por ejemplo
    // desde el botón "Iniciar sesión" de la home) te mandamos derecho al
    // panel del rol que estés simulando, en vez de mostrarte el formulario.
    if (pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = RUTA_POR_ROL[rolDevSinLogin ?? "admin"];
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const { supabase, supabaseResponse, user } = await updateSession(request);

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
    // Traemos el perfil completo (no solo rol/activo) para poder pasarlo
    // a los Server Components vía header y evitar que vuelvan a
    // consultarlo ellos mismos (getPerfilActual hacía la misma consulta
    // dos veces en cada navegación).
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("*")
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

    // Reenviamos el perfil ya resuelto como header interno (se sobreescribe
    // acá, así que un cliente no puede falsificarlo) para que
    // getPerfilActual() lo lea directo sin volver a golpear Supabase.
    const headers = new Headers(request.headers);
    headers.set("x-perfil", JSON.stringify(perfil));

    const response = NextResponse.next({ request: { headers } });
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    return response;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
