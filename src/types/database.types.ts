export type RolUsuario = "admin" | "vendedor" | "ferreteria";

export type Database = {
  public: {
    Tables: {
      categorias: {
        Row: {
          id: number;
          nombre: string;
          sector_numero: number;
        };
        Insert: {
          id?: number;
          nombre: string;
          sector_numero: number;
        };
        Update: {
          id?: number;
          nombre?: string;
          sector_numero?: number;
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
          marca: string | null;
          precio_acordado: number;
          precio_lista2: number;
          iva_porcentaje: number;
          foto_url: string | null;
          stock_disponible: boolean;
          activo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          codigo: string;
          nombre: string;
          descripcion?: string | null;
          categoria_id?: number | null;
          marca?: string | null;
          precio_acordado?: number;
          precio_lista2?: number;
          iva_porcentaje?: number;
          foto_url?: string | null;
          stock_disponible?: boolean;
          activo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          codigo?: string;
          nombre?: string;
          descripcion?: string | null;
          categoria_id?: number | null;
          marca?: string | null;
          precio_acordado?: number;
          precio_lista2?: number;
          iva_porcentaje?: number;
          foto_url?: string | null;
          stock_disponible?: boolean;
          activo?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias";
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
          marca: string | null;
          precio: number;
          iva_porcentaje: number;
          foto_url: string | null;
          stock_disponible: boolean;
          activo: boolean;
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
    };
    Enums: {
      rol_usuario: RolUsuario;
    };
    CompositeTypes: Record<string, never>;
  };
};
