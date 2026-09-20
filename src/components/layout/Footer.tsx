import { cliente } from "@/config/cliente";

export function Footer() {
  return (
    <footer className="border-t border-tema-tinta/10 bg-tema-tinta py-6 text-center text-sm text-tema-papel/60">
      © {new Date().getFullYear()} {cliente.marca.razonSocial}. Todos los
      derechos reservados.
    </footer>
  );
}
