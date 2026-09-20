import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/layout/Logo";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/Button";
import { cliente } from "@/config/cliente";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-tema-tinta/10 bg-tema-papel px-6 py-4">
        <Logo />
        <nav>
          <Link
            href="/empresa"
            className="rounded-md px-3 py-2 text-sm font-medium text-tema-tinta/80 hover:bg-tema-tinta/5"
          >
            Empresa
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-tema-tinta px-6 py-24 text-center">
        <Image
          src={cliente.marca.logo.isotipo}
          alt={cliente.marca.nombreCorto}
          width={cliente.marca.logo.isotipoLado}
          height={cliente.marca.logo.isotipoLado}
          priority
          className="h-32 w-32 sm:h-40 sm:w-40"
        />
        <h1 className="text-2xl font-extrabold tracking-tight text-tema-secundario sm:text-4xl">
          {cliente.textos.homeTitulo}
        </h1>
        <p className="max-w-lg text-tema-papel/70">
          {cliente.textos.homeSubtitulo}
        </p>
        <Link href="/login">
          <Button variante="secundario" className="px-8 py-3 text-base">
            Iniciar sesión
          </Button>
        </Link>
      </main>

      <WhatsAppButton />
    </div>
  );
}
