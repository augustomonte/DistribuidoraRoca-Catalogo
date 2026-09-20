import Link from "next/link";
import Image from "next/image";
import { RecuperarContrasenaForm } from "@/components/auth/RecuperarContrasenaForm";
import { cliente } from "@/config/cliente";

export default function RecuperarContrasenaPage() {
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
        <h1 className="mb-2 text-center text-lg font-semibold text-tema-tinta">
          Recuperar contraseña
        </h1>
        <p className="mb-6 text-center text-sm text-tema-tinta/60">
          Ingresá tu email y te mandamos un link para elegir una nueva.
        </p>
        <RecuperarContrasenaForm />
        <Link
          href="/login"
          className="mt-6 block text-center text-sm text-tema-tinta/60 hover:text-tema-tinta"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
