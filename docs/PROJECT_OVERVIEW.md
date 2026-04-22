# Panoramica del Progetto: CMS NoSQL Frontend

Questo documento fornisce una visione d'insieme dell'architettura e dei concetti chiave del progetto frontend del CMS NoSQL. È pensato per essere un punto di partenza per i nuovi sviluppatori e un promemoria per le sessioni di sviluppo future.

## 1. Obiettivo di Alto Livello

L'obiettivo del progetto è fornire un Content Management System (CMS) "headless" basato su NoSQL, con un frontend altamente configurabile e personalizzabile (White Label). Il sistema si concentra ora unicamente sull'interfaccia di configurazione per gli amministratori.

## 2. Tecnologie Fondamentali

- **Framework:** Angular (Standalone Components)
- **Styling:** Tailwind CSS, potenziato da un sistema di temi dinamico basato su variabili CSS.
- **Gestione dello Stato:** Un pattern reattivo "Service-with-a-Subject" che utilizza RxJS, evitando la complessità di librerie di stato più grandi come NgRx.
- **Build Tool:** Angular CLI

## 3. Struttura del Progetto

Il codice sorgente in `src/app` è organizzato in due macro-aree distinte:

1.  **`common` (Il Nucleo Condiviso):**
    - Contiene tutti i componenti, servizi, modelli e direttive che sono riutilizzabili all'interno dell'applicazione.
    - Funge da libreria di base, garantendo coerenza e riducendo la duplicazione del codice. Qui risiedono la logica di autenticazione, il sistema di modali, i componenti UI di base, ecc.

2.  **`configurator` (L'Applicazione di Amministrazione):**
    - È l'interfaccia di amministrazione del CMS.
    - Permette agli amministratori di sistema di:
        - Definire le strutture dati (definizioni di entità).
        - Gestire utenti e gruppi di autorizzazione.
        - Creare e modificare template per le email.
        - Configurare le impostazioni globali del sistema.
    - In breve, è il "cervello" dove si modella e si configura il comportamento dell'applicazione.

## 4. Concetti Architettonici Chiave

- **Gestione dello Stato ("Service-with-a-Subject"):** I servizi sono la fonte unica della verità. Mantengono lo stato in un `BehaviorSubject` privato e lo espongono tramite un `Observable` pubblico. I componenti si sottoscrivono a questi stream per ricevere i dati e aggiornarsi automaticamente.
- **Sistema di Temi Dinamico:** Il `ThemeService` permette di cambiare l'aspetto dell'applicazione in tempo reale. I temi sono definiti come set di variabili CSS che vengono iniettate nel DOM. Tailwind CSS è configurato per utilizzare queste variabili, garantendo un'applicazione coerente e flessibile dello stile.
- **Flusso di Autenticazione:** L'autenticazione è basata su token JWT. Un `HttpInterceptor` aggiunge automaticamente il token alle richieste API. Le `RouteGuard` proteggono le pagine, impedendo l'accesso a utenti non autorizzati o forzando azioni specifiche (es. cambio password al primo accesso).
- **Natura Dinamica:**
    - **Form Dinamici:** Le form di creazione e modifica dei dati (`RecordEditor`) vengono generate dinamicamente in base alla definizione dell'entità, permettendo al frontend di adattarsi a qualsiasi struttura dati senza bisogno di modifiche al codice.
    - **Sistema di Modali Globale:** Un `ModalService` centrale permette di aprire qualsiasi componente come modale, o di mostrare semplici dialoghi di conferma, da qualsiasi punto dell'applicazione.
