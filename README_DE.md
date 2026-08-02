<div align="center">

# 🧠 memory-lancedb-pro · π Pi Coding Agent Extension

**KI-Speicher-Assistent für den [pi coding agent](https://github.com/earendil-works/pi)**

*Gib deinem KI-Agenten ein Gehirn, das sich wirklich erinnert — über Sitzungen, über Projekte, über Zeit hinweg.*

Eine auf LanceDB basierende Speichererweiterung für pi, die Präferenzen, Entscheidungen und Projektkontext speichert und sie in zukünftigen Sitzungen automatisch wieder abruft.

[![Pi Extension](https://img.shields.io/badge/Pi-Extension-blue)](https://github.com/earendil-works/pi)
[![Pi 0.80+](https://img.shields.io/badge/pi-0.80%2B-brightgreen)](https://github.com/earendil-works/pi)
[![LanceDB](https://img.shields.io/badge/LanceDB-Vectorstore-orange)](https://lancedb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) | [简体中文](README_CN.md) | [繁體中文](README_TW.md) | [日本語](README_JA.md) | [한국어](README_KO.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Deutsch](README_DE.md) | [Italiano](README_IT.md) | [Русский](README_RU.md) | [Português (Brasil)](README_PT-BR.md)

</div>

---

## 🤖 Über diesen Port

Dieses Repository ist ein **Port des Pi Coding-Agenten** des produktionsreifen Speicher-Plugins [memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro) (MIT). Der gesamte OpenClaw-Plugin-Kern ist unverändert und lädt unverändert über einen schlanken Adapter (`pi-adapter/`), sodass pi (≥ 0.80) dieselbe LanceDB-basierte Speicher-Engine mit minimaler Abweichung vom Upstream erhält.

> Alles unten dokumentiert die pi-Erfahrung. Siehe den [OpenClaw-Upstream-Anhang](#openclaw-upstream-anhang) unten für die Port-Unterschiede-Tabelle und die ursprüngliche OpenClaw-Nutzung.

---

## Warum memory-lancedb-pro?

Die meisten KI-Agenten haben Amnesie. Sie vergessen alles in dem Moment, in dem du einen neuen Chat startest.

**memory-lancedb-pro** ist eine produktionsreife Langzeitspeicher-Erweiterung, die deinen Agenten in einen **KI-Speicher-Assistenten** verwandelt — sie erfasst automatisch, was zählt, lässt Rauschen natürlich verblassen und ruft die richtige Erinnerung zur richtigen Zeit ab. Kein manuelles Tagging, keine Konfigurationskopfschmerzen.

### Dein KI-Speicher-Assistent in Aktion

**Ohne Speicher — jede Sitzung beginnt bei null:**

> **Du:** „Verwende Tabs für die Einrückung, füge immer Fehlerbehandlung hinzu."
> *(nächste Sitzung)*
> **Du:** „Ich habe es dir doch gesagt — Tabs, keine Leerzeichen!" 😤
> *(nächste Sitzung)*
> **Du:** „...wirklich, Tabs. Und Fehlerbehandlung. Schon wieder."

**Mit memory-lancedb-pro — dein Agent lernt und erinnert sich:**

> **Du:** „Verwende Tabs für die Einrückung, füge immer Fehlerbehandlung hinzu."
> *(nächste Sitzung — der Agent ruft deine Präferenzen automatisch ab)*
> **Agent:** *(wendet stillschweigend Tabs + Fehlerbehandlung an)* ✅
> **Du:** „Warum haben wir uns letzten Monat für PostgreSQL statt MongoDB entschieden?"
> **Agent:** „Aufgrund unserer Diskussion vom 12. Februar waren die Hauptgründe..." ✅

Genau das macht ein **KI-Speicher-Assistent** aus — er lernt deinen Stil, ruft vergangene Entscheidungen ab und liefert personalisierte Antworten, ohne dass du dich wiederholen musst.

### Was kann er noch?

| | Was du bekommst |
|---|---|
| **Automatische Erfassung** | Dein Agent lernt aus jedem Gespräch — kein manuelles `memory_store` nötig |
| **Intelligente Extraktion** | LLM-gestützte Klassifizierung in 6 Kategorien: Profile, Präferenzen, Entitäten, Ereignisse, Fälle, Muster |
| **Intelligentes Vergessen** | Weibull-Abklingmodell — wichtige Erinnerungen bleiben, Rauschen verblasst natürlich |
| **Hybrider Abruf** | Vektor- + BM25-Volltextsuche, fusioniert mit Cross-Encoder-Reranking |
| **Kontext-Injektion** | Relevante Erinnerungen erscheinen automatisch vor jeder Antwort |
| **Multi-Scope-Isolation** | Speichergrenzen pro Agent, pro Benutzer, pro Projekt |
| **Beliebiger Anbieter** | OpenAI, Jina, Gemini, Ollama oder jede OpenAI-kompatible API |
| **Vollständiges Toolkit** | CLI, Backup, Migration, Upgrade, Export/Import — produktionsreif |

---

## Schnellstart

> **CPU-Anforderung:** Deine CPU muss **AVX**-Anweisungen unterstützen. Die native Vektorsuche von LanceDB kann auf manchen Linux-x64-Builds **AVX2** erfordern und auf CPUs mit nur AVX mit `SIGILL` abstürzen; setze `retrieval.disableNativeCosine: true` oder `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1`, um einen begrenzten Zeilenscan plus JavaScript-Kosinus-Ranking zu verwenden. Prüfe die CPU-Flags mit: `grep -o 'avx[^ ]*' /proc/cpuinfo | head -1` (keine Ausgabe = nicht unterstützt). Siehe [#419](https://github.com/CortexReach/memory-lancedb-pro/issues/419) und [#644](https://github.com/CortexReach/memory-lancedb-pro/issues/644) für Details.

### 1. Erweiterung bauen

```bash
git clone https://github.com/lhxyzCJ/TestForPi-memory-lancedb-pro
cd TestForPi-memory-lancedb-pro && npm install && npm run build
```

Der pi-Einstiegspunkt ist `dist/pi-adapter/index.js` (kompiliert aus `pi-adapter/index.ts`).

### 2. Erweiterung registrieren

Wähle eine der folgenden Optionen:

**A. Über die pi-Einstellungsdatei (global, alle Projekte):**

Füge zu `~/.pi/agent/settings.json` hinzu:

```json
{
  "extensions": [
    "/absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js"
  ]
}
```

**B. Über den pi-Paketmanager:**

```bash
pi install /absolute/path/to/TestForPi-memory-lancedb-pro
```

**C. Schnelltest für eine Sitzung:**

```bash
pi -e /absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js
```

**D. Automatische Erkennung (ohne Einstellungsänderung):** Lege die gebaute Erweiterung (oder eine `package.json` mit einem `pi.extensions`-Feld) in `~/.pi/agent/extensions/` (global) oder `.pi/extensions/` (projektlokal) ab und starte pi neu.

### 3. Konfigurationsdatei erstellen

Erstelle `~/.pi/agent/memory-lancedb-pro.json5` (du kannst auch `.json` verwenden oder mit `$MEMORY_LANCEDB_PRO_CONFIG` auf einen beliebigen Pfad zeigen):

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

> Die Form des Konfigurationsdokuments ist identisch mit dem Upstream-OpenClaw-Plugin-Eintrag — sowohl das nackte innere Objekt oben als auch ein `{ "config": { ... } }`-Wrapper werden akzeptiert.

### 4. Verifizieren

Starte eine pi-Sitzung und prüfe das Startprotokoll:

```
memory-lancedb-pro: smart extraction enabled
memory-lancedb-pro@...: plugin registered (db: /root/.pi-agent/memory/lancedb-pro, ...)
```

Bitte deinen Agenten dann, etwas zu speichern und abzurufen:

> **Du:** „Merke dir: Ich bevorzuge Tabs gegenüber Leerzeichen."
> **Du:** „Was sind meine Einrückungspräferenzen?"

### Warum diese Standardeinstellungen?

- `autoCapture` + `smartExtraction` → dein Agent lernt automatisch aus jedem Gespräch
- `autoRecall` → relevante Erinnerungen werden vor jeder Antwort eingefügt
- `extractMinMessages: 2` → die Extraktion wird in normalen Zwei-Runden-Chats ausgelöst
- `sessionMemory.enabled: false` → verhindert, dass der Abruf am ersten Tag mit Sitzungszusammenfassungen verunreinigt wird

---

## ⚠️ Speicher-Architektur (Wichtig)

Die Erweiterung stellt eine Speicherfunktion mit zwei koordinierten Speichern bereit:

| Speicherebene | Speicherung | Wofür es dient | Abrufbar? |
|---|---|---|---|
| **Plugin-Speicher** | LanceDB (Vektorspeicher) | Semantischer Abruf über `memory_recall` / Auto-Recall | ✅ Ja |
| **Kanonisches Korpus** | `MEMORY.md`, `memory/**/*.md`, aktuelle Sitzungstranskripte, `memory/dreaming/**/*.md` | Quell-der-Wahrheit-Dateien und öffentliche Artefakte | ✅ Über den semantischen LanceDB-Index, wenn `canonicalCorpus.enabled` true ist |

**Kernprinzip:**
> Kanonische Dateien bleiben die Quelle der Wahrheit. LanceDB ist der semantische Index, mit dem sie mit fundierten Pfaden, Zeilenbereichen, Ausschnitten und Zitaten abgerufen werden.

**Was das für dich bedeutet:**
- Brauchst du semantischen Abruf? → Verwende `memory_store` oder lass die automatische Erfassung das übernehmen
- `memory/YYYY-MM-DD.md` → als **Tagesjournal / Protokoll** behandeln, das auch für die semantische Suche indexiert werden kann
- `MEMORY.md` → kuratierte, menschenlesbare Referenz, die als kanonischer Kontext indexiert werden kann
- `memory/dreaming/**/*.md` → Traum-Berichte, die als öffentliche Artefakte verfügbar und als Reflexionskontext indexiert werden
- Sitzungs-JSONL-Transkripte → indexiert als `source: "sessions"`, wenn `canonicalCorpus.includeSessionTranscripts` aktiviert ist
- Plugin-Speicher → primärer Schreibpfad für dauerhafte Fakten, Präferenzen, Entscheidungen und automatisch erfasste Erinnerungen

### Wo die Daten liegen (pi)

| Was | Pfad |
|---|---|
| Plugin-Datenbank (LanceDB) | `~/.pi/agent/memory/lancedb-pro` (oder `$MEMORY_LANCEDB_PRO_DB_PATH`) |
| Markdown-Spiegel | `~/.pi/agent/memory/md-mirror` (oder `$MEMORY_LANCEDB_PRO_MD_MIRROR_DIR`) |
| Sitzungstranskripte | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| Globale Skills | `~/.pi/agent/skills` |

Das Basisverzeichnis ist `~/.pi/agent`; überschreibe es mit `PI_CODING_AGENT_DIR` oder `PI_AGENT_DIR`. Relative Pfade in der Konfiguration (`dbPath`, `mdMirrorDir`, ...) werden relativ zum pi-Agent-Homeverzeichnis aufgelöst.

### Speicherorte der Konfigurationsdatei (in Prioritätsreihenfolge)

1. `$MEMORY_LANCEDB_PRO_CONFIG` (expliziter Pfad)
2. `~/.pi/agent/memory-lancedb-pro.json5`
3. `~/.pi/agent/memory-lancedb-pro.json`

Wenn keine Konfigurationsdatei gefunden wird, protokolliert die Erweiterung eine Warnung und bleibt deaktiviert — eine defekte oder fehlende Konfiguration beendet die pi-Sitzung nie.

---

## Kernfunktionen

### Hybrider Abruf

```
Query → embedQuery() ─┐
                       ├─→ Hybrid Fusion → Rerank → Lifecycle Decay Boost → Length Norm → Filter
Query → BM25 FTS ─────┘
```

- **Vektorsuche** — semantische Ähnlichkeit über LanceDB ANN (Kosinus-Distanz)
- **BM25-Volltextsuche** — exakte Stichwortübereinstimmung über den LanceDB-FTS-Index
- **Hybride Fusion** — Vektor-Score als Basis, BM25-Treffer erhalten einen gewichteten Boost (kein Standard-RRF — auf die Qualität des Abrufs in der Praxis abgestimmt)
- **Konfigurierbare Gewichte** — `vectorWeight`, `bm25Weight`, `minScore`

### Cross-Encoder-Reranking

- Integrierte Adapter für **Jina**, **SiliconFlow**, **Voyage AI** und **Pinecone**
- Kompatibel mit jedem Jina-kompatiblen Endpunkt (z. B. Hugging Face TEI, DashScope)
- Hybrides Scoring: 60 % Cross-Encoder + 40 % ursprünglicher fusionierter Score
- Sanfte Degradierung: fällt bei API-Fehlern auf Kosinus-Ähnlichkeit zurück

### Mehrstufige Scoring-Pipeline

| Stufe | Wirkung |
| --- | --- |
| **Hybride Fusion** | Kombiniert semantischen und exakten Abruf |
| **Cross-Encoder-Rerank** | Hebt semantisch präzise Treffer hervor |
| **Lebenszyklus-Abkling-Boost** | Weibull-Aktualität + Zugriffshäufigkeit + Wichtigkeit × Konfidenz |
| **Längennormalisierung** | Verhindert, dass lange Einträge dominieren (Anker: 500 Zeichen) |
| **Harter Mindest-Score** | Entfernt irrelevante Ergebnisse (Standard: 0.35) |
| **MMR-Diversität** | Kosinus-Ähnlichkeit > 0.85 → herabgestuft |

### Intelligente Speicherextraktion (v1.1.0)

- **LLM-gestützte 6-Kategorien-Extraktion**: Profile, Präferenzen, Entitäten, Ereignisse, Fälle, Muster
- **L0/L1/L2-Schichtspeicherung**: L0 (Ein-Satz-Index) → L1 (strukturierte Zusammenfassung) → L2 (vollständige Erzählung)
- **Zweistufige Deduplizierung**: Vektor-Ähnlichkeits-Vorfilter (≥0.7) → LLM-semantische Entscheidung (CREATE/MERGE/SKIP)
- **Kategoriebewusstes Zusammenführen**: `profile` wird immer zusammengeführt, `events`/`cases` sind nur anhängbar (append-only)

### Verwaltung des Speicherlebenszyklus (v1.1.0)

- **Weibull-Abkling-Engine**: zusammengesetzter Score = Aktualität + Häufigkeit + intrinsischer Wert
- **Drei-Ebenen-Promotion**: `Peripheral ↔ Working ↔ Core` mit konfigurierbaren Schwellenwerten
- **Zugriffsverstärkung**: häufig abgerufene Erinnerungen klingen langsamer ab (im Stil der verteilten Wiederholung)
- **Wichtigkeitsmodulierte Halbwertszeit**: wichtige Erinnerungen klingen langsamer ab

### Multi-Scope-Isolation

- Integrierte Scopes: `global`, `agent:<id>`, `custom:<name>`, `project:<id>`, `user:<id>`
- Zugriffskontrolle auf Agentenebene über `scopes.agentAccess`
- Standard: jeder Agent greift auf `global` + seinen eigenen `agent:<id>`-Scope zu
- Schreibgeschützte Tools wie `memory_recall`, `memory_search`, `memory_list` und `memory_debug` schlagen weich fehl, wenn ein angeforderter Scope nicht zugänglich ist: Sie durchsuchen stattdessen die zugänglichen Scopes des Aufrufers und geben `ignoredScope` plus `accessibleScopes` in den Details zurück. Schreib- und Mutations-Tools geben für unzugängliche Scopes weiterhin `scope_access_denied` zurück.

### Automatische Erfassung & Auto-Recall

- **Auto-Capture** (`agent_end`): extrahiert Präferenzen/Fakten/Entscheidungen/Entitäten aus Gesprächen, dedupliziert und speichert bis zu 3 pro Runde
- **Auto-Recall** (vor jedem Prompt-Aufbau): fügt `<relevant-memories>`-Kontext ein (bis zu 3 Einträge)

> **Hinweis:** Unter pi werden diese OpenClaw-Hooks (`agent_end`, `before_prompt_build`, ...) von `pi-adapter/shim.ts` aus pi-Lebenszyklusereignissen (`agent_end`, `input`, `session_start`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`) abgebildet.

### Rauschfilterung & adaptiver Abruf

- Filtert minderwertige Inhalte: Ablehnungen des Agenten, Meta-Fragen, Begrüßungen
- Überspringt den Abruf bei Begrüßungen, Slash-Befehlen, einfachen Bestätigungen, Emojis
- Erzwingt den Abruf bei Speicher-Schlüsselwörtern („remember", „previously", „last time")
- CJK-bewusste Schwellenwerte (Chinesisch: 6 Zeichen vs. Englisch: 15 Zeichen)

---

<details>
<summary><strong>Vergleich mit dem integrierten <code>memory-lancedb</code> (zum Erweitern klicken)</strong></summary>

| Funktion | Integriertes `memory-lancedb` | **memory-lancedb-pro** |
| --- | :---: | :---: |
| Vektorsuche | Ja | Ja |
| BM25-Volltextsuche | - | Ja |
| Hybride Fusion (Vektor + BM25) | - | Ja |
| Cross-Encoder-Rerank (Multi-Anbieter) | - | Ja |
| Aktualitäts-Boost & Zeit-Abklingen | - | Ja |
| Längennormalisierung | - | Ja |
| MMR-Diversität | - | Ja |
| Multi-Scope-Isolation | - | Ja |
| Rauschfilterung | - | Ja |
| Adaptiver Abruf | - | Ja |
| Verwaltungs-CLI | - | Ja |
| Sitzungsspeicher | - | Ja |
| Aufgabenbewusste Einbettungen | - | Ja |
| **LLM-Intelligente-Extraktion (6 Kategorien)** | - | Ja (v1.1.0) |
| **Weibull-Abklingen + Ebenen-Promotion** | - | Ja (v1.1.0) |
| Beliebiges OpenAI-kompatibles Embedding | Eingeschränkt | Ja |

</details>

---

## Konfiguration

Die gesamte Konfiguration befindet sich in `~/.pi/agent/memory-lancedb-pro.json5` (oder `$MEMORY_LANCEDB_PRO_CONFIG`).

API-Schlüsselfelder (`embedding.apiKey`, `retrieval.rerankApiKey` und `llm.apiKey`) akzeptieren einfache Zeichenketten, `${ENV_VAR}`-Platzhalter oder SecretRef-Objekte. Dieses Plugin unterstützt die SecretRef-Quellen `env` und `file`:

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

Bei `source: "file"` wird `id` relativ zum pi-Agent-Homeverzeichnis aufgelöst und als UTF-8-Datei gelesen. Das optionale Feld `provider` wird aus Kompatibilitätsgründen mit der SecretRef-Objektform akzeptiert, aber nicht für die Anbieterauswahl verwendet. `exec` und andere SecretRef-Quellen werden von der Laufzeit-Konfigurationsvalidierung abgelehnt.

<details>
<summary><strong>Vollständiges Konfigurationsbeispiel</strong></summary>

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
<summary><strong>Embedding-Anbieter</strong></summary>

Funktioniert mit **OpenAI-kompatiblen Embedding-APIs**, einschließlich anbieterspezifischer Payload-Adapter für Dienste wie Jina und Voyage:

| Anbieter | Modell | Base-URL | Dimensionen |
| --- | --- | --- | --- |
| **Jina** (empfohlen) | `jina-embeddings-v5-text-small` | `https://api.jina.ai/v1` | 1024 |
| **OpenAI** | `text-embedding-3-small` | `https://api.openai.com/v1` | 1536 |
| **Voyage** | `voyage-4-lite` / `voyage-4` | `https://api.voyageai.com/v1` | 1024 / 1024 |
| **Google Gemini** | `gemini-embedding-001` | `https://generativelanguage.googleapis.com/v1beta/openai/` | 3072 |
| **Ollama** (lokal) | `nomic-embed-text` | `http://localhost:11434/v1` | anbieterspezifisch |

Voyage-Embedding-Anfragen verwenden die `model`- + `input`-Payload-Form von Voyage. Wenn `requestDimensions` konfiguriert ist, wird es als `output_dimension` gesendet; reine OpenAI-Felder wie `encoding_format` werden weggelassen.

Setze `embedding.maxInputChars` für lokale Embedding-Server mit kleinen Kontext- oder Batch-Limits. Das Plugin wendet für `nomic-embed-text` einen konservativen Standardwert an; bei aktiviertem automatischem Chunking werden längere Dokumente aufgeteilt, bevor das Limit auf jede Anbieteranfrage angewendet wird.

</details>

<details>
<summary><strong>Rerank-Anbieter</strong></summary>

Cross-Encoder-Reranking unterstützt mehrere Anbieter über `rerankProvider`:

| Anbieter | `rerankProvider` | Beispielmodell |
| --- | --- | --- |
| **Jina** (Standard) | `jina` | `jina-reranker-v3` |
| **SiliconFlow** (kostenloses Kontingent verfügbar) | `siliconflow` | `BAAI/bge-reranker-v2-m3` |
| **Voyage AI** | `voyage` | `rerank-2.5` |
| **Pinecone** | `pinecone` | `bge-reranker-v2-m3` |

Jeder Jina-kompatible Rerank-Endpunkt funktioniert ebenfalls — setze `rerankProvider: "jina"` und richte `rerankEndpoint` auf deinen Dienst (z. B. Hugging Face TEI, DashScope `qwen3-rerank`).

</details>

<details>
<summary><strong>Intelligente Extraktion (LLM) — v1.1.0</strong></summary>

Wenn `smartExtraction` aktiviert ist (Standard: `true`), verwendet das Plugin ein LLM, um Erinnerungen intelligent zu extrahieren und zu klassifizieren, anstatt regex-basierte Auslöser zu verwenden.

| Feld | Typ | Standard | Beschreibung |
|-------|------|---------|-------------|
| `smartExtraction` | boolean | `true` | LLM-gestützte 6-Kategorien-Extraktion aktivieren/deaktivieren |
| `llm.auth` | string | `api-key` | `api-key` verwendet `llm.apiKey` / `embedding.apiKey`; `oauth` verwendet standardmäßig eine Plugin-spezifische OAuth-Token-Datei |
| `llm.apiKey` | string | *(fällt auf `embedding.apiKey` zurück)* | API-Schlüssel für den LLM-Anbieter |
| `llm.model` | string | `openai/gpt-oss-120b` | Name des LLM-Modells |
| `llm.baseURL` | string | *(fällt auf `embedding.baseURL` zurück)* | LLM-API-Endpunkt |
| `llm.oauthProvider` | string | `openai-codex` | OAuth-Anbieter-ID, die verwendet wird, wenn `llm.auth` `oauth` ist |
| `llm.oauthPath` | string | `~/.pi/agent/.memory-lancedb-pro/oauth.json` | OAuth-Token-Datei, die verwendet wird, wenn `llm.auth` `oauth` ist |
| `llm.timeoutMs` | number | `30000` | LLM-Anfrage-Timeout in Millisekunden |
| `extractMinMessages` | number | `2` | Mindestanzahl von Nachrichten, bevor die Extraktion ausgelöst wird |
| `extractMaxChars` | number | `8000` | Maximale Zeichenzahl, die an das LLM gesendet wird |

OAuth-`llm`-Konfiguration (verwende einen vorhandenen Codex-/ChatGPT-Anmeldecache für LLM-Aufrufe):

> **Hinweis:** Die OAuth-Abläufe stammen aus dem Upstream-OpenClaw-Plugin. Unter pi ruft `memory-pro auth login` dieselbe OAuth-Logik auf; die Token-Datei liegt standardmäßig unter `~/.pi/agent/.memory-lancedb-pro/oauth.json`.

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

Hinweise zu `llm.auth: "oauth"`:

- `llm.oauthProvider` ist derzeit `openai-codex`.
- OAuth-Tokens liegen standardmäßig unter `~/.pi/agent/.memory-lancedb-pro/oauth.json`.
- Du kannst `llm.oauthPath` setzen, wenn du diese Datei woanders speichern möchtest.
- `auth login` sichert die vorherige `llm`-Konfiguration mit api-key neben der OAuth-Datei, und `auth logout` stellt diesen Schnappschuss wieder her, wenn er verfügbar ist.
- Beim Wechsel von `api-key` zu `oauth` wird `llm.baseURL` nicht automatisch übernommen. Setze es im OAuth-Modus nur manuell, wenn du bewusst ein benutzerdefiniertes, ChatGPT-/Codex-kompatibles Backend verwenden möchtest.

</details>

<details>
<summary><strong>Legacy-CPU-Rückfall</strong></summary>

Wenn ein Linux-x64-Host mit nur AVX innerhalb der nativen LanceDB-Vektorsuche mit `SIGILL` abstürzt, deaktiviere das native Kosinus-Maß und lass memory-lancedb-pro die Scoped-Zeilen in JavaScript durchsuchen und bewerten:

```json5
{
  retrieval: {
    disableNativeCosine: true
  }
}
```

Du kannst für dasselbe Verhalten auch `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` setzen.

</details>

<details>
<summary><strong>Lebenszyklus-Konfiguration (Decay + Tier)</strong></summary>

| Feld | Standard | Beschreibung |
|-------|---------|-------------|
| `decay.recencyHalfLifeDays` | `30` | Basis-Halbwertszeit für das Weibull-Aktualitätsabklingen |
| `decay.frequencyWeight` | `0.3` | Gewicht der Zugriffshäufigkeit im zusammengesetzten Score |
| `decay.intrinsicWeight` | `0.3` | Gewicht von `importance × confidence` |
| `decay.betaCore` | `0.8` | Weibull-Beta für `core`-Erinnerungen |
| `decay.betaWorking` | `1.0` | Weibull-Beta für `working`-Erinnerungen |
| `decay.betaPeripheral` | `1.3` | Weibull-Beta für `peripheral`-Erinnerungen |
| `tier.coreAccessThreshold` | `10` | Mindestanzahl an Abrufen vor der Beförderung zu `core` |
| `tier.peripheralAgeDays` | `60` | Altersschwelle für die Herabstufung veralteter Erinnerungen |

</details>

<details>
<summary><strong>Zugriffsverstärkung</strong></summary>

Häufig abgerufene Erinnerungen klingen langsamer ab (im Stil der verteilten Wiederholung).

Konfigurationsschlüssel (unter `retrieval`):
- `reinforcementFactor` (0-2, Standard: `0.5`) — setze `0` zum Deaktivieren
- `maxHalfLifeMultiplier` (1-10, Standard: `3`) — harte Obergrenze für die effektive Halbwertszeit

</details>

---

## CLI-Befehle

Die `memory-pro`-Binärdatei ist nach `npm run build` verfügbar:

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

Innerhalb einer pi-Sitzung steht dieselbe Verwaltungsoberfläche als Slash-Befehl **`/memory-pro`** zur Verfügung.

> Die CLI liest dieselbe Konfigurationsdatei wie die Erweiterung (`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `~/.pi/agent/memory-lancedb-pro.json`).

OAuth-Anmeldeablauf:

1. Führe `memory-pro auth login` aus
2. Wenn `--provider` in einem interaktiven Terminal weggelassen wird, zeigt die CLI vor dem Öffnen des Browsers eine OAuth-Anbieterauswahl an
3. Der Befehl gibt eine Autorisierungs-URL aus und öffnet deinen Browser, sofern `--no-browser` gesetzt ist
4. Nach erfolgreichem Callback speichert der Befehl die Plugin-OAuth-Datei (Standard: `~/.pi/agent/.memory-lancedb-pro/oauth.json`), sichert die vorherige api-key-`llm`-Konfiguration für den Logout und ersetzt die Plugin-`llm`-Konfiguration durch OAuth-Einstellungen (`auth`, `oauthProvider`, `model`, `oauthPath`)
5. `memory-pro auth logout` löscht diese OAuth-Datei und stellt die vorherige api-key-`llm`-Konfiguration wieder her, wenn dieser Schnappschuss existiert

---

## Fortgeschrittene Themen

<details>
<summary><strong>Upgrade von einer früheren Port-Version</strong></summary>

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

Siehe `CHANGELOG-v1.1.0.md` für Verhaltensänderungen und die Begründung des Upgrades.

**Jina-Task-Hinweise auf einer bestehenden Datenbank aktivieren?**

Task-Hinweise sind zwei Konfigurationsschlüssel im `embedding`-Block:

```json5
{
  embedding: {
    model: "jina-embeddings-v5-text-small",
    taskQuery: "retrieval.query",
    taskPassage: "retrieval.passage"
  }
}
```

Sie wirken sich nur auf Vektoren aus, die *nach* dem Setzen geschrieben werden. Zeilen, die sich bereits in deinem Speicher befinden, wurden ohne Task-Hinweis eingebettet — eine mit `retrieval.query` eingebettete Abfrage wird also mit Passagen verglichen, die in einem anderen Vektorraum leben. Du bekommst stillschweigend nur etwa die Hälfte des Nutzens.

Um vorhandene Zeilen zu reparieren, bette sie in eine **frische Datenbank neu ein und wechsle zu ihr**. Bette **nicht** an Ort und Stelle neu ein: `reembed` schreibt jede Zeile mit `table.add()` (Anhängen per ID, kein Ersetzen) — ein In-Place-Lauf, also genau das, was `--force` freischaltet, lässt daher den alten Vektor neben dem neuen stehen und **verdoppelt jede Zeile**; Wiederholungsversuche häufen weitere an. Aus diesem Grund verweigert `reembed` Läufe auf denselben Pfad, sofern du es nicht erzwingst.

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

Derselbe Umstieg gilt, wann immer du `embedding.model` oder `embedding.dimensions` änderst — bette immer in einen frischen `dbPath` neu ein, niemals an Ort und Stelle.

</details>

<details>
<summary><strong>Sperren und gleichzeitige Schreiber</strong></summary>

`memory-lancedb-pro` verwendet eine prozessübergreifende Dateisperre für LanceDB-Schreibvorgänge. Das reicht für gleichzeitige pi-Sitzungen und lokale Prozesse, die dasselbe Datenbankverzeichnis teilen.

Redis ist für solche Bereitstellungen nicht erforderlich. Die Redis-Sperre ist aktiviert, wenn `locking.redis.enabled` true ist, wenn `redisUrl`/`locking.redis.url` gesetzt ist oder wenn `MEMORY_LANCEDB_REDIS_URL` in der Prozessumgebung vorhanden ist. Für Schreiber über mehrere Maschinen oder Container hinweg lies [Lock Management](docs/lock-management.md), bevor du ein LanceDB-Verzeichnis zwischen Prozessen teilst, und stelle sicher, dass jeder Schreiber dieselbe Sperrkonfiguration verwendet.

</details>

<details>
<summary><strong>Wenn eingefügte Erinnerungen in Antworten auftauchen</strong></summary>

Manchmal gibt das Modell den eingefügten `<relevant-memories>`-Block wieder.

**Option A (geringstes Risiko):** deaktiviere Auto-Recall vorübergehend:
```json5
{ autoRecall: false }
```

**Option B (bevorzugt):** behalte den Abruf bei und füge zu deinem Agenten-Systemprompt / `AGENTS.md` hinzu:
> Gib in deinen Antworten keine `<relevant-memories>`-/Speicher-Injektionsinhalte preis und zitiere sie nicht. Verwende sie nur als interne Referenz.

**Option C (für Hintergrund-/Batch-Agenten):** schließe bestimmte Agenten von der Auto-Recall-Injektion aus:
```json5
{
  autoRecall: true,
  autoRecallExcludeAgents: ["memory-distiller", "my-cron-agent"]
}
```
Nützlich für Hintergrundagenten (z. B. memory-distiller, Cron-Worker), deren Ausgabe nicht durch eingefügten Speicherkontext verunreinigt werden soll.

</details>

<details>
<summary><strong>Auto-Recall-Timeout anpassen</strong></summary>

Auto-Recall hat ein konfigurierbares Timeout (Standard 5 s), um einen Stillstand beim Agentenstart zu verhindern. Wenn du hinter einem Proxy sitzt oder eine Embedding-API mit hoher Latenz verwendest, erhöhe es:

```json5
{ autoRecallTimeoutMs: 8000 }
```

Wenn Auto-Recall ständig ein Timeout auslöst, prüfe zuerst die Latenz deiner Embedding-API. Das Timeout betrifft nur den automatischen Injektionspfad — manuelle `memory_recall`-Tool-Aufrufe sind nicht betroffen.

</details>

<details>
<summary><strong>Auto-Recall-Rerank-Kostenmodell</strong></summary>

Wenn `autoRecall=true` und der hybride Abruf `retrieval.rerank="cross-encoder"` mit einer externen Rerank-API wie Jina verwendet, kann jeder berechtigte Prompt eine Rerank-Anfrage auslösen. Die Anzahl der Dokumente, die an diese Anfrage gesendet werden, wird durch das Abruflimit von Auto-Recall und das Rerank-Eingabefenster des Retrievers bestimmt — nicht direkt durch `retrieval.candidatePoolSize` oder die endgültige Injektionsgrenze `autoRecallMaxItems`.

Bei `autoRecallMaxItems: 3` fragt Auto-Recall beispielsweise 6 Einträge beim Abruf an, und der hybride Abruf kann bis zu 12 Kandidaten an den externen Reranker senden, bevor er höchstens 3 Erinnerungen einfügt. Um die externe Rerank-Nutzung zu reduzieren, senke `autoRecallMaxItems` oder `maxRecallPerTurn`, stelle `retrieval.rerank` auf `"lightweight"` oder `"none"` um, erhöhe `autoRecallMinLength` oder lasse Auto-Recall deaktiviert und verwende dort manuelles `memory_recall`, wo es angebracht ist.

Die Startprotokolle warnen, wenn Auto-Recall plus hybrides Cross-Encoder-Reranking mehr Einträge an den Reranker senden kann, als es einfügen wird. Debug-Auto-Recall-Statistiken enthalten die tatsächlichen Werte `rerankInput`, `rerankInputLimit`, `retrieveLimit`, `rerank`, `rerankProvider` und den konfigurierten `retrievalCandidatePoolSize`.

</details>

<details>
<summary><strong>Sitzungsspeicher</strong></summary>

- Wird bei Ereignissen neuer Sitzungen ausgelöst — speichert die Zusammenfassung der vorherigen Sitzung in LanceDB
- Standardmäßig deaktiviert (pi speichert bereits `.jsonl`-Sitzungstranskripte)
- Konfigurierbare Nachrichtenanzahl (Standard: 15)

</details>

<details>
<summary><strong>Benutzerdefinierte Slash-Befehle (z. B. /lesson)</strong></summary>

Füge zu deinem `AGENTS.md` oder Systemprompt hinzu:

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
<summary><strong>Eiserne Regeln für KI-Agenten</strong></summary>

> Kopiere den Block unten in deine `AGENTS.md`, damit dein Agent diese Regeln automatisch durchsetzt.

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
<summary><strong>Datenbankschema</strong></summary>

LanceDB-Tabelle `memories`:

| Feld | Typ | Beschreibung |
| --- | --- | --- |
| `id` | string (UUID) | Primärschlüssel |
| `text` | string | Erinnerungstext (FTS-indexiert) |
| `vector` | float[] | Einbettungsvektor |
| `category` | string | Speicherkategorie: `preference` / `fact` / `decision` / `entity` / `reflection` / `other` |
| `scope` | string | Scope-Kennung (z. B. `global`, `agent:main`) |
| `importance` | float | Wichtigkeitsscore 0-1 |
| `timestamp` | int64 | Erstellungszeitstempel (ms) |
| `metadata` | string (JSON) | Erweiterte Metadaten |

Häufige `metadata`-Schlüssel in v1.1.0: `l0_abstract`, `l1_overview`, `l2_content`, `memory_category`, `tier`, `access_count`, `confidence`, `last_accessed_at`

> **Hinweis zu Kategorien:** Das Top-Level-Feld `category` verwendet 6 Speicherkategorien. Die 6 semantischen Kategorienlabels aus der Intelligenten Extraktion (`profile` / `preferences` / `entities` / `events` / `cases` / `patterns`) werden in `metadata.memory_category` gespeichert.

</details>

<details>
<summary><strong>Fehlerbehebung</strong></summary>

**Erweiterung lädt nicht / „no config file found"**

Erstelle `~/.pi/agent/memory-lancedb-pro.json5` oder setze `$MEMORY_LANCEDB_PRO_CONFIG`. Die Erweiterung gibt eine Warnung mit der erwarteten Form aus und bleibt deaktiviert — pi läuft weiter.

**Initialisierung der intelligenten Extraktion fehlgeschlagen**

Prüfe, ob `llm.apiKey` / `${ENV_VAR}` gesetzt ist; das Plugin fällt auf Regex-Extraktion zurück, statt zu scheitern.

**„Cannot mix BigInt and other types" (LanceDB / Apache Arrow)**

Ab LanceDB 0.26+ können einige numerische Spalten als `BigInt` zurückgegeben werden. Führe ein Upgrade auf **memory-lancedb-pro >= 1.0.14** durch — dieses Plugin erzwingt Werte jetzt vor der Arithmetik mit `Number(...)`.

</details>

---

## Architektur

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

> Für einen tiefen Einblick in die vollständige Architektur siehe [docs/memory_architecture_analysis.md](docs/memory_architecture_analysis.md).

<details>
<summary><strong>Dateireferenz (zum Erweitern klicken)</strong></summary>

| Datei | Zweck |
| --- | --- |
| `pi-adapter/index.ts` | Pi-Einstiegspunkt: lädt die Konfigurationsdatei, erstellt den OpenClaw-API-Shim, registriert den Plugin-Kern |
| `pi-adapter/shim.ts` | Bildet pi-Lebenszyklusereignisse / Tools / Befehle auf die OpenClaw-Plugin-API ab |
| `pi-adapter/config.ts` | Laden der Konfigurationsdatei (`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `.json`) |
| `pi-adapter/paths.ts` | Pi-Pfadauflösung (`~/.pi/agent`, Umgebungsüberschreibungen) |
| `pi-adapter/pi-runner.ts` | Eingebetteter Sub-Agent-Runner über `pi --mode json --no-tools ...` |
| `pi-adapter/cli-main.ts` | Eigenständiger `memory-pro`-CLI-Einstieg |
| `index.ts` | Plugin-Kern-Einstieg: Konfigurationsparsing, Lebenszyklus-Hooks, Registrierung der Speicherfunktion |
| `src/store.ts` | LanceDB-Speicherebene. Tabellenerstellung / FTS-Indexierung / Vektorsuche / BM25-Suche / CRUD |
| `src/embedder.ts` | Embedding-Abstraktion. Kompatibel mit jedem OpenAI-kompatiblen API-Anbieter |
| `src/retriever.ts` | Hybride Abruf-Engine. Vektor + BM25 → Hybride Fusion → Rerank → Lebenszyklus-Abklingen → Filter |
| `src/scopes.ts` | Zugriffskontrolle für mehrere Scopes |
| `src/tools.ts` | Agenten-Tool-Definitionen: `memory_recall`, `memory_store`, `memory_forget`, `memory_update` + Verwaltungstools |
| `src/noise-filter.ts` | Filtert Ablehnungen des Agenten, Meta-Fragen, Begrüßungen und minderwertige Inhalte heraus |
| `src/adaptive-retrieval.ts` | Bestimmt, ob eine Abfrage einen Speicherabruf benötigt |
| `src/migrate.ts` | Migration vom integrierten `memory-lancedb` zu Pro |
| `src/smart-extractor.ts` | LLM-gestützte 6-Kategorien-Extraktion mit L0/L1/L2-Schichtspeicherung und zweistufiger Deduplizierung |
| `src/decay-engine.ts` | Weibull-Modell des gestreckten exponentiellen Abklingens |
| `src/tier-manager.ts` | Drei-Ebenen-Promotion/Demotion: Peripheral ↔ Working ↔ Core |

</details>

---

## OpenClaw-Upstream-Anhang

Dieses Repository ist ein Port. Das Upstream-Projekt ist **[CortexReach/memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)** — ein OpenClaw-Plugin. Alles unten dokumentiert die OpenClaw-Nutzung des Upstreams; pi-Benutzer benötigen es nicht.

### Was sich geändert hat (Port-Unterschiede)

| Bereich | OpenClaw (Upstream) | Pi (dieser Port) |
|---|---|---|
| Erweiterungs-Bootstrap | `openclaw.plugin.json` / `openclaw.extensions` | `pi-adapter/index.ts` → kompiliert zu `dist/pi-adapter/index.js`, deklariert über `pi.extensions` in `package.json` |
| Konfigurationsdatei | `openclaw.json`-Plugin-Eintrag | `~/.pi/agent/memory-lancedb-pro.json5` (oder `$MEMORY_LANCEDB_PRO_CONFIG`) — gleiche Dokumentform |
| Daten- & Sitzungs-Basisverzeichnis | `~/.openclaw/...` | `~/.pi/agent/...` (überschreibbar mit `PI_CODING_AGENT_DIR` / `PI_AGENT_DIR`) |
| CLI | `openclaw memory-pro …` | Eigenständiges Binärprogramm: `memory-pro …` (kompiliert aus `pi-adapter/cli-main.ts`) |
| Slash-Befehl | über `openclaw` registrierte CLI | `pi.registerCommand("/memory-pro", ...)` über den Shim |
| Eingebetteter Sub-Agent-Runner | OpenClaw-Runtime-API | Ruft `pi --mode json --no-tools …` auf (`pi-adapter/pi-runner.ts`) |
| Sitzungslayout | `~/.openclaw/agents/<id>/sessions/*.jsonl` | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| Version | `1.1.0-beta.11` | `1.1.0-beta.11-pi.1` |

Lebenszyklusereignisse werden über `pi-adapter/shim.ts` von pi-Ereignissen auf OpenClaw-Hooks abgebildet: `input`, `session_start`, `before_agent_start`, `agent_end`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`. Die Tools des Plugins (`memory_store`, `memory_recall`, …) und der Slash-Befehl `/memory-pro` registrieren sich unverändert über den Shim.

### Upstream-Schnellstart (nur OpenClaw)

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

Upstream-Befehle verwenden das Präfix `openclaw memory-pro ...`. Siehe das [Upstream-README](https://github.com/CortexReach/memory-lancedb-pro) für die vollständige OpenClaw-Dokumentation.

### Upstream-Ökosystem

- **[Setup-Skript](https://github.com/CortexReach/toolbox/tree/main/memory-lancedb-pro-setup)** — Ein-Klick-Installation/Upgrade/Reparatur für OpenClaw-Bereitstellungen (schreibt `openclaw.json`)
- **[KI-gestützte Konfigurations-Skill](https://github.com/CortexReach/memory-lancedb-pro-skill)** — für Claude-Code-/OpenClaw-Agenten
- **Video-Tutorials** — [YouTube](https://youtu.be/MtukF1C8epQ) · [Bilibili](https://www.bilibili.com/video/BV1zUf2BGEgn/)
- **Star-Verlauf** — [star-history.com](https://star-history.com/#CortexReach/memory-lancedb-pro&Date)

---

## Dokumentation

| Dokument | Beschreibung |
| --- | --- |
| [Memory Architecture Analysis](docs/memory_architecture_analysis.md) | Tiefer Einblick in die vollständige Architektur |
| [CHANGELOG v1.1.0](docs/CHANGELOG-v1.1.0.md) | Verhaltensänderungen der v1.1.0 und Upgrade-Begründung |
| [Release Checklist](docs/release-checklist.md) | Paket-Preflight, Publish-Dry-Run und Post-Publish-Smoke-Checks |
| [Long-Context Chunking](docs/long-context-chunking.md) | Chunking-Strategie für lange Dokumente |
| [Lock Management](docs/lock-management.md) | Details zur Sperrung bei mehreren Schreibern (Redis) |

## Tests

```bash
npm test                       # full unit/e2e suite
node scripts/run-ci-tests.mjs --all   # full CI manifest
npm run test:pi-adapter        # pi adapter smoke test (mock pi API)
```

Alle Upstream-Tests sind erhalten; `test/pi-adapter-smoke.test.mjs` und `test:pi-adapter` sind neu.

---

## Beta: Smart Memory v1.1.0

> Status: Beta — verfügbar über `npm i memory-lancedb-pro@beta`. Stabile Benutzer auf `latest` sind nicht betroffen.

| Funktion | Beschreibung |
|---------|-------------|
| **Intelligente Extraktion** | LLM-gestützte 6-Kategorien-Extraktion mit L0/L1/L2-Metadaten. Fällt auf Regex zurück, wenn deaktiviert. |
| **Lebenszyklus-Scoring** | In den Abruf integriertes Weibull-Abklingen — Erinnerungen mit hoher Häufigkeit und Wichtigkeit ranken höher. |
| **Ebenenverwaltung** | Drei-Ebenen-System (Core → Working → Peripheral) mit automatischer Promotion/Demotion. |

Feedback: [GitHub Issues](https://github.com/CortexReach/memory-lancedb-pro/issues) · Zurücksetzen: `npm i memory-lancedb-pro@latest`

---

## Abhängigkeiten

| Paket | Zweck |
| --- | --- |
| `@lancedb/lancedb` ≥0.26.2 | Vektordatenbank (ANN + FTS) |
| `openai` ≥6.21.0 | OpenAI-kompatibler Embedding-API-Client |
| `@sinclair/typebox` 0.34.48 | JSON-Schema-Typdefinitionen |

---

## Mitwirkende

Upstream-Maintainer und -Mitwirkende (siehe die [vollständige Liste](https://github.com/CortexReach/memory-lancedb-pro/graphs/contributors)):

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

## Lizenz

MIT
