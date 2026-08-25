import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="Mayorista Roca Ferretería"
        width={1345}
        height={286}
        priority
        className="h-9 w-auto"
      />
    </Link>
  );
}
