# Bookstore Inventory API

API REST para gestión de inventario de librerías con cálculo de precio de venta
sugerido a partir de tasas de cambio en tiempo real, más una SPA que consume
todos sus endpoints.

Todo el sistema —base de datos, API y frontend— se levanta con un solo comando.

---

## Stack y decisiones

| Decisión | Elección | Por qué |
|---|---|---|
| Framework backend | **NestJS 11 + TypeScript** | El enunciado sugiere Django "de preferencia" pero deja el framework libre. NestJS es donde soy productiva, y su inyección de dependencias nativa hace que la arquitectura de puertos y adaptadores se exprese sin librerías extra. |
| Arquitectura | **Clean Architecture pragmática** | Aplicada donde paga: puerto + adaptador en el proveedor de tasas (permite el fallback y testear sin red) y en el repositorio. Sin sobre-diseñar: un solo value object, nada de CQRS ni event sourcing para una entidad. |
| Repositorio | **Monorepo** | El entregable pide un enlace. Un `README`, un `docker compose up` y un historial de commits que cuenta una sola historia. |
| Base de datos | **PostgreSQL 16 + Prisma 6** | Prisma da tipos generados desde el esquema y migraciones versionadas. Fijado a la v6 a propósito: la v7 exige `prisma.config.ts` y driver adapters, complejidad que este alcance no justifica. |
| Frontend | **React 19 + Vite + TanStack Query** | TanStack Query da estados de carga y error por petición sin escribirlos a mano, que es justo lo que pide el enunciado (loaders y toasts). |
| Estilos | **Tailwind v4** | Tokens de diseño declarados una vez en `@theme` y usados como utilidades. |

---

## Requisitos previos

- **Docker** y **Docker Compose** — es la vía recomendada
- Para desarrollo sin Docker: **Node 20+** y un PostgreSQL accesible

---

## Puesta en marcha con Docker

```bash
git clone <url-del-repositorio>
cd bookstore-inventory-api
cp .env.example .env
docker compose up --build
```

Eso levanta tres servicios:

| Servicio | URL | Notas |
|---|---|---|
| SPA | http://localhost:5173 | Servida por nginx |
| API | http://localhost:3000 | |
| PostgreSQL | localhost:**5433** | 5432 suele estar ocupado por una instalación nativa; dentro de la red de Compose sigue siendo 5432 |

El contenedor del backend aplica las migraciones y ejecuta el seed antes de
arrancar, así que la SPA se abre ya con **12 libros en 5 categorías**, cinco de
ellos con stock bajo. El seed deja la base en un estado conocido: si se reinicia
el contenedor, vuelve a esos 12 libros.

Para empezar de cero por completo, borrando el volumen de datos:

```bash
docker compose down -v && docker compose up --build
```

---

## Puesta en marcha local (sin Docker)

Hace falta la base de datos, que puede levantarse sola con Compose:

```bash
cp .env.example .env
docker compose up -d db
```

**Backend** (http://localhost:3000):

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

**Frontend** (http://localhost:5173):

```bash
cd frontend
npm install
npm run dev
```

> **Nota sobre el `.env`:** la aplicación lee el `.env` de la raíz del repositorio
> (Nest por configuración explícita, Vite mediante `envDir: '..'`). El **CLI de
> Prisma**, en cambio, busca el suyo en `backend/`, así que al ejecutar
> `prisma migrate` o `prisma db seed` desde la máquina hay que pasarle la
> variable:
>
> ```bash
> DATABASE_URL='postgresql://bookstore:bookstore@localhost:5433/bookstore?schema=public' npx prisma db seed
> ```
>
> Dentro de Docker no hace falta: el contenedor ya trae `DATABASE_URL`.

---

## Variables de entorno

Todas viven en un único `.env` en la raíz. `.env.example` es la plantilla y sus
valores funcionan tal cual.

| Variable | Ejemplo | Para qué |
|---|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `bookstore` | Credenciales del contenedor de PostgreSQL |
| `DB_PORT` | `5433` | Puerto en el que la base se publica en el host |
| `DATABASE_URL` | `postgresql://…@localhost:5433/bookstore?schema=public` | Conexión desde el host. Compose la sobrescribe para usar la red interna |
| `PORT` | `3000` | Puerto de la API |
| `CORS_ORIGIN` | `http://localhost:5173` | Origen permitido para la SPA |
| `LOCAL_CURRENCY` | `EUR` | Moneda local del cálculo de precio |
| `DEFAULT_MARGIN_PERCENTAGE` | `40` | Margen aplicado sobre el costo local |
| `EXCHANGE_RATE_API_URL` | `https://api.exchangerate-api.com/v4/latest/USD` | Proveedor de tasas |
| `EXCHANGE_RATE_FALLBACK` | `0.85` | Tasa de respaldo si el proveedor falla |
| `EXCHANGE_RATE_TIMEOUT_MS` | `5000` | Timeout de la llamada al proveedor |
| `VITE_API_URL` | `http://localhost:3000` | URL de la API que usa el navegador |
| `VITE_API_TIMEOUT_MS` | `10000` | Timeout de las peticiones del navegador |

No hay números mágicos en el código: márgenes, tasas por defecto y timeouts
salen todos de aquí.

---

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/books` | Crear libro |
| `GET` | `/books?page=1&limit=10` | Listar con paginación |
| `GET` | `/books/:id` | Obtener por ID |
| `PUT` | `/books/:id` | Actualizar (objeto completo) |
| `DELETE` | `/books/:id` | Eliminar |
| `POST` | `/books/:id/calculate-price` | Calcular y persistir el precio de venta |
| `GET` | `/books/search?category=…` | Buscar por categoría |
| `GET` | `/books/low-stock?threshold=10` | Libros por debajo del umbral |

Las respuestas usan `snake_case` porque así lo especifica el enunciado. Dentro
del código todo es `camelCase`; la traducción ocurre en la capa de presentación.

### Crear un libro

```bash
curl -X POST http://localhost:3000/books \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "El Quijote",
    "author": "Miguel de Cervantes",
    "isbn": "978-84-376-0494-7",
    "cost_usd": 15.99,
    "stock_quantity": 25,
    "category": "Literatura Clásica",
    "supplier_country": "ES"
  }'
```

```json
{
  "id": 13,
  "title": "El Quijote",
  "author": "Miguel de Cervantes",
  "isbn": "9788437604947",
  "cost_usd": 15.99,
  "selling_price_local": null,
  "stock_quantity": 25,
  "category": "Literatura Clásica",
  "supplier_country": "ES",
  "created_at": "2026-08-20T02:34:55.404Z",
  "updated_at": "2026-08-20T02:34:55.404Z"
}
```

El ISBN entra con guiones y **se guarda normalizado**, solo dígitos.

### Listar con paginación

```bash
curl 'http://localhost:3000/books?page=1&limit=10'
```

```json
{
  "items": [],
  "total": 12,
  "page": 1,
  "limit": 10,
  "total_pages": 2
}
```

La paginación la resuelve la base de datos (`skip`/`take` más `count` en una
transacción), no el cliente. `limit` por defecto es 10 y se recorta a un máximo
de 100 en lugar de rechazarse.

### Buscar por categoría y stock bajo

```bash
curl 'http://localhost:3000/books/search?category=Literatura%20Cl%C3%A1sica'
curl 'http://localhost:3000/books/low-stock?threshold=10'
```

La búsqueda por categoría ignora mayúsculas (`mode: 'insensitive'`) pero no
acentos. El umbral de stock bajo es **estrictamente menor**: con `threshold=10`,
un libro con 10 unidades no aparece.

### Calcular el precio de venta

```bash
curl -X POST http://localhost:3000/books/1/calculate-price
```

```json
{
  "book_id": 1,
  "cost_usd": 15.99,
  "exchange_rate": 0.858,
  "cost_local": 13.72,
  "margin_percentage": 40,
  "selling_price_local": 19.21,
  "currency": "EUR",
  "rate_source": "api",
  "calculation_timestamp": "2026-08-20T02:35:05.983Z"
}
```

`rate_source` es un campo añadido sobre lo que pide el enunciado: hace observable
si la tasa vino del proveedor externo o del fallback, sin mirar los logs.

---

## Reglas de negocio

- `cost_usd` debe ser mayor que 0
- `stock_quantity` debe ser un entero mayor o igual que 0
- El ISBN debe tener 10 o 13 dígitos; los guiones y espacios se ignoran al
  validar y **no se almacenan**
- No se permiten ISBN duplicados
- `supplier_country` es un código ISO de 2 letras
- El precio de venta se calcula como `cost_usd × tasa × (1 + margen/100)` y se
  redondea **una sola vez, al final**

Sobre el redondeo, con el ejemplo del enunciado: `15.99 × 0.85 = 13.5915` y
`13.5915 × 1.4 = 19.0281`, que se presentan como `13.59` y `19.03`. Redondear el
costo local antes de aplicar el margen daría un resultado distinto en cuanto las
cifras dejan de ser tan redondas. El dinero se guarda en columnas
`Decimal(12,2)`; en el dominio se trabaja con `number` para que la capa de
dominio no dependa de ninguna librería externa.

---

## Manejo de errores

| Situación | Código | `error` |
|---|---|---|
| Body inválido (validación de campos) | `400` | `VALIDATION_ERROR` |
| ISBN mal formado | `400` | `INVALID_ISBN` |
| Libro inexistente | `404` | `BOOK_NOT_FOUND` |
| ISBN duplicado | `409` | `DUPLICATE_ISBN` |
| Proveedor de tasas caído **sin fallback configurado** | `503` | `EXCHANGE_RATE_UNAVAILABLE` |
| Error inesperado | `500` | `INTERNAL_SERVER_ERROR` |

Todos comparten el mismo formato:

```json
{
  "statusCode": 409,
  "error": "DUPLICATE_ISBN",
  "message": "A book with ISBN 9788437604947 already exists",
  "timestamp": "2026-08-20T02:49:24.931Z",
  "path": "/books"
}
```

En los errores de validación de campos, `message` es un **array** con un mensaje
por campo inválido:

```json
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": ["cost_usd must be a positive number"],
  "timestamp": "2026-08-20T02:49:25.858Z",
  "path": "/books"
}
```

### Por qué 409 y no 400 en el ISBN duplicado

Un 400 dice "la petición está mal formada". Y no lo está: el JSON es válido, los
tipos son correctos y el ISBN cumple el formato. Lo que falla es que **choca con
el estado actual del servidor** — ese mismo cuerpo habría funcionado un minuto
antes, y volvería a funcionar si se borrara el libro que ocupa ese ISBN. Eso es
exactamente lo que significa un 409 Conflict. La distinción importa para quien
consume la API: ante un 400 hay que corregir los datos; ante un 409, decidir qué
hacer con el recurso que ya existe.

### Cómo se traducen los errores

Los errores de dominio (`InvalidIsbnError`, `DuplicateIsbnError`…) no conocen
HTTP: llevan un `code`, no un status. Un único `DomainExceptionFilter` traduce
ese código al status correspondiente. Los casos de uso nunca lanzan
`HttpException`, lo que permite reutilizarlos fuera de un contexto HTTP y
mantiene el mapa de códigos en un solo archivo.

---

## Estrategia de fallback de la tasa de cambio

El adaptador `ExchangeRateApiProvider` implementa un puerto del dominio y
garantiza no propagar nunca un error de red. Cuatro modos de fallo convergen en
el mismo `catch` y devuelven la tasa de respaldo:

| Fallo | Cómo se detecta | En el log |
|---|---|---|
| Timeout | Opción `timeout` de axios | `timed out after 5000ms` |
| Error de red | Rechazo sin `response` | `ECONNREFUSED` |
| Respuesta no-200 | `validateStatus` por defecto de axios | `HTTP 429` |
| Moneda ausente en un 200 | Comprobación explícita del payload | `response has no usable rate for EUR` |

En los cuatro casos la petición responde **200** con `rate_source: "fallback"` y
el backend registra un `WARN`. El único caso que produce un 503 es que **no haya
tasa de respaldo configurada**: entonces no hay forma honesta de responder.

Para verlo funcionando, basta arrancar el backend apuntando a un host muerto:

```bash
EXCHANGE_RATE_API_URL=http://127.0.0.1:9/latest/USD npm run start:dev
```

El cálculo sigue devolviendo 200, con tasa `0.85`, y la SPA marca la línea de la
tasa como **"tasa por defecto"** en ámbar.

---

## La SPA

`http://localhost:5173`. Integra los ocho endpoints:

- **Dashboard** con tabla paginada desde el servidor, filtro por categoría y
  vista rápida de stock bajo
- **Alta y edición** en un formulario que valida ISBN, costo y stock **antes** de
  enviar la petición, mostrando el error bajo el campo
- **Borrado** con diálogo de confirmación
- **Cálculo de precio** presentado como un recibo con el desglose completo:
  costo original, tasa aplicada y su procedencia, costo local, margen y precio
  final
- **Estados**: skeleton en la carga inicial, spinner en los botones al enviar, y
  toasts que muestran el mensaje real que devolvió la API

Un interceptor de axios normaliza cualquier fallo —error de negocio, timeout o
servidor apagado— a una forma única `{ status, code, message }`, que es lo que
permite que un 409 se vea como *"A book with ISBN … already exists"* en lugar de
"Network Error".

---

## Verificación

**Script de humo** — ejercita los ocho endpoints y los casos de error,
imprimiendo el código HTTP de cada uno:

```bash
bash scripts/smoke.sh                        # http://localhost:3000 por defecto
bash scripts/smoke.sh http://localhost:3001
```

Genera un ISBN único por ejecución y borra lo que crea, así que puede ejecutarse
tantas veces como haga falta. Termina con código de salida distinto de cero si
algo falla.

**Colección de Postman** — `docs/postman_collection.json`. Se importa en Postman
y se ejecuta con *Run collection*: cada petición lleva sus tests, incluidos los
casos de error y una comprobación de que la aritmética del precio cuadra.

---

## Estructura del proyecto

```
bookstore-inventory-api/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── books/
│       │   ├── domain/           # entidad, value object, puertos, errores
│       │   ├── application/      # casos de uso (uno por clase)
│       │   ├── infrastructure/   # adaptadores: Prisma y HTTP
│       │   └── presentation/     # controller y DTOs
│       └── shared/               # filtro de errores, paginación, prisma
├── frontend/
│   └── src/
│       ├── api/                  # cliente axios y funciones por endpoint
│       ├── components/ui/        # Modal, Toast
│       ├── features/books/       # hooks, componentes y página
│       └── types/
├── docs/postman_collection.json
├── scripts/smoke.sh
├── docker-compose.yml
└── .env.example
```

La regla de dependencia apunta siempre hacia dentro:
`presentation → application → domain`, con `infrastructure` implementando los
puertos que el dominio define. La carpeta `domain/` no importa NestJS, Prisma ni
axios, y se puede comprobar mecánicamente:

```bash
grep -rE "@nestjs|@prisma|axios" backend/src/books/domain/   # sin resultados
```

---

## Fuera de alcance

Autenticación, tests end-to-end, CI/CD e internacionalización quedaron fuera a
propósito, para invertir el tiempo en la arquitectura, el manejo de errores y la
integración externa, que es lo que el enunciado señala como importante.
