import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/layout/Logo";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-roca-negro/10 bg-roca-blanco px-6 py-4">
        <Logo />
        <nav>
          <Link
            href="/empresa"
            className="rounded-md px-3 py-2 text-sm font-medium text-roca-negro/80 hover:bg-roca-negro/5"
          >
            Empresa
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-roca-negro px-6 py-24 text-center">
        <Image
          src="/logo-mark.png"
          alt="Roca"
          width={255}
          height={255}
          priority
          className="h-32 w-32 sm:h-40 sm:w-40"
        />
        <h1 className="text-2xl font-extrabold tracking-tight text-roca-amarillo sm:text-4xl">
          Mayorista Ferretería
        </h1>
        <p className="max-w-lg text-roca-blanco/70">
          Distribuidora mayorista de artículos de ferretería. Catálogo con
          precios exclusivos para vendedores y ferreterías registradas.
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
