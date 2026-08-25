"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

export function NavList({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  // Coincidencia más específica gana (ej: /admin/vendedores sobre /admin)
  const activeHref = [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    )?.href;

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {items.map((item) => {
        const activo = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
              activo
                ? "bg-roca-rojo/10 text-roca-rojo"
                : "text-roca-negro/80 hover:bg-roca-negro/5"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
