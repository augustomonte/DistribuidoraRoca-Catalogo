/**
 * ─────────────────────────────────────────────────────────────────────
 * CONFIGURACIÓN DEL CLIENTE
 * ─────────────────────────────────────────────────────────────────────
 *
 * Este es el ÚNICO archivo que hay que tocar para poner el catálogo a
 * nombre de otra empresa. Todo lo que sea nombre, contacto, textos,
 * sucursales, política de precios o funcionalidades activas vive acá.
 *
 * Regla para mantenerlo así: si estás por escribir el nombre de una
 * empresa, un teléfono o una dirección dentro de un componente, va acá.
 *
 * Los colores de marca NO están en este archivo: son variables CSS en
 * `src/app/globals.css` (bloque "Identidad visual"), porque Tailwind las
 * necesita en tiempo de compilación.
 */

/** Las opciones de facturación válidas (columna productos.opcion_facturacion). */
export type OpcionFacturacion = 1 | 2 | 3;

export interface Ubicacion {
  titulo: string;
  direccion: string;
  telefono: string;
  /** URL de Google Maps en modo embed (terminada en `&output=embed`). */
  mapaUrl: string;
}

export interface ConfigCliente {
  marca: {
    /** Nombre completo, para títulos y metadata. */
    nombre: string;
    /** Versión corta, para espacios chicos (footer, botones). */
    nombreCorto: string;
    razonSocial: string;
    /** Descripción de una línea. Se usa como meta description. */
    descripcion: string;
    logo: {
      /** Logo horizontal del header. */
      horizontal: string;
      horizontalAncho: number;
      horizontalAlto: number;
      /** Isotipo cuadrado del hero. */
      isotipo: string;
      isotipoLado: number;
    };
  };

  contacto: {
    /** Número de WhatsApp en formato internacional, sin + ni espacios. */
    whatsapp: string;
    /** Mensaje con el que se abre el chat. */
    whatsappMensaje: string;
    email?: string;
  };

  ubicaciones: Ubicacion[];

  textos: {
    homeTitulo: string;
    homeSubtitulo: string;
    empresaTitulo: string;
    empresaTexto: string;
  };

  /**
   * Cómo se llama en la interfaz al rol `cliente` de la base de datos
   * (las cuentas que compran en la distribuidora). Permite que el panel
   * diga "Kioscos" en una distribuidora de golosinas y "Ferreterías" en una
   * de ferretería, sin tocar el enum de Postgres.
   *
   * Usar palabras que funcionen con "Mis ___", "Agregar ___" y plural
   * regular ("Ferretería"/"Ferreterías"): así no hay que resolver el género.
   */
  etiquetas: {
    clienteSingular: string;
    clientePlural: string;
  };

  /**
   * Opciones de facturación de un producto. El Excel de precios trae el
   * NÚMERO (1, 2 o 3) y la app muestra la etiqueta de acá; el porcentaje de
   * IVA no se guarda aparte. Cada distribuidora define las suyas.
   * Los precios vienen ya calculados en el Excel: la app no deriva nada.
   */
  facturacion: {
    opciones: Record<OpcionFacturacion, string>;
  };

  features: {
    /** true = el catálogo se ve sin iniciar sesión. */
    catalogoPublico: boolean;
    /** Con catálogo público: si los precios requieren sesión igual. */
    ocultarPreciosSinSesion: boolean;
    /** Carrito y pedidos dentro de la app (Fase 2). */
    pedidos: boolean;
  };
}

export const cliente: ConfigCliente = {
  marca: {
    nombre: "Mayorista Roca Ferretería",
    nombreCorto: "Roca",
    razonSocial: "Mayorista Roca Ferretería",
    descripcion:
      "Distribuidora mayorista de artículos de ferretería en Argentina.",
    logo: {
      horizontal: "/logo.png",
      horizontalAncho: 1345,
      horizontalAlto: 286,
      isotipo: "/logo-mark.png",
      isotipoLado: 255,
    },
  },

  contacto: {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5490000000000",
    whatsappMensaje:
      "Hola, quería consultar sobre productos de Mayorista Roca Ferretería.",
  },

  ubicaciones: [
    {
      titulo: "Venta Mayorista y Distribución",
      direccion: "Ayacucho 1139, Merlo, Buenos Aires",
      telefono: "0220 482 2242",
      mapaUrl:
        "https://maps.google.com/maps?q=Ayacucho+1139+Merlo+Buenos+Aires+Argentina&output=embed",
    },
    {
      titulo: "Ferretería Roca — Venta al Público",
      direccion: "Av. Calle Real 1225, Merlo, Buenos Aires",
      telefono: "0220 485 7790",
      mapaUrl:
        "https://maps.google.com/maps?q=Av+Calle+Real+1225+Merlo+Buenos+Aires+Argentina&output=embed",
    },
  ],

  textos: {
    homeTitulo: "Mayorista Ferretería",
    homeSubtitulo:
      "Distribuidora mayorista de artículos de ferretería. Catálogo con precios exclusivos para vendedores y ferreterías registradas.",
    empresaTitulo: "Nuestra empresa",
    empresaTexto:
      "Somos una distribuidora mayorista de artículos de ferretería en Argentina, con más de una década acompañando a ferreterías de todo el país con precios competitivos, stock permanente y atención directa.",
  },

  etiquetas: {
    clienteSingular: "Ferretería",
    clientePlural: "Ferreterías",
  },

  facturacion: {
    opciones: {
      1: "IVA 21%",
      2: "IVA 10,5%",
      3: "Precio directo",
    },
  },

  features: {
    catalogoPublico: false,
    ocultarPreciosSinSesion: true,
    pedidos: false,
  },
};

/**
 * Etiqueta de la opción de facturación de un producto ("IVA 21%",
 * "Precio directo"...), o null si todavía no tiene ninguna.
 */
export function etiquetaFacturacion(opcion: number | null): string | null {
  if (opcion === null) return null;
  return cliente.facturacion.opciones[opcion as OpcionFacturacion] ?? null;
}
