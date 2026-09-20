# V1 + V2 in parallelo: comparazione e struttura directory

Obiettivo: mantenere `V1` stabile in esercizio, sviluppare `V2` senza blocchi e decidere il cutover con evidenze oggettive.

## 1) Modello operativo consigliato

- `V1` resta default per utenti reali.
- `V2` gira in parallelo su route/versione dedicate e feature flag.
- Ogni feature candidata alla migrazione viene validata con confronto `V1 vs V2`.
- Il passaggio definitivo avviene solo quando la matrice sotto e tutta verde per il perimetro P0.

## 2) Matrice di comparazione V1 vs V2 (template operativo)

Usare questa tabella per ogni capability P0 (homepage, PDP, collection, ricerca base, ecc.).

| Area | Verifica | V1 (baseline) | V2 (target) | Esito |
|---|---|---|---|---|
| Funzionale | Stesso output su stessi input | Comportamento atteso corrente | Equivalenza o miglioramento concordato | ⬜ |
| Dati | Conteggi, prezzi, disponibilita, media | Valori produzione | Nessuna regressione non autorizzata | ⬜ |
| API | Status code, shape payload, error contract | Contratto legacy | Contratto v2 documentato e stabile | ⬜ |
| Performance | p95 endpoint critici, TTFB pagine chiave | Baseline reale | >= baseline o delta approvato | ⬜ |
| UX | Loading/error/empty state | Esperienza corrente | Almeno equivalente, idealmente migliore | ⬜ |
| Osservabilita | Log, tracing, error rate | Alert esistenti | Alert e metriche replicate su V2 | ⬜ |
| Operativita | Deploy, rollback, revalidate/cache | Runbook esistente | Runbook V2 testato | ⬜ |

Regola pratica: per ogni riga non verde definire owner, scadenza, e criterio di uscita.

## 3) Proposta struttura directory (convivenza pulita)

Stato attuale: `V2` e gia isolata in `app/(dashboard)/v2`, `app/api/v2`, `lib/v2`, `types/v2`, e progetto `storefront-v2/`.

Struttura consigliata:

```text
app/
  (dashboard)/
    v1/                # backoffice legacy (se necessario renderlo esplicito)
    v2/                # backoffice nuovo
  api/
    v1/                # API legacy (da introdurre gradualmente dove oggi manca il namespace)
    v2/                # API nuove versionate
  (storefront)/
    s/                 # storefront legacy

storefront-v2/         # storefront nuovo isolato

lib/
  shared/              # utility neutre versione (auth base, logger, ecc.)
  v1/                  # adapter/facade legacy
  v2/                  # domain/service V2

types/
  shared/
  v1/
  v2/

docs/
  v1-v2-parallel-comparison-and-structure.md
  vetrina-v2-*.md
```

## 4) Convenzioni per evitare drift

- Namespace esplicito: endpoint nuovi solo sotto `app/api/v2/...`.
- Shared minimo: codice cross-versione in `lib/shared` solo se davvero neutro.
- No import incrociati: `v1` non importa `v2` e viceversa; usare adapter/facade.
- Feature flag per switch di traffico/comportamenti (`lib/v2/feature-flag.ts` come punto di partenza).
- Naming coerente: suffisso/prefisso versione in moduli, job e script (`*-v2`).

## 5) Sequenza rollout suggerita

1. Stabilizzare namespace e boundary directory (1 PR).
2. Attivare comparazione su 3 flussi core (homepage, PDP, collection).
3. Abilitare shadow traffic o smoke dual-run su tenant test.
4. Passare canary limitato su V2.
5. Cutover progressivo e rollback pronto su V1.

## 6) Definition of Done pre-cutover V2

- Matrice comparazione verde per scope P0.
- Error rate non peggiore di V1 sui percorsi core.
- Runbook deploy/rollback testato.
- Checklist sicurezza/config completata.
- Stakeholder business approvano la parita (o miglioramento) UX.
