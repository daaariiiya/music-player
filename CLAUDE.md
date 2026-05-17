# CLAUDE.md — Music App Project Rules

This file is read automatically by Claude Code at the start of every session.
All rules below are mandatory and must be followed without exception.

\---

## Project Overview

Full-stack music player web application.

* **Backend**: `backend/` — Hono + TypeScript + Drizzle ORM + PostgreSQL (Neon)
* **Frontend**: `frontend/` — React 18 + Vite + TypeScript

\---

## Tech Stack

### Backend

|Concern|Library|
|-|-|
|Framework|Hono (NOT Express)|
|Language|TypeScript strict mode|
|ORM|Drizzle ORM (NOT Prisma)|
|Database|PostgreSQL via Neon serverless|
|Validation|Yup|
|Auth|JWT manually (jsonwebtoken)|
|Passwords|bcrypt (rounds = 12)|
|Email|Brevo HTTP API via fetch()|
|File upload|multer → Cloudinary (via backend)|
|Runtime|Node.js via @hono/node-server|

### Frontend

|Concern|Library|
|-|-|
|Framework|React 18 + Vite + TypeScript|
|Server state|SWR|
|Client state|Zustand|
|Forms|React Hook Form + Yup|
|Routing|React Router v6 (lazy loading)|
|HTTP client|Axios (with interceptors)|
|Notifications|react-toastify|

\---

## Database Schema

```
users
  user\_id         serial PK
  username        varchar(50) NOT NULL
  email           varchar(100) NOT NULL UNIQUE
  password\_hash   varchar(255) NOT NULL
  role            varchar(10) NOT NULL DEFAULT 'user'   -- 'user' | 'admin'
  verified        boolean NOT NULL DEFAULT false
  verification\_token   varchar(255)
  reset\_token          varchar(255)
  reset\_token\_expires\_at timestamp
  created\_at      timestamp DEFAULT now()

photos
  photo\_id        serial PK
  url             varchar(500) NOT NULL
  created\_at      timestamp DEFAULT now()

performers
  performer\_id    serial PK
  type            varchar(10) NOT NULL   -- 'artist' | 'group'
  genre           varchar(100) NOT NULL
  country         varchar(100) NOT NULL
  photo\_id        integer FK → photos.photo\_id
  created\_at      timestamp DEFAULT now()

artists
  artist\_id       serial PK
  performer\_id    integer FK → performers.performer\_id UNIQUE
  name            varchar(100) NOT NULL
  birthday\_date   date NOT NULL
  bio             text
  career\_started\_date date NOT NULL

music\_groups
  group\_id        serial PK
  performer\_id    integer FK → performers.performer\_id UNIQUE
  name            varchar(100) NOT NULL
  year\_created    integer NOT NULL
  bio             text

artists\_in\_groups
  artist\_id       integer FK → artists.artist\_id
  group\_id        integer FK → music\_groups.group\_id
  start\_date      date NOT NULL
  end\_date        date
  PRIMARY KEY (artist\_id, group\_id, start\_date)

albums
  album\_id        serial PK
  title           varchar(200) NOT NULL
  description     text
  release\_date    date NOT NULL
  performer\_id    integer FK → performers.performer\_id NOT NULL
  photo\_id        integer FK → photos.photo\_id
  created\_at      timestamp DEFAULT now()

songs
  song\_id         serial PK
  title           varchar(200) NOT NULL
  description     text
  release\_date    date NOT NULL
  duration\_seconds integer NOT NULL
  album\_id        integer FK → albums.album\_id  -- nullable
  performer\_id    integer FK → performers.performer\_id NOT NULL
  photo\_id        integer FK → photos.photo\_id
  created\_at      timestamp DEFAULT now()

playlists
  playlist\_id     serial PK
  user\_id         integer FK → users.user\_id NOT NULL
  title           varchar(200) NOT NULL
  description     text
  created\_at      timestamp DEFAULT now()

songs\_in\_playlists
  song\_id         integer FK → songs.song\_id
  playlist\_id     integer FK → playlists.playlist\_id
  added\_at        timestamp DEFAULT now()
  PRIMARY KEY (song\_id, playlist\_id)
```

\---

## Backend Architecture — Strict 4-Layer

```
Request
  ↓
\*.router.ts      — Hono routes only, attach middleware, call controller
  ↓
\*.controller.ts  — parse context, call service, return response
  ↓
\*.service.ts     — ALL business logic (no request/response objects)
  ↓
\*.repository.ts  — ALL Drizzle queries only (zero business logic)
```

**Dependency rule**: each layer imports only from the layer directly below it.

* Service NEVER imports from controller
* Repository NEVER contains business logic
* Controller NEVER imports `db` directly

### Each backend module has exactly 5 files:

```
src/modules/<name>/
  <name>.router.ts
  <name>.controller.ts
  <name>.service.ts
  <name>.repository.ts
  <name>.schema.ts
```

### Backend modules:

* `auth`
* `performers`
* `albums`
* `songs`
* `playlists`
* `groups`
* `statistics`
* `upload` (Cloudinary upload endpoint)

\---

## Backend File Conventions

### `src/config/env.ts` — Yup-validated env (validate at startup)

```typescript
// All env vars validated here. App crashes on missing vars.
export const env = { PORT, DATABASE\_URL, JWT\_SECRET, JWT\_REFRESH\_SECRET,
                     CLIENT\_URL, BREVO\_API\_KEY, BREVO\_SENDER\_EMAIL,
                     CLOUDINARY\_CLOUD\_NAME, CLOUDINARY\_API\_KEY, CLOUDINARY\_API\_SECRET,
                     NODE\_ENV }
```

### `src/config/database.ts` — Drizzle singleton

```typescript
// Pattern: Singleton
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
const client = postgres(env.DATABASE\_URL, { ssl: 'require' })
export const db = drizzle(client)
```

### `src/utils/response.ts` — response factories

```typescript
// Pattern: Factory
export const success = <T>(message: string, data?: T) =>
  ({ success: true, message, ...(data !== undefined \&\& { data }) })

export const apiError = (message: string, errors?: ValidationError\[]) =>
  ({ success: false, message, ...(errors?.length \&\& { errors }) })
```

### `src/utils/errors.ts` — error hierarchy

```typescript
class AppError extends Error { constructor(message: string, public statusCode: number) }
class NotFoundError    extends AppError { constructor(msg = 'Not found')    { super(msg, 404) } }
class BadRequestError  extends AppError { constructor(msg = 'Bad request')  { super(msg, 400) } }
class ConflictError    extends AppError { constructor(msg = 'Conflict')     { super(msg, 409) } }
class UnauthorizedError extends AppError { constructor(msg = 'Unauthorized') { super(msg, 401) } }
class ForbiddenError   extends AppError { constructor(msg = 'Forbidden')    { super(msg, 403) } }
```

### `src/middleware/error.middleware.ts`

Global Hono `onError` handler — catches `AppError` subclasses and returns proper JSON.

### Auth tokens

* **Access token**: 15 min, returned in response body `{ accessToken }`
* **Refresh token**: 7 days, stored in `httpOnly` cookie named `refreshToken`
* Separate secrets: `JWT\_SECRET` and `JWT\_REFRESH\_SECRET`

### `src/middleware/auth.middleware.ts`

```typescript
// Pattern: Chain of Responsibility
// Reads Bearer token from Authorization header
// Sets c.set('userId', ...) and c.set('role', ...)
```

### `src/middleware/validate.middleware.ts`

```typescript
// Pattern: Strategy
// Accepts a Yup schema, validates c.req.json(), sets c.set('body', validated)
```

### Drizzle schema location

All table definitions live in `src/schema/` — one file per table or logical group.

\---

## Hono Specifics

```typescript
// app.ts — setup
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

// server.ts — entry point using @hono/node-server
import { serve } from '@hono/node-server'
```

For file uploads: use `multer` as Node.js middleware, adapt to Hono via raw `req`/`res` from `@hono/node-server`.

\---

## Drizzle ORM Patterns

```typescript
// ALWAYS use Drizzle query builder — never raw SQL strings
import { eq, and, desc, count } from 'drizzle-orm'

// Repository functions are plain async functions, not classes
export const findById = (id: number) =>
  db.select().from(users).where(eq(users.user\_id, id)).limit(1).then(r => r\[0] ?? null)
```

Drizzle config: `drizzle.config.ts` in `backend/` root.
Migrations: `src/db/migrations/`

\---

## Yup Validation Patterns

```typescript
// Each module's \*.schema.ts exports named Yup schemas
export const createSongSchema = yup.object({
  title:           yup.string().min(1).max(200).required(),
  release\_date:    yup.string().matches(/^\\d{4}-\\d{2}-\\d{2}$/).required(),
  duration\_seconds: yup.number().integer().positive().required(),
  performer\_id:    yup.number().integer().positive().required(),
  album\_id:        yup.number().integer().positive().optional(),
  description:     yup.string().max(1000).optional(),
})
```

\---

## Email — Brevo HTTP API

Use `fetch()` to call `https://api.brevo.com/v3/smtp/email`.
**NEVER use nodemailer or any SMTP transport** — cloud platforms block ports 587/465.

```typescript
// email.service.ts lives in src/services/ (shared, not per-module)
// Pattern: Service
await fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: { 'api-key': env.BREVO\_API\_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ sender, to, subject, htmlContent })
})
```

\---

## Image Upload — Cloudinary via Backend

Flow: `frontend → POST /upload (multipart) → backend multer → Cloudinary → { photoId }`

* Upload endpoint: `POST /upload` (auth required)
* Returns `{ photoId: number }` after inserting into `photos` table
* All create/update forms send `photoId` as a number field, not a file

```typescript
// upload.service.ts
// Pattern: Service
import { v2 as cloudinary } from 'cloudinary'
// Upload buffer via upload\_stream, insert URL into photos table, return photoId
```

\---

## API Response Format

Every endpoint MUST use the helper functions:

```typescript
// Success
return c.json(success('Song created.', { songId }), 201)

// Error (thrown, caught by global handler)
throw new NotFoundError('Song not found.')

// Validation error (in validate middleware)
return c.json(apiError('Validation failed.', err.inner), 400)
```

\---

## Frontend Architecture

### File structure

```
frontend/src/
  api/           — one file per module (auth.api.ts, songs.api.ts, ...)
  components/    — shared reusable UI components
  hooks/         — SWR hooks (useEvents.ts, useSongs.ts, ...)
  pages/         — thin page components, compose hooks + components
  store/         — Zustand stores (auth.store.ts, ui.store.ts)
  router/        — index.tsx, PrivateRoute, AdminRoute
  utils/         — helpers, formatters
  types/         — shared TypeScript interfaces
```

### Axios client (`api/client.ts`)

* Single instance with `baseURL = import.meta.env.VITE\_API\_URL`
* Request interceptor: inject access token from Zustand store
* Response interceptor: on 401 → call `POST /auth/refresh` → retry original request
* Queue concurrent 401s to avoid multiple refresh calls

### Zustand auth store (`store/auth.store.ts`)

```typescript
// Access token: in memory only (NOT localStorage)
// Refresh token: httpOnly cookie (browser handles automatically)
// Persist only: userId, role (no tokens)
{ userId, role, accessToken, isAuthenticated,
  setAuth, setAccessToken, clearAuth }
```

### SWR hooks

* One hook per resource in `hooks/` folder
* Key format: `\['resource', filters]`
* After mutations: call `mutate(\['resource'])` to revalidate

### React Hook Form

```typescript
// ALWAYS use RHF + yupResolver for forms
// NEVER use useState for form fields
const form = useForm({ resolver: yupResolver(schema) })
```

### Pages must be thin

* Pages only compose components and call hooks
* NO direct API calls in pages
* NO form state in pages
* NO business logic in pages

### Routing

* All routes lazy-loaded via `React.lazy` + `Suspense`
* `PrivateRoute` — redirect to `/login` if not authenticated
* `AdminRoute` — redirect to `/` if not admin

\---

## Environment Variables

### `backend/.env`

```
DATABASE\_URL=postgresql://...@ep-xxx.neon.tech/dbname?sslmode=require
JWT\_SECRET=<random 32+ chars>
JWT\_REFRESH\_SECRET=<another random string>
PORT=8080
NODE\_ENV=development
CLIENT\_URL=http://localhost:5173
BREVO\_API\_KEY=xkeysib-...
BREVO\_SENDER\_EMAIL=your@email.com
CLOUDINARY\_CLOUD\_NAME=...
CLOUDINARY\_API\_KEY=...
CLOUDINARY\_API\_SECRET=...
```

### `frontend/.env`

```
VITE\_API\_URL=http://localhost:8080
```

\---

## Code Quality Requirements

### JSDoc on all exported service and repository functions

```typescript
/\*\*
 \* Finds a user by email address.
 \* @param email - The user's email
 \* @returns User record or null if not found
 \*/
export const findByEmail = (email: string): Promise<User | null> => ...
```

### Pattern comments (required in these files)

|Comment|Where|
|-|-|
|`// Pattern: Repository`|All `\*.repository.ts` files|
|`// Pattern: Singleton`|`config/database.ts`|
|`// Pattern: Factory`|`utils/response.ts`|
|`// Pattern: Strategy`|`middleware/validate.middleware.ts`|
|`// Pattern: Chain of Responsibility`|`middleware/auth.middleware.ts`|
|`// Pattern: Service`|`services/email.service.ts`, `modules/upload/upload.service.ts`|

### Code style

* Early returns — max 2-3 levels of nesting
* Meaningful names — no `a`, `b`, `tmp`, `data` as standalone variable names
* No dead code — no commented-out code blocks
* No `// @ts-ignore` — fix the type

\---

## NEVER Do These

### Backend

* ❌ NEVER write raw SQL strings — Drizzle ORM only
* ❌ NEVER put business logic in router or controller
* ❌ NEVER import `db` directly in service — only via repository functions
* ❌ NEVER use `req`/`res` inside service functions
* ❌ NEVER use `// @ts-ignore`
* ❌ NEVER put HTML email templates inline in `.ts` files — use template string constants in `email.service.ts`
* ❌ NEVER use nodemailer or SMTP — Brevo HTTP API only
* ❌ NEVER hardcode secrets — always from `env` object (validated config)

### Frontend

* ❌ NEVER build form state with `useState` — React Hook Form only
* ❌ NEVER hardcode API URL — use `import.meta.env.VITE\_API\_URL`
* ❌ NEVER store tokens in `localStorage` — access token in Zustand memory, refresh in httpOnly cookie
* ❌ NEVER make direct API calls in page components — use hooks
* ❌ NEVER use `<form>` HTML element in React — use RHF's `handleSubmit`

\---

## Deployment

### Backend → Render (`backend/render.yaml`)

```yaml
services:
  - type: web
    name: music-app-api
    env: node
    rootDir: backend
    buildCommand: npm install \&\& npm run build
    startCommand: npm start
```

### Frontend → Netlify

* Build command: `npm run build`
* Publish directory: `dist`
* Add `frontend/public/\_redirects`: `/\* /index.html 200`

### Database → Neon (serverless PostgreSQL, EU Frankfurt)

\---

## Implementation Phases

* **Phase 1** Backend Foundation (config, schema, utils, middleware, app, server)
* **Phase 2** Auth Module (register, verify email, login, refresh, forgot/reset password)
* **Phase 3** Core Modules (performers, albums, songs, playlists, groups, statistics, upload)
* **Phase 4** Frontend Foundation (Axios client, Zustand, router, base components)
* **Phase 5** Frontend Features (all pages, SWR hooks, API functions)
* **Phase 6** Polish (error boundaries, toasts, loading states, eslint)

**Always ask before moving to the next phase.**

