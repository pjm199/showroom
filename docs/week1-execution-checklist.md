# Settimana 1 — checklist esecutiva (giorni 1–7)

Riferimento roadmap 14 giorni in [SHOWROOM_MASTER_PLAN.md](../SHOWROOM_MASTER_PLAN.md). Usare questa pagina come segno-spunta operativo; aggiornare date e owner al momento dell’avvio.

## Governance

- [ ] Owner tecnico assegnato
- [ ] Owner contenuti / cliente assegnato
- [ ] Canale allineamento 48h concordato
- [ ] Strategia dual-run V1/V2 condivisa con team ([docs/v1-v2-parallel-comparison-and-structure.md](v1-v2-parallel-comparison-and-structure.md))

## Giorno 1 — Freeze scope P0

- [ ] Lista endpoint storefront in scope ([docs/p0-scope-freeze.md](p0-scope-freeze.md)) validata
- [ ] Esclusioni P0 comunicate al team
- [ ] Decision log breve (wiki / issue / doc di progetto — dove tenete le decisioni)
- [ ] Matrice comparazione V1 vs V2 inizializzata per homepage/PDP/collection ([v1-v2-parallel-comparison-and-structure.md](v1-v2-parallel-comparison-and-structure.md))

## Giorno 2 — Ambienti

- [ ] DB managed provisioning completato
- [ ] `DATABASE_URL_V2` (e `DIRECT_URL_V2` se serve) su Vercel Preview + Production
- [ ] Build Showroom verde (`npm run build`)
- [ ] Deploy Preview funzionante
- [ ] Ambiente V1 e V2 accessibili in parallelo (route o host separati) per confronto

## Giorno 3 — Dati

- [ ] Schema V2 applicato (`v2:migrate:deploy` o `v2:db:push` secondo policy)
- [ ] Seed section types (`v2:seed:sections`)
- [ ] Tenant di test o dry-run migrazione (`v2:migrate:tenant --dryRun`)
- [ ] Catalogo minimo: prodotti, media, publication intent storefront dove richiesto

## Giorno 4 — REST read path

- [ ] `GET .../homepage` verificato contro DB reale
- [ ] `GET .../products/{slug}` verificato
- [ ] `GET .../collections/{slug}` verificato
- [ ] Gap vs [vetrina-v2-api-contract.md](vetrina-v2-api-contract.md) risolti solo se bloccanti per P0

## Giorno 5 — Storefront

- [ ] Progetto `storefront-v2` deployato (Vercel o equivalente)
- [ ] `VETRINA_API_URL`, `SHOP_SLUG`, `REVALIDATION_SECRET` corretti ([deploy-vercel.md](deploy-vercel.md))
- [ ] Navigazione end-to-end sul tenant di test

## Giorno 6 — GraphQL design

- [ ] Schema `graphql/storefront-read.graphql` allineato ai view model
- [ ] `npm run graphql:codegen` eseguito; tipi generati aggiornati
- [ ] Mapping rivisto in [graphql-typescript-mapping.md](graphql-typescript-mapping.md)

## Giorno 7 — Hardening iniziale

- [ ] Smoke checklist completata (homepage, PDP, collezione, 404)
- [ ] Empty / error states storefront accettabili per demo
- [ ] Comportamento ISR / `revalidate` documentato per chi gestisce il deploy
- [ ] Struttura directory e boundary V1/V2 verificati (no import incrociati non voluti)

## Output fine settimana 1

- [ ] Demo interna registrabile (URL staging)
- [ ] Backlog giorni 8–14 aggiornato (settimana 2 per master plan)
