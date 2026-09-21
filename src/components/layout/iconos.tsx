import type { SVGProps } from "react";

const PATHS = {
  productos: "M21 8l-9-5-9 5 9 5 9-5Z M3 8v8l9 5 9-5V8 M12 13v8",
  administradores:
    "M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4 21c0-4 3.5-6 8-6s8 2 8 6 M17 4.5c1.5.5 2.5 1.8 2.5 3.5S18.5 11 17 11.5",
  usuarios:
    "M9 8a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 8Z M2.5 20c0-3.4 3-5.2 6.5-5.2s6.5 1.8 6.5 5.2 M18 9a2.6 2.6 0 1 0 0-5.2A2.6 2.6 0 0 0 18 9Z M15.8 14.5c2.6.4 4.7 2 4.7 5.2",
  marcas:
    "M3 11.5 11.5 3H19a2 2 0 0 1 2 2v7.5L12.5 21 3 11.5Z M14.5 9a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8Z",
  categorias:
    "M3 3h7.5v7.5H3z M13.5 3H21v7.5h-7.5z M3 13.5h7.5V21H3z M13.5 13.5H21V21h-7.5z",
  precios: "M12 2v20 M17 5.5c0-1.9-2.2-3.5-5-3.5s-5 1.6-5 3.5 2.2 3 5 3.5 5 1.6 5 3.5-2.2 3.5-5 3.5-5-1.6-5-3.5",
  catalogo: "M12 12m-8.5 0a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0 M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
  pedidos: "M4 7l8-4 8 4-8 4-8-4Z M4 7v10l8 4 8-4V7 M12 11v10",
  perfil: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4 21c0-4.5 3.6-7 8-7s8 2.5 8 7",
  clientes: "M3 21V9l9-6 9 6v12 M9 21v-7h6v7",
  carrito:
    "M9 21m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M20 21m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6",
  menu: "M3 6h18M3 12h18M3 18h18",
  salir: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  sol: "M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0 M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41",
  luna: "M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z",
} as const;

export type NombreIcono = keyof typeof PATHS;

export function Icono({
  nombre,
  ...props
}: { nombre: NombreIcono } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {PATHS[nombre].split(" M").map((d, i) => (
        <path key={i} d={i === 0 ? d : `M${d}`} />
      ))}
    </svg>
  );
}
