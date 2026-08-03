<div align="center">

# 🧠 memory-lancedb-pro · π Pi Coding Agent Extension

**Assistente di memoria AI per l'[agente di coding pi](https://github.com/earendil-works/pi)**

*Dai al tuo agente AI un cervello che si ricorda davvero — tra sessioni, tra progetti, attraverso il tempo.*

Un'estensione di memoria basata su LanceDB per pi che memorizza preferenze, decisioni e contesto di progetto, richiamandole automaticamente nelle sessioni future.

[![Pi Extension](https://img.shields.io/badge/Pi-Extension-blue)](https://github.com/earendil-works/pi)
[![Pi 0.80+](https://img.shields.io/badge/pi-0.80%2B-brightgreen)](https://github.com/earendil-works/pi)
[![LanceDB](https://img.shields.io/badge/LanceDB-Vectorstore-orange)](https://lancedb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) | [简体中文](README_CN.md) | [繁體中文](README_TW.md) | [日本語](README_JA.md) | [한국어](README_KO.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Deutsch](README_DE.md) | [Italiano](README_IT.md) | [Русский](README_RU.md) | [Português (Brasil)](README_PT-BR.md)

</div>

---

## 🤖 Informazioni su questo port

Questo repository è un **port dell'agente di coding pi** del plugin di memoria di livello produttivo [memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro) (MIT). L'intero nucleo del plugin OpenClaw è intatto e viene caricato senza modifiche tramite un sottile adapter (`pi-adapter/`), quindi pi (≥ 0.80) ottiene lo stesso motore di memoria basato su LanceDB con una divergenza minima dall'upstream.

> Tutto quanto segue documenta l'esperienza su pi. Vedi l'[Appendice upstream OpenClaw](#appendice-upstream-openclaw) in fondo per la tabella delle differenze del port e l'uso OpenClaw originale.

---

## Perché memory-lancedb-pro?

La maggior parte degli agenti AI soffre di amnesia. Dimenticano tutto nel momento in cui avvii una nuova chat.

**memory-lancedb-pro** è un'estensione di memoria a lungo termine di livello produttivo che trasforma il tuo agente in un **assistente di memoria AI** — cattura automaticamente ciò che conta, lascia che il rumore svanisca naturalmente e recupera la memoria giusta al momento giusto. Nessun tag manuale, nessun mal di testa da configurazione.

### Il tuo assistente di memoria AI in azione

**Senza memoria — ogni sessione parte da zero:**

> **Tu:** "Usa i tab per l'indentazione, aggiungi sempre la gestione degli errori."
> *(sessione successiva)*
> **Tu:** "Te l'ho già detto — tab, non spazi!" 😤
> *(sessione successiva)*
> **Tu:** "...davvero, tab. E gestione degli errori. Di nuovo."

**Con memory-lancedb-pro — il tuo agente impara e ricorda:**

> **Tu:** "Usa i tab per l'indentazione, aggiungi sempre la gestione degli errori."
> *(sessione successiva — l'agente richiama automaticamente le tue preferenze)*
> **Agente:** *(applica silenziosamente tab + gestione degli errori)* ✅
> **Tu:** "Perché il mese scorso abbiamo scelto PostgreSQL invece di MongoDB?"
> **Agente:** "In base alla nostra discussione del 12 febbraio, i motivi principali erano..." ✅

È questa la differenza che fa un **assistente di memoria AI** — impara il tuo stile, richiama le decisioni passate e offre risposte personalizzate senza che tu debba ripeterti.

### Cos'altro sa fare?

| | Cosa ottieni |
|---|---|
| **Cattura automatica** | Il tuo agente impara da ogni conversazione — nessun `memory_store` manuale necessario |
| **Estrazione intelligente** | Classificazione LLM in 6 categorie: profili, preferenze, entità, eventi, casi, modelli |
| **Dimenticanza intelligente** | Modello di decadimento Weibull — le memorie importanti restano, il rumore svanisce naturalmente |
| **Recupero ibrido** | Ricerca vettoriale + full-text BM25, fusa con ri-ranking cross-encoder |
| **Iniezione di contesto** | Le memorie rilevanti emergono automaticamente prima di ogni risposta |
| **Isolamento multi-scope** | Confini di memoria per agente, per utente, per progetto |
| **Qualsiasi provider** | OpenAI, Jina, Gemini, Ollama o qualsiasi API compatibile con OpenAI |
| **Toolkit completo** | CLI, backup, migrazione, upgrade, export/import — pronto per la produzione |

---

## Avvio rapido

> **Requisito CPU:** la tua CPU deve supportare le istruzioni **AVX**. La ricerca vettoriale nativa di LanceDB può richiedere **AVX2** su alcune build Linux x64 e può crashare le CPU solo-AVX con `SIGILL`; imposta `retrieval.disableNativeCosine: true` oppure `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` per usare una scansione di righe con ambito limitato più un ranking coseno in JavaScript. Controlla i flag della CPU con: `grep -o 'avx[^ ]*' /proc/cpuinfo | head -1` (nessun output = non supportato). Vedi [#419](https://github.com/CortexReach/memory-lancedb-pro/issues/419) e [#644](https://github.com/CortexReach/memory-lancedb-pro/issues/644) per i dettagli.

### 1. Compila l'estensione

```bash
git clone https://github.com/lhxyzCJ/TestForPi-memory-lancedb-pro
cd TestForPi-memory-lancedb-pro && npm install && npm run build
```

Il punto di ingresso di pi è `dist/pi-adapter/index.js` (compilato da `pi-adapter/index.ts`).

### 2. Registra l'estensione

Scegli una delle opzioni:

**A. Tramite il file di impostazioni di pi (globale, tutti i progetti):**

Aggiungi a `~/.pi/agent/settings.json`:

```json
{
  "extensions": [
    "/absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js"
  ]
}
```

**B. Tramite il gestore pacchetti di pi:**

```bash
pi install /absolute/path/to/TestForPi-memory-lancedb-pro
```

**C. Test rapido per una sessione:**

```bash
pi -e /absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js
```

**D. Auto-discovery (nessuna modifica alle impostazioni):** inserisci l'estensione compilata (o un `package.json` con un campo `pi.extensions`) in `~/.pi/agent/extensions/` (globale) o `.pi/extensions/` (locale al progetto) e riavvia pi.

### 3. Crea il file di configurazione

Crea `~/.pi/agent/memory-lancedb-pro.json5` (puoi anche usare `.json`, oppure puntare ovunque con `$MEMORY_LANCEDB_PRO_CONFIG`):

```json5
{
  embedding: {
    provider: "openai-compatible",
    apiKey: "${JINA_API_KEY}",
    model: "jina-embeddings-v5-text-small",
    baseURL: "https://api.jina.ai/v1",
    dimensions: 1024
  },
  autoCapture: true,
  autoRecall: true,
  smartExtraction: true
}
```

> La forma del documento di configurazione è identica alla voce del plugin OpenClaw upstream — sono accettati sia il semplice oggetto interno qui sopra sia un wrapper `{ "config": { ... } }`.

### 4. Verifica

Avvia una sessione pi e controlla il log di avvio:

```
memory-lancedb-pro: smart extraction enabled
memory-lancedb-pro@...: plugin registered (db: /root/.pi-agent/memory/lancedb-pro, ...)
```

Poi chiedi al tuo agente di memorizzare e richiamare qualcosa:

> **Tu:** "Ricorda: preferisco i tab agli spazi."
> **Tu:** "Quali sono le mie preferenze di indentazione?"

### Perché questi valori predefiniti?

- `autoCapture` + `smartExtraction` → il tuo agente impara automaticamente da ogni conversazione
- `autoRecall` → le memorie rilevanti vengono iniettate prima di ogni risposta
- `extractMinMessages: 2` → l'estrazione si attiva nelle normali chat a due turni
- `sessionMemory.enabled: false` → evita di contaminare il recupero con i riepiloghi di sessione fin dal primo giorno

---

## Requisiti di runtime (pi)

I seguenti requisiti provengono dall'host pi e non sono configurati in `memory-lancedb-pro.json5`:

1. **Provider predefinito** — I sotto-agenti di riflessione/dreaming vengono lanciati tramite la CLI `pi` senza `--provider`/`--model` ed ereditano il valore predefinito dell'host. Imposta `defaultProvider`/`defaultModel` in `~/.pi/agent/settings.json` (es. `"defaultProvider": "opencode-go", "defaultModel": "deepseek-v4-flash"`), altrimenti i sotto-agenti potrebbero cadere su un provider rotto o non voluto.
2. **Endpoint embedding** — L'API di embedding deve essere raggiungibile (es. avvia Ollama prima di una sessione); un endpoint non raggiungibile degrada silenziosamente l'estrazione intelligente al fallback regex.
3. **Chiave API LLM** — L'estrazione intelligente richiede una chiave LLM valida (`llm.apiKey`, es. `"${OPENCODE_API_KEY}"`); senza di essa, l'estrazione ricade sulla cattura regex.
4. **Percorso di aggiornamento** — pi carica l'estensione dal percorso assoluto registrato in `settings.json` (`extensions`). Dopo aver aggiornato questo repository, esegui di nuovo `pi install` (o sostituisci la copia installata), altrimenti pi continuerà a caricare la vecchia build.

**Divario noto rispetto a upstream:** la modalità di ammissione batch-utility di upstream (#941, `utilityMode: "batch"`, `utilityVetoThreshold`) non è portata; `utilityMode` supporta solo `"standalone" | "off"`.

## ⚠️ Architettura della memoria (Importante)

L'estensione espone una capacità di memoria con due archivi coordinati:

| Livello di memoria | Archivio | A cosa serve | Richiamabile? |
|---|---|---|---|
| **Memoria del plugin** | LanceDB (vector store) | Richiamo semantico tramite `memory_recall` / auto-recall | ✅ Sì |
| **Corpus canonico** | `MEMORY.md`, `memory/**/*.md`, trascrizioni di sessione recenti, `memory/dreaming/**/*.md` | File fonte di verità e artefatti pubblici | ✅ Tramite l'indice semantico LanceDB quando `canonicalCorpus.enabled` è true |

**Principio chiave:**
> I file canonici restano la fonte di verità. LanceDB è l'indice semantico usato per recuperarli con percorsi ancorati, intervalli di righe, estratti e citazioni.

**Cosa significa per te:**
- Hai bisogno del richiamo semantico? → Usa `memory_store` o lascia fare alla cattura automatica
- `memory/YYYY-MM-DD.md` → trattalo come un **diario / registro giornaliero** che può anche essere indicizzato per la ricerca semantica
- `MEMORY.md` → riferimento curato e leggibile dall'uomo che può essere indicizzato come contesto canonico
- `memory/dreaming/**/*.md` → report dei sogni esposti come artefatti pubblici e indicizzati come contesto di riflessione
- Trascrizioni di sessione JSONL → indicizzate come `source: "sessions"` quando `canonicalCorpus.includeSessionTranscripts` è abilitato
- Memoria del plugin → percorso di scrittura primario per fatti durevoli, preferenze, decisioni e memorie catturate automaticamente

### Dove vivono i dati (pi)

| Cosa | Percorso |
|---|---|
| Database del plugin (LanceDB) | `~/.pi/agent/memory/lancedb-pro` (o `$MEMORY_LANCEDB_PRO_DB_PATH`) |
| Mirror Markdown | `~/.pi/agent/memory/md-mirror` (o `$MEMORY_LANCEDB_PRO_MD_MIRROR_DIR`) |
| Trascrizioni di sessione | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| Skill globali | `~/.pi/agent/skills` |

Il percorso base è `~/.pi/agent`; puoi sovrascriverlo con `PI_CODING_AGENT_DIR` o `PI_AGENT_DIR`. I percorsi relativi nella configurazione (`dbPath`, `mdMirrorDir`, ...) vengono risolti rispetto alla home dell'agente pi.

### Posizioni dei file di configurazione (in ordine di priorità)

1. `$MEMORY_LANCEDB_PRO_CONFIG` (percorso esplicito)
2. `~/.pi/agent/memory-lancedb-pro.json5`
3. `~/.pi/agent/memory-lancedb-pro.json`

Se non viene trovato alcun file di configurazione, l'estensione registra un avviso e resta disabilitata — una configurazione mancante o rotta non fa mai cadere la sessione pi.

---

## Funzionalità principali

### Recupero ibrido

```
Query → embedQuery() ─┐
                       ├─→ Hybrid Fusion → Rerank → Lifecycle Decay Boost → Length Norm → Filter
Query → BM25 FTS ─────┘
```

- **Ricerca vettoriale** — similarità semantica tramite ANN di LanceDB (distanza coseno)
- **Ricerca full-text BM25** — corrispondenza esatta delle parole chiave tramite l'indice FTS di LanceDB
- **Fusione ibrida** — punteggio vettoriale come base, i risultati BM25 ricevono un boost ponderato (non RRF standard — ottimizzato per la qualità del richiamo nel mondo reale)
- **Pesi configurabili** — `vectorWeight`, `bm25Weight`, `minScore`

### Ri-ranking cross-encoder

- Adapter integrati per **Jina**, **SiliconFlow**, **Voyage AI** e **Pinecone**
- Compatibile con qualsiasi endpoint compatibile con Jina (es. Hugging Face TEI, DashScope)
- Scoring ibrido: 60% cross-encoder + 40% punteggio fuso originale
- Degradazione graduale: in caso di errore API ripiega sulla similarità coseno

### Pipeline di scoring a più stadi

| Stadio | Effetto |
| --- | --- |
| **Fusione ibrida** | Combina il richiamo semantico e quello per corrispondenza esatta |
| **Ri-rank cross-encoder** | Promuove i risultati semanticamente precisi |
| **Boost di decadimento del ciclo di vita** | Freschezza Weibull + frequenza di accesso + importanza × confidenza |
| **Normalizzazione della lunghezza** | Evita che le voci lunghe dominino (ancora: 500 caratteri) |
| **Punteggio minimo rigido** | Rimuove i risultati irrilevanti (predefinito: 0.35) |
| **Diversità MMR** | Similarità coseno > 0.85 → declassata |

### Estrazione intelligente della memoria (v1.1.0)

- **Estrazione LLM in 6 categorie**: profilo, preferenze, entità, eventi, casi, modelli
- **Archiviazione a livelli L0/L1/L2**: L0 (indice a una frase) → L1 (riepilogo strutturato) → L2 (narrazione completa)
- **Deduplicazione a due stadi**: pre-filtro per similarità vettoriale (≥0.7) → decisione semantica LLM (CREATE/MERGE/SKIP)
- **Merge consapevole delle categorie**: `profile` viene sempre unito, `events`/`cases` sono solo-append

### Gestione del ciclo di vita della memoria (v1.1.0)

- **Motore di decadimento Weibull**: punteggio composito = attualità + frequenza + valore intrinseco
- **Promozione a tre livelli**: `Peripheral ↔ Working ↔ Core` con soglie configurabili
- **Rinforzo all'accesso**: le memorie richiamate di frequente decadono più lentamente (stile spaced-repetition)
- **Emivita modulata dall'importanza**: le memorie importanti decadono più lentamente

### Isolamento multi-scope

- Scope integrati: `global`, `agent:<id>`, `custom:<name>`, `project:<id>`, `user:<id>`
- Controllo degli accessi a livello di agente tramite `scopes.agentAccess`
- Predefinito: ogni agente accede a `global` + al proprio scope `agent:<id>`
- Gli strumenti di sola lettura come `memory_recall`, `memory_search`, `memory_list` e `memory_debug` falliscono in modo soft quando uno scope richiesto non è accessibile: cercano invece negli scope accessibili al chiamante e restituiscono `ignoredScope` più `accessibleScopes` nei dettagli. Gli strumenti di scrittura e mutazione restituiscono comunque `scope_access_denied` per gli scope non accessibili.

### Cattura automatica e auto-richiamo

- **Auto-Capture** (`agent_end`): estrae preferenza/fatto/decisione/entità dalle conversazioni, deduplica e memorizza fino a 3 per turno
- **Auto-Recall** (prima di ogni costruzione del prompt): inietta il contesto `<relevant-memories>` (fino a 3 voci)

> **Nota:** su pi, questi hook OpenClaw (`agent_end`, `before_prompt_build`, ...) sono mappati dagli eventi del ciclo di vita di pi (`agent_end`, `input`, `session_start`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`) da `pi-adapter/shim.ts`.

### Filtro del rumore e recupero adattivo

- Filtra i contenuti di bassa qualità: rifiuti dell'agente, meta-domande, saluti
- Salta il recupero per saluti, comandi slash, semplici conferme, emoji
- Forza il recupero per le parole chiave della memoria ("remember", "previously", "last time")
- Soglie consapevoli del CJK (cinese: 6 caratteri vs inglese: 15 caratteri)

---

<details>
<summary><strong>Confronto con il <code>memory-lancedb</code> integrato (clicca per espandere)</strong></summary>

| Funzione | `memory-lancedb` integrato | **memory-lancedb-pro** |
| --- | :---: | :---: |
| Ricerca vettoriale | Sì | Sì |
| Ricerca full-text BM25 | - | Sì |
| Fusione ibrida (Vettore + BM25) | - | Sì |
| Ri-rank cross-encoder (multi-provider) | - | Sì |
| Boost di attualità e decadimento temporale | - | Sì |
| Normalizzazione della lunghezza | - | Sì |
| Diversità MMR | - | Sì |
| Isolamento multi-scope | - | Sì |
| Filtro del rumore | - | Sì |
| Recupero adattivo | - | Sì |
| CLI di gestione | - | Sì |
| Memoria di sessione | - | Sì |
| Embedding consapevoli del task | - | Sì |
| **Estrazione intelligente LLM (6 categorie)** | - | Sì (v1.1.0) |
| **Decadimento Weibull + Promozione a livelli** | - | Sì (v1.1.0) |
| Qualsiasi embedding compatibile con OpenAI | Limitato | Sì |

</details>

---

## Configurazione

Tutta la configurazione vive in `~/.pi/agent/memory-lancedb-pro.json5` (o `$MEMORY_LANCEDB_PRO_CONFIG`).

I campi delle chiavi API (`embedding.apiKey`, `retrieval.rerankApiKey` e `llm.apiKey`) accettano stringhe semplici, segnaposto `${ENV_VAR}` o oggetti SecretRef. Questo plugin supporta le sorgenti SecretRef `env` e `file`:

```json
{
  "embedding": {
    "apiKey": { "source": "env", "id": "JINA_API_KEY" }
  },
  "retrieval": {
    "rerankApiKey": { "source": "file", "id": "~/.pi/agent/secrets/jina-rerank" }
  }
}
```

Per `source: "file"`, `id` viene risolto rispetto alla home dell'agente pi e letto come file UTF-8. Il campo opzionale `provider` è accettato per compatibilità con la forma dell'oggetto SecretRef ma non viene usato per la selezione del provider. `exec` e le altre sorgenti SecretRef vengono rifiutate dalla validazione della configurazione a runtime.

<details>
<summary><strong>Esempio di configurazione completo</strong></summary>

```json5
{
  embedding: {
    apiKey: "${JINA_API_KEY}",
    model: "jina-embeddings-v5-text-small",
    baseURL: "https://api.jina.ai/v1",
    dimensions: 1024,
    taskQuery: "retrieval.query",
    taskPassage: "retrieval.passage",
    normalized: true,
    maxInputChars: 1400,
    clientTimeoutMs: 30000
  },
  dbPath: "~/.pi/agent/memory/lancedb-pro",
  autoCapture: true,
  autoRecall: true,
  retrieval: {
    mode: "hybrid",
    vectorWeight: 0.7,
    bm25Weight: 0.3,
    minScore: 0.3,
    rerank: "cross-encoder",
    rerankApiKey: "${JINA_API_KEY}",
    rerankModel: "jina-reranker-v3",
    rerankEndpoint: "https://api.jina.ai/v1/rerank",
    rerankProvider: "jina",
    candidatePoolSize: 20,
    recencyHalfLifeDays: 14,
    recencyWeight: 0.1,
    filterNoise: true,
    disableNativeCosine: false,
    lengthNormAnchor: 500,
    hardMinScore: 0.35,
    timeDecayHalfLifeDays: 60,
    reinforcementFactor: 0.5,
    maxHalfLifeMultiplier: 3
  },
  enableManagementTools: false,
  scopes: {
    default: "global",
    definitions: {
      global: { description: "Shared knowledge" },
      "agent:main": { description: "Main agent private" }
    },
    agentAccess: {
      main: ["global", "agent:main"]
    }
  },
  sessionStrategy: "none",
  sessionMemory: {
    enabled: false,
    messageCount: 15
  },
  smartExtraction: true,
  llm: {
    apiKey: "${OPENAI_API_KEY}",
    model: "gpt-4o-mini",
    baseURL: "https://api.openai.com/v1"
  },
  extractMinMessages: 2,
  extractMaxChars: 8000
}
```

</details>

<details>
<summary><strong>Provider di embedding</strong></summary>

Funziona con **API di embedding compatibili con OpenAI**, inclusi adapter di payload specifici per servizi come Jina e Voyage:

| Provider | Modello | Base URL | Dimensioni |
| --- | --- | --- | --- |
| **Jina** (consigliato) | `jina-embeddings-v5-text-small` | `https://api.jina.ai/v1` | 1024 |
| **OpenAI** | `text-embedding-3-small` | `https://api.openai.com/v1` | 1536 |
| **Voyage** | `voyage-4-lite` / `voyage-4` | `https://api.voyageai.com/v1` | 1024 / 1024 |
| **Google Gemini** | `gemini-embedding-001` | `https://generativelanguage.googleapis.com/v1beta/openai/` | 3072 |
| **Ollama** (locale) | `nomic-embed-text` | `http://localhost:11434/v1` | specifico del provider |

Le richieste di embedding Voyage usano la forma di payload `model` + `input` di Voyage. Quando `requestDimensions` è configurato, viene inviato come `output_dimension`; i campi solo-OpenAI come `encoding_format` vengono omessi.

Imposta `embedding.maxInputChars` per i server di embedding locali con limiti di contesto o batch ridotti. Il plugin applica un valore predefinito conservativo per `nomic-embed-text`; con lo chunking automatico abilitato, i documenti più lunghi vengono divisi prima che il limite venga applicato a ogni richiesta del provider.

</details>

<details>
<summary><strong>Provider di ri-rank</strong></summary>

Il ri-ranking cross-encoder supporta più provider tramite `rerankProvider`:

| Provider | `rerankProvider` | Modello di esempio |
| --- | --- | --- |
| **Jina** (predefinito) | `jina` | `jina-reranker-v3` |
| **SiliconFlow** (disponibile il piano gratuito) | `siliconflow` | `BAAI/bge-reranker-v2-m3` |
| **Voyage AI** | `voyage` | `rerank-2.5` |
| **Pinecone** | `pinecone` | `bge-reranker-v2-m3` |

Funziona anche qualsiasi endpoint di ri-rank compatibile con Jina — imposta `rerankProvider: "jina"` e punta `rerankEndpoint` al tuo servizio (es. Hugging Face TEI, DashScope `qwen3-rerank`).

</details>

<details>
<summary><strong>Estrazione intelligente (LLM) — v1.1.0</strong></summary>

Quando `smartExtraction` è abilitato (predefinito: `true`), il plugin usa un LLM per estrarre e classificare le memorie in modo intelligente invece dei trigger basati su regex.

| Campo | Tipo | Predefinito | Descrizione |
|-------|------|---------|-------------|
| `smartExtraction` | boolean | `true` | Abilita/disabilita l'estrazione LLM in 6 categorie |
| `llm.auth` | string | `api-key` | `api-key` usa `llm.apiKey` / `embedding.apiKey`; `oauth` usa per impostazione predefinita un file di token OAuth con ambito plugin |
| `llm.apiKey` | string | *(ripiega su `embedding.apiKey`)* | Chiave API per il provider LLM |
| `llm.model` | string | `openai/gpt-oss-120b` | Nome del modello LLM |
| `llm.baseURL` | string | *(ripiega su `embedding.baseURL`)* | Endpoint API LLM |
| `llm.oauthProvider` | string | `openai-codex` | ID del provider OAuth usato quando `llm.auth` è `oauth` |
| `llm.oauthPath` | string | `~/.pi/agent/.memory-lancedb-pro/oauth.json` | File di token OAuth usato quando `llm.auth` è `oauth` |
| `llm.timeoutMs` | number | `30000` | Timeout delle richieste LLM in millisecondi |
| `extractMinMessages` | number | `2` | Numero minimo di messaggi prima che scatti l'estrazione |
| `extractMaxChars` | number | `8000` | Numero massimo di caratteri inviati all'LLM |

Configurazione OAuth `llm` (usa una cache di login Codex / ChatGPT esistente per le chiamate LLM):

> **Nota:** i flussi OAuth sono ereditati dal plugin OpenClaw upstream. Su pi, `memory-pro auth login` richiama la stessa logica OAuth; il file di token è predefinito in `~/.pi/agent/.memory-lancedb-pro/oauth.json`.

```json5
{
  llm: {
    auth: "oauth",
    oauthProvider: "openai-codex",
    model: "gpt-5.4",
    oauthPath: "${HOME}/.pi/agent/.memory-lancedb-pro/oauth.json",
    timeoutMs: 30000
  }
}
```

Note per `llm.auth: "oauth"`:

- `llm.oauthProvider` è attualmente `openai-codex`.
- I token OAuth sono predefiniti in `~/.pi/agent/.memory-lancedb-pro/oauth.json`.
- Puoi impostare `llm.oauthPath` se vuoi archiviare quel file altrove.
- `auth login` salva un'istantanea della precedente configurazione `llm` con api-key accanto al file OAuth, e `auth logout` ripristina quell'istantanea quando disponibile.
- Il passaggio da `api-key` a `oauth` non trasferisce automaticamente `llm.baseURL`. Impostalo manualmente in modalità OAuth solo se vuoi intenzionalmente un backend compatibile ChatGPT/Codex personalizzato.

</details>

<details>
<summary><strong>Fallback CPU legacy</strong></summary>

Se un host Linux x64 solo-AVX crasha nella ricerca vettoriale nativa di LanceDB con `SIGILL`, disabilita il coseno nativo e lascia che memory-lancedb-pro scansiona le righe nell'ambito e le classifichi in JavaScript:

```json5
{
  retrieval: {
    disableNativeCosine: true
  }
}
```

Puoi anche impostare `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` per lo stesso comportamento.

</details>

<details>
<summary><strong>Configurazione del ciclo di vita (Decadimento + Livelli)</strong></summary>

| Campo | Predefinito | Descrizione |
|-------|---------|-------------|
| `decay.recencyHalfLifeDays` | `30` | Emivita di base per il decadimento di attualità Weibull |
| `decay.frequencyWeight` | `0.3` | Peso della frequenza di accesso nel punteggio composito |
| `decay.intrinsicWeight` | `0.3` | Peso di `importanza × confidenza` |
| `decay.betaCore` | `0.8` | Beta Weibull per le memorie `core` |
| `decay.betaWorking` | `1.0` | Beta Weibull per le memorie `working` |
| `decay.betaPeripheral` | `1.3` | Beta Weibull per le memorie `peripheral` |
| `tier.coreAccessThreshold` | `10` | Numero minimo di richiami prima della promozione a `core` |
| `tier.peripheralAgeDays` | `60` | Soglia di età per declassare le memorie obsolete |

</details>

<details>
<summary><strong>Rinforzo all'accesso</strong></summary>

Le memorie richiamate di frequente decadono più lentamente (stile spaced-repetition).

Chiavi di configurazione (sotto `retrieval`):
- `reinforcementFactor` (0-2, predefinito: `0.5`) — imposta `0` per disabilitare
- `maxHalfLifeMultiplier` (1-10, predefinito: `3`) — limite massimo rigido sull'emivita effettiva

</details>

---

## Comandi CLI

Il binario `memory-pro` è disponibile dopo `npm run build`:

```bash
npm link   # once, to expose the "memory-pro" bin globally
memory-pro list [--scope global] [--category fact] [--limit 20] [--json]
memory-pro search "query" [--scope global] [--limit 10] [--json]
memory-pro stats [--scope global] [--json]
memory-pro auth login [--provider openai-codex] [--model gpt-5.4] [--oauth-path /abs/path/oauth.json]
memory-pro auth status
memory-pro auth logout
memory-pro delete <id>
memory-pro delete-bulk --scope global [--before 2025-01-01] [--dry-run]
memory-pro export [--scope global] [--output memories.json]
memory-pro import memories.json [--scope global] [--dry-run]
memory-pro reembed --source-db /path/to/old-db [--batch-size 32] [--skip-existing]
memory-pro upgrade [--dry-run] [--batch-size 10] [--no-llm] [--limit N] [--scope SCOPE]
memory-pro migrate check|run|verify [--source /path]
```

All'interno di una sessione pi, la stessa superficie di gestione è disponibile come comando slash **`/memory-pro`**.

> La CLI legge lo stesso file di configurazione dell'estensione (`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `~/.pi/agent/memory-lancedb-pro.json`).

Flusso di login OAuth:

1. Esegui `memory-pro auth login`
2. Se `--provider` viene omesso in un terminale interattivo, la CLI mostra un selettore di provider OAuth prima di aprire il browser
3. Il comando stampa un URL di autorizzazione e apre il browser a meno che non sia impostato `--no-browser`
4. Dopo il successo del callback, il comando salva il file OAuth del plugin (predefinito: `~/.pi/agent/.memory-lancedb-pro/oauth.json`), salva un'istantanea della precedente configurazione `llm` con api-key per il logout e sostituisce la configurazione `llm` del plugin con le impostazioni OAuth (`auth`, `oauthProvider`, `model`, `oauthPath`)
5. `memory-pro auth logout` elimina quel file OAuth e ripristina la precedente configurazione `llm` con api-key quando quell'istantanea esiste

---

## Argomenti avanzati

<details>
<summary><strong>Aggiornamento da una versione precedente del port</strong></summary>

```bash
# 1) Backup
memory-pro export --scope global --output memories-backup.json
# 2) Dry run
memory-pro upgrade --dry-run
# 3) Run upgrade
memory-pro upgrade
# 4) Verify
memory-pro stats
```

Vedi `CHANGELOG-v1.1.0.md` per le modifiche di comportamento e le motivazioni dell'aggiornamento.

**Vuoi attivare i suggerimenti di task Jina su un database esistente?**

I suggerimenti di task sono due chiavi di configurazione sotto il blocco `embedding`:

```json5
{
  embedding: {
    model: "jina-embeddings-v5-text-small",
    taskQuery: "retrieval.query",
    taskPassage: "retrieval.passage"
  }
}
```

Interessano solo i vettori scritti *dopo* averli impostati. Le righe già presenti nel tuo archivio sono state incorporate senza suggerimento di task, quindi una query incorporata con `retrieval.query` viene confrontata con passaggi che vivono in uno spazio vettoriale diverso — ottieni silenziosamente circa la metà del beneficio.

Per correggere le righe esistenti, ri-incorpora in un **nuovo database e passa a quello**. **Non** ri-incorporare sul posto: `reembed` scrive ogni riga con `table.add()` (append per id, non replace), quindi un'esecuzione sul posto — esattamente ciò che `--force` sblocca — lascia il vecchio vettore accanto al nuovo e **raddoppia ogni riga**; i tentativi ne accumulano di più. Per questo motivo `reembed` rifiuta esecuzioni sullo stesso percorso a meno che tu non lo forzi.

```bash
# 0) Make sure no pi session is writing mid-migration.

# 1) Back up the whole store — a real filesystem copy of the LanceDB directory.
#    (Do NOT rely on `memory-pro export`: it defaults to --limit 1000 and a single
#    --scope, so it silently drops rows past 1000 and every non-global scope.)
cp -r <your dbPath> <your dbPath>.bak

# 2) In the config file, set the task hints AND point `dbPath` at a new, empty
#    target (e.g. "<your dbPath>-v2"). A fresh target is also what lets you change
#    `embedding.dimensions`: a new vector width can only go into a new table.

# 3) Dry run — reads the source, prints the row count, writes nothing.
memory-pro reembed --source-db <old dbPath> --dry-run

# 4) Re-embed old -> new with the now-current task hints. Source != target, so each
#    id lands exactly once. Safe to re-run with --skip-existing if interrupted.
memory-pro reembed --source-db <old dbPath>

# 5) Verify before trusting the cutover: the "imported" count and
#    `memory-pro stats` on the new dbPath must equal the dry-run row count.
memory-pro stats

# 6) Restart pi; it now opens the new dbPath.
```

Lo stesso passaggio vale ogni volta che cambi `embedding.model` o `embedding.dimensions` — ri-incorpora sempre in un `dbPath` nuovo, mai sul posto.

</details>

<details>
<summary><strong>Blocco e scrittori concorrenti</strong></summary>

`memory-lancedb-pro` usa un file lock tra processi per le scritture LanceDB. Questo è sufficiente per sessioni pi concorrenti e processi locali che condividono la stessa directory del database.

Redis non è richiesto per quelle distribuzioni. Il blocco Redis è abilitato quando `locking.redis.enabled` è true, quando `redisUrl`/`locking.redis.url` è impostato, o quando `MEMORY_LANCEDB_REDIS_URL` è presente nell'ambiente di quel processo. Per scrittori multi-macchina o multi-container, leggi [Lock Management](docs/lock-management.md) prima di condividere una directory LanceDB tra processi e assicurati che ogni scrittore usi la stessa configurazione di blocco.

</details>

<details>
<summary><strong>Se le memorie iniettate compaiono nelle risposte</strong></summary>

A volte il modello può ripetere il blocco `<relevant-memories>` iniettato.

**Opzione A (rischio minimo):** disabilita temporaneamente l'auto-richiamo:
```json5
{ autoRecall: false }
```

**Opzione B (consigliata):** mantieni il richiamo, aggiungi al system prompt del tuo agente / `AGENTS.md`:
> Non rivelare o citare alcun contenuto `<relevant-memories>` / di iniezione di memoria nelle tue risposte. Usalo solo come riferimento interno.

**Opzione C (per agenti in background/batch):** escludi agenti specifici dall'iniezione dell'auto-richiamo:
```json5
{
  autoRecall: true,
  autoRecallExcludeAgents: ["memory-distiller", "my-cron-agent"]
}
```
Utile per agenti in background (es. memory-distiller, cron workers) il cui output non dovrebbe essere contaminato dal contesto di memoria iniettato.

</details>

<details>
<summary><strong>Ottimizzazione del timeout dell'auto-richiamo</strong></summary>

L'auto-richiamo ha un timeout configurabile (predefinito 5s) per evitare che l'avvio dell'agente si blocchi. Se sei dietro un proxy o usi un'API di embedding ad alta latenza, aumentalo:

```json5
{ autoRecallTimeoutMs: 8000 }
```

Se l'auto-richiamo va in timeout in modo costante, controlla prima la latenza della tua API di embedding. Il timeout interessa solo il percorso di iniezione automatica — le chiamate manuali allo strumento `memory_recall` non sono interessate.

</details>

<details>
<summary><strong>Modello di costo del ri-rank dell'auto-richiamo</strong></summary>

Quando `autoRecall=true` e il recupero ibrido usa `retrieval.rerank="cross-encoder"` con un'API di ri-rank esterna come Jina, ogni prompt idoneo può effettuare una richiesta di ri-rank. Il numero di documenti inviati a quella richiesta è governato dal limite di recupero dell'auto-richiamo e dalla finestra di input di ri-rank del retriever, non direttamente da `retrieval.candidatePoolSize` o dal tetto di iniezione finale `autoRecallMaxItems`.

Ad esempio, con `autoRecallMaxItems: 3`, l'auto-richiamo chiede 6 elementi al recupero e il recupero ibrido può inviare fino a 12 candidati al ri-ranker esterno prima di iniettare al massimo 3 memorie. Per ridurre l'uso del ri-rank esterno, abbassa `autoRecallMaxItems` o `maxRecallPerTurn`, passa `retrieval.rerank` a `"lightweight"` o `"none"`, aumenta `autoRecallMinLength`, oppure tieni l'auto-richiamo disabilitato e usa `memory_recall` manuale dove appropriato.

I log di avvio avvisano quando auto-richiamo più ri-rank cross-encoder ibrido possono inviare più elementi al ri-ranker di quanti ne verranno iniettati. Le statistiche di debug dell'auto-richiamo includono i valori effettivi di `rerankInput`, `rerankInputLimit`, `retrieveLimit`, `rerank`, `rerankProvider` e il `retrievalCandidatePoolSize` configurato.

</details>

<details>
<summary><strong>Memoria di sessione</strong></summary>

- Attivata dagli eventi di nuova sessione — salva il riepilogo della sessione precedente in LanceDB
- Disabilitata per impostazione predefinita (pi persiste già le trascrizioni di sessione `.jsonl`)
- Conteggio messaggi configurabile (predefinito: 15)

</details>

<details>
<summary><strong>Comandi slash personalizzati (es. /lesson)</strong></summary>

Aggiungi al tuo `AGENTS.md` o al system prompt:

```markdown
## /lesson command
When the user sends `/lesson <content>`:
1. Use memory_store to save as category=fact (raw knowledge)
2. Use memory_store to save as category=decision (actionable takeaway)
3. Confirm what was saved

## /remember command
When the user sends `/remember <content>`:
1. Use memory_store to save with appropriate category and importance
2. Confirm with the stored memory ID
```

</details>

<details>
<summary><strong>Regole di ferro per agenti AI</strong></summary>

> Copia il blocco qui sotto nel tuo `AGENTS.md` così il tuo agente applica queste regole automaticamente.

```markdown
## Rule 1 — Dual-layer memory storage
Every pitfall/lesson learned → IMMEDIATELY store TWO memories:
- Technical layer: Pitfall: [symptom]. Cause: [root cause]. Fix: [solution]. Prevention: [how to avoid]
  (category: fact, importance >= 0.8)
- Principle layer: Decision principle ([tag]): [behavioral rule]. Trigger: [when]. Action: [what to do]
  (category: decision, importance >= 0.85)

## Rule 2 — LanceDB hygiene
Entries must be short and atomic (< 500 chars). No raw conversation summaries or duplicates.

## Rule 3 — Recall before retry
On ANY tool failure, ALWAYS memory_recall with relevant keywords BEFORE retrying.

## Rule 4 — Confirm target codebase
Confirm you are editing memory-lancedb-pro vs built-in memory-lancedb before changes.

## Rule 5 — Clear jiti cache after extension code changes
After modifying .ts files under the extension, MUST run rm -rf /tmp/jiti/ BEFORE restarting pi.
```

</details>

<details>
<summary><strong>Schema del database</strong></summary>

Tabella LanceDB `memories`:

| Campo | Tipo | Descrizione |
| --- | --- | --- |
| `id` | string (UUID) | Chiave primaria |
| `text` | string | Testo della memoria (indicizzato FTS) |
| `vector` | float[] | Vettore di embedding |
| `category` | string | Categoria di archiviazione: `preference` / `fact` / `decision` / `entity` / `reflection` / `other` |
| `scope` | string | Identificatore dello scope (es. `global`, `agent:main`) |
| `importance` | float | Punteggio di importanza 0-1 |
| `timestamp` | int64 | Timestamp di creazione (ms) |
| `metadata` | string (JSON) | Metadati estesi |

Chiavi `metadata` comuni in v1.1.0: `l0_abstract`, `l1_overview`, `l2_content`, `memory_category`, `tier`, `access_count`, `confidence`, `last_accessed_at`

> **Nota sulle categorie:** il campo `category` di primo livello usa 6 categorie di archiviazione. Le etichette semantiche delle 6 categorie dell'Estrazione intelligente (`profile` / `preferences` / `entities` / `events` / `cases` / `patterns`) sono archiviate in `metadata.memory_category`.

</details>

<details>
<summary><strong>Risoluzione dei problemi</strong></summary>

**L'estensione non si carica / "no config file found"**

Crea `~/.pi/agent/memory-lancedb-pro.json5` o imposta `$MEMORY_LANCEDB_PRO_CONFIG`. L'estensione stampa un avviso con la forma prevista e resta disabilitata — pi continua a funzionare.

**Init dell'estrazione intelligente fallito**

Controlla che `llm.apiKey` / `${ENV_VAR}` sia impostato; il plugin ripiega sull'estrazione regex invece di fallire.

**"Cannot mix BigInt and other types" (LanceDB / Apache Arrow)**

Su LanceDB 0.26+, alcune colonne numeriche possono essere restituite come `BigInt`. Aggiorna a **memory-lancedb-pro >= 1.0.14** — questo plugin ora converte i valori usando `Number(...)` prima dell'aritmetica.

</details>

---

## Architettura

```
┌─────────────────────────────────────────────────────────────┐
│        pi-adapter/index.ts (Pi entry point)                 │
│  config file → shim (pi events → OpenClaw hooks) → register │
└────────┬────────────────────────────────────────────────────┘
         │  pi-adapter/shim.ts adapts:
         │    pi.on(event)        → api.on / api.registerHook
         │    pi.registerTool     → api.registerTool
         │    pi.registerCommand  → api.registerCli (/memory-pro)
         │    pi CLI subprocess   → api.runtime.agent.runEmbeddedPiAgent
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   index.ts (Plugin Core, unchanged)         │
│  Plugin Registration · Config Parsing · Lifecycle Hooks     │
└────────┬──────────┬──────────┬──────────┬───────────────────┘
         │          │          │          │
    ┌────▼───┐ ┌────▼───┐ ┌───▼────┐ ┌──▼──────────┐
    │ store  │ │embedder│ │retriever│ │   scopes    │
    │ .ts    │ │ .ts    │ │ .ts    │ │    .ts      │
    └────────┘ └────────┘ └────────┘ └─────────────┘
         │                     │
    ┌────▼───┐           ┌─────▼──────────┐
    │migrate │           │noise-filter.ts │
    │ .ts    │           │adaptive-       │
    └────────┘           │retrieval.ts    │
                         └────────────────┘
    ┌─────────────┐   ┌──────────┐
    │  tools.ts   │   │  cli.ts  │
    │ (Agent API) │   │ (CLI)    │
    └─────────────┘   └──────────┘
```

> Per un'analisi approfondita dell'architettura completa, vedi [docs/memory_architecture_analysis.md](docs/memory_architecture_analysis.md).

<details>
<summary><strong>Riferimento file (clicca per espandere)</strong></summary>

| File | Scopo |
| --- | --- |
| `pi-adapter/index.ts` | Punto di ingresso di pi: carica il file di configurazione, costruisce lo shim dell'API OpenClaw, registra il nucleo del plugin |
| `pi-adapter/shim.ts` | Mappa gli eventi / strumenti / comandi del ciclo di vita di pi sull'API del plugin OpenClaw |
| `pi-adapter/config.ts` | Caricamento del file di configurazione (`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `.json`) |
| `pi-adapter/paths.ts` | Risoluzione dei percorsi di pi (`~/.pi/agent`, override di ambiente) |
| `pi-adapter/pi-runner.ts` | Runner di sotto-agenti incorporato tramite `pi --mode json --no-tools ...` |
| `pi-adapter/cli-main.ts` | Punto di ingresso CLI `memory-pro` autonomo |
| `index.ts` | Punto di ingresso del nucleo del plugin: parsing della configurazione, hook del ciclo di vita, registrazione della capacità di memoria |
| `src/store.ts` | Livello di archiviazione LanceDB. Creazione tabelle / indicizzazione FTS / ricerca vettoriale / ricerca BM25 / CRUD |
| `src/embedder.ts` | Astrazione degli embedding. Compatibile con qualsiasi provider API compatibile con OpenAI |
| `src/retriever.ts` | Motore di recupero ibrido. Vettore + BM25 → Fusione ibrida → Ri-rank → Decadimento del ciclo di vita → Filtro |
| `src/scopes.ts` | Controllo degli accessi multi-scope |
| `src/tools.ts` | Definizioni degli strumenti dell'agente: `memory_recall`, `memory_store`, `memory_forget`, `memory_update` + strumenti di gestione |
| `src/noise-filter.ts` | Filtra i rifiuti dell'agente, le meta-domande, i saluti e i contenuti di bassa qualità |
| `src/adaptive-retrieval.ts` | Determina se una query ha bisogno del recupero di memoria |
| `src/migrate.ts` | Migrazione dal `memory-lancedb` integrato a Pro |
| `src/smart-extractor.ts` | Estrazione LLM in 6 categorie con archiviazione a livelli L0/L1/L2 e deduplicazione a due stadi |
| `src/decay-engine.ts` | Modello di decadimento esponenziale allungato Weibull |
| `src/tier-manager.ts` | Promozione/declassamento a tre livelli: Peripheral ↔ Working ↔ Core |

</details>

---

## Appendice upstream OpenClaw

Questo repository è un port. Il progetto upstream è **[CortexReach/memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)** — un plugin OpenClaw. Tutto ciò che segue documenta l'uso upstream di OpenClaw; gli utenti pi non ne hanno bisogno.

### Cosa è cambiato (differenze del port)

| Area | OpenClaw (upstream) | Pi (questo port) |
|---|---|---|
| Avvio dell'estensione | `openclaw.plugin.json` / `openclaw.extensions` | `pi-adapter/index.ts` → compilato in `dist/pi-adapter/index.js`, dichiarato tramite `pi.extensions` in `package.json` |
| File di configurazione | Voce plugin in `openclaw.json` | `~/.pi/agent/memory-lancedb-pro.json5` (o `$MEMORY_LANCEDB_PRO_CONFIG`) — stessa forma del documento |
| Directory base di dati e sessioni | `~/.openclaw/...` | `~/.pi/agent/...` (override con `PI_CODING_AGENT_DIR` / `PI_AGENT_DIR`) |
| CLI | `openclaw memory-pro …` | Binario autonomo: `memory-pro …` (compilato da `pi-adapter/cli-main.ts`) |
| Comando slash | CLI registrata tramite `openclaw` | `pi.registerCommand("/memory-pro", ...)` tramite lo shim |
| Runner di sotto-agenti incorporato | API runtime OpenClaw | Richiama `pi --mode json --no-tools …` (`pi-adapter/pi-runner.ts`) |
| Struttura delle sessioni | `~/.openclaw/agents/<id>/sessions/*.jsonl` | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| Versione | `1.1.0-beta.11` | `1.1.0-beta.11-pi.1` |

Gli eventi del ciclo di vita sono mappati dagli eventi di pi agli hook OpenClaw tramite `pi-adapter/shim.ts`: `input`, `session_start`, `before_agent_start`, `agent_end`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`. Gli strumenti del plugin (`memory_store`, `memory_recall`, …) e il comando slash `/memory-pro` si registrano attraverso lo shim senza modifiche.

### Avvio rapido upstream (solo OpenClaw)

```bash
# via OpenClaw CLI (recommended)
openclaw plugins install memory-lancedb-pro@beta

# or via npm
npm i memory-lancedb-pro@beta
# then add the plugin's install directory as an absolute path in plugins.load.paths
```

```json
{
  "plugins": {
    "slots": { "memory": "memory-lancedb-pro" },
    "entries": {
      "memory-lancedb-pro": {
        "enabled": true,
        "config": { "autoCapture": true, "autoRecall": true, "smartExtraction": true }
      }
    }
  }
}
```

I comandi upstream usano il prefisso `openclaw memory-pro ...`. Vedi il [README upstream](https://github.com/CortexReach/memory-lancedb-pro) per la documentazione OpenClaw completa.

### Ecosistema upstream

- **[Setup script](https://github.com/CortexReach/toolbox/tree/main/memory-lancedb-pro-setup)** — installazione/aggiornamento/riparazione in un clic per distribuzioni OpenClaw (scrive `openclaw.json`)
- **[AI-guided config skill](https://github.com/CortexReach/memory-lancedb-pro-skill)** — per agenti Claude Code / OpenClaw
- **Video tutorial** — [YouTube](https://youtu.be/MtukF1C8epQ) · [Bilibili](https://www.bilibili.com/video/BV1zUf2BGEgn/)
- **Storia delle stelle** — [star-history.com](https://star-history.com/#CortexReach/memory-lancedb-pro&Date)

---

## Documentazione

| Documento | Descrizione |
| --- | --- |
| [Memory Architecture Analysis](docs/memory_architecture_analysis.md) | Analisi approfondita dell'architettura completa |
| [CHANGELOG v1.1.0](docs/CHANGELOG-v1.1.0.md) | Modifiche di comportamento della v1.1.0 e motivazioni dell'aggiornamento |
| [Release Checklist](docs/release-checklist.md) | Preflight del pacchetto, dry run della pubblicazione e smoke check post-pubblicazione |
| [Long-Context Chunking](docs/long-context-chunking.md) | Strategia di chunking per documenti lunghi |
| [Lock Management](docs/lock-management.md) | Dettagli sul blocco multi-scrittore (Redis) |

## Test

```bash
npm test                       # full unit/e2e suite
node scripts/run-ci-tests.mjs --all   # full CI manifest
npm run test:pi-adapter        # pi adapter smoke test (mock pi API)
```

Tutti i test upstream sono conservati; `test/pi-adapter-smoke.test.mjs` e `test:pi-adapter` sono nuovi.

---

## Beta: Smart Memory v1.1.0

> Stato: Beta — disponibile tramite `npm i memory-lancedb-pro@beta`. Gli utenti stabili su `latest` non sono interessati.

| Funzione | Descrizione |
|---------|-------------|
| **Estrazione intelligente** | Estrazione LLM in 6 categorie con metadati L0/L1/L2. Ripiega sulle regex quando disabilitata. |
| **Scoring del ciclo di vita** | Decadimento Weibull integrato nel recupero — le memorie ad alta frequenza e alta importanza ottengono un ranking più alto. |
| **Gestione dei livelli** | Sistema a tre livelli (Core → Working → Peripheral) con promozione/declassamento automatici. |

Feedback: [GitHub Issues](https://github.com/CortexReach/memory-lancedb-pro/issues) · Ripristina: `npm i memory-lancedb-pro@latest`

---

## Dipendenze

| Pacchetto | Scopo |
| --- | --- |
| `@lancedb/lancedb` ≥0.26.2 | Database vettoriale (ANN + FTS) |
| `openai` ≥6.21.0 | Client API di embedding compatibile con OpenAI |
| `@sinclair/typebox` 0.34.48 | Definizioni di tipo JSON Schema |

---

## Contributori

Manutentori e contributori upstream (vedi l'[elenco completo](https://github.com/CortexReach/memory-lancedb-pro/graphs/contributors)):

<p>
<a href="https://github.com/win4r"><img src="https://avatars.githubusercontent.com/u/42172631?v=4" width="48" height="48" alt="@win4r" /></a>
<a href="https://github.com/kctony"><img src="https://avatars.githubusercontent.com/u/1731141?v=4" width="48" height="48" alt="@kctony" /></a>
<a href="https://github.com/Akatsuki-Ryu"><img src="https://avatars.githubusercontent.com/u/8062209?v=4" width="48" height="48" alt="@Akatsuki-Ryu" /></a>
<a href="https://github.com/JasonSuz"><img src="https://avatars.githubusercontent.com/u/612256?v=4" width="48" height="48" alt="@JasonSuz" /></a>
<a href="https://github.com/Minidoracat"><img src="https://avatars.githubusercontent.com/u/11269639?v=4" width="48" height="48" alt="@Minidoracat" /></a>
<a href="https://github.com/furedericca-lab"><img src="https://avatars.githubusercontent.com/u/263020793?v=4" width="48" height="48" alt="@furedericca-lab" /></a>
<a href="https://github.com/joe2643"><img src="https://avatars.githubusercontent.com/u/19421931?v=4" width="48" height="48" alt="@joe2643" /></a>
<a href="https://github.com/AliceLJY"><img src="https://avatars.githubusercontent.com/u/136287420?v=4" width="48" height="48" alt="@AliceLJY" /></a>
<a href="https://github.com/chenjiyong"><img src="https://avatars.githubusercontent.com/u/8199522?v=4" width="48" height="48" alt="@chenjiyong" /></a>
</p>

## Licenza

MIT
