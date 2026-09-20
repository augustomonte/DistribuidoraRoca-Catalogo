import { devSinLogin, rolDevSinLogin } from "@/lib/dev-sin-login";

/**
 * Barra de aviso del modo desarrollo sin login. No se renderiza nunca
 * fuera de ese modo, así que en producción no existe.
 */
export function BannerDev() {
  if (!devSinLogin) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-400 px-4 py-1.5 text-center text-xs font-semibold text-amber-950">
      Modo desarrollo sin login — simulando rol{" "}
      <span className="uppercase">{rolDevSinLogin}</span>. Para desactivarlo,
      sacá DEV_SIN_LOGIN de .env.local.
    </div>
  );
}
