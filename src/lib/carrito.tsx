"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const CLAVE_STORAGE = "carrito";

export interface ItemCarrito {
  productoId: string;
  codigo: string;
  nombre: string;
  marca: string | null;
  precio: number;
  unidadVenta: string | null;
  fotoUrl: string | null;
  cantidad: number;
}

interface CarritoContextValue {
  items: ItemCarrito[];
  cantidadTotal: number;
  totalConIva: number;
  agregarItem: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  actualizarCantidad: (productoId: string, cantidad: number) => void;
  quitarItem: (productoId: string) => void;
  vaciarCarrito: () => void;
}

const CarritoContext = createContext<CarritoContextValue | null>(null);

function leerStorage(): ItemCarrito[] {
  try {
    const crudo = window.localStorage.getItem(CLAVE_STORAGE);
    if (!crudo) return [];
    const parseado = JSON.parse(crudo);
    return Array.isArray(parseado) ? parseado : [];
  } catch {
    // Modo privado, storage lleno, JSON corrupto: arrancamos vacío.
    return [];
  }
}

function guardarStorage(items: ItemCarrito[]) {
  try {
    window.localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items));
  } catch {
    // El carrito sigue funcionando en memoria para esta sesión.
  }
}

/**
 * Carrito de compra: vive en localStorage del navegador, no en la base,
 * hasta que se confirma el pedido (ver /carrito). Así navegar y sumar
 * productos no genera escrituras en Supabase.
 *
 * Arranca vacío en el primer render (server y cliente tienen que
 * coincidir) y se hidrata desde localStorage en un efecto, ya en el
 * navegador.
 */
export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    setItems(leerStorage());
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (hidratado) guardarStorage(items);
  }, [items, hidratado]);

  function agregarItem(item: Omit<ItemCarrito, "cantidad">, cantidad = 1) {
    setItems((prev) => {
      const existente = prev.find((i) => i.productoId === item.productoId);
      if (existente) {
        return prev.map((i) =>
          i.productoId === item.productoId
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      }
      return [...prev, { ...item, cantidad }];
    });
  }

  function actualizarCantidad(productoId: string, cantidad: number) {
    setItems((prev) => {
      if (cantidad <= 0) {
        return prev.filter((i) => i.productoId !== productoId);
      }
      return prev.map((i) =>
        i.productoId === productoId ? { ...i, cantidad } : i
      );
    });
  }

  function quitarItem(productoId: string) {
    setItems((prev) => prev.filter((i) => i.productoId !== productoId));
  }

  function vaciarCarrito() {
    setItems([]);
  }

  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);
  const totalConIva = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  return (
    <CarritoContext.Provider
      value={{
        items,
        cantidadTotal,
        totalConIva,
        agregarItem,
        actualizarCantidad,
        quitarItem,
        vaciarCarrito,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito(): CarritoContextValue {
  const ctx = useContext(CarritoContext);
  if (!ctx) {
    throw new Error("useCarrito tiene que usarse dentro de <CarritoProvider>");
  }
  return ctx;
}
