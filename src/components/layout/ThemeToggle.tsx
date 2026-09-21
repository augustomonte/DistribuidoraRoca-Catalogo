"use client";

import { useEffect, useState } from "react";
import { Icono } from "@/components/layout/iconos";

type Tema = "light" | "dark";
const CLAVE_STORAGE = "tema";

function leerTemaActual(): Tema {
  const explicito = document.documentElement.getAttribute("data-theme");
  if (explicito === "dark" || explicito === "light") return explicito;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Toggle de tema claro/oscuro. La preferencia se guarda en localStorage
 * y se aplica como atributo data-theme en <html>; el script inline de
 * src/app/layout.tsx lee ese mismo valor ANTES del primer paint, para
 * no mostrar un flash del tema equivocado al cargar la página.
 */
export function ThemeToggle() {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    setTema(leerTemaActual());
  }, []);

  function alternar() {
    const siguiente: Tema = tema === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", siguiente);
    try {
      window.localStorage.setItem(CLAVE_STORAGE, siguiente);
    } catch {
      // Sin localStorage el toggle sigue funcionando para esta sesión,
      // solo no se recuerda la próxima vez.
    }
    setTema(siguiente);
  }

  // Antes de montar en el cliente no sabemos el tema real (podría venir
  // del sistema): un ícono fijo evita un cambio visible apenas hidrata.
  if (tema === null) {
    return (
      <span
        className="h-8 w-8 flex-shrink-0 rounded-md border border-tema-tinta/15"
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={tema === "dark" ? "Modo claro" : "Modo oscuro"}
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-tema-tinta/15 text-tema-tinta/60 hover:bg-tema-tinta/5 hover:text-tema-tinta"
    >
      <Icono nombre={tema === "dark" ? "sol" : "luna"} className="h-3.5 w-3.5" />
    </button>
  );
}
