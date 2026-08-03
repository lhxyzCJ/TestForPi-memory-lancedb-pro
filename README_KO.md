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

## 🤖 이 포트에 대하여

이 저장소는 프로덕션 등급 메모리 플러그인 [memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)(MIT)의 **pi 코딩 에이전트 포트**입니다. OpenClaw 플러그인 코어 전체는 수정 없이 유지되며, 얇은 어댑터(`pi-adapter/`)를 통해 그대로 로드되므로 pi(≥ 0.80)는 업스트림과의 차이를 최소화하면서 동일한 LanceDB 기반 메모리 엔진을 사용할 수 있습니다.

> 아래 내용은 모두 pi에서의 사용 경험을 설명합니다. 포트 차이점 표와 원래 OpenClaw 사용법은 하단의 [OpenClaw Upstream Appendix](#openclaw-upstream-appendix)를 참조하세요.

---

## memory-lancedb-pro를 선택하는 이유

대부분의 AI 에이전트는 기억상실증이 있습니다. 새 채팅을 시작하는 순간 모든 것을 잊어버립니다.

**memory-lancedb-pro**는 에이전트를 **AI 메모리 어시스턴트**로 바꿔주는 프로덕션 등급의 장기 기억 확장 기능입니다. 중요한 것은 자동으로 포착하고, 노이즈는 자연스럽게 사라지며, 필요한 순간에 올바른 기억을 검색합니다. 수동 태깅도, 설정의 골칫거리도 없습니다.

### 실제 동작:당신의 AI 메모리 어시스턴트

**메모리가 없을 때 — 모든 세션이 제로부터 시작됩니다:**

> **당신:** "들여쓰기는 탭을 사용하고, 항상 에러 핸들링을 추가해."
> *(다음 세션)*
> **당신:** "말했잖아 — 탭이라고, 스페이스가 아니라!" 😤
> *(다음 세션)*
> **당신:** "…그러니까 탭. 그리고 에러 핸들링. 또 말하게 하지 마."

**memory-lancedb-pro 사용 시 — 에이전트가 배우고 기억합니다:**

> **당신:** "들여쓰기는 탭을 사용하고, 항상 에러 핸들링을 추가해."
> *(다음 세션 — 에이전트가 당신의 선호를 자동으로 회상)*
> **에이전트:** *(조용히 탭 + 에러 핸들링 적용)* ✅
> **당신:** "지난달에 MongoDB 대신 PostgreSQL을 고른 이유가 뭐였지?"
> **에이전트:** "2월 12일 논의에 따르면, 주요 이유는…" ✅

이것이 **AI 메모리 어시스턴트**가 만드는 차이입니다 — 당신의 스타일을 배우고, 과거의 결정을 회상하며, 같은 말을 반복하지 않아도 개인화된 응답을 제공합니다.

### 그 외에도 무엇을 할 수 있나요?

| | 얻을 수 있는 것 |
|---|---|
| **자동 포착 (Auto-Capture)** | 수동 `memory_store` 없이 모든 대화에서 에이전트가 학습 |
| **스마트 추출 (Smart Extraction)** | LLM 기반 6개 카테고리 분류:프로필, 선호, 엔티티, 이벤트, 사례, 패턴 |
| **지능형 망각 (Intelligent Forgetting)** | Weibull 감쇠 모델 — 중요한 기억은 남고, 노이즈는 자연스럽게 사라짐 |
| **하이브리드 검색 (Hybrid Retrieval)** | 벡터 + BM25 전문 검색, 크로스 인코더 재랭킹으로 융합 |
| **컨텍스트 주입 (Context Injection)** | 각 응답 전에 관련 기억이 자동으로 표면화 |
| **멀티 스코프 격리 (Multi-Scope Isolation)** | 에이전트별·사용자별·프로젝트별 메모리 경계 |
| **모든 프로바이더 (Any Provider)** | OpenAI, Jina, Gemini, Ollama 또는 모든 OpenAI 호환 API |
| **완전한 툴킷 (Full Toolkit)** | CLI, 백업, 마이그레이션, 업그레이드, 내보내기/가져오기 — 프로덕션 준비 완료 |

---

## 빠른 시작

> **CPU 요구 사항:** CPU가 **AVX** 명령어를 지원해야 합니다. LanceDB 네이티브 벡터 검색은 일부 Linux x64 빌드에서 **AVX2**를 요구하며, AVX 전용 CPU에서 `SIGILL`로 크래시할 수 있습니다. 이 경우 `retrieval.disableNativeCosine: true`를 설정하거나 `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1`을 설정하여 스코프 한정 행 스캔과 JavaScript 코사인 랭킹을 사용하세요. CPU 플래그 확인:`grep -o 'avx[^ ]*' /proc/cpuinfo | head -1`(출력 없음 = 미지원). 자세한 내용은 [#419](https://github.com/CortexReach/memory-lancedb-pro/issues/419) 및 [#644](https://github.com/CortexReach/memory-lancedb-pro/issues/644) 참조.

### 1. 확장 기능 빌드

```bash
git clone https://github.com/lhxyzCJ/TestForPi-memory-lancedb-pro
cd TestForPi-memory-lancedb-pro && npm install && npm run build
```

pi 진입점은 `dist/pi-adapter/index.js`입니다(`pi-adapter/index.ts`에서 컴파일됨).

### 2. 확장 기능 등록

다음 중 하나를 선택하세요:

**A. pi 설정 파일 경유(전역, 모든 프로젝트):**

`~/.pi/agent/settings.json`에 추가:

```json
{
  "extensions": [
    "/absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js"
  ]
}
```

**B. pi 패키지 매니저 경유:**

```bash
pi install /absolute/path/to/TestForPi-memory-lancedb-pro
```

**C. 단일 세션 빠른 테스트:**

```bash
pi -e /absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js
```

**D. 자동 발견(설정 변경 불필요):** 빌드된 확장 기능(또는 `pi.extensions` 필드가 있는 `package.json`)을 `~/.pi/agent/extensions/`(전역) 또는 `.pi/extensions/`(프로젝트 로컬)에 넣고 pi를 재시작하세요.

### 3. 설정 파일 생성

`~/.pi/agent/memory-lancedb-pro.json5`를 생성합니다(`.json`도 사용 가능하며, `$MEMORY_LANCEDB_PRO_CONFIG`로 임의의 위치를 지정할 수 있습니다):

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

> 설정 문서의 구조는 업스트림 OpenClaw 플러그인 항목과 동일합니다 — 위의 베어 내부 객체와 `{ "config": { ... } }` 래퍼 모두 허용됩니다.

### 4. 확인

pi 세션을 시작하고 시작 로그를 확인합니다:

```
memory-lancedb-pro: smart extraction enabled
memory-lancedb-pro@...: plugin registered (db: /root/.pi-agent/memory/lancedb-pro, ...)
```

그런 다음 에이전트에게 기억 저장과 회상을 요청합니다:

> **당신:** "기억해 둬: 스페이스보다 탭이 좋아."
> **당신:** "내 들여쓰기 선호는 뭐야?"

### 왜 이 기본값인가?

- `autoCapture` + `smartExtraction` → 에이전트가 모든 대화에서 자동으로 학습
- `autoRecall` → 각 응답 전에 관련 기억이 주입됨
- `extractMinMessages: 2` → 일반적인 2턴 대화에서 추출이 발동
- `sessionMemory.enabled: false` → 첫날에 세션 요약으로 검색 결과를 오염시키지 않기 위함

---

## 런타임 요구 사항(pi)

다음 요구 사항은 pi 호스트에서 비롯되며 `memory-lancedb-pro.json5`에 구성되지 않습니다:

1. **기본 제공자** — 임베디드 반성/드리밍 하위 에이전트는 `--provider`/`--model` 없이 `pi` CLI로 실행되며 호스트 기본값을 상속합니다. `~/.pi/agent/settings.json`에서 `defaultProvider`/`defaultModel`을 설정하세요(예: `"defaultProvider": "opencode-go", "defaultModel": "deepseek-v4-flash"`). 설정하지 않으면 하위 에이전트가 손상되었거나 의도하지 않은 제공자로 대체될 수 있습니다.
2. **임베딩 엔드포인트** — 임베딩 API에 연결할 수 있어야 합니다(예: 세션 전에 Ollama 시작). 연결할 수 없으면 스마트 추출이 조용히 regex 폴백으로 강등됩니다.
3. **LLM API 키** — 스마트 추출에는 유효한 LLM 키(`llm.apiKey`, 예: `"${OPENCODE_API_KEY}"`)가 필요합니다. 없으면 추출이 regex 캡처로 폴백됩니다.
4. **업그레이드 경로** — pi는 `settings.json`(`extensions`)에 기록된 절대 경로에서 확장을 로드합니다. 이 저장소를 업데이트한 후 `pi install`을 다시 실행(또는 설치된 복사본 교체)하세요. 그렇지 않으면 pi는 이전 빌드를 계속 로드합니다.

**업스트림과의 알려진 차이:** 업스트림의 배치 유틸리티 승인 모드(#941, `utilityMode: "batch"`, `utilityVetoThreshold`)는 포팅되지 않았습니다. `utilityMode`는 `"standalone" | "off"`만 지원합니다.

## ⚠️ 메모리 아키텍처(중요)

확장 기능은 하나의 메모리 기능을 두 개의 협력하는 스토어로 노출합니다:

| 메모리 계층 | 스토리지 | 용도 | 회상 가능? |
|---|---|---|---|
| **플러그인 메모리** | LanceDB(벡터 스토어) | `memory_recall` / 자동 회상을 통한 의미론적 회상 | ✅ 예 |
| **정전(canonical) 코퍼스** | `MEMORY.md`, `memory/**/*.md`, 최근 세션 대화록, `memory/dreaming/**/*.md` | 소스 오브 트루스 파일 및 공개 아티팩트 | ✅ `canonicalCorpus.enabled`가 true일 때 LanceDB 의미 인덱스를 통해 |

**핵심 원칙:**
> 정전 파일이 소스 오브 트루스로 유지됩니다. LanceDB는 이를 그라운딩된 경로, 줄 범위, 스니펫, 인용과 함께 검색하기 위한 의미 인덱스입니다.

**이것이 당신에게 의미하는 바:**
- 의미론적 회상이 필요? → `memory_store`를 사용하거나 자동 포착에 맡기세요
- `memory/YYYY-MM-DD.md` → 의미 검색에도 인덱싱할 수 있는 **일지 / 로그**로 취급
- `MEMORY.md` → 정전 컨텍스트로 인덱싱할 수 있는 큐레이션된 사람이 읽을 수 있는 레퍼런스
- `memory/dreaming/**/*.md` → 공개 아티팩트로 노출되고 회고 컨텍스트로 인덱싱되는 드림 리포트
- 세션 JSONL 대화록 → `canonicalCorpus.includeSessionTranscripts`가 활성화된 경우 `source: "sessions"`로 인덱싱
- 플러그인 메모리 → 영속적 사실, 선호, 결정, 자동 포착 기억의 기본 쓰기 경로

### 데이터 위치(pi)

| 대상 | 경로 |
|---|---|
| 플러그인 데이터베이스(LanceDB) | `~/.pi/agent/memory/lancedb-pro`(또는 `$MEMORY_LANCEDB_PRO_DB_PATH`) |
| Markdown 미러 | `~/.pi/agent/memory/md-mirror`(또는 `$MEMORY_LANCEDB_PRO_MD_MIRROR_DIR`) |
| 세션 대화록 | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| 전역 스킬 | `~/.pi/agent/skills` |

기본 디렉터리는 `~/.pi/agent`입니다. `PI_CODING_AGENT_DIR` 또는 `PI_AGENT_DIR`로 재정의할 수 있습니다. 설정의 상대 경로(`dbPath`, `mdMirrorDir` 등)는 pi 에이전트 홈을 기준으로 해석됩니다.

### 설정 파일 위치(우선순위 순)

1. `$MEMORY_LANCEDB_PRO_CONFIG`(명시적 경로)
2. `~/.pi/agent/memory-lancedb-pro.json5`
3. `~/.pi/agent/memory-lancedb-pro.json`

설정 파일을 찾을 수 없으면 확장 기능은 경고를 로그하고 비활성 상태로 유지됩니다 — 설정이 깨지거나 없어도 pi 세션은 결코 다운되지 않습니다.

---

## 핵심 기능

### 하이브리드 검색

```
Query → embedQuery() ─┐
                       ├─→ Hybrid Fusion → Rerank → Lifecycle Decay Boost → Length Norm → Filter
Query → BM25 FTS ─────┘
```

- **벡터 검색** — LanceDB ANN(코사인 거리)을 통한 의미론적 유사도
- **BM25 전문 검색** — LanceDB FTS 인덱스를 통한 정확한 키워드 일치
- **하이브리드 융합** — 벡터 점수를 기본으로, BM25 히트에 가중치 부스트(표준 RRF가 아니라 실제 리콜 품질에 맞게 튜닝됨)
- **구성 가능한 가중치** — `vectorWeight`, `bm25Weight`, `minScore`

### 크로스 인코더 재랭킹

- **Jina**, **SiliconFlow**, **Voyage AI**, **Pinecone**용 내장 어댑터
- Jina 호환 모든 엔드포인트(예:Hugging Face TEI, DashScope)와 호환
- 하이브리드 스코어링:크로스 인코더 60% + 원래 융합 점수 40%
- 우아한 폴백:API 실패 시 코사인 유사도로 폴백

### 다단계 스코어링 파이프라인

| 단계 | 효과 |
| --- | --- |
| **하이브리드 융합** | 의미적 일치와 정확한 일치 리콜을 결합 |
| **크로스 인코더 재랭크** | 의미적으로 정확한 히트를 상위로 끌어올림 |
| **라이프사이클 감쇠 부스트** | Weibull 신선도 + 접근 빈도 + 중요도 × 신뢰도 |
| **길이 정규화** | 긴 항목이 지배하지 않도록 방지(앵커:500자) |
| **하드 최소 점수** | 무관한 결과 제거(기본값:0.35) |
| **MMR 다양성** | 코사인 유사도 > 0.85 → 강등 |

### 스마트 메모리 추출(v1.1.0)

- **LLM 기반 6개 카테고리 추출**:프로필, 선호, 엔티티, 이벤트, 사례, 패턴
- **L0/L1/L2 계층 저장**:L0(한 문장 인덱스) → L1(구조화 요약) → L2(전체 서사)
- **2단계 중복 제거**:벡터 유사도 사전 필터(≥0.7) → LLM 의미 판단(CREATE/MERGE/SKIP)
- **카테고리 인식 병합**:`profile`은 항상 병합, `events`/`cases`는 추가 전용

### 메모리 라이프사이클 관리(v1.1.0)

- **Weibull 감쇠 엔진**:복합 점수 = 최근성 + 빈도 + 본질적 가치
- **3단계 승격**:`Peripheral ↔ Working ↔ Core`(임계값 구성 가능)
- **접근 강화**:자주 회상되는 기억은 더 천천히 감쇠(간격 반복 방식)
- **중요도 변조 반감기**:중요한 기억은 더 천천히 감쇠

### 멀티 스코프 격리

- 내장 스코프:`global`, `agent:<id>`, `custom:<name>`, `project:<id>`, `user:<id>`
- `scopes.agentAccess`를 통한 에이전트 수준 접근 제어
- 기본값:각 에이전트는 `global` + 자신의 `agent:<id>` 스코프에 접근
- `memory_recall`, `memory_search`, `memory_list`, `memory_debug` 같은 읽기 전용 도구는 요청된 스코프에 접근할 수 없을 때 소프트 폴백합니다:호출자가 접근 가능한 스코프를 대신 검색하고 details에 `ignoredScope`와 `accessibleScopes`를 반환합니다. 쓰기 및 변경 도구는 접근 불가능한 스코프에 대해 여전히 `scope_access_denied`를 반환합니다.

### 자동 포착 & 자동 회상

- **자동 포착**(`agent_end`):대화에서 선호/사실/결정/엔티티를 추출하고, 중복을 제거하며, 턴당 최대 3개 저장
- **자동 회상**(각 프롬프트 구성 전):`<relevant-memories>` 컨텍스트 주입(최대 3개 항목)

> **참고:** pi에서는 이러한 OpenClaw 훅(`agent_end`, `before_prompt_build`, ...)이 pi 라이프사이클 이벤트(`agent_end`, `input`, `session_start`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`)에서 `pi-adapter/shim.ts`에 의해 매핑됩니다.

### 노이즈 필터링 & 적응형 검색

- 저품질 콘텐츠 필터링:에이전트 거절, 메타 질문, 인사말
- 인사말, 슬래시 명령, 단순 확인, 이모지에서는 검색 건너뜀
- 메모리 키워드("remember", "previously", "last time")에서는 검색 강제
- CJK 인식 임계값(중국어:6자 vs 영어:15자)

---

<details>
<summary><strong>내장 <code>memory-lancedb</code>와 비교(클릭하여 펼치기)</strong></summary>

| 기능 | 내장 `memory-lancedb` | **memory-lancedb-pro** |
| --- | :---: | :---: |
| 벡터 검색 | 예 | 예 |
| BM25 전문 검색 | - | 예 |
| 하이브리드 융합(벡터 + BM25) | - | 예 |
| 크로스 인코더 재랭크(멀티 프로바이더) | - | 예 |
| 최근성 부스트 & 시간 감쇠 | - | 예 |
| 길이 정규화 | - | 예 |
| MMR 다양성 | - | 예 |
| 멀티 스코프 격리 | - | 예 |
| 노이즈 필터링 | - | 예 |
| 적응형 검색 | - | 예 |
| 관리 CLI | - | 예 |
| 세션 메모리 | - | 예 |
| 작업 인식 임베딩 | - | 예 |
| **LLM 스마트 추출(6개 카테고리)** | - | 예(v1.1.0) |
| **Weibull 감쇠 + 계층 승격** | - | 예(v1.1.0) |
| OpenAI 호환 임베딩 | 제한적 | 예 |

</details>

---

## 구성

모든 구성은 `~/.pi/agent/memory-lancedb-pro.json5`(또는 `$MEMORY_LANCEDB_PRO_CONFIG`)에 있습니다.

API 키 필드(`embedding.apiKey`, `retrieval.rerankApiKey`, `llm.apiKey`)는 일반 문자열, `${ENV_VAR}` 자리표시자 또는 SecretRef 객체를 허용합니다. 이 플러그인은 `env` 및 `file` SecretRef 소스를 지원합니다:

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

`source: "file"`의 경우 `id`는 pi 에이전트 홈을 기준으로 해석되어 UTF-8 파일로 읽힙니다. 선택적 `provider` 필드는 SecretRef 객체 형태 호환성을 위해 허용되지만 프로바이더 디스패치에는 사용되지 않습니다. `exec` 및 기타 SecretRef 소스는 런타임 구성 검증에서 거부됩니다.

<details>
<summary><strong>전체 구성 예시</strong></summary>

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
<summary><strong>임베딩 프로바이더</strong></summary>

**OpenAI 호환 임베딩 API**에서 작동하며, Jina, Voyage 같은 서비스용 프로바이더별 페이로드 어댑터를 포함합니다:

| 프로바이더 | 모델 | 기본 URL | 차원 |
| --- | --- | --- | --- |
| **Jina**(권장) | `jina-embeddings-v5-text-small` | `https://api.jina.ai/v1` | 1024 |
| **OpenAI** | `text-embedding-3-small` | `https://api.openai.com/v1` | 1536 |
| **Voyage** | `voyage-4-lite` / `voyage-4` | `https://api.voyageai.com/v1` | 1024 / 1024 |
| **Google Gemini** | `gemini-embedding-001` | `https://generativelanguage.googleapis.com/v1beta/openai/` | 3072 |
| **Ollama**(로컬) | `nomic-embed-text` | `http://localhost:11434/v1` | 프로바이더별 |

Voyage 임베딩 요청은 Voyage의 `model` + `input` 페이로드 형태를 사용합니다. `requestDimensions`가 구성되면 `output_dimension`으로 전송됩니다. `encoding_format` 같은 OpenAI 전용 필드는 생략됩니다.

컨텍스트나 배치 제한이 작은 로컬 임베딩 서버의 경우 `embedding.maxInputChars`를 설정하세요. 플러그인은 `nomic-embed-text`에 보수적인 기본값을 적용합니다. 자동 청킹이 활성화되면 긴 문서는 각 프로바이더 요청에 캡이 적용되기 전에 분할됩니다.

</details>

<details>
<summary><strong>재랭크 프로바이더</strong></summary>

크로스 인코더 재랭킹은 `rerankProvider`를 통해 여러 프로바이더를 지원합니다:

| 프로바이더 | `rerankProvider` | 모델 예시 |
| --- | --- | --- |
| **Jina**(기본값) | `jina` | `jina-reranker-v3` |
| **SiliconFlow**(무료 티어 제공) | `siliconflow` | `BAAI/bge-reranker-v2-m3` |
| **Voyage AI** | `voyage` | `rerank-2.5` |
| **Pinecone** | `pinecone` | `bge-reranker-v2-m3` |

Jina 호환 재랭크 엔드포인트라면 모두 작동합니다 — `rerankProvider: "jina"`를 설정하고 `rerankEndpoint`를 자신의 서비스(예:Hugging Face TEI, DashScope `qwen3-rerank`)로 지정하세요.

</details>

<details>
<summary><strong>스마트 추출(LLM) — v1.1.0</strong></summary>

`smartExtraction`이 활성화(기본값:`true`)되면 플러그인은 정규식 기반 트리거 대신 LLM을 사용하여 기억을 지능적으로 추출하고 분류합니다.

| 필드 | 타입 | 기본값 | 설명 |
|-------|------|---------|-------------|
| `smartExtraction` | boolean | `true` | LLM 기반 6개 카테고리 추출 활성/비활성 |
| `llm.auth` | string | `api-key` | `api-key`는 `llm.apiKey` / `embedding.apiKey` 사용. `oauth`는 기본적으로 플러그인 스코프 OAuth 토큰 파일 사용 |
| `llm.apiKey` | string | *(`embedding.apiKey`로 폴백)* | LLM 프로바이더 API 키 |
| `llm.model` | string | `openai/gpt-oss-120b` | LLM 모델 이름 |
| `llm.baseURL` | string | *(`embedding.baseURL`로 폴백)* | LLM API 엔드포인트 |
| `llm.oauthProvider` | string | `openai-codex` | `llm.auth`가 `oauth`일 때 사용되는 OAuth 프로바이더 ID |
| `llm.oauthPath` | string | `~/.pi/agent/.memory-lancedb-pro/oauth.json` | `llm.auth`가 `oauth`일 때 사용되는 OAuth 토큰 파일 |
| `llm.timeoutMs` | number | `30000` | LLM 요청 타임아웃(밀리초) |
| `extractMinMessages` | number | `2` | 추출이 발동되기 전 최소 메시지 수 |
| `extractMaxChars` | number | `8000` | LLM으로 전송되는 최대 문자 수 |

OAuth `llm` 구성(LLM 호출에 기존 Codex / ChatGPT 로그인 캐시 사용):

> **참고:** OAuth 흐름은 업스트림 OpenClaw 플러그인에서 계승됩니다. pi에서는 `memory-pro auth login`이 동일한 OAuth 로직을 호출합니다. 토큰 파일 기본값은 `~/.pi/agent/.memory-lancedb-pro/oauth.json`입니다.

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

`llm.auth: "oauth"` 참고 사항:

- `llm.oauthProvider`는 현재 `openai-codex`입니다.
- OAuth 토큰은 기본적으로 `~/.pi/agent/.memory-lancedb-pro/oauth.json`에 저장됩니다.
- 다른 위치에 저장하려면 `llm.oauthPath`를 설정할 수 있습니다.
- `auth login`은 이전 api-key `llm` 구성을 OAuth 파일 옆에 스냅샷하고, `auth logout`은 스냅샷이 있으면 해당 구성을 복원합니다.
- `api-key`에서 `oauth`로 전환해도 `llm.baseURL`은 자동으로 이어지지 않습니다. 커스텀 ChatGPT/Codex 호환 백엔드를 의도적으로 사용하려는 경우에만 OAuth 모드에서 수동으로 설정하세요.

</details>

<details>
<summary><strong>레거시 CPU 폴백</strong></summary>

AVX 전용 Linux x64 호스트가 LanceDB 네이티브 벡터 검색 내에서 `SIGILL`로 크래시하는 경우, 네이티브 코사인을 비활성화하고 memory-lancedb-pro가 스코프 내 행을 스캔하여 JavaScript에서 랭킹하게 하세요:

```json5
{
  retrieval: {
    disableNativeCosine: true
  }
}
```

동일한 동작을 위해 `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1`을 설정할 수도 있습니다.

</details>

<details>
<summary><strong>라이프사이클 구성(감쇠 + 계층)</strong></summary>

| 필드 | 기본값 | 설명 |
|-------|---------|-------------|
| `decay.recencyHalfLifeDays` | `30` | Weibull 최근성 감쇠의 기본 반감기 |
| `decay.frequencyWeight` | `0.3` | 복합 점수에서 접근 빈도의 가중치 |
| `decay.intrinsicWeight` | `0.3` | `importance × confidence`의 가중치 |
| `decay.betaCore` | `0.8` | `core` 기억의 Weibull 베타 |
| `decay.betaWorking` | `1.0` | `working` 기억의 Weibull 베타 |
| `decay.betaPeripheral` | `1.3` | `peripheral` 기억의 Weibull 베타 |
| `tier.coreAccessThreshold` | `10` | `core`로 승격되기 전 최소 회상 횟수 |
| `tier.peripheralAgeDays` | `60` | 오래된 기억을 강등하는 연령 임계값 |

</details>

<details>
<summary><strong>접근 강화</strong></summary>

자주 회상되는 기억은 더 천천히 감쇠합니다(간격 반복 방식).

구성 키(`retrieval` 아래):
- `reinforcementFactor`(0-2, 기본값:`0.5`) — `0`으로 설정하면 비활성화
- `maxHalfLifeMultiplier`(1-10, 기본값:`3`) — 유효 반감기의 상한

</details>

---

## CLI 명령

`npm run build` 이후 `memory-pro` 바이너리를 사용할 수 있습니다:

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

pi 세션 내에서도 동일한 관리 인터페이스를 **`/memory-pro`** 슬래시 명령으로 사용할 수 있습니다.

> CLI는 확장 기능과 동일한 설정 파일을 읽습니다(`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `~/.pi/agent/memory-lancedb-pro.json`).

OAuth 로그인 흐름:

1. `memory-pro auth login` 실행
2. 대화형 터미널에서 `--provider`를 생략하면 브라우저를 열기 전에 OAuth 프로바이더 선택기가 표시됩니다
3. 명령이 인증 URL을 출력하고 `--no-browser`가 설정되지 않은 한 브라우저를 엽니다
4. 콜백이 성공하면 명령이 플러그인 OAuth 파일(기본값:`~/.pi/agent/.memory-lancedb-pro/oauth.json`)을 저장하고, 로그아웃용으로 이전 api-key `llm` 구성을 스냅샷하며, 플러그인 `llm` 구성을 OAuth 설정(`auth`, `oauthProvider`, `model`, `oauthPath`)으로 대체합니다
5. `memory-pro auth logout`은 해당 OAuth 파일을 삭제하고 스냅샷이 있으면 이전 api-key `llm` 구성을 복원합니다

---

## 고급 주제

<details>
<summary><strong>이전 포트 버전에서 업그레이드</strong></summary>

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

동작 변경 및 업그레이드 근거는 `CHANGELOG-v1.1.0.md`를 참조하세요.

**기존 데이터베이스에서 Jina 태스크 힌트를 켜는 경우?**

태스크 힌트는 `embedding` 블록 아래의 두 가지 구성 키입니다:

```json5
{
  embedding: {
    model: "jina-embeddings-v5-text-small",
    taskQuery: "retrieval.query",
    taskPassage: "retrieval.passage"
  }
}
```

이들은 설정한 *이후에* 쓰여진 벡터에만 영향을 줍니다. 스토어의 기존 행은 태스크 힌트 없이 임베딩되었으므로, `retrieval.query`로 임베딩한 쿼리는 다른 벡터 공간에 존재하는 패시지와 비교됩니다 — 효과는 조용히 절반 정도만 얻습니다.

기존 행을 수정하려면 **새 데이터베이스에 재임베딩하고 전환**하세요. 제자리 재임베딩은 **하지 마세요**:`reembed`는 각 행을 `table.add()`(교체가 아닌 ID별 추가)로 쓰므로, 제자리 실행(정확히 `--force`가 허용하는 것)은 새 벡터 옆에 기존 벡터를 남겨 **모든 행이 두 배**가 됩니다. 재시도하면 더 쌓입니다. 이 때문에 `reembed`는 강제하지 않는 한 동일 경로 실행을 거부합니다.

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

`embedding.model` 또는 `embedding.dimensions`를 변경할 때도 동일한 전환이 적용됩니다 — 항상 새 `dbPath`에 재임베딩하고, 제자리에서는 절대 하지 마세요.

</details>

<details>
<summary><strong>잠금 및 동시 쓰기</strong></summary>

`memory-lancedb-pro`는 LanceDB 쓰기에 프로세스 간 파일 잠금을 사용합니다. 이는 동일한 데이터베이스 디렉터리를 공유하는 동시 pi 세션 및 로컬 프로세스에 충분합니다.

그러한 배포에는 Redis가 필요하지 않습니다. Redis 잠금은 `locking.redis.enabled`가 true일 때, `redisUrl`/`locking.redis.url`이 설정되었을 때, 또는 해당 프로세스 환경에 `MEMORY_LANCEDB_REDIS_URL`이 존재할 때 활성화됩니다. 멀티 머신 또는 멀티 컨테이너 쓰기의 경우, 프로세스 간에 LanceDB 디렉터리를 공유하기 전에 [Lock Management](docs/lock-management.md)를 읽고 모든 작성자가 동일한 잠금 구성을 사용하는지 확인하세요.

</details>

<details>
<summary><strong>주입된 메모리가 답변에 나타나는 경우</strong></summary>

모델이 주입된 `<relevant-memories>` 블록을 그대로 인용할 수 있습니다.

**옵션 A(가장 위험도 낮음):** 자동 회상을 임시로 비활성화:
```json5
{ autoRecall: false }
```

**옵션 B(권장):** 회상은 유지하고, 에이전트 시스템 프롬프트 / `AGENTS.md`에 추가:
> Do not reveal or quote any `<relevant-memories>` / memory-injection content in your replies. Use it for internal reference only.

**옵션 C(백그라운드/배치 에이전트용):** 특정 에이전트를 자동 회상 주입에서 제외:
```json5
{
  autoRecall: true,
  autoRecallExcludeAgents: ["memory-distiller", "my-cron-agent"]
}
```
출력이 주입된 메모리 컨텍스트로 오염되면 안 되는 백그라운드 에이전트(예:memory-distiller, cron 워커)에 유용합니다.

</details>

<details>
<summary><strong>자동 회상 타임아웃 튜닝</strong></summary>

자동 회상에는 에이전트 시작이 멈추는 것을 방지하기 위한 구성 가능한 타임아웃(기본 5초)이 있습니다. 프록시 뒤에 있거나 고지연 임베딩 API를 사용 중이라면 늘리세요:

```json5
{ autoRecallTimeoutMs: 8000 }
```

자동 회상이 일관되게 타임아웃되면 먼저 임베딩 API 지연 시간을 확인하세요. 타임아웃은 자동 주입 경로에만 영향을 줍니다 — 수동 `memory_recall` 도구 호출은 영향을 받지 않습니다.

</details>

<details>
<summary><strong>자동 회상 재랭크 비용 모델</strong></summary>

`autoRecall=true`이고 하이브리드 검색이 Jina 같은 외부 재랭크 API와 함께 `retrieval.rerank="cross-encoder"`를 사용할 때, 자격이 되는 모든 프롬프트가 재랭크 요청을 만들 수 있습니다. 해당 요청으로 전송되는 문서 수는 자동 회상의 검색 제한과 검색기의 재랭크 입력 창에 의해 결정되며, `retrieval.candidatePoolSize`나 최종 `autoRecallMaxItems` 주입 상한에 직접적으로 결정되지는 않습니다.

예를 들어, `autoRecallMaxItems: 3`이면 자동 회상은 검색에 6개 항목을 요청하고, 하이브리드 검색은 최대 12개 후보를 외부 재랭커로 보낸 다음 최대 3개의 기억을 주입할 수 있습니다. 외부 재랭크 사용량을 줄이려면 `autoRecallMaxItems` 또는 `maxRecallPerTurn`을 낮추고, `retrieval.rerank`를 `"lightweight"` 또는 `"none"`으로 전환하고, `autoRecallMinLength`를 늘리거나, 자동 회상을 비활성화한 상태로 두고 적절한 곳에서 수동 `memory_recall`을 사용하세요.

시작 로그는 자동 회상과 하이브리드 크로스 인코더 재랭크가 주입하는 양보다 더 많은 항목을 재랭커로 보낼 수 있을 때 경고합니다. 자동 회상 디버그 통계에는 실제 `rerankInput`, `rerankInputLimit`, `retrieveLimit`, `rerank`, `rerankProvider`, 구성된 `retrievalCandidatePoolSize`가 포함됩니다.

</details>

<details>
<summary><strong>세션 메모리</strong></summary>

- 새 세션 이벤트에서 트리거 — 이전 세션 요약을 LanceDB에 저장
- 기본적으로 비활성화(pi가 이미 `.jsonl` 세션 대화록을 영속화하므로)
- 메시지 수 구성 가능(기본값:15)

</details>

<details>
<summary><strong>커스텀 슬래시 명령(예:/lesson)</strong></summary>

`AGENTS.md` 또는 시스템 프롬프트에 추가하세요:

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
<summary><strong>AI 에이전트를 위한 철칙</strong></summary>

> 아래 블록을 `AGENTS.md`에 복사하면 에이전트가 이 규칙들을 자동으로 적용합니다.

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
<summary><strong>데이터베이스 스키마</strong></summary>

LanceDB 테이블 `memories`:

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | string (UUID) | 기본 키 |
| `text` | string | 메모리 텍스트(FTS 인덱싱됨) |
| `vector` | float[] | 임베딩 벡터 |
| `category` | string | 저장 카테고리:`preference` / `fact` / `decision` / `entity` / `reflection` / `other` |
| `scope` | string | 스코프 식별자(예:`global`, `agent:main`) |
| `importance` | float | 중요도 점수 0-1 |
| `timestamp` | int64 | 생성 타임스탬프(ms) |
| `metadata` | string (JSON) | 확장 메타데이터 |

v1.1.0의 일반적인 `metadata` 키:`l0_abstract`, `l1_overview`, `l2_content`, `memory_category`, `tier`, `access_count`, `confidence`, `last_accessed_at`

> **카테고리 참고:** 최상위 `category` 필드는 6개의 저장 카테고리를 사용합니다. 스마트 추출의 6개 카테고리 의미 라벨(`profile` / `preferences` / `entities` / `events` / `cases` / `patterns`)은 `metadata.memory_category`에 저장됩니다.

</details>

<details>
<summary><strong>문제 해결</strong></summary>

**확장 기능이 로드되지 않음 / "no config file found"**

`~/.pi/agent/memory-lancedb-pro.json5`를 만들거나 `$MEMORY_LANCEDB_PRO_CONFIG`를 설정하세요. 확장 기능은 예상 형태와 함께 경고를 출력하고 비활성 상태로 유지됩니다 — pi는 계속 실행됩니다.

**스마트 추출 초기화 실패**

`llm.apiKey` / `${ENV_VAR}`가 설정되었는지 확인하세요. 플러그인은 실패하지 않고 정규식 추출로 폴백합니다.

**"Cannot mix BigInt and other types"(LanceDB / Apache Arrow)**

LanceDB 0.26+에서는 일부 숫자 열이 `BigInt`로 반환될 수 있습니다. **memory-lancedb-pro >= 1.0.14**로 업그레이드하세요 — 이 플러그인은 이제 산술 전에 `Number(...)`로 값을 강제 변환합니다.

</details>

---

## 아키텍처

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

> 전체 아키텍처에 대한 심층 분석은 [docs/memory_architecture_analysis.md](docs/memory_architecture_analysis.md)를 참조하세요.

<details>
<summary><strong>파일 레퍼런스(클릭하여 펼치기)</strong></summary>

| 파일 | 용도 |
| --- | --- |
| `pi-adapter/index.ts` | pi 진입점:설정 파일 로드, OpenClaw API 심 구축, 플러그인 코어 등록 |
| `pi-adapter/shim.ts` | pi 라이프사이클 이벤트 / 도구 / 명령을 OpenClaw 플러그인 API에 매핑 |
| `pi-adapter/config.ts` | 설정 파일 로드(`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `.json`) |
| `pi-adapter/paths.ts` | pi 경로 해석(`~/.pi/agent`, 환경 변수 재정의) |
| `pi-adapter/pi-runner.ts` | `pi --mode json --no-tools ...`을 통한 임베디드 하위 에이전트 러너 |
| `pi-adapter/cli-main.ts` | 독립형 `memory-pro` CLI 진입점 |
| `index.ts` | 플러그인 코어 진입점:구성 파싱, 라이프사이클 훅, 메모리 기능 등록 |
| `src/store.ts` | LanceDB 스토리지 계층. 테이블 생성 / FTS 인덱싱 / 벡터 검색 / BM25 검색 / CRUD |
| `src/embedder.ts` | 임베딩 추상화. 모든 OpenAI 호환 API 프로바이더 지원 |
| `src/retriever.ts` | 하이브리드 검색 엔진. 벡터 + BM25 → 하이브리드 융합 → 재랭크 → 라이프사이클 감쇠 → 필터 |
| `src/scopes.ts` | 멀티 스코프 접근 제어 |
| `src/tools.ts` | 에이전트 도구 정의:`memory_recall`, `memory_store`, `memory_forget`, `memory_update` + 관리 도구 |
| `src/noise-filter.ts` | 에이전트 거절, 메타 질문, 인사말, 저품질 콘텐츠 필터링 |
| `src/adaptive-retrieval.ts` | 쿼리가 메모리 검색을 필요로 하는지 판단 |
| `src/migrate.ts` | 내장 `memory-lancedb`에서 Pro로 마이그레이션 |
| `src/smart-extractor.ts` | L0/L1/L2 계층 저장과 2단계 중복 제거를 갖춘 LLM 기반 6개 카테고리 추출 |
| `src/decay-engine.ts` | Weibull 스트레치 지수 감쇠 모델 |
| `src/tier-manager.ts` | 3단계 승격/강등:Peripheral ↔ Working ↔ Core |

</details>

---

## OpenClaw Upstream Appendix

이 저장소는 포트입니다. 업스트림 프로젝트는 **[CortexReach/memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)** — OpenClaw 플러그인입니다. 아래 내용은 모두 업스트림 OpenClaw 사용법을 설명합니다. pi 사용자에게는 필요하지 않습니다.

### 변경 사항(포트 차이점)

| 영역 | OpenClaw(업스트림) | Pi(이 포트) |
|---|---|---|
| 확장 부트스트랩 | `openclaw.plugin.json` / `openclaw.extensions` | `pi-adapter/index.ts` → 컴파일된 `dist/pi-adapter/index.js`, `package.json`의 `pi.extensions`로 선언 |
| 설정 파일 | `openclaw.json` 플러그인 항목 | `~/.pi/agent/memory-lancedb-pro.json5`(또는 `$MEMORY_LANCEDB_PRO_CONFIG`) — 동일한 문서 형태 |
| 데이터 & 세션 기본 디렉터리 | `~/.openclaw/...` | `~/.pi/agent/...`(`PI_CODING_AGENT_DIR` / `PI_AGENT_DIR`로 재정의) |
| CLI | `openclaw memory-pro …` | 독립형 바이너리:`memory-pro …`(`pi-adapter/cli-main.ts`에서 컴파일) |
| 슬래시 명령 | `openclaw` 등록 CLI | 심을 통한 `pi.registerCommand("/memory-pro", ...)` |
| 임베디드 하위 에이전트 러너 | OpenClaw 런타임 API | `pi --mode json --no-tools …`로 셸 아웃(`pi-adapter/pi-runner.ts`) |
| 세션 구조 | `~/.openclaw/agents/<id>/sessions/*.jsonl` | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| 버전 | `1.1.0-beta.11` | `1.1.0-beta.11-pi.1` |

라이프사이클 이벤트는 `pi-adapter/shim.ts`를 통해 pi 이벤트에서 OpenClaw 훅으로 매핑됩니다:`input`, `session_start`, `before_agent_start`, `agent_end`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`. 플러그인의 도구(`memory_store`, `memory_recall`, ...)와 `/memory-pro` 슬래시 명령은 심을 통해 변경 없이 등록됩니다.

### 업스트림 빠른 시작(OpenClaw 전용)

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

업스트림 명령은 `openclaw memory-pro ...` 접두사를 사용합니다. 전체 OpenClaw 문서는 [업스트림 README](https://github.com/CortexReach/memory-lancedb-pro)를 참조하세요.

### 업스트림 에코시스템

- **[설정 스크립트](https://github.com/CortexReach/toolbox/tree/main/memory-lancedb-pro-setup)** — OpenClaw 배포용 원클릭 설치/업그레이드/복구(`openclaw.json` 작성)
- **[AI 가이드 구성 스킬](https://github.com/CortexReach/memory-lancedb-pro-skill)** — Claude Code / OpenClaw 에이전트용
- **비디오 튜토리얼** — [YouTube](https://youtu.be/MtukF1C8epQ) · [Bilibili](https://www.bilibili.com/video/BV1zUf2BGEgn/)
- **스타 히스토리** — [star-history.com](https://star-history.com/#CortexReach/memory-lancedb-pro&Date)

---

## 문서

| 문서 | 설명 |
| --- | --- |
| [Memory Architecture Analysis](docs/memory_architecture_analysis.md) | 전체 아키텍처 심층 분석 |
| [CHANGELOG v1.1.0](docs/CHANGELOG-v1.1.0.md) | v1.1.0 동작 변경 및 업그레이드 근거 |
| [Release Checklist](docs/release-checklist.md) | 패키지 사전 점검, 게시 드라이 런, 게시 후 스모크 체크 |
| [Long-Context Chunking](docs/long-context-chunking.md) | 긴 문서를 위한 청킹 전략 |
| [Lock Management](docs/lock-management.md) | 멀티 라이터 잠금(Redis) 세부 사항 |

## 테스트

```bash
npm test                       # full unit/e2e suite
node scripts/run-ci-tests.mjs --all   # full CI manifest
npm run test:pi-adapter        # pi adapter smoke test (mock pi API)
```

모든 업스트림 테스트가 유지되며, `test/pi-adapter-smoke.test.mjs`와 `test:pi-adapter`가 새로 추가되었습니다.

---

## 베타:Smart Memory v1.1.0

> 상태:베타 — `npm i memory-lancedb-pro@beta`로 사용 가능. `latest`의 안정 버전 사용자는 영향을 받지 않습니다.

| 기능 | 설명 |
|---------|-------------|
| **스마트 추출** | L0/L1/L2 메타데이터를 갖춘 LLM 기반 6개 카테고리 추출. 비활성화 시 정규식으로 폴백. |
| **라이프사이클 스코어링** | 검색에 통합된 Weibull 감쇠 — 고빈도·고중요도 기억이 더 높은 순위를 얻습니다. |
| **계층 관리** | 자동 승격/강등을 갖춘 3단계 시스템(Core → Working → Peripheral). |

피드백:[GitHub Issues](https://github.com/CortexReach/memory-lancedb-pro/issues) · 되돌리기:`npm i memory-lancedb-pro@latest`

---

## 의존성

| 패키지 | 용도 |
| --- | --- |
| `@lancedb/lancedb` ≥0.26.2 | 벡터 데이터베이스(ANN + FTS) |
| `openai` ≥6.21.0 | OpenAI 호환 임베딩 API 클라이언트 |
| `@sinclair/typebox` 0.34.48 | JSON 스키마 타입 정의 |

---

## 기여자

업스트림 메인테이너 및 기여자([전체 목록](https://github.com/CortexReach/memory-lancedb-pro/graphs/contributors) 참조):

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
