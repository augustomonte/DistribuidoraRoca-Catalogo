export type RolUsuario = "admin" | "vendedor" | "cliente";
export type EstadoPedido = "pendiente" | "confirmado" | "cancelado";

export type Database = {
  public: {
    Tables: {
      categorias: {
        Row: {
          id: number;
          nombre: string;
          orden: number;
        };
        Insert: {
          id?: number;
          nombre: string;
          orden: number;
        };
        Update: {
          id?: number;
          nombre?: string;
          orden?: number;
        };
        Relationships: [];
      };
      marcas: {
        Row: {
          id: number;
          nombre: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          nombre: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          nombre?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      perfiles: {
        Row: {
          id: string;
          rol: RolUsuario;
          nombre: string;
          apellido: string | null;
          razon_social: string | null;
          telefono: string | null;
          dni: string | null;
          direccion: string | null;
          ciudad: string | null;
          provincia: string | null;
          creado_por: string | null;
          activo: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          rol?: RolUsuario;
          nombre: string;
          apellido?: string | null;
          razon_social?: string | null;
          telefono?: string | null;
          dni?: string | null;
          direccion?: string | null;
          ciudad?: string | null;
          provincia?: string | null;
          creado_por?: string | null;
          activo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          rol?: RolUsuario;
          nombre?: string;
          apellido?: string | null;
          razon_social?: string | null;
          telefono?: string | null;
          dni?: string | null;
          direccion?: string | null;
          ciudad?: string | null;
          provincia?: string | null;
          creado_por?: string | null;
          activo?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "perfiles_creado_por_fkey";
            columns: ["creado_por"];
            isOneToOne: false;
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          }
        ];
      };
      productos: {
        Row: {
          id: string;
          codigo: string;
          nombre: string;
          descripcion: string | null;
          categoria_id: number | null;
          marca_id: number | null;
          precio_acordado: number;
          precio_lista2: number;
          iva_porcentaje: number;
          nota_iva: string | null;
          unidad_venta: string | null;
          barcode: string | null;
          foto_url: string | null;
          stock_disponible: boolean;
          activo: boolean;
          precio_actualizado_en: string;
          opcion_facturacion: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          codigo: string;
          nombre: string;
          descripcion?: string | null;
          categoria_id?: number | null;
          marca_id?: number | null;
          precio_acordado?: number;
          precio_lista2?: number;
          iva_porcentaje?: number;
          nota_iva?: string | null;
          unidad_venta?: string | null;
          barcode?: string | null;
          foto_url?: string | null;
          stock_disponible?: boolean;
          activo?: boolean;
          precio_actualizado_en?: string;
          opcion_facturacion?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          codigo?: string;
          nombre?: string;
          descripcion?: string | null;
          categoria_id?: number | null;
          marca_id?: number | null;
          precio_acordado?: number;
          precio_lista2?: number;
          iva_porcentaje?: number;
          nota_iva?: string | null;
          unidad_venta?: string | null;
          barcode?: string | null;
          foto_url?: string | null;
          stock_disponible?: boolean;
          activo?: boolean;
          precio_actualizado_en?: string;
          opcion_facturacion?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "productos_marca_id_fkey";
            columns: ["marca_id"];
            isOneToOne: false;
            referencedRelation: "marcas";
            referencedColumns: ["id"];
          }
        ];
      };
      pedidos: {
        Row: {
          id: string;
          cliente_id: string;
          vendedor_id: string | null;
          estado: EstadoPedido;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          cliente_id: string;
          vendedor_id?: string | null;
          estado?: EstadoPedido;
          total?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          cliente_id?: string;
          vendedor_id?: string | null;
          estado?: EstadoPedido;
          total?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedidos_vendedor_id_fkey";
            columns: ["vendedor_id"];
            isOneToOne: false;
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          }
        ];
      };
      pedido_items: {
        Row: {
          id: string;
          pedido_id: string;
          producto_id: string | null;
          producto_codigo: string;
          producto_nombre: string;
          cantidad: number;
          precio_unitario: number;
          iva_porcentaje: number;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          producto_id?: string | null;
          producto_codigo: string;
          producto_nombre: string;
          cantidad: number;
          precio_unitario: number;
          iva_porcentaje?: number;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          producto_id?: string | null;
          producto_codigo?: string;
          producto_nombre?: string;
          cantidad?: number;
          precio_unitario?: number;
          iva_porcentaje?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pedido_items_pedido_id_fkey";
            columns: ["pedido_id"];
            isOneToOne: false;
            referencedRelation: "pedidos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey";
            columns: ["producto_id"];
            isOneToOne: false;
            referencedRelation: "productos";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      productos_vista: {
        Row: {
          id: string;
          codigo: string;
          nombre: string;
          descripcion: string | null;
          categoria_id: number | null;
          categoria_nombre: string | null;
          marca_id: number | null;
          marca: string | null;
          precio: number;
          iva_porcentaje: number;
          nota_iva: string | null;
          unidad_venta: string | null;
          barcode: string | null;
          foto_url: string | null;
          stock_disponible: boolean;
          activo: boolean;
          precio_actualizado_en: string;
          opcion_facturacion: number | null;
          created_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      rol_actual: {
        Args: Record<string, never>;
        Returns: RolUsuario;
      };
      buscar_productos_ranked: {
        Args: {
          termino: string;
          filtro_categoria_id?: number | null;
          filtro_marca?: string | null;
          orden_alfabetico?: string;
          limite?: number;
          desplazamiento?: number;
        };
        Returns: Database["public"]["Views"]["productos_vista"]["Row"][];
      };
      actualizar_precios_masivo: {
        Args: {
          items: { codigo: string; precio: number }[];
          descuento?: number;
        };
        Returns: string[];
      };
      actualizar_catalogo_masivo: {
        Args: {
          items: { codigo: string; precio: number; opcion: number | null }[];
        };
        Returns: string[];
      };
    };
    Enums: {
      rol_usuario: RolUsuario;
      estado_pedido: EstadoPedido;
    };
    CompositeTypes: Record<string, never>;
  };
};
