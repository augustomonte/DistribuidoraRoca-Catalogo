import fs from "node:fs";
import path from "node:path";

const EXTENSIONES_VALIDAS = [".png", ".jpg", ".jpeg", ".webp", ".svg"];

function obtenerLogosDeMarcas(): string[] {
  const carpeta = path.join(process.cwd(), "public", "marcas");

  let archivos: string[] = [];
  try {
    archivos = fs.readdirSync(carpeta);
  } catch {
    return [];
  }

  return archivos
    .filter((archivo) =>
      EXTENSIONES_VALIDAS.includes(path.extname(archivo).toLowerCase())
    )
    .sort((a, b) => a.localeCompare(b, "es"))
    .map((archivo) => `/marcas/${archivo}`);
}

export function MarcasMarquee() {
  const logos = obtenerLogosDeMarcas();

  if (logos.length === 0) return null;

  // Se duplica la lista para que el loop de -50% sea imperceptible
  const logosDuplicados = [...logos, ...logos];

  return (
    <section className="bg-roca-gris py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-10 text-center text-2xl font-extrabold tracking-tight text-roca-negro sm:text-3xl">
          Marcas que trabajamos
        </h2>
      </div>

      <div className="marquee-viewport overflow-hidden">
        <div className="marquee-track flex w-max items-center gap-20 sm:gap-24">
          {logosDuplicados.map((logo, i) => {
            const esDuplicado = i >= logos.length;
            const nombre = path
              .basename(logo, path.extname(logo))
              .replace(/[-_]/g, " ");

            return (
              <div
                key={`${logo}-${i}`}
                className="flex h-[60px] w-auto shrink-0 items-center justify-center"
                aria-hidden={esDuplicado || undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- ancho variable por logo, sin distorsionar el aspect ratio real */}
                <img
                  src={logo}
                  alt={esDuplicado ? "" : nombre}
                  className="h-[60px] w-auto object-contain"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
