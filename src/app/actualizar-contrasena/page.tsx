import Image from "next/image";
import { ActualizarContrasenaForm } from "@/components/auth/ActualizarContrasenaForm";
import { cliente } from "@/config/cliente";

export default function ActualizarContrasenaPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-tema-fondo px-4 py-16">
      <div className="w-full max-w-sm rounded-lg border border-tema-tinta/10 bg-tema-papel p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image
            src={cliente.marca.logo.isotipo}
            alt={cliente.marca.nombreCorto}
            width={cliente.marca.logo.isotipoLado}
            height={cliente.marca.logo.isotipoLado}
            priority
            className="h-20 w-20"
          />
        </div>
        <h1 className="mb-6 text-center text-lg font-semibold text-tema-tinta">
          Elegí tu nueva contraseña
        </h1>
        <ActualizarContrasenaForm />
      </div>
    </div>
  );
}
