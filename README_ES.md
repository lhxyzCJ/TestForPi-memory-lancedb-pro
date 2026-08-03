<div align="center">

# 🧠 memory-lancedb-pro · Extensión π Pi Coding Agent

**Asistente de memoria IA para el [agente de codificación pi](https://github.com/earendil-works/pi)**

*Dale a tu agente de IA un cerebro que de verdad recuerda — entre sesiones, entre proyectos, a través del tiempo.*

Una extensión de memoria basada en LanceDB para pi que almacena preferencias, decisiones y contexto de proyecto, y luego los recuerda automáticamente en futuras sesiones.

[![Pi Extension](https://img.shields.io/badge/Pi-Extension-blue)](https://github.com/earendil-works/pi)
[![Pi 0.80+](https://img.shields.io/badge/pi-0.80%2B-brightgreen)](https://github.com/earendil-works/pi)
[![LanceDB](https://img.shields.io/badge/LanceDB-Vectorstore-orange)](https://lancedb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) | [简体中文](README_CN.md) | [繁體中文](README_TW.md) | [日本語](README_JA.md) | [한국어](README_KO.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Deutsch](README_DE.md) | [Italiano](README_IT.md) | [Русский](README_RU.md) | [Português (Brasil)](README_PT-BR.md)

</div>

---

## 🤖 Acerca de este port

Este repositorio es un **port para el agente de codificación pi** del plugin de memoria de calidad de producción [memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro) (MIT). Todo el núcleo del plugin OpenClaw permanece intacto y se carga sin cambios a través de un adaptador fino (`pi-adapter/`), de modo que pi (≥ 0.80) obtiene el mismo motor de memoria impulsado por LanceDB con una divergencia mínima respecto al proyecto original.

> Todo lo que sigue documenta la experiencia pi. Consulta el [Apéndice del proyecto original OpenClaw](#openclaw-upstream-appendix) al final para ver la tabla de diferencias del port y el uso original de OpenClaw.

---

## ¿Por qué memory-lancedb-pro?

La mayoría de los agentes de IA sufren de amnesia. Lo olvidan todo en el momento en que inicias un nuevo chat.

**memory-lancedb-pro** es una extensión de memoria a largo plazo de calidad de producción que convierte a tu agente en un **Asistente de Memoria IA** — captura automáticamente lo que importa, deja que el ruido se desvanezca naturalmente y recupera el recuerdo correcto en el momento correcto. Sin etiquetado manual, sin dolores de cabeza de configuración.

### Tu Asistente de Memoria IA en acción

**Sin memoria — cada sesión empieza desde cero:**

> **Tú:** "Usa tabulaciones para la sangría, añade siempre el manejo de errores."
> *(siguiente sesión)*
> **Tú:** "Ya te lo dije — ¡tabulaciones, no espacios!" 😤
> *(siguiente sesión)*
> **Tú:** "...en serio, tabulaciones. Y manejo de errores. Otra vez."

**Con memory-lancedb-pro — tu agente aprende y recuerda:**

> **Tú:** "Usa tabulaciones para la sangría, añade siempre el manejo de errores."
> *(siguiente sesión — el agente recuerda automáticamente tus preferencias)*
> **Agente:** *(aplica silenciosamente tabulaciones + manejo de errores)* ✅
> **Tú:** "¿Por qué elegimos PostgreSQL en lugar de MongoDB el mes pasado?"
> **Agente:** "Según nuestra discusión del 12 de febrero, las razones principales fueron..." ✅

Esa es la diferencia que marca un **Asistente de Memoria IA** — aprende tu estilo, recuerda decisiones pasadas y ofrece respuestas personalizadas sin que tengas que repetirte.

### ¿Qué más puede hacer?

| | Lo que obtienes |
|---|---|
| **Captura automática** | Tu agente aprende de cada conversación — sin necesidad de `memory_store` manual |
| **Extracción inteligente** | Clasificación de 6 categorías impulsada por LLM: perfiles, preferencias, entidades, eventos, casos, patrones |
| **Olvido inteligente** | Modelo de decaimiento de Weibull — los recuerdos importantes permanecen, el ruido se desvanece naturalmente |
| **Recuperación híbrida** | Búsqueda vectorial + texto completo BM25, fusionada con reordenamiento por cross-encoder |
| **Inyección de contexto** | Los recuerdos relevantes aparecen automáticamente antes de cada respuesta |
| **Aislamiento multi-ámbito** | Límites de memoria por agente, por usuario, por proyecto |
| **Cualquier proveedor** | OpenAI, Jina, Gemini, Ollama, o cualquier API compatible con OpenAI |
| **Kit completo de herramientas** | CLI, copia de seguridad, migración, actualización, exportación/importación — listo para producción |

---

## Inicio rápido

> **Requisito de CPU:** tu CPU debe soportar instrucciones **AVX**. La búsqueda vectorial nativa de LanceDB puede requerir **AVX2** en algunas versiones Linux x64 y puede hacer fallar a las CPU solo-AVX con `SIGILL`; establece `retrieval.disableNativeCosine: true` o `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` para usar un escaneo de filas por ámbito más una clasificación coseno en JavaScript. Comprueba las banderas de la CPU con: `grep -o 'avx[^ ]*' /proc/cpuinfo | head -1` (sin salida = no soportado). Consulta [#419](https://github.com/CortexReach/memory-lancedb-pro/issues/419) y [#644](https://github.com/CortexReach/memory-lancedb-pro/issues/644) para más detalles.

### 1. Construir la extensión

```bash
git clone https://github.com/lhxyzCJ/TestForPi-memory-lancedb-pro
cd TestForPi-memory-lancedb-pro && npm install && npm run build
```

El punto de entrada de pi es `dist/pi-adapter/index.js` (compilado desde `pi-adapter/index.ts`).

### 2. Registrar la extensión

Elige una de estas opciones:

**A. Mediante el archivo de configuración de pi (global, todos los proyectos):**

Añade a `~/.pi/agent/settings.json`:

```json
{
  "extensions": [
    "/absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js"
  ]
}
```

**B. Mediante el gestor de paquetes de pi:**

```bash
pi install /absolute/path/to/TestForPi-memory-lancedb-pro
```

**C. Prueba rápida para una sesión:**

```bash
pi -e /absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js
```

**D. Auto-descubrimiento (sin cambiar la configuración):** coloca la extensión construida (o un `package.json` con un campo `pi.extensions`) en `~/.pi/agent/extensions/` (global) o `.pi/extensions/` (local al proyecto) y reinicia pi.

### 3. Crear el archivo de configuración

Crea `~/.pi/agent/memory-lancedb-pro.json5` (también puedes usar `.json`, o apuntar a cualquier lugar con `$MEMORY_LANCEDB_PRO_CONFIG`):

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

> La forma del documento de configuración es idéntica a la entrada del plugin OpenClaw original — tanto el objeto interno desnudo de arriba como un contenedor `{ "config": { ... } }` son aceptados.

### 4. Verificar

Inicia una sesión de pi y revisa el registro de arranque:

```
memory-lancedb-pro: smart extraction enabled
memory-lancedb-pro@...: plugin registered (db: /root/.pi-agent/memory/lancedb-pro, ...)
```

Luego pide a tu agente que almacene y recuerde algo:

> **Tú:** "Recuerda: prefiero las tabulaciones a los espacios."
> **Tú:** "¿Cuáles son mis preferencias de sangría?"

### ¿Por qué estos valores predeterminados?

- `autoCapture` + `smartExtraction` → tu agente aprende de cada conversación automáticamente
- `autoRecall` → los recuerdos relevantes se inyectan antes de cada respuesta
- `extractMinMessages: 2` → la extracción se activa en chats normales de dos turnos
- `sessionMemory.enabled: false` → evita contaminar la recuperación con resúmenes de sesión desde el primer día

---

## Requisitos de ejecución (pi)

Los siguientes requisitos provienen del host pi y no se configuran en `memory-lancedb-pro.json5`:

1. **Proveedor predeterminado** — Los subagentes de reflexión/dreaming se lanzan mediante la CLI `pi` sin `--provider`/`--model` y heredan el valor predeterminado del host. Establezca `defaultProvider`/`defaultModel` en `~/.pi/agent/settings.json` (p. ej. `"defaultProvider": "opencode-go", "defaultModel": "deepseek-v4-flash"`); de lo contrario, los subagentes pueden caer en un proveedor roto o no deseado.
2. **Punto final de embeddings** — La API de embeddings debe ser accesible (p. ej. iniciar Ollama antes de una sesión); un punto final inaccesible degrada silenciosamente la extracción inteligente al respaldo regex.
3. **Clave de API LLM** — La extracción inteligente necesita una clave LLM válida (`llm.apiKey`, p. ej. `"${OPENCODE_API_KEY}"`); sin ella, la extracción recurre a la captura regex.
4. **Ruta de actualización** — pi carga la extensión desde la ruta absoluta registrada en `settings.json` (`extensions`). Tras actualizar este repositorio, vuelva a ejecutar `pi install` (o reemplace la copia instalada); de lo contrario, pi seguirá cargando la compilación anterior.

**Brecha conocida frente a upstream:** el modo de admisión batch-utility de upstream (#941, `utilityMode: "batch"`, `utilityVetoThreshold`) no está portado; `utilityMode` solo admite `"standalone" | "off"`.

## ⚠️ Arquitectura de memoria (importante)

La extensión expone una capacidad de memoria con dos almacenes coordinados:

| Capa de memoria | Almacenamiento | Para qué sirve | ¿Recuperable? |
|---|---|---|---|
| **Memoria del plugin** | LanceDB (almacén vectorial) | Recuperación semántica mediante `memory_recall` / auto-recuperación | ✅ Sí |
| **Corpus canónico** | `MEMORY.md`, `memory/**/*.md`, transcripciones de sesiones recientes, `memory/dreaming/**/*.md` | Archivos fuente de verdad y artefactos públicos | ✅ Mediante el índice semántico de LanceDB cuando `canonicalCorpus.enabled` es true |

**Principio clave:**
> Los archivos canónicos siguen siendo la fuente de verdad. LanceDB es el índice semántico usado para recuperarlos con rutas ancladas, rangos de líneas, fragmentos y citas.

**Lo que esto significa para ti:**
- ¿Necesitas recuperación semántica? → Usa `memory_store` o deja que la captura automática lo haga
- `memory/YYYY-MM-DD.md` → trátalo como un **diario / registro diario** que también puede indexarse para búsqueda semántica
- `MEMORY.md` → referencia legible y curada que puede indexarse como contexto canónico
- `memory/dreaming/**/*.md` → informes de sueños expuestos como artefactos públicos e indexados como contexto de reflexión
- Transcripciones JSONL de sesiones → indexadas como `source: "sessions"` cuando `canonicalCorpus.includeSessionTranscripts` está habilitado
- Memoria del plugin → ruta de escritura principal para hechos duraderos, preferencias, decisiones y recuerdos capturados automáticamente

### Dónde viven los datos (pi)

| Qué | Ruta |
|---|---|
| Base de datos del plugin (LanceDB) | `~/.pi/agent/memory/lancedb-pro` (o `$MEMORY_LANCEDB_PRO_DB_PATH`) |
| Espejo Markdown | `~/.pi/agent/memory/md-mirror` (o `$MEMORY_LANCEDB_PRO_MD_MIRROR_DIR`) |
| Transcripciones de sesiones | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| Habilidades globales | `~/.pi/agent/skills` |

El directorio base es `~/.pi/agent`; sustitúyelo con `PI_CODING_AGENT_DIR` o `PI_AGENT_DIR`. Las rutas relativas de la configuración (`dbPath`, `mdMirrorDir`, ...) se resuelven respecto al directorio base del agente pi.

### Ubicaciones del archivo de configuración (en orden de prioridad)

1. `$MEMORY_LANCEDB_PRO_CONFIG` (ruta explícita)
2. `~/.pi/agent/memory-lancedb-pro.json5`
3. `~/.pi/agent/memory-lancedb-pro.json`

Si no se encuentra ningún archivo de configuración, la extensión registra una advertencia y permanece deshabilitada — una configuración rota o ausente nunca derriba la sesión de pi.

---

## Funciones principales

### Recuperación híbrida

```
Query → embedQuery() ─┐
                       ├─→ Hybrid Fusion → Rerank → Lifecycle Decay Boost → Length Norm → Filter
Query → BM25 FTS ─────┘
```

- **Búsqueda vectorial** — similitud semántica mediante ANN de LanceDB (distancia coseno)
- **Búsqueda de texto completo BM25** — coincidencia exacta de palabras clave mediante el índice FTS de LanceDB
- **Fusión híbrida** — puntuación vectorial como base, las coincidencias BM25 reciben un impulso ponderado (no es RRF estándar — ajustado para calidad de recuperación real)
- **Ponderaciones configurables** — `vectorWeight`, `bm25Weight`, `minScore`

### Reordenamiento con cross-encoder

- Adaptadores integrados para **Jina**, **SiliconFlow**, **Voyage AI** y **Pinecone**
- Compatible con cualquier endpoint compatible con Jina (p. ej., Hugging Face TEI, DashScope)
- Puntuación híbrida: 60% cross-encoder + 40% puntuación fusionada original
- Degradación elegante: recurre a la similitud coseno si falla la API

### Pipeline de puntuación multi-etapa

| Etapa | Efecto |
| --- | --- |
| **Fusión híbrida** | Combina la recuperación semántica y la de coincidencia exacta |
| **Reordenamiento cross-encoder** | Promueve las coincidencias semánticamente precisas |
| **Impulso de decaimiento del ciclo de vida** | Frescura de Weibull + frecuencia de acceso + importancia × confianza |
| **Normalización de longitud** | Evita que las entradas largas dominen (ancla: 500 caracteres) |
| **Puntuación mínima estricta** | Elimina resultados irrelevantes (predeterminado: 0.35) |
| **Diversidad MMR** | Similitud coseno > 0.85 → degradado |

### Extracción inteligente de memoria (v1.1.0)

- **Extracción de 6 categorías impulsada por LLM**: perfil, preferencias, entidades, eventos, casos, patrones
- **Almacenamiento en capas L0/L1/L2**: L0 (índice de una frase) → L1 (resumen estructurado) → L2 (narrativa completa)
- **Deduplicación en dos etapas**: prefiltro de similitud vectorial (≥0.7) → decisión semántica del LLM (CREATE/MERGE/SKIP)
- **Fusión consciente de la categoría**: `profile` siempre se fusiona, `events`/`cases` son solo de añadido

### Gestión del ciclo de vida de la memoria (v1.1.0)

- **Motor de decaimiento de Weibull**: puntuación compuesta = actualidad + frecuencia + valor intrínseco
- **Promoción de tres niveles**: `Peripheral ↔ Working ↔ Core` con umbrales configurables
- **Refuerzo por acceso**: los recuerdos recuperados con frecuencia decaen más lentamente (estilo repetición espaciada)
- **Vida media modulada por importancia**: los recuerdos importantes decaen más lentamente

### Aislamiento multi-ámbito

- Ámbitos integrados: `global`, `agent:<id>`, `custom:<name>`, `project:<id>`, `user:<id>`
- Control de acceso a nivel de agente mediante `scopes.agentAccess`
- Por defecto: cada agente accede a `global` + su propio ámbito `agent:<id>`
- Las herramientas de solo lectura como `memory_recall`, `memory_search`, `memory_list` y `memory_debug` fallan suavemente cuando un ámbito solicitado es inaccesible: buscan en los ámbitos accesibles del llamante y devuelven `ignoredScope` más `accessibleScopes` en los detalles. Las herramientas de escritura y mutación siguen devolviendo `scope_access_denied` para ámbitos inaccesibles.

### Captura automática y auto-recuperación

- **Captura automática** (`agent_end`): extrae preferencia/hecho/decisión/entidad de las conversaciones, deduplica, almacena hasta 3 por turno
- **Auto-recuperación** (antes de cada construcción de prompt): inyecta el contexto `<relevant-memories>` (hasta 3 entradas)

> **Nota:** en pi, estos hooks de OpenClaw (`agent_end`, `before_prompt_build`, ...) se mapean desde los eventos del ciclo de vida de pi (`agent_end`, `input`, `session_start`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`) mediante `pi-adapter/shim.ts`.

### Filtrado de ruido y recuperación adaptativa

- Filtra contenido de baja calidad: rechazos del agente, meta-preguntas, saludos
- Omite la recuperación para saludos, comandos slash, confirmaciones simples, emojis
- Fuerza la recuperación para palabras clave de memoria ("remember", "previously", "last time")
- Umbrales adaptados al CJK (chino: 6 caracteres vs inglés: 15 caracteres)

---

<details>
<summary><strong>Comparación con el <code>memory-lancedb</code> integrado (clic para expandir)</strong></summary>

| Función | `memory-lancedb` integrado | **memory-lancedb-pro** |
| --- | :---: | :---: |
| Búsqueda vectorial | Sí | Sí |
| Búsqueda de texto completo BM25 | - | Sí |
| Fusión híbrida (Vector + BM25) | - | Sí |
| Reordenamiento cross-encoder (multi-proveedor) | - | Sí |
| Impulso de actualidad y decaimiento temporal | - | Sí |
| Normalización de longitud | - | Sí |
| Diversidad MMR | - | Sí |
| Aislamiento multi-ámbito | - | Sí |
| Filtrado de ruido | - | Sí |
| Recuperación adaptativa | - | Sí |
| CLI de gestión | - | Sí |
| Memoria de sesión | - | Sí |
| Embeddings conscientes de la tarea | - | Sí |
| **Extracción inteligente con LLM (6 categorías)** | - | Sí (v1.1.0) |
| **Decaimiento de Weibull + promoción de niveles** | - | Sí (v1.1.0) |
| Cualquier embedding compatible con OpenAI | Limitado | Sí |

</details>

---

## Configuración

Toda la configuración vive en `~/.pi/agent/memory-lancedb-pro.json5` (o `$MEMORY_LANCEDB_PRO_CONFIG`).

Los campos de clave de API (`embedding.apiKey`, `retrieval.rerankApiKey` y `llm.apiKey`) aceptan cadenas simples, marcadores de posición `${ENV_VAR}` u objetos SecretRef. Este plugin soporta las fuentes SecretRef `env` y `file`:

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

Para `source: "file"`, `id` se resuelve respecto al directorio base del agente pi y se lee como un archivo UTF-8. El campo opcional `provider` se acepta para la compatibilidad de forma de objeto SecretRef pero no se usa para la selección de proveedor. Las fuentes SecretRef `exec` y otras son rechazadas por la validación de configuración en tiempo de ejecución.

<details>
<summary><strong>Ejemplo de configuración completo</strong></summary>

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
<summary><strong>Proveedores de embeddings</strong></summary>

Funciona con **APIs de embeddings compatibles con OpenAI**, incluyendo adaptadores de payload específicos de proveedor para servicios como Jina y Voyage:

| Proveedor | Modelo | URL base | Dimensiones |
| --- | --- | --- | --- |
| **Jina** (recomendado) | `jina-embeddings-v5-text-small` | `https://api.jina.ai/v1` | 1024 |
| **OpenAI** | `text-embedding-3-small` | `https://api.openai.com/v1` | 1536 |
| **Voyage** | `voyage-4-lite` / `voyage-4` | `https://api.voyageai.com/v1` | 1024 / 1024 |
| **Google Gemini** | `gemini-embedding-001` | `https://generativelanguage.googleapis.com/v1beta/openai/` | 3072 |
| **Ollama** (local) | `nomic-embed-text` | `http://localhost:11434/v1` | específico del proveedor |

Las solicitudes de embeddings de Voyage usan la forma de payload `model` + `input` de Voyage. Cuando `requestDimensions` está configurado, se envía como `output_dimension`; los campos solo de OpenAI como `encoding_format` se omiten.

Define `embedding.maxInputChars` para servidores de embeddings locales con contextos o límites de lotes pequeños. El plugin aplica un valor predeterminado conservador para `nomic-embed-text`; con el fragmentado automático habilitado, los documentos largos se dividen antes de aplicar el límite a cada solicitud de proveedor.

</details>

<details>
<summary><strong>Proveedores de reordenamiento</strong></summary>

El reordenamiento con cross-encoder soporta varios proveedores mediante `rerankProvider`:

| Proveedor | `rerankProvider` | Modelo de ejemplo |
| --- | --- | --- |
| **Jina** (predeterminado) | `jina` | `jina-reranker-v3` |
| **SiliconFlow** (hay nivel gratuito) | `siliconflow` | `BAAI/bge-reranker-v2-m3` |
| **Voyage AI** | `voyage` | `rerank-2.5` |
| **Pinecone** | `pinecone` | `bge-reranker-v2-m3` |

Cualquier endpoint de reordenamiento compatible con Jina también funciona — establece `rerankProvider: "jina"` y apunta `rerankEndpoint` a tu servicio (p. ej., Hugging Face TEI, DashScope `qwen3-rerank`).

</details>

<details>
<summary><strong>Extracción inteligente (LLM) — v1.1.0</strong></summary>

Cuando `smartExtraction` está habilitado (predeterminado: `true`), el plugin usa un LLM para extraer y clasificar recuerdos inteligentemente en lugar de disparadores basados en expresiones regulares.

| Campo | Tipo | Predeterminado | Descripción |
|-------|------|---------|-------------|
| `smartExtraction` | booleano | `true` | Habilita/deshabilita la extracción de 6 categorías impulsada por LLM |
| `llm.auth` | cadena | `api-key` | `api-key` usa `llm.apiKey` / `embedding.apiKey`; `oauth` usa un archivo de token OAuth con ámbito de plugin por defecto |
| `llm.apiKey` | cadena | *(recurre a `embedding.apiKey`)* | Clave de API del proveedor de LLM |
| `llm.model` | cadena | `openai/gpt-oss-120b` | Nombre del modelo LLM |
| `llm.baseURL` | cadena | *(recurre a `embedding.baseURL`)* | Endpoint de la API LLM |
| `llm.oauthProvider` | cadena | `openai-codex` | ID del proveedor OAuth usado cuando `llm.auth` es `oauth` |
| `llm.oauthPath` | cadena | `~/.pi/agent/.memory-lancedb-pro/oauth.json` | Archivo de token OAuth usado cuando `llm.auth` es `oauth` |
| `llm.timeoutMs` | número | `30000` | Tiempo de espera de las solicitudes LLM en milisegundos |
| `extractMinMessages` | número | `2` | Mínimo de mensajes antes de que se dispare la extracción |
| `extractMaxChars` | número | `8000` | Máximo de caracteres enviados al LLM |

Config `llm` con OAuth (usa una caché de inicio de sesión existente de Codex / ChatGPT para llamadas LLM):

> **Nota:** los flujos OAuth se heredan del plugin OpenClaw original. En pi, `memory-pro auth login` delega en la misma lógica OAuth; el archivo de token está por defecto en `~/.pi/agent/.memory-lancedb-pro/oauth.json`.

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

- `llm.oauthProvider` actualmente es `openai-codex`.
- Los tokens OAuth están por defecto en `~/.pi/agent/.memory-lancedb-pro/oauth.json`.
- Puedes definir `llm.oauthPath` si quieres guardar ese archivo en otro lugar.
- `auth login` crea una instantánea de la config `llm` api-key anterior junto al archivo OAuth, y `auth logout` restaura esa instantánea cuando existe.
- Cambiar de `api-key` a `oauth` no transfiere automáticamente `llm.baseURL`. Configúralo manualmente en modo OAuth solo si quieres deliberadamente un backend compatible con ChatGPT/Codex personalizado.

</details>

<details>
<summary><strong>Respaldo de CPU heredado</strong></summary>

Si un host Linux x64 solo-AVX falla dentro de la búsqueda vectorial nativa de LanceDB con `SIGILL`, deshabilita el coseno nativo y deja que memory-lancedb-pro escanee las filas del ámbito y las clasifique en JavaScript:

```json5
{
  retrieval: {
    disableNativeCosine: true
  }
}
```

También puedes establecer `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` para el mismo comportamiento.

</details>

<details>
<summary><strong>Configuración del ciclo de vida (decaimiento + nivel)</strong></summary>

| Campo | Predeterminado | Descripción |
|-------|---------|-------------|
| `decay.recencyHalfLifeDays` | `30` | Vida media base para el decaimiento de actualidad de Weibull |
| `decay.frequencyWeight` | `0.3` | Peso de la frecuencia de acceso en la puntuación compuesta |
| `decay.intrinsicWeight` | `0.3` | Peso de `importance × confidence` |
| `decay.betaCore` | `0.8` | Beta de Weibull para recuerdos `core` |
| `decay.betaWorking` | `1.0` | Beta de Weibull para recuerdos `working` |
| `decay.betaPeripheral` | `1.3` | Beta de Weibull para recuerdos `peripheral` |
| `tier.coreAccessThreshold` | `10` | Mínimo de recuperaciones antes de promover a `core` |
| `tier.peripheralAgeDays` | `60` | Umbral de antigüedad para degradar recuerdos obsoletos |

</details>

<details>
<summary><strong>Refuerzo por acceso</strong></summary>

Los recuerdos recuperados con frecuencia decaen más lentamente (estilo repetición espaciada).

Claves de configuración (bajo `retrieval`):
- `reinforcementFactor` (0-2, predeterminado: `0.5`) — establece `0` para deshabilitar
- `maxHalfLifeMultiplier` (1-10, predeterminado: `3`) — límite duro de la vida media efectiva

</details>

---

## Comandos CLI

El binario `memory-pro` está disponible después de `npm run build`:

```bash
npm link   # una vez, para exponer el binario "memory-pro" globalmente
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

Dentro de una sesión de pi, la misma superficie de gestión está disponible como el comando slash **`/memory-pro`**.

> La CLI lee el mismo archivo de configuración que la extensión (`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `~/.pi/agent/memory-lancedb-pro.json`).

Flujo de inicio de sesión OAuth:

1. Ejecuta `memory-pro auth login`
2. Si se omite `--provider` en una terminal interactiva, la CLI muestra un selector de proveedor OAuth antes de abrir el navegador
3. El comando imprime una URL de autorización y abre tu navegador a menos que `--no-browser` esté establecido
4. Tras el éxito del callback, el comando guarda el archivo OAuth del plugin (predeterminado: `~/.pi/agent/.memory-lancedb-pro/oauth.json`), crea una instantánea de la config `llm` api-key anterior para el cierre de sesión, y reemplaza la config `llm` del plugin con los ajustes OAuth (`auth`, `oauthProvider`, `model`, `oauthPath`)
5. `memory-pro auth logout` elimina ese archivo OAuth y restaura la config `llm` api-key anterior cuando esa instantánea existe

---

## Temas avanzados

<details>
<summary><strong>Actualización desde una versión anterior del port</strong></summary>

```bash
# 1) Copia de seguridad
memory-pro export --scope global --output memories-backup.json
# 2) Prueba en seco
memory-pro upgrade --dry-run
# 3) Ejecutar la actualización
memory-pro upgrade
# 4) Verificar
memory-pro stats
```

Consulta `CHANGELOG-v1.1.0.md` para los cambios de comportamiento y la justificación de la actualización.

**¿Activar las sugerencias de tarea de Jina en una base de datos existente?**

Las sugerencias de tarea son dos claves de configuración bajo el bloque `embedding`:

```json5
{
  embedding: {
    model: "jina-embeddings-v5-text-small",
    taskQuery: "retrieval.query",
    taskPassage: "retrieval.passage"
  }
}
```

Solo afectan a los vectores escritos *después* de configurarlas. Las filas ya presentes en tu almacén se embebieron sin sugerencia de tarea, por lo que una consulta embebida con `retrieval.query` se compara con pasajes que viven en un espacio vectorial diferente — obtienes aproximadamente la mitad del beneficio, silenciosamente.

Para corregir las filas existentes, vuelve a embeber en una **base de datos nueva y migra a ella**. No vuelvas a embeber en el mismo lugar: `reembed` escribe cada fila con `table.add()` (añadir por id, no reemplazar), por lo que una ejecución en el mismo lugar — que es exactamente lo que `--force` desbloquea — deja el vector antiguo junto al nuevo y **duplica cada fila**; los reintentos se acumulan. Por esta razón, `reembed` rechaza ejecuciones en la misma ruta a menos que lo fuerces.

```bash
# 0) Asegúrate de que ninguna sesión de pi escriba durante la migración.

# 1) Haz una copia de seguridad de todo el almacén — una copia real del sistema
#    de archivos del directorio LanceDB.
#    (NO confíes en `memory-pro export`: por defecto usa --limit 1000 y un solo
#    --scope, por lo que descarta silenciosamente filas más allá de 1000 y
#    todos los ámbitos no globales.)
cp -r <your dbPath> <your dbPath>.bak

# 2) En el archivo de configuración, establece las sugerencias de tarea Y apunta
#    `dbPath` a un destino nuevo y vacío (p. ej. "<your dbPath>-v2"). Un destino
#    nuevo también es lo que te permite cambiar `embedding.dimensions`: un nuevo
#    ancho de vector solo puede ir a una tabla nueva.

# 3) Prueba en seco — lee la fuente, imprime el recuento de filas, no escribe nada.
memory-pro reembed --source-db <old dbPath> --dry-run

# 4) Vuelve a embeber antiguo -> nuevo con las sugerencias de tarea ahora
#    vigentes. Fuente != destino, por lo que cada id aterriza exactamente una vez.
#    Seguro de reejecutar con --skip-existing si se interrumpe.
memory-pro reembed --source-db <old dbPath>

# 5) Verifica antes de confiar en la migración: el recuento "imported" y
#    `memory-pro stats` en el nuevo dbPath deben igualar el recuento de filas
#    de la prueba en seco.
memory-pro stats

# 6) Reinicia pi; ahora abre el nuevo dbPath.
```

La misma migración se aplica cada vez que cambias `embedding.model` o `embedding.dimensions` — vuelve a embeber siempre en un `dbPath` nuevo, nunca en el mismo lugar.

</details>

<details>
<summary><strong>Bloqueo y escritores concurrentes</strong></summary>

`memory-lancedb-pro` usa un bloqueo de archivo entre procesos para las escrituras de LanceDB. Esto es suficiente para sesiones de pi concurrentes y procesos locales que comparten el mismo directorio de base de datos.

Redis no es necesario para esos despliegues. El bloqueo con Redis se habilita cuando `locking.redis.enabled` es true, cuando `redisUrl`/`locking.redis.url` está establecido, o cuando `MEMORY_LANCEDB_REDIS_URL` está presente en el entorno de ese proceso. Para escritores multi-máquina o multi-contenedor, lee [Lock Management](docs/lock-management.md) antes de compartir un directorio LanceDB entre procesos, y asegúrate de que cada escritor use la misma configuración de bloqueo.

</details>

<details>
<summary><strong>Si los recuerdos inyectados aparecen en las respuestas</strong></summary>

A veces el modelo puede repetir el bloque `<relevant-memories>` inyectado.

**Opción A (menor riesgo):** deshabilita temporalmente la auto-recuperación:
```json5
{ autoRecall: false }
```

**Opción B (preferida):** mantén la recuperación, añade a tu prompt de sistema / `AGENTS.md`:
> No reveles ni cites ningún contenido de `<relevant-memories>` / inyección de memoria en tus respuestas. Úsalo solo como referencia interna.

**Opción C (para agentes de fondo / por lotes):** excluye agentes específicos de la inyección de auto-recuperación:
```json5
{
  autoRecall: true,
  autoRecallExcludeAgents: ["memory-distiller", "my-cron-agent"]
}
```
Útil para agentes de fondo (p. ej. memory-distiller, trabajos cron) cuya salida no debe contaminarse con el contexto de memoria inyectado.

</details>

<details>
<summary><strong>Ajuste del tiempo de espera de la auto-recuperación</strong></summary>

La auto-recuperación tiene un tiempo de espera configurable (predeterminado 5 s) para evitar bloquear el arranque del agente. Si estás detrás de un proxy o usas una API de embeddings de alta latencia, auméntalo:

```json5
{ autoRecallTimeoutMs: 8000 }
```

Si la auto-recuperación agota el tiempo constantemente, verifica primero la latencia de tu API de embeddings. El tiempo de espera solo afecta a la ruta de inyección automática — las llamadas manuales a la herramienta `memory_recall` no se ven afectadas.

</details>

<details>
<summary><strong>Modelo de coste del reordenamiento de la auto-recuperación</strong></summary>

Cuando `autoRecall=true` y la recuperación híbrida usa `retrieval.rerank="cross-encoder"` con una API de reordenamiento externa como Jina, cada prompt elegible puede realizar una solicitud de reordenamiento. El número de documentos enviados a esa solicitud se rige por el límite de recuperación de la auto-recuperación y la ventana de entrada de reordenamiento del recuperador, no directamente por `retrieval.candidatePoolSize` ni por el límite final de inyección `autoRecallMaxItems`.

Por ejemplo, con `autoRecallMaxItems: 3`, la auto-recuperación pide 6 elementos a la recuperación y la recuperación híbrida puede enviar hasta 12 candidatos al reordenador externo antes de inyectar como máximo 3 recuerdos. Para reducir el uso del reordenamiento externo, baja `autoRecallMaxItems` o `maxRecallPerTurn`, cambia `retrieval.rerank` a `"lightweight"` o `"none"`, aumenta `autoRecallMinLength`, o mantén la auto-recuperación deshabilitada y usa `memory_recall` manual donde sea apropiado.

Los registros de arranque advierten cuando la auto-recuperación más el reordenamiento híbrido por cross-encoder pueden enviar más elementos al reordenador de los que inyectará. Las estadísticas de depuración de la auto-recuperación incluyen el `rerankInput`, `rerankInputLimit`, `retrieveLimit`, `rerank`, `rerankProvider` reales y el `retrievalCandidatePoolSize` configurado.

</details>

<details>
<summary><strong>Memoria de sesión</strong></summary>

- Se dispara en los eventos de nueva sesión — guarda el resumen de la sesión anterior en LanceDB
- Deshabilitada por defecto (pi ya persiste las transcripciones de sesión `.jsonl`)
- Recuento de mensajes configurable (predeterminado: 15)

</details>

<details>
<summary><strong>Comandos slash personalizados (p. ej. /lesson)</strong></summary>

Añade a tu `AGENTS.md` o prompt de sistema:

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
<summary><strong>Reglas de hierro para agentes de IA</strong></summary>

> Copia el bloque de abajo en tu `AGENTS.md` para que tu agente aplique estas reglas automáticamente.

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
<summary><strong>Esquema de la base de datos</strong></summary>

Tabla `memories` de LanceDB:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | string (UUID) | Clave primaria |
| `text` | string | Texto del recuerdo (indexado FTS) |
| `vector` | float[] | Vector de embedding |
| `category` | string | Categoría de almacenamiento: `preference` / `fact` / `decision` / `entity` / `reflection` / `other` |
| `scope` | string | Identificador de ámbito (p. ej., `global`, `agent:main`) |
| `importance` | float | Puntuación de importancia 0-1 |
| `timestamp` | int64 | Marca de tiempo de creación (ms) |
| `metadata` | string (JSON) | Metadatos extendidos |

Claves `metadata` comunes en v1.1.0: `l0_abstract`, `l1_overview`, `l2_content`, `memory_category`, `tier`, `access_count`, `confidence`, `last_accessed_at`

> **Nota sobre categorías:** el campo `category` de nivel superior usa 6 categorías de almacenamiento. Las 6 etiquetas semánticas de la Extracción inteligente (`profile` / `preferences` / `entities` / `events` / `cases` / `patterns`) se almacenan en `metadata.memory_category`.

</details>

<details>
<summary><strong>Solución de problemas</strong></summary>

**La extensión no carga / "no config file found"**

Crea `~/.pi/agent/memory-lancedb-pro.json5` o establece `$MEMORY_LANCEDB_PRO_CONFIG`. La extensión imprime una advertencia con la forma esperada y permanece deshabilitada — pi sigue ejecutándose.

**Falló la inicialización de la extracción inteligente**

Comprueba que `llm.apiKey` / `${ENV_VAR}` esté establecido; el plugin recurre a la extracción por expresiones regulares en lugar de fallar.

**"Cannot mix BigInt and other types" (LanceDB / Apache Arrow)**

En LanceDB 0.26+, algunas columnas numéricas pueden devolverse como `BigInt`. Actualiza a **memory-lancedb-pro >= 1.0.14** — este plugin ahora convierte los valores con `Number(...)` antes de la aritmética.

</details>

---

## Arquitectura

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

> Para un análisis profundo de la arquitectura completa, consulta [docs/memory_architecture_analysis.md](docs/memory_architecture_analysis.md).

<details>
<summary><strong>Referencia de archivos (clic para expandir)</strong></summary>

| Archivo | Propósito |
| --- | --- |
| `pi-adapter/index.ts` | Punto de entrada de pi: carga el archivo de configuración, construye el shim de la API OpenClaw, registra el núcleo del plugin |
| `pi-adapter/shim.ts` | Mapea los eventos / herramientas / comandos del ciclo de vida de pi a la API del plugin OpenClaw |
| `pi-adapter/config.ts` | Carga del archivo de configuración (`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `.json`) |
| `pi-adapter/paths.ts` | Resolución de rutas de pi (`~/.pi/agent`, anulaciones por entorno) |
| `pi-adapter/pi-runner.ts` | Ejecutor de sub-agente embebido mediante `pi --mode json --no-tools ...` |
| `pi-adapter/cli-main.ts` | Punto de entrada CLI autónomo `memory-pro` |
| `index.ts` | Entrada del núcleo del plugin: análisis de configuración, hooks del ciclo de vida, registro de la capacidad de memoria |
| `src/store.ts` | Capa de almacenamiento LanceDB. Creación de tablas / indexación FTS / búsqueda vectorial / búsqueda BM25 / CRUD |
| `src/embedder.ts` | Abstracción de embeddings. Compatible con cualquier proveedor de API compatible con OpenAI |
| `src/retriever.ts` | Motor de recuperación híbrida. Vectorial + BM25 → Fusión híbrida → Reordenamiento → Decaimiento del ciclo de vida → Filtrado |
| `src/scopes.ts` | Control de acceso multi-ámbito |
| `src/tools.ts` | Definiciones de herramientas del agente: `memory_recall`, `memory_store`, `memory_forget`, `memory_update` + herramientas de gestión |
| `src/noise-filter.ts` | Filtra rechazos del agente, meta-preguntas, saludos y contenido de baja calidad |
| `src/adaptive-retrieval.ts` | Determina si una consulta necesita recuperación de memoria |
| `src/migrate.ts` | Migración desde el `memory-lancedb` integrado a Pro |
| `src/smart-extractor.ts` | Extracción de 6 categorías impulsada por LLM con almacenamiento en capas L0/L1/L2 y deduplicación en dos etapas |
| `src/decay-engine.ts` | Modelo de decaimiento exponencial estirado de Weibull |
| `src/tier-manager.ts` | Promoción/degradación de tres niveles: Peripheral ↔ Working ↔ Core |

</details>

---

## Apéndice del proyecto original OpenClaw

Este repositorio es un port. El proyecto original es **[CortexReach/memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)** — un plugin de OpenClaw. Todo lo que sigue documenta el uso original de OpenClaw; los usuarios de pi no lo necesitan.

### Qué cambió (diferencias del port)

| Área | OpenClaw (original) | Pi (este port) |
|---|---|---|
| Arranque de la extensión | `openclaw.plugin.json` / `openclaw.extensions` | `pi-adapter/index.ts` → compilado `dist/pi-adapter/index.js`, declarado mediante `pi.extensions` en `package.json` |
| Archivo de configuración | Entrada de plugin `openclaw.json` | `~/.pi/agent/memory-lancedb-pro.json5` (o `$MEMORY_LANCEDB_PRO_CONFIG`) — misma forma de documento |
| Directorio base de datos y sesiones | `~/.openclaw/...` | `~/.pi/agent/...` (anulable con `PI_CODING_AGENT_DIR` / `PI_AGENT_DIR`) |
| CLI | `openclaw memory-pro …` | Binario autónomo: `memory-pro …` (compilado desde `pi-adapter/cli-main.ts`) |
| Comando slash | CLI registrada por `openclaw` | `pi.registerCommand("/memory-pro", ...)` mediante el shim |
| Ejecutor de sub-agente embebido | API de runtime de OpenClaw | Delega en `pi --mode json --no-tools …` (`pi-adapter/pi-runner.ts`) |
| Organización de sesiones | `~/.openclaw/agents/<id>/sessions/*.jsonl` | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| Versión | `1.1.0-beta.11` | `1.1.0-beta.11-pi.1` |

Los eventos del ciclo de vida se mapean de los eventos de pi a los hooks de OpenClaw mediante `pi-adapter/shim.ts`: `input`, `session_start`, `before_agent_start`, `agent_end`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`. Las herramientas del plugin (`memory_store`, `memory_recall`, …) y el comando slash `/memory-pro` se registran a través del shim sin cambios.

### Inicio rápido original (solo OpenClaw)

```bash
# via OpenClaw CLI (recomendado)
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

Los comandos originales usan el prefijo `openclaw memory-pro ...`. Consulta el [README original](https://github.com/CortexReach/memory-lancedb-pro) para la documentación completa de OpenClaw.

### Ecosistema original

- **[Script de configuración](https://github.com/CortexReach/toolbox/tree/main/memory-lancedb-pro-setup)** — instalación/actualización/reparación con un clic para despliegues de OpenClaw (escribe `openclaw.json`)
- **[Skill de configuración guiada por IA](https://github.com/CortexReach/memory-lancedb-pro-skill)** — para agentes Claude Code / OpenClaw
- **Tutoriales en vídeo** — [YouTube](https://youtu.be/MtukF1C8epQ) · [Bilibili](https://www.bilibili.com/video/BV1zUf2BGEgn/)
- **Historial de estrellas** — [star-history.com](https://star-history.com/#CortexReach/memory-lancedb-pro&Date)

---

## Documentación

| Documento | Descripción |
| --- | --- |
| [Memory Architecture Analysis](docs/memory_architecture_analysis.md) | Análisis profundo de la arquitectura completa |
| [CHANGELOG v1.1.0](docs/CHANGELOG-v1.1.0.md) | Cambios de comportamiento v1.1.0 y justificación de la actualización |
| [Release Checklist](docs/release-checklist.md) | Pre-vuelo del paquete, prueba de publicación en seco y comprobaciones posteriores |
| [Long-Context Chunking](docs/long-context-chunking.md) | Estrategia de fragmentado para documentos largos |
| [Lock Management](docs/lock-management.md) | Detalles del bloqueo multi-escritor (Redis) |

## Tests

```bash
npm test                       # suite completa unit/e2e
node scripts/run-ci-tests.mjs --all   # manifeste CI completo
npm run test:pi-adapter        # prueba de humo del adaptador pi (API pi simulada)
```

Todos los tests originales se conservan; `test/pi-adapter-smoke.test.mjs` y `test:pi-adapter` son nuevos.

---

## Beta: Memoria inteligente v1.1.0

> Estado: Beta — disponible mediante `npm i memory-lancedb-pro@beta`. Los usuarios estables en `latest` no se ven afectados.

| Función | Descripción |
|---------|-------------|
| **Extracción inteligente** | Extracción de 6 categorías impulsada por LLM con metadatos L0/L1/L2. Recurre a expresiones regulares cuando está deshabilitada. |
| **Puntuación del ciclo de vida** | Decaimiento de Weibull integrado en la recuperación — los recuerdos de alta frecuencia y alta importancia se clasifican mejor. |
| **Gestión de niveles** | Sistema de tres niveles (Core → Working → Peripheral) con promoción/degradación automáticas. |

Comentarios: [GitHub Issues](https://github.com/CortexReach/memory-lancedb-pro/issues) · Revertir: `npm i memory-lancedb-pro@latest`

---

## Dependencias

| Paquete | Propósito |
| --- | --- |
| `@lancedb/lancedb` ≥0.26.2 | Base de datos vectorial (ANN + FTS) |
| `openai` ≥6.21.0 | Cliente de API de embeddings compatible con OpenAI |
| `@sinclair/typebox` 0.34.48 | Definiciones de tipos JSON Schema |

---

## Contribuidores

Mantenedores y contribuidores originales (consulta la [lista completa](https://github.com/CortexReach/memory-lancedb-pro/graphs/contributors)):

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
