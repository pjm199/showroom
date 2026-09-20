# Visione Vetrina + HUB + Deaneasy

## 1. Contesto

- Deaneasy.it oggi è un ecommerce basato su **WordPress + WooCommerce**, con centinaia di prodotti, molte categorie, contenuti istituzionali e blog.
- WordPress/WooCommerce funzionano ma sono un **“elefante in una fabbrica di cristallo”**: lenti, pesanti da gestire, difficili da evolvere e mal visti dal cliente finale.
- L’obiettivo non è fare “un altro sito”, ma costruire una **piattaforma rivendibile** che:
  - renda il sito **più snello, veloce e SEO‑first**,
  - permetta di **governare prodotti, homepage e promozioni da smartphone**,
  - separi in modo pulito **catalogo, presentazione, canali di vendita e flussi operativi**.

Su questo progetto si innestano due asset:

- **Vetrina** – SaaS già online, pensato come UI commerciale/editoriale mobile‑first.
- **HUB orchestrator** – piattaforma centrale per integrare ERP, WooCommerce, Aruba, scontrini, spedizioni, con logica e audit unificati.

---

## 2. Problemi che vogliamo risolvere

1. **Frontend pesante e rigido**
   - WordPress + WooCommerce come monolite: tema + plugin + page builder.
   - Performance e UX mobile non ottimali.
   - Difficoltà a fare un redesign moderno senza rompere tutto.

2. **Governance povera di catalogo e homepage**
   - Aggiornare homepage, hero, carousel, sezioni “in evidenza” richiede competenze tecniche o accesso complesso.
   - Il negozio non ha una vera **console commerciale** per decidere cosa spingere, dove e quando.

3. **Confusione tra ruoli**
   - WooCommerce fa tutto: catalogo, frontend, backend, promozioni, tassonomie.
   - È difficile separare “prodotto esiste” da “prodotto visibile” da “prodotto acquistabile online”.

4. **Integrazioni e flussi operativi disallineati**
   - Esistono o esisteranno:
     - un **ERP gestionale** (master dei dati),
     - piattaforme esterne (es. Bikesolution, Aruba, Winscontrino),
     - esigenze di fatturazione, scontrini, spedizioni.
   - Serve un **HUB centrale** che tenga insieme tutto, lasciando i sistemi esterni al loro posto.

---

## 3. Visione generale della soluzione

La soluzione non è un semplice “nuovo sito”, ma un **ecosistema a strati**:

1. **Catalog / Core data**
   - Rappresenta il prodotto come entità normalizzata:
     - titolo, descrizione, specifiche,
     - immagini,
     - prezzo base e regole di prezzo,
     - brand e categorie,
     - riferimenti esterni (ERP, WooCommerce, altri canali),
     - stato di vita (draft, attivo, archiviato).

2. **Publishing / Orchestration**
   - Decide DOVE e COME il prodotto appare:
     - canale **WooCommerce** (se usato come ecommerce),
     - **sito pubblico** (homepage, categorie, collezioni, landing),
     - **hero carousel di homepage**,
     - sezioni “featured”, “outlet”, “stagionale”.
   - È qui che vive la logica dei toggles:
     - publish on site,
     - publish in ecommerce,
     - show in homepage hero,
     - show in featured carousel,
     - included in collection X,
     - visible only as showcase (non acquistabile).

3. **Presentation layer (Frontend pubblico)**
   - Sito costruito con **Astro + React + Tailwind** (o stack simile):
     - pagine veloci, statiche/SSR, SEO‑friendly,
     - contenuti editoriali e di brand,
     - listing prodotti e pagine prodotto,
     - blocchi dinamici composti a runtime in base ai placements.
   - Il frontend NON è il master: si limita a mostrare ciò che il livello Publishing ha deciso.

4. **Order / Operations layer**
   - Gestione degli ordini, webhook e flussi operativi:
     - WooCommerce (o altro canale) genera ordini,
     - l’HUB li riceve via webhook/API,
     - l’HUB governa spedizioni, fatturazione, scontrino, anomalie,
     - UI supervisor per controllo umano.

---

## 4. Ruolo dei componenti principali

### 4.1 Vetrina

**Vetrina** è la **console commerciale/editoriale mobile‑first**.

- Cosa fa:
  - crea e modifica prodotti,
  - gestisce immagini, descrizioni sintetiche e lunghe,
  - definisce collocazione e visibilità,
  - accende/spegne la presenza nei vari canali,
  - controlla homepage, hero, carousel, collezioni, landing,
  - il tutto da smartphone.

- Cosa NON deve fare:
  - logica di integrazione profonda con ERP o sistemi fiscali,
  - logiche di ordine, spedizione, fatturazione.
  - Queste competenze vivono nell’HUB.

### 4.2 HUB orchestrator

L’**HUB** è il cervello dell’integrazione.

- Cosa fa:
  - normalizza il catalogo e sposa i dati con ERP, WooCommerce, altri sistemi,
  - riceve eventi (ordini, aggiornamenti stock, errori),
  - applica regole operative,
  - mantiene log e audit,
  - espone API pulite verso frontend e Vetrina.

- Cosa NON deve fare:
  - UI cliente finale (è compito del frontend pubblico),
  - UX editoriale/commerciale (è compito di Vetrina).

### 4.3 WooCommerce

WooCommerce diventa un **canale**, non il sistema core.

- Uso previsto:
  - come motore checkout / ordini per il canale Web,
  - come sorgente di eventi ordine (webhook),
  - come backend transitorio finché non si costruisce un motore d’ordine proprietario.

- In WooCommerce dovrebbero entrare:
  - solo i **prodotti effettivamente acquistabili online** (secondo i toggles),
  - con mapping 1:1 dal catalogo centrale.

### 4.4 Frontend pubblico (Astro/React)

Il frontend pubblico è la **vetrina online veloce e SEO‑first**.

- Cosa fa:
  - renderizza pagine statiche o SSR per:
    - homepage,
    - categorie/prodotti,
    - brand, storie, blog,
    - landing stagionali,
  - compone blocchi dinamici (hero, carousel, grid) leggendo i placements dal backend,
  - espone metadati e structured data SEO.

- Cosa NON fa:
  - gestire logica di business,
  - decidere cosa mostrare: riceve già la “scaletta” dal backend.

---

## 5. Principi chiave di design

1. **Separare catalogo da placement**
   - Un prodotto può esistere nel catalogo senza apparire da nessuna parte.
   - La visibilità e i canali sono dimensioni separate.

2. **Trattare WooCommerce come canale, non come sistema centrale**
   - È un endpoint, come un corriere o un ERP, solo più ricco.
   - Non deve decidere la forma del sito né la struttura editoriale.

3. **Frontend “content‑first, JS‑second”**
   - HTML server‑side o statico per tutti i contenuti SEO‑critical.
   - React/JS per interazioni e UI dinamiche, non per far “esistere” il contenuto.

4. **Vetrina come unico pannello commerciale**
   - Il negoziante non deve entrare più in WordPress.
   - Da Vetrina controlla:
     - prodotti,
     - homepage,
     - sezioni in evidenza,
     - promo.

5. **HUB come strato di verità per integrazioni**
   - Tutto passa di lì: ERP, WooCommerce, sistemi fiscali, spedizionieri.
   - L’HUB conosce lo stato degli ordini e degli oggetti, non il frontend.

---

## 6. Backlog unico (alto livello)

Questi sono i macro‑capitoli che guideranno i prossimi documenti/step:

1. **Modello dati del catalogo e dei placements**
   - Entità: Product, Variant, Media, Category, Brand.
   - Entità: Placement, PlacementSlot, PlacementRule.
   - Mapping verso WooCommerce e altri canali.

2. **Architettura del frontend pubblico**
   - Scelte di rendering (SSG/SSR/ISR).
   - Pagine: home, categorie, prodotto, brand, landing.
   - Come i placements compongono hero/carousel/sezioni.

3. **Flussi di pubblicazione da Vetrina**
   - Toggle e stati:
     - publish_to_site,
     - publish_to_ecommerce,
     - show_in_hero,
     - show_in_featured, ecc.
   - Eventi e API tra Vetrina e HUB.

4. **Integrazione con WooCommerce come canale**
   - Sync prodotti (upsert, delete).
   - Webhook ordini e aggiornamenti stock.
   - Errori e retry.

5. **Order flow end‑to‑end (HUB)**
   - Stato ordine dalla creazione alla chiusura.
   - Azioni: spedire, fatturare, fare scontrino.
   - UI supervisor e gestione anomalie.

6. **Strategia SEO & migrazione da deaneasy.it**
   - Mappatura URL e redirect.
   - Meta, structured data, breadcrumbs.
   - Piano di rollout e controllo Search Console.

Questa visione funziona sia come **recap** che come **indice dei prossimi file Markdown** più tecnici.