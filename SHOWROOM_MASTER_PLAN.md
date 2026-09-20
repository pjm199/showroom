# Showroom Master Plan (Unificazione Progetti)

Questo documento riassume il piano operativo concordato per unificare i progetti `Showroom`, `FlowPilot` e `Wootest` in un percorso unico verso la produzione.

## Contesto

Sono emersi tre progetti collegati tra loro:

- `Showroom`
- `Wootest`
- `FlowPilot`

Per evitare dispersione, duplicazioni e regressioni, il master di produzione viene consolidato in `Showroom`.

## Decisione strategica

`Showroom` e il repository **master definitivo** per la produzione.

## Modello operativo a 3 binari

### 1) Binario Prodotto (Showroom master)

Tutto cio che e destinato alla produzione entra solo in `Showroom`.

Regole:
- nuove feature di business: solo su `Showroom`
- bugfix critici produzione: solo su `Showroom`
- documentazione di rilascio: centralizzata su `Showroom`

### 2) Binario Sperimentale (FlowPilot / Wootest)

`FlowPilot` e `Wootest` restano ambienti di sperimentazione:
- spike tecnici
- test rapidi
- prove su API/integrazioni

Regole:
- niente deployment produzione da questi repo
- niente source of truth funzionale fuori da `Showroom`

### 3) Binario Migrazione (porting controllato)

Le funzionalita validate nei repo sperimentali vengono portate in `Showroom` con checklist.

Regole:
- si migra solo cio che e stato validato
- ogni migrazione deve avere criterio di accettazione
- niente copia/incolla “bulk” senza verifica

## Priorita prodotto (fase corrente)

Primo go-live: **catalogo/vetrina read-only**.

Scelte correnti:
- strategia API: **GraphQL-first**
- deploy target: **Vercel + DB managed**
- orizzonte MVP: **2 settimane**

## Roadmap operativa (14 giorni)

- Giorni 1-2: freeze scope MVP, definizione “done”, setup ambienti
- Giorni 3-5: catalogo read-only stabile (query prodotti, filtri base, stati errore)
- Giorni 6-7: hardening (loading, retry, fallback, smoke checks)
- Giorni 8-9: integrazione su dati/endpoint reali cliente
- Giorni 10-11: QA, performance base, sicurezza/config
- Giorno 12: staging demo
- Giorni 13-14: fix finali e go-live

## Governance minima (per non perdere il controllo)

- backlog unico nel master (`Showroom`)
- review periodica di allineamento (es. ogni 48h)
- promozione da sperimentale -> master solo con checklist completata
- documentazione decisioni tecniche nel master

## Checklist migrazione feature (template)

Per ogni feature candidata dal binario sperimentale:

1. Obiettivo funzionale chiaro
2. Dipendenze identificate
3. Impatto su UX e dati verificato
4. Test minimi passati (happy path + errore principale)
5. Config/env definiti
6. Criteri di accettazione espliciti
7. Porting su `Showroom`
8. Verifica finale su staging

## Rischi principali e contromisure

- Rischio: scope creep tra i tre repo  
  Contromisura: backlog unico e priorita P0/P1/P2 su `Showroom`.

- Rischio: divergenza tecnica tra prototipi e master  
  Contromisura: porting frequente, incrementale, con checklist.

- Rischio: ritardi da integrazioni esterne  
  Contromisura: partire dal read-only in produzione e aggiungere moduli per step.

## Decisione operativa finale

Il piano viene adottato immediatamente con questa regola:

**Tutto cio che va in produzione passa da `Showroom`.**

