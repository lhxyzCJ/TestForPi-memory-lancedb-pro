<div align="center">

# 🧠 memory-lancedb-pro · π Extensão para o pi coding agent

**Assistente de memória de IA para o [pi coding agent](https://github.com/earendil-works/pi)**

*Dê ao seu agente de IA um cérebro que realmente lembra — entre sessões, entre projetos, ao longo do tempo.*

Uma extensão de memória baseada em LanceDB para o pi que armazena preferências, decisões e contexto de projeto, e depois as relembra automaticamente em sessões futuras.

[![Pi Extension](https://img.shields.io/badge/Pi-Extension-blue)](https://github.com/earendil-works/pi)
[![Pi 0.80+](https://img.shields.io/badge/pi-0.80%2B-brightgreen)](https://github.com/earendil-works/pi)
[![LanceDB](https://img.shields.io/badge/LanceDB-Vectorstore-orange)](https://lancedb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) | [简体中文](README_CN.md) | [繁體中文](README_TW.md) | [日本語](README_JA.md) | [한국어](README_KO.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Deutsch](README_DE.md) | [Italiano](README_IT.md) | [Русский](README_RU.md) | [Português (Brasil)](README_PT-BR.md)

</div>

---

## 🤖 Sobre este port

Este repositório é um **port do plugin de memória de nível de produção [memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro) (MIT) para o pi coding agent**. O núcleo do plugin OpenClaw permanece intacto e carrega sem alterações por meio de um adaptador fino (`pi-adapter/`), de modo que o pi (≥ 0.80) obtém o mesmo mecanismo de memória baseado em LanceDB com divergência mínima do upstream.

> Tudo abaixo documenta a experiência com pi. Veja o [Apêndice: OpenClaw original](#apêndice-openclaw-original) no final para a tabela de diferenças do port e o uso original do OpenClaw.

---

## Por que memory-lancedb-pro?

A maioria dos agentes de IA tem amnésia. Eles esquecem tudo no momento em que você inicia um novo chat.

**memory-lancedb-pro** é uma extensão de memória de longo prazo de nível de produção que transforma seu agente em um **Assistente de Memória de IA** — ela captura automaticamente o que importa, deixa o ruído desaparecer naturalmente e recupera a memória certa no momento certo. Sem marcação manual, sem dor de cabeça com configuração.

### Seu Assistente de Memória de IA em ação

**Sem memória — toda sessão começa do zero:**

> **Você:** "Use tabs para indentação, sempre adicione tratamento de erros."
> *(próxima sessão)*
> **Você:** "Eu já te falei — tabs, não espaços!" 😤
> *(próxima sessão)*
> **Você:** "...sério, tabs. E tratamento de erros. De novo."

**Com memory-lancedb-pro — seu agente aprende e lembra:**

> **Você:** "Use tabs para indentação, sempre adicione tratamento de erros."
> *(próxima sessão — o agente relembra automaticamente suas preferências)*
> **Agente:** *(aplica tabs + tratamento de erros silenciosamente)* ✅
> **Você:** "Por que escolhemos PostgreSQL em vez de MongoDB no mês passado?"
> **Agente:** "Com base em nossa discussão de 12 de fevereiro, os principais motivos foram..." ✅

Essa é a diferença que um **Assistente de Memória de IA** faz — ele aprende seu estilo, relembra decisões passadas e entrega respostas personalizadas sem que você precise se repetir.

### O que mais ele pode fazer?

| | O que você obtém |
|---|---|
| **Captura Automática (Auto-Capture)** | Seu agente aprende com cada conversa — sem `memory_store` manual |
| **Extração Inteligente (Smart Extraction)** | Classificação em 6 categorias com LLM: perfis, preferências, entidades, eventos, casos, padrões |
| **Esquecimento Inteligente (Intelligent Forgetting)** | Modelo de decaimento de Weibull — memórias importantes permanecem, o ruído desaparece naturalmente |
| **Recuperação Híbrida (Hybrid Retrieval)** | Busca vetorial + texto completo BM25, fundidas com re-ranking por cross-encoder |
| **Injeção de Contexto (Context Injection)** | Memórias relevantes surgem automaticamente antes de cada resposta |
| **Isolamento Multi-Escopo (Multi-Scope Isolation)** | Limites de memória por agente, por usuário, por projeto |
| **Qualquer Provedor (Any Provider)** | OpenAI, Jina, Gemini, Ollama ou qualquer API compatível com OpenAI |
| **Kit Completo (Full Toolkit)** | CLI, backup, migração, upgrade, exportação/importação — pronto para produção |

---

## Início Rápido

> **Requisito de CPU:** sua CPU deve suportar instruções **AVX**. A busca vetorial nativa do LanceDB pode exigir **AVX2** em algumas builds Linux x64 e pode travar CPUs apenas com AVX com `SIGILL`; defina `retrieval.disableNativeCosine: true` ou `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` para usar uma varredura limitada de linhas com ranking de cosseno em JavaScript. Verifique os flags da CPU com: `grep -o 'avx[^ ]*' /proc/cpuinfo | head -1` (sem saída = não suportado). Veja [#419](https://github.com/CortexReach/memory-lancedb-pro/issues/419) e [#644](https://github.com/CortexReach/memory-lancedb-pro/issues/644) para detalhes.

### 1. Compile a extensão

```bash
git clone https://github.com/lhxyzCJ/TestForPi-memory-lancedb-pro
cd TestForPi-memory-lancedb-pro && npm install && npm run build
```

O ponto de entrada do pi é `dist/pi-adapter/index.js` (compilado a partir de `pi-adapter/index.ts`).

### 2. Registre a extensão

Escolha uma das opções:

**A. Via arquivo de configurações do pi (global, todos os projetos):**

Adicione em `~/.pi/agent/settings.json`:

```json
{
  "extensions": [
    "/absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js"
  ]
}
```

**B. Via gerenciador de pacotes do pi:**

```bash
pi install /absolute/path/to/TestForPi-memory-lancedb-pro
```

**C. Teste rápido para uma sessão:**

```bash
pi -e /absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js
```

**D. Descoberta automática (sem alterar configurações):** coloque a extensão compilada (ou um `package.json` com o campo `pi.extensions`) em `~/.pi/agent/extensions/` (global) ou `.pi/extensions/` (local ao projeto) e reinicie o pi.

### 3. Crie o arquivo de configuração

Crie `~/.pi/agent/memory-lancedb-pro.json5` (você também pode usar `.json` ou apontar para qualquer lugar com `$MEMORY_LANCEDB_PRO_CONFIG`):

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

> A forma do documento de configuração é idêntica à entrada do plugin upstream do OpenClaw — tanto o objeto interno simples acima quanto um wrapper `{ "config": { ... } }` são aceitos.

### 4. Verifique

Inicie uma sessão do pi e confira o log de inicialização:

```
memory-lancedb-pro: smart extraction enabled
memory-lancedb-pro@...: plugin registered (db: /root/.pi-agent/memory/lancedb-pro, ...)
```

Depois peça ao seu agente para armazenar e recuperar algo:

> **Você:** "Lembre-se: eu prefiro tabs a espaços."
> **Você:** "Quais são minhas preferências de indentação?"

### Por que esses padrões?

- `autoCapture` + `smartExtraction` → seu agente aprende com cada conversa automaticamente
- `autoRecall` → memórias relevantes são injetadas antes de cada resposta
- `extractMinMessages: 2` → a extração dispara em conversas normais de duas mensagens
- `sessionMemory.enabled: false` → evita poluir a recuperação com resumos de sessão desde o primeiro dia

---

## Requisitos de execução (pi)

Os seguintes requisitos vêm do host pi e não são configurados em `memory-lancedb-pro.json5`:

1. **Provedor padrão** — Subagentes de reflexão/dreaming são lançados via CLI `pi` sem `--provider`/`--model` e herdam o padrão do host. Defina `defaultProvider`/`defaultModel` em `~/.pi/agent/settings.json` (ex.: `"defaultProvider": "opencode-go", "defaultModel": "deepseek-v4-flash"`), caso contrário os subagentes podem cair em um provedor quebrado ou não intencional.
2. **Endpoint de embeddings** — A API de embeddings deve estar acessível (ex.: inicie o Ollama antes de uma sessão); um endpoint inacessível degrada silenciosamente a extração inteligente para o fallback regex.
3. **Chave de API do LLM** — A extração inteligente precisa de uma chave LLM válida (`llm.apiKey`, ex.: `"${OPENCODE_API_KEY}"`); sem ela, a extração recorre à captura regex.
4. **Caminho de atualização** — O pi carrega a extensão do caminho absoluto registrado em `settings.json` (`extensions`). Após atualizar este repositório, execute `pi install` novamente (ou substitua a cópia instalada); caso contrário, o pi continuará carregando o build antigo.

**Lacuna conhecida vs. upstream:** o modo de admissão batch-utility do upstream (#941, `utilityMode: "batch"`, `utilityVetoThreshold`) não foi portado; `utilityMode` suporta apenas `"standalone" | "off"`.

## ⚠️ Arquitetura de Memória (Importante)

A extensão expõe uma capacidade de memória com dois armazenamentos coordenados:

| Camada de Memória | Armazenamento | Para que serve | Recuperável? |
|---|---|---|---|
| **Memória do Plugin** | LanceDB (armazenamento vetorial) | Recuperação semântica via `memory_recall` / recall automático | ✅ Sim |
| **Corpus Canônico** | `MEMORY.md`, `memory/**/*.md`, transcrições recentes de sessões, `memory/dreaming/**/*.md` | Arquivos de fonte da verdade e artefatos públicos | ✅ Via índice semântico LanceDB quando `canonicalCorpus.enabled` é true |

**Princípio-chave:**
> Os arquivos canônicos permanecem como fonte da verdade. O LanceDB é o índice semântico usado para recuperá-los com caminhos ancorados, intervalos de linhas, trechos e citações.

**O que isso significa para você:**
- Precisa de recall semântico? → Use `memory_store` ou deixe a captura automática fazer isso
- `memory/YYYY-MM-DD.md` → trate como um **diário / log diário** que também pode ser indexado para busca semântica
- `MEMORY.md` → referência curada e legível por humanos que pode ser indexada como contexto canônico
- `memory/dreaming/**/*.md` → relatórios de dreaming expostos como artefatos públicos e indexados como contexto de reflexão
- Transcrições JSONL de sessões → indexadas como `source: "sessions"` quando `canonicalCorpus.includeSessionTranscripts` está habilitado
- Memória do plugin → caminho de escrita principal para fatos duráveis, preferências, decisões e memórias capturadas automaticamente

### Onde os dados ficam (pi)

| O quê | Caminho |
|---|---|
| Banco de dados do plugin (LanceDB) | `~/.pi/agent/memory/lancedb-pro` (ou `$MEMORY_LANCEDB_PRO_DB_PATH`) |
| Espelho Markdown | `~/.pi/agent/memory/md-mirror` (ou `$MEMORY_LANCEDB_PRO_MD_MIRROR_DIR`) |
| Transcrições de sessões | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| Skills globais | `~/.pi/agent/skills` |

O diretório base é `~/.pi/agent`; substitua-o com `PI_CODING_AGENT_DIR` ou `PI_AGENT_DIR`. Caminhos relativos na configuração (`dbPath`, `mdMirrorDir`, ...) são resolvidos em relação ao home do agente pi.

### Localizações do arquivo de configuração (em ordem de prioridade)

1. `$MEMORY_LANCEDB_PRO_CONFIG` (caminho explícito)
2. `~/.pi/agent/memory-lancedb-pro.json5`
3. `~/.pi/agent/memory-lancedb-pro.json`

Se nenhum arquivo de configuração for encontrado, a extensão registra um aviso e permanece desabilitada — uma configuração quebrada ou ausente nunca derruba a sessão do pi.

---

## Principais Recursos

### Recuperação Híbrida

```
Query → embedQuery() ─┐
                       ├─→ Hybrid Fusion → Rerank → Lifecycle Decay Boost → Length Norm → Filter
Query → BM25 FTS ─────┘
```

- **Busca Vetorial** — similaridade semântica via ANN do LanceDB (distância de cosseno)
- **Busca de Texto Completo BM25** — correspondência exata de palavras-chave via índice FTS do LanceDB
- **Fusão Híbrida (Hybrid Fusion)** — a pontuação vetorial é a base, correspondências BM25 recebem um boost ponderado (não é RRF padrão — ajustado para qualidade real de recall)
- **Pesos Configuráveis** — `vectorWeight`, `bm25Weight`, `minScore`

### Re-ranking com Cross-Encoder

- Adaptadores integrados para **Jina**, **SiliconFlow**, **Voyage AI** e **Pinecone**
- Compatível com qualquer endpoint compatível com Jina (ex.: Hugging Face TEI, DashScope)
- Pontuação híbrida: 60% cross-encoder + 40% da pontuação fundida original
- Degradação suave: volta à similaridade de cosseno em falha de API

### Pipeline de Pontuação em Múltiplas Etapas

| Etapa | Efeito |
| --- | --- |
| **Fusão Híbrida (Hybrid Fusion)** | Combina recall semântico e de correspondência exata |
| **Re-rank por Cross-Encoder (Cross-Encoder Rerank)** | Promove correspondências semanticamente precisas |
| **Boost de Decaimento do Ciclo de Vida (Lifecycle Decay Boost)** | Frescor de Weibull + frequência de acesso + importância × confiança |
| **Normalização de Comprimento (Length Normalization)** | Evita que entradas longas dominem (âncora: 500 caracteres) |
| **Pontuação Mínima Rígida (Hard Min Score)** | Remove resultados irrelevantes (padrão: 0.35) |
| **Diversidade MMR (MMR Diversity)** | Similaridade de cosseno > 0.85 → rebaixado |

### Extração Inteligente de Memória (v1.1.0)

- **Extração de 6 categorias com LLM**: perfil, preferências, entidades, eventos, casos, padrões
- **Armazenamento em Camadas L0/L1/L2**: L0 (índice de uma frase) → L1 (resumo estruturado) → L2 (narrativa completa)
- **Deduplicação em Duas Etapas**: pré-filtro por similaridade vetorial (≥0.7) → decisão semântica do LLM (CREATE/MERGE/SKIP)
- **Fusão Ciente da Categoria**: `profile` sempre faz merge, `events`/`cases` são somente-append

### Gerenciamento do Ciclo de Vida da Memória (v1.1.0)

- **Mecanismo de Decaimento de Weibull**: pontuação composta = recência + frequência + valor intrínseco
- **Promoção em Três Níveis**: `Peripheral ↔ Working ↔ Core` com limiares configuráveis
- **Reforço por Acesso**: memórias frequentemente recuperadas decaem mais devagar (estilo repetição espaçada)
- **Meia-vida Modulada por Importância**: memórias importantes decaem mais devagar

### Isolamento Multi-Escopo

- Escopos integrados: `global`, `agent:<id>`, `custom:<name>`, `project:<id>`, `user:<id>`
- Controle de acesso em nível de agente via `scopes.agentAccess`
- Padrão: cada agente acessa `global` + seu próprio escopo `agent:<id>`
- Ferramentas somente leitura como `memory_recall`, `memory_search`, `memory_list` e `memory_debug` falham suavemente quando um escopo solicitado é inacessível: elas buscam nos escopos acessíveis do chamador e retornam `ignoredScope` e `accessibleScopes` em details. Ferramentas de escrita e mutação ainda retornam `scope_access_denied` para escopos inacessíveis.

### Captura Automática e Recall Automático

- **Captura Automática (Auto-Capture)** (`agent_end`): extrai preferências/fatos/decisões/entidades das conversas, deduplica, armazena até 3 por turno
- **Recall Automático (Auto-Recall)** (antes de cada build de prompt): injeta o contexto `<relevant-memories>` (até 3 entradas)

> **Nota:** no pi, esses hooks do OpenClaw (`agent_end`, `before_prompt_build`, ...) são mapeados a partir de eventos do ciclo de vida do pi (`agent_end`, `input`, `session_start`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`) por `pi-adapter/shim.ts`.

### Filtragem de Ruído e Recuperação Adaptativa

- Filtra conteúdo de baixa qualidade: recusas do agente, meta-perguntas, cumprimentos
- Ignora a recuperação para cumprimentos, comandos de barra, confirmações simples, emojis
- Força a recuperação para palavras-chave de memória ("remember", "previously", "last time")
- Limiares cientes de CJK (chinês: 6 caracteres vs inglês: 15 caracteres)

---

<details>
<summary><strong>Comparado ao <code>memory-lancedb</code> embutido (clique para expandir)</strong></summary>

| Recurso | `memory-lancedb` embutido | **memory-lancedb-pro** |
| --- | :---: | :---: |
| Busca vetorial | Sim | Sim |
| Busca de texto completo BM25 | - | Sim |
| Fusão híbrida (Vector + BM25) | - | Sim |
| Re-rank com cross-encoder (multi-provedor) | - | Sim |
| Boost de recência e decaimento temporal | - | Sim |
| Normalização de comprimento | - | Sim |
| Diversidade MMR | - | Sim |
| Isolamento multi-escopo | - | Sim |
| Filtragem de ruído | - | Sim |
| Recuperação adaptativa | - | Sim |
| CLI de gerenciamento | - | Sim |
| Memória de sessão | - | Sim |
| Embeddings cientes de tarefa | - | Sim |
| **Extração Inteligente com LLM (6 categorias)** | - | Sim (v1.1.0) |
| **Decaimento de Weibull + Promoção por Nível** | - | Sim (v1.1.0) |
| Qualquer embedding compatível com OpenAI | Limitado | Sim |

</details>

---

## Configuração

Toda a configuração fica em `~/.pi/agent/memory-lancedb-pro.json5` (ou `$MEMORY_LANCEDB_PRO_CONFIG`).

Campos de chave de API (`embedding.apiKey`, `retrieval.rerankApiKey` e `llm.apiKey`) aceitam strings simples, placeholders `${ENV_VAR}` ou objetos SecretRef. Este plugin suporta as fontes SecretRef `env` e `file`:

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

Para `source: "file"`, o `id` é resolvido em relação ao home do agente pi e lido como um arquivo UTF-8. O campo opcional `provider` é aceito para compatibilidade de formato com objetos SecretRef, mas não é usado para despacho de provedor. Fontes SecretRef `exec` e outras são rejeitadas pela validação de configuração em tempo de execução.

<details>
<summary><strong>Exemplo Completo de Configuração</strong></summary>

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
<summary><strong>Provedores de Embedding</strong></summary>

Funciona com **APIs de embedding compatíveis com OpenAI**, incluindo adaptadores de payload específicos por provedor para serviços como Jina e Voyage:

| Provedor | Modelo | Base URL | Dimensões |
| --- | --- | --- | --- |
| **Jina** (recomendado) | `jina-embeddings-v5-text-small` | `https://api.jina.ai/v1` | 1024 |
| **OpenAI** | `text-embedding-3-small` | `https://api.openai.com/v1` | 1536 |
| **Voyage** | `voyage-4-lite` / `voyage-4` | `https://api.voyageai.com/v1` | 1024 / 1024 |
| **Google Gemini** | `gemini-embedding-001` | `https://generativelanguage.googleapis.com/v1beta/openai/` | 3072 |
| **Ollama** (local) | `nomic-embed-text` | `http://localhost:11434/v1` | específico do provedor |

Requisições de embedding da Voyage usam o formato de payload `model` + `input` da Voyage. Quando `requestDimensions` está configurado, ele é enviado como `output_dimension`; campos apenas-OpenAI como `encoding_format` são omitidos.

Defina `embedding.maxInputChars` para servidores de embedding locais com contexto pequeno ou limites de lote. O plugin aplica um padrão conservador para `nomic-embed-text`; com o chunking automático habilitado, documentos mais longos são divididos antes que o limite seja aplicado a cada requisição ao provedor.

</details>

<details>
<summary><strong>Provedores de Rerank</strong></summary>

O re-ranking com cross-encoder suporta vários provedores via `rerankProvider`:

| Provedor | `rerankProvider` | Modelo de Exemplo |
| --- | --- | --- |
| **Jina** (padrão) | `jina` | `jina-reranker-v3` |
| **SiliconFlow** (camada gratuita disponível) | `siliconflow` | `BAAI/bge-reranker-v2-m3` |
| **Voyage AI** | `voyage` | `rerank-2.5` |
| **Pinecone** | `pinecone` | `bge-reranker-v2-m3` |

Qualquer endpoint de rerank compatível com Jina também funciona — defina `rerankProvider: "jina"` e aponte `rerankEndpoint` para o seu serviço (ex.: Hugging Face TEI, DashScope `qwen3-rerank`).

</details>

<details>
<summary><strong>Extração Inteligente (LLM) — v1.1.0</strong></summary>

Quando `smartExtraction` está habilitado (padrão: `true`), o plugin usa um LLM para extrair e classificar memórias de forma inteligente, em vez de gatilhos baseados em regex.

| Campo | Tipo | Padrão | Descrição |
|-------|------|---------|-------------|
| `smartExtraction` | boolean | `true` | Habilita/desabilita a extração de 6 categorias com LLM |
| `llm.auth` | string | `api-key` | `api-key` usa `llm.apiKey` / `embedding.apiKey`; `oauth` usa um arquivo de token OAuth no escopo do plugin por padrão |
| `llm.apiKey` | string | *(recai sobre `embedding.apiKey`)* | Chave de API do provedor LLM |
| `llm.model` | string | `openai/gpt-oss-120b` | Nome do modelo LLM |
| `llm.baseURL` | string | *(recai sobre `embedding.baseURL`)* | Endpoint da API LLM |
| `llm.oauthProvider` | string | `openai-codex` | ID do provedor OAuth usado quando `llm.auth` é `oauth` |
| `llm.oauthPath` | string | `~/.pi/agent/.memory-lancedb-pro/oauth.json` | Arquivo de token OAuth usado quando `llm.auth` é `oauth` |
| `llm.timeoutMs` | number | `30000` | Timeout da requisição LLM em milissegundos |
| `extractMinMessages` | number | `2` | Mínimo de mensagens antes da extração disparar |
| `extractMaxChars` | number | `8000` | Máximo de caracteres enviados ao LLM |

Configuração OAuth do `llm` (use um cache de login existente do Codex / ChatGPT para chamadas LLM):

> **Nota:** os fluxos OAuth são herdados do plugin upstream do OpenClaw. No pi, `memory-pro auth login` usa a mesma lógica OAuth; o arquivo de token padrão é `~/.pi/agent/.memory-lancedb-pro/oauth.json`.

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

Notas para `llm.auth: "oauth"`:

- `llm.oauthProvider` atualmente é `openai-codex`.
- Tokens OAuth ficam por padrão em `~/.pi/agent/.memory-lancedb-pro/oauth.json`.
- Você pode definir `llm.oauthPath` se quiser armazenar esse arquivo em outro lugar.
- `auth login` salva um snapshot da configuração anterior do `llm` com `api-key` ao lado do arquivo OAuth, e `auth logout` restaura esse snapshot quando disponível.
- Mudar de `api-key` para `oauth` não transfere automaticamente `llm.baseURL`. Defina-o manualmente no modo OAuth apenas quando quiser intencionalmente um backend customizado compatível com ChatGPT/Codex.

</details>

<details>
<summary><strong>Fallback para CPU Legado</strong></summary>

Se um host Linux x64 apenas com AVX travar na busca vetorial nativa do LanceDB com `SIGILL`, desabilite o cosseno nativo e deixe o memory-lancedb-pro escanear linhas com escopo e classificá-las em JavaScript:

```json5
{
  retrieval: {
    disableNativeCosine: true
  }
}
```

Você também pode definir `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` para o mesmo comportamento.

</details>

<details>
<summary><strong>Configuração do Ciclo de Vida (Decaimento + Nível)</strong></summary>

| Campo | Padrão | Descrição |
|-------|---------|-------------|
| `decay.recencyHalfLifeDays` | `30` | Meia-vida base para o decaimento de recência de Weibull |
| `decay.frequencyWeight` | `0.3` | Peso da frequência de acesso na pontuação composta |
| `decay.intrinsicWeight` | `0.3` | Peso de `importância × confiança` |
| `decay.betaCore` | `0.8` | Beta de Weibull para memórias `core` |
| `decay.betaWorking` | `1.0` | Beta de Weibull para memórias `working` |
| `decay.betaPeripheral` | `1.3` | Beta de Weibull para memórias `peripheral` |
| `tier.coreAccessThreshold` | `10` | Mínimo de recalls antes de promover a `core` |
| `tier.peripheralAgeDays` | `60` | Limiar de idade para rebaixar memórias obsoletas |

</details>

<details>
<summary><strong>Reforço por Acesso</strong></summary>

Memórias frequentemente recuperadas decaem mais devagar (estilo repetição espaçada).

Chaves de configuração (em `retrieval`):
- `reinforcementFactor` (0-2, padrão: `0.5`) — defina `0` para desabilitar
- `maxHalfLifeMultiplier` (1-10, padrão: `3`) — teto rígido para a meia-vida efetiva

</details>

---

## Comandos CLI

O binário `memory-pro` fica disponível após `npm run build`:

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

Dentro de uma sessão do pi, a mesma superfície de gerenciamento está disponível como o comando de barra **`/memory-pro`**.

> A CLI lê o mesmo arquivo de configuração que a extensão (`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `~/.pi/agent/memory-lancedb-pro.json`).

Fluxo de login OAuth:

1. Execute `memory-pro auth login`
2. Se `--provider` for omitido em um terminal interativo, a CLI mostra um seletor de provedor OAuth antes de abrir o navegador
3. O comando imprime uma URL de autorização e abre seu navegador, a menos que `--no-browser` esteja definido
4. Após o callback ter sucesso, o comando salva o arquivo OAuth do plugin (padrão: `~/.pi/agent/.memory-lancedb-pro/oauth.json`), captura um snapshot da configuração anterior do `llm` com `api-key` para logout, e substitui a configuração `llm` do plugin pelas configurações OAuth (`auth`, `oauthProvider`, `model`, `oauthPath`)
5. `memory-pro auth logout` exclui esse arquivo OAuth e restaura a configuração anterior do `llm` com `api-key` quando esse snapshot existe

---

## Tópicos Avançados

<details>
<summary><strong>Atualizando de uma versão anterior do port</strong></summary>

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

Veja `CHANGELOG-v1.1.0.md` para mudanças de comportamento e a justificativa do upgrade.

**Quer ativar as dicas de tarefa da Jina em um banco existente?**

As dicas de tarefa são duas chaves de configuração no bloco `embedding`:

```json5
{
  embedding: {
    model: "jina-embeddings-v5-text-small",
    taskQuery: "retrieval.query",
    taskPassage: "retrieval.passage"
  }
}
```

Elas afetam apenas vetores gravados *depois* de defini-las. Linhas já existentes no seu store foram embutidas sem dica de tarefa, então uma consulta embutida com `retrieval.query` é comparada com passagens que vivem em um espaço vetorial diferente — você obtém aproximadamente metade do benefício, silenciosamente.

Para corrigir linhas existentes, re-embuta em um **banco novo e mude para ele**. **Não** re-embuta no lugar: `reembed` grava cada linha com `table.add()` (append por id, não substituição), então uma execução no lugar — exatamente o que `--force` libera — deixa o vetor antigo ao lado do novo e **duplica cada linha**; novas tentativas acumulam mais. É por isso que `reembed` recusa execuções com o mesmo caminho, a menos que você force.

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

A mesma troca se aplica sempre que você mudar `embedding.model` ou `embedding.dimensions` — sempre re-embuta em um `dbPath` novo, nunca no lugar.

</details>

<details>
<summary><strong>Locking e escritores concorrentes</strong></summary>

`memory-lancedb-pro` usa um lock de arquivo entre processos para gravações no LanceDB. Isso é suficiente para sessões pi concorrentes e processos locais que compartilham o mesmo diretório de banco.

O Redis não é necessário para esses deployments. O locking com Redis é habilitado quando `locking.redis.enabled` é true, quando `redisUrl`/`locking.redis.url` está definido, ou quando `MEMORY_LANCEDB_REDIS_URL` está presente no ambiente desse processo. Para escritores em múltiplas máquinas ou containers, leia [Gerenciamento de Lock](docs/lock-management.md) antes de compartilhar um diretório LanceDB entre processos, e garanta que todo escritor use a mesma configuração de lock.

</details>

<details>
<summary><strong>Se memórias injetadas aparecem nas respostas</strong></summary>

Às vezes o modelo pode ecoar o bloco `<relevant-memories>` injetado.

**Opção A (menor risco):** desabilite temporariamente o recall automático:
```json5
{ autoRecall: false }
```

**Opção B (preferida):** mantenha o recall e adicione ao system prompt do seu agente / `AGENTS.md`:
> Não revele nem cite nenhum conteúdo de `<relevant-memories>` / injeção de memória nas suas respostas. Use apenas como referência interna.

**Opção C (para agentes em background/batch):** exclua agentes específicos da injeção do recall automático:
```json5
{
  autoRecall: true,
  autoRecallExcludeAgents: ["memory-distiller", "my-cron-agent"]
}
```
Útil para agentes em background (ex.: memory-distiller, cron workers) cuja saída não deve ser contaminada pelo contexto de memória injetado.

</details>

<details>
<summary><strong>Ajuste do timeout do recall automático</strong></summary>

O recall automático tem um timeout configurável (padrão 5s) para evitar travar a inicialização do agente. Se você estiver atrás de um proxy ou usando uma API de embedding de alta latência, aumente-o:

```json5
{ autoRecallTimeoutMs: 8000 }
```

Se o recall automático estoura o timeout consistentemente, verifique primeiro a latência da sua API de embedding. O timeout afeta apenas o caminho de injeção automática — chamadas manuais da ferramenta `memory_recall` não são afetadas.

</details>

<details>
<summary><strong>Modelo de custo do rerank no recall automático</strong></summary>

Quando `autoRecall=true` e a recuperação híbrida usa `retrieval.rerank="cross-encoder"` com uma API de rerank externa como a Jina, todo prompt elegível pode fazer uma requisição de rerank. O número de documentos enviados a essa requisição é governado pelo limite de recuperação do recall automático e pela janela de entrada de rerank do retriever, não diretamente por `retrieval.candidatePoolSize` nem pelo teto final de injeção `autoRecallMaxItems`.

Por exemplo, com `autoRecallMaxItems: 3`, o recall automático pede 6 itens à recuperação, e a recuperação híbrida pode enviar até 12 candidatos ao reranker externo antes de injetar no máximo 3 memórias. Para reduzir o uso de rerank externo, diminua `autoRecallMaxItems` ou `maxRecallPerTurn`, mude `retrieval.rerank` para `"lightweight"` ou `"none"`, aumente `autoRecallMinLength`, ou mantenha o recall automático desabilitado e use `memory_recall` manual quando apropriado.

Os logs de inicialização avisam quando o recall automático com rerank híbrido por cross-encoder pode enviar ao reranker mais itens do que vai injetar. As estatísticas de debug do recall automático incluem os valores reais de `rerankInput`, `rerankInputLimit`, `retrieveLimit`, `rerank`, `rerankProvider` e `retrievalCandidatePoolSize` configurado.

</details>

<details>
<summary><strong>Memória de Sessão</strong></summary>

- Dispara em eventos de nova sessão — salva o resumo da sessão anterior no LanceDB
- Desabilitada por padrão (o pi já persiste transcrições de sessão `.jsonl`)
- Contagem de mensagens configurável (padrão: 15)

</details>

<details>
<summary><strong>Comandos de Barra Personalizados (ex.: /lesson)</strong></summary>

Adicione ao seu `AGENTS.md` ou system prompt:

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
<summary><strong>Regras de Ferro para Agentes de IA</strong></summary>

> Copie o bloco abaixo para o seu `AGENTS.md` para que seu agente aplique essas regras automaticamente.

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
<summary><strong>Esquema do Banco de Dados</strong></summary>

Tabela LanceDB `memories`:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string (UUID) | Chave primária |
| `text` | string | Texto da memória (indexado por FTS) |
| `vector` | float[] | Vetor de embedding |
| `category` | string | Categoria de armazenamento: `preference` / `fact` / `decision` / `entity` / `reflection` / `other` |
| `scope` | string | Identificador de escopo (ex.: `global`, `agent:main`) |
| `importance` | float | Pontuação de importância 0-1 |
| `timestamp` | int64 | Timestamp de criação (ms) |
| `metadata` | string (JSON) | Metadados estendidos |

Chaves `metadata` comuns na v1.1.0: `l0_abstract`, `l1_overview`, `l2_content`, `memory_category`, `tier`, `access_count`, `confidence`, `last_accessed_at`

> **Nota sobre categorias:** o campo `category` de nível superior usa 6 categorias de armazenamento. Os rótulos semânticos de 6 categorias da Extração Inteligente (`profile` / `preferences` / `entities` / `events` / `cases` / `patterns`) ficam em `metadata.memory_category`.

</details>

<details>
<summary><strong>Solução de Problemas</strong></summary>

**A extensão não carrega / "nenhum arquivo de configuração encontrado"**

Crie `~/.pi/agent/memory-lancedb-pro.json5` ou defina `$MEMORY_LANCEDB_PRO_CONFIG`. A extensão imprime um aviso com o formato esperado e permanece desabilitada — o pi continua rodando.

**Falha na inicialização da extração inteligente**

Verifique se `llm.apiKey` / `${ENV_VAR}` está definido; o plugin recai para extração com regex em vez de falhar.

**"Cannot mix BigInt and other types" (LanceDB / Apache Arrow)**

No LanceDB 0.26+, algumas colunas numéricas podem ser retornadas como `BigInt`. Atualize para **memory-lancedb-pro >= 1.0.14** — este plugin agora converte valores com `Number(...)` antes da aritmética.

</details>

---

## Arquitetura

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

> Para um mergulho profundo na arquitetura completa, veja [docs/memory_architecture_analysis.md](docs/memory_architecture_analysis.md).

<details>
<summary><strong>Referência de Arquivos (clique para expandir)</strong></summary>

| Arquivo | Propósito |
| --- | --- |
| `pi-adapter/index.ts` | Ponto de entrada do pi: carrega o arquivo de configuração, constrói o shim da API OpenClaw, registra o núcleo do plugin |
| `pi-adapter/shim.ts` | Mapeia eventos do ciclo de vida / ferramentas / comandos do pi para a API de plugin do OpenClaw |
| `pi-adapter/config.ts` | Carregamento do arquivo de configuração (`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `.json`) |
| `pi-adapter/paths.ts` | Resolução de caminhos do pi (`~/.pi/agent`, overrides por env) |
| `pi-adapter/pi-runner.ts` | Runner de sub-agente embutido via `pi --mode json --no-tools ...` |
| `pi-adapter/cli-main.ts` | Ponto de entrada CLI autônoma `memory-pro` |
| `index.ts` | Entrada do núcleo do plugin: parsing de configuração, hooks do ciclo de vida, registro da capacidade de memória |
| `src/store.ts` | Camada de armazenamento LanceDB. Criação de tabelas / indexação FTS / busca vetorial / busca BM25 / CRUD |
| `src/embedder.ts` | Abstração de embedding. Compatível com qualquer provedor de API compatível com OpenAI |
| `src/retriever.ts` | Mecanismo de recuperação híbrida. Vector + BM25 → Hybrid Fusion → Rerank → Lifecycle Decay → Filter |
| `src/scopes.ts` | Controle de acesso multi-escopo |
| `src/tools.ts` | Definições de ferramentas do agente: `memory_recall`, `memory_store`, `memory_forget`, `memory_update` + ferramentas de gerenciamento |
| `src/noise-filter.ts` | Filtra recusas do agente, meta-perguntas, cumprimentos e conteúdo de baixa qualidade |
| `src/adaptive-retrieval.ts` | Determina se uma consulta precisa de recuperação de memória |
| `src/migrate.ts` | Migração do `memory-lancedb` embutido para o Pro |
| `src/smart-extractor.ts` | Extração de 6 categorias com LLM, com armazenamento em camadas L0/L1/L2 e deduplicação em duas etapas |
| `src/decay-engine.ts` | Modelo de decaimento exponencial esticado de Weibull |
| `src/tier-manager.ts` | Promoção/rebaixamento em três níveis: Peripheral ↔ Working ↔ Core |

</details>

---

## Apêndice: OpenClaw original

Este repositório é um port. O projeto upstream é o **[CortexReach/memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)** — um plugin OpenClaw. Tudo abaixo documenta o uso upstream do OpenClaw; usuários do pi não precisam disso.

### O que mudou (diferenças do port)

| Área | OpenClaw (upstream) | Pi (este port) |
|---|---|---|
| Bootstrap da extensão | `openclaw.plugin.json` / `openclaw.extensions` | `pi-adapter/index.ts` → compilado para `dist/pi-adapter/index.js`, declarado via `pi.extensions` no `package.json` |
| Arquivo de configuração | Entrada de plugin em `openclaw.json` | `~/.pi/agent/memory-lancedb-pro.json5` (ou `$MEMORY_LANCEDB_PRO_CONFIG`) — mesma forma de documento |
| Diretório base de dados e sessões | `~/.openclaw/...` | `~/.pi/agent/...` (substituível com `PI_CODING_AGENT_DIR` / `PI_AGENT_DIR`) |
| CLI | `openclaw memory-pro …` | Binário autônomo: `memory-pro …` (compilado de `pi-adapter/cli-main.ts`) |
| Comando de barra | CLI registrado no `openclaw` | `pi.registerCommand("/memory-pro", ...)` via shim |
| Runner de sub-agente embutido | OpenClaw runtime API | Chama externamente `pi --mode json --no-tools …` (`pi-adapter/pi-runner.ts`) |
| Layout de sessões | `~/.openclaw/agents/<id>/sessions/*.jsonl` | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| Versão | `1.1.0-beta.11` | `1.1.0-beta.11-pi.1` |

Os eventos do ciclo de vida são mapeados de eventos do pi para hooks do OpenClaw via `pi-adapter/shim.ts`: `input`, `session_start`, `before_agent_start`, `agent_end`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`. As ferramentas do plugin (`memory_store`, `memory_recall`, …) e o comando de barra `/memory-pro` são registrados pelo shim sem alterações.

### Início Rápido Upstream (apenas OpenClaw)

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

Os comandos upstream usam o prefixo `openclaw memory-pro ...`. Veja o [README upstream](https://github.com/CortexReach/memory-lancedb-pro) para a documentação completa do OpenClaw.

### Ecossistema upstream

- **[Setup script](https://github.com/CortexReach/toolbox/tree/main/memory-lancedb-pro-setup)** — instalação/upgrade/reparo em um clique para deployments OpenClaw (escreve `openclaw.json`)
- **[AI-guided config skill](https://github.com/CortexReach/memory-lancedb-pro-skill)** — para agentes Claude Code / OpenClaw
- **Vídeo tutoriais** — [YouTube](https://youtu.be/MtukF1C8epQ) · [Bilibili](https://www.bilibili.com/video/BV1zUf2BGEgn/)
- **Histórico de estrelas** — [star-history.com](https://star-history.com/#CortexReach/memory-lancedb-pro&Date)

---

## Documentação

| Documento | Descrição |
| --- | --- |
| [Memory Architecture Analysis](docs/memory_architecture_analysis.md) | Mergulho profundo na arquitetura completa |
| [CHANGELOG v1.1.0](docs/CHANGELOG-v1.1.0.md) | Mudanças de comportamento da v1.1.0 e justificativa do upgrade |
| [Release Checklist](docs/release-checklist.md) | Pré-checagem do pacote, dry run de publicação e smoke checks pós-publicação |
| [Long-Context Chunking](docs/long-context-chunking.md) | Estratégia de chunking para documentos longos |
| [Lock Management](docs/lock-management.md) | Detalhes de locking multi-escritor (Redis) |

## Testes

```bash
npm test                       # full unit/e2e suite
node scripts/run-ci-tests.mjs --all   # full CI manifest
npm run test:pi-adapter        # pi adapter smoke test (mock pi API)
```

Todos os testes upstream são preservados; `test/pi-adapter-smoke.test.mjs` e `test:pi-adapter` são novos.

---

## Beta: Memória Inteligente v1.1.0

> Status: Beta — disponível via `npm i memory-lancedb-pro@beta`. Usuários estáveis no `latest` não são afetados.

| Recurso | Descrição |
|---------|-------------|
| **Extração Inteligente** | Extração de 6 categorias com LLM e metadados L0/L1/L2. Cai para regex quando desabilitada. |
| **Pontuação do Ciclo de Vida** | Decaimento de Weibull integrado à recuperação — memórias de alta frequência e alta importância rankeiam mais alto. |
| **Gerenciamento de Níveis** | Sistema de três níveis (Core → Working → Peripheral) com promoção/rebaixamento automáticos. |

Feedback: [GitHub Issues](https://github.com/CortexReach/memory-lancedb-pro/issues) · Reverter: `npm i memory-lancedb-pro@latest`

---

## Dependências

| Pacote | Propósito |
| --- | --- |
| `@lancedb/lancedb` ≥0.26.2 | Banco de dados vetorial (ANN + FTS) |
| `openai` ≥6.21.0 | Cliente de API de embedding compatível com OpenAI |
| `@sinclair/typebox` 0.34.48 | Definições de tipos JSON Schema |

---

## Contribuidores

Mantenedores e contribuidores upstream (veja a [lista completa](https://github.com/CortexReach/memory-lancedb-pro/graphs/contributors)):

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
