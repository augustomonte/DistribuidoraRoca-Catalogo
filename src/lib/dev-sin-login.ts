import type { Perfil } from "@/types";
import type { RolUsuario } from "@/types/database.types";

/**
 * ─────────────────────────────────────────────────────────────────────
 * MODO DESARROLLO SIN LOGIN — TEMPORAL
 * ─────────────────────────────────────────────────────────────────────
 *
 * Permite navegar el catálogo y los paneles sin iniciar sesión, para
 * iterar cómodamente sobre la interfaz.
 *
 * Cómo se activa: poner en `.env.local`
 *
 *     DEV_SIN_LOGIN=admin
 *
 * (valores posibles: admin, vendedor, cliente)
 *
 * Cómo se desactiva: borrar esa línea, o dejarla vacía. Reiniciar el
 * `npm run dev` después de tocarla — las variables de entorno se leen
 * al arrancar.
 *
 * DOBLE CANDADO: además de la variable, exige NODE_ENV === "development".
 * Un `npm run build` / `npm start` lo ignora siempre, así que no hay forma
 * de que esto quede activo en producción por olvido.
 *
 * Cuando el proyecto esté listo, este archivo se borra junto con las tres
 * referencias que lo usan: src/proxy.ts, src/lib/auth.ts y
 * src/lib/supabase/server.ts. Buscá "devSinLogin" para encontrarlas.
 */

const ROLES_VALIDOS: RolUsuario[] = ["admin", "vendedor", "cliente"];

function leerRol(): RolUsuario | null {
  if (process.env.NODE_ENV !== "development") return null;

  const valor = process.env.DEV_SIN_LOGIN?.trim().toLowerCase();
  if (!valor) return null;

  return ROLES_VALIDOS.includes(valor as RolUsuario)
    ? (valor as RolUsuario)
    : null;
}

/** Rol que se simula, o null si el modo está apagado. */
export const rolDevSinLogin: RolUsuario | null = leerRol();

/** true cuando el modo está activo. */
export const devSinLogin: boolean = rolDevSinLogin !== null;

/**
 * Perfil falso que se le entrega a los Server Components en este modo.
 * No existe en la base: solo sirve para que los layouts y el header
 * tengan algo que mostrar.
 */
export function perfilDev(): Perfil {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    rol: rolDevSinLogin ?? "admin",
    nombre: "Modo",
    apellido: "Desarrollo",
    razon_social: null,
    telefono: null,
    dni: null,
    direccion: null,
    ciudad: null,
    provincia: null,
    creado_por: null,
    activo: true,
    created_at: new Date().toISOString(),
  };
}
