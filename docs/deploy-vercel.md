# Deploy — Vercel e database managed

Guida operativa per allineare [SHOWROOM_MASTER_PLAN.md](../SHOWROOM_MASTER_PLAN.md) (Vercel + DB managed) con questa repo.

## Database managed

1. Provisioning di **PostgreSQL** (es. Supabase, Neon, altro) nella regione concordata.
2. Ottenere due connection string se il provider le distingue:
   - **Pooler** (runtime app serverless): ideale per `DATABASE_URL` / `DATABASE_URL_V2`.
   - **Direct** (migrazioni Prisma): `DIRECT_URL` / `DIRECT_URL_V2` quando il provider lo richiede (vedi [Prisma — connection pool](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)).
3. Applicare schema V2 sulla stessa istanza o separata, ma coerente con [docs/vetrina-v2-migration-runbook.md](vetrina-v2-migration-runbook.md).

Variabili minime (vedi anche [.env.example](../.env.example)):

| Variabile | Dove | Descrizione |
|-----------|------|-------------|
| `DATABASE_URL` | App Showroom | Prisma V1 |
| `DATABASE_URL_V2` | App Showroom | Prisma V2 (`prisma/schema-v2.prisma`) |
| `DIRECT_URL` / `DIRECT_URL_V2` | Build CI / migrate | Opzionale ma consigliato per migrate senza errori pooler |

## Progetto Vercel — app Showroom (API + dashboard)

1. Collegare il repository; **Root Directory** = root del monorepo (se un solo progetto).
2. **Build**: lo script [`scripts/build.mjs`](../scripts/build.mjs) orchestra il build; allineare **Install Command** se usi workspace (`npm ci`).
3. Impostare tutte le variabili da [.env.example](../.env.example) per **Production** e **Preview** (Preview deve poter puntare a un DB di staging).
4. **AUTH_SECRET**, **NEXTAUTH_URL** (URL canonico produzione).
5. **V2_ENABLED_SHOPS** o `V2_ENABLED` secondo policy (vedi [lib/v2/feature-flag.ts](../lib/v2/feature-flag.ts)).
6. **REVALIDATION_SECRET** — stesso valore del progetto `storefront-v2` se si usa revalidate on-demand.
7. **NEXT_PUBLIC_STOREFRONT_URL** — URL pubblico del `storefront-v2` per link preview/composer se usati.

## Progetto Vercel — storefront-v2

Opzione consigliata per P0: **secondo progetto** nella stessa repo con **Root Directory** = `storefront-v2`.

| Variabile | Descrizione |
|-----------|-------------|
| `VETRINA_API_URL` | URL pubblico dell’app Showroom (es. `https://vetrina.example.com`) |
| `SHOP_SLUG` | Slug del negozio per il deploy (single-tenant per progetto) |
| `REVALIDATION_SECRET` | Uguale a Showroom |

Build tipico: `npm run build` dentro `storefront-v2` (vedi [`storefront-v2/package.json`](../storefront-v2/package.json)).

## Checklist pre-go-live

- [ ] `npm run build` locale verde per Showroom e per `storefront-v2`.
- [ ] `npm run v2:migrate:deploy` (o pipeline CI) contro DB produzione con `DIRECT_URL_V2` se necessario.
- [ ] `npm run v2:seed:sections` eseguito almeno una volta per ambiente nuovo.
- [ ] Smoke su URL di preview Vercel prima di spostare DNS.

## Note DNS

- Dominio vetrina cliente → progetto `storefront-v2`.
- Sottodominio API/dashboard → progetto Showroom (o stesso host con path diversi se reverse proxy — da coordinare con infrastruttura).
