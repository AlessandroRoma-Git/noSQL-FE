
# API Reference

Base URL: `http://localhost:8088`

> La porta e il database dipendono dal profilo attivo. Vedi [CONFIGURAZIONE.md](CONFIGURAZIONE.md) per i dettagli sui profili (`dev`, `preprod`, `prod`).

Tutti gli endpoint (eccetto Auth) richiedono un header `Authorization: Bearer <token>`.

> **First Access:** Dopo la creazione dell'account o il recupero password, il token JWT contiene `firstAccess: true`. Tutte le API (eccetto `/api/v1/auth/**`) rispondono con `403 Forbidden` finche l'utente non cambia la password tramite l'endpoint di cambio password.

> **Sistema di autorizzazione:** Il sistema si basa su **gruppi** e **ruoli di sistema** (`systemRole`).
> - Ogni utente appartiene a uno o più **gruppi**. Le ACL nelle entity definition referenziano **nomi di gruppi** per controllare l'accesso ai record.
> - Un utente può avere un `systemRole` opzionale: `SUPER_ADMIN` o `ADMIN`.
> - `SUPER_ADMIN` ha accesso completo e bypassa tutti i controlli ACL
> - `ADMIN` gestisce entity definitions, utenti, gruppi e menu. Bypassa i controlli ACL
> - Gli utenti senza `systemRole` accedono alle entity solo tramite le ACL dei gruppi a cui appartengono

## Autenticazione

### Login

```
POST /api/v1/auth/login
```

**Request body:**

```json
{
  "username": "mario",
  "password": "secret123"
}
```

**Risposta: `200 OK`**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "mario",
  "groups": ["editors"],
  "lastAccessAt": "2025-01-15T10:00:00Z",
  "firstAccess": false
}
```

> Se `firstAccess` e `true`, l'utente deve cambiare la password prima di accedere alle altre API.

**Errore credenziali: `401 Unauthorized`**

```bash
curl -X POST http://localhost:8088/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "username": "mario", "password": "secret123" }'
```

> Salva il token per le chiamate successive:
> ```bash
> TOKEN=$(curl -s -X POST http://localhost:8088/api/v1/auth/login \
>   -H "Content-Type: application/json" \
>   -d '{ "username": "mario", "password": "secret123" }' | jq -r '.token')
> ```

---

### Recupero password

```
POST /api/v1/auth/recover-password
```

Genera una nuova password casuale e la invia via email all'indirizzo registrato dell'utente. Il flag `firstAccess` viene reimpostato a `true`: l'utente dovra cambiare la password al prossimo accesso.

**Request body:**

```json
{
  "username": "mario"
}
```

**Risposta: `200 OK`**

```json
{
  "message": "Nuova password inviata via email",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Errore utente non trovato: `401 Unauthorized`**

**curl:**

```bash
curl -X POST http://localhost:8088/api/v1/auth/recover-password \
  -H "Content-Type: application/json" \
  -d '{ "username": "mario" }'
```

---

### Cambio password

```
POST /api/v1/auth/change-password
```

Richiede un token JWT valido nell'header `Authorization`. Verifica la password corrente, imposta la nuova password e setta `firstAccess` a `false`. Restituisce un nuovo token JWT aggiornato.

**Request body:**

```json
{
  "oldPassword": "passwordAutoGenerata",
  "newPassword": "laMiaNuovaPassword123"
}
```

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|-------------|-------------|
| `oldPassword` | `string` | Si | La password corrente |
| `newPassword` | `string` | Si | La nuova password (6-100 caratteri) |

**Risposta: `200 OK`**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "mario",
  "groups": ["editors"],
  "lastAccessAt": "2025-01-15T10:00:00Z",
  "firstAccess": false
}
```

> Il nuovo token ha `firstAccess: false`, permettendo l'accesso a tutte le API.

**Errore password corrente errata: `401 Unauthorized`**

**curl:**

```bash
curl -X POST http://localhost:8088/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "oldPassword": "passwordAutoGenerata", "newPassword": "laMiaNuovaPassword123" }'
```

---

## Entity Definitions

> Richiede ruolo di sistema **ADMIN** (o **SUPER_ADMIN**).

### Crea definizione entità

```
POST /api/v1/entity-definitions
```

**Request body:**

```json
{
  "entityKey": "customers",
  "label": "Clienti",
  "historyEnabled": true,
  "fields": [
    { "name": "first_name", "type": "STRING", "required": true, "maxLen": 100 },
    { "name": "email", "type": "EMAIL", "required": true },
    { "name": "age", "type": "NUMBER", "min": 0, "max": 150 },
    { "name": "role", "type": "ENUM", "required": true, "enumValues": ["admin", "user", "guest"] },
    { "name": "referenti", "type": "REFERENCE", "required": false, "referenceEntityKey": "users" }
  ],
  "acl": {
    "read": ["editors", "viewers"],
    "write": ["editors"],
    "delete": ["editors"],
    "search": ["editors", "viewers"]
  }
}
```

> Il campo `acl` definisce quali **gruppi** possono eseguire quali operazioni sui record di questa entità. Se omesso, l'accesso è aperto a tutti gli utenti autenticati. I ruoli di sistema `ADMIN` e `SUPER_ADMIN` bypassano sempre l'ACL.

> Per i campi di tipo `REFERENCE`, la proprietà `referenceEntityKey` indica l'entityKey dell'entità referenziata. Il valore del campo è **sempre una lista di ID** (es. `["id1", "id2"]`), anche se contiene un solo elemento. In fase di creazione o aggiornamento di un record, il sistema verifica che **ogni ID nella lista** esista effettivamente nell'entità target. Questo permette relazioni molti-a-molti (ad esempio, un asset assegnato a più clienti).

> Se `historyEnabled` è `true`, ogni modifica ai record di questa entità viene storicizzata.

**Risposta: `201 Created`**

```json
{
  "id": "6789abc...",
  "entityKey": "customers",
  "label": "Clienti",
  "historyEnabled": true,
  "fields": [  ],
  "acl": {
    "read": ["editors", "viewers"],
    "write": ["editors"],
    "delete": ["editors"],
    "search": ["editors", "viewers"]
  },
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

**curl:**

```bash
curl -X POST http://localhost:8088/api/v1/entity-definitions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "entityKey": "customers",
    "label": "Clienti",
    "historyEnabled": true,
    "fields": [
      { "name": "first_name", "type": "STRING", "required": true, "maxLen": 100 },
      { "name": "email", "type": "EMAIL", "required": true },
      { "name": "age", "type": "NUMBER", "min": 0, "max": 150 },
      { "name": "role", "type": "ENUM", "required": true, "enumValues": ["admin", "user", "guest"] },
      { "name": "referenti", "type": "REFERENCE", "referenceEntityKey": "users" }
    ],
    "acl": {
      "read": ["editors", "viewers"],
      "write": ["editors"],
      "delete": ["editors"],
      "search": ["editors", "viewers"]
    }
  }'
```

---

### Lista tutte le definizioni

```
GET /api/v1/entity-definitions
```

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8088/api/v1/entity-definitions
```

---

### Dettaglio definizione

```
GET /api/v1/entity-definitions/{key}
```

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8088/api/v1/entity-definitions/customers
```

---

### Aggiorna definizione

```
PUT /api/v1/entity-definitions/{key}
```

**Request body** (senza `entityKey`, non modificabile):

```json
{
  "label": "Clienti Premium",
  "historyEnabled": true,
  "fields": [
    { "name": "first_name", "type": "STRING", "required": true, "maxLen": 200 },
    { "name": "email", "type": "EMAIL", "required": true }
  ],
  "acl": {
    "read": ["editors", "viewers"],
    "write": ["editors"],
    "delete": ["editors"],
    "search": ["editors", "viewers"]
  }
}
```

```bash
curl -X PUT http://localhost:8088/api/v1/entity-definitions/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "label": "Clienti Premium",
    "historyEnabled": true,
    "fields": [
      { "name": "first_name", "type": "STRING", "required": true, "maxLen": 200 },
      { "name": "email", "type": "EMAIL", "required": true }
    ],
    "acl": { "read": ["editors", "viewers"], "write": ["editors"], "delete": ["editors"], "search": ["editors", "viewers"] }
  }'
```

---

### Elimina definizione

```
DELETE /api/v1/entity-definitions/{key}
```

Esegue un'**eliminazione logica** (soft delete): marchia la definizione come eliminata senza rimuovere i dati dal database.

**Risposta: `204 No Content`**

**Errore se esistono record: `409 Conflict`**

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:8088/api/v1/entity-definitions/customers
```

---

## Gruppi

> Richiede ruolo di sistema **ADMIN** (o **SUPER_ADMIN**).

### Crea gruppo

```
POST /api/v1/groups
```

**Request body:**

```json
{
  "name": "editors",
  "description": "Gruppo editori",
  "systemRole": null
}
```

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|-------------|-------------|
| `name` | `string` | Si | Nome del gruppo (unico) |
| `description` | `string` | No | Descrizione del gruppo |
| `systemRole` | `string` | No | Ruolo di sistema: `SUPER_ADMIN`, `ADMIN` oppure `null` |

**Risposta: `201 Created`**

```json
{
  "id": "6789abc...",
  "name": "editors",
  "description": "Gruppo editori",
  "systemRole": null,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

**curl:**

```bash
curl -X POST http://localhost:8088/api/v1/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "name": "editors", "description": "Gruppo editori", "systemRole": null }'
```

**Errore nome duplicato: `409 Conflict`**

---

### Lista tutti i gruppi

```
GET /api/v1/groups
```

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8088/api/v1/groups
```

---

### Dettaglio gruppo

```
GET /api/v1/groups/{id}
```

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8088/api/v1/groups/6789abc123
```

**Errore gruppo non trovato: `404 Not Found`**

---

### Aggiorna gruppo

```
PUT /api/v1/groups/{id}
```

**Request body:**

```json
{
  "name": "editors",
  "description": "Nuova descrizione",
  "systemRole": "ADMIN"
}
```

**curl:**

```bash
curl -X PUT http://localhost:8088/api/v1/groups/6789abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "name": "editors", "description": "Nuova descrizione", "systemRole": "ADMIN" }'
```

---

### Elimina gruppo

```
DELETE /api/v1/groups/{id}
```

Esegue un'**eliminazione logica** (soft delete): marchia il gruppo come eliminato senza rimuoverlo dal database.

**Risposta: `204 No Content`**

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:8088/api/v1/groups/6789abc123
```

**Errore gruppo non trovato: `404 Not Found`**

---

## Gestione Utenti

> Richiede ruolo di sistema **ADMIN** (o **SUPER_ADMIN**).

### Crea utente

```
POST /api/v1/users
```

**Request body:**

```json
{
  "username": "luigi",
  "email": "luigi@example.com",
  "groupIds": ["abc123"]
}
```

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|-------------|-------------|
| `username` | `string` | Si | Nome utente (3-50 caratteri) |
| `email` | `string` | Si | Indirizzo email valido |
| `groupIds` | `string[]` | No | Lista degli ID dei gruppi a cui assegnare l'utente |

**Risposta: `201 Created`**

```json
{
  "id": "6789abc...",
  "username": "luigi",
  "email": "luigi@example.com",
  "groupIds": ["abc123"],
  "groupNames": ["editors"],
  "enabled": true,
  "firstAccess": true,
  "lastAccessAt": null,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

**curl:**

```bash
curl -X POST http://localhost:8088/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "username": "luigi", "email": "luigi@example.com", "groupIds": ["abc123"] }'
```

**Errore username duplicato: `409 Conflict`**

---

### Lista utenti

```
GET /api/v1/users
```

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8088/api/v1/users
```

---

### Dettaglio utente

```
GET /api/v1/users/{id}
```

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8088/api/v1/users/6789abc123
```

**Errore utente non trovato: `404 Not Found`**

---

### Aggiorna utente

```
PUT /api/v1/users/{id}
```

**Request body:**

```json
{
  "email": "luigi.new@example.com",
  "groupIds": ["abc123", "def456"],
  "enabled": true
}
```

**curl:**

```bash
curl -X PUT http://localhost:8088/api/v1/users/6789abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "email": "luigi.new@example.com", "groupIds": ["abc123", "def456"], "enabled": true }'
```

---

### Elimina utente

```
DELETE /api/v1/users/{id}
```

Esegue un'**eliminazione logica** (soft delete): marchia l'utente come eliminato senza rimuoverlo dal database.

**Risposta: `204 No Content`**

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:8088/api/v1/users/6789abc123
```

**Errore utente non trovato: `404 Not Found`**

---

### Reset password utente

```
POST /api/v1/users/{id}/reset-password
```

Genera una nuova password casuale e la invia via email all'utente. Il flag `firstAccess` viene reimpostato a `true`.

**Risposta: `204 No Content`**

**curl:**

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:8088/api/v1/users/6789abc123/reset-password
```

**Errore utente non trovato: `404 Not Found`**

---

## Menu

### Menu utente corrente

```
GET /api/v1/menu
```

> Richiede autenticazione. Restituisce le voci di menu filtrate per i gruppi dell'utente. ADMIN e SUPER_ADMIN vedono tutto.

**Risposta: `200 OK`**

```json
[
  {
    "id": "6789abc...",
    "label": "Clienti",
    "entityKey": "customers",
    "icon": "people",
    "position": 1,
    "parentId": null,
    "groups": ["editors"],
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
]
```

**curl:**

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8088/api/v1/menu
```

---

### Gestione menu (ADMIN)

> Richiede ruolo di sistema **ADMIN** (o **SUPER_ADMIN**).

#### Crea voce di menu

```
POST /api/v1/menu/manage
```

**Request body:**

```json
{
  "label": "Clienti",
  "entityKey": "customers",
  "icon": "people",
  "position": 1,
  "parentId": null,
  "groups": ["editors"]
}
```

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|-------------|-------------|
| `label` | `string` | Si | Etichetta della voce di menu |
| `entityKey` | `string` | No | Chiave dell'entità associata |
| `icon` | `string` | No | Nome dell'icona |
| `position` | `int` | No | Posizione ordinamento |
| `parentId` | `string` | No | ID della voce padre (per sotto-menu) |
| `groups` | `string[]` | No | Lista dei gruppi che possono vedere questa voce |

**Risposta: `201 Created`**

```json
{
  "id": "6789abc...",
  "label": "Clienti",
  "entityKey": "customers",
  "icon": "people",
  "position": 1,
  "parentId": null,
  "groups": ["editors"],
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

**curl:**

```bash
curl -X POST http://localhost:8088/api/v1/menu/manage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "label": "Clienti", "entityKey": "customers", "icon": "people", "position": 1, "groups": ["editors"] }'
```

---

#### Lista tutte le voci di menu

```
GET /api/v1/menu/manage
```

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8088/api/v1/menu/manage
```

---

#### Aggiorna voce di menu

```
PUT /api/v1/menu/manage/{id}
```

**Request body:**

```json
{
  "label": "Clienti Premium",
  "entityKey": "customers",
  "icon": "people",
  "position": 2,
  "groups": ["editors", "viewers"]
}
```

**curl:**

```bash
curl -X PUT http://localhost:8088/api/v1/menu/manage/6789abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "label": "Clienti Premium", "entityKey": "customers", "icon": "people", "position": 2, "groups": ["editors", "viewers"] }'
```

---

#### Elimina voce di menu

```
DELETE /api/v1/menu/manage/{id}
```

Esegue un'**eliminazione logica** (soft delete): marchia la voce di menu come eliminata senza rimuoverla dal database.

**Risposta: `204 No Content`**

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:8088/api/v1/menu/manage/6789abc123
```

**Errore menu item non trovato: `404 Not Found`**

---

## Records

> Richiede autenticazione + permessi ACL definiti nell'entità.

### Eliminazione logica (Soft Delete)

> Tutte le operazioni DELETE del CMS implementano l'**eliminazione logica** (soft delete), non l'eliminazione fisica.
>
> **Comportamento:**
> - Tutti gli endpoint DELETE impostano il flag `deleted = true` sul record, senza rimuovere i dati dal database
> - I record marcati come eliminati sono automaticamente esclusi da tutte le operazioni di ricerca e visualizzazione
> - I dati fisici rimangono nel database per motivi di audit e conformità normativa
> - Per i file: il soft delete marchia solo i metadati come eliminati; il file fisico nello storage (MongoDB GridFS o S3) NON viene rimosso

### Crea record

```
POST /api/v1/records/{entityKey}
```

Richiede permesso ACL **write**.

```bash
curl -X POST http://localhost:8088/api/v1/records/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "data": {
      "first_name": "Mario",
      "email": "mario@example.com",
      "age": 35,
      "role": "admin"
    }
  }'
```

**Risposta: `201 Created`**

```json
{
  "id": "678abc...",
  "entityKey": "customers",
  "data": { "first_name": "Mario", "email": "mario@example.com", "age": 35, "role": "admin" },
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

**Errore ACL: `403 Forbidden`**

```json
{
  "status": 403,
  "message": "You do not have write permission on 'customers'"
}
```

**Errore validazione: `422 Unprocessable Entity`**

```json
{
  "status": 422,
  "message": "Record validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "unknown_field", "message": "Unknown field" }
  ]
}
```

---

### Dettaglio record

```
GET /api/v1/records/{entityKey}/{id}
```

Richiede permesso ACL **read**.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8088/api/v1/records/customers/678abc123
```

---

### Aggiorna record

```
PUT /api/v1/records/{entityKey}/{id}
```

Richiede permesso ACL **write**. Sostituzione completa di `data`.

```bash
curl -X PUT http://localhost:8088/api/v1/records/customers/678abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "data": {
      "first_name": "Mario",
      "email": "mario.rossi@example.com",
      "age": 36,
      "role": "user"
    }
  }'
```

---

### Elimina record

```
DELETE /api/v1/records/{entityKey}/{id}
```

Richiede permesso ACL **delete**. Esegue un'**eliminazione logica**: imposta `deleted = true` sul record senza rimuoverlo dal database.

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:8088/api/v1/records/customers/678abc123
```

---

### Storico record

> Disponibile solo per le entità con `historyEnabled: true`.

#### Lista storico modifiche

```
GET /api/v1/records/{entityKey}/{id}/history
```

Richiede permesso ACL **read**. Restituisce l'elenco delle versioni storiche di un record.

**Risposta: `200 OK`**

```json
[
  {
    "id": "...",
    "recordId": "678abc...",
    "entityKey": "customers",
    "data": { "first_name": "Mario", "email": "mario@example.com" },
    "version": 1,
    "modifiedBy": "super_admin",
    "modifiedAt": "2025-01-15T10:30:00Z"
  }
]
```

**curl:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8088/api/v1/records/customers/678abc123/history
```

---

#### Dettaglio versione specifica

```
GET /api/v1/records/{entityKey}/{id}/history/{version}
```

Richiede permesso ACL **read**. Restituisce una versione specifica dello storico di un record.

**Risposta: `200 OK`**

```json
{
  "id": "...",
  "recordId": "678abc...",
  "entityKey": "customers",
  "data": { "first_name": "Mario", "email": "mario@example.com" },
  "version": 1,
  "modifiedBy": "super_admin",
  "modifiedAt": "2025-01-15T10:30:00Z"
}
```

**curl:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8088/api/v1/records/customers/678abc123/history/1
```

**Errore versione non trovata: `404 Not Found`**

---

## Ricerca paginata

```
POST /api/v1/records/{entityKey}/search
```

Richiede permesso ACL **search**.

### Parametri

| Campo | Tipo | Default | Descrizione |
|-------|------|---------|-------------|
| `filters` | `FilterRequest[]` | `[]` | Lista di filtri (max 10) |
| `sorts` | `SortRequest[]` | `[]` | Lista di ordinamenti |
| `page` | `int` | `0` | Numero di pagina (0-based) |
| `size` | `int` | `20` | Elementi per pagina (max 100) |

### Operatori filtro

| Operatore | Descrizione | Tipo valore |
|-----------|-------------|-------------|
| `eq` | Uguale | qualsiasi |
| `ne` | Diverso | qualsiasi |
| `gt` | Maggiore di | number/string |
| `gte` | Maggiore o uguale | number/string |
| `lt` | Minore di | number/string |
| `lte` | Minore o uguale | number/string |
| `in` | Contenuto in lista | array |
| `like` | Contiene (case-insensitive) | string |

### Esempio: filtro semplice

```bash
curl -X POST http://localhost:8088/api/v1/records/customers/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "filters": [
      { "field": "role", "op": "eq", "value": "admin" }
    ],
    "page": 0,
    "size": 10
  }'
```

### Esempio: filtri multipli con ordinamento

```bash
curl -X POST http://localhost:8088/api/v1/records/customers/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "filters": [
      { "field": "age", "op": "gte", "value": 18 },
      { "field": "role", "op": "in", "value": ["admin", "user"] }
    ],
    "sorts": [
      { "field": "age", "direction": "desc" }
    ],
    "page": 0,
    "size": 20
  }'
```

### Esempio: ricerca testuale con `like`

```bash
curl -X POST http://localhost:8088/api/v1/records/customers/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "filters": [
      { "field": "first_name", "op": "like", "value": "mar" }
    ]
  }'
```

> `like` usa `Pattern.quote()` internamente. La ricerca è case-insensitive.

### Risposta

```json
{
  "content": [
    {
      "id": "...",
      "entityKey": "customers",
      "data": { "first_name": "Mario", "email": "mario@example.com", "age": 35, "role": "admin" },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

---

## File

> Richiede autenticazione. Gli endpoint per la gestione dei file supportano upload, download e eliminazione. I file vengono salvati nel backend di storage configurato (MongoDB GridFS o Amazon S3).

### Upload file

```
POST /api/v1/files
```

Content-Type: `multipart/form-data`

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `file` | `MultipartFile` | Il file da caricare (form field name: `file`) |

**Vincoli di validazione:**
- Dimensione massima: 10 MB (configurabile)
- Tipi MIME consentiti (default): `image/jpeg`, `image/png`, `image/gif`, `application/pdf`, `text/plain`
- Il file non può essere vuoto

**Risposta: `201 Created`**

```json
{
  "id": "6789abc...",
  "filename": "documento.pdf",
  "contentType": "application/pdf",
  "size": 204800,
  "uploadedBy": "mario",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

**curl:**

```bash
curl -X POST http://localhost:8088/api/v1/files \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/documento.pdf"
```

**Errore file vuoto o troppo grande: `400 Bad Request`**

```json
{
  "status": 400,
  "message": "Il file supera la dimensione massima consentita: 10485760 byte"
}
```

**Errore tipo MIME non consentito: `400 Bad Request`**

```json
{
  "status": 400,
  "message": "Tipo di file non consentito: application/zip"
}
```

---

### Download file

```
GET /api/v1/files/{id}
```

Restituisce il contenuto binario del file con gli header appropriati:
- `Content-Type`: tipo MIME del file
- `Content-Disposition`: `attachment; filename="nome_originale.ext"`
- `Content-Length`: dimensione in byte

**curl:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  -o documento.pdf \
  http://localhost:8088/api/v1/files/6789abc123
```

**Errore file non trovato: `404 Not Found`**

```json
{
  "status": 404,
  "message": "File non trovato con id: 6789abc123"
}
```

---

### Elimina file

```
DELETE /api/v1/files/{id}
```

Esegue un'**eliminazione logica** (soft delete): marchia i metadati del file come eliminati (`deleted = true`) senza rimuovere il file fisico dal backend di storage (MongoDB GridFS o S3).

**Risposta: `204 No Content`**

**curl:**

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:8088/api/v1/files/6789abc123
```

**Errore file non trovato: `404 Not Found`**

---

## Email

> Richiede ruolo di sistema **ADMIN**. L'utente deve avere il ruolo di sistema `ADMIN` o `SUPER_ADMIN`.

### Invia email

```
POST /api/v1/email/send
```

Invia una email con corpo HTML risolto da un template e allegati opzionali. Il corpo HTML viene determinato dal template indicato tramite `templateId`, con i placeholder sostituiti dai valori forniti nella mappa `placeholders`.

Gli allegati possono provenire da tre sorgenti:
- **`attachments`**: allegati codificati in Base64, inline (CID embedding) o classici
- **`storageAttachments`**: file gia presenti nello storage CMS, riferiti per ID
- **Allegati del template**: se il template ha allegati associati, vengono inclusi automaticamente come allegati classici

E possibile allegare un **evento calendario iCal** (RFC 5545) tramite il campo `calendarEvent`. L'evento viene generato come file `.ics` e allegato con content-type `text/calendar`, permettendo ai client email di riconoscerlo come invito calendario.

**Request body (semplice):**

```json
{
  "to": "destinatario@example.com",
  "subject": "Conferma ordine #1234",
  "templateId": "6789abc...",
  "placeholders": {
    "nome_cliente": "Mario Rossi",
    "numero_ordine": "1234",
    "totale": "99.90"
  }
}
```

**Request body (completo con allegati e calendario):**

```json
{
  "to": "destinatario@example.com",
  "from": "mittente@example.com",
  "cc": ["cc1@example.com"],
  "bcc": ["bcc@example.com"],
  "subject": "Invito riunione progetto",
  "templateId": "6789abc...",
  "placeholders": {
    "nome_cliente": "Mario Rossi",
    "data_riunione": "20 Febbraio 2025"
  },
  "attachments": [
    {
      "filename": "logo.png",
      "contentType": "image/png",
      "base64Content": "iVBORw0KGgoAAAANSUhEUgAA...",
      "inline": true,
      "contentId": "logo1"
    },
    {
      "filename": "contratto.pdf",
      "contentType": "application/pdf",
      "base64Content": "JVBERi0xLjQKJ...",
      "inline": false,
      "contentId": null
    }
  ],
  "storageAttachments": [
    { "fileId": "6789def..." },
    { "fileId": "6789ghi..." }
  ],
  "calendarEvent": {
    "summary": "Riunione progetto CMS",
    "description": "Revisione sprint e pianificazione",
    "location": "Sala conferenze A",
    "startDateTime": "2025-02-20T14:00:00Z",
    "endDateTime": "2025-02-20T15:30:00Z",
    "organizer": "mittente@example.com",
    "method": "REQUEST"
  }
}
```

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|-------------|-------------|
| `to` | `string` | Si | Indirizzo email del destinatario |
| `from` | `string` | No | Indirizzo mittente (usa default da config se omesso) |
| `cc` | `string[]` | No | Indirizzi in copia conoscenza |
| `bcc` | `string[]` | No | Indirizzi in copia conoscenza nascosta |
| `subject` | `string` | Si | Oggetto della mail |
| `templateId` | `string` | Si | ID del template email da utilizzare |
| `placeholders` | `Map<string,string>` | No | Mappa chiave-valore dei placeholder da sostituire nel template |
| `attachments` | `AttachmentDto[]` | No | Lista di allegati in Base64 |
| `storageAttachments` | `StorageAttachmentDto[]` | No | Lista di allegati referenziati dallo storage CMS |
| `calendarEvent` | `CalendarEventDto` | No | Evento calendario iCal da allegare |

**Struttura allegato Base64 (`AttachmentDto`):**

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|-------------|-------------|
| `filename` | `string` | Si | Nome del file (es. `logo.png`) |
| `contentType` | `string` | Si | Tipo MIME (es. `image/png`) |
| `base64Content` | `string` | Si | Contenuto codificato in Base64 |
| `inline` | `boolean` | No | `true` = embedding inline CID, `false` = allegato classico (default) |
| `contentId` | `string` | No | ID CID per riferimento nell'HTML (es. `logo1` per `<img src="cid:logo1">`) |

> **Allegati inline (CID):** Per incorporare immagini direttamente nel corpo HTML (visibili in tutti i client email), impostare `inline: true` e specificare un `contentId`. Nell'HTML, referenziare l'immagine con `<img src="cid:contentId">`. L'immagine viene allegata come risorsa MIME inline, non come URL esterno.

**Struttura allegato da storage (`StorageAttachmentDto`):**

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|-------------|-------------|
| `fileId` | `string` | Si | ID del file nello storage CMS (corrisponde a `FileMetadata.id`) |

> Il filename e il contentType vengono derivati automaticamente dai metadati del file. Se il file non esiste, il server risponde con errore `404`.

**Struttura evento calendario (`CalendarEventDto`):**

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|-------------|-------------|
| `summary` | `string` | Si | Titolo dell'evento |
| `description` | `string` | No | Descrizione dell'evento |
| `location` | `string` | No | Luogo dell'evento |
| `startDateTime` | `Instant` | Si | Data e ora di inizio in UTC (es. `2025-02-20T14:00:00Z`) |
| `endDateTime` | `Instant` | Si | Data e ora di fine in UTC |
| `organizer` | `string` | No | Indirizzo email dell'organizzatore |
| `method` | `string` | No | Metodo iCal: `REQUEST` (invito, default) o `PUBLISH` (pubblicazione) |

> L'evento viene generato come file `.ics` conforme a RFC 5545 e allegato con content-type `text/calendar`. I client email (Outlook, Gmail, Apple Mail) lo riconoscono automaticamente come invito calendario.

**Risposta: `200 OK`**

```json
{
  "message": "Email inviata con successo",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**curl (con template):**

```bash
curl -X POST http://localhost:8088/api/v1/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "to": "destinatario@example.com",
    "subject": "Conferma ordine",
    "templateId": "6789abc...",
    "placeholders": {
      "nome_cliente": "Mario Rossi",
      "numero_ordine": "1234"
    }
  }'
```

**curl (con evento calendario):**

```bash
curl -X POST http://localhost:8088/api/v1/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "to": "destinatario@example.com",
    "subject": "Invito riunione",
    "templateId": "6789abc...",
    "placeholders": { "nome_cliente": "Mario Rossi" },
    "calendarEvent": {
      "summary": "Riunione progetto",
      "startDateTime": "2025-02-20T14:00:00Z",
      "endDateTime": "2025-02-20T15:30:00Z"
    }
  }'
```

**curl (con allegati da storage):**

```bash
curl -X POST http://localhost:8088/api/v1/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "to": "destinatario@example.com",
    "subject": "Documenti allegati",
    "templateId": "6789abc...",
    "placeholders": { "nome_cliente": "Mario Rossi" },
    "storageAttachments": [
      { "fileId": "6789def..." }
    ]
  }'
```

**Errore ruolo mancante: `403 Forbidden`** (l'utente non ha il ruolo di sistema richiesto)

**Errore validazione input: `400 Bad Request`**

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "to", "message": "must not be blank" },
    { "field": "templateId", "message": "must not be blank" }
  ]
}
```

**Errore template non trovato: `404 Not Found`**

**Errore file da storage non trovato: `404 Not Found`**

**Errore invio: `500 Internal Server Error`**

```json
{
  "status": 500,
  "message": "Email send error"
}
```

---

## Email Templates

> Richiede ruolo di sistema **ADMIN**. Gestione CRUD dei template email HTML con placeholder e allegati opzionali.

### Crea template

```
POST /api/v1/email/templates
```

Crea un template email con placeholder e allegati opzionali. Gli allegati vengono salvati nel template come documenti embedded (Base64 in MongoDB). Quando il template viene utilizzato per inviare un'email, gli allegati del template vengono inclusi automaticamente come **allegati classici** (non inline CID).

**Request body:**

```json
{
  "name": "conferma_ordine",
  "htmlContent": "<html><body><h1>Ordine {{numero_ordine}}</h1><p>Grazie {{nome_cliente}}, il tuo ordine di {{totale}} EUR e stato confermato.</p></body></html>",
  "placeholders": ["numero_ordine", "nome_cliente", "totale"],
  "attachments": [
    {
      "filename": "termini_condizioni.pdf",
      "contentType": "application/pdf",
      "base64Content": "JVBERi0xLjQKJ..."
    }
  ]
}
```

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|-------------|-------------|
| `name` | `string` | Si | Nome identificativo del template (unico) |
| `htmlContent` | `string` | Si | Contenuto HTML con placeholder nel formato `{{nome}}` |
| `placeholders` | `string[]` | Si | Lista dei nomi dei placeholder presenti nel template |
| `attachments` | `TemplateAttachmentDto[]` | No | Lista di allegati da associare al template |

**Struttura allegato template (`TemplateAttachmentDto`):**

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|-------------|-------------|
| `filename` | `string` | Si | Nome del file (es. `termini_condizioni.pdf`) |
| `contentType` | `string` | Si | Tipo MIME (es. `application/pdf`) |
| `base64Content` | `string` | Si | Contenuto codificato in Base64 |

> I nomi dei placeholder devono contenere solo lettere, numeri e underscore (`[a-zA-Z0-9_]+`). Ogni placeholder dichiarato deve essere presente nel contenuto HTML. Gli allegati del template vengono inclusi come allegati classici ogni volta che il template viene usato per inviare un'email.

**Risposta: `201 Created`**

```json
{
  "id": "6789abc...",
  "name": "conferma_ordine",
  "htmlContent": "<html>...</html>",
  "placeholders": ["numero_ordine", "nome_cliente", "totale"],
  "attachments": [
    {
      "filename": "termini_condizioni.pdf",
      "contentType": "application/pdf",
      "base64Content": "JVBERi0xLjQKJ..."
    }
  ],
  "createdBy": "mario",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

**curl:**

```bash
curl -X POST http://localhost:8088/api/v1/email/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "conferma_ordine",
    "htmlContent": "<html><body><h1>Ordine {{numero_ordine}}</h1><p>Grazie {{nome_cliente}}!</p></body></html>",
    "placeholders": ["numero_ordine", "nome_cliente"],
    "attachments": [
      {
        "filename": "termini.pdf",
        "contentType": "application/pdf",
        "base64Content": "JVBERi0xLjQKJ..."
      }
    ]
  }'
```

**Errore nome duplicato: `409 Conflict`**

**Errore placeholder non valido: `400 Bad Request`** (nome non conforme o non presente nell'HTML)

---

### Lista tutti i template

```
GET /api/v1/email/templates
```

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8088/api/v1/email/templates
```

---

### Dettaglio template

```
GET /api/v1/email/templates/{id}
```

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8088/api/v1/email/templates/6789abc123
```

**Errore template non trovato: `404 Not Found`**

---

### Elimina template

```
DELETE /api/v1/email/templates/{id}
```

Esegue un'**eliminazione logica** (soft delete): marchia il template come eliminato senza rimuoverlo dal database.

**Risposta: `204 No Content`**

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:8088/api/v1/email/templates/6789abc123
```

**Errore template non trovato: `404 Not Found`**
