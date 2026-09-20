# P0 scope freeze — catalogo / vetrina read-only

Questo documento congela il perimetro del primo go-live descritto in [SHOWROOM_MASTER_PLAN.md](../SHOWROOM_MASTER_PLAN.md). Aggiornare solo con decisione esplicita del team.

## Owner e governance

| Ruolo | Owner | Note |
|-------|-------|------|
| Product / scope | **TBD — da assegnare** | Approva inclusioni/esclusioni P0 |
| Tech / release | **TBD — da assegnare** | Deploy, env, DB, rollback |
| Contenuti cliente | **TBD — da assegnare** | Dati nel DB prima del live |

## Definizione di «read-only» (P0)

| Superficie | Comportamento P0 |
|------------|------------------|
| **Storefront pubblico** (`storefront-v2`) | Solo navigazione catalogo: homepage composta, pagina prodotto, pagina collezione. Nessun carrello, checkout o account cliente finale se non già previsto altrove. |
| **API pubbliche** (`GET /api/v2/frontend/...`) | Solo lettura; idempotenti; pensate per ISR/cache. |
| **Dashboard Vetrina `/v2` e API di scrittura** | Possono restare **attive in staging** per preparare prodotti, media e pubblicazione. In **produzione**, l’accesso V2 è controllato da `V2_ENABLED` / `V2_ENABLED_SHOPS` (vedi [lib/v2/feature-flag.ts](../lib/v2/feature-flag.ts)). Eventuale blocco totale delle `POST`/`PATCH`/`DELETE` in prod è una decisione operativa separata (non richiesta dal solo «read-only» vetrina). |

## Endpoint storefront inclusi nel go-live P0

Tutti sotto il prefisso `GET /api/v2/frontend/{shopSlug}/…`.

| Risorsa | Path | Note |
|---------|------|------|
| Homepage pubblicata | `/homepage` | Sezioni composer pubblicate, `revalidate` 60s |
| Prodotto | `/products/{slug}` | Solo prodotti `ACTIVE`/`SEASONAL` con intent di pubblicazione storefront |
| Collezione | `/collections/{slug}` | Come implementato in route handler |

On-demand revalidation (operativa, non necessaria al primo smoke):

| Path | Uso |
|------|-----|
| `POST /api/v2/frontend/revalidate` | Segreto condiviso `REVALIDATION_SECRET` con `storefront-v2` |

## Esplicitamente fuori da P0 go-live

| Area | Motivo |
|------|--------|
| Server GraphQL runtime | Contratto e codegen in [graphql/](../graphql/README.md); implementazione in P1 |
| B2B cataloghi pubblici, Hub, orchestrazione | Fuori perimetro Showroom P0 / altri binari |
| Publication scheduling avanzato, audience rules complete | Backlog P1/P2 |
| Multi-shop su un solo deploy storefront senza `SHOP_SLUG` | Richiede strategia hostname — decidere in P1 se serve |

## Criteri di «done» P0 (storefront)

1. Deploy Showroom (API) + `storefront-v2` su Vercel con DB managed e variabili allineate ([docs/deploy-vercel.md](deploy-vercel.md)).
2. Almeno un tenant con prodotti e homepage pubblicata visibili end-to-end.
3. Smoke: homepage, PDP, pagina collezione; 404 per slug inesistente gestito.
4. Schema GraphQL read-only e mapping tipi documentati ([graphql/README.md](../graphql/README.md), [docs/graphql-typescript-mapping.md](graphql-typescript-mapping.md)).

## Checklist operativa settimana 1

Usare [week1-execution-checklist.md](week1-execution-checklist.md) come segno-spunta giornaliero allineato al piano 14 giorni.
