import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-tema-fondo px-4 text-center">
      <h1 className="text-xl font-bold text-tema-tinta">
        Página no encontrada
      </h1>
      <p className="max-w-sm text-sm text-tema-tinta/60">
        La página que buscás no existe o se movió de lugar.
      </p>
      <Link href="/">
        <Button>Ir al inicio</Button>
      </Link>
    </div>
  );
}
