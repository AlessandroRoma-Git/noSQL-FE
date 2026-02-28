# Manuale Operativo -- CMS NoSQL

## Indice

1. [Primo avvio](#1-primo-avvio)
2. [Login e cambio password](#2-login-e-cambio-password)
3. [Gestione gruppi](#3-gestione-gruppi)
4. [Gestione utenti](#4-gestione-utenti)
5. [Definizione entity](#5-definizione-entity)
6. [Gestione record (CRUD)](#6-gestione-record-crud)
6.5. [Soft Delete](#65-soft-delete)
7. [Ricerca paginata](#7-ricerca-paginata)
8. [Storico modifiche (Record History)](#8-storico-modifiche-record-history)
9. [Gestione menu](#9-gestione-menu)
10. [Gestione file](#10-gestione-file)
11. [Invio email](#11-invio-email)
12. [Recupero password](#12-recupero-password)
13. [Riepilogo ruoli di sistema](#13-riepilogo-ruoli-di-sistema)
14. [Codici di errore](#14-codici-di-errore)

---

## 1. Primo avvio

### 1.1 Avvio di MongoDB con Docker Compose

Il progetto include un file `docker-compose.yaml` che avvia un'istanza MongoDB 8.x sulla porta 27017.

```bash
# Avviare MongoDB in background
docker compose up -d

# Verificare che il container sia in esecuzione
docker compose ps

# Fermare MongoDB
docker compose down

# Fermare MongoDB e cancellare tutti i dati
docker compose down -v
```

### 1.2 Compilazione e avvio dell'applicazione

```bash
# Compilare il progetto (dalla directory cms-nosql/cms-nosql)
./mvnw clean package -DskipTests

# Avviare l'applicazione con il profilo di sviluppo (default)
./mvnw spring-boot:run

# Oppure avviare il JAR compilato
java -jar target/cms-nosql-*.jar
```

L'applicazione si avvia sulla porta **8088** (configurabile in `application.yaml`).

### 1.3 Inizializzazione automatica al primo avvio

Al primo avvio, se non esistono dati nel database, il sistema crea automaticamente:

1. **Un gruppo `super_admins`** con `systemRole = SUPER_ADMIN`
2. **Un utente `super_admin`** assegnato al gruppo `super_admins`

Le credenziali di default sono configurate in `application.yaml` nella sezione `cms.super-admin`:

```yaml
cms:
  super-admin:
    username: "super_admin"
    email: "admin@example.com"
    password: "changeme123"
```

L'utente creato automaticamente ha il flag `firstAccess = true`, il che significa che al primo login dovra obbligatoriamente cambiare la password prima di poter utilizzare qualsiasi altra API.

> **Importante:** in ambiente di produzione, sovrascrivere le credenziali di default tramite variabili d'ambiente o profilo specifico.

---

## 2. Login e cambio password

### 2.1 Login

Per autenticarsi, inviare una richiesta `POST /api/v1/auth/login` con username e password.

```bash
curl -s -X POST http://localhost:8088/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "super_admin",
    "password": "changeme123"
  }'
```

Risposta:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "super_admin",
  "groups": ["super_admins"],
  "lastAccessAt": "2025-01-15T10:30:00Z",
  "firstAccess": true
}
```

Salvare il token in una variabile per le richieste successive:

```bash
TOKEN=$(curl -s -X POST http://localhost:8088/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"super_admin","password":"changeme123"}' | jq -r '.token')
```

### 2.2 Comportamento con firstAccess = true

Se il campo `firstAccess` nella risposta di login e `true`, tutte le API (eccetto quelle di autenticazione) restituiranno un errore **403 Forbidden**. L'utente deve prima cambiare la password.

### 2.3 Cambio password

```bash
curl -s -X POST http://localhost:8088/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "oldPassword": "changeme123",
    "newPassword": "NuovaPassword!2025"
  }'
```

Risposta:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "super_admin",
  "groups": ["super_admins"],
  "lastAccessAt": "2025-01-15T10:35:00Z",
  "firstAccess": false
}
```

Dopo il cambio password viene restituito un **nuovo token JWT** con `firstAccess = false`. Da questo momento e possibile utilizzare tutte le API del sistema. Aggiornare la variabile del token:

```bash
TOKEN=$(curl -s -X POST http://localhost:8088/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"oldPassword":"changeme123","newPassword":"NuovaPassword!2025"}' | jq -r '.token')
```

> **Vincoli sulla password:** la nuova password deve avere una lunghezza compresa tra 6 e 100 caratteri.

---

## 3. Gestione gruppi

I gruppi definiscono i permessi degli utenti nel sistema. Esistono due tipi di gruppi:

- **Gruppi con `systemRole`** (`SUPER_ADMIN` o `ADMIN`): conferiscono privilegi amministrativi e bypassano i controlli ACL.
- **Gruppi senza `systemRole`** (gruppi regolari): utilizzati per il controllo degli accessi basato sulle ACL delle entity definition.

> **Accesso:** solo utenti con ruolo `ADMIN` o `SUPER_ADMIN` possono gestire i gruppi.

### 3.1 Creare un gruppo

```bash
# Gruppo regolare (per ACL)
curl -s -X POST http://localhost:8088/api/v1/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "redazione",
    "description": "Gruppo per i redattori di contenuti"
  }'
```

```bash
# Gruppo con ruolo di sistema ADMIN
curl -s -X POST http://localhost:8088/api/v1/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "amministratori",
    "description": "Gruppo amministratori del CMS",
    "systemRole": "ADMIN"
  }'
```

Risposta:

```json
{
  "id": "665a1b2c3d4e5f6a7b8c9d0e",
  "name": "redazione",
  "description": "Gruppo per i redattori di contenuti",
  "systemRole": null,
  "createdAt": "2025-01-15T10:40:00Z",
  "updatedAt": "2025-01-15T10:40:00Z"
}
```

### 3.2 Elenco gruppi

```bash
curl -s http://localhost:8088/api/v1/groups \
  -H "Authorization: Bearer $TOKEN"
```

### 3.3 Dettaglio gruppo

```bash
curl -s http://localhost:8088/api/v1/groups/665a1b2c3d4e5f6a7b8c9d0e \
  -H "Authorization: Bearer $TOKEN"
```

### 3.4 Aggiornare un gruppo

```bash
curl -s -X PUT http://localhost:8088/api/v1/groups/665a1b2c3d4e5f6a7b8c9d0e \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "redazione",
    "description": "Gruppo redattori - aggiornato",
    "systemRole": null
  }'
```

### 3.5 Eliminare un gruppo

```bash
curl -s -X DELETE http://localhost:8088/api/v1/groups/665a1b2c3d4e5f6a7b8c9d0e \
  -H "Authorization: Bearer $TOKEN"
```

Restituisce **204 No Content** in caso di successo.

---

## 4. Gestione utenti

La registrazione autonoma degli utenti non esiste. Gli utenti vengono creati esclusivamente dagli amministratori (utenti con ruolo `ADMIN` o `SUPER_ADMIN`).

Quando un utente viene creato, il sistema genera automaticamente una password e la invia via email all'indirizzo specificato. L'email utilizza il template configurato in `cms.email.password-template-id`; se non è configurato, viene usato automaticamente il template predefinito (`template/email-password.html`). L'utente avrà il flag `firstAccess = true` e dovrà cambiare la password al primo login.

> **Accesso:** solo utenti con ruolo `ADMIN` o `SUPER_ADMIN` possono gestire gli utenti.

### 4.1 Creare un utente

```bash
curl -s -X POST http://localhost:8088/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "mario_rossi",
    "email": "mario.rossi@esempio.it",
    "groupIds": ["665a1b2c3d4e5f6a7b8c9d0e"]
  }'
```

Risposta:

```json
{
  "id": "665b2c3d4e5f6a7b8c9d0e1f",
  "username": "mario_rossi",
  "email": "mario.rossi@esempio.it",
  "groupIds": ["665a1b2c3d4e5f6a7b8c9d0e"],
  "groupNames": ["redazione"],
  "enabled": true,
  "firstAccess": true,
  "lastAccessAt": null,
  "createdAt": "2025-01-15T11:00:00Z"
}
```

### 4.2 Elenco utenti

```bash
curl -s http://localhost:8088/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

### 4.3 Dettaglio utente

```bash
curl -s http://localhost:8088/api/v1/users/665b2c3d4e5f6a7b8c9d0e1f \
  -H "Authorization: Bearer $TOKEN"
```

### 4.4 Aggiornare un utente

E possibile aggiornare l'email, i gruppi assegnati e lo stato di abilitazione dell'account.

```bash
curl -s -X PUT http://localhost:8088/api/v1/users/665b2c3d4e5f6a7b8c9d0e1f \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "m.rossi@esempio.it",
    "groupIds": ["665a1b2c3d4e5f6a7b8c9d0e", "665c3d4e5f6a7b8c9d0e1f2a"],
    "enabled": true
  }'
```

### 4.5 Disabilitare un utente

```bash
curl -s -X PUT http://localhost:8088/api/v1/users/665b2c3d4e5f6a7b8c9d0e1f \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "enabled": false
  }'
```

Un utente disabilitato non potra effettuare il login.

### 4.6 Eliminare un utente

```bash
curl -s -X DELETE http://localhost:8088/api/v1/users/665b2c3d4e5f6a7b8c9d0e1f \
  -H "Authorization: Bearer $TOKEN"
```

Restituisce **204 No Content** in caso di successo.

### 4.7 Reset password

Il reset della password genera una nuova password e la invia via email all'utente tramite il template configurato in `cms.email.password-template-id` (fallback: `template/email-password.html`). L'utente dovrà cambiare la password al prossimo login (`firstAccess = true`).

```bash
curl -s -X POST http://localhost:8088/api/v1/users/665b2c3d4e5f6a7b8c9d0e1f/reset-password \
  -H "Authorization: Bearer $TOKEN"
```

Restituisce **204 No Content** in caso di successo.

---

## 5. Definizione entity

Le entity definition descrivono strutture dati dinamiche. Ogni entity definition specifica i campi, le regole di validazione e i permessi di accesso (ACL) per i record che ne fanno parte.

> **Accesso:** solo utenti con ruolo `ADMIN` o `SUPER_ADMIN` possono gestire le entity definition.

### 5.1 Regole per la entityKey

La `entityKey` e l'identificativo univoco dell'entita e deve rispettare il seguente pattern:

```
^[a-z][a-z0-9_]{1,48}[a-z0-9]$
```

- Deve iniziare con una lettera minuscola
- Puo contenere lettere minuscole, numeri e underscore
- Deve terminare con una lettera minuscola o un numero
- Lunghezza compresa tra 3 e 50 caratteri

Esempi validi: `articoli`, `prodotti_web`, `log_eventi_2025`

### 5.2 Tipi di campo

| Tipo      | Descrizione                                        | Vincoli disponibili                |
|-----------|----------------------------------------------------|------------------------------------|
| `STRING`  | Testo libero                                       | `maxLen`, `pattern` (regex)        |
| `NUMBER`  | Valore numerico                                    | `min`, `max`                       |
| `BOOLEAN` | Valore booleano (true/false)                       | --                                 |
| `DATE`    | Data in formato ISO-8601 (es. `2025-01-15T10:00:00Z`) | --                             |
| `EMAIL`   | Indirizzo email (validato automaticamente)         | --                                 |
| `ENUM`    | Valore scelto da un insieme predefinito            | `enumValues` (lista dei valori)    |
| `REFERENCE` | Lista di riferimenti a record di un'altra entità | `referenceEntityKey` (entityKey dell'entità target). Il valore è **sempre una lista di ID** (es. `["id1", "id2"]`). In fase di creazione/aggiornamento, il sistema verifica che **tutti gli ID nella lista** esistano nell'entità target. Permette relazioni molti-a-molti. |

### 5.3 ACL (Access Control List)

Le ACL definiscono quali gruppi possono eseguire determinate operazioni sui record dell'entita:

| Permesso  | Descrizione                           |
|-----------|---------------------------------------|
| `read`    | Lettura di singoli record             |
| `write`   | Creazione e aggiornamento di record   |
| `delete`  | Eliminazione di record                |
| `search`  | Ricerca paginata sui record           |

Ogni permesso contiene una lista di nomi di gruppi autorizzati. Gli utenti con ruolo `SUPER_ADMIN` o `ADMIN` bypassano i controlli ACL e hanno accesso completo.

### 5.4 Campo REFERENCE (esempio pratico)

Il tipo `REFERENCE` permette di creare relazioni molti-a-molti tra entità. Il campo memorizza **una lista di ID** di record appartenenti a un'altra entità, e il sistema verifica automaticamente che **tutti gli ID nella lista** esistano nell'entità target.

**Definizione di un'entità con campo REFERENCE:**

```json
{
  "entityKey": "assets",
  "label": "Asset aziendali",
  "fields": [
    { "name": "nome", "type": "STRING", "required": true, "maxLen": 200 },
    { "name": "assegnato_a", "type": "REFERENCE", "required": true, "referenceEntityKey": "customers" }
  ]
}
```

In questo esempio, il campo `assegnato_a` referenzia una lista di record dell'entità `customers`. La proprietà `referenceEntityKey` indica l'entityKey dell'entità target.

**Creazione di un record con riferimenti multipli:**

```bash
curl -s -X POST http://localhost:8088/api/v1/records/assets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "data": {
      "nome": "Laptop Dell XPS",
      "assegnato_a": ["665d4e5f6a7b8c9d0e1f2a3b", "665d4e5f6a7b8c9d0e1f2a3c"]
    }
  }'
```

Il valore di `assegnato_a` è **sempre una lista di ID**, anche se contiene un solo elemento: `["665d4e5f6a7b8c9d0e1f2a3b"]`. Ogni ID nella lista deve corrispondere a un record esistente nell'entità `customers`. Se uno qualsiasi degli ID non esiste, il sistema restituisce un errore di validazione.

**Relazioni molti-a-molti:** questa funzionalità permette di assegnare un asset a più clienti contemporaneamente, creando una relazione molti-a-molti diretta senza bisogno di una tabella di giunzione separata.

### 5.5 Storico modifiche (historyEnabled)

Se `historyEnabled` e impostato a `true`, ogni aggiornamento di un record salva uno snapshot dello stato precedente. Vedere la [sezione 8](#8-storico-modifiche-record-history) per i dettagli.

### 5.6 Creare una entity definition

Esempio completo con tutti i tipi di campo:

```bash
curl -s -X POST http://localhost:8088/api/v1/entity-definitions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "entityKey": "articoli",
    "label": "Articoli del blog",
    "fields": [
      {
        "name": "titolo",
        "type": "STRING",
        "required": true,
        "maxLen": 200
      },
      {
        "name": "contenuto",
        "type": "STRING",
        "required": true,
        "maxLen": 50000
      },
      {
        "name": "autore_email",
        "type": "EMAIL",
        "required": true
      },
      {
        "name": "visualizzazioni",
        "type": "NUMBER",
        "required": false,
        "min": 0,
        "max": 999999
      },
      {
        "name": "pubblicato",
        "type": "BOOLEAN",
        "required": true
      },
      {
        "name": "data_pubblicazione",
        "type": "DATE",
        "required": false
      },
      {
        "name": "categoria",
        "type": "ENUM",
        "required": true,
        "enumValues": ["tecnologia", "scienza", "cultura", "sport"]
      },
      {
        "name": "codice_articolo",
        "type": "STRING",
        "required": true,
        "pattern": "^ART-[0-9]{4}$"
      }
    ],
    "acl": {
      "read": ["redazione", "lettori"],
      "write": ["redazione"],
      "delete": ["redazione"],
      "search": ["redazione", "lettori"]
    },
    "historyEnabled": true
  }'
```

Restituisce **201 Created** con la entity definition creata.

### 5.7 Elenco entity definition

```bash
curl -s http://localhost:8088/api/v1/entity-definitions \
  -H "Authorization: Bearer $TOKEN"
```

### 5.8 Dettaglio entity definition

```bash
curl -s http://localhost:8088/api/v1/entity-definitions/articoli \
  -H "Authorization: Bearer $TOKEN"
```

### 5.9 Aggiornare una entity definition

```bash
curl -s -X PUT http://localhost:8088/api/v1/entity-definitions/articoli \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "label": "Articoli del blog - aggiornato",
    "fields": [
      {
        "name": "titolo",
        "type": "STRING",
        "required": true,
        "maxLen": 300
      },
      {
        "name": "contenuto",
        "type": "STRING",
        "required": true,
        "maxLen": 100000
      }
    ],
    "acl": {
      "read": ["redazione", "lettori"],
      "write": ["redazione"],
      "delete": ["redazione"],
      "search": ["redazione", "lettori"]
    },
    "historyEnabled": true
  }'
```

### 5.10 Eliminare una entity definition

```bash
curl -s -X DELETE http://localhost:8088/api/v1/entity-definitions/articoli \
  -H "Authorization: Bearer $TOKEN"
```

Restituisce **204 No Content** in caso di successo.

> **Attenzione:** l'eliminazione fallisce con errore se esistono record associati all'entita. E necessario eliminare prima tutti i record.

---

## 6. Gestione record (CRUD)

I record sono le istanze dei dati definiti dalle entity definition. Ogni operazione sui record richiede il permesso ACL corrispondente, a meno che l'utente non abbia un ruolo di sistema (`ADMIN` o `SUPER_ADMIN`).

### 6.1 Creare un record

Richiede il permesso **write** nell'ACL dell'entita.

```bash
curl -s -X POST http://localhost:8088/api/v1/records/articoli \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "data": {
      "titolo": "Introduzione a MongoDB",
      "contenuto": "MongoDB e un database NoSQL orientato ai documenti...",
      "autore_email": "mario.rossi@esempio.it",
      "visualizzazioni": 0,
      "pubblicato": true,
      "data_pubblicazione": "2025-01-15T09:00:00Z",
      "categoria": "tecnologia",
      "codice_articolo": "ART-0001"
    }
  }'
```

Risposta (stato **201 Created**):

```json
{
  "id": "665d4e5f6a7b8c9d0e1f2a3b",
  "entityKey": "articoli",
  "data": {
    "titolo": "Introduzione a MongoDB",
    "contenuto": "MongoDB e un database NoSQL orientato ai documenti...",
    "autore_email": "mario.rossi@esempio.it",
    "visualizzazioni": 0,
    "pubblicato": true,
    "data_pubblicazione": "2025-01-15T09:00:00Z",
    "categoria": "tecnologia",
    "codice_articolo": "ART-0001"
  },
  "createdAt": "2025-01-15T11:30:00Z",
  "updatedAt": "2025-01-15T11:30:00Z"
}
```

I dati vengono validati in base alla definizione dei campi dell'entita. Se un campo obbligatorio manca o un valore non rispetta i vincoli, viene restituito un errore **422 Unprocessable Entity**.

### 6.2 Leggere un record

Richiede il permesso **read** nell'ACL dell'entita.

```bash
curl -s http://localhost:8088/api/v1/records/articoli/665d4e5f6a7b8c9d0e1f2a3b \
  -H "Authorization: Bearer $TOKEN"
```

### 6.3 Aggiornare un record

Richiede il permesso **write** nell'ACL dell'entita.

```bash
curl -s -X PUT http://localhost:8088/api/v1/records/articoli/665d4e5f6a7b8c9d0e1f2a3b \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "data": {
      "titolo": "Introduzione a MongoDB - Seconda edizione",
      "contenuto": "MongoDB e un database NoSQL orientato ai documenti. In questa seconda edizione...",
      "autore_email": "mario.rossi@esempio.it",
      "visualizzazioni": 150,
      "pubblicato": true,
      "data_pubblicazione": "2025-01-15T09:00:00Z",
      "categoria": "tecnologia",
      "codice_articolo": "ART-0001"
    }
  }'
```

Se l'entita ha `historyEnabled = true`, lo stato precedente del record viene salvato automaticamente nello storico.

### 6.4 Eliminare un record

Richiede il permesso **delete** nell'ACL dell'entita.

```bash
curl -s -X DELETE http://localhost:8088/api/v1/records/articoli/665d4e5f6a7b8c9d0e1f2a3b \
  -H "Authorization: Bearer $TOKEN"
```

Restituisce **204 No Content** in caso di successo. L'eliminazione è logica (soft delete): il record viene marcato come eliminato ma rimane nel database. Lo storico delle modifiche (`record_history`) viene conservato per finalità di audit e rimane indirettamente inaccessibile tramite le API standard.

---

## 6.5 Soft Delete

Tutte le eliminazioni nel sistema sono di tipo **logico** (soft delete). Il dato non viene fisicamente rimosso dalla base dati, ma contrassegnato come eliminato.

### Comportamento

- **Contrassegnamento:** quando un'entita (record, utente, gruppo, file, ecc.) viene eliminata, il campo `deleted` viene impostato a `true`.
- **Esclusione automatica:** le entita eliminate sono automaticamente escluse da ricerche, listati e operazioni di lettura. Gli utenti non vedranno i dati eliminati.
- **Persistenza:** i dati rimangono nel database MongoDB per il recupero in caso di cancellazione accidentale.
- **File storage:** per i file, il file fisico **non viene eliminato** dallo storage (GridFS o S3). Solo i metadati del file sono marcati come eliminati.
- **Login utenti:** un utente soft-eliminato non puo effettuare il login al sistema.

### Vantaggi

- **Recuperabilita:** e possibile recuperare dati eliminati accidentalmente.
- **Audit trail:** il sistema mantiene una traccia storica completa di tutte le entita, incluse quelle eliminate.
- **Integrità referenziale:** i dati eliminati rimangono disponibili per verificare relazioni e storico.

---

## 7. Ricerca paginata

La ricerca paginata permette di interrogare i record di un'entita con filtri, ordinamento e paginazione.

**Endpoint:** `POST /api/v1/records/{entityKey}/search`

Richiede il permesso **search** nell'ACL dell'entita.

### 7.1 Operatori di filtro disponibili

| Operatore | Descrizione                              | Esempio valore            |
|-----------|------------------------------------------|---------------------------|
| `eq`      | Uguale a                                 | `"tecnologia"`            |
| `ne`      | Diverso da                               | `"sport"`                 |
| `gt`      | Maggiore di                              | `100`                     |
| `gte`     | Maggiore o uguale a                      | `100`                     |
| `lt`      | Minore di                                | `1000`                    |
| `lte`     | Minore o uguale a                        | `1000`                    |
| `in`      | Contenuto in una lista di valori         | `["tecnologia","scienza"]`|
| `like`    | Corrispondenza parziale (case-insensitive)| `"mongo"`                |

### 7.2 Paginazione

| Parametro | Default | Descrizione                           |
|-----------|---------|---------------------------------------|
| `page`    | 0       | Numero della pagina (0-based)         |
| `size`    | 20      | Elementi per pagina (massimo 100)     |

### 7.3 Ordinamento

Ogni elemento di ordinamento specifica un campo e una direzione (`asc` o `desc`). La direzione predefinita e `asc`.

### 7.4 Esempi

**Ricerca con filtro di uguaglianza:**

```bash
curl -s -X POST http://localhost:8088/api/v1/records/articoli/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "filters": [
      { "field": "categoria", "op": "eq", "value": "tecnologia" }
    ],
    "page": 0,
    "size": 10
  }'
```

**Ricerca con filtro numerico e ordinamento:**

```bash
curl -s -X POST http://localhost:8088/api/v1/records/articoli/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "filters": [
      { "field": "visualizzazioni", "op": "gte", "value": 100 },
      { "field": "pubblicato", "op": "eq", "value": true }
    ],
    "sorts": [
      { "field": "visualizzazioni", "direction": "desc" }
    ],
    "page": 0,
    "size": 20
  }'
```

**Ricerca con operatore `in`:**

```bash
curl -s -X POST http://localhost:8088/api/v1/records/articoli/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "filters": [
      { "field": "categoria", "op": "in", "value": ["tecnologia", "scienza"] }
    ],
    "page": 0,
    "size": 20
  }'
```

**Ricerca con operatore `like` (corrispondenza parziale):**

```bash
curl -s -X POST http://localhost:8088/api/v1/records/articoli/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "filters": [
      { "field": "titolo", "op": "like", "value": "mongo" }
    ],
    "page": 0,
    "size": 20
  }'
```

**Risposta paginata:**

```json
{
  "content": [
    {
      "id": "665d4e5f6a7b8c9d0e1f2a3b",
      "entityKey": "articoli",
      "data": { "titolo": "Introduzione a MongoDB", "..." : "..." },
      "createdAt": "2025-01-15T11:30:00Z",
      "updatedAt": "2025-01-15T11:30:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

### 7.5 Limiti di sicurezza

I seguenti limiti sono configurati in `application.yaml`:

| Parametro              | Valore di default | Descrizione                                    |
|------------------------|-------------------|------------------------------------------------|
| `max-filters`          | 10                | Numero massimo di filtri per query              |
| `max-page-size`        | 100               | Dimensione massima di una pagina di risultati   |
| `default-page-size`    | 20                | Dimensione pagina di default                    |
| `regex-max-length`     | 100               | Lunghezza massima del valore nell'operatore `like` |

---

## 8. Storico modifiche (Record History)

Lo storico delle modifiche e disponibile solo per le entita con `historyEnabled = true`.

### 8.1 Funzionamento

- Ogni volta che un record viene **aggiornato** (`PUT`), il sistema salva uno snapshot dei dati precedenti.
- Lo snapshot include: numero di versione progressivo, username dell'utente che ha effettuato la modifica (`modifiedBy`) e data/ora della modifica (`modifiedAt`).
- Quando un record viene **eliminato** (soft delete), il suo storico rimane nel database per finalità di audit. Le entry in `record_history` diventano indirettamente inaccessibili tramite le API standard, ma non vengono rimosse.

### 8.2 Visualizzare lo storico di un record

Richiede il permesso **read** nell'ACL dell'entita.

```bash
curl -s http://localhost:8088/api/v1/records/articoli/665d4e5f6a7b8c9d0e1f2a3b/history \
  -H "Authorization: Bearer $TOKEN"
```

Risposta:

```json
[
  {
    "id": "665e5f6a7b8c9d0e1f2a3b4c",
    "recordId": "665d4e5f6a7b8c9d0e1f2a3b",
    "entityKey": "articoli",
    "data": {
      "titolo": "Introduzione a MongoDB",
      "contenuto": "MongoDB e un database NoSQL orientato ai documenti...",
      "visualizzazioni": 0
    },
    "version": 1,
    "modifiedBy": "super_admin",
    "modifiedAt": "2025-01-15T12:00:00Z"
  }
]
```

### 8.3 Visualizzare una versione specifica

```bash
curl -s http://localhost:8088/api/v1/records/articoli/665d4e5f6a7b8c9d0e1f2a3b/history/1 \
  -H "Authorization: Bearer $TOKEN"
```

Risposta:

```json
{
  "id": "665e5f6a7b8c9d0e1f2a3b4c",
  "recordId": "665d4e5f6a7b8c9d0e1f2a3b",
  "entityKey": "articoli",
  "data": {
    "titolo": "Introduzione a MongoDB",
    "contenuto": "MongoDB e un database NoSQL orientato ai documenti...",
    "visualizzazioni": 0
  },
  "version": 1,
  "modifiedBy": "super_admin",
  "modifiedAt": "2025-01-15T12:00:00Z"
}
```

---

## 9. Gestione menu

Le voci di menu controllano la navigazione nell'interfaccia utente del CMS. Il sistema supporta menu gerarchici (voci padre/figlio).

### 9.1 Visibilita basata sui gruppi

- Il campo `groups` nelle voci di menu controlla la visibilita: un utente vede solo le voci di menu i cui gruppi si sovrappongono con i propri.
- Gli utenti con ruolo `SUPER_ADMIN` o `ADMIN` vedono **tutte** le voci di menu.
- Se il campo `groups` e `null` o una lista vuota, la voce e visibile a **tutti** gli utenti autenticati.

### 9.2 Creare una voce di menu

> **Accesso:** solo utenti con ruolo `ADMIN` o `SUPER_ADMIN`.

```bash
# Voce di menu visibile solo al gruppo "redazione"
curl -s -X POST http://localhost:8088/api/v1/menu/manage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "label": "Articoli",
    "entityKey": "articoli",
    "icon": "article",
    "position": 1,
    "parentId": null,
    "groups": ["redazione"]
  }'
```

Risposta (stato **201 Created**):

```json
{
  "id": "665f6a7b8c9d0e1f2a3b4c5d",
  "label": "Articoli",
  "entityKey": "articoli",
  "icon": "article",
  "position": 1,
  "parentId": null,
  "groups": ["redazione"],
  "createdAt": "2025-01-15T13:00:00Z",
  "updatedAt": "2025-01-15T13:00:00Z"
}
```

```bash
# Voce di menu visibile a tutti (groups vuoto)
curl -s -X POST http://localhost:8088/api/v1/menu/manage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "label": "Dashboard",
    "entityKey": null,
    "icon": "dashboard",
    "position": 0,
    "parentId": null,
    "groups": []
  }'
```

### 9.3 Menu dell'utente corrente (filtrato)

Ogni utente autenticato puo recuperare il proprio menu filtrato in base ai gruppi di appartenenza.

```bash
curl -s http://localhost:8088/api/v1/menu \
  -H "Authorization: Bearer $TOKEN"
```

### 9.4 Elenco completo voci di menu (admin)

Restituisce tutte le voci di menu senza filtro sui gruppi.

```bash
curl -s http://localhost:8088/api/v1/menu/manage \
  -H "Authorization: Bearer $TOKEN"
```

### 9.5 Aggiornare una voce di menu

```bash
curl -s -X PUT http://localhost:8088/api/v1/menu/manage/665f6a7b8c9d0e1f2a3b4c5d \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "label": "Articoli del Blog",
    "entityKey": "articoli",
    "icon": "article",
    "position": 2,
    "parentId": null,
    "groups": ["redazione", "lettori"]
  }'
```

### 9.6 Eliminare una voce di menu

```bash
curl -s -X DELETE http://localhost:8088/api/v1/menu/manage/665f6a7b8c9d0e1f2a3b4c5d \
  -H "Authorization: Bearer $TOKEN"
```

Restituisce **204 No Content** in caso di successo.

---

## 10. Gestione file

Il sistema supporta il caricamento, lo scaricamento e l'eliminazione di file. Il backend di storage e configurabile tra **GridFS** (default, integrato in MongoDB) e **S3** (Amazon S3 o compatibili).

### 10.1 Vincoli

- **Dimensione massima:** 10 MB (10.485.760 byte)
- **Tipi MIME consentiti:**
  - `image/jpeg`
  - `image/png`
  - `image/gif`
  - `application/pdf`
  - `text/plain`

I vincoli sono configurabili in `application.yaml` nella sezione `cms.storage`.

### 10.2 Upload di un file

```bash
curl -s -X POST http://localhost:8088/api/v1/files \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/percorso/del/documento.pdf"
```

Risposta (stato **201 Created**):

```json
{
  "id": "665g7b8c9d0e1f2a3b4c5d6e",
  "filename": "documento.pdf",
  "contentType": "application/pdf",
  "size": 245760,
  "uploadedBy": "super_admin",
  "createdAt": "2025-01-15T14:00:00Z"
}
```

### 10.3 Download di un file

```bash
curl -s http://localhost:8088/api/v1/files/665g7b8c9d0e1f2a3b4c5d6e \
  -H "Authorization: Bearer $TOKEN" \
  -o documento_scaricato.pdf
```

La risposta include gli header:
- `Content-Type`: tipo MIME del file
- `Content-Disposition`: `attachment; filename="documento.pdf"`
- `Content-Length`: dimensione del file in byte

### 10.4 Eliminare un file

```bash
curl -s -X DELETE http://localhost:8088/api/v1/files/665g7b8c9d0e1f2a3b4c5d6e \
  -H "Authorization: Bearer $TOKEN"
```

Restituisce **204 No Content** in caso di successo.

---

## 11. Invio email

Il sistema di email supporta l'invio tramite template con placeholder, allegati da diverse sorgenti ed eventi calendario iCal.

> **Accesso:** solo utenti con ruolo `ADMIN` o `SUPER_ADMIN`.

### 11.1 Gestione template

#### Creare un template

```bash
curl -s -X POST http://localhost:8088/api/v1/email/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "benvenuto_utente",
    "htmlContent": "<html><body><h1>Benvenuto, {{nome}}!</h1><p>Il tuo account e stato creato con successo.</p><p>La tua password temporanea e: <strong>{{password}}</strong></p><p>Accedi al CMS e cambia la password al primo login.</p></body></html>",
    "placeholders": ["nome", "password"],
    "attachments": [
      {
        "filename": "guida_rapida.pdf",
        "contentType": "application/pdf",
        "base64Content": "JVBERi0xLjQK..."
      }
    ]
  }'
```

Risposta (stato **201 Created**):

```json
{
  "id": "665h8c9d0e1f2a3b4c5d6e7f",
  "name": "benvenuto_utente",
  "htmlContent": "<html><body>...</body></html>",
  "placeholders": ["nome", "password"],
  "attachments": [
    {
      "filename": "guida_rapida.pdf",
      "contentType": "application/pdf",
      "base64Content": "JVBERi0xLjQK..."
    }
  ],
  "createdBy": "super_admin",
  "createdAt": "2025-01-15T15:00:00Z",
  "updatedAt": "2025-01-15T15:00:00Z"
}
```

#### Elenco template

```bash
curl -s http://localhost:8088/api/v1/email/templates \
  -H "Authorization: Bearer $TOKEN"
```

#### Dettaglio template

```bash
curl -s http://localhost:8088/api/v1/email/templates/665h8c9d0e1f2a3b4c5d6e7f \
  -H "Authorization: Bearer $TOKEN"
```

#### Eliminare un template

```bash
curl -s -X DELETE http://localhost:8088/api/v1/email/templates/665h8c9d0e1f2a3b4c5d6e7f \
  -H "Authorization: Bearer $TOKEN"
```

Restituisce **204 No Content** in caso di successo.

### 11.2 Invio email

L'invio utilizza un template precedentemente creato, sostituendo i placeholder con i valori forniti.

#### Invio base con template e placeholder

```bash
curl -s -X POST http://localhost:8088/api/v1/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "to": "mario.rossi@esempio.it",
    "from": "noreply-wolfcoding@wolfgroups.it",
    "subject": "Benvenuto nel CMS",
    "templateId": "665h8c9d0e1f2a3b4c5d6e7f",
    "placeholders": {
      "nome": "Mario Rossi",
      "password": "TempPass123"
    }
  }'
```

Risposta:

```json
{
  "message": "Email inviata con successo",
  "timestamp": "2025-01-15T15:30:00Z"
}
```

#### Invio con allegato Base64

```bash
curl -s -X POST http://localhost:8088/api/v1/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "to": "mario.rossi@esempio.it",
    "subject": "Report mensile",
    "templateId": "665h8c9d0e1f2a3b4c5d6e7f",
    "placeholders": {
      "nome": "Mario Rossi",
      "password": "n/a"
    },
    "attachments": [
      {
        "filename": "report.pdf",
        "contentType": "application/pdf",
        "base64Content": "JVBERi0xLjQK...",
        "inline": false,
        "contentId": null
      }
    ]
  }'
```

#### Invio con allegato inline (CID)

Per incorporare un'immagine nel corpo HTML (es. un logo):

```bash
curl -s -X POST http://localhost:8088/api/v1/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "to": "mario.rossi@esempio.it",
    "subject": "Newsletter",
    "templateId": "TEMPLATE_ID",
    "placeholders": { "nome": "Mario" },
    "attachments": [
      {
        "filename": "logo.png",
        "contentType": "image/png",
        "base64Content": "iVBORw0KGgo...",
        "inline": true,
        "contentId": "logo1"
      }
    ]
  }'
```

Nel template HTML, riferire l'immagine con: `<img src="cid:logo1">`.

#### Invio con allegato dallo storage CMS

```bash
curl -s -X POST http://localhost:8088/api/v1/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "to": "mario.rossi@esempio.it",
    "subject": "Documento allegato",
    "templateId": "TEMPLATE_ID",
    "placeholders": { "nome": "Mario" },
    "storageAttachments": [
      {
        "fileId": "665g7b8c9d0e1f2a3b4c5d6e"
      }
    ]
  }'
```

Il file viene recuperato automaticamente dallo storage del CMS. Nome e tipo MIME vengono derivati dai metadati del file.

#### Invio con evento calendario (iCal)

```bash
curl -s -X POST http://localhost:8088/api/v1/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "to": "mario.rossi@esempio.it",
    "subject": "Invito: Riunione di progetto",
    "templateId": "TEMPLATE_ID",
    "placeholders": { "nome": "Mario" },
    "calendarEvent": {
      "summary": "Riunione di progetto CMS",
      "description": "Discussione sulle nuove funzionalita del CMS",
      "location": "Sala riunioni A",
      "startDateTime": "2025-02-01T10:00:00Z",
      "endDateTime": "2025-02-01T11:00:00Z",
      "organizer": "admin@esempio.it",
      "method": "REQUEST"
    }
  }'
```

Il sistema genera un file `.ics` conforme allo standard iCal (RFC 5545) e lo allega all'email come parte MIME `text/calendar`.

### 11.3 Campi opzionali nell'invio

| Campo                | Descrizione                                                              |
|----------------------|--------------------------------------------------------------------------|
| `from`               | Mittente. Se omesso, usa il default da configurazione (`noreply-wolfcoding@wolfgroups.it`) |
| `cc`                 | Lista di indirizzi in copia conoscenza                                    |
| `bcc`                | Lista di indirizzi in copia conoscenza nascosta                           |
| `attachments`        | Allegati codificati in Base64 (inline o classici)                        |
| `storageAttachments` | Allegati recuperati dallo storage CMS tramite fileId                      |
| `calendarEvent`      | Evento calendario iCal da allegare                                        |

---

## 12. Recupero password

Un utente che ha dimenticato la password puo richiederne il recupero. L'endpoint e pubblico (non richiede autenticazione).

### 12.1 Richiedere il recupero password

```bash
curl -s -X POST http://localhost:8088/api/v1/auth/recover-password \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mario_rossi"
  }'
```

Risposta:

```json
{
  "message": "Nuova password inviata via email",
  "timestamp": "2025-01-15T16:00:00Z"
}
```

### 12.2 Comportamento

1. Il sistema genera una nuova password casuale (12 caratteri alfanumerici).
2. La nuova password viene inviata all'indirizzo email associato all'utente, tramite il template configurato in `cms.email.recover-password-template-id` (fallback automatico: `template/email-recover-password.html`).
3. Il flag `firstAccess` viene impostato a `true`.
4. Al prossimo login, l'utente dovrà cambiare la password (vedi [sezione 2](#2-login-e-cambio-password)).

> **Nota:** Questo endpoint usa un template distinto rispetto alla creazione utente e al reset admin (`recover-password-template-id` vs `password-template-id`), così è possibile personalizzare separatamente il testo delle due comunicazioni.

### 12.3 Configurazione template email

I template email per i flussi automatici sono configurabili in `application.yaml`:

| Flusso | Proprietà YAML | Variabile d'ambiente | Fallback |
|--------|---------------|----------------------|----------|
| Creazione utente, reset admin | `cms.email.password-template-id` | `CMS_EMAIL_PASSWORD_TEMPLATE_ID` | `template/email-password.html` |
| Recupero password autonomo | `cms.email.recover-password-template-id` | `CMS_EMAIL_RECOVER_PASSWORD_TEMPLATE_ID` | `template/email-recover-password.html` |

Per usare un template personalizzato:
1. Creare il template via `POST /api/v1/email/templates` con i placeholder `username` e `password`
2. Copiare l'ID MongoDB restituito nella proprietà YAML corrispondente (o nella variabile d'ambiente)

Se la proprietà è vuota (`""`), il sistema usa automaticamente il template HTML incluso nel progetto.

---

## 13. Riepilogo ruoli di sistema

| Ruolo          | Gestione utenti | Gestione gruppi | Entity definition | Gestione menu | Invio email | ACL record | Bypass ACL |
|----------------|:---------------:|:---------------:|:-----------------:|:-------------:|:-----------:|:----------:|:----------:|
| `SUPER_ADMIN`  | Si              | Si              | Si                | Si            | Si          | --         | Si         |
| `ADMIN`        | Si              | Si              | Si                | Si            | Si          | --         | Si         |
| Nessun ruolo   | No              | No              | No                | Solo lettura  | No          | In base ai gruppi | No  |

**Dettaglio:**

- **SUPER_ADMIN:** accesso completo a tutte le funzionalita del sistema. Bypassa tutti i controlli ACL sui record. Puo gestire utenti, gruppi, entity definition, menu e inviare email.
- **ADMIN:** stessi privilegi del SUPER_ADMIN in termini di gestione. Bypassa i controlli ACL sui record. Puo gestire utenti, gruppi, entity definition, menu e inviare email.
- **Nessun ruolo di sistema:** l'accesso ai record e determinato esclusivamente dai gruppi di appartenenza dell'utente e dalle ACL configurate nelle entity definition. Non puo accedere alle funzionalita amministrative (gestione utenti, gruppi, entity definition, email). Puo visualizzare il menu filtrato in base ai propri gruppi.

---

## 14. Codici di errore

| Codice HTTP | Stato                  | Quando si verifica                                                                                |
|:-----------:|------------------------|---------------------------------------------------------------------------------------------------|
| `200`       | OK                     | Richiesta completata con successo (lettura, aggiornamento, ricerca)                                |
| `201`       | Created                | Risorsa creata con successo (record, entity definition, gruppo, utente, file, template, voce menu)  |
| `204`       | No Content             | Eliminazione completata con successo, reset password completato                                     |
| `400`       | Bad Request            | Dati della richiesta non validi: campi mancanti, formato errato, vincoli di validazione non rispettati, entityKey non conforme al pattern, numero massimo di filtri superato, dimensione pagina eccedente il limite, file troppo grande (supera 10 MB), tipo MIME del file non consentito |
| `401`       | Unauthorized           | Token JWT mancante, scaduto o non valido                                                           |
| `403`       | Forbidden              | Accesso negato: utente con `firstAccess = true` che tenta di accedere ad API non di autenticazione; utente senza il ruolo di sistema richiesto; utente non autorizzato dall'ACL dell'entita; account disabilitato |
| `404`       | Not Found              | Risorsa non trovata: record, entity definition, gruppo, utente, file, template o voce di menu inesistente |
| `409`       | Conflict               | Conflitto: tentativo di eliminare una entity definition che ha record associati; nome gruppo gia esistente; username gia esistente |
| `500`       | Internal Server Error  | Errore interno del server: problemi di connessione al database, errore nell'invio email, errore nello storage file |

### Formato della risposta di errore

Tutte le risposte di errore seguono un formato standard:

```json
{
  "status": 400,
  "message": "Descrizione dell'errore",
  "errors": [
    {
      "field": "nome_campo",
      "message": "Dettaglio dell'errore di validazione"
    }
  ],
  "timestamp": "2025-01-15T16:30:00Z"
}
```

Il campo `errors` e presente solo per gli errori di validazione (400 Bad Request). Per gli altri tipi di errore, contiene `null`.
