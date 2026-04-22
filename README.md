# CMS NoSQL Frontend - Configurator

Questo repository contiene il frontend per il modulo Configurator del CMS NoSQL. L'obiettivo primario di questo applicativo è fornire un'interfaccia robusta e intuitiva per l'amministrazione e la configurazione del sistema CMS, focalizzandosi sulla gestione delle entità, utenti, permessi e altre impostazioni cruciali.

## Tecnologie Fondamentali

-   **Framework:** Angular (Standalone Components)
-   **Styling:** Tailwind CSS, potenziato da un sistema di temi dinamico basato su variabili CSS.
-   **Gestione dello Stato:** Un pattern reattivo "Service-with-a-Subject" che utilizza RxJS, evitando la complessità di librerie di stato più grandi come NgRx.
-   **Build Tool:** Angular CLI

## Struttura del Progetto

Il codice sorgente in `src/app` è organizzato in due macro-aree principali:

1.  **`common` (Il Nucleo Condiviso):**
    -   Contiene tutti i componenti, servizi, modelli e direttive riutilizzabili all'interno dell'applicazione Configurator.
    -   Funge da libreria di base, garantendo coerenza e riducendo la duplicazione del codice. Qui risiedono la logica di autenticazione, il sistema di modali, i componenti UI di base, ecc.

2.  **`configurator` (L'Applicazione di Amministrazione):**
    -   Questa è l'interfaccia di amministrazione principale del CMS.
    -   Permette agli amministratori di sistema di:
        -   Definire le strutture dati (definizioni di entità).
        -   Gestire utenti e gruppi di autorizzazione.
        -   Creare e modificare template per le email.
        -   Configurare le impostazioni globali del sistema.
        -   Gestire la struttura del menu di navigazione.
        -   Accedere a una dashboard di controllo.
    -   In breve, è il "cervello" dove si modella e si configura il comportamento dell'applicazione.

## Concetti Architettonici Chiave

-   **Gestione dello Stato ("Service-with-a-Subject"):** I servizi sono la fonte unica della verità. Mantengono lo stato in un `BehaviorSubject` privato e lo espongono tramite un `Observable` pubblico. I componenti si sottoscrivono a questi stream per ricevere i dati e aggiornarsi automaticamente.
-   **Sistema di Temi Dinamico:** Il `ThemeService` permette di cambiare l'aspetto dell'applicazione in tempo reale. I temi sono definiti come set di variabili CSS che vengono iniettate nel DOM. Tailwind CSS è configurato per utilizzare queste variabili, garantendo un'applicazione coerente e flessibile dello stile.
-   **Flusso di Autenticazione:** L'autenticazione è basata su token JWT. Un `HttpInterceptor` aggiunge automaticamente il token alle richieste API. Le `RouteGuard` proteggono le pagine, impedendo l'accesso a utenti non autorizzati o forzando azioni specifiche (es. cambio password al primo accesso).
-   **Natura Dinamica:**
    -   **Form Dinamici:** Le form di creazione e modifica dei dati (`RecordEditor`) vengono generate dinamicamente in base alla definizione dell'entità, permettendo al frontend di adattarsi a qualsiasi struttura dati senza bisogno di modifiche al codice.
    -   **Sistema di Modali Globale:** Un `ModalService` centrale permette di aprire qualsiasi componente come modale, o di mostrare semplici dialoghi di conferma, da qualsiasi punto dell'applicazione.

## Getting Started

Per avviare l'applicativo:

1.  **Installa le dipendenze:**
    ```bash
    npm install
    ```
2.  **Avvia il server di sviluppo:**
    ```bash
    ng serve
    ```
    L'applicazione sarà disponibile su `http://localhost:4200/`.

## Sviluppo

-   **Linting:** `npm run lint` per controllare la qualità del codice.
-   **Build:** `npm run build` per compilare l'applicazione per la produzione.

Questo `README.md` serve come memoria storica e punto di riferimento per lo sviluppo del modulo Configurator.
