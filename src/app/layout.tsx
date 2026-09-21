import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cliente } from "@/config/cliente";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: cliente.marca.nombre,
  description: cliente.marca.descripcion,
};

// Corre ANTES del primer paint, fuera de React: lee la preferencia de
// tema guardada y la aplica al <html> de una, para no mostrar un flash
// del tema equivocado mientras hidrata. Ver ThemeToggle.tsx, que es
// quien escribe este mismo valor en localStorage.
const SCRIPT_TEMA = `
  try {
    var t = localStorage.getItem("tema");
    if (t === "dark" || t === "light") {
      document.documentElement.setAttribute("data-theme", t);
    }
  } catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // El script de SCRIPT_TEMA agrega data-theme antes de que React
      // hidrate; sin esto, React lo marca como mismatch de hidratación
      // porque el HTML del servidor no lo tiene. Es el patrón estándar
      // para evitar el flash del tema equivocado, no un error real.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-full flex flex-col bg-tema-fondo text-tema-tinta">
        {children}
      </body>
    </html>
  );
}
