import type { Metadata } from "next";
import { Logo } from "@/components/layout/Logo";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { MarcasMarquee } from "@/components/empresa/MarcasMarquee";
import { Ubicaciones } from "@/components/empresa/Ubicaciones";

export const metadata: Metadata = {
  title: "Empresa | Mayorista Roca Ferretería",
  description:
    "Conocé Mayorista Roca Ferretería: distribuidora mayorista de artículos de ferretería y las marcas que trabajamos.",
};

export default function EmpresaPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-roca-negro/10 bg-roca-blanco px-6 py-4">
        <Logo />
      </header>

      <main className="flex-1">
        <section className="bg-roca-negro px-6 py-20 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-roca-blanco sm:text-5xl">
            Nuestra empresa
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-roca-blanco/70">
            Somos una distribuidora mayorista de artículos de ferretería en
            Argentina, con más de una década acompañando a ferreterías de
            todo el país con precios competitivos, stock permanente y
            atención directa.
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
