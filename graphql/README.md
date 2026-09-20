# GraphQL — storefront read contract (design-first)

Per il piano P0, **GraphQL-first** significa: schema SDL condiviso, tipi generati, allineamento con `types/v2/*`. Il **server GraphQL** (resolver + route) è **P1** dopo il read-only REST stabile.

## File

| File | Ruolo |
|------|--------|
| [storefront-read.graphql](storefront-read.graphql) | Schema read-only (homepage, product page, collection page) |
| [codegen.yml](codegen.yml) | Configurazione GraphQL Code Generator |
| [generated/storefront-read.types.ts](generated/storefront-read.types.ts) | Tipi TypeScript generati (rigenerare dopo modifiche allo schema) |

## Comandi

```bash
npm install
npm run graphql:codegen
```

Non è necessario per `npm run build` dell’app Next.js; eseguire quando lo schema evolve.

## Note implementative future (P1)

- Mappare gli stessi campi esposti da `GET /api/v2/frontend/{shopSlug}/…` per evitare drift.
- Tenant scoping: `shopSlug` obbligatorio come nel REST.
- `JSONObject` copre `RenderedSection.bindings` e `config` come oggi modellati in TypeScript con `Record<string, unknown>`.

## Mapping TypeScript

Vedi [docs/graphql-typescript-mapping.md](../docs/graphql-typescript-mapping.md).
