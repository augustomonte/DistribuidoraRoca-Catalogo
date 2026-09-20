import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { cliente } from "@/config/cliente";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center", className)}>
      <Image
        src={cliente.marca.logo.horizontal}
        alt={cliente.marca.nombre}
        width={cliente.marca.logo.horizontalAncho}
        height={cliente.marca.logo.horizontalAlto}
        priority
        className="h-9 w-auto"
      />
    </Link>
  );
}
