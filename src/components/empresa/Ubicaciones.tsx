import { cliente } from "@/config/cliente";

export function Ubicaciones() {
  const UBICACIONES = cliente.ubicaciones;

  if (UBICACIONES.length === 0) return null;

  return (
    <section className="bg-tema-papel px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-center text-2xl font-extrabold tracking-tight text-tema-tinta sm:text-3xl">
          Dónde encontrarnos
        </h2>

        <div
          className={
            UBICACIONES.length > 1
              ? "grid grid-cols-1 gap-6 md:grid-cols-2"
              : "mx-auto grid max-w-3xl grid-cols-1 gap-6"
          }
        >
          {UBICACIONES.map((ubicacion) => (
            <div
              key={ubicacion.titulo}
              className="flex flex-col gap-5 rounded-2xl border border-tema-tinta/10 bg-tema-papel p-6 shadow-md md:flex-row md:items-center"
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-tema-tinta">
                  {ubicacion.titulo}
                </h3>
                <p className="mt-2 text-sm text-tema-tinta/70">
                  {ubicacion.direccion}
                </p>
                <p className="mt-1 text-sm text-tema-tinta/70">
                  {ubicacion.telefono}
                </p>
              </div>

              <div className="h-[220px] w-full overflow-hidden rounded-xl md:w-1/2">
                <iframe
                  src={ubicacion.mapaUrl}
                  loading="lazy"
                  title={`Mapa: ${ubicacion.titulo}`}
                  className="h-full w-full border-0"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
