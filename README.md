# Magic Man Vinyl

Tienda en línea para vender vinilos: catálogo público con pedidos por depósito,
y panel de administración privado para agregar discos y revisar pedidos.

- **Público**: `/` (inicio) → `/catalogo` (orden por más nuevo, A-Z, precio, y
  búsqueda por artista/álbum) → ficha del disco → formulario de pedido (nombre,
  apellido, teléfono, correo opcional, dirección y foto del comprobante de
  depósito) → `/rastreo` para que el cliente consulte el estado de su pedido
  con su número de orden + teléfono o correo.
- **Admin** (`/admin`, protegido con contraseña): resumen con analítica,
  alta/edición/borrado de vinilos (con cantidad de unidades en inventario),
  lista de pedidos con el comprobante y datos del cliente, y configuración de
  los datos bancarios que ven los clientes.

Cada vinilo tiene un número de unidades. La disponibilidad se calcula
automáticamente: un pedido reserva una unidad hasta que se rechaza (la unidad
se libera) o se confirma/envía (se descuenta del inventario). Cuando ya no
quedan unidades sin reservar, el vinilo desaparece del catálogo.

## Stack

Next.js (App Router) + Tailwind CSS · Prisma sobre Postgres de Supabase ·
Supabase Storage para las fotos (bucket público `productos`, bucket privado
`depositos`) · sesión de admin con cookie firmada (JWT).

## Configuración inicial

1. Copia `.env.example` a `.env` y completa los valores (ver comentarios en el
   archivo): la cadena de conexión de la base de datos de Supabase, la URL y
   `service role key` del proyecto de Supabase, una contraseña de admin, y un
   `SESSION_SECRET` aleatorio.
2. Instala dependencias: `npm install`.
3. Crea las tablas en la base de datos: `npm run db:migrate`.
4. Crea los buckets de Storage en Supabase: `npm run setup:supabase`.
5. Corre el sitio en desarrollo: `npm run dev` y abre `http://localhost:3000`.

Para probarlo desde tu celular: conecta el celular a la misma red Wi-Fi que tu
PC, corre `npm run dev`, y en el celular abre `http://TU-IP-LOCAL:3000`
(tu IP local la ves con `ipconfig`, busca "Dirección IPv4").

## Uso diario

- **Agregar un vinilo**: entra a `/admin` → Productos → Agregar vinilo. Sube la
  foto, escribe artista, álbum, precio y unidades disponibles (género/año/
  estado son opcionales pero quedan guardados para la analítica).
- **Revisar pedidos**: `/admin/pedidos` lista todas las órdenes con su número,
  disco y cliente; puedes filtrar por estado. Al entrar a una orden ves el
  comprobante de depósito y los datos del cliente, y puedes marcarla como
  Confirmada, Enviada o Rechazada (al rechazar, el disco vuelve a estar
  disponible en el catálogo).
- **Datos de depósito**: `/admin/configuracion` para escribir el banco, número
  de cuenta, tipo de cuenta y titular que ven los clientes al pedir.

## Despliegue en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. En Vercel, importa el repositorio.
3. Agrega las mismas variables de entorno de tu `.env` en Vercel (Project
   Settings → Environment Variables).
4. Despliega. Cada vez que hagas push a la rama principal, Vercel actualiza el
   sitio automáticamente.

## Estructura relevante

- `src/app/(public)` — sitio público (catálogo, ficha, pedido).
- `src/app/admin` — panel de administración (protegido por `src/proxy.ts`).
- `src/lib` — acceso a datos (Prisma), Supabase Storage, sesión/auth,
  validaciones con zod.
- `prisma/schema.prisma` — modelos `Product`, `Order`, `Settings`.
- `scripts/setup-supabase.mjs` — crea los buckets de Storage necesarios.
