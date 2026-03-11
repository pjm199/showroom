# Showroom

Live digital showroom for local shops (fish markets, butchers, bakeries, etc.). MVP: hosted + embeddable storefronts, mobile-first merchant dashboard, reservations.

## Tech stack

- **Next.js 15** (App Router), **React 19**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**
- **PostgreSQL** + **Prisma ORM**
- API-first (`app/api/...`) for future native apps

## Setup

1. **Install dependencies** (already done if you ran the scaffold):
   ```bash
   npm install
   ```

2. **Database**
   - Install PostgreSQL and create a database (e.g. `showroom`).
   - Copy `.env.example` to `.env` and set `DATABASE_URL`:
     ```bash
     DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/showroom?schema=public"
     ```
   - Run migrations:
     ```bash
     npx prisma migrate dev --name init
     npx prisma generate
     ```

3. **Run the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Description                |
|----------------|----------------------------|
| `npm run dev`  | Dev server (Turbopack)     |
| `npm run build`| Production build           |
| `npm run start`| Run production build       |
| `npm run lint` | Run ESLint                 |

## Project layout

- `app/` — Routes (pages, layouts), API route handlers under `app/api/`
- `components/` — UI: `ui/` (shadcn), `dashboard/`, `storefront/`, `shared/`
- `lib/` — DB client (`db.ts`), auth, storage, validations
- `prisma/` — Schema and migrations
- `docs/` — [ARCHITECTURE.md](docs/ARCHITECTURE.md), [SCAFFOLD.md](docs/SCAFFOLD.md)

## Docs

- [Architecture & roadmap](docs/ARCHITECTURE.md)
- [Scaffold commands](docs/SCAFFOLD.md)
- [Phase 1 test flow](docs/Phase_1.TEST_FLOW.md)
