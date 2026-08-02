<div align="center">

# 🧠 memory-lancedb-pro · π Расширение для pi coding agent

**ИИ-ассистент памяти для [pi coding agent](https://github.com/earendil-works/pi)**

*Дайте своему ИИ-агенту мозг, который действительно помнит — между сессиями, между проектами, с течением времени.*

Расширение памяти на базе LanceDB для pi: сохраняет предпочтения, решения и контекст проекта, а затем автоматически вспоминает их в будущих сессиях.

[![Pi Extension](https://img.shields.io/badge/Pi-Extension-blue)](https://github.com/earendil-works/pi)
[![Pi 0.80+](https://img.shields.io/badge/pi-0.80%2B-brightgreen)](https://github.com/earendil-works/pi)
[![LanceDB](https://img.shields.io/badge/LanceDB-Vectorstore-orange)](https://lancedb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) | [简体中文](README_CN.md) | [繁體中文](README_TW.md) | [日本語](README_JA.md) | [한국어](README_KO.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Deutsch](README_DE.md) | [Italiano](README_IT.md) | [Русский](README_RU.md) | [Português (Brasil)](README_PT-BR.md)

</div>

---

## 🤖 О данном порте

Этот репозиторий — **порт плагина памяти производственного уровня [memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro) (MIT) для pi coding agent**. Ядро плагина OpenClaw полностью не изменено и загружается без изменений через тонкий адаптер (`pi-adapter/`), поэтому pi (≥ 0.80) получает тот же движок памяти на базе LanceDB с минимальными отличиями от вышестоящего проекта.

> Всё ниже описывает работу с pi. Таблицу отличий порта и исходное использование OpenClaw см. в [Приложении: оригинальный OpenClaw](#приложение-оригинальный-openclaw) внизу.

---

## Зачем memory-lancedb-pro?

У большинства ИИ-агентов амнезия. Они забывают всё в тот момент, когда вы начинаете новый чат.

**memory-lancedb-pro** — это долгосрочная память производственного уровня, которая превращает вашего агента в **ИИ-ассистента памяти** — она автоматически захватывает важное, позволяет шуму естественно угасать и достаёт нужное воспоминание в нужный момент. Никакой ручной разметки, никаких проблем с настройкой.

### Ваш ИИ-ассистент памяти в действии

**Без памяти — каждая сессия начинается с нуля:**

> **Вы:** «Используй табы для отступов, всегда добавляй обработку ошибок».
> *(следующая сессия)*
> **Вы:** «Я же уже говорил — табы, а не пробелы!» 😤
> *(следующая сессия)*
> **Вы:** «...серьёзно, табы. И обработка ошибок. Опять.»

**С memory-lancedb-pro — ваш агент учится и помнит:**

> **Вы:** «Используй табы для отступов, всегда добавляй обработку ошибок».
> *(следующая сессия — агент автоматически вспоминает ваши предпочтения)*
> **Агент:** *(молча применяет табы + обработку ошибок)* ✅
> **Вы:** «Почему в прошлом месяце мы выбрали PostgreSQL, а не MongoDB?»
> **Агент:** «Судя по нашему обсуждению от 12 февраля, основные причины были...» ✅

Именно такую разницу даёт **ИИ-ассистент памяти** — он изучает ваш стиль, вспоминает прошлые решения и выдаёт персонализированные ответы, а вам не нужно повторяться.

### Что ещё он умеет?

| | Что вы получаете |
|---|---|
| **Автозахват (Auto-Capture)** | Агент учится из каждого разговора — ручной `memory_store` не нужен |
| **Умное извлечение (Smart Extraction)** | Классификация по 6 категориям на основе LLM: профили, предпочтения, сущности, события, кейсы, паттерны |
| **Интеллектуальное забывание (Intelligent Forgetting)** | Модель затухания Вейбулла — важные воспоминания остаются, шум естественно угасает |
| **Гибридный поиск (Hybrid Retrieval)** | Векторный + полнотекстовый поиск BM25, объединённые с переранжированием кросс-энкодером |
| **Внедрение контекста (Context Injection)** | Релевантные воспоминания автоматически всплывают перед каждым ответом |
| **Изоляция по областям (Multi-Scope Isolation)** | Отдельные границы памяти для каждого агента, пользователя, проекта |
| **Любой провайдер (Any Provider)** | OpenAI, Jina, Gemini, Ollama или любой OpenAI-совместимый API |
| **Полный набор инструментов (Full Toolkit)** | CLI, резервное копирование, миграция, обновление, экспорт/импорт — готово к продакшену |

---

## Быстрый старт

> **Требование к CPU:** ваш CPU должен поддерживать инструкции **AVX**. Нативный векторный поиск LanceDB на некоторых Linux x64-сборках может требовать **AVX2** и вызывать падение с `SIGILL` на CPU только с AVX; установите `retrieval.disableNativeCosine: true` или `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1`, чтобы использовать ограниченное сканирование строк с ранжированием косинуса на JavaScript. Проверьте флаги CPU: `grep -o 'avx[^ ]*' /proc/cpuinfo | head -1` (нет вывода = не поддерживается). Подробности: [#419](https://github.com/CortexReach/memory-lancedb-pro/issues/419) и [#644](https://github.com/CortexReach/memory-lancedb-pro/issues/644).

### 1. Сборка расширения

```bash
git clone https://github.com/lhxyzCJ/TestForPi-memory-lancedb-pro
cd TestForPi-memory-lancedb-pro && npm install && npm run build
```

Точка входа pi — `dist/pi-adapter/index.js` (компилируется из `pi-adapter/index.ts`).

### 2. Регистрация расширения

Выберите один из способов:

**A. Через файл настроек pi (глобально, для всех проектов):**

Добавьте в `~/.pi/agent/settings.json`:

```json
{
  "extensions": [
    "/absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js"
  ]
}
```

**B. Через менеджер пакетов pi:**

```bash
pi install /absolute/path/to/TestForPi-memory-lancedb-pro
```

**C. Быстрая проверка на одну сессию:**

```bash
pi -e /absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js
```

**D. Автообнаружение (без изменения настроек):** положите собранное расширение (или `package.json` с полем `pi.extensions`) в `~/.pi/agent/extensions/` (глобально) или `.pi/extensions/` (локально для проекта) и перезапустите pi.

### 3. Создание файла конфигурации

Создайте `~/.pi/agent/memory-lancedb-pro.json5` (можно также использовать `.json` или указать любой путь через `$MEMORY_LANCEDB_PRO_CONFIG`):

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

> Форма документа конфигурации идентична записи вышестоящего плагина OpenClaw — принимаются как голый внутренний объект выше, так и обёртка `{ "config": { ... } }`.

### 4. Проверка

Запустите сессию pi и посмотрите в стартовый лог:

```
memory-lancedb-pro: smart extraction enabled
memory-lancedb-pro@...: plugin registered (db: /root/.pi-agent/memory/lancedb-pro, ...)
```

Затем попросите агента что-то запомнить и вспомнить:

> **Вы:** «Запомни: я предпочитаю табы пробелам».
> **Вы:** «Какие у меня предпочтения по отступам?»

### Почему такие настройки по умолчанию?

- `autoCapture` + `smartExtraction` → агент автоматически учится из каждого разговора
- `autoRecall` → релевантные воспоминания внедряются перед каждым ответом
- `extractMinMessages: 2` → извлечение срабатывает в обычных диалогах из двух реплик
- `sessionMemory.enabled: false` → не загрязняет поиск сводками сессий с первого дня

---

## ⚠️ Архитектура памяти (важно)

Расширение предоставляет одну возможность памяти с двумя согласованными хранилищами:

| Слой памяти | Хранилище | Для чего | Вспоминается? |
|---|---|---|---|
| **Память плагина** | LanceDB (векторное хранилище) | Семантическое вспоминание через `memory_recall` / автовспоминание | ✅ Да |
| **Канонический корпус** | `MEMORY.md`, `memory/**/*.md`, недавние транскрипты сессий, `memory/dreaming/**/*.md` | Файлы-источники истины и публичные артефакты | ✅ Через семантический индекс LanceDB, когда `canonicalCorpus.enabled` равно true |

**Ключевой принцип:**
> Канонические файлы остаются источником истины. LanceDB — это семантический индекс, через который они извлекаются с привязкой к путям, диапазонам строк, фрагментам и цитатам.

**Что это значит для вас:**
- Нужен семантический поиск? → Используйте `memory_store` или позвольте автозахвату сделать это
- `memory/YYYY-MM-DD.md` → считайте **ежедневным журналом / логом**, который также можно индексировать для семантического поиска
- `MEMORY.md` → курируемая читаемая человеком справка, которую можно индексировать как канонический контекст
- `memory/dreaming/**/*.md` → отчёты dreaming, публикуемые как публичные артефакты и индексируемые как контекст рефлексии
- JSONL-транскрипты сессий → индексируются как `source: "sessions"`, когда `canonicalCorpus.includeSessionTranscripts` включено
- Память плагина → основной путь записи для долговечных фактов, предпочтений, решений и автоматически захваченных воспоминаний

### Где хранятся данные (pi)

| Что | Путь |
|---|---|
| База данных плагина (LanceDB) | `~/.pi/agent/memory/lancedb-pro` (или `$MEMORY_LANCEDB_PRO_DB_PATH`) |
| Markdown-зеркало | `~/.pi/agent/memory/md-mirror` (или `$MEMORY_LANCEDB_PRO_MD_MIRROR_DIR`) |
| Транскрипты сессий | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| Глобальные навыки | `~/.pi/agent/skills` |

Базовая директория — `~/.pi/agent`; её можно переопределить через `PI_CODING_AGENT_DIR` или `PI_AGENT_DIR`. Относительные пути в конфигурации (`dbPath`, `mdMirrorDir`, ...) разрешаются относительно домашней директории pi agent.

### Расположение файлов конфигурации (в порядке приоритета)

1. `$MEMORY_LANCEDB_PRO_CONFIG` (явный путь)
2. `~/.pi/agent/memory-lancedb-pro.json5`
3. `~/.pi/agent/memory-lancedb-pro.json`

Если файл конфигурации не найден, расширение выводит предупреждение и остаётся отключённым — сломанная или отсутствующая конфигурация никогда не роняет сессию pi.

---

## Основные возможности

### Гибридный поиск

```
Query → embedQuery() ─┐
                       ├─→ Hybrid Fusion → Rerank → Lifecycle Decay Boost → Length Norm → Filter
Query → BM25 FTS ─────┘
```

- **Векторный поиск** — семантическая близость через ANN LanceDB (косинусное расстояние)
- **Полнотекстовый поиск BM25** — точное совпадение ключевых слов через FTS-индекс LanceDB
- **Гибридное объединение (Hybrid Fusion)** — векторный балл как база, совпадения BM25 получают взвешенное усиление (не стандартный RRF — настроено под реальное качество вспоминания)
- **Настраиваемые веса** — `vectorWeight`, `bm25Weight`, `minScore`

### Переранжирование кросс-энкодером

- Встроенные адаптеры для **Jina**, **SiliconFlow**, **Voyage AI** и **Pinecone**
- Совместимо с любым Jina-совместимым эндпоинтом (например, Hugging Face TEI, DashScope)
- Гибридный балл: 60% кросс-энкодер + 40% исходный объединённый балл
- Мягкая деградация: при ошибке API используется косинусное сходство

### Многоэтапный конвейер оценки

| Этап | Эффект |
| --- | --- |
| **Гибридное объединение (Hybrid Fusion)** | Объединяет семантическое и точное совпадение |
| **Переранжирование кросс-энкодером (Cross-Encoder Rerank)** | Продвигает семантически точные совпадения |
| **Усиление затухания жизненного цикла (Lifecycle Decay Boost)** | Свежесть Вейбулла + частота доступа + важность × уверенность |
| **Нормализация длины (Length Normalization)** | Не даёт длинным записям доминировать (якорь: 500 символов) |
| **Жёсткий минимальный балл (Hard Min Score)** | Убирает нерелевантные результаты (по умолчанию: 0.35) |
| **MMR-разнообразие (MMR Diversity)** | Косинусное сходство > 0.85 → понижение |

### Умное извлечение памяти (v1.1.0)

- **Извлечение 6 категорий на основе LLM**: профиль, предпочтения, сущности, события, кейсы, паттерны
- **Многоуровневое хранение L0/L1/L2**: L0 (однофразовый индекс) → L1 (структурированное резюме) → L2 (полное повествование)
- **Двухэтапная дедупликация**: предфильтр по векторному сходству (≥0.7) → семантическое решение LLM (CREATE/MERGE/SKIP)
- **Слияние с учётом категории**: `profile` всегда сливается, `events`/`cases` только дополняются

### Управление жизненным циклом памяти (v1.1.0)

- **Движок затухания Вейбулла**: составной балл = свежесть + частота + внутренняя ценность
- **Трёхуровневое продвижение**: `Peripheral ↔ Working ↔ Core` с настраиваемыми порогами
- **Усиление при доступе**: часто вспоминаемые записи затухают медленнее (в стиле интервального повторения)
- **Период полураспада, модулируемый важностью**: важные воспоминания затухают медленнее

### Изоляция по областям (scopes)

- Встроенные области: `global`, `agent:<id>`, `custom:<name>`, `project:<id>`, `user:<id>`
- Контроль доступа на уровне агента через `scopes.agentAccess`
- По умолчанию: каждый агент имеет доступ к `global` + собственной области `agent:<id>`
- Инструменты только для чтения, такие как `memory_recall`, `memory_search`, `memory_list` и `memory_debug`, мягко завершаются, когда запрошенная область недоступна: они ищут в доступных вызывающему областях и возвращают `ignoredScope` и `accessibleScopes` в details. Инструменты записи и изменения всё же возвращают `scope_access_denied` для недоступных областей.

### Автозахват и автовспоминание

- **Автозахват (Auto-Capture)** (`agent_end`): извлекает из разговоров предпочтения/факты/решения/сущности, дедуплицирует, сохраняет до 3 записей за один ход
- **Автовспоминание (Auto-Recall)** (перед каждой сборкой промпта): внедряет контекст `<relevant-memories>` (до 3 записей)

> **Примечание:** на pi эти хуки OpenClaw (`agent_end`, `before_prompt_build`, ...) сопоставляются с событиями жизненного цикла pi (`agent_end`, `input`, `session_start`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`) через `pi-adapter/shim.ts`.

### Фильтрация шума и адаптивный поиск

- Отфильтровывает низкокачественный контент: отказы агента, мета-вопросы, приветствия
- Пропускает поиск для приветствий, слэш-команд, простых подтверждений, эмодзи
- Принудительно запускает поиск по ключевым словам памяти («запомни», «ранее», «в прошлый раз»)
- Пороги с учётом CJK (китайский: 6 символов против английского: 15 символов)

---

<details>
<summary><strong>Сравнение со встроенным <code>memory-lancedb</code> (нажмите, чтобы развернуть)</strong></summary>

| Возможность | Встроенный `memory-lancedb` | **memory-lancedb-pro** |
| --- | :---: | :---: |
| Векторный поиск | Да | Да |
| Полнотекстовый поиск BM25 | - | Да |
| Гибридное объединение (Vector + BM25) | - | Да |
| Переранжирование кросс-энкодером (несколько провайдеров) | - | Да |
| Усиление свежести и затухание времени | - | Да |
| Нормализация длины | - | Да |
| MMR-разнообразие | - | Да |
| Изоляция по областям | - | Да |
| Фильтрация шума | - | Да |
| Адаптивный поиск | - | Да |
| Управляющий CLI | - | Да |
| Память сессии | - | Да |
| Эмбеддинги с учётом задачи | - | Да |
| **Умное извлечение на LLM (6 категорий)** | - | Да (v1.1.0) |
| **Затухание Вейбулла + продвижение по уровням** | - | Да (v1.1.0) |
| Любые OpenAI-совместимые эмбеддинги | Ограниченно | Да |

</details>

---

## Конфигурация

Вся конфигурация живёт в `~/.pi/agent/memory-lancedb-pro.json5` (или `$MEMORY_LANCEDB_PRO_CONFIG`).

Поля с API-ключами (`embedding.apiKey`, `retrieval.rerankApiKey` и `llm.apiKey`) принимают простые строки, плейсхолдеры `${ENV_VAR}` или объекты SecretRef. Плагин поддерживает источники SecretRef `env` и `file`:

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

Для `source: "file"` значение `id` разрешается относительно домашней директории pi agent и читается как UTF-8 файл. Необязательное поле `provider` принимается для совместимости с объектной формой SecretRef, но не используется для выбора провайдера. Источники SecretRef `exec` и прочие отклоняются проверкой конфигурации во время выполнения.

<details>
<summary><strong>Полный пример конфигурации</strong></summary>

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
<summary><strong>Провайдеры эмбеддингов</strong></summary>

Работает с **OpenAI-совместимыми API эмбеддингов**, включая адаптеры полезной нагрузки для таких сервисов, как Jina и Voyage:

| Провайдер | Модель | Base URL | Размерность |
| --- | --- | --- | --- |
| **Jina** (рекомендуется) | `jina-embeddings-v5-text-small` | `https://api.jina.ai/v1` | 1024 |
| **OpenAI** | `text-embedding-3-small` | `https://api.openai.com/v1` | 1536 |
| **Voyage** | `voyage-4-lite` / `voyage-4` | `https://api.voyageai.com/v1` | 1024 / 1024 |
| **Google Gemini** | `gemini-embedding-001` | `https://generativelanguage.googleapis.com/v1beta/openai/` | 3072 |
| **Ollama** (локально) | `nomic-embed-text` | `http://localhost:11434/v1` | зависит от провайдера |

Запросы эмбеддингов Voyage используют форму полезной нагрузки `model` + `input` Voyage. Когда настроен `requestDimensions`, он отправляется как `output_dimension`; поля только для OpenAI, такие как `encoding_format`, опускаются.

Задайте `embedding.maxInputChars` для локальных серверов эмбеддингов с малым контекстом или лимитами батчей. Плагин применяет консервативное значение по умолчанию для `nomic-embed-text`; с включённым автоматическим разбиением длинные документы делятся до того, как лимит применяется к каждому запросу провайдера.

</details>

<details>
<summary><strong>Провайдеры rerank</strong></summary>

Переранжирование кросс-энкодером поддерживает несколько провайдеров через `rerankProvider`:

| Провайдер | `rerankProvider` | Пример модели |
| --- | --- | --- |
| **Jina** (по умолчанию) | `jina` | `jina-reranker-v3` |
| **SiliconFlow** (есть бесплатный тариф) | `siliconflow` | `BAAI/bge-reranker-v2-m3` |
| **Voyage AI** | `voyage` | `rerank-2.5` |
| **Pinecone** | `pinecone` | `bge-reranker-v2-m3` |

Также подойдёт любой Jina-совместимый rerank-эндпоинт — задайте `rerankProvider: "jina"` и укажите `rerankEndpoint` на ваш сервис (например, Hugging Face TEI, DashScope `qwen3-rerank`).

</details>

<details>
<summary><strong>Умное извлечение (LLM) — v1.1.0</strong></summary>

Когда `smartExtraction` включено (по умолчанию: `true`), плагин использует LLM для интеллектуального извлечения и классификации воспоминаний вместо триггеров на основе регулярных выражений.

| Поле | Тип | По умолчанию | Описание |
|-------|------|-------------|-------------|
| `smartExtraction` | boolean | `true` | Включить/выключить LLM-извлечение 6 категорий |
| `llm.auth` | string | `api-key` | `api-key` использует `llm.apiKey` / `embedding.apiKey`; `oauth` по умолчанию использует файл OAuth-токена в области плагина |
| `llm.apiKey` | string | *(откат к `embedding.apiKey`)* | API-ключ провайдера LLM |
| `llm.model` | string | `openai/gpt-oss-120b` | Имя модели LLM |
| `llm.baseURL` | string | *(откат к `embedding.baseURL`)* | Эндпоинт API LLM |
| `llm.oauthProvider` | string | `openai-codex` | Идентификатор OAuth-провайдера, используемый при `llm.auth` = `oauth` |
| `llm.oauthPath` | string | `~/.pi/agent/.memory-lancedb-pro/oauth.json` | Файл OAuth-токена, используемый при `llm.auth` = `oauth` |
| `llm.timeoutMs` | number | `30000` | Тайм-аут запроса LLM в миллисекундах |
| `extractMinMessages` | number | `2` | Минимальное число сообщений до срабатывания извлечения |
| `extractMaxChars` | number | `8000` | Максимальное число символов, отправляемых LLM |

OAuth-конфигурация `llm` (использование существующего кэша входа Codex / ChatGPT для вызовов LLM):

> **Примечание:** OAuth-потоки унаследованы от вышестоящего плагина OpenClaw. На pi команда `memory-pro auth login` вызывает ту же OAuth-логику; файл токена по умолчанию — `~/.pi/agent/.memory-lancedb-pro/oauth.json`.

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

Примечания для `llm.auth: "oauth"`:

- `llm.oauthProvider` в настоящее время — `openai-codex`.
- OAuth-токены по умолчанию хранятся в `~/.pi/agent/.memory-lancedb-pro/oauth.json`.
- Вы можете задать `llm.oauthPath`, если хотите хранить этот файл в другом месте.
- `auth login` сохраняет снимок предыдущей конфигурации `llm` с `api-key` рядом с OAuth-файлом, а `auth logout` восстанавливает этот снимок, если он доступен.
- Переключение с `api-key` на `oauth` не переносит автоматически `llm.baseURL`. Устанавливайте его вручную в режиме OAuth только тогда, когда осознанно хотите использовать кастомный бэкенд, совместимый с ChatGPT/Codex.

</details>

<details>
<summary><strong>Резервный режим для старых CPU</strong></summary>

Если на хосте Linux x64 только с AVX нативный векторный поиск LanceDB падает с `SIGILL`, отключите нативный косинус и позвольте memory-lancedb-pro сканировать ограниченные строки и ранжировать их в JavaScript:

```json5
{
  retrieval: {
    disableNativeCosine: true
  }
}
```

Того же поведения можно добиться, задав `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1`.

</details>

<details>
<summary><strong>Конфигурация жизненного цикла (затухание + уровень)</strong></summary>

| Поле | По умолчанию | Описание |
|-------|---------|-------------|
| `decay.recencyHalfLifeDays` | `30` | Базовый период полураспада для затухания свежести Вейбулла |
| `decay.frequencyWeight` | `0.3` | Вес частоты доступа в составном балле |
| `decay.intrinsicWeight` | `0.3` | Вес `важность × уверенность` |
| `decay.betaCore` | `0.8` | Бета Вейбулла для воспоминаний `core` |
| `decay.betaWorking` | `1.0` | Бета Вейбулла для воспоминаний `working` |
| `decay.betaPeripheral` | `1.3` | Бета Вейбулла для воспоминаний `peripheral` |
| `tier.coreAccessThreshold` | `10` | Минимальное число обращений перед продвижением в `core` |
| `tier.peripheralAgeDays` | `60` | Порог возраста для понижения устаревших воспоминаний |

</details>

<details>
<summary><strong>Усиление при доступе</strong></summary>

Часто вспоминаемые записи затухают медленнее (в стиле интервального повторения).

Ключи конфигурации (в блоке `retrieval`):
- `reinforcementFactor` (0-2, по умолчанию: `0.5`) — задайте `0`, чтобы отключить
- `maxHalfLifeMultiplier` (1-10, по умолчанию: `3`) — жёсткий потолок эффективного периода полураспада

</details>

---

## Команды CLI

Бинарник `memory-pro` доступен после `npm run build`:

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

Внутри сессии pi тот же управляющий интерфейс доступен как слэш-команда **`/memory-pro`**.

> CLI читает тот же файл конфигурации, что и расширение (`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `~/.pi/agent/memory-lancedb-pro.json`).

Поток входа через OAuth:

1. Выполните `memory-pro auth login`
2. Если `--provider` опущен в интерактивном терминале, CLI показывает выбор OAuth-провайдера перед открытием браузера
3. Команда выводит URL авторизации и открывает ваш браузер, если не задан `--no-browser`
4. После успешного колбэка команда сохраняет OAuth-файл плагина (по умолчанию: `~/.pi/agent/.memory-lancedb-pro/oauth.json`), делает снимок предыдущей конфигурации `llm` с `api-key` для logout и заменяет конфигурацию `llm` плагина на OAuth-настройки (`auth`, `oauthProvider`, `model`, `oauthPath`)
5. `memory-pro auth logout` удаляет этот OAuth-файл и восстанавливает предыдущую конфигурацию `llm` с `api-key`, если этот снимок существует

---

## Дополнительные темы

<details>
<summary><strong>Обновление с более ранней версии порта</strong></summary>

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

См. `CHANGELOG-v1.1.0.md` — изменения поведения и обоснование обновления.

**Включаете подсказки задач Jina (task hints) на существующей базе?**

Подсказки задач — это два ключа конфигурации в блоке `embedding`:

```json5
{
  embedding: {
    model: "jina-embeddings-v5-text-small",
    taskQuery: "retrieval.query",
    taskPassage: "retrieval.passage"
  }
}
```

Они влияют только на векторы, записанные *после* их установки. Строки, уже находящиеся в хранилище, были эмбеддированы без подсказки задачи, поэтому запрос, эмбеддированный с `retrieval.query`, сравнивается с пассажами, живущими в другом векторном пространстве — вы получаете примерно половину эффекта, молча.

Чтобы исправить существующие строки, пере-эмбеддите в **свежую базу и переключитесь на неё**. **Не** пере-эмбеддите на месте: `reembed` записывает каждую строку через `table.add()` (добавление по id, а не замена), поэтому запуск на месте — именно то, что открывает `--force` — оставляет старый вектор рядом с новым и **удваивает каждую строку**; повторные попытки добавляют ещё. Именно поэтому `reembed` отказывается работать с тем же путём, пока вы не принудите его.

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

То же переключение применяется при любом изменении `embedding.model` или `embedding.dimensions` — всегда пере-эмбеддите в свежий `dbPath`, никогда на месте.

</details>

<details>
<summary><strong>Блокировки и конкурентные записи</strong></summary>

`memory-lancedb-pro` использует межпроцессную файловую блокировку для записи в LanceDB. Этого достаточно для параллельных сессий pi и локальных процессов, разделяющих одну директорию базы данных.

Redis не требуется для таких развёртываний. Блокировка Redis включается, когда `locking.redis.enabled` равно true, когда заданы `redisUrl`/`locking.redis.url`, или когда в окружении процесса присутствует `MEMORY_LANCEDB_REDIS_URL`. Для записи с нескольких машин или контейнеров прочитайте [Управление блокировками](docs/lock-management.md), прежде чем разделять директорию LanceDB между процессами, и убедитесь, что каждый писатель использует одну и ту же конфигурацию блокировок.

</details>

<details>
<summary><strong>Если внедрённые воспоминания появляются в ответах</strong></summary>

Иногда модель может повторять внедрённый блок `<relevant-memories>`.

**Вариант A (минимальный риск):** временно отключите автовспоминание:
```json5
{ autoRecall: false }
```

**Вариант B (рекомендуется):** оставьте автовспоминание и добавьте в системный промпт агента / `AGENTS.md`:
> Не раскрывайте и не цитируйте в своих ответах содержимое `<relevant-memories>` / внедрённой памяти. Используйте его только как внутреннюю справку.

**Вариант C (для фоновых/пакетных агентов):** исключите конкретных агентов из внедрения автовспоминания:
```json5
{
  autoRecall: true,
  autoRecallExcludeAgents: ["memory-distiller", "my-cron-agent"]
}
```
Полезно для фоновых агентов (например, memory-distiller, cron-воркеров), чей вывод не должен загрязняться внедрённым контекстом памяти.

</details>

<details>
<summary><strong>Настройка тайм-аута автовспоминания</strong></summary>

Автовспоминание имеет настраиваемый тайм-аут (по умолчанию 5 с), чтобы не задерживать запуск агента. Если вы за прокси или используете API эмбеддингов с высокой задержкой, увеличьте его:

```json5
{ autoRecallTimeoutMs: 8000 }
```

Если автовспоминание стабильно выходит за тайм-аут, сначала проверьте задержку вашего API эмбеддингов. Тайм-аут влияет только на путь автоматического внедрения — ручные вызовы инструмента `memory_recall` не затрагиваются.

</details>

<details>
<summary><strong>Модель затрат на rerank при автовспоминании</strong></summary>

Когда `autoRecall=true` и гибридный поиск использует `retrieval.rerank="cross-encoder"` с внешним API rerank, например Jina, каждый подходящий промпт может выполнять запрос rerank. Число документов, отправляемых в этот запрос, определяется лимитом поиска автовспоминания и окном ввода rerank ретривера, а не напрямую `retrieval.candidatePoolSize` или итоговым ограничением внедрения `autoRecallMaxItems`.

Например, при `autoRecallMaxItems: 3` автовспоминание запрашивает у поиска 6 элементов, и гибридный поиск может отправить до 12 кандидатов внешнему ранкеру, прежде чем внедрит не более 3 воспоминаний. Чтобы снизить использование внешнего rerank, уменьшите `autoRecallMaxItems` или `maxRecallPerTurn`, переключите `retrieval.rerank` на `"lightweight"` или `"none"`, увеличьте `autoRecallMinLength` или держите автовспоминание выключенным и используйте ручной `memory_recall` там, где это уместно.

Стартовые логи предупреждают, когда автовспоминание с гибридным rerank кросс-энкодером может отправить ранкеру больше элементов, чем внедрит. Отладочная статистика автовспоминания включает фактические `rerankInput`, `rerankInputLimit`, `retrieveLimit`, `rerank`, `rerankProvider` и настроенный `retrievalCandidatePoolSize`.

</details>

<details>
<summary><strong>Память сессии</strong></summary>

- Срабатывает на событиях новой сессии — сохраняет сводку предыдущей сессии в LanceDB
- Отключено по умолчанию (pi уже сохраняет транскрипты сессий `.jsonl`)
- Настраиваемое число сообщений (по умолчанию: 15)

</details>

<details>
<summary><strong>Пользовательские слэш-команды (например, /lesson)</strong></summary>

Добавьте в свой `AGENTS.md` или системный промпт:

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
<summary><strong>Железные правила для ИИ-агентов</strong></summary>

> Скопируйте блок ниже в свой `AGENTS.md`, чтобы агент автоматически соблюдал эти правила.

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
<summary><strong>Схема базы данных</strong></summary>

Таблица LanceDB `memories`:

| Поле | Тип | Описание |
| --- | --- | --- |
| `id` | string (UUID) | Первичный ключ |
| `text` | string | Текст воспоминания (индексируется FTS) |
| `vector` | float[] | Вектор эмбеддинга |
| `category` | string | Категория хранения: `preference` / `fact` / `decision` / `entity` / `reflection` / `other` |
| `scope` | string | Идентификатор области (например, `global`, `agent:main`) |
| `importance` | float | Оценка важности 0-1 |
| `timestamp` | int64 | Метка времени создания (мс) |
| `metadata` | string (JSON) | Расширенные метаданные |

Распространённые ключи `metadata` в v1.1.0: `l0_abstract`, `l1_overview`, `l2_content`, `memory_category`, `tier`, `access_count`, `confidence`, `last_accessed_at`

> **Примечание о категориях:** поле верхнего уровня `category` использует 6 категорий хранения. Семантические метки 6 категорий из Smart Extraction (`profile` / `preferences` / `entities` / `events` / `cases` / `patterns`) хранятся в `metadata.memory_category`.

</details>

<details>
<summary><strong>Устранение неполадок</strong></summary>

**Расширение не загружается / «файл конфигурации не найден»**

Создайте `~/.pi/agent/memory-lancedb-pro.json5` или задайте `$MEMORY_LANCEDB_PRO_CONFIG`. Расширение выводит предупреждение с ожидаемой формой и остаётся отключённым — pi продолжает работать.

**Не удалась инициализация умного извлечения**

Проверьте, что задан `llm.apiKey` / `${ENV_VAR}`; плагин откатывается к извлечению через регулярные выражения, а не падает.

**«Cannot mix BigInt and other types» (LanceDB / Apache Arrow)**

На LanceDB 0.26+ некоторые числовые колонки могут возвращаться как `BigInt`. Обновитесь до **memory-lancedb-pro >= 1.0.14** — этот плагин теперь приводит значения через `Number(...)` перед арифметикой.

</details>

---

## Архитектура

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

> Для глубокого погружения в полную архитектуру см. [docs/memory_architecture_analysis.md](docs/memory_architecture_analysis.md).

<details>
<summary><strong>Справочник по файлам (нажмите, чтобы развернуть)</strong></summary>

| Файл | Назначение |
| --- | --- |
| `pi-adapter/index.ts` | Точка входа pi: загружает файл конфигурации, строит шим OpenClaw API, регистрирует ядро плагина |
| `pi-adapter/shim.ts` | Сопоставляет события жизненного цикла / инструменты / команды pi с API плагина OpenClaw |
| `pi-adapter/config.ts` | Загрузка файла конфигурации (`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `.json`) |
| `pi-adapter/paths.ts` | Разрешение путей pi (`~/.pi/agent`, переопределения через окружение) |
| `pi-adapter/pi-runner.ts` | Встроенный запуск суб-агента через `pi --mode json --no-tools ...` |
| `pi-adapter/cli-main.ts` | Автономная точка входа CLI `memory-pro` |
| `index.ts` | Точка входа ядра плагина: разбор конфигурации, хуки жизненного цикла, регистрация возможности памяти |
| `src/store.ts` | Слой хранилища LanceDB. Создание таблиц / FTS-индексирование / векторный поиск / поиск BM25 / CRUD |
| `src/embedder.ts` | Абстракция эмбеддингов. Совместима с любым OpenAI-совместимым провайдером API |
| `src/retriever.ts` | Движок гибридного поиска. Vector + BM25 → Hybrid Fusion → Rerank → Lifecycle Decay → Filter |
| `src/scopes.ts` | Контроль доступа по нескольким областям |
| `src/tools.ts` | Определения инструментов агента: `memory_recall`, `memory_store`, `memory_forget`, `memory_update` + управляющие инструменты |
| `src/noise-filter.ts` | Отфильтровывает отказы агента, мета-вопросы, приветствия и низкокачественный контент |
| `src/adaptive-retrieval.ts` | Определяет, нужен ли запросу поиск памяти |
| `src/migrate.ts` | Миграция со встроенного `memory-lancedb` на Pro |
| `src/smart-extractor.ts` | LLM-извлечение 6 категорий с многоуровневым хранением L0/L1/L2 и двухэтапной дедупликацией |
| `src/decay-engine.ts` | Модель растянутого экспоненциального затухания Вейбулла |
| `src/tier-manager.ts` | Трёхуровневое повышение/понижение: Peripheral ↔ Working ↔ Core |

</details>

---

## Приложение: оригинальный OpenClaw

Этот репозиторий — порт. Вышестоящий проект — **[CortexReach/memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)** — плагин OpenClaw. Всё ниже документирует использование вышестоящего OpenClaw; пользователям pi это не нужно.

### Что изменилось (отличия порта)

| Область | OpenClaw (вышестоящий) | Pi (этот порт) |
|---|---|---|
| Загрузка расширения | `openclaw.plugin.json` / `openclaw.extensions` | `pi-adapter/index.ts` → скомпилированный `dist/pi-adapter/index.js`, объявляется через `pi.extensions` в `package.json` |
| Файл конфигурации | Запись плагина в `openclaw.json` | `~/.pi/agent/memory-lancedb-pro.json5` (или `$MEMORY_LANCEDB_PRO_CONFIG`) — та же форма документа |
| Базовая директория данных и сессий | `~/.openclaw/...` | `~/.pi/agent/...` (переопределяется через `PI_CODING_AGENT_DIR` / `PI_AGENT_DIR`) |
| CLI | `openclaw memory-pro …` | Автономный бинарник: `memory-pro …` (компилируется из `pi-adapter/cli-main.ts`) |
| Слэш-команда | CLI, зарегистрированный в `openclaw` | `pi.registerCommand("/memory-pro", ...)` через шим |
| Встроенный запуск суб-агента | OpenClaw runtime API | Вызывает внешний `pi --mode json --no-tools …` (`pi-adapter/pi-runner.ts`) |
| Раскладка сессий | `~/.openclaw/agents/<id>/sessions/*.jsonl` | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| Версия | `1.1.0-beta.11` | `1.1.0-beta.11-pi.1` |

События жизненного цикла сопоставляются с хуками OpenClaw через `pi-adapter/shim.ts`: `input`, `session_start`, `before_agent_start`, `agent_end`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`. Инструменты плагина (`memory_store`, `memory_recall`, …) и слэш-команда `/memory-pro` регистрируются через шим без изменений.

### Быстрый старт вышестоящего проекта (только OpenClaw)

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

Команды вышестоящего проекта используют префикс `openclaw memory-pro ...`. Полную документацию OpenClaw см. в [README вышестоящего проекта](https://github.com/CortexReach/memory-lancedb-pro).

### Экосистема вышестоящего проекта

- **[Setup script](https://github.com/CortexReach/toolbox/tree/main/memory-lancedb-pro-setup)** — установка/обновление/починка в один клик для развёртываний OpenClaw (пишет `openclaw.json`)
- **[AI-guided config skill](https://github.com/CortexReach/memory-lancedb-pro-skill)** — для агентов Claude Code / OpenClaw
- **Видеоуроки** — [YouTube](https://youtu.be/MtukF1C8epQ) · [Bilibili](https://www.bilibili.com/video/BV1zUf2BGEgn/)
- **История звёзд** — [star-history.com](https://star-history.com/#CortexReach/memory-lancedb-pro&Date)

---

## Документация

| Документ | Описание |
| --- | --- |
| [Memory Architecture Analysis](docs/memory_architecture_analysis.md) | Полный разбор архитектуры |
| [CHANGELOG v1.1.0](docs/CHANGELOG-v1.1.0.md) | Изменения поведения v1.1.0 и обоснование обновления |
| [Release Checklist](docs/release-checklist.md) | Предрелизная проверка пакета, пробный прогон публикации и пост-публикационные смоук-проверки |
| [Long-Context Chunking](docs/long-context-chunking.md) | Стратегия разбиения длинных документов |
| [Lock Management](docs/lock-management.md) | Детали блокировки при множественных писателях (Redis) |

## Тесты

```bash
npm test                       # full unit/e2e suite
node scripts/run-ci-tests.mjs --all   # full CI manifest
npm run test:pi-adapter        # pi adapter smoke test (mock pi API)
```

Все тесты вышестоящего проекта сохранены; новыми являются `test/pi-adapter-smoke.test.mjs` и `test:pi-adapter`.

---

## Бета: умная память v1.1.0

> Статус: бета — доступна через `npm i memory-lancedb-pro@beta`. Пользователи стабильной ветки `latest` не затронуты.

| Возможность | Описание |
|---------|-------------|
| **Умное извлечение** | LLM-извлечение 6 категорий с метаданными L0/L1/L2. При отключении откатывается к регулярным выражениям. |
| **Оценка жизненного цикла** | Затухание Вейбулла, встроенное в поиск — частые и важные воспоминания ранжируются выше. |
| **Управление уровнями** | Трёхуровневая система (Core → Working → Peripheral) с автоматическим повышением/понижением. |

Обратная связь: [GitHub Issues](https://github.com/CortexReach/memory-lancedb-pro/issues) · Откат: `npm i memory-lancedb-pro@latest`

---

## Зависимости

| Пакет | Назначение |
| --- | --- |
| `@lancedb/lancedb` ≥0.26.2 | Векторная база данных (ANN + FTS) |
| `openai` ≥6.21.0 | Клиент OpenAI-совместимого API эмбеддингов |
| `@sinclair/typebox` 0.34.48 | Определения типов JSON Schema |

---

## Контрибьюторы

Мейнтейнеры и контрибьюторы вышестоящего проекта (см. [полный список](https://github.com/CortexReach/memory-lancedb-pro/graphs/contributors)):

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
