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
 * Sin SMTP propio, Supabase usa su template default: el link del mail
 * NO apunta acá directo, apunta al endpoint /auth/v1/verify de Supabase,
 * que verifica el token con su propio server y RECIÉN AHÍ redirige acá
 * con un parámetro "code" (comprobado pegándole al link real: el cliente
 * de este proyecto tiene flowType "pkce" por default en @supabase/ssr).
 * Se resuelve con exchangeCodeForSession, no con verifyOtp+token_hash
 * (ese es el flujo para cuando el link de email apunta directo a un
 * confirm propio, con un template custom — lo dejamos de respaldo por si
 * el día de mañana se configura SMTP y se customiza el template así).
 *
 * Motivo típico de "link inválido" en la práctica: varios clientes de
 * mail (Gmail, Outlook) prescanean los links por seguridad antes de que
 * el usuario haga clic, y gastan el token de un solo uso. No es un bug
 * de acá; si pasa seguido, la migración a un template con botón propio
 * (en vez de linkear directo al endpoint de verify) lo evita.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";

  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
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
