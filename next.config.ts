import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : "";

const nextConfig: NextConfig = {
  // Permite abrir el servidor de desarrollo desde otros dispositivos de tu
  // misma red Wi-Fi (celular, otra PC) usando la IP en vez de localhost.
  allowedDevOrigins: ["192.168.0.233", "192.168.0.*"],
  experimental: {
    serverActions: {
      // Por defecto es 1 MB y la actualización masiva de precios sube un
      // Excel de un catálogo completo (~12.000 filas). 4 MB deja margen sin
      // pasar el tope de 4,5 MB que Vercel le pone a cualquier pedido.
      bodySizeLimit: "4mb",
    },
  },
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
