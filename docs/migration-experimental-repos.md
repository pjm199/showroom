# Migrazione da repo sperimentali (FlowPilot / Wootest)

Allineato a [SHOWROOM_MASTER_PLAN.md](../SHOWROOM_MASTER_PLAN.md): **Showroom** è l’unico master produzione; FlowPilot e Wootest restano binari sperimenti. Nulla viene copiato in bulk senza checklist.

Percorsi tipici sulle macchine di sviluppo (non versionati qui):

| Repo | Path di riferimento |
|------|---------------------|
| FlowPilot frontend | `E:\Hub\FlowPilot\frontend` |
| Wootest | `E:\wootest` |

## Manifest feature (da compilare)

Aggiungere righe quando si identifica una feature candidata al porting.

| ID | Feature / modulo | Repo origine | Path / note | Candidato produzione (Sì/No) | Owner review | Stato |
|----|------------------|--------------|-------------|-------------------------------|--------------|-------|
| FP-001 | *esempio: prototipo UI flusso* | FlowPilot | *path* | No — duplica Hub | — | Da valutare |
| WT-001 | *esempio: suite E2E catalogo* | Wootest | *path* | Sì — solo test | — | Da valutare |

## Checklist per ogni porting (obbligatoria)

Adattata dal template in [SHOWROOM_MASTER_PLAN.md](../SHOWROOM_MASTER_PLAN.md):

1. **Obiettivo funzionale** chiaro e perimetro (solo Showroom vs dipendenze Hub).
2. **Dipendenze** (npm, env, servizi esterni).
3. **Impatto dati**: tabelle `prisma/schema-v2.prisma`, migrazioni, seed.
4. **Test**: happy path, errore principale, regressione storefront se tocca API pubbliche.
5. **Config**: variabili documentate in `.env.example` / `storefront-v2/.env.example`.
6. **Criteri di accettazione** scritti e approvati.
7. **PR su Showroom** con review; niente copia-incolla non rivisto.
8. **Verifica su staging** con stesso `SHOP_SLUG` / dati realistici.

## Linee guida per tipo di contributo

| Tipo | FlowPilot | Wootest |
|------|-----------|---------|
| UI orchestrazione / spike integrazioni | Resta in sperimentale salvo reinquadramento come funzione Vetrina | — |
| Componenti UI riutilizzabili per dashboard Vetrina | Valutare checklist + design system Showroom | — |
| Test automatici, fixture, dati seed | Copiare pattern utile | Preferito per regression |
| Logica dominio non validata | Non importare | Non importare |

Quando il manifest è popolato, collegare le PR alle righe `ID` per tracciabilità.
