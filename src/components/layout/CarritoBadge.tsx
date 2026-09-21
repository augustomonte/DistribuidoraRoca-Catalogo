"use client";

import Link from "next/link";
import { useCarrito } from "@/lib/carrito";

export function CarritoBadge() {
  const { cantidadTotal } = useCarrito();

  return (
    <Link
      href="/carrito"
      aria-label="Ver carrito"
      className="relative flex h-9 w-9 items-center justify-center rounded-md text-tema-tinta/70 hover:bg-tema-tinta/5 hover:text-tema-tinta"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {cantidadTotal > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tema-primario px-1 text-[10px] font-bold text-tema-papel">
          {cantidadTotal}
        </span>
      )}
    </Link>
  );
}
