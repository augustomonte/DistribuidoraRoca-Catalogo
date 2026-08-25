interface Ubicacion {
  titulo: string;
  direccion: string;
  telefono: string;
  mapaUrl: string;
}

const UBICACIONES: Ubicacion[] = [
  {
    titulo: "Venta Mayorista y Distribución",
    direccion: "Ayacucho 1139, Merlo, Buenos Aires",
    telefono: "0220 482 2242",
    mapaUrl:
      "https://maps.google.com/maps?q=Ayacucho+1139+Merlo+Buenos+Aires+Argentina&output=embed",
  },
  {
    titulo: "Ferretería Roca — Venta al Público",
    direccion: "Av. Calle Real 1225, Merlo, Buenos Aires",
    telefono: "0220 485 7790",
    mapaUrl:
      "https://maps.google.com/maps?q=Av+Calle+Real+1225+Merlo+Buenos+Aires+Argentina&output=embed",
  },
];

export function Ubicaciones() {
  return (
    <section className="bg-roca-blanco px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-center text-2xl font-extrabold tracking-tight text-roca-negro sm:text-3xl">
          Dónde encontrarnos
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {UBICACIONES.map((ubicacion) => (
            <div
              key={ubicacion.titulo}
              className="flex flex-col gap-5 rounded-2xl border border-roca-negro/10 bg-roca-blanco p-6 shadow-md md:flex-row md:items-center"
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-roca-negro">
                  {ubicacion.titulo}
                </h3>
                <p className="mt-2 text-sm text-roca-negro/70">
                  {ubicacion.direccion}
                </p>
                <p className="mt-1 text-sm text-roca-negro/70">
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
