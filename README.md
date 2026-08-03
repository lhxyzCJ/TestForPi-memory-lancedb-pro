<div align="center">

# 🧠 memory-lancedb-pro · π Pi Coding Agent Extension

**AI Memory Assistant for the [pi coding agent](https://github.com/earendil-works/pi)**

*Give your AI agent a brain that actually remembers — across sessions, across projects, across time.*

A LanceDB-backed memory extension for pi that stores preferences, decisions, and project context, then auto-recalls them in future sessions.

[![Pi Extension](https://img.shields.io/badge/Pi-Extension-blue)](https://github.com/earendil-works/pi)
[![Pi 0.80+](https://img.shields.io/badge/pi-0.80%2B-brightgreen)](https://github.com/earendil-works/pi)
[![LanceDB](https://img.shields.io/badge/LanceDB-Vectorstore-orange)](https://lancedb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) | [简体中文](README_CN.md) | [繁體中文](README_TW.md) | [日本語](README_JA.md) | [한국어](README_KO.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Deutsch](README_DE.md) | [Italiano](README_IT.md) | [Русский](README_RU.md) | [Português (Brasil)](README_PT-BR.md)

</div>

---

## 🤖 About This Port

This repository is a **pi coding agent port** of the production-grade memory plugin [memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro) (MIT). The entire OpenClaw plugin core is untouched and loads unchanged through a thin adapter (`pi-adapter/`), so pi (≥ 0.80) gets the same LanceDB-powered memory engine with minimal divergence from upstream.

> Everything below documents the pi experience. See the [OpenClaw Upstream Appendix](#openclaw-upstream-appendix) at the bottom for the port differences table and original OpenClaw usage.

---

## Why memory-lancedb-pro?

Most AI agents have amnesia. They forget everything the moment you start a new chat.

**memory-lancedb-pro** is a production-grade long-term memory extension that turns your agent into an **AI Memory Assistant** — it automatically captures what matters, lets noise naturally fade, and retrieves the right memory at the right time. No manual tagging, no configuration headaches.

### Your AI Memory Assistant in Action

**Without memory — every session starts from zero:**

> **You:** "Use tabs for indentation, always add error handling."
> *(next session)*
> **You:** "I already told you — tabs, not spaces!" 😤
> *(next session)*
> **You:** "...seriously, tabs. And error handling. Again."

**With memory-lancedb-pro — your agent learns and remembers:**

> **You:** "Use tabs for indentation, always add error handling."
> *(next session — agent auto-recalls your preferences)*
> **Agent:** *(silently applies tabs + error handling)* ✅
> **You:** "Why did we pick PostgreSQL over MongoDB last month?"
> **Agent:** "Based on our discussion on Feb 12, the main reasons were..." ✅

That's the difference an **AI Memory Assistant** makes — it learns your style, recalls past decisions, and delivers personalized responses without you repeating yourself.

### What else can it do?

| | What you get |
|---|---|
| **Auto-Capture** | Your agent learns from every conversation — no manual `memory_store` needed |
| **Smart Extraction** | LLM-powered 6-category classification: profiles, preferences, entities, events, cases, patterns |
| **Intelligent Forgetting** | Weibull decay model — important memories stay, noise naturally fades away |
| **Hybrid Retrieval** | Vector + BM25 full-text search, fused with cross-encoder reranking |
| **Context Injection** | Relevant memories automatically surface before each reply |
| **Multi-Scope Isolation** | Per-agent, per-user, per-project memory boundaries |
| **Any Provider** | OpenAI, Jina, Gemini, Ollama, or any OpenAI-compatible API |
| **Full Toolkit** | CLI, backup, migration, upgrade, export/import — production-ready |

---

## Quick Start

> **CPU Requirement:** Your CPU must support **AVX** instructions. LanceDB native vector search may require **AVX2** on some Linux x64 builds and can crash AVX-only CPUs with `SIGILL`; set `retrieval.disableNativeCosine: true` or `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` to use a scoped row scan plus JavaScript cosine ranking. Check CPU flags with: `grep -o 'avx[^ ]*' /proc/cpuinfo | head -1` (no output = not supported). See [#419](https://github.com/CortexReach/memory-lancedb-pro/issues/419) and [#644](https://github.com/CortexReach/memory-lancedb-pro/issues/644) for details.

### 1. Build the extension

```bash
git clone https://github.com/lhxyzCJ/TestForPi-memory-lancedb-pro
cd TestForPi-memory-lancedb-pro && npm install && npm run build
```

The pi entry point is `dist/pi-adapter/index.js` (compiled from `pi-adapter/index.ts`).

### 2. Register the extension

Pick one of:

**A. Via pi's settings file (global, all projects):**

Add to `~/.pi/agent/settings.json`:

```json
{
  "extensions": [
    "/absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js"
  ]
}
```

**B. Via pi package manager:**

```bash
pi install /absolute/path/to/TestForPi-memory-lancedb-pro
```

**C. Quick test for one session:**

```bash
pi -e /absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js
```

**D. Auto-discovery (no settings change):** drop the built extension (or a `package.json` with a `pi.extensions` field) into `~/.pi/agent/extensions/` (global) or `.pi/extensions/` (project-local) and restart pi.

### 3. Create the config file

Create `~/.pi/agent/memory-lancedb-pro.json5` (you can also use `.json`, or point anywhere with `$MEMORY_LANCEDB_PRO_CONFIG`):

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

> The config document shape is identical to the upstream OpenClaw plugin entry — both the bare inner object above and a `{ "config": { ... } }` wrapper are accepted.

### 4. Verify

Start a pi session and check the startup log:

```
memory-lancedb-pro: smart extraction enabled
memory-lancedb-pro@...: plugin registered (db: /root/.pi-agent/memory/lancedb-pro, ...)
```

Then ask your agent to store and recall something:

> **You:** "Remember: I prefer tabs over spaces."
> **You:** "What are my indentation preferences?"

### Why these defaults?

- `autoCapture` + `smartExtraction` → your agent learns from every conversation automatically
- `autoRecall` → relevant memories are injected before each reply
- `extractMinMessages: 2` → extraction triggers in normal two-turn chats
- `sessionMemory.enabled: false` → avoids polluting retrieval with session summaries on day one

---

## Runtime Requirements (pi)

The extension inherits a few host requirements that are not set in `memory-lancedb-pro.json5`:

1. **Default provider** — embedded reflection/dreaming sub-agents are spawned through the `pi` CLI without `--provider`/`--model` and inherit the host default. Set `defaultProvider`/`defaultModel` in `~/.pi/agent/settings.json` (e.g. `"defaultProvider": "opencode-go", "defaultModel": "deepseek-v4-flash"`), otherwise sub-agents may fall back to a broken or unintended provider.
2. **Embedding endpoint** — the embedding API must be reachable (e.g. start Ollama before a session); an unreachable endpoint silently degrades smart extraction to regex fallback.
3. **LLM API key** — smart extraction needs a valid LLM key (`llm.apiKey`, e.g. `"${OPENCODE_API_KEY}"`); without it, extraction falls back to regex capture.
4. **Upgrade path** — pi loads the extension from the absolute path recorded in `settings.json` (`extensions`). After updating this repository, re-run `pi install` (or replace the installed copy) or pi keeps loading the old build.

**Known gap vs upstream:** the upstream batch-utility admission mode (#941, `utilityMode: "batch"`, `utilityVetoThreshold`) is not ported; `utilityMode` supports only `"standalone" | "off"`.

## ⚠️ Memory Architecture (Important)

The extension exposes one memory capability with two coordinated stores:

| Memory Layer | Storage | What it's for | Recallable? |
|---|---|---|---|
| **Plugin Memory** | LanceDB (vector store) | Semantic recall via `memory_recall` / auto-recall | ✅ Yes |
| **Canonical Corpus** | `MEMORY.md`, `memory/**/*.md`, recent session transcripts, `memory/dreaming/**/*.md` | Source-of-truth files and public artifacts | ✅ Via LanceDB semantic index when `canonicalCorpus.enabled` is true |

**Key principle:**
> Canonical files remain the source of truth. LanceDB is the semantic index used to retrieve them with grounded paths, line spans, snippets, and citations.

**What this means for you:**
- Need semantic recall? → Use `memory_store` or let auto-capture do it
- `memory/YYYY-MM-DD.md` → treat as a **daily journal / log** that can also be indexed for semantic lookup
- `MEMORY.md` → curated human-readable reference that can be indexed as canonical context
- `memory/dreaming/**/*.md` → dream reports exposed as public artifacts and indexed as reflection context
- Session JSONL transcripts → indexed as `source: "sessions"` when `canonicalCorpus.includeSessionTranscripts` is enabled
- Plugin memory → primary write path for durable facts, preferences, decisions, and auto-captured memories

### Where data lives (pi)

| What | Path |
|---|---|
| Plugin database (LanceDB) | `~/.pi/agent/memory/lancedb-pro` (or `$MEMORY_LANCEDB_PRO_DB_PATH`) |
| Markdown mirror | `~/.pi/agent/memory/md-mirror` (or `$MEMORY_LANCEDB_PRO_MD_MIRROR_DIR`) |
| Session transcripts | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| Global skills | `~/.pi/agent/skills` |

The base directory is `~/.pi/agent`; override it with `PI_CODING_AGENT_DIR` or `PI_AGENT_DIR`. Relative paths in config (`dbPath`, `mdMirrorDir`, ...) resolve against the pi agent home.

### Config file locations (in priority order)

1. `$MEMORY_LANCEDB_PRO_CONFIG` (explicit path)
2. `~/.pi/agent/memory-lancedb-pro.json5`
3. `~/.pi/agent/memory-lancedb-pro.json`

If no config file is found, the extension logs a warning and stays disabled — a broken or missing config never takes down the pi session.

---

## Core Features

### Hybrid Retrieval

```
Query → embedQuery() ─┐
                       ├─→ Hybrid Fusion → Rerank → Lifecycle Decay Boost → Length Norm → Filter
Query → BM25 FTS ─────┘
```

- **Vector Search** — semantic similarity via LanceDB ANN (cosine distance)
- **BM25 Full-Text Search** — exact keyword matching via LanceDB FTS index
- **Hybrid Fusion** — vector score as base, BM25 hits receive a weighted boost (not standard RRF — tuned for real-world recall quality)
- **Configurable Weights** — `vectorWeight`, `bm25Weight`, `minScore`

### Cross-Encoder Reranking

- Built-in adapters for **Jina**, **SiliconFlow**, **Voyage AI**, and **Pinecone**
- Compatible with any Jina-compatible endpoint (e.g., Hugging Face TEI, DashScope)
- Hybrid scoring: 60% cross-encoder + 40% original fused score
- Graceful degradation: falls back to cosine similarity on API failure

### Multi-Stage Scoring Pipeline

| Stage | Effect |
| --- | --- |
| **Hybrid Fusion** | Combines semantic and exact-match recall |
| **Cross-Encoder Rerank** | Promotes semantically precise hits |
| **Lifecycle Decay Boost** | Weibull freshness + access frequency + importance × confidence |
| **Length Normalization** | Prevents long entries from dominating (anchor: 500 chars) |
| **Hard Min Score** | Removes irrelevant results (default: 0.35) |
| **MMR Diversity** | Cosine similarity > 0.85 → demoted |

### Smart Memory Extraction (v1.1.0)

- **LLM-Powered 6-Category Extraction**: profile, preferences, entities, events, cases, patterns
- **L0/L1/L2 Layered Storage**: L0 (one-sentence index) → L1 (structured summary) → L2 (full narrative)
- **Two-Stage Dedup**: vector similarity pre-filter (≥0.7) → LLM semantic decision (CREATE/MERGE/SKIP)
- **Category-Aware Merge**: `profile` always merges, `events`/`cases` are append-only

### Memory Lifecycle Management (v1.1.0)

- **Weibull Decay Engine**: composite score = recency + frequency + intrinsic value
- **Three-Tier Promotion**: `Peripheral ↔ Working ↔ Core` with configurable thresholds
- **Access Reinforcement**: frequently recalled memories decay slower (spaced-repetition style)
- **Importance-Modulated Half-Life**: important memories decay slower

### Multi-Scope Isolation

- Built-in scopes: `global`, `agent:<id>`, `custom:<name>`, `project:<id>`, `user:<id>`
- Agent-level access control via `scopes.agentAccess`
- Default: each agent accesses `global` + its own `agent:<id>` scope
- Read-only tools such as `memory_recall`, `memory_search`, `memory_list`, and `memory_debug` fail soft when a requested scope is inaccessible: they search the caller's accessible scopes instead and return `ignoredScope` plus `accessibleScopes` in details. Write and mutation tools still return `scope_access_denied` for inaccessible scopes.

### Auto-Capture & Auto-Recall

- **Auto-Capture** (`agent_end`): extracts preference/fact/decision/entity from conversations, deduplicates, stores up to 3 per turn
- **Auto-Recall** (before each prompt build): injects `<relevant-memories>` context (up to 3 entries)

> **Note:** On pi, these OpenClaw hooks (`agent_end`, `before_prompt_build`, ...) are mapped from pi lifecycle events (`agent_end`, `input`, `session_start`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`) by `pi-adapter/shim.ts`.

### Noise Filtering & Adaptive Retrieval

- Filters low-quality content: agent refusals, meta-questions, greetings
- Skips retrieval for greetings, slash commands, simple confirmations, emoji
- Forces retrieval for memory keywords ("remember", "previously", "last time")
- CJK-aware thresholds (Chinese: 6 chars vs English: 15 chars)

---

<details>
<summary><strong>Compared to Built-in <code>memory-lancedb</code> (click to expand)</strong></summary>

| Feature | Built-in `memory-lancedb` | **memory-lancedb-pro** |
| --- | :---: | :---: |
| Vector search | Yes | Yes |
| BM25 full-text search | - | Yes |
| Hybrid fusion (Vector + BM25) | - | Yes |
| Cross-encoder rerank (multi-provider) | - | Yes |
| Recency boost & time decay | - | Yes |
| Length normalization | - | Yes |
| MMR diversity | - | Yes |
| Multi-scope isolation | - | Yes |
| Noise filtering | - | Yes |
| Adaptive retrieval | - | Yes |
| Management CLI | - | Yes |
| Session memory | - | Yes |
| Task-aware embeddings | - | Yes |
| **LLM Smart Extraction (6-category)** | - | Yes (v1.1.0) |
| **Weibull Decay + Tier Promotion** | - | Yes (v1.1.0) |
| Any OpenAI-compatible embedding | Limited | Yes |

</details>

---

## Configuration

All configuration lives in `~/.pi/agent/memory-lancedb-pro.json5` (or `$MEMORY_LANCEDB_PRO_CONFIG`).

API-key fields (`embedding.apiKey`, `retrieval.rerankApiKey`, and `llm.apiKey`) accept plain strings, `${ENV_VAR}` placeholders, or SecretRef objects. This plugin supports the `env` and `file` SecretRef sources:

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

For `source: "file"`, `id` is resolved against the pi agent home and read as a UTF-8 file. The optional `provider` field is accepted for SecretRef object-shape compatibility but is not used for provider dispatch. `exec` and other SecretRef sources are rejected by runtime config validation.

<details>
<summary><strong>Full Configuration Example</strong></summary>

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
<summary><strong>Embedding Providers</strong></summary>

Works with **OpenAI-compatible embedding APIs**, including provider-specific payload adapters for services such as Jina and Voyage:

| Provider | Model | Base URL | Dimensions |
| --- | --- | --- | --- |
| **Jina** (recommended) | `jina-embeddings-v5-text-small` | `https://api.jina.ai/v1` | 1024 |
| **OpenAI** | `text-embedding-3-small` | `https://api.openai.com/v1` | 1536 |
| **Voyage** | `voyage-4-lite` / `voyage-4` | `https://api.voyageai.com/v1` | 1024 / 1024 |
| **Google Gemini** | `gemini-embedding-001` | `https://generativelanguage.googleapis.com/v1beta/openai/` | 3072 |
| **Ollama** (local) | `nomic-embed-text` | `http://localhost:11434/v1` | provider-specific |

Voyage embedding requests use Voyage's `model` + `input` payload shape. When `requestDimensions` is configured it is sent as `output_dimension`; OpenAI-only fields such as `encoding_format` are omitted.

Set `embedding.maxInputChars` for local embedding servers with small context or batch limits. The plugin applies a conservative default for `nomic-embed-text`; with automatic chunking enabled, longer documents are split before the cap is applied to each provider request.

</details>

<details>
<summary><strong>Rerank Providers</strong></summary>

Cross-encoder reranking supports multiple providers via `rerankProvider`:

| Provider | `rerankProvider` | Example Model |
| --- | --- | --- |
| **Jina** (default) | `jina` | `jina-reranker-v3` |
| **SiliconFlow** (free tier available) | `siliconflow` | `BAAI/bge-reranker-v2-m3` |
| **Voyage AI** | `voyage` | `rerank-2.5` |
| **Pinecone** | `pinecone` | `bge-reranker-v2-m3` |

Any Jina-compatible rerank endpoint also works — set `rerankProvider: "jina"` and point `rerankEndpoint` to your service (e.g., Hugging Face TEI, DashScope `qwen3-rerank`).

</details>

<details>
<summary><strong>Smart Extraction (LLM) — v1.1.0</strong></summary>

When `smartExtraction` is enabled (default: `true`), the plugin uses an LLM to intelligently extract and classify memories instead of regex-based triggers.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `smartExtraction` | boolean | `true` | Enable/disable LLM-powered 6-category extraction |
| `llm.auth` | string | `api-key` | `api-key` uses `llm.apiKey` / `embedding.apiKey`; `oauth` uses a plugin-scoped OAuth token file by default |
| `llm.apiKey` | string | *(falls back to `embedding.apiKey`)* | API key for the LLM provider |
| `llm.model` | string | `openai/gpt-oss-120b` | LLM model name |
| `llm.baseURL` | string | *(falls back to `embedding.baseURL`)* | LLM API endpoint |
| `llm.oauthProvider` | string | `openai-codex` | OAuth provider id used when `llm.auth` is `oauth` |
| `llm.oauthPath` | string | `~/.pi/agent/.memory-lancedb-pro/oauth.json` | OAuth token file used when `llm.auth` is `oauth` |
| `llm.timeoutMs` | number | `30000` | LLM request timeout in milliseconds |
| `extractMinMessages` | number | `2` | Minimum messages before extraction triggers |
| `extractMaxChars` | number | `8000` | Maximum characters sent to the LLM |

OAuth `llm` config (use an existing Codex / ChatGPT login cache for LLM calls):

> **Note:** OAuth flows are inherited from the upstream OpenClaw plugin. On pi, `memory-pro auth login` shells out to the same OAuth logic; the token file defaults to `~/.pi/agent/.memory-lancedb-pro/oauth.json`.

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

Notes for `llm.auth: "oauth"`:

- `llm.oauthProvider` is currently `openai-codex`.
- OAuth tokens default to `~/.pi/agent/.memory-lancedb-pro/oauth.json`.
- You can set `llm.oauthPath` if you want to store that file somewhere else.
- `auth login` snapshots the previous api-key `llm` config next to the OAuth file, and `auth logout` restores that snapshot when available.
- Switching from `api-key` to `oauth` does not automatically carry over `llm.baseURL`. Set it manually in OAuth mode only when you intentionally want a custom ChatGPT/Codex-compatible backend.

</details>

<details>
<summary><strong>Legacy CPU Fallback</strong></summary>

If an AVX-only Linux x64 host crashes inside LanceDB native vector search with `SIGILL`, disable native cosine and let memory-lancedb-pro scan scoped rows and rank them in JavaScript:

```json5
{
  retrieval: {
    disableNativeCosine: true
  }
}
```

You can also set `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` for the same behavior.

</details>

<details>
<summary><strong>Lifecycle Configuration (Decay + Tier)</strong></summary>

| Field | Default | Description |
|-------|---------|-------------|
| `decay.recencyHalfLifeDays` | `30` | Base half-life for Weibull recency decay |
| `decay.frequencyWeight` | `0.3` | Weight of access frequency in composite score |
| `decay.intrinsicWeight` | `0.3` | Weight of `importance × confidence` |
| `decay.betaCore` | `0.8` | Weibull beta for `core` memories |
| `decay.betaWorking` | `1.0` | Weibull beta for `working` memories |
| `decay.betaPeripheral` | `1.3` | Weibull beta for `peripheral` memories |
| `tier.coreAccessThreshold` | `10` | Min recall count before promoting to `core` |
| `tier.peripheralAgeDays` | `60` | Age threshold for demoting stale memories |

</details>

<details>
<summary><strong>Access Reinforcement</strong></summary>

Frequently recalled memories decay more slowly (spaced-repetition style).

Config keys (under `retrieval`):
- `reinforcementFactor` (0-2, default: `0.5`) — set `0` to disable
- `maxHalfLifeMultiplier` (1-10, default: `3`) — hard cap on effective half-life

</details>

---

## CLI Commands

The `memory-pro` binary is available after `npm run build`:

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

Inside a pi session, the same management surface is available as the **`/memory-pro`** slash command.

> The CLI reads the same config file as the extension (`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `~/.pi/agent/memory-lancedb-pro.json`).

OAuth login flow:

1. Run `memory-pro auth login`
2. If `--provider` is omitted in an interactive terminal, the CLI shows an OAuth provider picker before opening the browser
3. The command prints an authorization URL and opens your browser unless `--no-browser` is set
4. After the callback succeeds, the command saves the plugin OAuth file (default: `~/.pi/agent/.memory-lancedb-pro/oauth.json`), snapshots the previous api-key `llm` config for logout, and replaces the plugin `llm` config with OAuth settings (`auth`, `oauthProvider`, `model`, `oauthPath`)
5. `memory-pro auth logout` deletes that OAuth file and restores the previous api-key `llm` config when that snapshot exists

---

## Advanced Topics

<details>
<summary><strong>Upgrading from an earlier port version</strong></summary>

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

See `CHANGELOG-v1.1.0.md` for behavior changes and upgrade rationale.

**Turning on Jina task hints on an existing database?**

Task hints are two config keys under the `embedding` block:

```json5
{
  embedding: {
    model: "jina-embeddings-v5-text-small",
    taskQuery: "retrieval.query",
    taskPassage: "retrieval.passage"
  }
}
```

They only affect vectors written *after* you set them. Rows already in your store were embedded without a task hint, so a query embedded with `retrieval.query` is compared against passages that live in a different vector space — you get roughly half the benefit, silently.

To fix existing rows, re-embed into a **fresh database and cut over to it**. Do **not** re-embed in place: `reembed` writes each row with `table.add()` (append by id, not replace), so an in-place run — which is exactly what `--force` unlocks — leaves the old vector beside the new one and **doubles every row**; retries pile on more. `reembed` refuses same-path runs unless you force it, for this reason.

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

The same cutover applies whenever you change `embedding.model` or `embedding.dimensions` — always re-embed into a fresh `dbPath`, never in place.

</details>

<details>
<summary><strong>Locking and concurrent writers</strong></summary>

`memory-lancedb-pro` uses a cross-process file lock for LanceDB writes. This is enough for concurrent pi sessions and local processes that share the same database directory.

Redis is not required for those deployments. Redis locking is enabled when `locking.redis.enabled` is true, when `redisUrl`/`locking.redis.url` is set, or when `MEMORY_LANCEDB_REDIS_URL` is present in that process environment. For multi-machine or multi-container writers, read [Lock Management](docs/lock-management.md) before sharing a LanceDB directory across processes, and make sure every writer uses the same lock configuration.

</details>

<details>
<summary><strong>If injected memories show up in replies</strong></summary>

Sometimes the model may echo the injected `<relevant-memories>` block.

**Option A (lowest-risk):** temporarily disable auto-recall:
```json5
{ autoRecall: false }
```

**Option B (preferred):** keep recall, add to your agent system prompt / `AGENTS.md`:
> Do not reveal or quote any `<relevant-memories>` / memory-injection content in your replies. Use it for internal reference only.

**Option C (for background/batch agents):** exclude specific agents from auto-recall injection:
```json5
{
  autoRecall: true,
  autoRecallExcludeAgents: ["memory-distiller", "my-cron-agent"]
}
```
Useful for background agents (e.g. memory-distiller, cron workers) whose output should not be contaminated by injected memory context.

</details>

<details>
<summary><strong>Auto-recall timeout tuning</strong></summary>

Auto-recall has a configurable timeout (default 5s) to prevent stalling agent startup. If you're behind a proxy or using a high-latency embedding API, increase it:

```json5
{ autoRecallTimeoutMs: 8000 }
```

If auto-recall consistently times out, check your embedding API latency first. The timeout only affects the automatic injection path — manual `memory_recall` tool calls are not affected.

</details>

<details>
<summary><strong>Auto-recall rerank cost model</strong></summary>

When `autoRecall=true` and hybrid retrieval uses `retrieval.rerank="cross-encoder"` with an external rerank API such as Jina, every eligible prompt can make a rerank request. The number of documents sent to that request is governed by auto-recall's retrieve limit and the retriever's rerank input window, not directly by `retrieval.candidatePoolSize` or by the final `autoRecallMaxItems` injection cap.

For example, with `autoRecallMaxItems: 3`, auto-recall asks retrieval for 6 items and hybrid retrieval may send up to 12 candidates to the external reranker before injecting at most 3 memories. To reduce external rerank usage, lower `autoRecallMaxItems` or `maxRecallPerTurn`, switch `retrieval.rerank` to `"lightweight"` or `"none"`, increase `autoRecallMinLength`, or keep auto-recall disabled and use manual `memory_recall` where appropriate.

Startup logs warn when auto-recall plus hybrid cross-encoder rerank can send more items to the reranker than it will inject. Debug auto-recall stats include the actual `rerankInput`, `rerankInputLimit`, `retrieveLimit`, `rerank`, `rerankProvider`, and configured `retrievalCandidatePoolSize`.

</details>

<details>
<summary><strong>Session Memory</strong></summary>

- Triggered on new-session events — saves the previous session summary to LanceDB
- Disabled by default (pi already persists `.jsonl` session transcripts)
- Configurable message count (default: 15)

</details>

<details>
<summary><strong>Custom Slash Commands (e.g. /lesson)</strong></summary>

Add to your `AGENTS.md` or system prompt:

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
<summary><strong>Iron Rules for AI Agents</strong></summary>

> Copy the block below into your `AGENTS.md` so your agent enforces these rules automatically.

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
<summary><strong>Database Schema</strong></summary>

LanceDB table `memories`:

| Field | Type | Description |
| --- | --- | --- |
| `id` | string (UUID) | Primary key |
| `text` | string | Memory text (FTS indexed) |
| `vector` | float[] | Embedding vector |
| `category` | string | Storage category: `preference` / `fact` / `decision` / `entity` / `reflection` / `other` |
| `scope` | string | Scope identifier (e.g., `global`, `agent:main`) |
| `importance` | float | Importance score 0-1 |
| `timestamp` | int64 | Creation timestamp (ms) |
| `metadata` | string (JSON) | Extended metadata |

Common `metadata` keys in v1.1.0: `l0_abstract`, `l1_overview`, `l2_content`, `memory_category`, `tier`, `access_count`, `confidence`, `last_accessed_at`

> **Note on categories:** The top-level `category` field uses 6 storage categories. The 6-category semantic labels from Smart Extraction (`profile` / `preferences` / `entities` / `events` / `cases` / `patterns`) are stored in `metadata.memory_category`.

</details>

<details>
<summary><strong>Troubleshooting</strong></summary>

**Extension does not load / "no config file found"**

Create `~/.pi/agent/memory-lancedb-pro.json5` or set `$MEMORY_LANCEDB_PRO_CONFIG`. The extension prints a warning with the expected shape and stays disabled — pi keeps running.

**Smart extraction init failed**

Check `llm.apiKey` / `${ENV_VAR}` is set; the plugin falls back to regex extraction rather than failing.

**"Cannot mix BigInt and other types" (LanceDB / Apache Arrow)**

On LanceDB 0.26+, some numeric columns may be returned as `BigInt`. Upgrade to **memory-lancedb-pro >= 1.0.14** — this plugin now coerces values using `Number(...)` before arithmetic.

</details>

---

## Architecture

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

> For a deep-dive into the full architecture, see [docs/memory_architecture_analysis.md](docs/memory_architecture_analysis.md).

<details>
<summary><strong>File Reference (click to expand)</strong></summary>

| File | Purpose |
| --- | --- |
| `pi-adapter/index.ts` | Pi entry point: loads config file, builds the OpenClaw API shim, registers the plugin core |
| `pi-adapter/shim.ts` | Maps pi lifecycle events / tools / commands to the OpenClaw plugin API |
| `pi-adapter/config.ts` | Config file loading (`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `.json`) |
| `pi-adapter/paths.ts` | Pi path resolution (`~/.pi/agent`, env overrides) |
| `pi-adapter/pi-runner.ts` | Embedded sub-agent runner via `pi --mode json --no-tools ...` |
| `pi-adapter/cli-main.ts` | Standalone `memory-pro` CLI entry |
| `index.ts` | Plugin core entry: config parsing, lifecycle hooks, memory capability registration |
| `src/store.ts` | LanceDB storage layer. Table creation / FTS indexing / Vector search / BM25 search / CRUD |
| `src/embedder.ts` | Embedding abstraction. Compatible with any OpenAI-compatible API provider |
| `src/retriever.ts` | Hybrid retrieval engine. Vector + BM25 → Hybrid Fusion → Rerank → Lifecycle Decay → Filter |
| `src/scopes.ts` | Multi-scope access control |
| `src/tools.ts` | Agent tool definitions: `memory_recall`, `memory_store`, `memory_forget`, `memory_update` + management tools |
| `src/noise-filter.ts` | Filters out agent refusals, meta-questions, greetings, and low-quality content |
| `src/adaptive-retrieval.ts` | Determines whether a query needs memory retrieval |
| `src/migrate.ts` | Migration from built-in `memory-lancedb` to Pro |
| `src/smart-extractor.ts` | LLM-powered 6-category extraction with L0/L1/L2 layered storage and two-stage dedup |
| `src/decay-engine.ts` | Weibull stretched-exponential decay model |
| `src/tier-manager.ts` | Three-tier promotion/demotion: Peripheral ↔ Working ↔ Core |

</details>

---

## OpenClaw Upstream Appendix

This repository is a port. The upstream project is **[CortexReach/memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)** — an OpenClaw plugin. Everything below documents the upstream OpenClaw usage; pi users do not need it.

### What changed (port differences)

| Area | OpenClaw (upstream) | Pi (this port) |
|---|---|---|
| Extension bootstrap | `openclaw.plugin.json` / `openclaw.extensions` | `pi-adapter/index.ts` → compiled `dist/pi-adapter/index.js`, declared via `pi.extensions` in `package.json` |
| Config file | `openclaw.json` plugin entry | `~/.pi/agent/memory-lancedb-pro.json5` (or `$MEMORY_LANCEDB_PRO_CONFIG`) — same document shape |
| Data & session base dir | `~/.openclaw/...` | `~/.pi/agent/...` (override with `PI_CODING_AGENT_DIR` / `PI_AGENT_DIR`) |
| CLI | `openclaw memory-pro …` | Standalone bin: `memory-pro …` (compiled from `pi-adapter/cli-main.ts`) |
| Slash command | `openclaw`-registered CLI | `pi.registerCommand("/memory-pro", ...)` via the shim |
| Embedded sub-agent runner | OpenClaw runtime API | Shells out to `pi --mode json --no-tools …` (`pi-adapter/pi-runner.ts`) |
| Session layout | `~/.openclaw/agents/<id>/sessions/*.jsonl` | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| Version | `1.1.0-beta.11` | `1.1.0-beta.11-pi.1` |

Lifecycle events are mapped from pi events to OpenClaw hooks via `pi-adapter/shim.ts`: `input`, `session_start`, `before_agent_start`, `agent_end`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`. The plugin's tools (`memory_store`, `memory_recall`, …) and the `/memory-pro` slash command register through the shim unchanged.

### Upstream Quick Start (OpenClaw only)

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

Upstream commands use the `openclaw memory-pro ...` prefix. See the [upstream README](https://github.com/CortexReach/memory-lancedb-pro) for the full OpenClaw documentation.

### Upstream ecosystem

- **[Setup script](https://github.com/CortexReach/toolbox/tree/main/memory-lancedb-pro-setup)** — one-click install/upgrade/repair for OpenClaw deployments (writes `openclaw.json`)
- **[AI-guided config skill](https://github.com/CortexReach/memory-lancedb-pro-skill)** — for Claude Code / OpenClaw agents
- **Video tutorials** — [YouTube](https://youtu.be/MtukF1C8epQ) · [Bilibili](https://www.bilibili.com/video/BV1zUf2BGEgn/)
- **Star history** — [star-history.com](https://star-history.com/#CortexReach/memory-lancedb-pro&Date)

---

## Documentation

| Document | Description |
| --- | --- |
| [Memory Architecture Analysis](docs/memory_architecture_analysis.md) | Full architecture deep-dive |
| [CHANGELOG v1.1.0](docs/CHANGELOG-v1.1.0.md) | v1.1.0 behavior changes and upgrade rationale |
| [Release Checklist](docs/release-checklist.md) | Package preflight, publish dry run, and post-publish smoke checks |
| [Long-Context Chunking](docs/long-context-chunking.md) | Chunking strategy for long documents |
| [Lock Management](docs/lock-management.md) | Multi-writer locking (Redis) details |

## Tests

```bash
npm test                       # full unit/e2e suite
node scripts/run-ci-tests.mjs --all   # full CI manifest
npm run test:pi-adapter        # pi adapter smoke test (mock pi API)
```

All upstream tests are preserved; `test/pi-adapter-smoke.test.mjs` and `test:pi-adapter` are new.

---

## Beta: Smart Memory v1.1.0

> Status: Beta — available via `npm i memory-lancedb-pro@beta`. Stable users on `latest` are not affected.

| Feature | Description |
|---------|-------------|
| **Smart Extraction** | LLM-powered 6-category extraction with L0/L1/L2 metadata. Falls back to regex when disabled. |
| **Lifecycle Scoring** | Weibull decay integrated into retrieval — high-frequency and high-importance memories rank higher. |
| **Tier Management** | Three-tier system (Core → Working → Peripheral) with automatic promotion/demotion. |

Feedback: [GitHub Issues](https://github.com/CortexReach/memory-lancedb-pro/issues) · Revert: `npm i memory-lancedb-pro@latest`

---

## Dependencies

| Package | Purpose |
| --- | --- |
| `@lancedb/lancedb` ≥0.26.2 | Vector database (ANN + FTS) |
| `openai` ≥6.21.0 | OpenAI-compatible Embedding API client |
| `@sinclair/typebox` 0.34.48 | JSON Schema type definitions |

---

## Contributors

Upstream maintainers and contributors (see the [full list](https://github.com/CortexReach/memory-lancedb-pro/graphs/contributors)):

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

## License

MIT
