<div align="center">
  <img src="docs/assets/moon-banner.svg" alt="MÖÖN — E-commerce Admin Dashboard" width="100%" />
</div>

<div align="center">

**Panel de administración para una tienda de calzado.**
Next.js + NestJS + Prisma + PostgreSQL, con imágenes en Supabase Storage.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)

[Funcionalidades](#funcionalidades) · [Arquitectura](#arquitectura) · [Instalación](#instalación) · [Limitaciones](#limitaciones)

</div>

---

## Funcionalidades

- **Acceso demo al panel.** Inicio de sesión con credenciales fijas validadas en el
  frontend; la sesión se guarda en `localStorage`.
- **Dashboard con métricas reales.** Productos, Categorías, Ventas e Ingresos, más
  una sección de "Ventas recientes". Los datos provienen de la API.
- **CRUD de categorías.** Crear, listar, editar y eliminar. La eliminación se bloquea
  (HTTP 409) si la categoría tiene productos.
- **CRUD de productos.** Crear, listar, editar y eliminar. Categoría obligatoria y
  precio con hasta 2 decimales. La eliminación se bloquea (HTTP 409) si el producto
  está referenciado por ventas.
- **Archivado y restauración.** Categorías y productos pueden archivarse y
  restaurarse; el listado los oculta salvo `?includeArchived=true`.
- **Fotografías con Supabase Storage.** Una imagen por producto (JPEG, PNG o WebP,
  máx. 5 MB) con validación por *magic bytes* en el backend.
- **Registro de ventas.** Alta seleccionando productos y cantidades; el total se
  calcula en el servidor.
- **Historial y detalle de ventas.** Listado de ventas y diálogo con el desglose.
- **Modo claro/oscuro persistente.** Respeta la preferencia del sistema y guarda la
  elección en `localStorage`.
- **Diseño responsive.** Navegación lateral en escritorio y menú lateral en móvil.

---

## Arquitectura

| Tecnología | Responsabilidad |
| --- | --- |
| Next.js + React | Interfaz del panel administrativo e interacción con el usuario. |
| NestJS | API REST, validaciones y lógica de negocio. |
| Prisma ORM | Acceso y operaciones sobre la base de datos. |
| PostgreSQL | Persistencia de categorías, productos y ventas. |
| Supabase Storage | Almacenamiento de fotografías de productos. |

Al registrar una venta, el frontend envía los productos y cantidades a la API de
NestJS. El backend valida la información, consulta los precios, calcula el total y
utiliza Prisma para guardar la venta y sus artículos en PostgreSQL dentro de una
transacción.

- El **frontend** consume la API con `fetch` (`src/lib/api.ts`), usando
  `NEXT_PUBLIC_API_URL`.
- El **backend** expone una API REST, valida con `ValidationPipe` global y persiste en
  **PostgreSQL** mediante **Prisma**.
- Las **imágenes** se suben desde el backend a **Supabase Storage** por su API REST
  (sin SDK); el frontend las muestra por su URL pública.

---

## Instalación

El monorepo **no tiene `package.json` raíz**; cada aplicación se instala por separado.

```bash
git clone <url-del-repositorio>
cd e-commerce-syrox

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

> Consulta [Configuración de entorno](#configuración-y-variables-de-entorno) antes de
> arrancar, y la sección de [Base de datos](#base-de-datos-y-migraciones) para preparar
> PostgreSQL.

<details>
<summary><strong>Ejecución</strong></summary>

Abre dos terminales.

**Backend** (API en `http://localhost:3001`):

```bash
cd backend
npm run start:dev      # modo watch
```

**Frontend** (interfaz en `http://localhost:3000`):

```bash
cd frontend
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La raíz redirige al panel; sin
sesión, se muestra la pantalla de acceso.

| App | Script | Descripción |
| --- | --- | --- |
| backend | `npm run start:dev` | API en modo watch. |
| backend | `npm run build` | Compila a `dist/`. |
| backend | `npm run start:prod` | Ejecuta el build. |
| backend | `npm run test` | Pruebas unitarias (Vitest). |
| backend | `npm run test:e2e` | Pruebas end-to-end (Vitest). |
| backend | `npm run prisma:generate` | Genera el cliente Prisma. |
| backend | `npm run prisma:seed` | Ejecuta el seed del catálogo. |
| frontend | `npm run dev` | Servidor de desarrollo. |
| frontend | `npm run build` | Build de producción. |
| frontend | `npm run start` | Sirve el build. |
| frontend | `npm run lint` | ESLint. |

</details>

---

## Configuración y variables de entorno

Los archivos `.env` están **ignorados por Git**. Nunca se versionan secretos.

<details open>
<summary><strong>Backend — <code>backend/.env</code></strong></summary>

```dotenv
# Conexión a PostgreSQL (usada por Prisma y el adapter-pg)
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@localhost:5432/ecommerce_syrox"

# Puerto del servidor (opcional; por defecto 3001)
PORT=3001

# Supabase Storage (imágenes de producto)
SUPABASE_URL="https://TU-PROYECTO.supabase.co"
SUPABASE_SECRET_KEY="TU_CLAVE_SECRETA"
SUPABASE_STORAGE_BUCKET="nombre-del-bucket"
```

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Cadena de conexión a PostgreSQL. |
| `PORT` | No | Puerto de la API. Por defecto `3001`. |
| `SUPABASE_URL` | Sí | URL del proyecto de Supabase. |
| `SUPABASE_SECRET_KEY` | Sí | Clave secreta para subir/eliminar objetos. |
| `SUPABASE_STORAGE_BUCKET` | Sí | Bucket público de imágenes. |

El backend falla al arrancar si falta `DATABASE_URL` o alguna variable de Supabase.

</details>

<details open>
<summary><strong>Frontend — <code>frontend/.env.local</code></strong></summary>

```dotenv
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | No | URL base de la API. Por defecto `http://localhost:3001`. |

</details>

### Base de datos y migraciones

```bash
createdb ecommerce_syrox        # crea la base

cd backend
npm run prisma:generate          # genera el cliente (src/generated/prisma)
npx prisma migrate deploy        # aplica las migraciones existentes

# En desarrollo, para crear nuevas migraciones:
npx prisma migrate dev --name <nombre-de-la-migracion>
```

El esquema define cuatro modelos: `Category`, `Product`, `Sale` y `SaleItem`
(`backend/prisma/schema.prisma`).

<details>
<summary><strong>Seed del catálogo (opcional)</strong></summary>

Inserta un catálogo de ejemplo: **4 categorías** y **12 productos** (3 por categoría).

> ⚠️ **El seed escribe datos.** Es idempotente (no borra ni sobrescribe; reutiliza
> categorías por nombre y omite productos ya presentes), pero **solo debe ejecutarse
> sobre una base de datos de desarrollo preparada para ello.**

```bash
cd backend
npm run prisma:seed
```

</details>

---

## Endpoints

La API **no usa prefijo global**; los recursos se sirven en la raíz
(p. ej. `http://localhost:3001/products`).

<details>
<summary><strong>Categorías</strong></summary>

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/categories` | Crea una categoría. |
| `GET` | `/categories` | Lista categorías. `?includeArchived=true` incluye archivadas. |
| `GET` | `/categories/:id` | Obtiene una categoría. |
| `PATCH` | `/categories/:id` | Actualiza una categoría. |
| `PATCH` | `/categories/:id/archive` | Archiva una categoría. |
| `PATCH` | `/categories/:id/restore` | Restaura una categoría. |
| `DELETE` | `/categories/:id` | Elimina una categoría. `409` si tiene productos. |

</details>

<details>
<summary><strong>Productos</strong></summary>

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/products` | Crea un producto (requiere categoría activa). |
| `GET` | `/products` | Lista productos. `?includeArchived=true` incluye archivados. |
| `GET` | `/products/:id` | Obtiene un producto. |
| `PATCH` | `/products/:id` | Actualiza un producto. |
| `PATCH` | `/products/:id/archive` | Archiva un producto. |
| `PATCH` | `/products/:id/restore` | Restaura un producto. |
| `POST` | `/products/:id/image` | Sube/reemplaza la imagen (`multipart/form-data`, campo `file`). |
| `DELETE` | `/products/:id` | Elimina un producto. `409` si está referenciado por ventas. |

</details>

<details>
<summary><strong>Ventas y raíz</strong></summary>

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/sales` | Lista ventas (más recientes primero) con sus ítems. |
| `GET` | `/sales/:id` | Obtiene una venta con su detalle. |
| `POST` | `/sales` | Registra una venta; el total se calcula en el servidor. |
| `GET` | `/` | Comprobación mínima de vida de la API. |

**Ejemplo — crear una venta:**

```json
POST /sales
{
  "items": [
    { "productId": "00000000-0000-0000-0000-000000000000", "quantity": 2 }
  ]
}
```

</details>

---

## Stack tecnológico

| Capa | Tecnología | Responsabilidad |
| --- | --- | --- |
| Frontend | Next.js 16 (App Router) | Enrutado y renderizado servidor/cliente. |
| Frontend | React 19 | Librería de UI. |
| Frontend | TypeScript | Tipado estático. |
| Frontend | Tailwind CSS 4 | Estilos utilitarios y tokens de diseño. |
| Frontend | shadcn/ui sobre Base UI | Primitivos de UI accesibles. |
| Frontend | Lucide React | Iconografía. |
| Backend | NestJS 12 | API REST (controladores, servicios, DTOs). |
| Backend | Prisma ORM 7 | Modelado y acceso a datos. |
| Backend | PostgreSQL | Base de datos relacional. |
| Backend | class-validator / class-transformer | Validación de DTOs. |
| Almacenamiento | Supabase Storage | Imágenes de producto. |
| Tooling | ESLint / Prettier / Vitest | Lint, formato y pruebas. |

<details>
<summary><strong>Estructura del repositorio</strong></summary>

```
e-commerce-syrox/
├── backend/                        # API REST (NestJS + Prisma)
│   ├── prisma/
│   │   ├── migrations/             # Migraciones
│   │   └── schema.prisma           # Category, Product, Sale, SaleItem
│   ├── src/
│   │   ├── categories/             # CRUD de categorías (+ archive/restore)
│   │   ├── products/               # CRUD de productos (+ imagen, archive/restore)
│   │   ├── sales/                  # Registro y consulta de ventas
│   │   ├── storage/                # Cliente Supabase + validación de imágenes
│   │   ├── prisma/                 # PrismaService (global) y seed
│   │   ├── generated/prisma/       # Cliente Prisma generado (ignorado por Git)
│   │   ├── app.module.ts
│   │   └── main.ts                 # ValidationPipe, CORS, puerto
│   └── prisma.config.ts
│
├── frontend/                       # Interfaz web (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/        # dashboard, products, categories, sales
│   │   │   ├── login/              # Acceso demo
│   │   │   ├── globals.css         # Tokens de diseño (claro/oscuro)
│   │   │   └── layout.tsx          # Providers: tema, auth, tooltip
│   │   ├── components/
│   │   │   ├── auth/               # Sesión demo
│   │   │   ├── branding/           # Monograma y wordmark MÖÖN
│   │   │   ├── categories/         # Tabla/acordeón y formulario
│   │   │   ├── layout/             # Sidebar, header, nav móvil, tema
│   │   │   ├── products/           # Tabla, formulario y cliente
│   │   │   ├── sales/              # Tabla, formulario y detalle
│   │   │   └── ui/                 # Primitivos shadcn/Base UI
│   │   ├── lib/                    # api, auth, currency, theme, utils
│   │   └── types/                  # Category, Product, Sale
│   └── components.json
│
└── docs/
    └── assets/moon-banner.svg      # Banner de marca
```

</details>

---

## Decisiones técnicas

- **Componentes reutilizables.** Primitivos en `components/ui`, componentes de dominio
  por feature (`products`, `categories`, `sales`) y piezas de layout compartidas
  (`PageHeader`, `nav-items`).
- **Tokens semánticos de diseño.** `globals.css` define variables (`--background`,
  `--card`, `--foreground`, `--primary`, …) con variantes clara/oscura; los componentes
  usan tokens en lugar de colores fijos.
- **Dialog para formularios.** Los formularios de productos, categorías y ventas, y el
  detalle de venta, comparten un primitivo `Dialog` (Base UI).
- **Persistencia de tema.** El tema se aplica a `<html>` y se guarda en `localStorage`
  (clave independiente de la sesión); se respeta `prefers-color-scheme` y un script en
  línea evita el destello de tema incorrecto (FOUC).
- **Transacciones al registrar ventas.** Alta en una transacción interactiva de Prisma
  (`prisma.$transaction`): se validan productos (existentes, no archivados, con
  categoría activa), se calculan `unitPrice`/`subtotal` desde la base de datos y el
  `total` en el servidor, y se crean venta e ítems de forma atómica. El precio nunca se
  acepta del cliente.
- **Validación de imágenes.** Se valida el tipo por *magic bytes* (JPEG `FF D8 FF`,
  PNG `89 50 4E 47…`, WebP `RIFF…WEBP`) y un máximo de **5 MB**, comprobando que el
  tipo declarado coincida con el contenido antes de subir a Supabase Storage.

---

## Limitaciones

- **El login es simulado en el frontend.** Las credenciales se validan en el navegador
  y la sesión se guarda en `localStorage`.
- **No hay autenticación ni autorización real en la API.**
- **No hay roles ni permisos.**
- **No es una tienda pública.** No hay catálogo público, carrito, *checkout* ni pagos.
- **No está preparada para exposición pública** sin reforzar seguridad (auth,
  autorización, gestión de secretos/entornos, límites de tasa, CORS restringido,
  auditoría).
- **No se gestiona inventario/stock**; registrar una venta no descuenta unidades.
- **CORS** está fijado a `http://localhost:3000`.

### Mejoras futuras

- Autenticación y autorización reales (JWT/sesiones) con control de roles.
- Gestión de inventario con descuento de stock al vender.
- Paginación, búsqueda y filtros en los listados.
- Compresión/validación de imágenes en el cliente antes de subirlas.
- Pruebas end-to-end del frontend y mayor cobertura en el backend.
- Configuración por entornos y gestión de secretos.
- Internacionalización y accesibilidad auditada.

---

<div align="center">
<sub>Proyecto de prueba técnica · Documentación en español · MÖÖN — Contemporary Footwear</sub>
</div>
