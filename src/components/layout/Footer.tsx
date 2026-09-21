import { cliente } from "@/config/cliente";

export function Footer() {
  return (
    <footer className="border-t border-tema-tinta/10 bg-tema-superficie-oscura py-6 text-center text-sm text-tema-texto-claro/60">
      © {new Date().getFullYear()} {cliente.marca.razonSocial}. Todos los
      derechos reservados.
    </footer>
  );
}
