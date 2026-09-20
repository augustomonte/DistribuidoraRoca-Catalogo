import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Route Handler al que apunta el link de los emails de Supabase Auth
 * (por ahora, recuperar contraseña). Verifica el token de un solo uso
 * del link y, si es válido, deja la sesión en las cookies antes de
 * mandar al usuario a completar la acción (ej. cargar la contraseña
 * nueva).
 *
 * Usa verifyOtp con token_hash, que es el flujo que corresponde a links
 * de email con @supabase/ssr. exchangeCodeForSession (con un parámetro
 * "code") es para el flujo OAuth, no para este caso.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const url = new URL("/login", origin);
  url.searchParams.set("error", "link-invalido");
  return NextResponse.redirect(url);
}
