
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

  # Super admin (auto-creato all'avvio se non esiste)
  super-admin:
    username: "super_admin"
    email: "admin@example.com"
    password: "changeme123"

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

### Super Admin (`cms.super-admin.*`)

| Proprietà | Default | Descrizione |
|-----------|---------|-------------|
| `username` | `super_admin` | Username dell'utente super admin |
| `email` | `admin@example.com` | Indirizzo email del super admin |
| `password` | `changeme123` | Password iniziale (cambiare al primo accesso) |

> **Nota:** All'avvio dell'applicazione, se non esiste un gruppo con `systemRole = SUPER_ADMIN`, viene creato automaticamente il gruppo `super_admins`. Se non esiste un utente in quel gruppo, viene creato con le credenziali configurate e `firstAccess = true`.

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

### Tipi di campo supportati

I campi delle entity definition supportano i seguenti tipi:

| Tipo | Valore atteso | Proprietà specifiche |
|------|---------------|----------------------|
| `STRING` | Stringa | `maxLen`, `pattern` (regex) |
| `NUMBER` | Numero | `min`, `max` |
| `BOOLEAN` | Booleano | -- |
| `DATE` | Stringa ISO-8601 | -- |
| `EMAIL` | Stringa (email) | -- |
| `ENUM` | Stringa | `enumValues` (lista valori ammessi) |
| `REFERENCE` | Lista di stringhe (lista di record ID) | `referenceEntityKey` (entityKey dell'entità referenziata). Il valore è **sempre una lista di ID** (es. `["id1", "id2"]`). In fase di creazione/aggiornamento, verifica che **tutti gli ID nella lista** esistano nell'entità target. Permette relazioni molti-a-molti. |

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
| `CMS_SUPER_ADMIN_USERNAME` | No | Username super admin (default: super_admin) |
| `CMS_SUPER_ADMIN_EMAIL` | No | Email super admin |
| `CMS_SUPER_ADMIN_PASSWORD` | Si (in prod) | Password iniziale super admin |
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
