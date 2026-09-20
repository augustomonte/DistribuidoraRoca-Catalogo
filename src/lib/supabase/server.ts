import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import { devSinLogin } from "@/lib/dev-sin-login";

export async function createClient(): Promise<SupabaseClient<Database>> {
  // TEMPORAL — modo desarrollo sin login (ver src/lib/dev-sin-login.ts).
  // Sin sesión no hay cookies, así que el cliente anónimo chocaría contra
  // las policies de RLS y todas las consultas volverían vacías. Usamos el
  // cliente de servicio para poder navegar. Solo corre en desarrollo.
  if (devSinLogin) {
    return createAdminClient();
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll fue llamado desde un Server Component sin poder escribir cookies.
            // Se puede ignorar si hay middleware refrescando la sesión.
          }
        },
      },
    }
  );
}
