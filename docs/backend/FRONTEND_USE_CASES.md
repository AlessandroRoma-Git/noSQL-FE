# Casi d'uso e flussi — Integrazione Frontend CMS NoSQL

Documento che descrive i casi d'uso reali del CMS NoSQL dal punto di vista di un'applicazione
frontend, con sequence diagram per ogni ruolo. Per ogni scenario viene spiegato **chi** chiama
**cosa**, **quando** e **perché**.

---

## Indice

1. [Modello di autorizzazione](#1-modello-di-autorizzazione)
2. [Autenticazione](#2-autenticazione)
3. [Bootstrap dell'applicazione (SUPER_ADMIN)](#3-bootstrap-dellapplicazione-super_admin)
4. [Gestione utenti e gruppi (ADMIN)](#4-gestione-utenti-e-gruppi-admin)
5. [Configurazione entità e menu (ADMIN)](#5-configurazione-entità-e-menu-admin)
6. [Operazioni sui record (gruppo custom — editors)](#6-operazioni-sui-record-gruppo-custom--editors)
7. [Sola lettura (gruppo custom — viewers/lettori)](#7-sola-lettura-gruppo-custom--viewerslettori)
8. [Accesso alla definizione entità da utente custom](#8-accesso-alla-definizione-entità-da-utente-custom)
9. [Storico versioni](#9-storico-versioni)
10. [Gestione file](#10-gestione-file)
11. [Matrice permessi per ruolo](#11-matrice-permessi-per-ruolo)

---

## 1. Modello di autorizzazione

Il CMS distingue tre livelli di accesso:

```
┌─────────────────────────────────────────────────────────────┐
│  SUPER_ADMIN                                                │
│  · Accesso totale a tutto il sistema                        │
│  · Bypassa sempre ACL e controlli di ruolo                  │
│  · Unico a poter gestire altri SUPER_ADMIN                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ADMIN                                                │  │
│  │  · Gestisce entity definitions, utenti, gruppi, menu  │  │
│  │  · Bypassa le ACL sui record                          │  │
│  │  · Non può creare altri SUPER_ADMIN                   │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  UTENTI CON GRUPPI CUSTOM (es. editors, viewers) │  │  │
│  │  │  · Accedono ai record solo tramite ACL           │  │  │
│  │  │  · Vedono solo le voci di menu del loro gruppo   │  │  │
│  │  │  · Possono leggere GET /entity-definitions/{key} │  │  │
│  │  │    se il loro gruppo è in almeno una lista ACL   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**ACL sui record** — ogni entity definition ha quattro liste di gruppi:

| Lista ACL | Operazioni protette |
|-----------|---------------------|
| `read`    | Lettura singolo record |
| `write`   | Creazione e modifica record |
| `delete`  | Eliminazione logica record |
| `search`  | Ricerca paginata con filtri |

---

## 2. Autenticazione

### 2.1 Login standard

**Chi:** Qualsiasi utente, incluso SUPER_ADMIN.
**Quando:** All'apertura dell'applicazione o dopo una sessione scaduta.
**Perché:** Ottenere il token JWT necessario per tutte le chiamate successive.

```
Frontend                         Backend
   │                                │
   │  POST /api/v1/auth/login       │
   │  { username, password }        │
   │ ─────────────────────────────► │
   │                                │  verifica credenziali
   │                                │  genera JWT con:
   │                                │  - username
   │                                │  - groups (nomi gruppi)
   │                                │  - systemRoles
   │                                │  - firstAccess
   │  200 { token, firstAccess }    │
   │ ◄───────────────────────────── │
   │                                │
   ├─ firstAccess = false ──────────┼─► naviga a /dashboard
   │                                │
   └─ firstAccess = true  ──────────┴─► naviga a /change-password
```

> Il token JWT viene salvato localmente e allegato come header
> `Authorization: Bearer <token>` a ogni chiamata successiva.

---

### 2.2 Primo accesso — cambio password obbligatorio

**Chi:** Qualsiasi utente appena creato o dopo un reset password.
**Quando:** Il login restituisce `firstAccess: true`.
**Perché:** La password temporanea inviata via email deve essere cambiata prima di poter
accedere al resto dell'applicazione. Fino al completamento, il backend risponde `403` su
tutti gli endpoint tranne `/api/v1/auth/**`.

```
Frontend                              Backend
   │                                     │
   │  (login → firstAccess: true)        │
   │  naviga a /change-password          │
   │                                     │
   │  POST /api/v1/auth/change-password  │
   │  { oldPassword, newPassword }       │
   │ ──────────────────────────────────► │
   │                                     │  imposta firstAccess = false
   │                                     │  genera nuovo JWT
   │  200 { token, firstAccess: false }  │
   │ ◄────────────────────────────────── │
   │                                     │
   │  sostituisce token salvato          │
   │  naviga a /dashboard                │
```

---

### 2.3 Recupero password

**Chi:** Utente che ha dimenticato la password — nessun token richiesto.
**Quando:** Dalla pagina di login, clic su "Password dimenticata".
**Perché:** Il backend genera una password temporanea e la invia via email; al successivo
login `firstAccess` sarà `true`.

```
Frontend                                Backend
   │                                       │
   │  POST /api/v1/auth/recover-password   │
   │  { username }                         │
   │ ────────────────────────────────────► │
   │                                       │  genera password casuale
   │                                       │  invia email con nuova password
   │                                       │  imposta firstAccess = true
   │  200 { message }                      │
   │ ◄──────────────────────────────────── │
   │                                       │
   │  mostra messaggio "Controlla email"   │
```

---

## 3. Bootstrap dell'applicazione (SUPER_ADMIN)

**Chi:** SUPER_ADMIN (creato automaticamente all'avvio del backend).
**Quando:** Prima configurazione del sistema, una tantum.
**Perché:** Prima che qualsiasi utente normale possa lavorare, occorre definire i gruppi,
le entità con le relative ACL e il menu. Il SUPER_ADMIN è l'unico che può farlo perché
tutti gli endpoint di gestione richiedono `ROLE_admin`.

### Flusso completo di bootstrap

```
SUPER_ADMIN                          Backend
   │                                    │
   │  1. POST /api/v1/groups            │
   │     { name: "editors" }            │
   │ ─────────────────────────────────► │
   │  201 { id: "grp-editors-id" }      │
   │ ◄───────────────────────────────── │
   │                                    │
   │  2. POST /api/v1/groups            │
   │     { name: "viewers" }            │
   │ ─────────────────────────────────► │
   │  201 { id: "grp-viewers-id" }      │
   │ ◄───────────────────────────────── │
   │                                    │
   │  3. POST /api/v1/entity-definitions│
   │     { entityKey: "articoli",       │
   │       fields: [...],               │
   │       acl: {                       │
   │         read:   ["viewers","editors"]│
   │         write:  ["editors"],       │
   │         delete: ["editors"],       │
   │         search: ["viewers","editors"]│
   │       }                            │
   │     }                              │
   │ ─────────────────────────────────► │
   │  201 { id, entityKey: "articoli" } │
   │ ◄───────────────────────────────── │
   │                                    │
   │  4. POST /api/v1/menu/manage       │
   │     { label: "Articoli",           │
   │       entityKey: "articoli",       │
   │       groups: ["editors","viewers"]│
   │     }                              │
   │ ─────────────────────────────────► │
   │  201 { id }                        │
   │ ◄───────────────────────────────── │
   │                                    │
   │  5. POST /api/v1/users             │
   │     { username: "mario",           │
   │       email: "mario@...",          │
   │       groupIds: ["grp-editors-id"] │
   │     }                              │
   │ ─────────────────────────────────► │
   │                                    │  genera password temporanea
   │                                    │  invia email a mario@...
   │  201 { id, firstAccess: true }     │
   │ ◄───────────────────────────────── │
```

> **Ordine obbligatorio:** i gruppi devono esistere prima di poter creare entità con ACL
> e prima di assegnare utenti. Il menu può essere creato dopo l'entità.

---

## 4. Gestione utenti e gruppi (ADMIN)

**Chi:** ADMIN (o SUPER_ADMIN).
**Quando:** Onboarding di nuovi collaboratori, riorganizzazione team, gestione accessi.

### 4.1 Creazione di un nuovo utente editor

```
ADMIN                                  Backend
  │                                       │
  │  1. GET /api/v1/groups                │
  │ ────────────────────────────────────► │
  │  200 [{ id, name: "editors" }, ...]   │
  │ ◄──────────────────────────────────── │
  │                                       │
  │  (l'ADMIN sceglie il gruppo           │
  │   dalla lista e ottiene l'ID)         │
  │                                       │
  │  2. POST /api/v1/users                │
  │     { username, email,                │
  │       groupIds: ["<id-editors>"] }    │
  │ ────────────────────────────────────► │
  │                                       │  genera password temporanea
  │                                       │  invia email con credenziali
  │  201 { firstAccess: true }            │
  │ ◄──────────────────────────────────── │
  │                                       │
  │  mostra conferma "Utente creato,      │
  │  email inviata a mario@..."           │
```

---

### 4.2 Sospensione di un utente

**Perché:** Un collaboratore lascia l'azienda. Il soft-delete blocca l'accesso senza
perdere lo storico delle sue operazioni.

```
ADMIN                                  Backend
  │                                       │
  │  PUT /api/v1/users/{id}               │
  │  { enabled: false }                   │
  │ ────────────────────────────────────► │
  │                                       │  imposta enabled = false
  │                                       │  token già emessi restano validi
  │                                       │  fino alla scadenza naturale
  │  200 { enabled: false }               │
  │ ◄──────────────────────────────────── │
```

> Il blocco è immediato sulle nuove chiamate (il JwtFilter controlla `enabled`).
> Se serve blocco immediato, basta attendere la scadenza del token corrente.

---

### 4.3 Reset password da parte dell'ADMIN

**Quando:** L'utente non riesce ad accedere e contatta il supporto.

```
ADMIN                                  Backend
  │                                       │
  │  POST /api/v1/users/{id}/reset-password│
  │ ────────────────────────────────────► │
  │                                       │  genera nuova password casuale
  │                                       │  invia email all'utente
  │                                       │  imposta firstAccess = true
  │  204 No Content                       │
  │ ◄──────────────────────────────────── │
```

---

### 4.4 Spostamento utente in un altro gruppo

**Quando:** Un editor diventa responsabile e deve ottenere privilegi ADMIN.

```
ADMIN                                    Backend
  │                                         │
  │  1. GET /api/v1/groups                  │
  │ ──────────────────────────────────────► │
  │  200 [{ id, name, systemRole }, ...]    │
  │ ◄────────────────────────────────────── │
  │                                         │
  │  (individua il gruppo "managers"        │
  │   con systemRole: "ADMIN")              │
  │                                         │
  │  2. PUT /api/v1/users/{userId}          │
  │     { groupIds: ["<id-managers>"] }     │
  │ ──────────────────────────────────────► │
  │  200 { groupNames: ["managers"] }       │
  │ ◄────────────────────────────────────── │
  │                                         │
  │  Al successivo login dell'utente,       │
  │  il nuovo token conterrà                │
  │  systemRoles: ["ADMIN"]                 │
```

> Il cambio di gruppo ha effetto sul **prossimo token emesso**. Il token corrente
> dell'utente conserva i gruppi del momento in cui è stato generato.

---

## 5. Configurazione entità e menu (ADMIN)

### 5.1 Creazione di una nuova entità

**Chi:** ADMIN.
**Quando:** Si vuole strutturare un nuovo tipo di contenuto (es. "prodotti", "news").
**Perché:** Senza la entity definition non si possono creare record di quel tipo né
configurare il relativo menu.

```
ADMIN                                     Backend
  │                                          │
  │  POST /api/v1/entity-definitions         │
  │  {                                       │
  │    entityKey: "prodotti",                │
  │    label: "Prodotti",                    │
  │    historyEnabled: true,                 │
  │    fields: [                             │
  │      { name: "nome",    type: "STRING" },│
  │      { name: "prezzo",  type: "NUMBER" },│
  │      { name: "stato",   type: "ENUM",    │
  │        enumValues: ["attivo","archiviato"]}│
  │    ],                                    │
  │    acl: {                                │
  │      read:   ["editors","viewers"],      │
  │      write:  ["editors"],                │
  │      delete: ["editors"],                │
  │      search: ["editors","viewers"]       │
  │    }                                     │
  │  }                                       │
  │ ───────────────────────────────────────► │
  │  201 { id, entityKey: "prodotti" }       │
  │ ◄─────────────────────────────────────── │
```

**Effetti dell'ACL configurata:**
- `viewers` può leggere e cercare, ma non scrivere né eliminare
- `editors` ha accesso completo ai record
- Utenti in gruppi non elencati ricevono `403` su qualsiasi operazione

---

### 5.2 Aggiornamento di una entità

**Quando:** Si aggiunge un campo, si modifica l'ACL o si abilita la storicizzazione.

```
ADMIN                                     Backend
  │                                          │
  │  PUT /api/v1/entity-definitions/{key}    │
  │  { label, fields: [...], acl: {...} }    │
  │ ───────────────────────────────────────► │
  │                                          │  entityKey non modificabile
  │                                          │  i record esistenti NON vengono
  │                                          │  rivalidati retroattivamente
  │  200 { entityKey, fields, acl }          │
  │ ◄─────────────────────────────────────── │
```

> **Attenzione:** aggiungere un campo obbligatorio non invalida i record già presenti;
> la validazione scatta solo su create/update successivi.

---

### 5.3 Configurazione del menu

**Chi:** ADMIN.
**Quando:** Dopo aver creato le entità, si decide quali gruppi vedono quali voci.
**Perché:** Il menu è dinamico: `GET /api/v1/menu` restituisce solo le voci il cui
campo `groups` interseca con i gruppi dell'utente autenticato.

```
ADMIN                                     Backend
  │                                          │
  │  POST /api/v1/menu/manage               │
  │  {                                       │
  │    label: "Prodotti",                    │
  │    entityKey: "prodotti",                │
  │    icon: "inventory",                    │
  │    position: 2,                          │
  │    groups: ["editors", "viewers"]        │
  │  }                                       │
  │ ───────────────────────────────────────► │
  │  201 { id }                              │
  │ ◄─────────────────────────────────────── │

  poi, quando un editor carica l'app:

Editor                                    Backend
  │                                          │
  │  GET /api/v1/menu                        │
  │ ───────────────────────────────────────► │
  │                                          │  filtra le voci dove
  │                                          │  groups ∩ userGroups ≠ ∅
  │  200 [{ label:"Prodotti",                │
  │          entityKey:"prodotti" }]         │
  │ ◄─────────────────────────────────────── │
  │                                          │
  │  costruisce la sidebar con le voci       │
  │  visibili solo all'utente corrente       │
```

---

## 6. Operazioni sui record (gruppo custom — editors)

Un utente nel gruppo `editors` ha accesso completo ai record delle entità che lo includono
nelle ACL `write`, `delete`, `read`, `search`.

### 6.1 Caricamento iniziale della pagina

**Perché:** Il frontend ha bisogno della entity definition per costruire il form dinamico
(tipi di campo, obbligatorietà, valori ENUM) e per validare i dati lato client.

```
Editor (gruppo "editors")                  Backend
  │                                           │
  │  1. GET /api/v1/entity-definitions/articoli│
  │ ────────────────────────────────────────► │
  │                                           │  controlla che "editors" sia
  │                                           │  in almeno una lista ACL → OK
  │  200 { fields, acl, historyEnabled }      │
  │ ◄──────────────────────────────────────── │
  │                                           │
  │  costruisce il form con i campi dinamici  │
  │                                           │
  │  2. POST /api/v1/records/articoli/search  │
  │     { sorts: [{field:"createdAt",         │
  │                direction:"desc"}],        │
  │       page: 0, size: 10 }                 │
  │ ────────────────────────────────────────► │
  │                                           │  verifica ACL search → OK
  │  200 PageResponse<Record>                 │
  │ ◄──────────────────────────────────────── │
  │                                           │
  │  mostra la lista dei record               │
```

---

### 6.2 Creazione di un record

```
Editor                                     Backend
  │                                           │
  │  POST /api/v1/records/articoli            │
  │  { data: {                                │
  │      titolo: "Il mio articolo",           │
  │      categoria: "blog",                   │
  │      contenuto: "..."                     │
  │  } }                                      │
  │ ────────────────────────────────────────► │
  │                                           │  verifica ACL write → OK
  │                                           │  valida i campi contro
  │                                           │  la entity definition
  │                                           │  se historyEnabled: salva snapshot
  │  201 { id, data, createdAt }              │
  │ ◄──────────────────────────────────────── │
  │                                           │
  │  aggiorna la lista (o naviga al dettaglio)│
```

**Errore di validazione:**
```
  │  422 Unprocessable Entity                 │
  │  { errors: [                              │
  │      { field:"categoria",                 │
  │        message:"Value not in enum" }      │
  │  ] }                                      │
  │ ◄──────────────────────────────────────── │
  │                                           │
  │  evidenzia i campi in errore nel form     │
```

---

### 6.3 Modifica di un record esistente

```
Editor                                     Backend
  │                                           │
  │  PUT /api/v1/records/articoli/{id}        │
  │  { data: { titolo: "Titolo aggiornato" } }│
  │ ────────────────────────────────────────► │
  │                                           │  verifica ACL write → OK
  │                                           │  valida i dati
  │                                           │  se historyEnabled: salva la
  │                                           │  versione precedente nello storico
  │  200 { id, data, updatedAt }              │
  │ ◄──────────────────────────────────────── │
```

---

### 6.4 Eliminazione di un record

```
Editor                                     Backend
  │                                           │
  │  DELETE /api/v1/records/articoli/{id}     │
  │ ────────────────────────────────────────► │
  │                                           │  verifica ACL delete → OK
  │                                           │  imposta deleted = true
  │                                           │  il record rimane in MongoDB
  │                                           │  ma è escluso da tutte le query
  │  204 No Content                           │
  │ ◄──────────────────────────────────────── │
  │                                           │
  │  rimuove il record dalla lista            │
```

---

### 6.5 Ricerca avanzata con filtri

**Quando:** L'utente inserisce criteri di ricerca (testo libero, filtri per categoria,
intervallo di date).

```
Editor                                     Backend
  │                                           │
  │  POST /api/v1/records/articoli/search     │
  │  {                                        │
  │    filters: [                             │
  │      { field: "categoria",                │
  │        op: "eq", value: "blog" },         │
  │      { field: "createdAt",                │
  │        op: "gte",                         │
  │        value: "2025-01-01T00:00:00Z" }    │
  │    ],                                     │
  │    sorts: [{ field: "createdAt",          │
  │              direction: "desc" }],        │
  │    page: 0, size: 10                      │
  │  }                                        │
  │ ────────────────────────────────────────► │
  │                                           │  verifica ACL search → OK
  │                                           │  costruisce query MongoDB:
  │                                           │  - campi custom → data.<nome>
  │                                           │  - createdAt/updatedAt → radice
  │  200 { content, page, totalElements }     │
  │ ◄──────────────────────────────────────── │
  │                                           │
  │  aggiorna la lista con i risultati        │
  │  mostra il totale e i controlli di pagina │
```

---

## 7. Sola lettura (gruppo custom — viewers/lettori)

Un utente nel gruppo `viewers` (o `lettori`) è presente solo nelle ACL `read` e `search`,
mai in `write` o `delete`.

### 7.1 Navigazione e lettura

```
Viewer                                     Backend
  │                                           │
  │  GET /api/v1/menu                         │
  │ ────────────────────────────────────────► │
  │  200 [voci visibili per "viewers"]        │
  │ ◄──────────────────────────────────────── │
  │                                           │
  │  GET /api/v1/entity-definitions/articoli  │
  │ ────────────────────────────────────────► │
  │                                           │  "viewers" è in ACL read → OK
  │  200 { fields, acl }                      │
  │ ◄──────────────────────────────────────── │
  │                                           │
  │  POST /api/v1/records/articoli/search     │
  │  { sorts: [{field:"createdAt",            │
  │             direction:"desc"}] }          │
  │ ────────────────────────────────────────► │
  │                                           │  "viewers" è in ACL search → OK
  │  200 PageResponse<Record>                 │
  │ ◄──────────────────────────────────────── │
  │                                           │
  │  GET /api/v1/records/articoli/{id}        │
  │ ────────────────────────────────────────► │
  │                                           │  "viewers" è in ACL read → OK
  │  200 { id, data }                         │
  │ ◄──────────────────────────────────────── │
```

---

### 7.2 Tentativo di operazione non autorizzata

**Quando:** Il viewer tenta di creare, modificare o eliminare un record (es. tramite
una chiamata diretta all'API bypassando l'interfaccia).

```
Viewer                                     Backend
  │                                           │
  │  POST /api/v1/records/articoli            │
  │  { data: { titolo: "..." } }             │
  │ ────────────────────────────────────────► │
  │                                           │  "viewers" NON è in ACL write
  │  403 Forbidden                            │
  │  { message: "You do not have write        │
  │    permission on 'articoli'" }            │
  │ ◄──────────────────────────────────────── │
```

> Il frontend non deve mostrare i pulsanti di scrittura/eliminazione a utenti
> che non appartengono ai gruppi autorizzati. Il backend rimane comunque la
> fonte di verità: rifiuta la richiesta anche se arriva direttamente.

---

## 8. Accesso alla definizione entità da utente custom

`GET /api/v1/entity-definitions/{key}` è l'unico endpoint della sezione entity-definitions
aperto agli utenti non-ADMIN. La visibilità è controllata dall'ACL.

### 8.1 Accesso consentito (gruppo presente in almeno una lista ACL)

```
Utente (gruppo "lettori")                  Backend
  │                                           │
  │  GET /api/v1/entity-definitions/articoli  │
  │ ────────────────────────────────────────► │
  │                                           │  "lettori" è in acl.read → OK
  │                                           │  (bastava anche solo write,
  │                                           │   delete o search)
  │  200 { fields, acl, historyEnabled }      │
  │ ◄──────────────────────────────────────── │
```

---

### 8.2 Accesso negato — gruppo non presente in nessuna ACL

```
Utente (gruppo "outsiders")                Backend
  │                                           │
  │  GET /api/v1/entity-definitions/articoli  │
  │ ────────────────────────────────────────► │
  │                                           │  "outsiders" non è in nessuna
  │                                           │  lista ACL di "articoli"
  │  403 Forbidden                            │
  │  { message: "You do not have access       │
  │    to entity definition 'articoli'" }     │
  │ ◄──────────────────────────────────────── │
```

---

### 8.3 Accesso negato — entità senza ACL configurata

```
Utente (qualsiasi gruppo custom)           Backend
  │                                           │
  │  GET /api/v1/entity-definitions/logs      │
  │ ────────────────────────────────────────► │
  │                                           │  acl = null
  │                                           │  nessun gruppo può accedere
  │  403 Forbidden                            │
  │  { message: "You do not have access       │
  │    to entity definition 'logs'" }         │
  │ ◄──────────────────────────────────────── │
  │                                           │
  │  (ADMIN e SUPER_ADMIN riceverebbero 200)  │
```

---

## 9. Storico versioni

**Disponibile solo per entità con `historyEnabled: true`.**
**Chi può accedere:** Chiunque abbia permesso ACL `read` sull'entità (o ADMIN/SUPER_ADMIN).

### 9.1 Visualizzazione dello storico

```
Editor / Viewer (con ACL read)             Backend
  │                                           │
  │  GET /api/v1/records/articoli/{id}/history│
  │ ────────────────────────────────────────► │
  │                                           │  verifica ACL read → OK
  │  200 [                                    │
  │    { version: 2, modifiedAt, data },      │
  │    { version: 1, modifiedAt, data }       │
  │  ]                                        │
  │ ◄──────────────────────────────────────── │
  │                                           │
  │  mostra la lista delle versioni           │
```

---

### 9.2 Confronto con una versione specifica

```
Utente                                     Backend
  │                                           │
  │  GET /records/articoli/{id}/history/1     │
  │ ────────────────────────────────────────► │
  │                                           │  verifica ACL read → OK
  │  200 { version: 1, modifiedAt, data }     │
  │ ◄──────────────────────────────────────── │
  │                                           │
  │  mostra i dati della versione 1           │
  │  a confronto con la versione corrente     │
```

---

## 10. Gestione file

**Chi:** Qualsiasi utente autenticato.
**Quando:** Upload di allegati, immagini o documenti da associare ai record.

### 10.1 Upload

```
Utente autenticato                         Backend
  │                                           │
  │  POST /api/v1/files                       │
  │  Content-Type: multipart/form-data        │
  │  file=<binario>                           │
  │ ────────────────────────────────────────► │
  │                                           │  salva su GridFS o S3
  │                                           │  (dipende dalla config)
  │  201 { id, filename,                      │
  │         contentType, size }               │
  │ ◄──────────────────────────────────────── │
  │                                           │
  │  salva l'id restituito nel campo          │
  │  del record di tipo REFERENCE/STRING      │
```

---

### 10.2 Download

```
Utente autenticato                         Backend
  │                                           │
  │  GET /api/v1/files/{id}                   │
  │ ────────────────────────────────────────► │
  │                                           │  recupera da GridFS/S3
  │  200 <blob>                               │
  │  Content-Type: <tipo originale>           │
  │ ◄──────────────────────────────────────── │
  │                                           │
  │  apre/scarica il file nel browser         │
```

---

### 10.3 Eliminazione (soft delete)

```
Utente autenticato                         Backend
  │                                           │
  │  DELETE /api/v1/files/{id}                │
  │ ────────────────────────────────────────► │
  │                                           │  imposta deleted = true
  │                                           │  il file fisico su S3/GridFS
  │                                           │  NON viene rimosso
  │  204 No Content                           │
  │ ◄──────────────────────────────────────── │
```

---

## 11. Matrice permessi per ruolo

### Endpoint di sistema

| Operazione | SUPER_ADMIN | ADMIN | Gruppo custom |
|---|---|---|---|
| Login / cambio password / recupero | ✅ | ✅ | ✅ |
| `GET /menu` (menu personale) | ✅ tutto | ✅ tutto | ✅ filtrato per gruppo |
| `GET /entity-definitions/{key}` | ✅ | ✅ | ✅ se gruppo in almeno una ACL |
| `GET /entity-definitions` (lista) | ✅ | ✅ | ❌ 403 |
| `POST/PUT/DELETE /entity-definitions` | ✅ | ✅ | ❌ 403 |
| `POST/PUT/DELETE /menu/manage` | ✅ | ✅ | ❌ 403 |
| `POST/PUT/DELETE /users` | ✅ | ✅ | ❌ 403 |
| `POST/PUT/DELETE /groups` | ✅ | ✅ | ❌ 403 |
| Upload/download file | ✅ | ✅ | ✅ |

### Operazioni sui record

| Operazione | SUPER_ADMIN | ADMIN | Gruppo in ACL | Gruppo non in ACL |
|---|---|---|---|---|
| `GET` singolo record | ✅ | ✅ | ✅ se in `read` | ❌ 403 |
| `POST search` | ✅ | ✅ | ✅ se in `search` | ❌ 403 |
| `POST` crea record | ✅ | ✅ | ✅ se in `write` | ❌ 403 |
| `PUT` aggiorna record | ✅ | ✅ | ✅ se in `write` | ❌ 403 |
| `DELETE` elimina record | ✅ | ✅ | ✅ se in `delete` | ❌ 403 |
| `GET history` / versione | ✅ | ✅ | ✅ se in `read` | ❌ 403 |

### Comportamento ACL su entità senza ACL configurata

| Caso | Comportamento sui record | Comportamento su `GET /entity-definitions/{key}` |
|---|---|---|
| `acl: null` | Accesso aperto a tutti gli autenticati | ❌ 403 per utenti non-ADMIN |
| `acl` presente, lista vuota per un permesso | Quel permesso è aperto | — |
| `acl` presente, gruppo non elencato | ❌ 403 | ❌ 403 |

> **Regola di coerenza:** per i **record**, `acl: null` significa accesso aperto.
> Per la **lettura della definizione** da parte di utenti non-ADMIN, `acl: null`
> significa 403. Questo impedisce a utenti anonimi di scoprire la struttura
> di entità che non li riguardano.
