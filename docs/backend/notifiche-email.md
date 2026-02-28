# Notifiche email per entity definition

Questa guida spiega come configurare l'invio automatico di email quando vengono creati, aggiornati o eliminati i record di un'entity.

---

## Indice

1. [Panoramica](#1-panoramica)
2. [Configurazione](#2-configurazione)
3. [Placeholder disponibili](#3-placeholder-disponibili)
4. [Destinatari dinamici](#4-destinatari-dinamici)
5. [Template email](#5-template-email)
6. [Esempi completi](#6-esempi-completi)
7. [Comportamento in caso di errore](#7-comportamento-in-caso-di-errore)

---

## 1. Panoramica

Il campo opzionale `notificationConfig` nell'entity definition abilita notifiche email automatiche. Ogni volta che un record viene creato, aggiornato o eliminato, il sistema invia una email **dopo** il completamento dell'operazione (hook `afterCreate`, `afterUpdate`, `afterDelete`).

```
RecordService.create()
    └── validazione + salvataggio record
    └── plugin.afterCreate()             ← hook plugin (se presente)
    └── notificationService.notifyAfterCreate()  ← NOTIFICA EMAIL
```

Le notifiche sono **non bloccanti**: un errore durante l'invio (SMTP irraggiungibile, template non trovato, nessun destinatario valido) produce solo un log a livello WARN e non influenza la risposta HTTP dell'operazione CRUD.

---

## 2. Configurazione

La configurazione si aggiunge all'entity definition nella sezione `notificationConfig`:

```text
{
  "entityKey": "ordini",
  "label": "Ordini",
  "fields": [ ... ],
  "notificationConfig": {
    "to": ["admin@azienda.it", "{{email}}"],
    "subject": "Ordine {{id}} — {{entityKey}}",
    "createTemplateId": "ordine-creato",
    "updateTemplateId": "ordine-aggiornato",
    "deleteTemplateId": null
  }
}
```

**Campi di `notificationConfig`:**

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|:------------:|-------------|
| `to` | `string[]` | **sì** | Lista destinatari (fissi e/o placeholder dinamici) |
| `subject` | `string` | no | Oggetto email; supporta `{{placeholder}}`. Default: `[CMS] Notifica <entityKey>` |
| `createTemplateId` | `string` | no | ID template per notifica su **create**; `null` = disabilitata |
| `updateTemplateId` | `string` | no | ID template per notifica su **update**; `null` = disabilitata |
| `deleteTemplateId` | `string` | no | ID template per notifica su **delete**; `null` = disabilitata |

> Per rimuovere la configurazione in seguito, passare `"notificationConfig": null` nella PUT.

---

## 3. Placeholder disponibili

I placeholder usano la sintassi `{{nomeCampo}}` e vengono risolti sia nel campo `to`, sia nel campo `subject`, sia nel corpo HTML del template.

La risoluzione è **leniente**: i placeholder senza valore corrispondente vengono sostituiti con stringa vuota senza generare errori.

| Placeholder | Disponibile per | Descrizione |
|-------------|:--------------:|-------------|
| `{{entityKey}}` | create, update, delete | Chiave dell'entity (es. `"ordini"`) |
| `{{id}}` | create, update, delete | ID MongoDB del record |
| `{{nomeCampo}}` | create, update | Valore del campo del record (solo valori non-null) |

**Esempio**: se il record ha `{ "email": "mario@co.it", "nome": "Mario" }`, i placeholder disponibili sono `{{entityKey}}`, `{{id}}`, `{{email}}`, `{{nome}}`.

> **Delete**: i dati del record non vengono passati — il record è già marcato come eliminato. Solo `{{entityKey}}` e `{{id}}` sono disponibili.

---

## 4. Destinatari dinamici

Il campo `to` può contenere una lista mista di indirizzi fissi e placeholder:

```text
"to": ["admin@azienda.it", "{{email}}", "team@co.it"]
```

**Come funziona la risoluzione:**

1. Ogni stringa in `to` viene risolta sostituendo i placeholder
2. Le stringhe risultanti prive di `@` vengono scartate silenziosamente
3. I duplicati vengono rimossi
4. Se la lista finale è vuota, viene loggato un WARN e nessuna email viene inviata

**Esempi:**

| Valore in `to` | Dati del record | Risultato |
|----------------|-----------------|-----------|
| `"admin@co.it"` | qualsiasi | `"admin@co.it"` (fisso) |
| `"{{email}}"` | `email: "mario@co.it"` | `"mario@co.it"` |
| `"{{email}}"` | campo `email` assente | scartato (nessuna `@`) |
| `"{{email}}"` | `email: null` | scartato (placeholder vuoto, nessuna `@`) |

---

## 5. Template email

Le notifiche usano il sistema di template email esistente (collection `email_templates`). I template per le notifiche **non richiedono validazione bidirezionale**: il sistema risolve solo i placeholder per cui esiste un valore, lasciando gli altri vuoti.

### Template da file HTML nel classpath (senza DB)

Oltre ai template salvati nel database (`email_templates`), il sistema supporta template HTML distribuiti direttamente come file statici nel classpath dell'applicazione.

Se `EmailTemplateService.getTemplateEntity(id)` non trova un documento MongoDB con quell'ID, cerca automaticamente `template/{id}.html` nel classpath. Questo evita di dover creare il template via API al primo avvio.

**Convenzione:** nome del file senza `.html` = `templateId` da usare in `notificationConfig`.

```text
src/main/resources/template/prenotazione-confermata.html
                                      ↑
                     createTemplateId: "prenotazione-confermata"
```

**Caratteristiche del fallback classpath:**
- L'HTML viene caricato dal file e i placeholder vengono risolti lenientemente (stesso comportamento dei template DB)
- Gli allegati embedded **non sono supportati** (solo i template DB possono avere allegati)
- Ideale per template distribuiti con il progetto (es. template di esempio nel template `entity-definitions.yaml`)

> **Priorità**: se esiste un documento MongoDB con quell'ID, viene sempre preferito al file classpath.

---

### Creare un template per le notifiche

```http
POST /api/v1/email/templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "ordine-creato",
  "htmlContent": "<html><body><h1>Nuovo ordine ricevuto</h1><p>ID: {{id}}<br>Entity: {{entityKey}}<br>Cliente: {{nome_cliente}}</p></body></html>",
  "placeholders": ["id", "entityKey", "nome_cliente"]
}
```

> Nota: il sistema di notifiche usa risoluzione leniente, quindi non è necessario dichiarare tutti i placeholder. Tuttavia, dichiararli nel template è buona pratica per la documentazione.

### Placeholder consigliati nel template

- Per notifiche su **create/update**: usa `{{entityKey}}`, `{{id}}` e i campi specifici dell'entity (es. `{{email}}`, `{{nome}}`, `{{importo}}`)
- Per notifiche su **delete**: usa solo `{{entityKey}}` e `{{id}}`

---

## 6. Esempi completi

### Entity `prenotazioni` — template di inizializzazione con classpath HTML

L'entity `prenotazioni` è inclusa nel template di inizializzazione (`template/entity-definitions.yaml`) come esempio funzionante. Alla creazione o aggiornamento di un record, il sistema invia una email ai destinatari fissi e all'indirizzo email contenuto nel record stesso.

I template HTML (`prenotazione-confermata.html`, `prenotazione-aggiornata.html`) sono distribuiti nel classpath e non richiedono nessuna operazione sul database.

```text
notificationConfig:
  to:
    - "admin@esempio.it"
    - "{{email_cliente}}"          ← risolto con il campo email_cliente del record
  subject: "Prenotazione #{{id}} — {{servizio}}"
  createTemplateId: "prenotazione-confermata"   ← template/prenotazione-confermata.html
  updateTemplateId: "prenotazione-aggiornata"   ← template/prenotazione-aggiornata.html
  deleteTemplateId: null                         ← nessuna notifica su delete
```

---

### Entity `ordini` con notifiche su create e update

**Creazione entity:**

```http
POST /api/v1/entity-definitions
Authorization: Bearer <token>
Content-Type: application/json

{
  "entityKey": "ordini",
  "label": "Ordini",
  "fields": [
    { "name": "cliente", "type": "STRING", "required": true },
    { "name": "email", "type": "EMAIL", "required": true },
    { "name": "importo", "type": "NUMBER", "required": true }
  ],
  "notificationConfig": {
    "to": ["backoffice@azienda.it", "{{email}}"],
    "subject": "Ordine {{id}} — {{entityKey}}",
    "createTemplateId": "ordine-creato",
    "updateTemplateId": "ordine-aggiornato",
    "deleteTemplateId": null
  }
}
```

**Flusso quando viene creato un record `ordini`:**

1. `POST /api/v1/records/ordini` con `{ "data": { "cliente": "Mario", "email": "mario@co.it", "importo": 99.90 } }`
2. Il sistema valida, salva il record e ottiene l'ID (es. `"abc123"`)
3. `RecordNotificationService` costruisce i placeholder: `{ entityKey: "ordini", id: "abc123", cliente: "Mario", email: "mario@co.it", importo: "99.90" }`
4. Risolve `to`: `["backoffice@azienda.it", "mario@co.it"]`
5. Risolve `subject`: `"Ordine abc123 — ordini"`
6. Carica template `"ordine-creato"` e sostituisce i placeholder nel HTML
7. Invia email a `backoffice@azienda.it` e a `mario@co.it`

---

### Entity `utenti` con notifica solo su delete

```json
{
  "notificationConfig": {
    "to": ["admin@azienda.it"],
    "subject": "Utente eliminato: {{id}}",
    "createTemplateId": null,
    "updateTemplateId": null,
    "deleteTemplateId": "utente-eliminato"
  }
}
```

Il template `utente-eliminato` può usare solo `{{entityKey}}` e `{{id}}` (i dati del record non sono disponibili su delete).

---

### Aggiornare la configurazione

```http
PUT /api/v1/entity-definitions/ordini
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "Ordini",
  "fields": [ ... ],
  "notificationConfig": {
    "to": ["nuovo-backoffice@azienda.it"],
    "createTemplateId": "ordine-creato-v2",
    "updateTemplateId": null,
    "deleteTemplateId": null
  }
}
```

### Rimuovere la configurazione

```http
PUT /api/v1/entity-definitions/ordini
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "Ordini",
  "fields": [ ... ],
  "notificationConfig": null
}
```

---

## 7. Comportamento in caso di errore

| Situazione | Comportamento |
|------------|---------------|
| Template non trovato (ID errato) | Log WARN, nessuna email inviata, operazione CRUD completata normalmente |
| SMTP non raggiungibile | Log WARN con messaggio eccezione, operazione CRUD completata normalmente |
| Nessun destinatario valido (tutti i placeholder non risolti) | Log WARN `"Nessun destinatario valido"`, nessuna email inviata |
| `notificationConfig` è `null` | Nessuna notifica, nessun log |
| `createTemplateId` è `null` | Nessuna notifica su create; update e delete seguono i rispettivi templateId |
| Placeholder `{{email}}` nel `to` ma record senza campo `email` | Quel destinatario viene scartato silenziosamente; gli altri vengono inviati |

> **La regola fondamentale**: un errore nelle notifiche **non causa mai un errore nell'operazione CRUD**. La risposta HTTP al client riflette il risultato dell'operazione sul record, non l'esito dell'invio email.
