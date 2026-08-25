import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import type { Perfil } from "@/types";

export function SeccionProtegida({
  perfil,
  children,
}: {
  perfil: Perfil;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Header perfil={perfil} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
