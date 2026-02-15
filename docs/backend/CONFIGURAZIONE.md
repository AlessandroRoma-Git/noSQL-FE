# Configurazione

## Requisiti

- **Java 25**
- **MongoDB 6+** in esecuzione (locale o remoto)
- **Maven 3.9+**
- **Docker** e **Docker Compose** (opzionale, per MongoDB locale)

## Dipendenze principali

| Dipendenza | Scopo |
|------------|-------|
| `spring-boot-starter-web` | REST API |
| `spring-boot-starter-data-mongodb` | Accesso MongoDB |
| `spring-boot-starter-validation` | Validazione Jakarta |
| `spring-boot-starter-security` | Autenticazione e autorizzazione |
| `jjwt-api` / `jjwt-impl` / `jjwt-jackson` | Generazione e parsing JWT |
| `software.amazon.awssdk:s3` | Client AWS S3 per storage file (opzionale, solo con backend S3) |
| `spring-boot-starter-mail` | Invio email SMTP con allegati |

## Avvio rapido

### 1. Avviare MongoDB con Docker Compose

```bash
docker compose up -d
```

Questo avvia un container MongoDB 8 su `localhost:27017`. I dati vengono persistiti in un volume Docker.

### 2. Compilare il progetto

```bash
mvn clean package -DskipTests
```

### 3. Avviare l'applicazione

```bash
# Profilo dev (default) — richiede MongoDB su localhost:27017
java -jar target/cms-nosql-0.0.1-SNAPSHOT.jar

# Equivalente a (dev è il profilo di default):
java -jar target/cms-nosql-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
```

L'applicazione si avvia sulla porta **8088**.

### Avvio con Maven (alternativa)

```bash
# Compilazione e avvio diretto
mvn spring-boot:run

# Con profilo specifico
mvn spring-boot:run -Dspring-boot.run.profiles=preprod
```

## Profili Spring

L'applicazione supporta tre profili che separano la configurazione per ambiente:

| Profilo | File | Ambiente | Database |
|---------|------|----------|----------|
| `dev` | `application-dev.yaml` | Sviluppo locale | `cms_nosql_dev` su localhost |
| `preprod` | `application-preprod.yaml` | Pre-produzione | `cms_nosql_preprod` su mongo-preprod |
| `prod` | `application-prod.yaml` | Produzione | Configurabile via `MONGODB_URI` |

Il profilo **`dev`** è il default. Se non viene specificato nessun profilo, l'applicazione usa `dev`.

### Selezionare un profilo

```bash
# Via parametro della JVM
java -jar target/cms-nosql-0.0.1-SNAPSHOT.jar --spring.profiles.active=preprod

# Via variabile d'ambiente
SPRING_PROFILES_ACTIVE=prod java -jar target/cms-nosql-0.0.1-SNAPSHOT.jar

# Via Maven
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

## Struttura dei file YAML

La configurazione è suddivisa in un file base e un file per profilo:

### `application.yaml` — Configurazione comune

Contiene le proprietà condivise tra tutti i profili:

```yaml
# Profilo di default
spring:
  profiles:
    default: dev
  application:
    name: cms-nosql

  # Configurazione multipart (upload file)
  servlet:
    multipart:
      max-file-size: 10MB              # Limite dimensione singolo file
      max-request-size: 10MB           # Limite dimensione richiesta complessiva

  # Configurazione SMTP (invio email)
  mail:
    host: localhost                      # Server SMTP
    port: 1025                           # Porta SMTP
    properties:
      mail.smtp.auth: false
      mail.smtp.starttls.enable: false

# Porta HTTP
server:
  port: 8088

# Configurazione applicativa CMS
cms:

  # Email
  email:
    default-from: "noreply@cms-nosql.local"  # Mittente di default
    password-template-id: ""                  # ID template per invio password

  # Limiti di sicurezza per le query
  security:
    max-filters: 10                  # Numero massimo di filtri per query
    max-page-size: 100               # Dimensione massima pagina risultati
    default-page-size: 20            # Dimensione pagina di default
    regex-max-length: 100            # Lunghezza massima per operatore 'like'
    entity-key-pattern: "^[a-z][a-z0-9_]{1,48}[a-z0-9]$"
    max-login-attempts: 3            # Tentativi massimi di login prima del blocco account

  # Configurazione storage file
  storage:
    type: grid-fs                        # Backend: 'grid-fs' o 's3'
    max-file-size: 10485760              # Dimensione massima file in byte (10 MB)
    allowed-content-types:               # Tipi MIME consentiti (lista vuota = tutti)
      - image/jpeg
      - image/png
      - image/gif
      - application/pdf
      - text/plain

  # JWT
  jwt:
    secret: "Y2hhbmd..."            # Chiave di default (SOLO per dev/test)
    expiration-ms: 86400000          # 24 ore
```

### `application-dev.yaml` — Sviluppo locale

```yaml
spring:
  mongodb:
    uri: mongodb://localhost:27017/cms_nosql_dev
  mail:
    host: localhost                     # MailHog/Mailpit per test
    port: 1025

logging:
  level:
    it.wolfcoding: DEBUG
    org.springframework.data.mongodb: DEBUG
```

### `application-preprod.yaml` — Pre-produzione

```yaml
spring:
  mongodb:
    uri: mongodb://mongo-preprod:27017/cms_nosql_preprod
  mail:
    host: smtp-preprod
    port: 587
    username: cms-preprod
    password: changeme
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true

logging:
  level:
    it.wolfcoding: INFO
```

### `application-prod.yaml` — Produzione

```yaml
spring:
  mongodb:
    uri: ${MONGODB_URI:mongodb://mongo:27017/cms_nosql}
  mail:
    host: ${SMTP_HOST}
    port: ${SMTP_PORT:587}
    username: ${SMTP_USERNAME}
    password: ${SMTP_PASSWORD}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true

cms:
  jwt:
    secret: ${CMS_JWT_SECRET}       # OBBLIGATORIO via env var
  email:
    default-from: ${CMS_EMAIL_FROM:noreply@cms-nosql.local}

logging:
  level:
    root: WARN
    it.wolfcoding: INFO
```

## Parametri di configurazione

### Server

| Proprietà | Default | Descrizione |
|-----------|---------|-------------|
| `server.port` | `8088` | Porta HTTP |

### MongoDB

| Proprietà | Default (dev) | Descrizione |
|-----------|---------------|-------------|
| `spring.mongodb.uri` | `mongodb://localhost:27017/cms_nosql_dev` | Connection string MongoDB |

### JWT (`cms.jwt.*`)

| Proprietà | Default | Descrizione |
|-----------|---------|-------------|
| `secret` | (base64) | Chiave HMAC-SHA256 in Base64. **Cambiare in produzione.** |
| `expiration-ms` | `86400000` | Durata token in millisecondi (default 24 ore) |

### SMTP (`spring.mail.*`)

| Proprietà | Default (dev) | Descrizione |
|-----------|---------------|-------------|
| `host` | `localhost` | Hostname del server SMTP |
| `port` | `1025` | Porta SMTP |
| `username` | — | Username per autenticazione SMTP |
| `password` | — | Password per autenticazione SMTP |
| `properties.mail.smtp.auth` | `false` | Abilitare autenticazione SMTP |
| `properties.mail.smtp.starttls.enable` | `false` | Abilitare STARTTLS |

### Email (`cms.email.*`)

| Proprietà | Default | Descrizione |
|-----------|---------|-------------|
| `default-from` | `noreply@cms-nosql.local` | Indirizzo mittente di default se non specificato nella richiesta |
| `password-template-id` | `""` (vuoto) | ID del template email per invio password (registrazione e recupero) |

> **Nota:** La proprieta `password-template-id` deve essere configurata con l'ID di un template email creato nella collection `email_templates`. Il template deve contenere i placeholder `{{username}}` e `{{password}}`.
>
> La generazione degli eventi calendario iCal (RFC 5545), gli allegati da storage e gli allegati dei template non richiedono configurazione aggiuntiva. Queste funzionalita usano le dipendenze gia presenti nel progetto (`spring-boot-starter-mail`, storage service).

### Multipart (upload file)

| Proprietà | Default | Descrizione |
|-----------|---------|-------------|
| `spring.servlet.multipart.max-file-size` | `10MB` | Limite dimensione singolo file nell'upload HTTP |
| `spring.servlet.multipart.max-request-size` | `10MB` | Limite dimensione richiesta complessiva |

### Limiti di sicurezza (`cms.security.*`)

| Proprietà | Default | Descrizione |
|-----------|---------|-------------|
| `max-filters` | `10` | Numero massimo di filtri per query di ricerca |
| `max-page-size` | `100` | Dimensione massima di una pagina di risultati |
| `default-page-size` | `20` | Dimensione pagina di default se non specificata |
| `regex-max-length` | `100` | Lunghezza massima del valore nell'operatore `like` |
| `entity-key-pattern` | `^[a-z][a-z0-9_]{1,48}[a-z0-9]$` | Pattern regex che le entity key devono rispettare |
| `max-login-attempts` | `3` | Tentativi massimi di login falliti prima del blocco account |

### Storage file (`cms.storage.*`)

| Proprietà | Default | Descrizione |
|-----------|---------|-------------|
| `type` | `grid-fs` | Backend di storage: `grid-fs` (MongoDB GridFS) o `s3` (Amazon S3/MinIO) |
| `max-file-size` | `10485760` (10 MB) | Dimensione massima file consentita in byte |
| `allowed-content-types` | `[image/jpeg, image/png, image/gif, application/pdf, text/plain]` | Tipi MIME consentiti. Lista vuota = tutti consentiti |

### S3 (`cms.storage.s3.*`) — solo con `cms.storage.type=s3`

| Proprietà | Default | Descrizione |
|-----------|---------|-------------|
| `endpoint` | (vuoto) | URL dell'endpoint S3 (vuoto per AWS di default, configurare per MinIO) |
| `region` | — | Regione AWS (es. `eu-west-1`) |
| `bucket` | — | Nome del bucket S3 |
| `access-key` | — | Access Key AWS |
| `secret-key` | — | Secret Key AWS |

## Variabili d'ambiente per produzione

| Variabile | Obbligatoria | Descrizione |
|-----------|-------------|-------------|
| `SPRING_PROFILES_ACTIVE` | Si | Impostare a `prod` |
| `CMS_JWT_SECRET` | Si | Chiave segreta JWT in Base64 (almeno 256 bit) |
| `MONGODB_URI` | No | Connection string MongoDB (default: `mongodb://mongo:27017/cms_nosql`) |
| `CMS_STORAGE_TYPE` | No | Backend storage file: `grid-fs` o `s3` (default: `grid-fs`) |
| `CMS_STORAGE_S3_ENDPOINT` | Solo se S3 | URL endpoint S3 (per MinIO o S3-compatibili) |
| `CMS_STORAGE_S3_REGION` | Solo se S3 | Regione AWS |
| `CMS_STORAGE_S3_BUCKET` | Solo se S3 | Nome del bucket S3 |
| `CMS_STORAGE_S3_ACCESS_KEY` | Solo se S3 | Access Key AWS |
| `CMS_STORAGE_S3_SECRET_KEY` | Solo se S3 | Secret Key AWS |
| `SMTP_HOST` | Si | Hostname del server SMTP |
| `SMTP_PORT` | No | Porta SMTP (default: `587`) |
| `SMTP_USERNAME` | Si | Username per autenticazione SMTP |
| `SMTP_PASSWORD` | Si | Password per autenticazione SMTP |
| `CMS_EMAIL_FROM` | No | Indirizzo mittente di default (default: `noreply@cms-nosql.local`) |
| `CMS_EMAIL_PASSWORD_TEMPLATE_ID` | Si | ID del template email per l'invio della password (registrazione e recupero) |

### Esempio di avvio in produzione

```bash
SPRING_PROFILES_ACTIVE=prod \
CMS_JWT_SECRET="<chiave-base64-sicura-di-almeno-256-bit>" \
MONGODB_URI="mongodb://user:password@mongo-cluster:27017/cms_nosql?authSource=admin" \
java -jar target/cms-nosql-0.0.1-SNAPSHOT.jar
```

## Docker

### Dockerfile

Il progetto include un **Dockerfile multi-stage** che:

1. **Stage build** — Usa `eclipse-temurin:25-jdk` per compilare il progetto con Maven
2. **Stage runtime** — Usa `eclipse-temurin:25-jre` (immagine leggera) per eseguire il JAR

```bash
# Build dell'immagine Docker
docker build -t cms-nosql .

# Avvio con profilo prod
docker run -p 8088:8088 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e CMS_JWT_SECRET="<chiave-base64>" \
  -e MONGODB_URI="mongodb://host:27017/cms_nosql" \
  cms-nosql
```

### Docker Compose (sviluppo locale)

Il file `docker-compose.yaml` nella root del progetto avvia un container MongoDB per lo sviluppo locale:

```bash
# Avvia MongoDB
docker compose up -d

# Verifica che sia in esecuzione
docker compose ps

# Ferma MongoDB
docker compose down

# Ferma MongoDB e cancella i dati
docker compose down -v
```

Una volta avviato MongoDB, si può avviare l'applicazione con:

```bash
java -jar target/cms-nosql-0.0.1-SNAPSHOT.jar
```

## Logging

### Configurazione Logback

Il logging è gestito da `logback-spring.xml` con livelli diversi per profilo:

| Profilo | `it.wolfcoding` | `root` | MongoDB queries |
|---------|-----------------|--------|-----------------|
| `dev` | DEBUG | INFO | DEBUG |
| `preprod` | INFO | INFO | - |
| `prod` | INFO | WARN | - |

### Pattern di log

Ogni riga di log contiene:

```
TIMESTAMP [THREAD] [TRACE-ID] [SESSION-ID] LIVELLO LOGGER - MESSAGGIO
```

Esempio:
```
2026-02-07 14:30:00.123 [http-nio-8088-exec-1] [a1b2c3d4e5f6] [f6e5d4c3b2a1] INFO  c.w.c.service.AuthService - Login riuscito per utente='mario', ruoli=[admin]
```

### Trace ID e Session ID

Il `TraceIdFilter` gestisce due identificatori di correlazione via MDC:

| ID | Header HTTP | Scopo | Durata |
|----|-------------|-------|--------|
| **Trace ID** | `X-Trace-Id` | Identifica una singola richiesta HTTP | Una richiesta |
| **Session ID** | `X-Session-Id` | Identifica la sessione logica del client | Tutta la sessione |

**Flusso Session ID:**

1. Il client chiama `POST /api/v1/auth/login` (senza header `X-Session-Id`)
2. Il server genera un nuovo Session ID e lo restituisce nell'header `X-Session-Id`
3. Il client salva il Session ID e lo include in tutte le richieste successive:
   ```
   X-Session-Id: f6e5d4c3b2a1...
   ```
4. Nei log, tutte le richieste con lo stesso Session ID sono correlabili come appartenenti alla stessa sessione

**Esempio curl:**

```bash
# Login: riceve il Session ID
SESSION_ID=$(curl -s -D - -X POST http://localhost:8088/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "username": "mario", "password": "secret123" }' | grep -i 'x-session-id' | awk '{print $2}' | tr -d '\r')

# Richieste successive: include il Session ID
curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Session-Id: $SESSION_ID" \
     http://localhost:8088/api/v1/entity-definitions
```

## Autenticazione JWT

Il sistema usa JWT (JSON Web Token) stateless per l'autenticazione.

### Flusso

1. Il client chiama `POST /api/v1/auth/register` o `POST /api/v1/auth/login`
2. Il server risponde con un token JWT
3. Il client include il token in ogni richiesta successiva:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
   ```
4. Il `JwtAuthenticationFilter` intercetta ogni richiesta, valida il token e popola il `SecurityContext`

### Contenuto del token

| Claim | Descrizione |
|-------|-------------|
| `sub` | Username |
| `roles` | Lista ruoli (es. `["admin", "user"]`) |
| `groups` | Lista nomi gruppi dell'utente (es. `["editors", "viewers"]`) |
| `firstAccess` | `true` se l'utente deve cambiare la password al primo accesso |
| `iat` | Timestamp emissione |
| `exp` | Timestamp scadenza |

### Regole di accesso

| Endpoint | Chi può accedere |
|----------|------------------|
| `POST /api/v1/auth/**` | Tutti (pubblico) |
| `/api/v1/entity-definitions/**` | Solo utenti con ruolo `admin` (o `super_admin` tramite gerarchia) |
| `/api/v1/groups/**` | Solo utenti con ruolo `admin` (o `super_admin` tramite gerarchia) |
| `/api/v1/users/**` | Solo utenti con ruolo `admin` (o `super_admin` tramite gerarchia) |
| `/api/v1/menu/manage/**` | Solo utenti con ruolo `admin` (o `super_admin` tramite gerarchia) |
| `/api/v1/menu` | Utenti autenticati (menu filtrato per gruppi) |
| `/api/v1/records/**` | Utenti autenticati (+ check ACL per entità) |
| `/api/v1/files/**` | Utenti autenticati |
| `/api/v1/email/**` | Solo utenti con ruolo `sender` |

## ACL (Access Control List)

Ogni entity definition può avere un campo `acl` che controlla quali **gruppi** possono eseguire operazioni sui record di quella entità.

### Struttura

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

### Permessi

| Permesso | Operazioni |
|----------|------------|
| `read` | Lettura singolo record (`GET /records/{entityKey}/{id}`) |
| `write` | Creazione e aggiornamento record (`POST`, `PUT`) |
| `delete` | Eliminazione record (`DELETE`) |
| `search` | Ricerca paginata (`POST /records/{entityKey}/search`) |

### Regole di valutazione

1. **Ruoli `super_admin` e `admin`** bypassano sempre l'ACL — hanno accesso completo a tutto
2. **ACL `null`** (non definita) — accesso aperto a tutti gli utenti autenticati
3. **Lista permesso vuota o `null`** — nessuna restrizione per quel permesso specifico
4. **Lista con gruppi** — almeno uno dei **gruppi** dell'utente deve essere presente nella lista

### Esempio pratico

Con questa ACL:
```json
{
  "read":   ["editors", "viewers"],
  "write":  ["editors"],
  "delete": ["editors"],
  "search": ["editors", "viewers"]
}
```

| Ruolo/Gruppo utente | read | write | delete | search |
|---------------------|------|-------|--------|--------|
| ruolo `super_admin` | OK (bypass) | OK (bypass) | OK (bypass) | OK (bypass) |
| ruolo `admin` | OK (bypass) | OK (bypass) | OK (bypass) | OK (bypass) |
| gruppo `editors` | OK | OK | OK | OK |
| gruppo `viewers` | OK | NO | NO | OK |
| nessun gruppo | NO | NO | NO | NO |

## Gerarchia ruoli

Il sistema implementa una gerarchia di ruoli tramite Spring Security `RoleHierarchy`:

```
super_admin > admin > user
```

| Ruolo | Permessi |
|-------|----------|
| `super_admin` | Accesso completo a tutto. Eredita tutti i permessi di `admin`. Bypassa tutti i controlli ACL. |
| `admin` | Gestisce entity definitions, utenti, gruppi e menu. Bypassa i controlli ACL sulle entity. |
| `user` | Ruolo base. Accede alle entity solo tramite le ACL dei gruppi a cui appartiene. |

I ruoli sono salvati nel campo `roles` della collection `users`. Un utente puo avere piu ruoli.

## Gruppi

Gli utenti possono appartenere a uno o più gruppi. I gruppi sono referenziati nelle ACL delle entity definition per controllare l'accesso ai record.

### Struttura
- Ogni gruppo ha un `name` univoco e una `description`
- Gli utenti referenziano i gruppi tramite `groupIds` nella collection `users`
- Le ACL nelle entity definition usano i **nomi dei gruppi** (non gli ID)
- Il token JWT include un claim `groups` con i nomi dei gruppi dell'utente

### Esempio
Un utente con `groupIds: ["abc123", "def456"]` che corrispondono ai gruppi "editors" e "viewers"
avrà nel JWT il claim `groups: ["editors", "viewers"]`.

Se una entity definition ha ACL `{ "write": ["editors"] }`, questo utente potrà scrivere record
di quell'entità perché appartiene al gruppo "editors".

## Entity Key — regole di naming

L'`entityKey` identifica univocamente un tipo di entità. Deve rispettare il pattern configurato:

- Inizia con una lettera minuscola
- Contiene solo lettere minuscole, numeri e underscore
- Finisce con una lettera minuscola o un numero
- Lunghezza tra 3 e 50 caratteri

**Esempi validi:** `customers`, `order_items`, `blog_posts`, `user_v2`

**Esempi invalidi:** `Customers` (maiuscola), `_items` (inizia con underscore), `a` (troppo corto), `123abc` (inizia con numero)

## Sicurezza delle query

### Filtri validati contro la definizione

I campi usati nei filtri e negli ordinamenti vengono verificati contro la entity definition. Non è possibile filtrare su campi non definiti.

### Operatore `like` sicuro

Il valore passato a `like` viene elaborato con `Pattern.quote()`, che escapa tutti i metacaratteri regex. Vengono inoltre rifiutati:
- Valori più lunghi di `regex-max-length` caratteri
- Pattern contenenti lookahead/lookbehind (`(?=`, `(?!`, `(?<`)

### Limiti di paginazione

- La dimensione della pagina è limitata a `max-page-size` (100)
- Il numero di filtri è limitato a `max-filters` (10)

### Campi data validati

Quando si crea o aggiorna un record, le chiavi nella mappa `data` vengono verificate contro la entity definition. Chiavi non definite vengono rifiutate con errore 422.

## CORS

CORS è configurato per permettere tutte le origini su `/api/**`:

- **Origini:** `*`
- **Metodi:** GET, POST, PUT, DELETE, OPTIONS
- **Headers:** tutti

Per ambienti di produzione, modificare `WebConfig.java` per restringere le origini consentite.

### SecurityConfig

La classe `SecurityConfig` configura Spring Security e include:

- Il bean `RoleHierarchy` che definisce la gerarchia `super_admin > admin > user`
- Le regole di autorizzazione per tutti gli endpoint (vedi tabella "Regole di accesso")
- Il filtro `JwtAuthenticationFilter` per la validazione dei token JWT

## Indici MongoDB

L'applicazione crea automaticamente i seguenti indici:

| Collection | Campo | Tipo |
|------------|-------|------|
| `users` | `username` | Unique |
| `users` | `email` | Unique |
| `entity_definitions` | `entityKey` | Unique |
| `records` | `entityKey` | Standard |
| `file_metadata` | `_id` | Primary (default MongoDB) |
| `email_templates` | `name` | Unique |
| `groups` | `name` | Unique |

## Generazione Javadoc

Il progetto include il plugin `maven-javadoc-plugin` per generare la documentazione HTML da tutti i commenti Javadoc.

```bash
# Genera Javadoc HTML
mvn javadoc:javadoc
```

L'output viene generato in `target/reports/apidocs/`. Aprire `index.html` per la consultazione.

Il plugin è configurato nel `pom.xml` root con encoding UTF-8:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-javadoc-plugin</artifactId>
    <version>3.11.2</version>
    <configuration>
        <encoding>UTF-8</encoding>
        <docencoding>UTF-8</docencoding>
        <charset>UTF-8</charset>
    </configuration>
</plugin>
```

## Auditing

Grazie a `@EnableMongoAuditing`, i campi `createdAt` e `updatedAt` vengono gestiti automaticamente da Spring Data:

- `createdAt` — impostato alla creazione del documento, non viene mai modificato
- `updatedAt` — aggiornato ad ogni salvataggio
