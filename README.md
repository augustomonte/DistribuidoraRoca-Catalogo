# Catálogo mayorista B2B

Catálogo web para distribuidoras mayoristas: catálogo con precios según
quién consulta, ABM de productos/marcas/categorías, alta de vendedores y
clientes, y búsqueda con ranking por relevancia.

Hecho con Next.js 16 (App Router), React 19, Tailwind 4 y Supabase
(Postgres + Auth + Storage).

Este mismo código hoy corre en producción para **Mayorista Roca
Ferretería**, pero está armado como plantilla: revestir la identidad de
otro cliente (otro rubro, otra marca) no debería tocar más que
`src/config/cliente.ts` y una sección de `src/app/globals.css`. Ver
[Poner esto a nombre de otro cliente](#poner-esto-a-nombre-de-otro-cliente)
más abajo.

## Roles y qué ve cada uno

La tabla `perfiles` tiene tres roles (`rol_usuario` en Postgres):

| Rol | Ve | Precio que le muestra `productos_vista` |
|---|---|---|
| `admin` | Todo: ABM de productos, marcas, categorías, usuarios | `precio_acordado` (reservado) |
| `vendedor` | El catálogo, y solo los clientes que él mismo dio de alta | `precio_acordado` (reservado) |
| `cliente` | Solo el catálogo | `precio_lista2` (público) |

La vista `productos_vista` (ver `supabase/schema.sql`) es la única forma
en que un `cliente` puede leer productos: la tabla `productos` cruda,
con `precio_acordado` incluido, tiene RLS que la bloquea para ese rol.

La etiqueta con la que se llama al rol `cliente` en la interfaz (ej.
"Ferreterías" para Roca) es configurable por cliente — ver
`cliente.etiquetas` en `src/config/cliente.ts`.

## Empezar en local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Copiar `.env.example` a `.env.local` y completar las variables (ver
   comentarios en el archivo; las claves de Supabase salen de
   *Project Settings → API* en el dashboard).

3. Crear el esquema en un proyecto de Supabase nuevo: correr
   `supabase/schema.sql` completo en *SQL Editor*, y después cada
   archivo de `supabase/migrations/` **en orden numérico**. `schema.sql`
   no es un `0001`: ya incluye el estado inicial, las migraciones son
   los cambios posteriores.

   Categorías: la base queda sin datos (`schema.sql` ya no las carga
   hardcodeadas). Cargalas desde *Admin → Categorías* en la interfaz, o
   con un seed propio como `supabase/seeds/roca-categorias.sql` (ese
   archivo es específico de Roca, no correrlo en otro cliente).

4. Crear el primer usuario admin: *Authentication → Users → Add user*
   en el dashboard de Supabase, y después, en *SQL Editor*:

   ```sql
   insert into public.perfiles (id, rol, nombre, apellido, activo)
   values ('UUID-DEL-USUARIO', 'admin', 'Tu Nombre', 'Tu Apellido', true);
   ```

5. Levantar el servidor:

   ```bash
   npm run dev
   ```

   Abrir [http://localhost:3000](http://localhost:3000).

### Modo desarrollo sin login

Con `DEV_SIN_LOGIN=admin` (o `vendedor` / `cliente`) en `.env.local`,
`npm run dev` deja navegar la app sin pasar por `/login`, con un perfil
simulado. Sirve para iterar la interfaz rápido, pero **no** para probar
diferencias de precio por rol (usa la service role de Supabase, así que
`rol_actual()` da `null` en la base). Solo funciona con
`NODE_ENV=development`: un `npm run build && npm run start` lo ignora
siempre, así que no hay riesgo de que quede prendido en producción por
olvido. Ver `src/lib/dev-sin-login.ts`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npx tsx scripts/import-productos.ts [ruta.xlsx]` | Importa productos desde el Excel maestro. El mapeo de columnas es específico del Excel de Roca — ver el comentario al inicio del script antes de usarlo con otro cliente |

## Estructura

```
src/
  app/            Rutas (App Router)
    admin/        Panel admin: productos, marcas, categorías, usuarios
    vendedor/     Panel vendedor: catálogo + sus clientes
    catalogo/     Catálogo (compartido por los 3 roles vía CatalogoView)
    perfil/       Editar datos propios, cambiar contraseña
    login/, recuperar-contrasena/, actualizar-contrasena/, auth/confirmar/
    empresa/      Página pública "Nuestra empresa"
  components/     Componentes de UI, agrupados por área
  lib/            Acceso a datos (Supabase) y Server Actions
  config/cliente.ts   Todo lo que cambia de un cliente a otro
  proxy.ts        Middleware: protege rutas por rol, arma el header
                  interno x-perfil (nunca confía en uno que venga del
                  cliente)
supabase/
  schema.sql      Esquema base
  migrations/     Cambios posteriores, en orden numérico
  seeds/          Datos de carga inicial específicos de un cliente
scripts/
  import-productos.ts   Importación masiva desde Excel (Roca)
```

## Poner esto a nombre de otro cliente

1. `src/config/cliente.ts`: nombre, logos, contacto, sucursales, textos,
   alícuotas de IVA, política de precio acordado, etiqueta del rol
   `cliente` y flags de features.
2. `src/app/globals.css`, bloque "Identidad visual": los 6 colores
   (`--color-tema-*`). El resto del código solo usa esos nombres
   semánticos, nunca un color literal.
3. `public/logo.png`, `public/logo-mark.png`, `public/marcas/*`:
   reemplazar por los del cliente nuevo.
4. Proyecto de Supabase propio (ver [Empezar en local](#empezar-en-local)):
   cada cliente tiene su propio proyecto — no hay multi-tenant, el
   aislamiento de datos es total.
5. Categorías propias, cargadas desde el panel o con un seed nuevo en
   `supabase/seeds/`.

## Estado

En desarrollo activo. Lo que falta y el orden en que se está encarando
vive en la conversación con quien mantiene esto, no en este archivo.
