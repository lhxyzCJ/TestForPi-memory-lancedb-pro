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

## 🤖 本ポートについて

このリポジトリは、本番グレードのメモリプラグイン [memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)（MIT）の **pi コーディングエージェント向けポート**です。OpenClaw プラグインのコア全体は無変更のまま、薄いアダプタ（`pi-adapter/`）を通してそのまま読み込まれるため、pi（≥ 0.80）は上流とほとんど乖離せずに、同じ LanceDB ベースのメモリエンジンを利用できます。

> 以下はすべて pi での利用体験を説明しています。ポート差分の表と元の OpenClaw での利用方法については、末尾の [OpenClaw Upstream Appendix](#openclaw-upstream-appendix) を参照してください。

---

## memory-lancedb-pro を選ぶ理由

ほとんどの AI エージェントには記憶喪失があります。新しいチャットを始めた瞬間に、すべてを忘れてしまいます。

**memory-lancedb-pro** は、エージェントを **AI メモリアシスタント**に変える本番グレードの長期記憶拡張です。重要なことを自動的に捕捉し、ノイズは自然に消えていき、必要なときに正しい記憶を取得します。手動でのタグ付けも、設定の煩わしさもありません。

### 実際の動作:あなたの AI メモリアシスタント

**メモリがない場合 — すべてのセッションがゼロから始まります:**

> **あなた:** 「インデントはタブを使って、常にエラーハンドリングを追加して。」
> *(次のセッション)*
> **あなた:** 「言ったでしょ — タブでしょ、スペースじゃなくて!」 😤
> *(次のセッション)*
> **あなた:** 「…だから、タブ。それとエラーハンドリング。また言わせないで。」

**memory-lancedb-pro を使う場合 — エージェントは学習し、覚えています:**

> **あなた:** 「インデントはタブを使って、常にエラーハンドリングを追加して。」
> *(次のセッション — エージェントがあなたの好みを自動リコール)*
> **エージェント:** *(黙ってタブ + エラーハンドリングを適用)* ✅
> **あなた:** 「先月、PostgreSQL を MongoDB の代わりに選んだのはなぜ?」
> **エージェント:** 「2 月 12 日の議論によると、主な理由は…」 ✅

これが **AI メモリアシスタント**がもたらす違いです — あなたのスタイルを学習し、過去の意思決定を呼び戻し、あなたが同じことを繰り返さなくてもパーソナライズされた応答を返します。

### 他に何ができるのか?

| | 得られるもの |
|---|---|
| **自動捕捉 (Auto-Capture)** | 手動の `memory_store` なしで、あらゆる会話からエージェントが学習 |
| **スマート抽出 (Smart Extraction)** | LLM による 6 カテゴリ分類:プロフィール、好み、エンティティ、イベント、事例、パターン |
| **インテリジェント忘却 (Intelligent Forgetting)** | Weibull 減衰モデル — 重要な記憶は残り、ノイズは自然に消えていく |
| **ハイブリッド検索 (Hybrid Retrieval)** | ベクター + BM25 全文検索、クロスエンコーダー再ランキングで融合 |
| **コンテキスト注入 (Context Injection)** | 各応答の前に、関連する記憶が自動的に表面化 |
| **マルチスコープ分離 (Multi-Scope Isolation)** | エージェント単位・ユーザー単位・プロジェクト単位のメモリ境界 |
| **任意のプロバイダー (Any Provider)** | OpenAI、Jina、Gemini、Ollama、または任意の OpenAI 互換 API |
| **完全なツールキット (Full Toolkit)** | CLI、バックアップ、マイグレーション、アップグレード、エクスポート/インポート — 本番対応 |

---

## クイックスタート

> **CPU 要件:** CPU が **AVX** 命令をサポートしている必要があります。LanceDB のネイティブベクター検索は、一部の Linux x64 ビルドでは **AVX2** を必要とし、AVX のみの CPU では `SIGILL` でクラッシュする可能性があります。その場合は `retrieval.disableNativeCosine: true` を設定するか `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` を設定して、スコープ限定の行スキャンと JavaScript によるコサインランキングを使用してください。CPU フラグの確認は:`grep -o 'avx[^ ]*' /proc/cpuinfo | head -1`（出力がない = 非対応）。詳細は [#419](https://github.com/CortexReach/memory-lancedb-pro/issues/419) と [#644](https://github.com/CortexReach/memory-lancedb-pro/issues/644) を参照してください。

### 1. 拡張機能をビルドする

```bash
git clone https://github.com/lhxyzCJ/TestForPi-memory-lancedb-pro
cd TestForPi-memory-lancedb-pro && npm install && npm run build
```

pi のエントリポイントは `dist/pi-adapter/index.js` です（`pi-adapter/index.ts` からコンパイルされます）。

### 2. 拡張機能を登録する

以下のいずれかを選択します:

**A. pi の設定ファイル経由（グローバル、全プロジェクト）:**

`~/.pi/agent/settings.json` に追加します:

```json
{
  "extensions": [
    "/absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js"
  ]
}
```

**B. pi のパッケージマネージャー経由:**

```bash
pi install /absolute/path/to/TestForPi-memory-lancedb-pro
```

**C. 1 セッションだけのクイックテスト:**

```bash
pi -e /absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js
```

**D. 自動検出（設定変更不要）:** ビルド済みの拡張機能（または `pi.extensions` フィールドを持つ `package.json`）を `~/.pi/agent/extensions/`（グローバル）または `.pi/extensions/`（プロジェクトローカル）に置いて、pi を再起動します。

### 3. 設定ファイルを作成する

`~/.pi/agent/memory-lancedb-pro.json5` を作成します（`.json` も使用できます。または `$MEMORY_LANCEDB_PRO_CONFIG` で任意の場所を指定できます）:

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

> 設定ドキュメントの構造は上流の OpenClaw プラグインのエントリと同一です — 上記の裸の内部オブジェクトも、`{ "config": { ... } }` ラッパーも両方受け付けられます。

### 4. 動作確認

pi セッションを開始し、起動ログを確認します:

```
memory-lancedb-pro: smart extraction enabled
memory-lancedb-pro@...: plugin registered (db: /root/.pi-agent/memory/lancedb-pro, ...)
```

次に、エージェントに記憶の保存と取得を依頼します:

> **あなた:** 「覚えておいて:スペースよりタブの方が好き。」
> **あなた:** 「私のインデントの好みは?」

### なぜこのデフォルトなのか?

- `autoCapture` + `smartExtraction` → エージェントがすべての会話から自動的に学習
- `autoRecall` → 各応答の前に、関連する記憶が注入される
- `extractMinMessages: 2` → 通常の 2 往復のチャットで抽出が発動
- `sessionMemory.enabled: false` → 初日にセッション要約で検索結果を汚染しないようにする

---

## 実行時要件（pi）

以下の要件は pi ホスト由来で、`memory-lancedb-pro.json5` では設定されません：

1. **デフォルトプロバイダー** — 埋め込み型のリフレクション/ドリーミングサブエージェントは `--provider`/`--model` なしで `pi` CLI から起動され、ホストのデフォルトを継承します。`~/.pi/agent/settings.json` で `defaultProvider`/`defaultModel` を設定してください（例: `"defaultProvider": "opencode-go", "defaultModel": "deepseek-v4-flash"`）。設定しないとサブエージェントが壊れたり意図しないプロバイダーにフォールバックする可能性があります。
2. **埋め込みエンドポイント** — 埋め込み API が到達可能である必要があります（例: セッション前に Ollama を起動）。到達できない場合、スマート抽出は静かに regex フォールバックへ降格します。
3. **LLM API キー** — スマート抽出には有効な LLM キー（`llm.apiKey`、例: `"${OPENCODE_API_KEY}"`）が必要です。ない場合、抽出は regex キャプチャにフォールバックします。
4. **アップグレード方法** — pi は `settings.json`（`extensions`）に記録された絶対パスから拡張機能を読み込みます。このリポジトリを更新したら `pi install` を再実行（またはインストール済みコピーを置換）してください。実行しないと pi は古いビルドを読み込み続けます。

**アップストリームとの既知の差:** アップストリームのバッチユーティリティ受理モード（#941、`utilityMode: "batch"`、`utilityVetoThreshold`）は移植されていません。`utilityMode` は `"standalone" | "off"` のみをサポートします。

## ⚠️ メモリ・アーキテクチャ（重要）

この拡張機能は、1 つのメモリ能力を 2 つの連携するストアとして公開します:

| メモリ層 | ストレージ | 用途 | 取得可能か? |
|---|---|---|---|
| **プラグインメモリ** | LanceDB（ベクターストア） | `memory_recall` / 自動リコールによる意味検索 | ✅ はい |
| **正典コーパス (Canonical Corpus)** | `MEMORY.md`、`memory/**/*.md`、最近のセッショントランスクリプト、`memory/dreaming/**/*.md` | ソースオブトゥルースファイルと公開アーティファクト | ✅ `canonicalCorpus.enabled` が true のとき、LanceDB の意味インデックス経由 |

**重要な原則:**
> 正典ファイルがソースオブトゥルースであり続けます。LanceDB は、それらをグラウンディングされたパス・行範囲・スニペット・引用付きで取得するための意味インデックスです。

**あなたにとっての意味:**
- 意味検索が必要? → `memory_store` を使うか、自動捕捉に任せる
- `memory/YYYY-MM-DD.md` → 意味検索にもインデックス化できる **日誌 / ログ**として扱う
- `MEMORY.md` → 正典コンテキストとしてインデックス化できる、キュレーションされた人間可読なリファレンス
- `memory/dreaming/**/*.md` → 公開アーティファクトとして公開され、振り返りコンテキストとしてインデックス化されるドリームレポート
- セッション JSONL トランスクリプト → `canonicalCorpus.includeSessionTranscripts` が有効な場合、`source: "sessions"` としてインデックス化
- プラグインメモリ → 永続的な事実・好み・意思決定・自動捕捉された記憶の主要な書き込みパス

### データの保存場所（pi）

| 対象 | パス |
|---|---|
| プラグインデータベース（LanceDB） | `~/.pi/agent/memory/lancedb-pro`（または `$MEMORY_LANCEDB_PRO_DB_PATH`） |
| Markdown ミラー | `~/.pi/agent/memory/md-mirror`（または `$MEMORY_LANCEDB_PRO_MD_MIRROR_DIR`） |
| セッショントランスクリプト | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| グローバルスキル | `~/.pi/agent/skills` |

ベースディレクトリは `~/.pi/agent` です。`PI_CODING_AGENT_DIR` または `PI_AGENT_DIR` で上書きできます。設定内の相対パス（`dbPath`、`mdMirrorDir` など）は pi のエージェントホームを基準に解決されます。

### 設定ファイルの場所（優先順位）

1. `$MEMORY_LANCEDB_PRO_CONFIG`（明示的なパス）
2. `~/.pi/agent/memory-lancedb-pro.json5`
3. `~/.pi/agent/memory-lancedb-pro.json`

設定ファイルが見つからない場合、拡張機能は警告をログ出力して無効のままになります — 設定が壊れていても、存在しなくても、pi セッションが落ちることはありません。

---

## コア機能

### ハイブリッド検索

```
Query → embedQuery() ─┐
                       ├─→ Hybrid Fusion → Rerank → Lifecycle Decay Boost → Length Norm → Filter
Query → BM25 FTS ─────┘
```

- **ベクター検索** — LanceDB ANN（コサイン距離）による意味的な類似度
- **BM25 全文検索** — LanceDB FTS インデックスによる正確なキーワード一致
- **ハイブリッド融合** — ベクタースコアをベースに、BM25 ヒットに重み付きブースト（標準的な RRF ではなく、実世界のリコール品質向けにチューニング済み）
- **設定可能な重み** — `vectorWeight`、`bm25Weight`、`minScore`

### クロスエンコーダー再ランキング

- **Jina**、**SiliconFlow**、**Voyage AI**、**Pinecone** 向けのビルトインアダプタ
- Jina 互換の任意のエンドポイント（例:Hugging Face TEI、DashScope）と互換
- ハイブリッドスコアリング:クロスエンコーダー 60% + 元の融合スコア 40%
- グレースフルなフォールバック:API 障害時はコサイン類似度にフォールバック

### 多段階スコアリングパイプライン

| ステージ | 効果 |
| --- | --- |
| **ハイブリッド融合** | 意味的一致と完全一致のリコールを組み合わせる |
| **クロスエンコーダー再ランキング** | 意味的に正確なヒットを引き上げる |
| **ライフサイクル減衰ブースト** | Weibull 鮮度 + アクセス頻度 + 重要度 × 信頼度 |
| **長さ正規化** | 長いエントリが支配しないようにする（アンカー:500 文字） |
| **ハード最小スコア** | 無関係な結果を除去（デフォルト:0.35） |
| **MMR 多様性** | コサイン類似度 > 0.85 → 降格 |

### スマートメモリ抽出（v1.1.0）

- **LLM による 6 カテゴリ抽出**:プロフィール、好み、エンティティ、イベント、事例、パターン
- **L0/L1/L2 階層ストレージ**:L0（一言インデックス）→ L1（構造化要約）→ L2（完全な物語）
- **2 段階の重複排除**:ベクター類似度プリフィルタ（≥0.7）→ LLM による意味的判断（CREATE/MERGE/SKIP）
- **カテゴリ対応マージ**:`profile` は常にマージ、`events`/`cases` は追記のみ

### メモリライフサイクル管理（v1.1.0）

- **Weibull 減衰エンジン**:複合スコア = 再近性 + 頻度 + 本質的価値
- **3 段階プロモーション**:`Peripheral ↔ Working ↔ Core`（しきい値は設定可能）
- **アクセス強化**:頻繁に取得される記憶ほど減衰が遅い（間隔反復方式）
- **重要度変調半減期**:重要な記憶ほど減衰が遅い

### マルチスコープ分離

- ビルトインスコープ:`global`、`agent:<id>`、`custom:<name>`、`project:<id>`、`user:<id>`
- `scopes.agentAccess` によるエージェントレベルのアクセス制御
- デフォルト:各エージェントは `global` + 自分自身の `agent:<id>` スコープにアクセス
- `memory_recall`、`memory_search`、`memory_list`、`memory_debug` などの読み取り専用ツールは、要求されたスコープにアクセスできない場合にソフトフォールします:呼び出し元がアクセス可能なスコープを検索し、details に `ignoredScope` と `accessibleScopes` を返します。書き込み・変更ツールは、アクセスできないスコープに対して `scope_access_denied` を返します。

### 自動捕捉 & 自動リコール

- **自動捕捉**（`agent_end`）:会話から好み・事実・決定・エンティティを抽出し、重複排除して、1 ターンにつき最大 3 件保存
- **自動リコール**（各プロンプト構築前）:`<relevant-memories>` コンテキストを注入（最大 3 エントリ）

> **注記:** pi では、これらの OpenClaw フック（`agent_end`、`before_prompt_build` など）は、pi のライフサイクルイベント（`agent_end`、`input`、`session_start`、`session_shutdown`、`tool_result`、`session_before_switch`、`session_before_fork`）から `pi-adapter/shim.ts` によってマッピングされます。

### ノイズフィルタリング & 適応的検索

- 低品質コンテンツをフィルタリング:エージェントの拒否、メタ質問、挨拶
- 挨拶、スラッシュコマンド、単純な確認、絵文字では検索をスキップ
- メモリキーワード（"remember"、"previously"、"last time"）では検索を強制
- CJK 対応のしきい値（中国語:6 文字 vs 英語:15 文字）

---

<details>
<summary><strong>ビルトイン <code>memory-lancedb</code> との比較（クリックして展開）</strong></summary>

| 機能 | ビルトイン `memory-lancedb` | **memory-lancedb-pro** |
| --- | :---: | :---: |
| ベクター検索 | はい | はい |
| BM25 全文検索 | - | はい |
| ハイブリッド融合（ベクター + BM25） | - | はい |
| クロスエンコーダー再ランキング（マルチプロバイダー） | - | はい |
| 再近性ブースト & 時間減衰 | - | はい |
| 長さ正規化 | - | はい |
| MMR 多様性 | - | はい |
| マルチスコープ分離 | - | はい |
| ノイズフィルタリング | - | はい |
| 適応的検索 | - | はい |
| 管理 CLI | - | はい |
| セッションメモリ | - | はい |
| タスク対応埋め込み | - | はい |
| **LLM スマート抽出（6 カテゴリ）** | - | はい（v1.1.0） |
| **Weibull 減衰 + 階層プロモーション** | - | はい（v1.1.0） |
| OpenAI 互換の埋め込み | 制限あり | はい |

</details>

---

## 設定

すべての設定は `~/.pi/agent/memory-lancedb-pro.json5`（または `$MEMORY_LANCEDB_PRO_CONFIG`）にあります。

API キーフィールド（`embedding.apiKey`、`retrieval.rerankApiKey`、`llm.apiKey`）は、プレーン文字列、`${ENV_VAR}` プレースホルダー、または SecretRef オブジェクトを受け付けます。このプラグインは `env` と `file` の SecretRef ソースをサポートしています:

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

`source: "file"` の場合、`id` は pi のエージェントホームを基準に解決され、UTF-8 ファイルとして読み込まれます。オプションの `provider` フィールドは SecretRef オブジェクト形状の互換性のために受け付けられますが、プロバイダーディスパッチには使用されません。`exec` およびその他の SecretRef ソースは、ランタイムの設定検証で拒否されます。

<details>
<summary><strong>完全な設定例</strong></summary>

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
<summary><strong>埋め込みプロバイダー</strong></summary>

**OpenAI 互換の埋め込み API**で動作します。Jina や Voyage などのサービス向けのプロバイダー固有のペイロードアダプタも含まれます:

| プロバイダー | モデル | ベース URL | 次元数 |
| --- | --- | --- | --- |
| **Jina**（推奨） | `jina-embeddings-v5-text-small` | `https://api.jina.ai/v1` | 1024 |
| **OpenAI** | `text-embedding-3-small` | `https://api.openai.com/v1` | 1536 |
| **Voyage** | `voyage-4-lite` / `voyage-4` | `https://api.voyageai.com/v1` | 1024 / 1024 |
| **Google Gemini** | `gemini-embedding-001` | `https://generativelanguage.googleapis.com/v1beta/openai/` | 3072 |
| **Ollama**（ローカル） | `nomic-embed-text` | `http://localhost:11434/v1` | プロバイダー依存 |

Voyage の埋め込みリクエストは、Voyage の `model` + `input` ペイロード形状を使用します。`requestDimensions` が設定されている場合、`output_dimension` として送信されます。`encoding_format` などの OpenAI 専用フィールドは省略されます。

コンテキストまたはバッチ制限が小さいローカル埋め込みサーバーの場合は、`embedding.maxInputChars` を設定してください。プラグインは `nomic-embed-text` に控えめなデフォルトを適用します。自動チャンキングが有効な場合、長いドキュメントは各プロバイダーリクエストにキャップが適用される前に分割されます。

</details>

<details>
<summary><strong>再ランキングプロバイダー</strong></summary>

クロスエンコーダー再ランキングは、`rerankProvider` で複数のプロバイダーをサポートします:

| プロバイダー | `rerankProvider` | モデル例 |
| --- | --- | --- |
| **Jina**（デフォルト） | `jina` | `jina-reranker-v3` |
| **SiliconFlow**（無料枠あり） | `siliconflow` | `BAAI/bge-reranker-v2-m3` |
| **Voyage AI** | `voyage` | `rerank-2.5` |
| **Pinecone** | `pinecone` | `bge-reranker-v2-m3` |

Jina 互換の再ランキングエンドポイントならどれでも動作します — `rerankProvider: "jina"` を設定し、`rerankEndpoint` を自分のサービス（例:Hugging Face TEI、DashScope `qwen3-rerank`）に指定してください。

</details>

<details>
<summary><strong>スマート抽出（LLM）— v1.1.0</strong></summary>

`smartExtraction` が有効（デフォルト:`true`）の場合、プラグインは正規表現ベースのトリガーではなく、LLM を使って記憶をインテリジェントに抽出・分類します。

| フィールド | 型 | デフォルト | 説明 |
|-------|------|---------|-------------|
| `smartExtraction` | boolean | `true` | LLM による 6 カテゴリ抽出の有効/無効 |
| `llm.auth` | string | `api-key` | `api-key` は `llm.apiKey` / `embedding.apiKey` を使用。`oauth` はデフォルトでプラグインスコープの OAuth トークンファイルを使用 |
| `llm.apiKey` | string | *（`embedding.apiKey` にフォールバック）* | LLM プロバイダーの API キー |
| `llm.model` | string | `openai/gpt-oss-120b` | LLM モデル名 |
| `llm.baseURL` | string | *（`embedding.baseURL` にフォールバック）* | LLM API エンドポイント |
| `llm.oauthProvider` | string | `openai-codex` | `llm.auth` が `oauth` の場合に使用される OAuth プロバイダー ID |
| `llm.oauthPath` | string | `~/.pi/agent/.memory-lancedb-pro/oauth.json` | `llm.auth` が `oauth` の場合に使用される OAuth トークンファイル |
| `llm.timeoutMs` | number | `30000` | LLM リクエストのタイムアウト（ミリ秒） |
| `extractMinMessages` | number | `2` | 抽出が発動するまでの最小メッセージ数 |
| `extractMaxChars` | number | `8000` | LLM に送信する最大文字数 |

OAuth `llm` 設定（LLM 呼び出しに既存の Codex / ChatGPT ログインキャッシュを使用）:

> **注記:** OAuth フローは上流の OpenClaw プラグインから継承されています。pi では、`memory-pro auth login` が同じ OAuth ロジックを呼び出します。トークンファイルのデフォルトは `~/.pi/agent/.memory-lancedb-pro/oauth.json` です。

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

`llm.auth: "oauth"` の注意点:

- `llm.oauthProvider` は現在 `openai-codex` です。
- OAuth トークンはデフォルトで `~/.pi/agent/.memory-lancedb-pro/oauth.json` に保存されます。
- そのファイルを別の場所に保存したい場合は `llm.oauthPath` を設定できます。
- `auth login` は、それまでの api-key の `llm` 設定を OAuth ファイルの隣にスナップショットし、`auth logout` は、スナップショットが存在する場合はその設定を復元します。
- `api-key` から `oauth` への切り替えでは、`llm.baseURL` は自動的に引き継がれません。カスタムの ChatGPT/Codex 互換バックエンドを意図的に使いたい場合のみ、OAuth モードで手動で設定してください。

</details>

<details>
<summary><strong>レガシー CPU フォールバック</strong></summary>

AVX のみの Linux x64 ホストが LanceDB ネイティブベクター検索内で `SIGILL` によりクラッシュする場合、ネイティブコサインを無効にして、スコープ内の行をスキャンし、JavaScript でランキングするようにします:

```json5
{
  retrieval: {
    disableNativeCosine: true
  }
}
```

同じ動作のために `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` を設定することもできます。

</details>

<details>
<summary><strong>ライフサイクル設定（減衰 + 階層）</strong></summary>

| フィールド | デフォルト | 説明 |
|-------|---------|-------------|
| `decay.recencyHalfLifeDays` | `30` | Weibull 再近性減衰の基本半減期 |
| `decay.frequencyWeight` | `0.3` | 複合スコアにおけるアクセス頻度の重み |
| `decay.intrinsicWeight` | `0.3` | `importance × confidence` の重み |
| `decay.betaCore` | `0.8` | `core` 記憶の Weibull ベータ |
| `decay.betaWorking` | `1.0` | `working` 記憶の Weibull ベータ |
| `decay.betaPeripheral` | `1.3` | `peripheral` 記憶の Weibull ベータ |
| `tier.coreAccessThreshold` | `10` | `core` に昇格するまでの最小リコール回数 |
| `tier.peripheralAgeDays` | `60` | 古い記憶を降格させる年齢しきい値 |

</details>

<details>
<summary><strong>アクセス強化</strong></summary>

頻繁に取得される記憶は、減衰が遅くなります（間隔反復方式）。

設定キー（`retrieval` 配下）:
- `reinforcementFactor`（0〜2、デフォルト:`0.5`）— `0` にすると無効
- `maxHalfLifeMultiplier`（1〜10、デフォルト:`3`）— 実効半減期の上限

</details>

---

## CLI コマンド

`npm run build` の後に、`memory-pro` バイナリが利用可能になります:

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

pi セッション内では、同じ管理面が **`/memory-pro`** スラッシュコマンドとして利用できます。

> CLI は拡張機能と同じ設定ファイルを読み込みます（`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `~/.pi/agent/memory-lancedb-pro.json`）。

OAuth ログインフロー:

1. `memory-pro auth login` を実行します
2. 対話型ターミナルで `--provider` を省略した場合、ブラウザを開く前に OAuth プロバイダーピッカーが表示されます
3. コマンドは認証 URL を出力し、`--no-browser` が設定されていない限りブラウザを開きます
4. コールバックが成功すると、コマンドはプラグインの OAuth ファイル（デフォルト:`~/.pi/agent/.memory-lancedb-pro/oauth.json`）を保存し、ログアウト用にそれまでの api-key `llm` 設定をスナップショットし、プラグインの `llm` 設定を OAuth 設定（`auth`、`oauthProvider`、`model`、`oauthPath`）で置き換えます
5. `memory-pro auth logout` は、その OAuth ファイルを削除し、スナップショットが存在する場合はそれまでの api-key `llm` 設定を復元します

---

## 高度なトピック

<details>
<summary><strong>以前のポートバージョンからのアップグレード</strong></summary>

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

動作の変更点とアップグレードの根拠は `CHANGELOG-v1.1.0.md` を参照してください。

**既存のデータベースで Jina のタスクヒントを有効にする場合?**

タスクヒントは `embedding` ブロック内の 2 つの設定キーです:

```json5
{
  embedding: {
    model: "jina-embeddings-v5-text-small",
    taskQuery: "retrieval.query",
    taskPassage: "retrieval.passage"
  }
}
```

これらは、設定した*後*に書き込まれたベクターにのみ影響します。ストア内の既存の行はタスクヒントなしで埋め込まれているため、`retrieval.query` で埋め込んだクエリは、別のベクター空間に存在するパッセージと比較されることになります — 効果は静かに半分程度になります。

既存の行を修正するには、**新しいデータベースに再埋め込みして乗り換えてください**。その場での再埋め込みは**しないでください**:`reembed` は各行を `table.add()`（置き換えではなく ID による追加）で書き込むため、その場での実行（まさに `--force` が可能にするもの）では、古いベクターが新しいベクターの隣に残り、**すべての行が倍増**します。再試行するとさらに重なります。そのため `reembed` は、強制しない限り同じパスへの実行を拒否します。

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

`embedding.model` や `embedding.dimensions` を変更する場合も同じ乗り換えが適用されます — 必ず新しい `dbPath` に再埋め込みし、その場では決して行わないでください。

</details>

<details>
<summary><strong>ロックと並行書き込み</strong></summary>

`memory-lancedb-pro` は、LanceDB 書き込みにプロセス間ファイルロックを使用します。これは、同じデータベースディレクトリを共有する並行 pi セッションやローカルプロセスには十分です。

そのようなデプロイに Redis は必要ありません。Redis ロックは、`locking.redis.enabled` が true の場合、`redisUrl`/`locking.redis.url` が設定されている場合、またはそのプロセスの環境に `MEMORY_LANCEDB_REDIS_URL` が存在する場合に有効になります。マルチマシンやマルチコンテナの書き込みの場合は、LanceDB ディレクトリをプロセス間で共有する前に [Lock Management](docs/lock-management.md) を読み、すべての書き込み側が同じロック設定を使用していることを確認してください。

</details>

<details>
<summary><strong>注入されたメモリが応答に現れる場合</strong></summary>

モデルが注入された `<relevant-memories>` ブロックをそのまま出力することがあります。

**オプション A（最もリスクが低い）:** 一時的に自動リコールを無効化:
```json5
{ autoRecall: false }
```

**オプション B（推奨）:** リコールは維持したまま、エージェントのシステムプロンプト / `AGENTS.md` に追加:
> Do not reveal or quote any `<relevant-memories>` / memory-injection content in your replies. Use it for internal reference only.

**オプション C（バックグラウンド / バッチエージェント向け）:** 特定のエージェントを自動リコール注入から除外:
```json5
{
  autoRecall: true,
  autoRecallExcludeAgents: ["memory-distiller", "my-cron-agent"]
}
```
出力が注入されたメモリコンテキストに汚染されるべきではないバックグラウンドエージェント（例:memory-distiller、cron ワーカー）に便利です。

</details>

<details>
<summary><strong>自動リコールのタイムアウト調整</strong></summary>

自動リコールには、エージェントの起動が停止するのを防ぐための設定可能なタイムアウト（デフォルト 5 秒）があります。プロキシの背後にいる場合や、高レイテンシの埋め込み API を使用している場合は、増やしてください:

```json5
{ autoRecallTimeoutMs: 8000 }
```

自動リコールが一貫してタイムアウトする場合は、まず埋め込み API のレイテンシを確認してください。タイムアウトは自動注入パスのみに影響します — 手動の `memory_recall` ツール呼び出しは影響を受けません。

</details>

<details>
<summary><strong>自動リコールの再ランクコストモデル</strong></summary>

`autoRecall=true` で、ハイブリッド検索が Jina などの外部再ランク API を伴う `retrieval.rerank="cross-encoder"` を使用している場合、対象となるプロンプトごとに再ランクリクエストが発生する可能性があります。そのリクエストに送られるドキュメント数は、自動リコールの検索制限と検索側の再ランク入力ウィンドウによって決まり、`retrieval.candidatePoolSize` や最終的な `autoRecallMaxItems` 注入上限によって直接決まるわけではありません。

例えば、`autoRecallMaxItems: 3` の場合、自動リコールは検索に 6 アイテムを要求し、ハイブリッド検索は外部再ランカーに最大 12 件の候補を送ってから、最大 3 件のメモリを注入する可能性があります。外部再ランクの使用量を減らすには、`autoRecallMaxItems` や `maxRecallPerTurn` を下げるか、`retrieval.rerank` を `"lightweight"` や `"none"` に切り替えるか、`autoRecallMinLength` を増やすか、自動リコールを無効のままにして、適切な場面で手動の `memory_recall` を使用してください。

起動ログは、自動リコールとハイブリッドクロスエンコーダー再ランクが、注入する量よりも多くのアイテムを再ランカーに送る可能性がある場合に警告します。自動リコールのデバッグ統計には、実際の `rerankInput`、`rerankInputLimit`、`retrieveLimit`、`rerank`、`rerankProvider`、設定済みの `retrievalCandidatePoolSize` が含まれます。

</details>

<details>
<summary><strong>セッションメモリ</strong></summary>

- 新規セッションイベントで発動 — 前のセッションの要約を LanceDB に保存
- デフォルトで無効（pi は既に `.jsonl` セッショントランスクリプトを永続化しているため）
- メッセージ数は設定可能（デフォルト:15）

</details>

<details>
<summary><strong>カスタムスラッシュコマンド（例:/lesson）</strong></summary>

`AGENTS.md` またはシステムプロンプトに追加します:

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
<summary><strong>AI エージェントのための鉄則</strong></summary>

> 下のブロックを `AGENTS.md` にコピーすると、エージェントが自動的にこれらのルールを適用します。

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
<summary><strong>データベーススキーマ</strong></summary>

LanceDB テーブル `memories`:

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `id` | string (UUID) | 主キー |
| `text` | string | メモリテキスト（FTS インデックス付き） |
| `vector` | float[] | 埋め込みベクター |
| `category` | string | 保存カテゴリ:`preference` / `fact` / `decision` / `entity` / `reflection` / `other` |
| `scope` | string | スコープ識別子（例:`global`、`agent:main`） |
| `importance` | float | 重要度スコア 0〜1 |
| `timestamp` | int64 | 作成タイムスタンプ（ms） |
| `metadata` | string (JSON) | 拡張メタデータ |

v1.1.0 の一般的な `metadata` キー:`l0_abstract`、`l1_overview`、`l2_content`、`memory_category`、`tier`、`access_count`、`confidence`、`last_accessed_at`

> **カテゴリに関する注記:** トップレベルの `category` フィールドは 6 つの保存カテゴリを使用します。スマート抽出の 6 カテゴリの意味ラベル（`profile` / `preferences` / `entities` / `events` / `cases` / `patterns`）は、`metadata.memory_category` に保存されます。

</details>

<details>
<summary><strong>トラブルシューティング</strong></summary>

**拡張機能が読み込まれない / "no config file found"**

`~/.pi/agent/memory-lancedb-pro.json5` を作成するか、`$MEMORY_LANCEDB_PRO_CONFIG` を設定してください。拡張機能は期待される形状を警告として出力し、無効のままになります — pi は動き続けます。

**スマート抽出の初期化に失敗**

`llm.apiKey` / `${ENV_VAR}` が設定されているか確認してください。プラグインは失敗するのではなく、正規表現による抽出にフォールバックします。

**"Cannot mix BigInt and other types"（LanceDB / Apache Arrow）**

LanceDB 0.26+ では、一部の数値列が `BigInt` として返される場合があります。**memory-lancedb-pro >= 1.0.14** にアップグレードしてください — このプラグインは現在、算術の前に `Number(...)` で値を強制変換します。

</details>

---

## アーキテクチャ

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

> 完全なアーキテクチャの詳細は、[docs/memory_architecture_analysis.md](docs/memory_architecture_analysis.md) を参照してください。

<details>
<summary><strong>ファイルリファレンス（クリックして展開）</strong></summary>

| ファイル | 目的 |
| --- | --- |
| `pi-adapter/index.ts` | pi エントリポイント:設定ファイルの読み込み、OpenClaw API シムの構築、プラグインコアの登録 |
| `pi-adapter/shim.ts` | pi のライフサイクルイベント / ツール / コマンドを OpenClaw プラグイン API にマッピング |
| `pi-adapter/config.ts` | 設定ファイルの読み込み（`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `.json`） |
| `pi-adapter/paths.ts` | pi のパス解決（`~/.pi/agent`、環境変数による上書き） |
| `pi-adapter/pi-runner.ts` | `pi --mode json --no-tools ...` による組み込みサブエージェントランナー |
| `pi-adapter/cli-main.ts` | スタンドアロンの `memory-pro` CLI エントリ |
| `index.ts` | プラグインコアエントリ:設定解析、ライフサイクルフック、メモリ能力の登録 |
| `src/store.ts` | LanceDB ストレージ層。テーブル作成 / FTS インデックス / ベクター検索 / BM25 検索 / CRUD |
| `src/embedder.ts` | 埋め込み抽象化。任意の OpenAI 互換 API プロバイダーに対応 |
| `src/retriever.ts` | ハイブリッド検索エンジン。ベクター + BM25 → ハイブリッド融合 → 再ランク → ライフサイクル減衰 → フィルタ |
| `src/scopes.ts` | マルチスコープのアクセス制御 |
| `src/tools.ts` | エージェントツール定義:`memory_recall`、`memory_store`、`memory_forget`、`memory_update` + 管理ツール |
| `src/noise-filter.ts` | エージェントの拒否、メタ質問、挨拶、低品質コンテンツをフィルタリング |
| `src/adaptive-retrieval.ts` | クエリがメモリ検索を必要とするかどうかを判定 |
| `src/migrate.ts` | ビルトイン `memory-lancedb` から Pro へのマイグレーション |
| `src/smart-extractor.ts` | L0/L1/L2 階層ストレージと 2 段階の重複排除を備えた LLM による 6 カテゴリ抽出 |
| `src/decay-engine.ts` | Weibull 伸長指数減衰モデル |
| `src/tier-manager.ts` | 3 段階の昇格/降格:Peripheral ↔ Working ↔ Core |

</details>

---

## OpenClaw Upstream Appendix

このリポジトリはポートです。上流プロジェクトは **[CortexReach/memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)** — OpenClaw プラグインです。以下は上流の OpenClaw での利用方法を説明しています。pi ユーザーには必要ありません。

### 変更点（ポート差分）

| 領域 | OpenClaw（上流） | Pi（本ポート） |
|---|---|---|
| 拡張機能の起動 | `openclaw.plugin.json` / `openclaw.extensions` | `pi-adapter/index.ts` → コンパイル済み `dist/pi-adapter/index.js`、`package.json` の `pi.extensions` で宣言 |
| 設定ファイル | `openclaw.json` のプラグインエントリ | `~/.pi/agent/memory-lancedb-pro.json5`（または `$MEMORY_LANCEDB_PRO_CONFIG`）— 同じドキュメント構造 |
| データ & セッションのベースディレクトリ | `~/.openclaw/...` | `~/.pi/agent/...`（`PI_CODING_AGENT_DIR` / `PI_AGENT_DIR` で上書き可能） |
| CLI | `openclaw memory-pro …` | スタンドアロンバイナリ:`memory-pro …`（`pi-adapter/cli-main.ts` からコンパイル） |
| スラッシュコマンド | `openclaw` 登録の CLI | シム経由の `pi.registerCommand("/memory-pro", ...)` |
| 組み込みサブエージェントランナー | OpenClaw ランタイム API | `pi --mode json --no-tools …` へのシェルアウト（`pi-adapter/pi-runner.ts`） |
| セッション構成 | `~/.openclaw/agents/<id>/sessions/*.jsonl` | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| バージョン | `1.1.0-beta.11` | `1.1.0-beta.11-pi.1` |

ライフサイクルイベントは、pi のイベントから `pi-adapter/shim.ts` を介して OpenClaw フックにマッピングされます:`input`、`session_start`、`before_agent_start`、`agent_end`、`session_shutdown`、`tool_result`、`session_before_switch`、`session_before_fork`。プラグインのツール（`memory_store`、`memory_recall` など）と `/memory-pro` スラッシュコマンドは、シムを通じて無変更で登録されます。

### 上流のクイックスタート（OpenClaw のみ）

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

上流のコマンドは `openclaw memory-pro ...` プレフィックスを使用します。完全な OpenClaw ドキュメントは[上流の README](https://github.com/CortexReach/memory-lancedb-pro) を参照してください。

### 上流のエコシステム

- **[セットアップスクリプト](https://github.com/CortexReach/toolbox/tree/main/memory-lancedb-pro-setup)** — OpenClaw デプロイのワンクリックインストール/アップグレード/修復（`openclaw.json` を書き込みます）
- **[AI ガイド付き設定スキル](https://github.com/CortexReach/memory-lancedb-pro-skill)** — Claude Code / OpenClaw エージェント向け
- **ビデオチュートリアル** — [YouTube](https://youtu.be/MtukF1C8epQ) · [Bilibili](https://www.bilibili.com/video/BV1zUf2BGEgn/)
- **スター履歴** — [star-history.com](https://star-history.com/#CortexReach/memory-lancedb-pro&Date)

---

## ドキュメント

| ドキュメント | 説明 |
| --- | --- |
| [Memory Architecture Analysis](docs/memory_architecture_analysis.md) | 完全なアーキテクチャの詳細解説 |
| [CHANGELOG v1.1.0](docs/CHANGELOG-v1.1.0.md) | v1.1.0 の動作変更とアップグレードの根拠 |
| [Release Checklist](docs/release-checklist.md) | パッケージの事前チェック、公開ドライラン、公開後のスモークチェック |
| [Long-Context Chunking](docs/long-context-chunking.md) | 長文ドキュメントのチャンキング戦略 |
| [Lock Management](docs/lock-management.md) | 複数ライターのロック（Redis）の詳細 |

## テスト

```bash
npm test                       # full unit/e2e suite
node scripts/run-ci-tests.mjs --all   # full CI manifest
npm run test:pi-adapter        # pi adapter smoke test (mock pi API)
```

上流のテストはすべて維持されています。`test/pi-adapter-smoke.test.mjs` と `test:pi-adapter` が新規です。

---

## ベータ版:Smart Memory v1.1.0

> ステータス:ベータ版 — `npm i memory-lancedb-pro@beta` で利用可能です。`latest` の安定版ユーザーには影響ありません。

| 機能 | 説明 |
|---------|-------------|
| **スマート抽出** | L0/L1/L2 メタデータを備えた LLM による 6 カテゴリ抽出。無効時は正規表現にフォールバック。 |
| **ライフサイクルスコアリング** | 検索に統合された Weibull 減衰 — 高頻度・高重要度の記憶が上位にランク付けされます。 |
| **階層管理** | 3 段階システム（Core → Working → Peripheral）と自動昇格/降格。 |

フィードバック:[GitHub Issues](https://github.com/CortexReach/memory-lancedb-pro/issues) · 戻す場合:`npm i memory-lancedb-pro@latest`

---

## 依存関係

| パッケージ | 目的 |
| --- | --- |
| `@lancedb/lancedb` ≥0.26.2 | ベクターデータベース（ANN + FTS） |
| `openai` ≥6.21.0 | OpenAI 互換埋め込み API クライアント |
| `@sinclair/typebox` 0.34.48 | JSON スキーマ型定義 |

---

## コントリビューター

上流のメンテナーとコントリビューター（[完全なリスト](https://github.com/CortexReach/memory-lancedb-pro/graphs/contributors) を参照）:

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
