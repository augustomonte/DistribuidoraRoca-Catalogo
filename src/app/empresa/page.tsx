import type { Metadata } from "next";
import { Logo } from "@/components/layout/Logo";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { MarcasMarquee } from "@/components/empresa/MarcasMarquee";
import { Ubicaciones } from "@/components/empresa/Ubicaciones";
import { cliente } from "@/config/cliente";

export const metadata: Metadata = {
  title: `Empresa | ${cliente.marca.nombre}`,
  description: `Conocé ${cliente.marca.nombre}: ${cliente.marca.descripcion}`,
};

export default function EmpresaPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-tema-tinta/10 bg-tema-papel px-6 py-4">
        <Logo />
      </header>

      <main className="flex-1">
        <section className="bg-tema-superficie-oscura px-6 py-20 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-tema-texto-claro sm:text-5xl">
            {cliente.textos.empresaTitulo}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-tema-texto-claro/70">
            {cliente.textos.empresaTexto}
          </p>
        </section>

        <MarcasMarquee />
        <Ubicaciones />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
