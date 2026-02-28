# Sistema di Plugin — CMS NoSQL

Questa guida spiega come creare, registrare e testare un plugin personalizzato per il CMS NoSQL.

---

## Indice

1. [Panoramica](#1-panoramica)
2. [Architettura](#2-architettura)
3. [Creare un plugin](#3-creare-un-plugin)
4. [Registrare il plugin](#4-registrare-il-plugin)
5. [Avviare l'applicazione con i plugin](#5-avviare-lapplicazione-con-i-plugin)
6. [Esempio completo — UtentiDuplicatePlugin](#6-esempio-completo--utentiduplicateplugin)
7. [Errori e risposta HTTP](#7-errori-e-risposta-http)
8. [Convenzioni e best practice](#8-convenzioni-e-best-practice)

---

## 1. Panoramica

Il sistema di plugin permette di agganciare **logica custom** al ciclo di vita CRUD dei record senza modificare il modulo core `cms-nosql`.

Un plugin viene invocato automaticamente da `RecordService` nei seguenti punti:

| Hook | Quando | Può bloccare? |
|------|--------|:-------------:|
| `beforeCreate` | prima del salvataggio del nuovo record | sì |
| `afterCreate` | dopo il salvataggio del nuovo record | no |
| `beforeUpdate` | prima del salvataggio dell'aggiornamento | sì |
| `afterUpdate` | dopo il salvataggio dell'aggiornamento | no |
| `beforeDelete` | prima dell'eliminazione (soft delete) | sì |
| `afterDelete` | dopo l'eliminazione (soft delete) | no |

La validazione strutturale dei tipi di campo (eseguita da `RecordValidationService`) avviene **sempre prima** dei hook `before*`. I plugin ricevono quindi dati già strutturalmente validi e si concentrano sulle **regole di business**.

> **Vincolo:** per ogni entity key può essere registrato **al massimo un plugin**. Se `RecordService` rileva più plugin che restituiscono `true` per la stessa entity, lancia `IllegalStateException`.

---

## 2. Architettura

```
cms-nosql (modulo core / libreria)
│
├── plugin/
│   └── RecordPlugin.java        ← interfaccia pubblica del sistema di plugin
│
└── service/
    └── RecordService.java       ← inietta List<RecordPlugin>, li invoca su create/update/delete


custom-plugin (modulo applicazione)
│
├── UtentiDuplicatePlugin.java          ← implementazione di esempio
├── CustomPluginAutoConfiguration.java  ← registra i bean via @AutoConfiguration
├── CustomPluginApplication.java        ← entry point Spring Boot
│
└── resources/
    └── META-INF/spring/
        └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

**Flusso di una richiesta POST /api/v1/records/eventi:**

```
RecordController.create()
    └── RecordService.create()
            1. entityDefinitionService.getByKey()   ← verifica entity
            2. aclService.checkPermission(WRITE)     ← verifica ACL
            3. validationService.validate()          ← validazione strutturale
            4. plugin.beforeCreate()                 ← HOOK (può bloccare)
            5. recordRepository.save()               ← salvataggio
            6. plugin.afterCreate()                  ← HOOK (notifica)
```

**Flusso di una richiesta DELETE /api/v1/records/eventi/{id}:**

```
RecordController.delete()
    └── RecordService.delete()
            1. entityDefinitionService.getByKey()   ← verifica entity
            2. aclService.checkPermission(DELETE)   ← verifica ACL
            3. recordRepository.findById()          ← verifica esistenza
            4. plugin.beforeDelete()                ← HOOK (può bloccare)
            5. recordRepository.softDelete()        ← eliminazione logica
            6. plugin.afterDelete()                 ← HOOK (notifica)
```

---

## 3. Creare un plugin

Un plugin è una classe Java che implementa l'interfaccia `RecordPlugin`:

```java
package it.wolfcoding.cms_nosql.plugin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

public interface RecordPlugin {

    /** Logger condiviso usato dalle implementazioni di default. */
    Logger log = LoggerFactory.getLogger(RecordPlugin.class);

    /**
     * Indica se il plugin deve essere invocato per questa entity.
     * Per ogni entity key può esistere al massimo un plugin che restituisce true.
     */
    boolean supports(String entityKey);

    // ── Before hooks ──────────────────────────────────────────────────────────
    // Lanciare RecordValidationException per bloccare l'operazione (HTTP 422).
    // Default: logga "<nomeMetodo> not implemented".

    default void beforeCreate(String entityKey, Map<String, Object> data) {
        log.debug("beforeCreate not implemented [entityKey={}]", entityKey);
    }

    default void beforeUpdate(String entityKey, String id, Map<String, Object> data) {
        log.debug("beforeUpdate not implemented [entityKey={}, id={}]", entityKey, id);
    }

    default void beforeDelete(String entityKey, String id) {
        log.debug("beforeDelete not implemented [entityKey={}, id={}]", entityKey, id);
    }

    // ── After hooks ───────────────────────────────────────────────────────────
    // Invocati a operazione già completata; un'eccezione si propaga come 500.
    // Default: logga "<nomeMetodo> not implemented [entityKey=..., id=...]".

    default void afterCreate(String entityKey, String id, Map<String, Object> data) {
        log.debug("afterCreate not implemented [entityKey={}, id={}, data={}]", entityKey, id, data);
    }

    default void afterUpdate(String entityKey, String id, Map<String, Object> data) {
        log.debug("afterUpdate not implemented [entityKey={}, id={}, data={}]", entityKey, id, data);
    }

    default void afterDelete(String entityKey, String id) {
        log.debug("afterDelete not implemented [entityKey={}, id={}]", entityKey, id);
    }
}
```

### Struttura minima di un plugin

Tutti i metodi hanno un default: implementa **solo gli hook di cui hai bisogno**.
`supports()` è l'unico metodo obbligatorio.

```java
package it.wolfcoding.customplugin;

import it.wolfcoding.cms_nosql.dto.error.ValidationErrorDetail;
import it.wolfcoding.cms_nosql.exception.RecordValidationException;
import it.wolfcoding.cms_nosql.plugin.RecordPlugin;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class MioPlugin implements RecordPlugin {

    @Override
    public boolean supports(String entityKey) {
        return "nome_entity".equals(entityKey);
    }

    // Override solo degli hook che interessano; gli altri loggano "not implemented"

    @Override
    public void beforeCreate(String entityKey, Map<String, Object> data) {
        validaRegolaDiBusiness(data, null);
    }

    @Override
    public void beforeUpdate(String entityKey, String id, Map<String, Object> data) {
        validaRegolaDiBusiness(data, id);
    }

    private void validaRegolaDiBusiness(Map<String, Object> data, String excludeId) {
        Object campo = data.get("mio_campo");
        if (campo == null) {
            return;
        }
        if (!verificaCondizione(campo)) {
            List<ValidationErrorDetail> errori = new ArrayList<>();
            errori.add(new ValidationErrorDetail("mio_campo", "Messaggio di errore di business"));
            throw new RecordValidationException(errori);
        }
    }

    private boolean verificaCondizione(Object valore) {
        return true;
    }
}
```

### Regole importanti

| Regola | Dettaglio |
|--------|-----------|
| `supports()` è l'unico metodo obbligatorio | Tutti gli hook hanno un default che logga `"<nomeMetodo> not implemented"` |
| Un solo plugin per entity | `supports()` deve restituire `true` per una sola entity; più plugin sulla stessa entity causano `IllegalStateException` |
| `supports()` deve essere puro | Nessun side effect; viene chiamato ad ogni operazione |
| Hook `before*` bloccano | Lanciare `RecordValidationException` per bloccare con HTTP 422 |
| Hook `after*` non bloccano | L'operazione è già completata; un'eccezione si propaga come 500 |
| Non modificare `data` | La mappa è in lettura; le modifiche non vengono persistite |
| `beforeUpdate` e `afterUpdate` ricevono `id` | Usare `id` per escludere il record corrente nelle query di conflitto |
| I campi possono essere null | La validazione strutturale avviene prima, ma il plugin deve gestire `null` |

---

## 4. Registrare il plugin

I plugin vengono registrati come bean Spring tramite una classe `@AutoConfiguration`. Questo meccanismo permette la scoperta automatica senza modificare il modulo core.

### 4.1 Creare la classe di auto-configurazione

```java
package it.wolfcoding.customplugin;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
public class CustomPluginAutoConfiguration {

    @Bean
    public MioPlugin mioPlugin(/* eventuale dipendenza, es. RecordRepository */) {
        return new MioPlugin();
    }
}
```

Se il plugin necessita di accesso a MongoDB per query, iniettare `RecordRepository`:

```java
@Bean
public MioPlugin mioPlugin(RecordRepository recordRepository) {
    return new MioPlugin(recordRepository);
}
```

### 4.2 Registrare la auto-configurazione

Creare il file:

```
custom-plugin/src/main/resources/
    META-INF/spring/
        org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

Contenuto del file (una classe per riga):

```
it.wolfcoding.customplugin.CustomPluginAutoConfiguration
```

Spring Boot carica questo file all'avvio e attiva la configurazione automaticamente se il modulo è sul classpath.

### 4.3 Registrare più plugin

Ogni plugin deve gestire entity **distinte**. Per aggiungere un secondo plugin, aggiungere un `@Bean` alla stessa classe di auto-configurazione:

```java
@AutoConfiguration
public class CustomPluginAutoConfiguration {

    @Bean
    public EventiConflictPlugin eventiConflictPlugin(RecordRepository recordRepository) {
        return new EventiConflictPlugin(recordRepository);   // gestisce "eventi"
    }

    @Bean
    public ProdottiStockPlugin prodottiStockPlugin(RecordRepository recordRepository) {
        return new ProdottiStockPlugin(recordRepository);    // gestisce "prodotti"
    }
}
```

> **Attenzione:** due plugin non possono gestire la stessa entity. Se `eventiConflictPlugin` e un altro bean restituiscono entrambi `supports("eventi") == true`, la prima operazione su quella entity lancerà `IllegalStateException`.

Spring inietta automaticamente **tutti** i bean di tipo `RecordPlugin` in `RecordService` come `List<RecordPlugin>`.

---

## 5. Avviare l'applicazione con i plugin

Il modulo `custom-plugin` è l'applicazione eseguibile. Contiene il proprio entry point Spring Boot che scansiona tutti i package `it.wolfcoding`:

```java
@SpringBootApplication(scanBasePackages = "it.wolfcoding")
@ConfigurationPropertiesScan(basePackages = "it.wolfcoding")
public class CustomPluginApplication {

    static void main(String[] args) {
        SpringApplication.run(CustomPluginApplication.class, args);
    }
}
```

### Build e avvio

```bash
# Build dell'intero progetto (dalla root)
mvn clean package

# Avvio con i plugin attivi
java -jar custom-plugin/target/custom-plugin-0.0.1-SNAPSHOT.jar

# Oppure con Maven
mvn spring-boot:run -pl custom-plugin
```

> **Nota:** `cms-nosql` produce anche un fat JAR autonomo (`cms-nosql-exec.jar`) che può essere eseguito senza plugin, utile per ambienti base.

---

## 6. Esempio completo — UtentiDuplicatePlugin

Il plugin `UtentiDuplicatePlugin` mostra un caso d'uso reale: impedire la creazione o l'aggiornamento di un utente se `username` o `email` sono già in uso da un altro record dell'entity `"utenti"`. I due controlli sono indipendenti: se entrambi i campi sono duplicati vengono segnalati contemporaneamente.

### Entity definition attesa

L'entity `utenti` deve avere almeno i campi:

| Campo | Tipo | Required |
|-------|------|----------|
| `username` | `STRING` | sì |
| `email` | `EMAIL` | sì |

### Codice del plugin

```java
public class UtentiDuplicatePlugin implements RecordPlugin {

    static final String ENTITY_KEY = "utenti";

    private final RecordRepository recordRepository;

    public UtentiDuplicatePlugin(RecordRepository recordRepository) {
        this.recordRepository = recordRepository;
    }

    @Override
    public boolean supports(String entityKey) {
        return ENTITY_KEY.equals(entityKey);
    }

    @Override
    public void beforeCreate(String entityKey, Map<String, Object> data) {
        checkDuplicates(data, null);
    }

    @Override
    public void beforeUpdate(String entityKey, String id, Map<String, Object> data) {
        checkDuplicates(data, id);   // esclude il record che stiamo aggiornando
    }

    // beforeDelete, afterCreate, afterUpdate, afterDelete → no-op (default)

    private void checkDuplicates(Map<String, Object> data, String excludeId) {
        List<ValidationErrorDetail> errors = new ArrayList<>();

        checkField("username", data, excludeId, errors);
        checkField("email", data, excludeId, errors);

        if (!errors.isEmpty()) {
            throw new RecordValidationException(errors);
        }
    }

    private void checkField(String fieldName, Map<String, Object> data,
                            String excludeId, List<ValidationErrorDetail> errors) {
        Object value = data.get(fieldName);
        if (value == null) {
            return;
        }

        Criteria criteria = Criteria.where("entityKey").is(ENTITY_KEY)
                .and("deleted").ne(true)
                .and("data." + fieldName).is(value);

        if (excludeId != null) {
            criteria = criteria.and("_id").ne(excludeId);
        }

        boolean exists = !recordRepository.find(new Query(criteria)).isEmpty();
        if (exists) {
            errors.add(new ValidationErrorDetail(fieldName,
                "Il valore '" + value + "' e gia in uso per il campo " + fieldName));
        }
    }
}
```

### Comportamento atteso

**Richiesta valida (nessun duplicato):**

```http
POST /api/v1/records/utenti
Content-Type: application/json

{
  "data": {
    "username": "mario.rossi",
    "email": "mario.rossi@esempio.it"
  }
}
```

Risposta: `201 Created`

**Richiesta con username duplicato:**

```http
POST /api/v1/records/utenti
Content-Type: application/json

{
  "data": {
    "username": "mario.rossi",
    "email": "altro@esempio.it"
  }
}
```

Risposta: `422 Unprocessable Entity`

```json
{
  "status": 422,
  "message": "Record validation failed",
  "errors": [
    {
      "field": "username",
      "message": "Il valore 'mario.rossi' e gia in uso per il campo username"
    }
  ]
}
```

**Richiesta con entrambi i campi duplicati:**

```json
{
  "status": 422,
  "message": "Record validation failed",
  "errors": [
    {
      "field": "username",
      "message": "Il valore 'mario.rossi' e gia in uso per il campo username"
    },
    {
      "field": "email",
      "message": "Il valore 'mario.rossi@esempio.it' e gia in uso per il campo email"
    }
  ]
}
```

---

## 7. Errori e risposta HTTP

| Tipo di errore | Quando | HTTP |
|----------------|--------|------|
| `RecordValidationException` (da hook `before*`) | Validazione strutturale o plugin blocca l'operazione | `422 Unprocessable Entity` |
| `IllegalStateException` (da `RecordService`) | Più di un plugin registrato per la stessa entity | `500 Internal Server Error` |
| `AclAccessDeniedException` | Permesso mancante sull'entity | `403 Forbidden` |
| `EntityDefinitionNotFoundException` | L'entity key non esiste | `404 Not Found` |
| Qualsiasi eccezione non prevista | Errore interno nel plugin (inclusi hook `after*`) | `500 Internal Server Error` |

**Raccomandazione:** lanciare sempre `RecordValidationException` con messaggi chiari negli hook `before*`. Le eccezioni non gestite verranno catturate da `GlobalExceptionHandler` e restituiranno un generico 500.

---

## 8. Convenzioni e best practice

### Naming

- Il plugin si chiama `<NomeEntity><Tipo>Plugin` (es. `EventiConflictPlugin`, `ProdottiStockPlugin`)
- La costante `ENTITY_KEY` è sempre `static final String` con il valore della chiave entity

### Gestione dei campi null

```text
// CORRETTO — il plugin salta silenziosamente i campi mancanti
// La validazione strutturale (required, type) ha già verificato la presenza
Object campo = data.get("nome_campo");
if (campo == null) {
    return;
}
```

### Quando usare gli hook after*

Gli hook `after*` sono adatti per **effetti collaterali** che non devono bloccare l'operazione:

- notifiche (email, webhook, eventi su coda)
- aggiornamento di cache o indici esterni
- logging di business (audit log su sistemi esterni)
- sincronizzazione con sistemi terzi

```text
@Override
public void afterCreate(String entityKey, String id, Map<String, Object> data) {
    // Esempio: inviare una notifica asincrona
    notificationService.notifyNewRecord(entityKey, id);
}

@Override
public void afterDelete(String entityKey, String id) {
    // Esempio: invalidare una cache esterna
    cacheService.evict(entityKey, id);
}
```

### Query MongoDB nei plugin

Usare sempre `"deleted".ne(true)` per escludere i record eliminati logicamente:

```text
Criteria.where("entityKey").is(entityKey)
        .and("deleted").ne(true)
        .and("data.campo").is(valore)
```

### Test del plugin

Testare il plugin in isolamento mockando `RecordRepository`:

```text
import it.wolfcoding.cms_nosql.exception.RecordValidationException;
import it.wolfcoding.cms_nosql.model.Record;
import it.wolfcoding.cms_nosql.repository.RecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UtentiDuplicatePluginTest {

    @Mock
    RecordRepository recordRepository;

    UtentiDuplicatePlugin plugin;

    @BeforeEach
    void setUp() {
        plugin = new UtentiDuplicatePlugin(recordRepository);
    }

    @Test
    void beforeCreate_username_duplicato_lancia_eccezione() {
        when(recordRepository.find(any()))
            .thenReturn(List.of(new Record()))  // username duplicato
            .thenReturn(List.of());             // email libera

        Map<String, Object> data = Map.of(
            "username", "mario.rossi",
            "email", "nuovo@esempio.it"
        );

        RecordValidationException ex = assertThrows(RecordValidationException.class,
            () -> plugin.beforeCreate("utenti", data));

        assertThat(ex.getErrors()).hasSize(1);
        assertThat(ex.getErrors().get(0).field()).isEqualTo("username");
    }

    @Test
    void beforeCreate_entrambi_duplicati_riporta_due_errori() {
        when(recordRepository.find(any())).thenReturn(List.of(new Record()));

        Map<String, Object> data = Map.of(
            "username", "mario.rossi",
            "email", "mario.rossi@esempio.it"
        );

        RecordValidationException ex = assertThrows(RecordValidationException.class,
            () -> plugin.beforeCreate("utenti", data));

        assertThat(ex.getErrors()).hasSize(2);
    }

    @Test
    void beforeCreate_nessun_duplicato_non_lancia() {
        when(recordRepository.find(any())).thenReturn(List.of());

        Map<String, Object> data = Map.of(
            "username", "nuovo.utente",
            "email", "nuovo@esempio.it"
        );

        assertDoesNotThrow(() -> plugin.beforeCreate("utenti", data));
    }

    @Test
    void beforeUpdate_esclude_record_corrente() {
        when(recordRepository.find(any())).thenReturn(List.of());

        Map<String, Object> data = Map.of(
            "username", "mario.rossi",
            "email", "mario.rossi@esempio.it"
        );

        assertDoesNotThrow(() -> plugin.beforeUpdate("utenti", "id-esistente", data));
    }

    @Test
    void afterCreate_usa_default_e_non_lancia() {
        // Gli hook non overridati usano il default dell'interfaccia (log.debug "not implemented")
        assertDoesNotThrow(() -> plugin.afterCreate("utenti", "new-id", Map.of()));
    }

    @Test
    void beforeDelete_usa_default_e_non_lancia() {
        assertDoesNotThrow(() -> plugin.beforeDelete("utenti", "some-id"));
    }
}
```

### Aggiungere un nuovo plugin: checklist

- [ ] Creare la classe che implementa `RecordPlugin`
- [ ] Implementare `supports()` con la chiave dell'entity (una sola entity per plugin)
- [ ] Override degli hook necessari; gli altri ereditano il default (`log.debug("... not implemented")`)
- [ ] Aggiungere il `@Bean` in `CustomPluginAutoConfiguration`
- [ ] Verificare che nessun altro plugin già esistente gestisca la stessa entity
- [ ] Scrivere i test unitari con mock del repository
- [ ] Verificare la risposta HTTP 422 con un test di integrazione
