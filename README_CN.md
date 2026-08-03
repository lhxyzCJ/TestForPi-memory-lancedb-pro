<div align="center">

# 🧠 memory-lancedb-pro · π Pi Coding Agent Extension

**AI Memory Assistant for the [pi coding agent](https://github.com/earendil-works/pi)**

*给你的 AI 智能体一个真正会记忆的大脑——跨会话、跨项目、跨时间。*

这是一个基于 LanceDB 的 pi 记忆扩展，用于存储偏好、决策和项目上下文，并在未来的会话中自动召回。

[![Pi Extension](https://img.shields.io/badge/Pi-Extension-blue)](https://github.com/earendil-works/pi)
[![Pi 0.80+](https://img.shields.io/badge/pi-0.80%2B-brightgreen)](https://github.com/earendil-works/pi)
[![LanceDB](https://img.shields.io/badge/LanceDB-Vectorstore-orange)](https://lancedb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) | [简体中文](README_CN.md) | [繁體中文](README_TW.md) | [日本語](README_JA.md) | [한국어](README_KO.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Deutsch](README_DE.md) | [Italiano](README_IT.md) | [Русский](README_RU.md) | [Português (Brasil)](README_PT-BR.md)

</div>

---

## 🤖 关于本移植版

本仓库是生产级记忆插件 [memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)（MIT）的 **pi coding agent 移植版**。整个 OpenClaw 插件核心保持原样，通过一个薄适配层（`pi-adapter/`）原样加载，因此 pi（≥ 0.80）可以获得同样的 LanceDB 驱动记忆引擎，与上游的差异极小。

> 以下所有内容均描述 pi 的使用体验。关于移植差异对照表和原始 OpenClaw 用法，请参阅文末的 [OpenClaw 上游附录](#openclaw-upstream-appendix)。

---

## 为什么选择 memory-lancedb-pro？

大多数 AI 智能体都有失忆症。只要你开启一个新的聊天，它们就把一切都忘了。

**memory-lancedb-pro** 是一个生产级长期记忆扩展，能把你的智能体变成 **AI 记忆助手**——它自动捕获重要的内容，让噪音自然淡出，并在合适的时间检索合适的记忆。无需手动打标签，无需配置烦恼。

### 你的 AI 记忆助手的实际效果

**没有记忆——每个会话都从零开始：**

> **你：** "缩进用 tab，永远记得加上错误处理。"
> *（下一个会话）*
> **你：** "我跟你说过了——tab，不是空格！" 😤
> *（下一个会话）*
> **你：** "……说真的，tab。还有错误处理。再说一遍。"

**有了 memory-lancedb-pro——你的智能体会学习并记住：**

> **你：** "缩进用 tab，永远记得加上错误处理。"
> *（下一个会话——智能体自动召回你的偏好）*
> **智能体：** *（默默应用 tab 缩进 + 错误处理）* ✅
> **你：** "我们上个月为什么选 PostgreSQL 而不是 MongoDB？"
> **智能体：** "根据我们 2 月 12 日的讨论，主要原因有……" ✅

这就是 **AI 记忆助手** 带来的差别——它学习你的风格，召回过去的决策，提供个性化的回复，而你无需重复自己。

### 它还能做什么？

| | 你将获得 |
|---|---|
| **自动捕获** | 你的智能体从每一次对话中学习——无需手动 `memory_store` |
| **智能提取** | LLM 驱动的 6 类别分类：画像、偏好、实体、事件、案例、模式 |
| **智能遗忘** | Weibull 衰减模型——重要记忆长存，噪音自然消逝 |
| **混合检索** | 向量 + BM25 全文检索，并融合交叉编码器重排序 |
| **上下文注入** | 每次回复前自动浮现相关记忆 |
| **多作用域隔离** | 按智能体、按用户、按项目的记忆边界 |
| **任意提供商** | OpenAI、Jina、Gemini、Ollama，或任意 OpenAI 兼容 API |
| **完整工具集** | CLI、备份、迁移、升级、导出/导入——生产就绪 |

---

## 快速开始

> **CPU 要求：** 你的 CPU 必须支持 **AVX** 指令。在某些 Linux x64 构建上，LanceDB 原生向量搜索可能需要 **AVX2**，并且在仅支持 AVX 的 CPU 上可能因 `SIGILL` 崩溃；设置 `retrieval.disableNativeCosine: true` 或 `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` 可使用受限行扫描加 JavaScript 余弦排序。用以下命令检查 CPU 标志：`grep -o 'avx[^ ]*' /proc/cpuinfo | head -1`（无输出 = 不支持）。详见 [#419](https://github.com/CortexReach/memory-lancedb-pro/issues/419) 和 [#644](https://github.com/CortexReach/memory-lancedb-pro/issues/644)。

### 1. 构建扩展

```bash
git clone https://github.com/lhxyzCJ/TestForPi-memory-lancedb-pro
cd TestForPi-memory-lancedb-pro && npm install && npm run build
```

pi 的入口点是 `dist/pi-adapter/index.js`（由 `pi-adapter/index.ts` 编译而来）。

### 2. 注册扩展

任选其一：

**A. 通过 pi 的设置文件（全局，所有项目）：**

添加到 `~/.pi/agent/settings.json`：

```json
{
  "extensions": [
    "/absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js"
  ]
}
```

**B. 通过 pi 包管理器：**

```bash
pi install /absolute/path/to/TestForPi-memory-lancedb-pro
```

**C. 单会话快速测试：**

```bash
pi -e /absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js
```

**D. 自动发现（无需修改设置）：** 将构建好的扩展（或一个带有 `pi.extensions` 字段的 `package.json`）放入 `~/.pi/agent/extensions/`（全局）或 `.pi/extensions/`（项目本地），然后重启 pi。

### 3. 创建配置文件

创建 `~/.pi/agent/memory-lancedb-pro.json5`（也可以使用 `.json`，或通过 `$MEMORY_LANCEDB_PRO_CONFIG` 指向任意位置）：

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

> 配置文档结构与上游 OpenClaw 插件条目完全一致——上面这种裸内层对象和 `{ "config": { ... } }` 包装形式都会被接受。

### 4. 验证

启动一个 pi 会话，检查启动日志：

```
memory-lancedb-pro: smart extraction enabled
memory-lancedb-pro@...: plugin registered (db: /root/.pi-agent/memory/lancedb-pro, ...)
```

然后让智能体存储并召回一些内容：

> **你：** "记住：我喜欢 tab 而不是空格。"
> **你：** "我的缩进偏好是什么？"

### 为什么采用这些默认值？

- `autoCapture` + `smartExtraction` → 你的智能体会自动从每次对话中学习
- `autoRecall` → 相关记忆在每次回复前被注入
- `extractMinMessages: 2` → 在普通的两轮对话中即可触发提取
- `sessionMemory.enabled: false` → 第一天不会用会话摘要污染检索

---

## 运行时要求（pi）

以下要求来自 pi 宿主环境，不在 `memory-lancedb-pro.json5` 中配置：

1. **默认 provider** — 嵌入式反思/梦境子代理通过 `pi` CLI 生成，不带 `--provider`/`--model`，继承宿主默认值。请在 `~/.pi/agent/settings.json` 中设置 `defaultProvider`/`defaultModel`（例如 `"defaultProvider": "opencode-go", "defaultModel": "deepseek-v4-flash"`），否则子代理可能落到失效或非预期的 provider。
2. **嵌入端点** — 嵌入 API 必须可达（例如会话前启动 Ollama）；端点不可达会静默降级智能提取为 regex 兜底。
3. **LLM API key** — 智能提取需要有效的 LLM key（`llm.apiKey`，例如 `"${OPENCODE_API_KEY}"`）；缺失时提取降级为 regex 捕获。
4. **升级路径** — pi 从 `settings.json`（`extensions`）记录的绝对路径加载扩展。更新本仓库后需重新执行 `pi install`（或替换已安装副本），否则 pi 仍加载旧构建。

**与上游的已知差距：** 上游的 batch-utility 准入模式（#941，`utilityMode: "batch"`、`utilityVetoThreshold`）未移植；`utilityMode` 仅支持 `"standalone" | "off"`。

## ⚠️ 记忆架构（重要）

该扩展暴露一个记忆能力，由两个协同存储组成：

| 记忆层 | 存储 | 用途 | 可召回？ |
|---|---|---|---|
| **插件记忆** | LanceDB（向量存储） | 通过 `memory_recall` / 自动召回进行语义检索 | ✅ 是 |
| **规范语料库** | `MEMORY.md`、`memory/**/*.md`、近期会话转录、`memory/dreaming/**/*.md` | 事实来源文件和公共产物 | ✅ 当 `canonicalCorpus.enabled` 为 true 时，通过 LanceDB 语义索引 |

**关键原则：**
> 规范文件仍是事实来源。LanceDB 是用于检索它们的语义索引，附带落地的路径、行区间、片段和引用。

**这对你意味着什么：**
- 需要语义召回？→ 使用 `memory_store` 或让自动捕获来完成
- `memory/YYYY-MM-DD.md` → 视为 **每日日志 / 记录**，也可以被索引用于语义查询
- `MEMORY.md` → 经过整理的、人类可读的参考资料，可作为规范上下文被索引
- `memory/dreaming/**/*.md` → 梦境报告，作为公共产物暴露，并作为反思上下文被索引
- 会话 JSONL 转录 → 当 `canonicalCorpus.includeSessionTranscripts` 启用时，以 `source: "sessions"` 被索引
- 插件记忆 → 持久事实、偏好、决策和自动捕获记忆的主要写入路径

### 数据存放位置（pi）

| 内容 | 路径 |
|---|---|
| 插件数据库（LanceDB） | `~/.pi/agent/memory/lancedb-pro`（或 `$MEMORY_LANCEDB_PRO_DB_PATH`） |
| Markdown 镜像 | `~/.pi/agent/memory/md-mirror`（或 `$MEMORY_LANCEDB_PRO_MD_MIRROR_DIR`） |
| 会话转录 | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| 全局技能 | `~/.pi/agent/skills` |

基础目录是 `~/.pi/agent`；可用 `PI_CODING_AGENT_DIR` 或 `PI_AGENT_DIR` 覆盖。配置中的相对路径（`dbPath`、`mdMirrorDir` 等）相对于 pi 智能体主目录解析。

### 配置文件位置（按优先级）

1. `$MEMORY_LANCEDB_PRO_CONFIG`（显式路径）
2. `~/.pi/agent/memory-lancedb-pro.json5`
3. `~/.pi/agent/memory-lancedb-pro.json`

如果没有找到配置文件，扩展会记录警告并保持禁用——配置损坏或缺失绝不会让 pi 会话崩溃。

---

## 核心功能

### 混合检索

```
Query → embedQuery() ─┐
                       ├─→ Hybrid Fusion → Rerank → Lifecycle Decay Boost → Length Norm → Filter
Query → BM25 FTS ─────┘
```

- **向量搜索** — 通过 LanceDB ANN（余弦距离）进行语义相似度检索
- **BM25 全文搜索** — 通过 LanceDB FTS 索引进行精确关键词匹配
- **混合融合** — 以向量得分为基础，BM25 命中获得加权提升（不是标准的 RRF——针对真实世界的召回质量调优）
- **可配置权重** — `vectorWeight`、`bm25Weight`、`minScore`

### 交叉编码器重排序

- 内置 **Jina**、**SiliconFlow**、**Voyage AI** 和 **Pinecone** 适配器
- 兼容任何 Jina 兼容端点（例如 Hugging Face TEI、DashScope）
- 混合评分：60% 交叉编码器 + 40% 原始融合得分
- 优雅降级：API 失败时回退到余弦相似度

### 多阶段评分管线

| 阶段 | 效果 |
| --- | --- |
| **混合融合** | 结合语义召回与精确匹配召回 |
| **交叉编码器重排** | 提升语义精确命中的排名 |
| **生命周期衰减提升** | Weibull 新鲜度 + 访问频率 + 重要性 × 置信度 |
| **长度归一化** | 防止长条目主导结果（锚点：500 字符） |
| **硬性最低分** | 移除不相关结果（默认：0.35） |
| **MMR 多样性** | 余弦相似度 > 0.85 → 降权 |

### 智能记忆提取（v1.1.0）

- **LLM 驱动的 6 类别提取**：画像、偏好、实体、事件、案例、模式
- **L0/L1/L2 分层存储**：L0（单句索引）→ L1（结构化摘要）→ L2（完整叙述）
- **两阶段去重**：向量相似度预过滤（≥0.7）→ LLM 语义决策（CREATE/MERGE/SKIP）
- **类别感知合并**：`profile` 总是合并，`events`/`cases` 只追加

### 记忆生命周期管理（v1.1.0）

- **Weibull 衰减引擎**：综合得分 = 新近度 + 频率 + 内在价值
- **三层晋级**：`Peripheral ↔ Working ↔ Core`，阈值可配置
- **访问强化**：频繁召回的记忆衰减更慢（类间隔重复）
- **重要性调节的半衰期**：重要记忆衰减更慢

### 多作用域隔离

- 内置作用域：`global`、`agent:<id>`、`custom:<name>`、`project:<id>`、`user:<id>`
- 通过 `scopes.agentAccess` 进行智能体级访问控制
- 默认：每个智能体可访问 `global` 及其自身的 `agent:<id>` 作用域
- `memory_recall`、`memory_search`、`memory_list` 和 `memory_debug` 等只读工具在请求的作用域不可访问时会软失败：它们改为在调用者可访问的作用域内搜索，并在 details 中返回 `ignoredScope` 和 `accessibleScopes`。写入和变更工具对不可访问的作用域仍返回 `scope_access_denied`。

### 自动捕获与自动召回

- **自动捕获**（`agent_end`）：从对话中提取偏好/事实/决策/实体，去重后每轮最多存储 3 条
- **自动召回**（每次构建提示词之前）：注入 `<relevant-memories>` 上下文（最多 3 条）

> **注意：** 在 pi 上，这些 OpenClaw 钩子（`agent_end`、`before_prompt_build` 等）由 `pi-adapter/shim.ts` 从 pi 生命周期事件（`agent_end`、`input`、`session_start`、`session_shutdown`、`tool_result`、`session_before_switch`、`session_before_fork`）映射而来。

### 噪音过滤与自适应检索

- 过滤低质量内容：智能体拒绝、元问题、问候语
- 对问候语、斜杠命令、简单确认、表情符号跳过检索
- 对记忆关键词（"remember"、"previously"、"last time"）强制检索
- 支持 CJK 感知阈值（中文 6 字符 vs 英文 15 字符）

---

<details>
<summary><strong>与内置 <code>memory-lancedb</code> 对比（点击展开）</strong></summary>

| 功能 | 内置 `memory-lancedb` | **memory-lancedb-pro** |
| --- | :---: | :---: |
| 向量搜索 | Yes | Yes |
| BM25 全文搜索 | - | Yes |
| 混合融合（向量 + BM25） | - | Yes |
| 交叉编码器重排（多提供商） | - | Yes |
| 新近度提升与时间衰减 | - | Yes |
| 长度归一化 | - | Yes |
| MMR 多样性 | - | Yes |
| 多作用域隔离 | - | Yes |
| 噪音过滤 | - | Yes |
| 自适应检索 | - | Yes |
| 管理 CLI | - | Yes |
| 会话记忆 | - | Yes |
| 任务感知嵌入 | - | Yes |
| **LLM 智能提取（6 类别）** | - | Yes (v1.1.0) |
| **Weibull 衰减 + 层级晋级** | - | Yes (v1.1.0) |
| 任意 OpenAI 兼容嵌入 | Limited | Yes |

</details>

---

## 配置

所有配置都位于 `~/.pi/agent/memory-lancedb-pro.json5`（或 `$MEMORY_LANCEDB_PRO_CONFIG`）。

API 密钥字段（`embedding.apiKey`、`retrieval.rerankApiKey` 和 `llm.apiKey`）接受纯字符串、`${ENV_VAR}` 占位符或 SecretRef 对象。本插件支持 `env` 和 `file` 两种 SecretRef 来源：

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

对于 `source: "file"`，`id` 会相对于 pi 智能体主目录解析，并按 UTF-8 文件读取。可选的 `provider` 字段被接受，用于 SecretRef 对象形状兼容，但不用于提供商分派。`exec` 及其他 SecretRef 来源会被运行时配置校验拒绝。

<details>
<summary><strong>完整配置示例</strong></summary>

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

适用于 **OpenAI 兼容的嵌入 API**，包括针对 Jina、Voyage 等服务的提供商专属负载适配器：

| 提供商 | 模型 | Base URL | 维度 |
| --- | --- | --- | --- |
| **Jina**（推荐） | `jina-embeddings-v5-text-small` | `https://api.jina.ai/v1` | 1024 |
| **OpenAI** | `text-embedding-3-small` | `https://api.openai.com/v1` | 1536 |
| **Voyage** | `voyage-4-lite` / `voyage-4` | `https://api.voyageai.com/v1` | 1024 / 1024 |
| **Google Gemini** | `gemini-embedding-001` | `https://generativelanguage.googleapis.com/v1beta/openai/` | 3072 |
| **Ollama**（本地） | `nomic-embed-text` | `http://localhost:11434/v1` | 取决于提供商 |

Voyage 嵌入请求使用 Voyage 的 `model` + `input` 负载形状。当配置了 `requestDimensions` 时，会作为 `output_dimension` 发送；`encoding_format` 等仅 OpenAI 的字段会被省略。

为上下文或批量限制较小的本地嵌入服务器设置 `embedding.maxInputChars`。插件对 `nomic-embed-text` 采用保守默认值；启用自动分块后，较长的文档会在应用上限之前先被拆分，再发送给每个提供商请求。

</details>

<details>
<summary><strong>重排序提供商</strong></summary>

交叉编码器重排序通过 `rerankProvider` 支持多个提供商：

| 提供商 | `rerankProvider` | 示例模型 |
| --- | --- | --- |
| **Jina**（默认） | `jina` | `jina-reranker-v3` |
| **SiliconFlow**（有免费额度） | `siliconflow` | `BAAI/bge-reranker-v2-m3` |
| **Voyage AI** | `voyage` | `rerank-2.5` |
| **Pinecone** | `pinecone` | `bge-reranker-v2-m3` |

任何 Jina 兼容的重排序端点也都可用——设置 `rerankProvider: "jina"` 并把 `rerankEndpoint` 指向你的服务（例如 Hugging Face TEI、DashScope `qwen3-rerank`）。

</details>

<details>
<summary><strong>智能提取（LLM）—— v1.1.0</strong></summary>

当 `smartExtraction` 启用时（默认：`true`），插件使用 LLM 智能提取和分类记忆，而不是基于正则的触发器。

| 字段 | 类型 | 默认值 | 描述 |
|-------|------|---------|-------------|
| `smartExtraction` | boolean | `true` | 启用/禁用 LLM 驱动的 6 类别提取 |
| `llm.auth` | string | `api-key` | `api-key` 使用 `llm.apiKey` / `embedding.apiKey`；`oauth` 默认使用插件作用域的 OAuth 令牌文件 |
| `llm.apiKey` | string | *（回退到 `embedding.apiKey`）* | LLM 提供商的 API 密钥 |
| `llm.model` | string | `openai/gpt-oss-120b` | LLM 模型名称 |
| `llm.baseURL` | string | *（回退到 `embedding.baseURL`）* | LLM API 端点 |
| `llm.oauthProvider` | string | `openai-codex` | 当 `llm.auth` 为 `oauth` 时使用的 OAuth 提供商 id |
| `llm.oauthPath` | string | `~/.pi/agent/.memory-lancedb-pro/oauth.json` | 当 `llm.auth` 为 `oauth` 时使用的 OAuth 令牌文件 |
| `llm.timeoutMs` | number | `30000` | LLM 请求超时（毫秒） |
| `extractMinMessages` | number | `2` | 触发提取所需的最小消息数 |
| `extractMaxChars` | number | `8000` | 发送给 LLM 的最大字符数 |

OAuth `llm` 配置（复用现有的 Codex / ChatGPT 登录缓存来调用 LLM）：

> **注意：** OAuth 流程继承自上游 OpenClaw 插件。在 pi 上，`memory-pro auth login` 会调用相同的 OAuth 逻辑；令牌文件默认位于 `~/.pi/agent/.memory-lancedb-pro/oauth.json`。

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

`llm.auth: "oauth"` 的注意事项：

- `llm.oauthProvider` 目前为 `openai-codex`。
- OAuth 令牌默认存储在 `~/.pi/agent/.memory-lancedb-pro/oauth.json`。
- 如果你想把这个文件放在别处，可以设置 `llm.oauthPath`。
- `auth login` 会把之前的 api-key `llm` 配置快照保存在 OAuth 文件旁边，`auth logout` 会在快照存在时恢复它。
- 从 `api-key` 切换到 `oauth` 不会自动继承 `llm.baseURL`。只有在你有意使用自定义的 ChatGPT/Codex 兼容后端时，才需要在 OAuth 模式下手动设置它。

</details>

<details>
<summary><strong>旧 CPU 回退方案</strong></summary>

如果仅支持 AVX 的 Linux x64 主机在 LanceDB 原生向量搜索中因 `SIGILL` 崩溃，可禁用原生余弦，让 memory-lancedb-pro 扫描受限行并用 JavaScript 排序：

```json5
{
  retrieval: {
    disableNativeCosine: true
  }
}
```

也可以设置 `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` 达到相同效果。

</details>

<details>
<summary><strong>生命周期配置（衰减 + 层级）</strong></summary>

| 字段 | 默认值 | 描述 |
|-------|---------|-------------|
| `decay.recencyHalfLifeDays` | `30` | Weibull 新近度衰减的基础半衰期 |
| `decay.frequencyWeight` | `0.3` | 访问频率在综合得分中的权重 |
| `decay.intrinsicWeight` | `0.3` | `importance × confidence` 的权重 |
| `decay.betaCore` | `0.8` | `core` 记忆的 Weibull beta |
| `decay.betaWorking` | `1.0` | `working` 记忆的 Weibull beta |
| `decay.betaPeripheral` | `1.3` | `peripheral` 记忆的 Weibull beta |
| `tier.coreAccessThreshold` | `10` | 提升到 `core` 前的最小召回次数 |
| `tier.peripheralAgeDays` | `60` | 降级过时记忆的年龄阈值 |

</details>

<details>
<summary><strong>访问强化</strong></summary>

频繁召回的记忆衰减得更慢（类间隔重复）。

配置键（位于 `retrieval` 下）：
- `reinforcementFactor`（0-2，默认：`0.5`）——设为 `0` 以禁用
- `maxHalfLifeMultiplier`（1-10，默认：`3`）——有效半衰期的硬性上限

</details>

---

## CLI 命令

`npm run build` 之后即可使用 `memory-pro` 二进制：

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

在 pi 会话内，同一套管理功能以 **`/memory-pro`** 斜杠命令的形式提供。

> CLI 与扩展读取相同的配置文件（`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `~/.pi/agent/memory-lancedb-pro.json`）。

OAuth 登录流程：

1. 运行 `memory-pro auth login`
2. 在交互式终端中省略 `--provider` 时，CLI 会在打开浏览器之前显示 OAuth 提供商选择器
3. 除非设置了 `--no-browser`，命令会打印授权 URL 并打开你的浏览器
4. 回调成功后，命令会保存插件 OAuth 文件（默认：`~/.pi/agent/.memory-lancedb-pro/oauth.json`），快照之前的 api-key `llm` 配置以供登出恢复，并把插件 `llm` 配置替换为 OAuth 设置（`auth`、`oauthProvider`、`model`、`oauthPath`）
5. `memory-pro auth logout` 会删除该 OAuth 文件，并在快照存在时恢复之前的 api-key `llm` 配置

---

## 高级主题

<details>
<summary><strong>从更早的移植版本升级</strong></summary>

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

行为变更与升级理由参见 `CHANGELOG-v1.1.0.md`。

**想在现有数据库上开启 Jina 任务提示？**

任务提示是 `embedding` 块下的两个配置键：

```json5
{
  embedding: {
    model: "jina-embeddings-v5-text-small",
    taskQuery: "retrieval.query",
    taskPassage: "retrieval.passage"
  }
}
```

它们只影响设置之后写入的向量。存储中已有的行是在没有任务提示的情况下嵌入的，因此用 `retrieval.query` 嵌入的查询会与处于不同向量空间的段落进行比较——你会在不知不觉中只获得大约一半的收益。

要修复现有行，请重新嵌入到**全新的数据库并切换过去**。**不要**就地重新嵌入：`reembed` 用 `table.add()` 写入每一行（按 id 追加，而不是替换），因此就地运行——这正是 `--force` 解锁的操作——会把旧向量留在新向量旁边，**让每一行翻倍**；重试还会继续叠加。正因如此，除非强制，`reembed` 会拒绝同路径运行。

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

每当你更改 `embedding.model` 或 `embedding.dimensions` 时，都应采用同样的切换流程——始终重新嵌入到一个全新的 `dbPath`，绝不要就地操作。

</details>

<details>
<summary><strong>锁定与并发写入者</strong></summary>

`memory-lancedb-pro` 使用跨进程文件锁来保护 LanceDB 写入。对于共享同一数据库目录的并发 pi 会话和本地进程来说，这已经足够。

这些部署不需要 Redis。当 `locking.redis.enabled` 为 true、设置了 `redisUrl`/`locking.redis.url`，或该进程环境中存在 `MEMORY_LANCEDB_REDIS_URL` 时，才会启用 Redis 锁定。对于多机器或多容器写入者，在跨进程共享 LanceDB 目录之前，请阅读 [Lock Management](docs/lock-management.md)，并确保每个写入者使用相同的锁配置。

</details>

<details>
<summary><strong>如果注入的记忆出现在回复中</strong></summary>

有时模型可能会复述注入的 `<relevant-memories>` 块。

**方案 A（风险最低）：** 临时禁用自动召回：
```json5
{ autoRecall: false }
```

**方案 B（推荐）：** 保留召回，在智能体系统提示词 / `AGENTS.md` 中添加：
> 不要在回复中透露或引用任何 `<relevant-memories>` / 记忆注入内容。仅供内部参考。

**方案 C（适用于后台/批量智能体）：** 将特定智能体排除在自动召回注入之外：
```json5
{
  autoRecall: true,
  autoRecallExcludeAgents: ["memory-distiller", "my-cron-agent"]
}
```
适用于输出不应被注入记忆上下文污染的后台智能体（例如 memory-distiller、cron worker）。

</details>

<details>
<summary><strong>自动召回超时调优</strong></summary>

自动召回有可配置的超时（默认 5 秒），以防止拖慢智能体启动。如果你在代理之后或使用高延迟的嵌入 API，请调大它：

```json5
{ autoRecallTimeoutMs: 8000 }
```

如果自动召回持续超时，请先检查嵌入 API 的延迟。该超时只影响自动注入路径——手动 `memory_recall` 工具调用不受影响。

</details>

<details>
<summary><strong>自动召回重排序成本模型</strong></summary>

当 `autoRecall=true` 且混合检索使用 `retrieval.rerank="cross-encoder"` 并配合 Jina 等外部重排序 API 时，每个符合条件的提示词都可能发出一次重排序请求。发送到该请求的文档数量由自动召回的检索上限和检索器的重排序输入窗口决定，而不是直接由 `retrieval.candidatePoolSize` 或最终的 `autoRecallMaxItems` 注入上限决定。

例如，当 `autoRecallMaxItems: 3` 时，自动召回会向检索请求 6 条结果，混合检索可能会向外部重排序器发送多达 12 个候选，最后才注入至多 3 条记忆。要减少外部重排序用量，可以调低 `autoRecallMaxItems` 或 `maxRecallPerTurn`，把 `retrieval.rerank` 切换为 `"lightweight"` 或 `"none"`，调高 `autoRecallMinLength`，或者保持自动召回禁用，在合适的地方使用手动 `memory_recall`。

当自动召回配合混合交叉编码器重排序、可能发送给重排序器的条目比最终注入的更多时，启动日志会发出警告。调试自动召回统计包含实际的 `rerankInput`、`rerankInputLimit`、`retrieveLimit`、`rerank`、`rerankProvider` 和配置的 `retrievalCandidatePoolSize`。

</details>

<details>
<summary><strong>会话记忆</strong></summary>

- 在新会话事件时触发——将上一个会话摘要保存到 LanceDB
- 默认禁用（pi 本身已持久化 `.jsonl` 会话转录）
- 消息数量可配置（默认：15）

</details>

<details>
<summary><strong>自定义斜杠命令（例如 /lesson）</strong></summary>

添加到你的 `AGENTS.md` 或系统提示词中：

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
<summary><strong>AI 智能体的铁律</strong></summary>

> 将下面的代码块复制到你的 `AGENTS.md` 中，让你的智能体自动执行这些规则。

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
<summary><strong>数据库架构</strong></summary>

LanceDB 表 `memories`：

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `id` | string (UUID) | 主键 |
| `text` | string | 记忆文本（FTS 索引） |
| `vector` | float[] | 嵌入向量 |
| `category` | string | 存储类别：`preference` / `fact` / `decision` / `entity` / `reflection` / `other` |
| `scope` | string | 作用域标识符（例如 `global`、`agent:main`） |
| `importance` | float | 重要性评分 0-1 |
| `timestamp` | int64 | 创建时间戳（ms） |
| `metadata` | string (JSON) | 扩展元数据 |

v1.1.0 中常见的 `metadata` 键：`l0_abstract`、`l1_overview`、`l2_content`、`memory_category`、`tier`、`access_count`、`confidence`、`last_accessed_at`

> **关于类别的说明：** 顶层 `category` 字段使用 6 种存储类别。智能提取产生的 6 类别语义标签（`profile` / `preferences` / `entities` / `events` / `cases` / `patterns`）存储在 `metadata.memory_category` 中。

</details>

<details>
<summary><strong>故障排查</strong></summary>

**扩展未加载 / "no config file found"**

创建 `~/.pi/agent/memory-lancedb-pro.json5` 或设置 `$MEMORY_LANCEDB_PRO_CONFIG`。扩展会打印一条包含预期形状的警告并保持禁用——pi 继续运行。

**智能提取初始化失败**

检查 `llm.apiKey` / `${ENV_VAR}` 是否已设置；插件会回退到正则提取，而不是失败。

**"Cannot mix BigInt and other types"（LanceDB / Apache Arrow）**

在 LanceDB 0.26+ 上，某些数字列可能会以 `BigInt` 返回。升级到 **memory-lancedb-pro >= 1.0.14**——本插件现在会在算术之前用 `Number(...)` 强制转换值。

</details>

---

## 架构

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

> 深入理解完整架构，请参阅 [docs/memory_architecture_analysis.md](docs/memory_architecture_analysis.md)。

<details>
<summary><strong>文件参考（点击展开）</strong></summary>

| 文件 | 用途 |
| --- | --- |
| `pi-adapter/index.ts` | Pi 入口点：加载配置文件、构建 OpenClaw API shim、注册插件核心 |
| `pi-adapter/shim.ts` | 将 pi 生命周期事件 / 工具 / 命令映射到 OpenClaw 插件 API |
| `pi-adapter/config.ts` | 配置文件加载（`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `.json`） |
| `pi-adapter/paths.ts` | Pi 路径解析（`~/.pi/agent`、环境变量覆盖） |
| `pi-adapter/pi-runner.ts` | 通过 `pi --mode json --no-tools ...` 运行的嵌入式子智能体运行器 |
| `pi-adapter/cli-main.ts` | 独立的 `memory-pro` CLI 入口 |
| `index.ts` | 插件核心入口：配置解析、生命周期钩子、记忆能力注册 |
| `src/store.ts` | LanceDB 存储层。表创建 / FTS 索引 / 向量搜索 / BM25 搜索 / CRUD |
| `src/embedder.ts` | 嵌入抽象。兼容任何 OpenAI 兼容 API 提供商 |
| `src/retriever.ts` | 混合检索引擎。向量 + BM25 → 混合融合 → 重排 → 生命周期衰减 → 过滤 |
| `src/scopes.ts` | 多作用域访问控制 |
| `src/tools.ts` | 智能体工具定义：`memory_recall`、`memory_store`、`memory_forget`、`memory_update` + 管理工具 |
| `src/noise-filter.ts` | 过滤智能体拒绝、元问题、问候语和低质量内容 |
| `src/adaptive-retrieval.ts` | 判断一个查询是否需要记忆检索 |
| `src/migrate.ts` | 从内置 `memory-lancedb` 迁移到 Pro |
| `src/smart-extractor.ts` | LLM 驱动的 6 类别提取，带 L0/L1/L2 分层存储和两阶段去重 |
| `src/decay-engine.ts` | Weibull 拉伸指数衰减模型 |
| `src/tier-manager.ts` | 三层晋级/降级：Peripheral ↔ Working ↔ Core |

</details>

---

## OpenClaw 上游附录

本仓库是一个移植版。上游项目是 **[CortexReach/memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)**——一个 OpenClaw 插件。下面所有内容都描述上游 OpenClaw 的用法；pi 用户不需要它。

### 改动内容（移植差异）

| 区域 | OpenClaw（上游） | Pi（本移植版） |
|---|---|---|
| 扩展引导 | `openclaw.plugin.json` / `openclaw.extensions` | `pi-adapter/index.ts` → 编译后的 `dist/pi-adapter/index.js`，通过 `package.json` 中的 `pi.extensions` 声明 |
| 配置文件 | `openclaw.json` 插件条目 | `~/.pi/agent/memory-lancedb-pro.json5`（或 `$MEMORY_LANCEDB_PRO_CONFIG`）——文档结构相同 |
| 数据与会话基础目录 | `~/.openclaw/...` | `~/.pi/agent/...`（可用 `PI_CODING_AGENT_DIR` / `PI_AGENT_DIR` 覆盖） |
| CLI | `openclaw memory-pro …` | 独立二进制：`memory-pro …`（由 `pi-adapter/cli-main.ts` 编译而来） |
| 斜杠命令 | `openclaw` 注册的 CLI | 通过 shim 调用 `pi.registerCommand("/memory-pro", ...)` |
| 嵌入式子智能体运行器 | OpenClaw 运行时 API | 通过 shell 调用 `pi --mode json --no-tools …`（`pi-adapter/pi-runner.ts`） |
| 会话布局 | `~/.openclaw/agents/<id>/sessions/*.jsonl` | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| 版本 | `1.1.0-beta.11` | `1.1.0-beta.11-pi.1` |

生命周期事件通过 `pi-adapter/shim.ts` 从 pi 事件映射到 OpenClaw 钩子：`input`、`session_start`、`before_agent_start`、`agent_end`、`session_shutdown`、`tool_result`、`session_before_switch`、`session_before_fork`。插件的工具（`memory_store`、`memory_recall` 等）和 `/memory-pro` 斜杠命令通过 shim 原样注册。

### 上游快速开始（仅 OpenClaw）

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

上游命令使用 `openclaw memory-pro ...` 前缀。完整的 OpenClaw 文档请参阅[上游 README](https://github.com/CortexReach/memory-lancedb-pro)。

### 上游生态

- **[Setup 脚本](https://github.com/CortexReach/toolbox/tree/main/memory-lancedb-pro-setup)** — 为 OpenClaw 部署提供一键安装/升级/修复（写入 `openclaw.json`）
- **[AI 引导配置技能](https://github.com/CortexReach/memory-lancedb-pro-skill)** — 适用于 Claude Code / OpenClaw 智能体
- **视频教程** — [YouTube](https://youtu.be/MtukF1C8epQ) · [Bilibili](https://www.bilibili.com/video/BV1zUf2BGEgn/)
- **Star 历史** — [star-history.com](https://star-history.com/#CortexReach/memory-lancedb-pro&Date)

---

## 文档

| 文档 | 描述 |
| --- | --- |
| [Memory Architecture Analysis](docs/memory_architecture_analysis.md) | 完整架构深入解析 |
| [CHANGELOG v1.1.0](docs/CHANGELOG-v1.1.0.md) | v1.1.0 行为变更与升级理由 |
| [Release Checklist](docs/release-checklist.md) | 打包预检、发布试运行与发布后冒烟检查 |
| [Long-Context Chunking](docs/long-context-chunking.md) | 长文档的分块策略 |
| [Lock Management](docs/lock-management.md) | 多写入者锁定（Redis）详情 |

## 测试

```bash
npm test                       # full unit/e2e suite
node scripts/run-ci-tests.mjs --all   # full CI manifest
npm run test:pi-adapter        # pi adapter smoke test (mock pi API)
```

所有上游测试都被保留；`test/pi-adapter-smoke.test.mjs` 和 `test:pi-adapter` 是新增的。

---

## Beta：智能记忆 v1.1.0

> 状态：Beta——通过 `npm i memory-lancedb-pro@beta` 获取。使用 `latest` 的稳定版用户不受影响。

| 功能 | 描述 |
|---------|-------------|
| **智能提取** | LLM 驱动的 6 类别提取，带 L0/L1/L2 元数据。禁用时回退到正则。 |
| **生命周期评分** | Weibull 衰减集成到检索中——高频和高重要性的记忆排名更高。 |
| **层级管理** | 三层系统（Core → Working → Peripheral），自动晋级/降级。 |

反馈：[GitHub Issues](https://github.com/CortexReach/memory-lancedb-pro/issues) · 回退：`npm i memory-lancedb-pro@latest`

---

## 依赖

| 包 | 用途 |
| --- | --- |
| `@lancedb/lancedb` ≥0.26.2 | 向量数据库（ANN + FTS） |
| `openai` ≥6.21.0 | OpenAI 兼容嵌入 API 客户端 |
| `@sinclair/typebox` 0.34.48 | JSON Schema 类型定义 |

---

## 贡献者

上游维护者与贡献者（参见[完整列表](https://github.com/CortexReach/memory-lancedb-pro/graphs/contributors)）：

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

## 许可证

MIT
