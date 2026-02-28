# Architettura del Progetto (Guida Semplice)

Benvenuto! Se sei nuovo nel progetto, questa guida ti spiegherà come funziona il nostro CMS in parole povere. Abbiamo costruito tutto per essere **morbido**, **veloce** e **personalizzabile** (White Label).

## 1. Com'è organizzato il codice?
Immagina il progetto come una grande scatola con tre scomparti principali:

*   **CORE (Il Cuore)**: Qui ci sono gli strumenti che servono a tutto il sito.
    *   *Servizi*: Sono i nostri "operai" che vanno a parlare con il server (Backend) per prendere o salvare i dati.
    *   *Modelli*: Sono i moduli che spiegano al codice com'è fatto un Utente, un Prodotto o una Tabella.
    *   *Guard*: Sono i nostri "buttafuori". Controllano se hai il permesso di entrare in una pagina.
*   **FEATURES (Le Pagine)**: Qui trovi le pagine vere e proprie che l'utente vede (Dashboard, Utenti, Record, ecc.). Ogni cartella è un pezzetto indipendente del sito.
*   **SHARED (I Pezzi Riutilizzabili)**: Qui ci sono le cose che usiamo in più punti, come i messaggini Toast (notifiche) o i Popup (Modal).

## 2. Come gestiamo i dati? (Il trucco del Canale)
Non usiamo sistemi complicati. Usiamo dei "canali" (chiamati *BehaviorSubject*). 
*   Il **Servizio** apre il canale.
*   La **Pagina** si mette in ascolto sul canale.
*   Quando il servizio riceve nuovi dati dal server, li butta nel canale e la pagina si aggiorna **automaticamente** come per magia, senza dover ricaricare nulla!

## 3. White Label: Come fa il sito a cambiare faccia?
Abbiamo creato un sistema chiamato "Marca Bianca" (White Label).
*   **Logo e Nome**: Vengono letti da un file chiamato `app-config.json`.
*   **Temi (Colori)**: Il `ThemeService` è il nostro "stylist". Applica dei colori speciali (variabili CSS) a tutto il sito. Se cambi tema, il sito cambia vestito istantaneamente.
*   **Layout Dinamico**: Puoi decidere se vuoi il menu di lato (Sidebar), in alto (Navbar) o in basso (Bottom Nav). Il sito si smonta e si rimonta da solo!

## 4. Multilingua (i18n)
Tutte le scritte del sito sono in dei file `.json` (Italiano e Inglese). Non scriviamo mai il testo direttamente nelle pagine, ma usiamo delle "chiavi" (es: `COMMON.SAVE`). Così, se un domani vogliamo aggiungere il Cinese, ci basta aggiungere un nuovo file JSON!

## 5. Sicurezza (Il blocco Password)
Se un utente entra per la prima volta, il nostro "buttafuori" (`authGuard`) lo chiude a chiave in una stanza speciale: la pagina **Cambia Password**. Non potrà vedere il menu o i dati finché non avrà scelto una password nuova e sicura.

---

*Nota per gli sviluppatori: tutto il codice è commentato riga per riga per spiegarti cosa succede. Se hai dubbi, leggi i commenti sopra i metodi!*
