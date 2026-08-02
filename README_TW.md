<div align="center">

# 🧠 memory-lancedb-pro · π Pi Coding Agent Extension

**AI Memory Assistant for the [pi coding agent](https://github.com/earendil-works/pi)**

*給你的 AI 智能體一個真正會記憶的大腦——跨會話、跨專案、跨時間。*

這是一個基於 LanceDB 的 pi 記憶擴充套件，用於儲存偏好、決策和專案上下文，並在未來的會話中自動召回。

[![Pi Extension](https://img.shields.io/badge/Pi-Extension-blue)](https://github.com/earendil-works/pi)
[![Pi 0.80+](https://img.shields.io/badge/pi-0.80%2B-brightgreen)](https://github.com/earendil-works/pi)
[![LanceDB](https://img.shields.io/badge/LanceDB-Vectorstore-orange)](https://lancedb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) | [简体中文](README_CN.md) | [繁體中文](README_TW.md) | [日本語](README_JA.md) | [한국어](README_KO.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Deutsch](README_DE.md) | [Italiano](README_IT.md) | [Русский](README_RU.md) | [Português (Brasil)](README_PT-BR.md)

</div>

---

## 🤖 關於本移植版

本倉庫是生產級記憶外掛 [memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)（MIT）的 **pi coding agent 移植版**。整個 OpenClaw 外掛核心保持原樣，透過一個薄適配層（`pi-adapter/`）原樣載入，因此 pi（≥ 0.80）可以獲得同樣的 LanceDB 驅動記憶引擎，與上游的差異極小。

> 以下所有內容均描述 pi 的使用體驗。關於移植差異對照表和原始 OpenClaw 用法，請參閱文末的 [OpenClaw 上游附錄](#openclaw-upstream-appendix)。

---

## 為什麼選擇 memory-lancedb-pro？

大多數 AI 智能體都有失憶症。只要你開啟一個新的聊天，它們就把一切都忘了。

**memory-lancedb-pro** 是一個生產級長期記憶擴充套件，能把你的智能體變成 **AI 記憶助手**——它自動捕捉重要的內容，讓噪音自然淡出，並在合適的時間檢索合適的記憶。無需手動打標籤，無需組態煩惱。

### 你的 AI 記憶助手的實際效果

**沒有記憶——每個會話都從零開始：**

> **你：** "縮排用 tab，永遠記得加上錯誤處理。"
> *（下一個會話）*
> **你：** "我跟你說過了——tab，不是空格！" 😤
> *（下一個會話）*
> **你：** "……說真的，tab。還有錯誤處理。再說一遍。"

**有了 memory-lancedb-pro——你的智能體會學習並記住：**

> **你：** "縮排用 tab，永遠記得加上錯誤處理。"
> *（下一個會話——智能體自動召回你的偏好）*
> **智能體：** *（默默套用 tab 縮排 + 錯誤處理）* ✅
> **你：** "我們上個月為什麼選 PostgreSQL 而不是 MongoDB？"
> **智能體：** "根據我們 2 月 12 日的討論，主要原因有……" ✅

這就是 **AI 記憶助手** 帶來的差別——它學習你的風格，召回過去的決策，提供個人化的回覆，而你無需重複自己。

### 它還能做什麼？

| | 你將獲得 |
|---|---|
| **自動捕捉** | 你的智能體從每一次對話中學習——無需手動 `memory_store` |
| **智慧提取** | LLM 驅動的 6 類別分類：檔案、偏好、實體、事件、案例、模式 |
| **智慧遺忘** | Weibull 衰減模型——重要記憶長存，噪音自然消逝 |
| **混合檢索** | 向量 + BM25 全文檢索，並融合交叉編碼器重新排序 |
| **上下文注入** | 每次回覆前自動浮現相關記憶 |
| **多作用域隔離** | 按智能體、按使用者、按專案的記憶邊界 |
| **任意提供商** | OpenAI、Jina、Gemini、Ollama，或任意 OpenAI 相容 API |
| **完整工具集** | CLI、備份、遷移、升級、匯出/匯入——生產就緒 |

---

## 快速開始

> **CPU 要求：** 你的 CPU 必須支援 **AVX** 指令。在某些 Linux x64 建置上，LanceDB 原生向量搜尋可能需要 **AVX2**，並且在僅支援 AVX 的 CPU 上可能因 `SIGILL` 崩潰；設定 `retrieval.disableNativeCosine: true` 或 `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` 可使用受限行掃描加 JavaScript 餘弦排序。用以下指令檢查 CPU 旗標：`grep -o 'avx[^ ]*' /proc/cpuinfo | head -1`（無輸出 = 不支援）。詳見 [#419](https://github.com/CortexReach/memory-lancedb-pro/issues/419) 和 [#644](https://github.com/CortexReach/memory-lancedb-pro/issues/644)。

### 1. 建置擴充套件

```bash
git clone https://github.com/lhxyzCJ/TestForPi-memory-lancedb-pro
cd TestForPi-memory-lancedb-pro && npm install && npm run build
```

pi 的入口點是 `dist/pi-adapter/index.js`（由 `pi-adapter/index.ts` 編譯而來）。

### 2. 註冊擴充套件

任選其一：

**A. 透過 pi 的設定檔（全域，所有專案）：**

新增到 `~/.pi/agent/settings.json`：

```json
{
  "extensions": [
    "/absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js"
  ]
}
```

**B. 透過 pi 套件管理員：**

```bash
pi install /absolute/path/to/TestForPi-memory-lancedb-pro
```

**C. 單一會話快速測試：**

```bash
pi -e /absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js
```

**D. 自動探索（無需修改設定）：** 將建置好的擴充套件（或一個帶有 `pi.extensions` 欄位的 `package.json`）放入 `~/.pi/agent/extensions/`（全域）或 `.pi/extensions/`（專案本機），然後重新啟動 pi。

### 3. 建立設定檔

建立 `~/.pi/agent/memory-lancedb-pro.json5`（也可以使用 `.json`，或透過 `$MEMORY_LANCEDB_PRO_CONFIG` 指向任意位置）：

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

> 設定文件結構與上游 OpenClaw 外掛條目完全一致——上面這種裸內層物件和 `{ "config": { ... } }` 包裝形式都會被接受。

### 4. 驗證

啟動一個 pi 會話，檢查啟動日誌：

```
memory-lancedb-pro: smart extraction enabled
memory-lancedb-pro@...: plugin registered (db: /root/.pi-agent/memory/lancedb-pro, ...)
```

然後讓智能體儲存並召回一些內容：

> **你：** "記住：我喜歡 tab 而不是空格。"
> **你：** "我的縮排偏好是什麼？"

### 為什麼採用這些預設值？

- `autoCapture` + `smartExtraction` → 你的智能體會自動從每次對話中學習
- `autoRecall` → 相關記憶在每次回覆前被注入
- `extractMinMessages: 2` → 在普通的兩輪對話中即可觸發提取
- `sessionMemory.enabled: false` → 第一天不會用會話摘要污染檢索

---

## ⚠️ 記憶架構（重要）

該擴充套件暴露一個記憶能力，由兩個協同儲存組成：

| 記憶層 | 儲存 | 用途 | 可召回？ |
|---|---|---|---|
| **外掛記憶** | LanceDB（向量儲存） | 透過 `memory_recall` / 自動召回進行語義檢索 | ✅ 是 |
| **規範語料庫** | `MEMORY.md`、`memory/**/*.md`、近期會話轉錄、`memory/dreaming/**/*.md` | 事實來源檔案和公共產物 | ✅ 當 `canonicalCorpus.enabled` 為 true 時，透過 LanceDB 語義索引 |

**關鍵原則：**
> 規範檔案仍是事實來源。LanceDB 是用於檢索它們的語義索引，附帶落地的路徑、行區間、片段和引用。

**這對你意味著什麼：**
- 需要語義召回？→ 使用 `memory_store` 或讓自動捕捉來完成
- `memory/YYYY-MM-DD.md` → 視為 **每日日誌 / 記錄**，也可以被索引用於語義查詢
- `MEMORY.md` → 經過整理的、人類可讀的參考資料，可作為規範上下文被索引
- `memory/dreaming/**/*.md` → 夢境報告，作為公共產物暴露，並作為反思上下文被索引
- 會話 JSONL 轉錄 → 當 `canonicalCorpus.includeSessionTranscripts` 啟用時，以 `source: "sessions"` 被索引
- 外掛記憶 → 持久事實、偏好、決策和自動捕捉記憶的主要寫入路徑

### 資料存放位置（pi）

| 內容 | 路徑 |
|---|---|
| 外掛資料庫（LanceDB） | `~/.pi/agent/memory/lancedb-pro`（或 `$MEMORY_LANCEDB_PRO_DB_PATH`） |
| Markdown 鏡像 | `~/.pi/agent/memory/md-mirror`（或 `$MEMORY_LANCEDB_PRO_MD_MIRROR_DIR`） |
| 會話轉錄 | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| 全域技能 | `~/.pi/agent/skills` |

基礎目錄是 `~/.pi/agent`；可用 `PI_CODING_AGENT_DIR` 或 `PI_AGENT_DIR` 覆寫。設定中的相對路徑（`dbPath`、`mdMirrorDir` 等）相對於 pi 智能體主目錄解析。

### 設定檔位置（依優先順序）

1. `$MEMORY_LANCEDB_PRO_CONFIG`（顯式路徑）
2. `~/.pi/agent/memory-lancedb-pro.json5`
3. `~/.pi/agent/memory-lancedb-pro.json`

如果沒有找到設定檔，擴充套件會記錄警告並保持停用——設定損壞或缺失絕不會讓 pi 會話崩潰。

---

## 核心功能

### 混合檢索

```
Query → embedQuery() ─┐
                       ├─→ Hybrid Fusion → Rerank → Lifecycle Decay Boost → Length Norm → Filter
Query → BM25 FTS ─────┘
```

- **向量搜尋** — 透過 LanceDB ANN（餘弦距離）進行語義相似度檢索
- **BM25 全文搜尋** — 透過 LanceDB FTS 索引進行精確關鍵字比對
- **混合融合** — 以向量得分為基礎，BM25 命中獲得加權提升（不是標準的 RRF——針對真實世界的召回品質調校）
- **可設定權重** — `vectorWeight`、`bm25Weight`、`minScore`

### 交叉編碼器重新排序

- 內建 **Jina**、**SiliconFlow**、**Voyage AI** 和 **Pinecone** 配接器
- 相容任何 Jina 相容端點（例如 Hugging Face TEI、DashScope）
- 混合評分：60% 交叉編碼器 + 40% 原始融合得分
- 優雅降級：API 失敗時回退到餘弦相似度

### 多階段評分管線

| 階段 | 效果 |
| --- | --- |
| **混合融合** | 結合語義召回與精確比對召回 |
| **交叉編碼器重排** | 提升語義精確命中的排名 |
| **生命週期衰減提升** | Weibull 新鮮度 + 存取頻率 + 重要性 × 信心度 |
| **長度正規化** | 防止長條目主導結果（錨點：500 字元） |
| **硬性最低分** | 移除不相關結果（預設：0.35） |
| **MMR 多樣性** | 餘弦相似度 > 0.85 → 降權 |

### 智慧記憶提取（v1.1.0）

- **LLM 驅動的 6 類別提取**：檔案、偏好、實體、事件、案例、模式
- **L0/L1/L2 分層儲存**：L0（單句索引）→ L1（結構化摘要）→ L2（完整敘述）
- **兩階段去重**：向量相似度預先過濾（≥0.7）→ LLM 語義決策（CREATE/MERGE/SKIP）
- **類別感知合併**：`profile` 總是合併，`events`/`cases` 只追加

### 記憶生命週期管理（v1.1.0）

- **Weibull 衰減引擎**：綜合得分 = 新近度 + 頻率 + 內在價值
- **三層晉級**：`Peripheral ↔ Working ↔ Core`，閾值可設定
- **存取強化**：頻繁召回的記憶衰減更慢（類間隔重複）
- **重要性調節的半衰期**：重要記憶衰減更慢

### 多作用域隔離

- 內建作用域：`global`、`agent:<id>`、`custom:<name>`、`project:<id>`、`user:<id>`
- 透過 `scopes.agentAccess` 進行智能體級存取控制
- 預設：每個智能體可存取 `global` 及其自身的 `agent:<id>` 作用域
- `memory_recall`、`memory_search`、`memory_list` 和 `memory_debug` 等唯讀工具在請求的作用域不可存取時會軟失敗：它們改為在呼叫者可存取的作用域內搜尋，並在 details 中回傳 `ignoredScope` 和 `accessibleScopes`。寫入和變更工具對不可存取的作用域仍回傳 `scope_access_denied`。

### 自動捕捉與自動召回

- **自動捕捉**（`agent_end`）：從對話中提取偏好/事實/決策/實體，去重後每輪最多儲存 3 筆
- **自動召回**（每次建置提示詞之前）：注入 `<relevant-memories>` 上下文（最多 3 筆）

> **注意：** 在 pi 上，這些 OpenClaw 鉤子（`agent_end`、`before_prompt_build` 等）由 `pi-adapter/shim.ts` 從 pi 生命週期事件（`agent_end`、`input`、`session_start`、`session_shutdown`、`tool_result`、`session_before_switch`、`session_before_fork`）對應而來。

### 噪音過濾與自適應檢索

- 過濾低品質內容：智能體拒絕、後設問題、問候語
- 對問候語、斜線指令、簡單確認、表情符號跳過檢索
- 對記憶關鍵字（"remember"、"previously"、"last time"）強制檢索
- 支援 CJK 感知閾值（中文 6 字元 vs 英文 15 字元）

---

<details>
<summary><strong>與內建 <code>memory-lancedb</code> 比較（點擊展開）</strong></summary>

| 功能 | 內建 `memory-lancedb` | **memory-lancedb-pro** |
| --- | :---: | :---: |
| 向量搜尋 | Yes | Yes |
| BM25 全文搜尋 | - | Yes |
| 混合融合（向量 + BM25） | - | Yes |
| 交叉編碼器重排（多提供商） | - | Yes |
| 新近度提升與時間衰減 | - | Yes |
| 長度正規化 | - | Yes |
| MMR 多樣性 | - | Yes |
| 多作用域隔離 | - | Yes |
| 噪音過濾 | - | Yes |
| 自適應檢索 | - | Yes |
| 管理 CLI | - | Yes |
| 會話記憶 | - | Yes |
| 任務感知嵌入 | - | Yes |
| **LLM 智慧提取（6 類別）** | - | Yes (v1.1.0) |
| **Weibull 衰減 + 層級晉級** | - | Yes (v1.1.0) |
| 任意 OpenAI 相容嵌入 | Limited | Yes |

</details>

---

## 設定

所有設定都位於 `~/.pi/agent/memory-lancedb-pro.json5`（或 `$MEMORY_LANCEDB_PRO_CONFIG`）。

API 金鑰欄位（`embedding.apiKey`、`retrieval.rerankApiKey` 和 `llm.apiKey`）接受純字串、`${ENV_VAR}` 佔位符或 SecretRef 物件。本外掛支援 `env` 和 `file` 兩種 SecretRef 來源：

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

對於 `source: "file"`，`id` 會相對於 pi 智能體主目錄解析，並按 UTF-8 檔案讀取。可選的 `provider` 欄位被接受，用於 SecretRef 物件形狀相容，但不用作提供商分派。`exec` 及其他 SecretRef 來源會被執行時設定驗證拒絕。

<details>
<summary><strong>完整設定範例</strong></summary>

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
<summary><strong>嵌入提供商</strong></summary>

適用於 **OpenAI 相容的嵌入 API**，包括針對 Jina、Voyage 等服務的提供商專屬負載配接器：

| 提供商 | 模型 | Base URL | 維度 |
| --- | --- | --- | --- |
| **Jina**（推薦） | `jina-embeddings-v5-text-small` | `https://api.jina.ai/v1` | 1024 |
| **OpenAI** | `text-embedding-3-small` | `https://api.openai.com/v1` | 1536 |
| **Voyage** | `voyage-4-lite` / `voyage-4` | `https://api.voyageai.com/v1` | 1024 / 1024 |
| **Google Gemini** | `gemini-embedding-001` | `https://generativelanguage.googleapis.com/v1beta/openai/` | 3072 |
| **Ollama**（本機） | `nomic-embed-text` | `http://localhost:11434/v1` | 取決於提供商 |

Voyage 嵌入請求使用 Voyage 的 `model` + `input` 負載形狀。當設定了 `requestDimensions` 時，會作為 `output_dimension` 傳送；`encoding_format` 等僅 OpenAI 的欄位會被省略。

為上下文或批次限制較小的本機嵌入伺服器設定 `embedding.maxInputChars`。外掛對 `nomic-embed-text` 採用保守預設值；啟用自動分塊後，較長的文件會在上限套用之前先被拆分，再傳送給每個提供商請求。

</details>

<details>
<summary><strong>重新排序提供商</strong></summary>

交叉編碼器重新排序透過 `rerankProvider` 支援多個提供商：

| 提供商 | `rerankProvider` | 範例模型 |
| --- | --- | --- |
| **Jina**（預設） | `jina` | `jina-reranker-v3` |
| **SiliconFlow**（有免費額度） | `siliconflow` | `BAAI/bge-reranker-v2-m3` |
| **Voyage AI** | `voyage` | `rerank-2.5` |
| **Pinecone** | `pinecone` | `bge-reranker-v2-m3` |

任何 Jina 相容的重排序端點也都可用——設定 `rerankProvider: "jina"` 並把 `rerankEndpoint` 指向你的服務（例如 Hugging Face TEI、DashScope `qwen3-rerank`）。

</details>

<details>
<summary><strong>智慧提取（LLM）—— v1.1.0</strong></summary>

當 `smartExtraction` 啟用時（預設：`true`），外掛使用 LLM 智慧提取和分類記憶，而不是基於正規表示式的觸發器。

| 欄位 | 型別 | 預設值 | 描述 |
|-------|------|---------|-------------|
| `smartExtraction` | boolean | `true` | 啟用/停用 LLM 驅動的 6 類別提取 |
| `llm.auth` | string | `api-key` | `api-key` 使用 `llm.apiKey` / `embedding.apiKey`；`oauth` 預設使用外掛作用域的 OAuth 權杖檔案 |
| `llm.apiKey` | string | *（回退到 `embedding.apiKey`）* | LLM 提供商的 API 金鑰 |
| `llm.model` | string | `openai/gpt-oss-120b` | LLM 模型名稱 |
| `llm.baseURL` | string | *（回退到 `embedding.baseURL`）* | LLM API 端點 |
| `llm.oauthProvider` | string | `openai-codex` | 當 `llm.auth` 為 `oauth` 時使用的 OAuth 提供商 id |
| `llm.oauthPath` | string | `~/.pi/agent/.memory-lancedb-pro/oauth.json` | 當 `llm.auth` 為 `oauth` 時使用的 OAuth 權杖檔案 |
| `llm.timeoutMs` | number | `30000` | LLM 請求逾時（毫秒） |
| `extractMinMessages` | number | `2` | 觸發提取所需的最小訊息數 |
| `extractMaxChars` | number | `8000` | 傳送給 LLM 的最大字元數 |

OAuth `llm` 設定（重用現有的 Codex / ChatGPT 登入快取來呼叫 LLM）：

> **注意：** OAuth 流程繼承自上游 OpenClaw 外掛。在 pi 上，`memory-pro auth login` 會呼叫相同的 OAuth 邏輯；權杖檔案預設位於 `~/.pi/agent/.memory-lancedb-pro/oauth.json`。

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

`llm.auth: "oauth"` 的注意事項：

- `llm.oauthProvider` 目前為 `openai-codex`。
- OAuth 權杖預設儲存在 `~/.pi/agent/.memory-lancedb-pro/oauth.json`。
- 如果你想把這個檔案放在別處，可以設定 `llm.oauthPath`。
- `auth login` 會把之前的 api-key `llm` 設定快照儲存在 OAuth 檔案旁邊，`auth logout` 會在快照存在時還原它。
- 從 `api-key` 切換到 `oauth` 不會自動繼承 `llm.baseURL`。只有在你有意使用自訂 ChatGPT/Codex 相容後端時，才需要在 OAuth 模式下手動設定它。

</details>

<details>
<summary><strong>舊 CPU 回退方案</strong></summary>

如果僅支援 AVX 的 Linux x64 主機在 LanceDB 原生向量搜尋中因 `SIGILL` 崩潰，可停用原生餘弦，讓 memory-lancedb-pro 掃描受限行並用 JavaScript 排序：

```json5
{
  retrieval: {
    disableNativeCosine: true
  }
}
```

也可以設定 `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` 達到相同效果。

</details>

<details>
<summary><strong>生命週期設定（衰減 + 層級）</strong></summary>

| 欄位 | 預設值 | 描述 |
|-------|---------|-------------|
| `decay.recencyHalfLifeDays` | `30` | Weibull 新近度衰減的基礎半衰期 |
| `decay.frequencyWeight` | `0.3` | 存取頻率在綜合得分中的權重 |
| `decay.intrinsicWeight` | `0.3` | `importance × confidence` 的權重 |
| `decay.betaCore` | `0.8` | `core` 記憶的 Weibull beta |
| `decay.betaWorking` | `1.0` | `working` 記憶的 Weibull beta |
| `decay.betaPeripheral` | `1.3` | `peripheral` 記憶的 Weibull beta |
| `tier.coreAccessThreshold` | `10` | 提升到 `core` 前的最小召回次數 |
| `tier.peripheralAgeDays` | `60` | 降級過時記憶的年齡閾值 |

</details>

<details>
<summary><strong>存取強化</strong></summary>

頻繁召回的記憶衰減得更慢（類間隔重複）。

設定鍵（位於 `retrieval` 下）：
- `reinforcementFactor`（0-2，預設：`0.5`）——設為 `0` 以停用
- `maxHalfLifeMultiplier`（1-10，預設：`3`）——有效半衰期的硬性上限

</details>

---

## CLI 指令

`npm run build` 之後即可使用 `memory-pro` 二進位：

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

在 pi 會話內，同一套管理功能以 **`/memory-pro`** 斜線指令的形式提供。

> CLI 與擴充套件讀取相同的設定檔（`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `~/.pi/agent/memory-lancedb-pro.json`）。

OAuth 登入流程：

1. 執行 `memory-pro auth login`
2. 在互動式終端機中省略 `--provider` 時，CLI 會在開啟瀏覽器之前顯示 OAuth 提供商選擇器
3. 除非設定了 `--no-browser`，指令會列印授權 URL 並開啟你的瀏覽器
4. 回呼成功後，指令會儲存外掛 OAuth 檔案（預設：`~/.pi/agent/.memory-lancedb-pro/oauth.json`），快照之前的 api-key `llm` 設定以供登出還原，並把外掛 `llm` 設定替換為 OAuth 設定（`auth`、`oauthProvider`、`model`、`oauthPath`）
5. `memory-pro auth logout` 會刪除該 OAuth 檔案，並在快照存在時還原之前的 api-key `llm` 設定

---

## 進階主題

<details>
<summary><strong>從更早的移植版本升級</strong></summary>

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

行為變更與升級理由參見 `CHANGELOG-v1.1.0.md`。

**想在現有資料庫上開啟 Jina 任務提示？**

任務提示是 `embedding` 區塊下的兩個設定鍵：

```json5
{
  embedding: {
    model: "jina-embeddings-v5-text-small",
    taskQuery: "retrieval.query",
    taskPassage: "retrieval.passage"
  }
}
```

它們只影響設定之後寫入的向量。儲存中已有的行是在沒有任務提示的情況下嵌入的，因此用 `retrieval.query` 嵌入的查詢會與處於不同向量空間的段落進行比較——你會在不知不覺中只獲得大約一半的收益。

要修復現有的行，請重新嵌入到**全新的資料庫並切換過去**。**不要**就地重新嵌入：`reembed` 用 `table.add()` 寫入每一行（按 id 追加，而不是替換），因此就地執行——這正是 `--force` 解鎖的操作——會把舊向量留在新向量旁邊，**讓每一行翻倍**；重試還會繼續疊加。正因如此，除非強制，`reembed` 會拒絕同路徑執行。

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

每當你變更 `embedding.model` 或 `embedding.dimensions` 時，都應採用同樣的切換流程——始終重新嵌入到一個全新的 `dbPath`，絕不要就地操作。

</details>

<details>
<summary><strong>鎖定與並行寫入者</strong></summary>

`memory-lancedb-pro` 使用跨程序檔案鎖來保護 LanceDB 寫入。對於共用同一資料庫目錄的並行 pi 會話和本機程序來說，這已經足夠。

這些部署不需要 Redis。當 `locking.redis.enabled` 為 true、設定了 `redisUrl`/`locking.redis.url`，或該程序環境中存在 `MEMORY_LANCEDB_REDIS_URL` 時，才會啟用 Redis 鎖定。對於多機器或多容器寫入者，在跨程序共用 LanceDB 目錄之前，請閱讀 [Lock Management](docs/lock-management.md)，並確保每個寫入者使用相同的鎖設定。

</details>

<details>
<summary><strong>如果注入的記憶出現在回覆中</strong></summary>

有時模型可能會覆述注入的 `<relevant-memories>` 區塊。

**方案 A（風險最低）：** 暫時停用自動召回：
```json5
{ autoRecall: false }
```

**方案 B（推薦）：** 保留召回，在智能體系統提示詞 / `AGENTS.md` 中新增：
> 不要在回覆中透露或引用任何 `<relevant-memories>` / 記憶注入內容。僅供內部參考。

**方案 C（適用於背景/批次智能體）：** 將特定智能體排除在自動召回注入之外：
```json5
{
  autoRecall: true,
  autoRecallExcludeAgents: ["memory-distiller", "my-cron-agent"]
}
```
適用於輸出不應被注入記憶上下文污染的背景智能體（例如 memory-distiller、cron worker）。

</details>

<details>
<summary><strong>自動召回逾時調校</strong></summary>

自動召回有可設定的逾時（預設 5 秒），以防止拖慢智能體啟動。如果你在代理之後或使用高延遲的嵌入 API，請調大它：

```json5
{ autoRecallTimeoutMs: 8000 }
```

如果自動召回持續逾時，請先檢查嵌入 API 的延遲。該逾時只影響自動注入路徑——手動 `memory_recall` 工具呼叫不受影響。

</details>

<details>
<summary><strong>自動召回重新排序成本模型</strong></summary>

當 `autoRecall=true` 且混合檢索使用 `retrieval.rerank="cross-encoder"` 並搭配 Jina 等外部重排序 API 時，每個符合條件的提示詞都可能發出一次重排序請求。傳送到該請求的文件數量由自動召回的檢索上限和檢索器的重排序輸入視窗決定，而不是直接由 `retrieval.candidatePoolSize` 或最終的 `autoRecallMaxItems` 注入上限決定。

例如，當 `autoRecallMaxItems: 3` 時，自動召回會向檢索請求 6 筆結果，混合檢索可能會向外部重排序器傳送多達 12 個候選，最後才注入至多 3 筆記憶。要減少外部重排序用量，可以調低 `autoRecallMaxItems` 或 `maxRecallPerTurn`，把 `retrieval.rerank` 切換為 `"lightweight"` 或 `"none"`，調高 `autoRecallMinLength`，或者保持自動召回停用，在合適的地方使用手動 `memory_recall`。

當自動召回搭配混合交叉編碼器重排序、可能傳送給重排序器的條目比最終注入的更多時，啟動日誌會發出警告。偵錯自動召回統計包含實際的 `rerankInput`、`rerankInputLimit`、`retrieveLimit`、`rerank`、`rerankProvider` 和設定的 `retrievalCandidatePoolSize`。

</details>

<details>
<summary><strong>會話記憶</strong></summary>

- 在新會話事件時觸發——將上一個會話摘要儲存到 LanceDB
- 預設停用（pi 本身已持久化 `.jsonl` 會話轉錄）
- 訊息數量可設定（預設：15）

</details>

<details>
<summary><strong>自訂斜線指令（例如 /lesson）</strong></summary>

新增到你的 `AGENTS.md` 或系統提示詞中：

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
<summary><strong>AI 智能體的鐵律</strong></summary>

> 將下面的程式碼區塊複製到你的 `AGENTS.md` 中，讓你的智能體自動執行這些規則。

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
<summary><strong>資料庫結構</strong></summary>

LanceDB 表 `memories`：

| 欄位 | 型別 | 描述 |
| --- | --- | --- |
| `id` | string (UUID) | 主鍵 |
| `text` | string | 記憶文字（FTS 索引） |
| `vector` | float[] | 嵌入向量 |
| `category` | string | 儲存類別：`preference` / `fact` / `decision` / `entity` / `reflection` / `other` |
| `scope` | string | 作用域識別碼（例如 `global`、`agent:main`） |
| `importance` | float | 重要性評分 0-1 |
| `timestamp` | int64 | 建立時間戳（ms） |
| `metadata` | string (JSON) | 擴充中繼資料 |

v1.1.0 中常見的 `metadata` 鍵：`l0_abstract`、`l1_overview`、`l2_content`、`memory_category`、`tier`、`access_count`、`confidence`、`last_accessed_at`

> **關於類別的說明：** 頂層 `category` 欄位使用 6 種儲存類別。智慧提取產生的 6 類別語義標籤（`profile` / `preferences` / `entities` / `events` / `cases` / `patterns`）儲存在 `metadata.memory_category` 中。

</details>

<details>
<summary><strong>故障排除</strong></summary>

**擴充套件未載入 / "no config file found"**

建立 `~/.pi/agent/memory-lancedb-pro.json5` 或設定 `$MEMORY_LANCEDB_PRO_CONFIG`。擴充套件會列印一條包含預期形狀的警告並保持停用——pi 繼續執行。

**智慧提取初始化失敗**

檢查 `llm.apiKey` / `${ENV_VAR}` 是否已設定；外掛會回退到正規表示式提取，而不是失敗。

**"Cannot mix BigInt and other types"（LanceDB / Apache Arrow）**

在 LanceDB 0.26+ 上，某些數字欄位可能會以 `BigInt` 回傳。升級到 **memory-lancedb-pro >= 1.0.14**——本外掛現在會在算術之前用 `Number(...)` 強制轉換值。

</details>

---

## 架構

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

> 深入理解完整架構，請參閱 [docs/memory_architecture_analysis.md](docs/memory_architecture_analysis.md)。

<details>
<summary><strong>檔案參考（點擊展開）</strong></summary>

| 檔案 | 用途 |
| --- | --- |
| `pi-adapter/index.ts` | Pi 入口點：載入設定檔、建置 OpenClaw API shim、註冊外掛核心 |
| `pi-adapter/shim.ts` | 將 pi 生命週期事件 / 工具 / 指令對應到 OpenClaw 外掛 API |
| `pi-adapter/config.ts` | 設定檔載入（`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `.json`） |
| `pi-adapter/paths.ts` | Pi 路徑解析（`~/.pi/agent`、環境變數覆寫） |
| `pi-adapter/pi-runner.ts` | 透過 `pi --mode json --no-tools ...` 執行的嵌入式子智能體執行器 |
| `pi-adapter/cli-main.ts` | 獨立的 `memory-pro` CLI 入口 |
| `index.ts` | 外掛核心入口：設定解析、生命週期鉤子、記憶能力註冊 |
| `src/store.ts` | LanceDB 儲存層。表建立 / FTS 索引 / 向量搜尋 / BM25 搜尋 / CRUD |
| `src/embedder.ts` | 嵌入抽象。相容任何 OpenAI 相容 API 提供商 |
| `src/retriever.ts` | 混合檢索引擎。向量 + BM25 → 混合融合 → 重排 → 生命週期衰減 → 過濾 |
| `src/scopes.ts` | 多作用域存取控制 |
| `src/tools.ts` | 智能體工具定義：`memory_recall`、`memory_store`、`memory_forget`、`memory_update` + 管理工具 |
| `src/noise-filter.ts` | 過濾智能體拒絕、後設問題、問候語和低品質內容 |
| `src/adaptive-retrieval.ts` | 判斷一個查詢是否需要記憶檢索 |
| `src/migrate.ts` | 從內建 `memory-lancedb` 遷移到 Pro |
| `src/smart-extractor.ts` | LLM 驅動的 6 類別提取，帶 L0/L1/L2 分層儲存和兩階段去重 |
| `src/decay-engine.ts` | Weibull 拉伸指數衰減模型 |
| `src/tier-manager.ts` | 三層晉級/降級：Peripheral ↔ Working ↔ Core |

</details>

---

## OpenClaw 上游附錄

本倉庫是一個移植版。上游專案是 **[CortexReach/memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)**——一個 OpenClaw 外掛。下面所有內容都描述上游 OpenClaw 的用法；pi 使用者不需要它。

### 變更內容（移植差異）

| 區域 | OpenClaw（上游） | Pi（本移植版） |
|---|---|---|
| 擴充套件引導 | `openclaw.plugin.json` / `openclaw.extensions` | `pi-adapter/index.ts` → 編譯後的 `dist/pi-adapter/index.js`，透過 `package.json` 中的 `pi.extensions` 宣告 |
| 設定檔 | `openclaw.json` 外掛條目 | `~/.pi/agent/memory-lancedb-pro.json5`（或 `$MEMORY_LANCEDB_PRO_CONFIG`）——文件結構相同 |
| 資料與會話基礎目錄 | `~/.openclaw/...` | `~/.pi/agent/...`（可用 `PI_CODING_AGENT_DIR` / `PI_AGENT_DIR` 覆寫） |
| CLI | `openclaw memory-pro …` | 獨立二進位：`memory-pro …`（由 `pi-adapter/cli-main.ts` 編譯而來） |
| 斜線指令 | `openclaw` 註冊的 CLI | 透過 shim 呼叫 `pi.registerCommand("/memory-pro", ...)` |
| 嵌入式子智能體執行器 | OpenClaw 執行時期 API | 透過 shell 呼叫 `pi --mode json --no-tools …`（`pi-adapter/pi-runner.ts`） |
| 會話佈局 | `~/.openclaw/agents/<id>/sessions/*.jsonl` | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| 版本 | `1.1.0-beta.11` | `1.1.0-beta.11-pi.1` |

生命週期事件透過 `pi-adapter/shim.ts` 從 pi 事件對應到 OpenClaw 鉤子：`input`、`session_start`、`before_agent_start`、`agent_end`、`session_shutdown`、`tool_result`、`session_before_switch`、`session_before_fork`。外掛的工具（`memory_store`、`memory_recall` 等）和 `/memory-pro` 斜線指令透過 shim 原樣註冊。

### 上游快速開始（僅 OpenClaw）

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

上游指令使用 `openclaw memory-pro ...` 前綴。完整的 OpenClaw 文件請參閱[上游 README](https://github.com/CortexReach/memory-lancedb-pro)。

### 上游生態

- **[Setup 腳本](https://github.com/CortexReach/toolbox/tree/main/memory-lancedb-pro-setup)** — 為 OpenClaw 部署提供一鍵安裝/升級/修復（寫入 `openclaw.json`）
- **[AI 引導設定技能](https://github.com/CortexReach/memory-lancedb-pro-skill)** — 適用於 Claude Code / OpenClaw 智能體
- **影片教學** — [YouTube](https://youtu.be/MtukF1C8epQ) · [Bilibili](https://www.bilibili.com/video/BV1zUf2BGEgn/)
- **Star 歷史** — [star-history.com](https://star-history.com/#CortexReach/memory-lancedb-pro&Date)

---

## 文件

| 文件 | 描述 |
| --- | --- |
| [Memory Architecture Analysis](docs/memory_architecture_analysis.md) | 完整架構深入解析 |
| [CHANGELOG v1.1.0](docs/CHANGELOG-v1.1.0.md) | v1.1.0 行為變更與升級理由 |
| [Release Checklist](docs/release-checklist.md) | 打包預檢、發布試執行與發布後冒煙檢查 |
| [Long-Context Chunking](docs/long-context-chunking.md) | 長文件的分塊策略 |
| [Lock Management](docs/lock-management.md) | 多寫入者鎖定（Redis）詳情 |

## 測試

```bash
npm test                       # full unit/e2e suite
node scripts/run-ci-tests.mjs --all   # full CI manifest
npm run test:pi-adapter        # pi adapter smoke test (mock pi API)
```

所有上游測試都被保留；`test/pi-adapter-smoke.test.mjs` 和 `test:pi-adapter` 是新增的。

---

## Beta：智慧記憶 v1.1.0

> 狀態：Beta——透過 `npm i memory-lancedb-pro@beta` 取得。使用 `latest` 的穩定版使用者不受影響。

| 功能 | 描述 |
|---------|-------------|
| **智慧提取** | LLM 驅動的 6 類別提取，帶 L0/L1/L2 中繼資料。停用時回退到正規表示式。 |
| **生命週期評分** | Weibull 衰減整合到檢索中——高頻和高重要性的記憶排名更高。 |
| **層級管理** | 三層系統（Core → Working → Peripheral），自動晉級/降級。 |

回饋：[GitHub Issues](https://github.com/CortexReach/memory-lancedb-pro/issues) · 回退：`npm i memory-lancedb-pro@latest`

---

## 依賴

| 套件 | 用途 |
| --- | --- |
| `@lancedb/lancedb` ≥0.26.2 | 向量資料庫（ANN + FTS） |
| `openai` ≥6.21.0 | OpenAI 相容嵌入 API 用戶端 |
| `@sinclair/typebox` 0.34.48 | JSON Schema 型別定義 |

---

## 貢獻者

上游維護者與貢獻者（參見[完整列表](https://github.com/CortexReach/memory-lancedb-pro/graphs/contributors)）：

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

## 授權

MIT
