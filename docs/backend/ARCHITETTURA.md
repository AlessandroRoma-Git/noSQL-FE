# Architettura CMS NoSQL

## Panoramica

CMS NoSQL è un backend Spring Boot che permette di definire entità dinamiche a runtime (come form builder) e salvare i dati corrispondenti in MongoDB. Non esistono classi Java per le singole entità: tutto è dinamico e guidato da **Entity Definitions** salvate in database.

Il sistema include autenticazione JWT, gerarchia ruoli (`super_admin > admin > user`), gestione gruppi utente, controllo accessi ACL basato su gruppi configurabile per ogni entità, e un sistema di menu dinamico con visibilità per gruppo. Include inoltre gestione file con backend di storage intercambiabile (MongoDB GridFS o Amazon S3).

**Stack tecnologico:** Java 25, Spring Boot 4.0.2, Spring Data MongoDB, Spring Security + JWT (JJWT 0.12.6), AWS SDK v2 (S3), MongoDB 6+.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Client     │────▶│  TraceId     │────▶│  JWT Filter  │────▶│   Controller     │────▶│   Service    │
│  (curl/FE)   │◀────│  Filter      │◀────│  (Security)  │◀────│   REST Layer     │◀────│   Layer      │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────────┘     └──────┬───────┘
                      traceId + sessionId                                                      │
                      nel MDC (SLF4J)                                                   ┌──────▼───────┐
                                                                                        │  Repository  │
                                                                                        │    Layer     │
                                                                                        └──────┬───────┘
                                                                                               │
                                                                                        ┌──────▼───────┐
                                                                                        │   MongoDB    │
                                                                                        └──────────────┘

                                                                                        ┌──────────────┐
                                                                                        │ File Storage │
                                                                                        │  (GridFS/S3) │
                                                                                        └──────────────┘
```

## Collection MongoDB

### `users`

Utenti del sistema con credenziali, ruoli, gruppi e stato di primo accesso.

```json
{
  "_id": "ObjectId",
  "username": "mario",
  "email": "mario@example.com",
  "password": "$2a$10$...",
  "roles": ["admin"],
  "groupIds": ["abc123", "def456"],
  "enabled": true,
  "firstAccess": true,
  "failedLoginAttempts": 0,
  "lastAccessAt": "2025-01-15T10:00:00Z",
  "createdAt": "2025-01-15T09:00:00Z"
}
```

> Il campo `firstAccess` indica se l'utente deve cambiare la password al primo accesso. Quando `true`, tutte le API (tranne autenticazione) vengono bloccate. Il campo `email` ha un indice univoco e viene usato per l'invio della password auto-generata. Il campo `groupIds` contiene gli ID dei gruppi a cui l'utente appartiene.

### `entity_definitions`

Schema dei form. Ogni documento descrive un tipo di entità con i suoi campi, regole di validazione e ACL.

```json
{
  "_id": "ObjectId",
  "entityKey": "customers",
  "label": "Clienti",
  "fields": [
    { "name": "first_name", "type": "STRING", "required": true, "maxLen": 100 },
    { "name": "email", "type": "EMAIL", "required": true },
    { "name": "age", "type": "NUMBER", "min": 0, "max": 150 },
    { "name": "status", "type": "ENUM", "enumValues": ["active", "inactive"] }
  ],
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

> Le liste ACL contengono nomi di **gruppi**, non di ruoli.

### `records`

Dati inseriti dagli utenti. Ogni record è collegato a una entity definition tramite `entityKey`. Il campo `data` è una mappa libera validata a runtime contro la definizione.

```json
{
  "_id": "ObjectId",
  "entityKey": "customers",
  "data": {
    "first_name": "Mario",
    "email": "mario@example.com",
    "age": 35,
    "status": "active"
  },
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### `file_metadata`

Metadati dei file caricati nel sistema. Il contenuto binario è salvato nel backend di storage configurato (GridFS o S3), mentre questa collection registra le informazioni descrittive.

```json
{
  "_id": "ObjectId",
  "filename": "documento.pdf",
  "contentType": "application/pdf",
  "size": 204800,
  "uploadedBy": "mario",
  "storageType": "grid-fs",
  "storageReference": "6789abcdef012345",
  "createdAt": "2025-01-15T11:00:00Z"
}
```

> Per il backend **GridFS**, `storageReference` è l'ObjectId del file in `fs.files`. Per **S3**, è la chiave dell'oggetto nel bucket (formato: `UUID/filename`).

### `email_templates`

Template HTML per l'invio email con placeholder e allegati opzionali. I placeholder usano la sintassi `{{nome}}` e vengono sostituiti con valori HTML-escaped al momento dell'invio. Gli allegati del template vengono salvati come documenti embedded (Base64 in MongoDB) e inclusi automaticamente come allegati classici quando il template viene usato per inviare un'email.

```json
{
  "_id": "ObjectId",
  "name": "conferma_ordine",
  "htmlContent": "<html><body><h1>Ordine {{numero_ordine}}</h1><p>Grazie {{nome_cliente}}!</p></body></html>",
  "placeholders": ["numero_ordine", "nome_cliente"],
  "attachments": [
    {
      "filename": "termini_condizioni.pdf",
      "contentType": "application/pdf",
      "base64Content": "JVBERi0xLjQKJ..."
    }
  ],
  "createdBy": "mario",
  "createdAt": "2025-01-15T11:00:00Z",
  "updatedAt": "2025-01-15T11:00:00Z"
}
```

> Il campo `name` ha un indice univoco. I nomi dei placeholder devono rispettare il pattern `[a-zA-Z0-9_]+`. Il campo `attachments` e opzionale (null se assente).

### `groups`

Gruppi utente per il controllo accessi ACL e la visibilità del menu.

```json
{
  "_id": "ObjectId",
  "name": "editors",
  "description": "Gruppo editori contenuti",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

### `menu_items`

Voci di menu configurabili con visibilità basata sui gruppi utente. Supportano struttura gerarchica tramite `parentId`.

```json
{
  "_id": "ObjectId",
  "label": "Clienti",
  "entityKey": "customers",
  "icon": "people",
  "position": 1,
  "parentId": null,
  "groups": ["editors", "viewers"],
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

### `fs.files` e `fs.chunks` (GridFS)

Collection gestite automaticamente da MongoDB GridFS quando il backend di storage è `grid-fs`. Contengono rispettivamente i metadati e i chunk binari dei file.

## Layer applicativi

### Controller

| Classe | Base path | Responsabilità |
|--------|-----------|----------------|
| `AuthController` | `/api/v1/auth` | Registrazione, login, recupero password e cambio password |
| `EntityDefinitionController` | `/api/v1/entity-definitions` | CRUD definizioni entità (admin) |
| `GroupController` | `/api/v1/groups` | CRUD gruppi (admin) |
| `UserController` | `/api/v1/users` | CRUD utenti e reset password (admin) |
| `MenuController` | `/api/v1/menu` | Menu filtrato per utente + CRUD gestione menu (admin) |
| `RecordController` | `/api/v1/records/{entityKey}` | CRUD record + ricerca (ACL per entità) |
| `FileController` | `/api/v1/files` | Upload, download e eliminazione file (autenticato) |
| `EmailController` | `/api/v1/email` | Invio email e CRUD template email (solo ruolo `sender`) |

### Service

| Classe | Responsabilità |
|--------|----------------|
| `AuthService` | Registrazione utenti (con auto-generazione password), login, recupero password, cambio password e generazione JWT |
| `JwtService` | Generazione, parsing e validazione token JWT |
| `AclService` | Verifica permessi ACL per **gruppo** sull'entità |
| `GroupService` | CRUD gruppi, risoluzione nomi gruppi da ID |
| `UserManagementService` | CRUD utenti, reset password, risoluzione gruppi |
| `MenuService` | CRUD voci di menu, filtraggio menu per gruppi utente |
| `EntityDefinitionService` | CRUD definizioni, validazione entityKey, protezione eliminazione |
| `RecordService` | Orchestrazione CRUD record e ricerca paginata (con check ACL) |
| `RecordValidationService` | Validazione runtime dei dati contro la definizione |
| `QueryBuilderService` | Traduzione filtri DSL in `Criteria` MongoDB |
| `FileManagementService` | Orchestrazione upload/download/delete file, validazione e metadati |
| `FileStorageService` | Interfaccia per il backend di storage (strategy pattern) |
| `GridFsStorageService` | Implementazione storage su MongoDB GridFS (attiva con `cms.storage.type=grid-fs`) |
| `S3StorageService` | Implementazione storage su Amazon S3/MinIO (attiva con `cms.storage.type=s3`) |
| `EmailService` | Invio email HTML con allegati inline (CID), classici, da storage CMS e da template via JavaMailSender; generazione eventi calendario iCal (RFC 5545) |
| `EmailTemplateService` | CRUD template email con allegati embedded, risoluzione placeholder con HTML-escape anti-injection |

### Security e Filtri

| Classe | Responsabilità |
|--------|----------------|
| `TraceIdFilter` | Genera Trace ID per richiesta e gestisce Session ID (MDC + header HTTP) |
| `JwtAuthenticationFilter` | Estrae JWT dal header `Authorization`, popola `SecurityContext`, blocca richieste se primo accesso |
| `SecurityConfig` | Configura Spring Security: stateless, filtro JWT, regole accesso, RoleHierarchy (`super_admin > admin > user`) |

### Repository

| Classe | Tipo | Responsabilità |
|--------|------|----------------|
| `UserRepository` | `MongoRepository` (interface) | Operazioni su `users` |
| `EntityDefinitionRepository` | `MongoRepository` (interface) | Operazioni su `entity_definitions` |
| `GroupRepository` | `MongoRepository` (interface) | Operazioni su `groups` |
| `MenuItemRepository` | `MongoRepository` (interface) | Operazioni su `menu_items` |
| `RecordRepository` | Classe custom con `MongoTemplate` | Query dinamiche e paginazione su `records` |
| `FileMetadataRepository` | `MongoRepository` (interface) | Operazioni su `file_metadata` |
| `EmailTemplateRepository` | `MongoRepository` (interface) | Operazioni su `email_templates` |

## Autenticazione e autorizzazione

### JWT Authentication

```
Client                        Server
  │                              │
  ├── POST /api/v1/auth/login ──▶│  AuthService verifica credenziali
  │◀── { token, username, roles,  │  JwtService genera token
  │     groups, firstAccess }     │
  │                              │
  ├── GET /api/v1/records/...  ──▶│  JwtAuthenticationFilter:
  │   Authorization: Bearer xxx   │    1. Estrae token dal header
  │                              │    2. Valida firma e scadenza
  │                              │    3. Popola SecurityContext con username + roles + groups
  │                              │    4. Se firstAccess=true e path non e auth → 403
  │◀── 200 OK (o 403 se first)   │
```

Il token contiene:
- `sub`: username
- `roles`: lista ruoli (`["admin", "user"]`)
- `groups`: lista nomi gruppi (`["editors", "viewers"]`)
- `firstAccess`: `true` se l'utente deve cambiare password
- `iat` / `exp`: timestamp emissione e scadenza

### ACL (Access Control List)

Ogni entity definition può avere un campo `acl` che definisce quali **gruppi** hanno accesso a quali operazioni sui record di quella entità.

```json
{
  "acl": {
    "read":   ["editors", "viewers"],
    "write":  ["editors"],
    "delete": ["editors"],
    "search": ["editors", "viewers"]
  }
}
```

> Le liste ACL contengono nomi di **gruppi**, non di ruoli.

**Regole:**

| Permesso | Operazioni protette |
|----------|---------------------|
| `read` | GET record singolo |
| `write` | POST (crea) e PUT (aggiorna) record |
| `delete` | DELETE record |
| `search` | POST search |

**Logica di enforcement (`AclService`):**
1. I ruoli `super_admin` e `admin` bypassano sempre l'ACL
2. Se `acl` è `null` → accesso aperto a tutti gli utenti autenticati
3. Se la lista per un permesso è `null` o vuota → accesso aperto
4. Altrimenti, almeno uno dei **gruppi** dell'utente deve essere nella lista

> `AclService` estrae i gruppi dell'utente dal token JWT (claim `groups`) e li confronta con le liste ACL della entity definition.

### Regole di accesso per endpoint

| Endpoint | Accesso |
|----------|---------|
| `/api/v1/auth/**` | Pubblico |
| `/api/v1/entity-definitions/**` | Solo ruolo `admin` (super_admin via gerarchia) |
| `/api/v1/groups/**` | Solo ruolo `admin` (super_admin via gerarchia) |
| `/api/v1/users/**` | Solo ruolo `admin` (super_admin via gerarchia) |
| `/api/v1/menu/manage/**` | Solo ruolo `admin` (super_admin via gerarchia) |
| `/api/v1/menu` | Utente autenticato (menu filtrato per gruppi) |
| `/api/v1/records/**` | Utente autenticato + check ACL per entità |
| `/api/v1/files/**` | Utente autenticato |
| `/api/v1/email/**` | Solo ruolo `sender` |

## Flusso dati

### Creazione record (con ACL)

```
Client POST /api/v1/records/customers { data: {...} }
  │  Authorization: Bearer <token>
  ▼
JwtAuthenticationFilter  →  valida token, popola SecurityContext
  │
  ▼
RecordController.create()
  │
  ▼
RecordService.create()
  ├── EntityDefinitionService.getByKey("customers")  →  carica definizione
  ├── AclService.checkPermission(definition, WRITE)  →  verifica gruppi utente
  ├── RecordValidationService.validate(data, definition)  →  valida campi
  │     ├── Campi sconosciuti? → errore
  │     ├── Campi required mancanti? → errore
  │     ├── Tipo sbagliato? → errore
  │     ├── Min/max/maxLen violati? → errore
  │     └── Pattern/enum non validi? → errore
  └── RecordRepository.save(record)  →  persiste su MongoDB
```

### Ricerca con filtri (con ACL)

```
Client POST /api/v1/records/customers/search { filters: [...], sorts: [...], page: 0, size: 20 }
  │  Authorization: Bearer <token>
  ▼
JwtAuthenticationFilter  →  valida token
  │
  ▼
RecordService.search()
  ├── EntityDefinitionService.getByKey("customers")
  ├── AclService.checkPermission(definition, SEARCH)  →  verifica gruppi utente
  ├── QueryBuilderService.buildQuery(request, definition)
  │     ├── Valida campi filtro/sort contro la definizione
  │     ├── Verifica limiti (max filtri, max page size, regex length)
  │     ├── Traduce ogni FilterRequest in Criteria MongoDB
  │     └── Compone Query con paginazione e ordinamento
  ├── RecordRepository.count(query)  →  totale risultati
  └── RecordRepository.find(query)   →  pagina di risultati
```

## Tipi di campo supportati

| FieldType | Valore Java atteso | Validazioni aggiuntive |
|-----------|--------------------|----------------------|
| `STRING` | `String` | `maxLen`, `pattern` (regex) |
| `NUMBER` | `Number` (int/long/double) | `min`, `max` (confronto via `doubleValue()`) |
| `BOOLEAN` | `Boolean` | — |
| `DATE` | `String` (ISO-8601) | Parsing con `DateTimeFormatter.ISO_DATE_TIME` |
| `EMAIL` | `String` | Regex email standard |
| `ENUM` | `String` | Valore deve essere in `enumValues` |

## Gestione file

### Architettura storage

Il sistema di gestione file usa lo **Strategy pattern** per supportare backend di storage intercambiabili. L'interfaccia `FileStorageService` definisce le operazioni base (`store`, `retrieve`, `delete`), con due implementazioni attivabili tramite la proprietà `cms.storage.type`:

```
┌──────────────────────┐
│  FileController      │
│  (REST endpoints)    │
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│FileManagementService │
│  - validazione file  │
│  - gestione metadati │
└──────┬──────────┬────┘
       │          │
┌──────▼─────┐  ┌─▼───────────────┐
│FileMetadata│  │FileStorageService│ (interface)
│ Repository │  └──┬──────────┬───┘
│  (MongoDB) │     │          │
└────────────┘  ┌──▼───┐  ┌──▼───┐
                │GridFS │  │  S3  │
                │Service│  │Service│
                └──┬───┘  └──┬───┘
                   │         │
                ┌──▼───┐  ┌──▼────────┐
                │MongoDB│  │Amazon S3 / │
                │GridFS │  │   MinIO    │
                └──────┘  └───────────┘
```

### Flusso upload file

```
Client POST /api/v1/files (multipart/form-data)
  │  Authorization: Bearer <token>
  ▼
JwtAuthenticationFilter  →  valida token, popola SecurityContext
  │
  ▼
FileController.upload()
  │
  ▼
FileManagementService.upload()
  ├── validateFile(file)
  │     ├── File vuoto? → errore 400
  │     ├── Supera dimensione massima? → errore 400
  │     └── Tipo MIME non consentito? → errore 400
  ├── FileStorageService.store(inputStream, filename, contentType) → salva contenuto binario
  ├── Crea FileMetadata (filename, contentType, size, uploadedBy, storageType, storageReference)
  └── FileMetadataRepository.save(metadata) → persiste metadati su MongoDB
```

### Flusso download file

```
Client GET /api/v1/files/{id}
  │  Authorization: Bearer <token>
  ▼
FileManagementService.download()
  ├── FileMetadataRepository.findById(id) → carica metadati (o 404)
  └── FileStorageService.retrieve(storageReference) → stream contenuto binario
```

## Invio email

### Flusso invio email

```
Client POST /api/v1/email/send { to, subject, templateId, placeholders, attachments, storageAttachments, calendarEvent }
  │  Authorization: Bearer <token> (ruolo sender richiesto)
  ▼
JwtAuthenticationFilter  →  valida token, popola SecurityContext
  │
  ▼
Spring Security  →  verifica ruolo 'sender' (403 se assente)
  │
  ▼
EmailController.send()
  │
  ▼
EmailService.send()
  ├── EmailTemplateService.getTemplateEntity(templateId) → carica entita template (con allegati)
  ├── EmailTemplateService.resolveTemplate(templateId, placeholders)
  │     ├── Carica template da MongoDB
  │     ├── Valida: tutti i placeholder del template devono avere un valore
  │     ├── Valida: nessun placeholder extra non definito nel template
  │     ├── HTML-escape di ogni valore (& < > " ')
  │     └── String.replace("{{key}}", valoreSafe) per ogni placeholder
  ├── Crea MimeMessage con MimeMessageHelper (multipart=true, UTF-8)
  ├── Imposta to, from (o default), cc, bcc, subject, htmlBody
  ├── Per ogni allegato Base64 (attachments):
  │     ├── Decodifica base64Content → byte[]
  │     ├── Crea ByteArrayDataSource(bytes, contentType)
  │     ├── Se inline=true → helper.addInline(contentId, dataSource)  (CID embedding)
  │     └── Se inline=false → helper.addAttachment(filename, dataSource)
  ├── Per ogni allegato da storage (storageAttachments):
  │     ├── FileManagementService.download(fileId) → InputStream + FileMetadata
  │     ├── readAllBytes() → byte[]
  │     └── helper.addAttachment(metadata.filename, dataSource)
  ├── Per ogni allegato del template (template.attachments):
  │     ├── Decodifica base64Content → byte[]
  │     └── helper.addAttachment(filename, dataSource)  (sempre allegato classico, mai CID)
  ├── Se calendarEvent presente:
  │     ├── generateICalContent(event) → genera contenuto RFC 5545 (.ics)
  │     └── helper.addAttachment("invite.ics", calendarDataSource)  (text/calendar)
  └── JavaMailSender.send(message)  →  invia via SMTP
```

### Sorgenti allegati

L'email supporta tre sorgenti di allegati:

1. **Allegati Base64 (`attachments`)** — Allegati forniti direttamente nella richiesta, codificati in Base64. Possono essere inline (CID embedding per immagini nell'HTML) o classici.

2. **Allegati da storage (`storageAttachments`)** — File gia caricati nello storage CMS (GridFS o S3), riferiti per `fileId`. Il filename e il contentType vengono derivati dai metadati del file.

3. **Allegati del template** — File associati al template al momento della creazione. Vengono inclusi automaticamente come allegati classici ogni volta che il template viene usato. Non vengono mai usati come CID inline.

### Allegati inline (CID)

Gli allegati con `inline: true` vengono incorporati nel messaggio MIME come risorse inline con Content-ID. L'HTML può referenziarli con `<img src="cid:contentId">`. Questa tecnica garantisce che le immagini siano visibili in tutti i client email senza dipendere da URL esterni.

### Evento calendario (iCal)

Se presente il campo `calendarEvent`, viene generato un file `.ics` conforme a RFC 5545 e allegato con content-type `text/calendar; method=REQUEST; charset=UTF-8`. Il file contiene un evento VEVENT con le proprieta standard (UID, DTSTART, DTEND, SUMMARY, DESCRIPTION, LOCATION, ORGANIZER). La generazione avviene programmaticamente con string formatting, senza dipendenze esterne. I client email (Outlook, Gmail, Apple Mail) lo riconoscono automaticamente come invito calendario.

## Gestione errori

`GlobalExceptionHandler` mappa ogni eccezione a un HTTP status code con un formato di risposta uniforme:

```json
{
  "status": 422,
  "message": "Record validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "age", "message": "Value must be >= 0" }
  ],
  "timestamp": "2025-01-15T10:30:00Z"
}
```

| Eccezione | HTTP Status |
|-----------|-------------|
| `EntityDefinitionNotFoundException` | 404 Not Found |
| `RecordNotFoundException` | 404 Not Found |
| `FileNotFoundException` | 404 Not Found |
| `GroupNotFoundException` | 404 Not Found |
| `UserNotFoundException` | 404 Not Found |
| `MenuItemNotFoundException` | 404 Not Found |
| `RecordValidationException` | 422 Unprocessable Entity |
| `FileValidationException` | 400 Bad Request |
| `InvalidEntityKeyException` | 400 Bad Request |
| `QueryLimitExceededException` | 400 Bad Request |
| `AclAccessDeniedException` | 403 Forbidden |
| `AccountDisabledException` | 403 Forbidden |
| `FirstAccessRequiredException` | 403 Forbidden |
| `FileStorageException` | 500 Internal Server Error |
| `EmailSendException` | 500 Internal Server Error |
| `EmailTemplateNotFoundException` | 404 Not Found |
| `IllegalArgumentException` (credenziali) | 401 Unauthorized |
| `DuplicateKeyException` | 409 Conflict |
| `IllegalStateException` (delete con record) | 409 Conflict |
| `MethodArgumentNotValidException` | 400 Bad Request |

## Logging e observability

### Struttura dei log

Ogni riga di log segue il pattern Logback:

```
TIMESTAMP [THREAD] [TRACE-ID] [SESSION-ID] LIVELLO LOGGER - MESSAGGIO
```

- **Trace ID** — UUID univoco generato per ogni singola richiesta HTTP
- **Session ID** — UUID persistente per tutta la sessione del client (dal login in poi)

Entrambi vengono inseriti nel MDC di SLF4J dal `TraceIdFilter` e sono disponibili in tutti i log della richiesta senza doverli passare esplicitamente nei metodi.

### Flusso del Session ID

```
Client                                       Server (TraceIdFilter)
  │                                              │
  ├── POST /api/v1/auth/login ──────────────────▶│  Nessun X-Session-Id
  │◀── X-Session-Id: abc123, X-Trace-Id: t1 ────│  Genera sessionId=abc123
  │                                              │
  ├── GET /api/v1/records/... ──────────────────▶│  X-Session-Id: abc123
  │   X-Session-Id: abc123                       │  Riusa sessionId=abc123
  │◀── X-Session-Id: abc123, X-Trace-Id: t2 ────│  Nuovo traceId per questa richiesta
  │                                              │
  ├── POST /api/v1/records/.../search ──────────▶│  X-Session-Id: abc123
  │   X-Session-Id: abc123                       │  Riusa sessionId=abc123
  │◀── X-Session-Id: abc123, X-Trace-Id: t3 ────│  Nuovo traceId per questa richiesta
```

### Livelli di log per layer

| Layer | INFO | DEBUG | WARN | ERROR |
|-------|------|-------|------|-------|
| Controller | Ricezione richieste | — | — | — |
| Service | Operazioni CRUD riuscite | Dettagli ricerca/query | Validazione fallita, ACL negato | — |
| Repository | — | Operazioni MongoDB | — | — |
| Security | — | Autenticazione, token | Token invalido | — |
| ExceptionHandler | — | — | Eccezioni 4xx | Eccezioni 5xx |

## Profili e configurazione

La configurazione è suddivisa in più file YAML:

| File | Contenuto |
|------|-----------|
| `application.yaml` | Proprietà comuni (porta, limiti di sicurezza, JWT default) |
| `application-dev.yaml` | MongoDB locale, logging DEBUG |
| `application-preprod.yaml` | MongoDB pre-produzione, logging INFO |
| `application-prod.yaml` | MongoDB via env var, JWT secret obbligatorio via env var, logging minimale |

Il profilo `dev` è il default. In produzione si usa `--spring.profiles.active=prod` con le variabili d'ambiente `CMS_JWT_SECRET` e `MONGODB_URI`.

Vedi [CONFIGURAZIONE.md](CONFIGURAZIONE.md) per i dettagli completi.

## Indici MongoDB

| Collection | Campo | Tipo |
|------------|-------|------|
| `users` | `email` | Unique |
| `email_templates` | `name` | Unique |
| `groups` | `name` | Unique |

## Docker

Il progetto include:

- **Dockerfile** — Multi-stage build con `eclipse-temurin:25-jdk` (build) e `eclipse-temurin:25-jre` (runtime)
- **docker-compose.yaml** — Avvia MongoDB 8 per lo sviluppo locale
- **.dockerignore** — Esclude file non necessari dal contesto di build

```
┌──────────────────────────────────────────────────────┐
│  Docker Compose (sviluppo locale)                    │
│  ┌────────────┐                                      │
│  │  MongoDB 8  │◀── localhost:27017                  │
│  └────────────┘                                      │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Dockerfile (produzione)                             │
│  ┌────────────┐     ┌────────────┐                   │
│  │  JDK 25    │────▶│  JRE 25    │── app.jar         │
│  │  (build)   │     │  (runtime) │                   │
│  └────────────┘     └────────────┘                   │
└──────────────────────────────────────────────────────┘
```

## Decisioni di design

1. **Nessuna classe per entità** — Le entità sono definite solo come documenti `entity_definitions`. I dati vanno tutti nella collection `records` con una mappa `data` generica.

2. **MongoTemplate per i record** — `RecordRepository` usa `MongoTemplate` direttamente (non `MongoRepository`) per poter costruire query dinamiche a runtime.

3. **DSL controllato** — I filtri client usano il formato `{field, op, value}` tradotto internamente in `Criteria`. Il client non può mai passare operatori MongoDB nativi.

4. **Date come stringhe ISO-8601** — Nella mappa `data`, le date sono stringhe. Questo semplifica serializzazione/deserializzazione JSON ed evita problemi di timezone.

5. **Validazione non retroattiva** — Se una entity definition viene aggiornata, i record esistenti non vengono rivalidati. La validazione avviene solo su create/update record.

6. **Delete protetto** — Non è possibile eliminare una entity definition se esistono record associati (risposta 409 Conflict).

7. **JWT stateless** — Nessuna sessione server. Il token contiene tutto il necessario (username + roles + groups). Spring Security è configurato `STATELESS`.

8. **ACL a livello entità basata su gruppi** — I permessi sono definiti nella entity definition tramite nomi di **gruppi**, non di ruoli. I ruoli `super_admin` e `admin` bypassano sempre l'ACL. Se l'ACL è assente, l'accesso è aperto a tutti gli autenticati.

9. **Entity definitions solo per admin** — La gestione delle definizioni (e quindi delle ACL) è riservata al ruolo `admin`. Il ruolo `super_admin` vi accede tramite la gerarchia ruoli di Spring Security.

10. **Storage intercambiabile** — Il backend di storage dei file è definito da un'interfaccia (`FileStorageService`) con implementazioni per GridFS e S3, selezionate a runtime dalla proprietà `cms.storage.type`. Questo permette di cambiare backend senza modificare il codice.

11. **Metadati separati dal contenuto** — I metadati dei file (nome, tipo, dimensione, utente) sono nella collection `file_metadata`, mentre il contenuto binario è nel backend di storage. Questo disaccoppia le query sui metadati dallo storage fisico.

12. **Blocco account** — Dopo un numero configurabile di tentativi di login falliti (`max-login-attempts`), l'account viene disabilitato. Il tentativo di login su un account disabilitato restituisce 403 Forbidden.

13. **Email con allegati inline (CID)** — Gli allegati immagine vengono incorporati nel messaggio MIME come risorse inline con Content-ID, non come URL esterni. Questo garantisce la visualizzazione corretta in tutti i client email (Outlook, Gmail, Apple Mail, ecc.).

14. **Ruolo `sender` per email** — L'invio email e protetto dal ruolo `sender`, gestito a livello Spring Security (`SecurityConfig`). L'utente deve avere `"sender"` nella lista `roles` della collection `users`.

15. **Template email con anti-injection** — I template usano placeholder nel formato `{{nome}}` con sostituzione puramente testuale (`String.replace()`). I valori vengono HTML-escaped prima della sostituzione per prevenire XSS. La validazione e bidirezionale: tutti i placeholder del template devono avere un valore e non sono ammessi placeholder extra. I nomi devono rispettare `[a-zA-Z0-9_]+`. Nessun template engine esterno viene utilizzato.

16. **Allegati template embedded** — Gli allegati associati ai template email sono salvati come documenti embedded nel documento MongoDB del template (Base64). Al momento dell'invio, vengono inclusi automaticamente come allegati classici (non inline CID). Questo lega il ciclo di vita degli allegati al template stesso.

17. **Allegati da storage CMS** — L'invio email supporta allegati referenziati per `fileId` dallo storage CMS. Il file viene recuperato via `FileManagementService.download()` e il filename/contentType vengono derivati automaticamente dai metadati.

18. **Evento calendario iCal** — L'invio email supporta l'inclusione di un evento calendario iCal (RFC 5545) generato programmaticamente senza dipendenze esterne. Il file `.ics` viene allegato con content-type `text/calendar` e i client email lo riconoscono come invito calendario.

19. **Javadoc HTML** — Il plugin `maven-javadoc-plugin` genera documentazione HTML da tutti i commenti Javadoc. Eseguire con `mvn javadoc:javadoc` (output in `target/reports/apidocs/`).

20. **Auto-generazione password** — La password non viene mai inserita dall'utente durante la registrazione. Viene generata automaticamente (12 caratteri alfanumerici con `SecureRandom`) e inviata via email tramite un template configurabile (`cms.email.password-template-id`). Lo stesso meccanismo si applica al recupero password.

21. **First Access** — Il flag `firstAccess` nel JWT permette di bloccare tutte le API (tranne autenticazione) senza query al database su ogni richiesta. Il `JwtAuthenticationFilter` controlla il claim `firstAccess` nel token e, se `true`, restituisce immediatamente 403 per i path non sotto `/api/v1/auth/`. Dopo il cambio password, viene emesso un nuovo JWT con `firstAccess = false`.

22. **Cambio password con nuovo token** — L'endpoint di cambio password restituisce un nuovo JWT aggiornato con `firstAccess = false`, eliminando la necessita di un nuovo login dopo il cambio password.

23. **Sistema gruppi** — Gli utenti appartengono a gruppi (`groupIds` nella collection `users`). Le ACL nelle entity definitions e la visibilità delle voci di menu fanno riferimento ai nomi dei gruppi, non ai ruoli. Questo separa il controllo accessi granulare (gruppi) dalla gerarchia di privilegi amministrativi (ruoli).

24. **Gerarchia ruoli** — La gerarchia `super_admin > admin > user` è configurata tramite `RoleHierarchy` di Spring Security. Un `super_admin` eredita automaticamente tutti i permessi di `admin` e `user` senza bisogno di assegnare esplicitamente i ruoli inferiori.

25. **Sistema menu** — Il menu è configurabile tramite la collection `menu_items` con supporto per struttura gerarchica (`parentId`), ordinamento (`position`), e visibilità basata sui gruppi dell'utente. L'endpoint pubblico `/api/v1/menu` restituisce solo le voci visibili all'utente in base ai suoi gruppi, mentre gli endpoint di gestione sotto `/api/v1/menu/manage/` sono riservati al ruolo `admin`.
