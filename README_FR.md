<div align="center">

# 🧠 memory-lancedb-pro · Extension π Pi Coding Agent

**Assistant mémoire IA pour l'[agent de codage pi](https://github.com/earendil-works/pi)**

*Offrez à votre agent IA un cerveau qui se souvient réellement — entre les sessions, entre les projets, à travers le temps.*

Une extension mémoire basée sur LanceDB pour pi qui stocke préférences, décisions et contexte de projet, puis les rappelle automatiquement dans les futures sessions.

[![Pi Extension](https://img.shields.io/badge/Pi-Extension-blue)](https://github.com/earendil-works/pi)
[![Pi 0.80+](https://img.shields.io/badge/pi-0.80%2B-brightgreen)](https://github.com/earendil-works/pi)
[![LanceDB](https://img.shields.io/badge/LanceDB-Vectorstore-orange)](https://lancedb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) | [简体中文](README_CN.md) | [繁體中文](README_TW.md) | [日本語](README_JA.md) | [한국어](README_KO.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Deutsch](README_DE.md) | [Italiano](README_IT.md) | [Русский](README_RU.md) | [Português (Brasil)](README_PT-BR.md)

</div>

---

## 🤖 À propos de ce portage

Ce dépôt est un **portage pour l'agent de codage pi** du plugin mémoire de qualité production [memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro) (MIT). L'intégralité du cœur du plugin OpenClaw est inchangée et se charge sans modification via un adaptateur fin (`pi-adapter/`), si bien que pi (≥ 0.80) bénéficie du même moteur mémoire propulsé par LanceDB avec une divergence minimale par rapport à l'amont.

> Tout ce qui suit documente l'expérience pi. Voir l'[Annexe amont OpenClaw](#openclaw-upstream-appendix) en bas de page pour le tableau des différences de portage et l'usage original OpenClaw.

---

## Pourquoi memory-lancedb-pro ?

La plupart des agents IA souffrent d'amnésie. Ils oublient tout dès que vous démarrez une nouvelle conversation.

**memory-lancedb-pro** est une extension de mémoire à long terme de qualité production qui transforme votre agent en **Assistant Mémoire IA** — elle capture automatiquement ce qui compte, laisse le bruit s'estomper naturellement et récupère la bonne mémoire au bon moment. Aucun étiquetage manuel, aucune migraine de configuration.

### Votre Assistant Mémoire IA en action

**Sans mémoire — chaque session repart de zéro :**

> **Vous :** « Utilise des tabulations pour l'indentation, ajoute toujours la gestion des erreurs. »
> *(session suivante)*
> **Vous :** « Je te l'ai déjà dit — des tabulations, pas des espaces ! » 😤
> *(session suivante)*
> **Vous :** « ...sérieusement, des tabulations. Et la gestion des erreurs. Encore. »

**Avec memory-lancedb-pro — votre agent apprend et se souvient :**

> **Vous :** « Utilise des tabulations pour l'indentation, ajoute toujours la gestion des erreurs. »
> *(session suivante — l'agent rappelle automatiquement vos préférences)*
> **Agent :** *(applique silencieusement tabulations + gestion des erreurs)* ✅
> **Vous :** « Pourquoi avons-nous choisi PostgreSQL plutôt que MongoDB le mois dernier ? »
> **Agent :** « D'après notre discussion du 12 février, les principales raisons étaient... » ✅

Voilà la différence qu'apporte un **Assistant Mémoire IA** — il apprend votre style, rappelle les décisions passées et fournit des réponses personnalisées sans que vous ayez à vous répéter.

### Que peut-il faire d'autre ?

| | Ce que vous obtenez |
|---|---|
| **Capture automatique** | Votre agent apprend de chaque conversation — pas besoin de `memory_store` manuel |
| **Extraction intelligente** | Classification en 6 catégories propulsée par LLM : profils, préférences, entités, événements, cas, modèles |
| **Oubli intelligent** | Modèle de décroissance de Weibull — les souvenirs importants restent, le bruit s'estompe naturellement |
| **Récupération hybride** | Recherche vectorielle + texte intégral BM25, fusionnée avec un reclassement par cross-encoder |
| **Injection de contexte** | Les souvenirs pertinents remontent automatiquement avant chaque réponse |
| **Isolation multi-périmètres** | Limites mémoire par agent, par utilisateur, par projet |
| **Fournisseur au choix** | OpenAI, Jina, Gemini, Ollama, ou toute API compatible OpenAI |
| **Boîte à outils complète** | CLI, sauvegarde, migration, mise à niveau, export/import — prêt pour la production |

---

## Démarrage rapide

> **Configuration requise du CPU :** votre CPU doit prendre en charge les instructions **AVX**. La recherche vectorielle native de LanceDB peut nécessiter **AVX2** sur certaines versions Linux x64 et peut faire planter les CPU AVX uniquement avec un `SIGILL` ; définissez `retrieval.disableNativeCosine: true` ou `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` pour utiliser un balayage de lignes limité au périmètre plus un classement cosinus en JavaScript. Vérifiez les indicateurs CPU avec : `grep -o 'avx[^ ]*' /proc/cpuinfo | head -1` (aucune sortie = non pris en charge). Voir [#419](https://github.com/CortexReach/memory-lancedb-pro/issues/419) et [#644](https://github.com/CortexReach/memory-lancedb-pro/issues/644) pour plus de détails.

### 1. Construire l'extension

```bash
git clone https://github.com/lhxyzCJ/TestForPi-memory-lancedb-pro
cd TestForPi-memory-lancedb-pro && npm install && npm run build
```

Le point d'entrée pi est `dist/pi-adapter/index.js` (compilé depuis `pi-adapter/index.ts`).

### 2. Enregistrer l'extension

Choisissez l'une des options :

**A. Via le fichier de paramètres de pi (global, tous les projets) :**

Ajoutez à `~/.pi/agent/settings.json` :

```json
{
  "extensions": [
    "/absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js"
  ]
}
```

**B. Via le gestionnaire de paquets de pi :**

```bash
pi install /absolute/path/to/TestForPi-memory-lancedb-pro
```

**C. Test rapide pour une seule session :**

```bash
pi -e /absolute/path/to/TestForPi-memory-lancedb-pro/dist/pi-adapter/index.js
```

**D. Auto-découverte (aucun changement de paramètres) :** déposez l'extension construite (ou un `package.json` avec un champ `pi.extensions`) dans `~/.pi/agent/extensions/` (global) ou `.pi/extensions/` (local au projet) puis redémarrez pi.

### 3. Créer le fichier de configuration

Créez `~/.pi/agent/memory-lancedb-pro.json5` (vous pouvez aussi utiliser `.json`, ou pointer ailleurs avec `$MEMORY_LANCEDB_PRO_CONFIG`) :

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

> La forme du document de configuration est identique à l'entrée du plugin OpenClaw amont — l'objet interne nu ci-dessus ainsi qu'un wrapper `{ "config": { ... } }` sont tous deux acceptés.

### 4. Vérifier

Démarrez une session pi et consultez le journal de démarrage :

```
memory-lancedb-pro: smart extraction enabled
memory-lancedb-pro@...: plugin registered (db: /root/.pi-agent/memory/lancedb-pro, ...)
```

Demandez ensuite à votre agent de mémoriser et de rappeler quelque chose :

> **Vous :** « Retiens : je préfère les tabulations aux espaces. »
> **Vous :** « Quelles sont mes préférences d'indentation ? »

### Pourquoi ces valeurs par défaut ?

- `autoCapture` + `smartExtraction` → votre agent apprend de chaque conversation automatiquement
- `autoRecall` → les souvenirs pertinents sont injectés avant chaque réponse
- `extractMinMessages: 2` → l'extraction se déclenche dans les conversations normales à deux tours
- `sessionMemory.enabled: false` → évite de polluer la récupération avec des résumés de session dès le premier jour

---

## ⚠️ Architecture mémoire (important)

L'extension expose une capacité mémoire avec deux magasins coordonnés :

| Couche mémoire | Stockage | À quoi ça sert | Rappelable ? |
|---|---|---|---|
| **Mémoire du plugin** | LanceDB (magasin vectoriel) | Rappel sémantique via `memory_recall` / rappel automatique | ✅ Oui |
| **Corpus canonique** | `MEMORY.md`, `memory/**/*.md`, transcriptions de sessions récentes, `memory/dreaming/**/*.md` | Fichiers sources de vérité et artefacts publics | ✅ Via l'index sémantique LanceDB quand `canonicalCorpus.enabled` est vrai |

**Principe clé :**
> Les fichiers canoniques restent la source de vérité. LanceDB est l'index sémantique utilisé pour les récupérer avec des chemins ancrés, des plages de lignes, des extraits et des citations.

**Ce que cela signifie pour vous :**
- Besoin d'un rappel sémantique ? → Utilisez `memory_store` ou laissez la capture automatique s'en charger
- `memory/YYYY-MM-DD.md` → traitez-le comme un **journal quotidien / journal de bord** qui peut aussi être indexé pour la recherche sémantique
- `MEMORY.md` → référence humaine organisée qui peut être indexée comme contexte canonique
- `memory/dreaming/**/*.md` → rapports de rêve exposés comme artefacts publics et indexés comme contexte de réflexion
- Transcriptions JSONL de sessions → indexées comme `source: "sessions"` quand `canonicalCorpus.includeSessionTranscripts` est activé
- Mémoire du plugin → chemin d'écriture principal pour les faits durables, préférences, décisions et souvenirs capturés automatiquement

### Où vivent les données (pi)

| Quoi | Chemin |
|---|---|
| Base de données du plugin (LanceDB) | `~/.pi/agent/memory/lancedb-pro` (ou `$MEMORY_LANCEDB_PRO_DB_PATH`) |
| Miroir Markdown | `~/.pi/agent/memory/md-mirror` (ou `$MEMORY_LANCEDB_PRO_MD_MIRROR_DIR`) |
| Transcriptions de sessions | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| Compétences globales | `~/.pi/agent/skills` |

Le répertoire de base est `~/.pi/agent` ; remplacez-le avec `PI_CODING_AGENT_DIR` ou `PI_AGENT_DIR`. Les chemins relatifs de la configuration (`dbPath`, `mdMirrorDir`, ...) sont résolus par rapport au répertoire d'accueil de l'agent pi.

### Emplacements du fichier de configuration (par ordre de priorité)

1. `$MEMORY_LANCEDB_PRO_CONFIG` (chemin explicite)
2. `~/.pi/agent/memory-lancedb-pro.json5`
3. `~/.pi/agent/memory-lancedb-pro.json`

Si aucun fichier de configuration n'est trouvé, l'extension journalise un avertissement et reste désactivée — une configuration cassée ou manquante ne fait jamais tomber la session pi.

---

## Fonctionnalités principales

### Récupération hybride

```
Query → embedQuery() ─┐
                       ├─→ Hybrid Fusion → Rerank → Lifecycle Decay Boost → Length Norm → Filter
Query → BM25 FTS ─────┘
```

- **Recherche vectorielle** — similarité sémantique via l'ANN de LanceDB (distance cosinus)
- **Recherche en texte intégral BM25** — correspondance exacte de mots-clés via l'index FTS de LanceDB
- **Fusion hybride** — score vectoriel comme base, les correspondances BM25 reçoivent un boost pondéré (pas un RRF standard — réglé pour une qualité de rappel réelle)
- **Pondérations configurables** — `vectorWeight`, `bm25Weight`, `minScore`

### Reclassement par cross-encoder

- Adaptateurs intégrés pour **Jina**, **SiliconFlow**, **Voyage AI** et **Pinecone**
- Compatible avec tout point de terminaison compatible Jina (par ex., Hugging Face TEI, DashScope)
- Scoring hybride : 60 % cross-encoder + 40 % score fusionné d'origine
- Dégradation gracieuse : repli sur la similarité cosinus en cas d'échec de l'API

### Pipeline de scoring multi-étapes

| Étape | Effet |
| --- | --- |
| **Fusion hybride** | Combine rappel sémantique et correspondance exacte |
| **Reclassement cross-encoder** | Favorise les correspondances sémantiquement précises |
| **Boost de décroissance du cycle de vie** | Fraîcheur de Weibull + fréquence d'accès + importance × confiance |
| **Normalisation de longueur** | Empêche les entrées longues de dominer (ancre : 500 caractères) |
| **Score minimal strict** | Élimine les résultats non pertinents (défaut : 0,35) |
| **Diversité MMR** | Similarité cosinus > 0,85 → rétrogradé |

### Extraction intelligente des souvenirs (v1.1.0)

- **Extraction en 6 catégories propulsée par LLM** : profil, préférences, entités, événements, cas, modèles
- **Stockage en couches L0/L1/L2** : L0 (index d'une phrase) → L1 (résumé structuré) → L2 (récit complet)
- **Déduplication en deux étapes** : pré-filtre par similarité vectorielle (≥ 0,7) → décision sémantique du LLM (CREATE/MERGE/SKIP)
- **Fusion consciente de la catégorie** : `profile` fusionne toujours, `events`/`cases` sont en ajout seul

### Gestion du cycle de vie des souvenirs (v1.1.0)

- **Moteur de décroissance de Weibull** : score composite = récence + fréquence + valeur intrinsèque
- **Promotion à trois niveaux** : `Peripheral ↔ Working ↔ Core` avec seuils configurables
- **Renforcement par accès** : les souvenirs fréquemment rappelés se dégradent plus lentement (style répétition espacée)
- **Demi-vie modulée par l'importance** : les souvenirs importants se dégradent plus lentement

### Isolation multi-périmètres

- Périmètres intégrés : `global`, `agent:<id>`, `custom:<name>`, `project:<id>`, `user:<id>`
- Contrôle d'accès au niveau agent via `scopes.agentAccess`
- Par défaut : chaque agent accède à `global` + son propre périmètre `agent:<id>`
- Les outils en lecture seule tels que `memory_recall`, `memory_search`, `memory_list` et `memory_debug` échouent en douceur lorsqu'un périmètre demandé est inaccessible : ils recherchent dans les périmètres accessibles de l'appelant et renvoient `ignoredScope` plus `accessibleScopes` dans les détails. Les outils d'écriture et de mutation renvoient toujours `scope_access_denied` pour les périmètres inaccessibles.

### Capture automatique et rappel automatique

- **Capture automatique** (`agent_end`) : extrait préférence/fait/décision/entité des conversations, déduplique, stocke jusqu'à 3 par tour
- **Rappel automatique** (avant chaque construction d'invite) : injecte le contexte `<relevant-memories>` (jusqu'à 3 entrées)

> **Remarque :** sur pi, ces hooks OpenClaw (`agent_end`, `before_prompt_build`, ...) sont mappés depuis les événements du cycle de vie pi (`agent_end`, `input`, `session_start`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`) par `pi-adapter/shim.ts`.

### Filtrage du bruit et récupération adaptative

- Filtre le contenu de faible qualité : refus de l'agent, méta-questions, salutations
- Ignore la récupération pour les salutations, les commandes slash, les confirmations simples, les emojis
- Force la récupération pour les mots-clés mémoire (« remember », « previously », « last time »)
- Seuils adaptés au CJK (chinois : 6 caractères vs anglais : 15 caractères)

---

<details>
<summary><strong>Comparaison avec le <code>memory-lancedb</code> intégré (cliquer pour déplier)</strong></summary>

| Fonctionnalité | `memory-lancedb` intégré | **memory-lancedb-pro** |
| --- | :---: | :---: |
| Recherche vectorielle | Oui | Oui |
| Recherche texte intégral BM25 | - | Oui |
| Fusion hybride (Vector + BM25) | - | Oui |
| Reclassement cross-encoder (multi-fournisseur) | - | Oui |
| Boost de récence et décroissance temporelle | - | Oui |
| Normalisation de longueur | - | Oui |
| Diversité MMR | - | Oui |
| Isolation multi-périmètres | - | Oui |
| Filtrage du bruit | - | Oui |
| Récupération adaptative | - | Oui |
| CLI de gestion | - | Oui |
| Mémoire de session | - | Oui |
| Embeddings conscients de la tâche | - | Oui |
| **Extraction intelligente LLM (6 catégories)** | - | Oui (v1.1.0) |
| **Décroissance de Weibull + promotion de niveau** | - | Oui (v1.1.0) |
| Tout embedding compatible OpenAI | Limité | Oui |

</details>

---

## Configuration

Toute la configuration vit dans `~/.pi/agent/memory-lancedb-pro.json5` (ou `$MEMORY_LANCEDB_PRO_CONFIG`).

Les champs de clé API (`embedding.apiKey`, `retrieval.rerankApiKey` et `llm.apiKey`) acceptent des chaînes simples, des espaces réservés `${ENV_VAR}` ou des objets SecretRef. Ce plugin prend en charge les sources SecretRef `env` et `file` :

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

Pour `source: "file"`, `id` est résolu par rapport au répertoire d'accueil de l'agent pi et lu comme un fichier UTF-8. Le champ facultatif `provider` est accepté pour la compatibilité avec la forme objet SecretRef mais n'est pas utilisé pour la sélection du fournisseur. Les sources SecretRef `exec` et autres sont rejetées par la validation de configuration au moment de l'exécution.

<details>
<summary><strong>Exemple de configuration complet</strong></summary>

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
<summary><strong>Fournisseurs d'embeddings</strong></summary>

Fonctionne avec les **API d'embeddings compatibles OpenAI**, y compris les adaptateurs de charge utile spécifiques aux fournisseurs pour des services tels que Jina et Voyage :

| Fournisseur | Modèle | URL de base | Dimensions |
| --- | --- | --- | --- |
| **Jina** (recommandé) | `jina-embeddings-v5-text-small` | `https://api.jina.ai/v1` | 1024 |
| **OpenAI** | `text-embedding-3-small` | `https://api.openai.com/v1` | 1536 |
| **Voyage** | `voyage-4-lite` / `voyage-4` | `https://api.voyageai.com/v1` | 1024 / 1024 |
| **Google Gemini** | `gemini-embedding-001` | `https://generativelanguage.googleapis.com/v1beta/openai/` | 3072 |
| **Ollama** (local) | `nomic-embed-text` | `http://localhost:11434/v1` | spécifique au fournisseur |

Les requêtes d'embeddings Voyage utilisent la forme de charge utile `model` + `input` de Voyage. Lorsque `requestDimensions` est configuré, il est envoyé comme `output_dimension` ; les champs propres à OpenAI tels que `encoding_format` sont omis.

Définissez `embedding.maxInputChars` pour les serveurs d'embeddings locaux avec de petits contextes ou des limites de lots. Le plugin applique une valeur par défaut prudente pour `nomic-embed-text` ; avec le découpage automatique activé, les documents plus longs sont fragmentés avant que le plafond ne soit appliqué à chaque requête de fournisseur.

</details>

<details>
<summary><strong>Fournisseurs de reclassement</strong></summary>

Le reclassement par cross-encoder prend en charge plusieurs fournisseurs via `rerankProvider` :

| Fournisseur | `rerankProvider` | Modèle d'exemple |
| --- | --- | --- |
| **Jina** (défaut) | `jina` | `jina-reranker-v3` |
| **SiliconFlow** (offre gratuite disponible) | `siliconflow` | `BAAI/bge-reranker-v2-m3` |
| **Voyage AI** | `voyage` | `rerank-2.5` |
| **Pinecone** | `pinecone` | `bge-reranker-v2-m3` |

Tout point de terminaison de reclassement compatible Jina fonctionne aussi — définissez `rerankProvider: "jina"` et pointez `rerankEndpoint` vers votre service (par ex., Hugging Face TEI, DashScope `qwen3-rerank`).

</details>

<details>
<summary><strong>Extraction intelligente (LLM) — v1.1.0</strong></summary>

Lorsque `smartExtraction` est activé (défaut : `true`), le plugin utilise un LLM pour extraire et classer intelligemment les souvenirs au lieu de déclencheurs basés sur des expressions régulières.

| Champ | Type | Défaut | Description |
|-------|------|---------|-------------|
| `smartExtraction` | booléen | `true` | Active/désactive l'extraction en 6 catégories propulsée par LLM |
| `llm.auth` | chaîne | `api-key` | `api-key` utilise `llm.apiKey` / `embedding.apiKey` ; `oauth` utilise un fichier de jeton OAuth propre au plugin par défaut |
| `llm.apiKey` | chaîne | *(repli sur `embedding.apiKey`)* | Clé API du fournisseur LLM |
| `llm.model` | chaîne | `openai/gpt-oss-120b` | Nom du modèle LLM |
| `llm.baseURL` | chaîne | *(repli sur `embedding.baseURL`)* | Point de terminaison de l'API LLM |
| `llm.oauthProvider` | chaîne | `openai-codex` | Identifiant du fournisseur OAuth utilisé quand `llm.auth` est `oauth` |
| `llm.oauthPath` | chaîne | `~/.pi/agent/.memory-lancedb-pro/oauth.json` | Fichier de jeton OAuth utilisé quand `llm.auth` est `oauth` |
| `llm.timeoutMs` | nombre | `30000` | Délai d'attente des requêtes LLM en millisecondes |
| `extractMinMessages` | nombre | `2` | Nombre minimal de messages avant le déclenchement de l'extraction |
| `extractMaxChars` | nombre | `8000` | Nombre maximal de caractères envoyés au LLM |

Config `llm` OAuth (utilisez un cache de connexion Codex / ChatGPT existant pour les appels LLM) :

> **Remarque :** les flux OAuth sont hérités du plugin OpenClaw amont. Sur pi, `memory-pro auth login` délègue à la même logique OAuth ; le fichier de jeton est par défaut `~/.pi/agent/.memory-lancedb-pro/oauth.json`.

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

Remarques pour `llm.auth: "oauth"` :

- `llm.oauthProvider` est actuellement `openai-codex`.
- Les jetons OAuth sont par défaut dans `~/.pi/agent/.memory-lancedb-pro/oauth.json`.
- Vous pouvez définir `llm.oauthPath` si vous souhaitez stocker ce fichier ailleurs.
- `auth login` fait une copie de la configuration `llm` api-key précédente à côté du fichier OAuth, et `auth logout` restaure cette copie lorsqu'elle existe.
- Passer de `api-key` à `oauth` ne reporte pas automatiquement `llm.baseURL`. Définissez-le manuellement en mode OAuth uniquement si vous voulez délibérément un backend compatible ChatGPT/Codex personnalisé.

</details>

<details>
<summary><strong>Repli CPU hérité</strong></summary>

Si un hôte Linux x64 AVX uniquement plante dans la recherche vectorielle native de LanceDB avec un `SIGILL`, désactivez le cosinus natif et laissez memory-lancedb-pro balayer les lignes du périmètre et les classer en JavaScript :

```json5
{
  retrieval: {
    disableNativeCosine: true
  }
}
```

Vous pouvez aussi définir `MEMORY_LANCEDB_DISABLE_NATIVE_COSINE=1` pour le même comportement.

</details>

<details>
<summary><strong>Configuration du cycle de vie (décroissance + niveau)</strong></summary>

| Champ | Défaut | Description |
|-------|---------|-------------|
| `decay.recencyHalfLifeDays` | `30` | Demi-vie de base pour la décroissance de récence de Weibull |
| `decay.frequencyWeight` | `0.3` | Poids de la fréquence d'accès dans le score composite |
| `decay.intrinsicWeight` | `0.3` | Poids de `importance × confidence` |
| `decay.betaCore` | `0.8` | Bêta de Weibull pour les souvenirs `core` |
| `decay.betaWorking` | `1.0` | Bêta de Weibull pour les souvenirs `working` |
| `decay.betaPeripheral` | `1.3` | Bêta de Weibull pour les souvenirs `peripheral` |
| `tier.coreAccessThreshold` | `10` | Nombre minimal de rappels avant promotion vers `core` |
| `tier.peripheralAgeDays` | `60` | Seuil d'âge pour rétrograder les souvenirs obsolètes |

</details>

<details>
<summary><strong>Renforcement par accès</strong></summary>

Les souvenirs fréquemment rappelés se dégradent plus lentement (style répétition espacée).

Clés de configuration (sous `retrieval`) :
- `reinforcementFactor` (0-2, défaut : `0.5`) — définissez `0` pour désactiver
- `maxHalfLifeMultiplier` (1-10, défaut : `3`) — plafond strict de la demi-vie effective

</details>

---

## Commandes CLI

Le binaire `memory-pro` est disponible après `npm run build` :

```bash
npm link   # une fois, pour exposer le binaire "memory-pro" globalement
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

Dans une session pi, la même surface de gestion est disponible via la commande slash **`/memory-pro`**.

> La CLI lit le même fichier de configuration que l'extension (`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `~/.pi/agent/memory-lancedb-pro.json`).

Flux de connexion OAuth :

1. Exécutez `memory-pro auth login`
2. Si `--provider` est omis dans un terminal interactif, la CLI affiche un sélecteur de fournisseur OAuth avant d'ouvrir le navigateur
3. La commande imprime une URL d'autorisation et ouvre votre navigateur sauf si `--no-browser` est défini
4. Après la réussite du rappel, la commande enregistre le fichier OAuth du plugin (défaut : `~/.pi/agent/.memory-lancedb-pro/oauth.json`), fait une copie de la configuration `llm` api-key précédente pour la déconnexion, et remplace la configuration `llm` du plugin par les paramètres OAuth (`auth`, `oauthProvider`, `model`, `oauthPath`)
5. `memory-pro auth logout` supprime ce fichier OAuth et restaure la configuration `llm` api-key précédente lorsque cette copie existe

---

## Sujets avancés

<details>
<summary><strong>Mise à niveau depuis une version antérieure du portage</strong></summary>

```bash
# 1) Sauvegarde
memory-pro export --scope global --output memories-backup.json
# 2) Essai à blanc
memory-pro upgrade --dry-run
# 3) Lancer la mise à niveau
memory-pro upgrade
# 4) Vérifier
memory-pro stats
```

Consultez `CHANGELOG-v1.1.0.md` pour les changements de comportement et la justification de la mise à niveau.

**Activer les indications de tâche Jina sur une base existante ?**

Les indications de tâche sont deux clés de configuration sous le bloc `embedding` :

```json5
{
  embedding: {
    model: "jina-embeddings-v5-text-small",
    taskQuery: "retrieval.query",
    taskPassage: "retrieval.passage"
  }
}
```

Elles n'affectent que les vecteurs écrits *après* leur définition. Les lignes déjà présentes dans votre magasin ont été embarquées sans indication de tâche, donc une requête embarquée avec `retrieval.query` est comparée à des passages qui vivent dans un espace vectoriel différent — vous n'obtenez qu'environ la moitié du bénéfice, en silence.

Pour corriger les lignes existantes, ré-embarquez dans une **base fraîche et basculez dessus**. Ne ré-embarquez **pas** sur place : `reembed` écrit chaque ligne avec `table.add()` (ajout par id, pas remplacement), donc une exécution sur place — exactement ce que `--force` déverrouille — laisse l'ancien vecteur à côté du nouveau et **double chaque ligne** ; les nouvelles tentatives s'empilent. Pour cette raison, `reembed` refuse les exécutions sur le même chemin sauf si vous le forcez.

```bash
# 0) Assurez-vous qu'aucune session pi n'écrit en pleine migration.

# 1) Sauvegardez tout le magasin — une vraie copie du système de fichiers du
#    répertoire LanceDB.
#    (Ne comptez PAS sur `memory-pro export` : il est limité par défaut à
#    --limit 1000 et un seul --scope, donc il supprime silencieusement les
#    lignes au-delà de 1000 et tous les périmètres non globaux.)
cp -r <your dbPath> <your dbPath>.bak

# 2) Dans le fichier de configuration, définissez les indications de tâche ET
#    pointez `dbPath` vers une nouvelle cible vide (par ex. "<your dbPath>-v2").
#    Une cible fraîche est aussi ce qui vous permet de changer
#    `embedding.dimensions` : une nouvelle largeur de vecteur ne peut aller que
#    dans une nouvelle table.

# 3) Essai à blanc — lit la source, affiche le nombre de lignes, n'écrit rien.
memory-pro reembed --source-db <old dbPath> --dry-run

# 4) Ré-embarquez ancien -> nouveau avec les indications de tâche désormais
#    actuelles. Source != cible, donc chaque id atterrit exactement une fois.
#    Peut être relancé avec --skip-existing en cas d'interruption.
memory-pro reembed --source-db <old dbPath>

# 5) Vérifiez avant de faire confiance à la bascule : le nombre "imported" et
#    `memory-pro stats` sur le nouveau dbPath doivent égaler le nombre de
#    lignes de l'essai à blanc.
memory-pro stats

# 6) Redémarrez pi ; il ouvre désormais le nouveau dbPath.
```

La même bascule s'applique chaque fois que vous changez `embedding.model` ou `embedding.dimensions` — ré-embarquez toujours dans un `dbPath` frais, jamais sur place.

</details>

<details>
<summary><strong>Verrouillage et rédacteurs concurrents</strong></summary>

`memory-lancedb-pro` utilise un verrou de fichier inter-processus pour les écritures LanceDB. Cela suffit pour les sessions pi concurrentes et les processus locaux qui partagent le même répertoire de base de données.

Redis n'est pas requis pour ces déploiements. Le verrouillage Redis est activé quand `locking.redis.enabled` est vrai, quand `redisUrl`/`locking.redis.url` est défini, ou quand `MEMORY_LANCEDB_REDIS_URL` est présent dans l'environnement de ce processus. Pour les rédacteurs multi-machines ou multi-conteneurs, lisez [Lock Management](docs/lock-management.md) avant de partager un répertoire LanceDB entre processus, et assurez-vous que chaque rédacteur utilise la même configuration de verrouillage.

</details>

<details>
<summary><strong>Si les souvenirs injectés apparaissent dans les réponses</strong></summary>

Parfois, le modèle peut refléter le bloc `<relevant-memories>` injecté.

**Option A (risque le plus faible) :** désactivez temporairement le rappel automatique :
```json5
{ autoRecall: false }
```

**Option B (préférée) :** gardez le rappel, ajoutez à l'invite système de votre agent / `AGENTS.md` :
> Ne révélez ni ne citez aucun contenu `<relevant-memories>` / d'injection de mémoire dans vos réponses. Utilisez-le uniquement comme référence interne.

**Option C (pour les agents d'arrière-plan / par lots) :** excluez des agents spécifiques de l'injection de rappel automatique :
```json5
{
  autoRecall: true,
  autoRecallExcludeAgents: ["memory-distiller", "my-cron-agent"]
}
```
Utile pour les agents d'arrière-plan (par ex. memory-distiller, travaux cron) dont la sortie ne doit pas être contaminée par le contexte mémoire injecté.

</details>

<details>
<summary><strong>Réglage du délai d'attente du rappel automatique</strong></summary>

Le rappel automatique a un délai d'attente configurable (défaut 5 s) pour éviter de bloquer le démarrage de l'agent. Si vous êtes derrière un proxy ou utilisez une API d'embeddings à haute latence, augmentez-le :

```json5
{ autoRecallTimeoutMs: 8000 }
```

Si le rappel automatique dépasse régulièrement le délai, vérifiez d'abord la latence de votre API d'embeddings. Le délai n'affecte que le chemin d'injection automatique — les appels manuels à l'outil `memory_recall` ne sont pas concernés.

</details>

<details>
<summary><strong>Modèle de coût du reclassement du rappel automatique</strong></summary>

Quand `autoRecall=true` et que la récupération hybride utilise `retrieval.rerank="cross-encoder"` avec une API de reclassement externe comme Jina, chaque invite éligible peut déclencher une requête de reclassement. Le nombre de documents envoyés à cette requête est régi par la limite de récupération du rappel automatique et la fenêtre d'entrée de reclassement du récupérateur, pas directement par `retrieval.candidatePoolSize` ni par le plafond d'injection final `autoRecallMaxItems`.

Par exemple, avec `autoRecallMaxItems: 3`, le rappel automatique demande 6 éléments à la récupération et la récupération hybride peut envoyer jusqu'à 12 candidats au reclasseur externe avant d'injecter au plus 3 souvenirs. Pour réduire l'utilisation du reclassement externe, baissez `autoRecallMaxItems` ou `maxRecallPerTurn`, passez `retrieval.rerank` à `"lightweight"` ou `"none"`, augmentez `autoRecallMinLength`, ou gardez le rappel automatique désactivé et utilisez `memory_recall` manuel là où c'est approprié.

Les journaux de démarrage avertissent quand le rappel automatique plus le reclassement hybride par cross-encoder peut envoyer plus d'éléments au reclasser qu'il n'en injectera. Les statistiques de débogage du rappel automatique incluent le `rerankInput`, `rerankInputLimit`, `retrieveLimit`, `rerank`, `rerankProvider` réels et le `retrievalCandidatePoolSize` configuré.

</details>

<details>
<summary><strong>Mémoire de session</strong></summary>

- Déclenchée sur les événements de nouvelle session — enregistre le résumé de la session précédente dans LanceDB
- Désactivée par défaut (pi persiste déjà les transcriptions de sessions `.jsonl`)
- Nombre de messages configurable (défaut : 15)

</details>

<details>
<summary><strong>Commandes slash personnalisées (par ex. /lesson)</strong></summary>

Ajoutez à votre `AGENTS.md` ou à l'invite système :

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
<summary><strong>Règles de fer pour les agents IA</strong></summary>

> Copiez le bloc ci-dessous dans votre `AGENTS.md` pour que votre agent applique ces règles automatiquement.

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
<summary><strong>Schéma de base de données</strong></summary>

Table LanceDB `memories` :

| Champ | Type | Description |
| --- | --- | --- |
| `id` | string (UUID) | Clé primaire |
| `text` | string | Texte du souvenir (indexé FTS) |
| `vector` | float[] | Vecteur d'embedding |
| `category` | string | Catégorie de stockage : `preference` / `fact` / `decision` / `entity` / `reflection` / `other` |
| `scope` | string | Identifiant de périmètre (par ex., `global`, `agent:main`) |
| `importance` | float | Score d'importance 0-1 |
| `timestamp` | int64 | Horodatage de création (ms) |
| `metadata` | string (JSON) | Métadonnées étendues |

Clés `metadata` courantes en v1.1.0 : `l0_abstract`, `l1_overview`, `l2_content`, `memory_category`, `tier`, `access_count`, `confidence`, `last_accessed_at`

> **Remarque sur les catégories :** le champ `category` de premier niveau utilise 6 catégories de stockage. Les 6 étiquettes sémantiques de l'extraction intelligente (`profile` / `preferences` / `entities` / `events` / `cases` / `patterns`) sont stockées dans `metadata.memory_category`.

</details>

<details>
<summary><strong>Dépannage</strong></summary>

**L'extension ne se charge pas / « no config file found »**

Créez `~/.pi/agent/memory-lancedb-pro.json5` ou définissez `$MEMORY_LANCEDB_PRO_CONFIG`. L'extension imprime un avertissement avec la forme attendue et reste désactivée — pi continue de fonctionner.

**Échec de l'initialisation de l'extraction intelligente**

Vérifiez que `llm.apiKey` / `${ENV_VAR}` est défini ; le plugin se replie sur l'extraction par expressions régulières plutôt que d'échouer.

**« Cannot mix BigInt and other types » (LanceDB / Apache Arrow)**

Sur LanceDB 0.26+, certaines colonnes numériques peuvent être renvoyées comme `BigInt`. Mettez à niveau vers **memory-lancedb-pro >= 1.0.14** — ce plugin convertit désormais les valeurs avec `Number(...)` avant les calculs.

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

> Pour une analyse approfondie de l'architecture complète, voir [docs/memory_architecture_analysis.md](docs/memory_architecture_analysis.md).

<details>
<summary><strong>Référence des fichiers (cliquer pour déplier)</strong></summary>

| Fichier | Rôle |
| --- | --- |
| `pi-adapter/index.ts` | Point d'entrée pi : charge le fichier de configuration, construit le shim de l'API OpenClaw, enregistre le cœur du plugin |
| `pi-adapter/shim.ts` | Mappe les événements / outils / commandes du cycle de vie pi vers l'API du plugin OpenClaw |
| `pi-adapter/config.ts` | Chargement du fichier de configuration (`$MEMORY_LANCEDB_PRO_CONFIG` → `~/.pi/agent/memory-lancedb-pro.json5` → `.json`) |
| `pi-adapter/paths.ts` | Résolution des chemins pi (`~/.pi/agent`, remplacements par variables d'environnement) |
| `pi-adapter/pi-runner.ts` | Exécuteur de sous-agent embarqué via `pi --mode json --no-tools ...` |
| `pi-adapter/cli-main.ts` | Point d'entrée CLI autonome `memory-pro` |
| `index.ts` | Entrée du cœur du plugin : analyse de configuration, hooks de cycle de vie, enregistrement de la capacité mémoire |
| `src/store.ts` | Couche de stockage LanceDB. Création de table / indexation FTS / recherche vectorielle / recherche BM25 / CRUD |
| `src/embedder.ts` | Abstraction d'embedding. Compatible avec tout fournisseur d'API compatible OpenAI |
| `src/retriever.ts` | Moteur de récupération hybride. Vectoriel + BM25 → fusion hybride → reclassement → décroissance du cycle de vie → filtrage |
| `src/scopes.ts` | Contrôle d'accès multi-périmètres |
| `src/tools.ts` | Définitions des outils agent : `memory_recall`, `memory_store`, `memory_forget`, `memory_update` + outils de gestion |
| `src/noise-filter.ts` | Filtre les refus de l'agent, les méta-questions, les salutations et le contenu de faible qualité |
| `src/adaptive-retrieval.ts` | Détermine si une requête a besoin d'une récupération mémoire |
| `src/migrate.ts` | Migration depuis le `memory-lancedb` intégré vers Pro |
| `src/smart-extractor.ts` | Extraction en 6 catégories propulsée par LLM avec stockage en couches L0/L1/L2 et déduplication en deux étapes |
| `src/decay-engine.ts` | Modèle de décroissance exponentielle étirée de Weibull |
| `src/tier-manager.ts` | Promotion/rétrogradation à trois niveaux : Peripheral ↔ Working ↔ Core |

</details>

---

## Annexe amont OpenClaw

Ce dépôt est un portage. Le projet amont est **[CortexReach/memory-lancedb-pro](https://github.com/CortexReach/memory-lancedb-pro)** — un plugin OpenClaw. Tout ce qui suit documente l'usage OpenClaw amont ; les utilisateurs de pi n'en ont pas besoin.

### Ce qui a changé (différences de portage)

| Domaine | OpenClaw (amont) | Pi (ce portage) |
|---|---|---|
| Amorçage de l'extension | `openclaw.plugin.json` / `openclaw.extensions` | `pi-adapter/index.ts` → compilé `dist/pi-adapter/index.js`, déclaré via `pi.extensions` dans `package.json` |
| Fichier de configuration | Entrée de plugin `openclaw.json` | `~/.pi/agent/memory-lancedb-pro.json5` (ou `$MEMORY_LANCEDB_PRO_CONFIG`) — même forme de document |
| Répertoire de base données & sessions | `~/.openclaw/...` | `~/.pi/agent/...` (remplaçable avec `PI_CODING_AGENT_DIR` / `PI_AGENT_DIR`) |
| CLI | `openclaw memory-pro …` | Binaire autonome : `memory-pro …` (compilé depuis `pi-adapter/cli-main.ts`) |
| Commande slash | CLI enregistrée par `openclaw` | `pi.registerCommand("/memory-pro", ...)` via le shim |
| Exécuteur de sous-agent embarqué | API runtime OpenClaw | Délègue à `pi --mode json --no-tools …` (`pi-adapter/pi-runner.ts`) |
| Organisation des sessions | `~/.openclaw/agents/<id>/sessions/*.jsonl` | `~/.pi/agent/sessions/--<cwd>--/*.jsonl` |
| Version | `1.1.0-beta.11` | `1.1.0-beta.11-pi.1` |

Les événements du cycle de vie sont mappés des événements pi vers les hooks OpenClaw via `pi-adapter/shim.ts` : `input`, `session_start`, `before_agent_start`, `agent_end`, `session_shutdown`, `tool_result`, `session_before_switch`, `session_before_fork`. Les outils du plugin (`memory_store`, `memory_recall`, …) et la commande slash `/memory-pro` s'enregistrent à travers le shim sans modification.

### Démarrage rapide amont (OpenClaw uniquement)

```bash
# via OpenClaw CLI (recommandé)
openclaw plugins install memory-lancedb-pro@beta

# ou via npm
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

Les commandes amont utilisent le préfixe `openclaw memory-pro ...`. Consultez le [README amont](https://github.com/CortexReach/memory-lancedb-pro) pour la documentation OpenClaw complète.

### Écosystème amont

- **[Script d'installation](https://github.com/CortexReach/toolbox/tree/main/memory-lancedb-pro-setup)** — installation/mise à niveau/réparation en un clic pour les déploiements OpenClaw (écrit `openclaw.json`)
- **[Compétence de configuration guidée par IA](https://github.com/CortexReach/memory-lancedb-pro-skill)** — pour les agents Claude Code / OpenClaw
- **Tutoriels vidéo** — [YouTube](https://youtu.be/MtukF1C8epQ) · [Bilibili](https://www.bilibili.com/video/BV1zUf2BGEgn/)
- **Historique d'étoiles** — [star-history.com](https://star-history.com/#CortexReach/memory-lancedb-pro&Date)

---

## Documentation

| Document | Description |
| --- | --- |
| [Memory Architecture Analysis](docs/memory_architecture_analysis.md) | Analyse approfondie de l'architecture complète |
| [CHANGELOG v1.1.0](docs/CHANGELOG-v1.1.0.md) | Changements de comportement v1.1.0 et justification de la mise à niveau |
| [Release Checklist](docs/release-checklist.md) | Pré-vol du paquet, essai de publication à blanc et vérifications post-publication |
| [Long-Context Chunking](docs/long-context-chunking.md) | Stratégie de découpage pour les documents longs |
| [Lock Management](docs/lock-management.md) | Détails du verrouillage multi-rédacteurs (Redis) |

## Tests

```bash
npm test                       # suite complète unitaire/e2e
node scripts/run-ci-tests.mjs --all   # manifeste CI complet
npm run test:pi-adapter        # test de fumée de l'adaptateur pi (API pi simulée)
```

Tous les tests amont sont préservés ; `test/pi-adapter-smoke.test.mjs` et `test:pi-adapter` sont nouveaux.

---

## Bêta : Mémoire intelligente v1.1.0

> Statut : Bêta — disponible via `npm i memory-lancedb-pro@beta`. Les utilisateurs stables sur `latest` ne sont pas affectés.

| Fonctionnalité | Description |
|---------|-------------|
| **Extraction intelligente** | Extraction en 6 catégories propulsée par LLM avec métadonnées L0/L1/L2. Repli sur les expressions régulières quand désactivée. |
| **Scoring du cycle de vie** | Décroissance de Weibull intégrée à la récupération — les souvenirs à haute fréquence et haute importance sont mieux classés. |
| **Gestion des niveaux** | Système à trois niveaux (Core → Working → Peripheral) avec promotion/rétrogradation automatiques. |

Retour d'expérience : [GitHub Issues](https://github.com/CortexReach/memory-lancedb-pro/issues) · Revenir en arrière : `npm i memory-lancedb-pro@latest`

---

## Dépendances

| Paquet | Rôle |
| --- | --- |
| `@lancedb/lancedb` ≥0.26.2 | Base de données vectorielle (ANN + FTS) |
| `openai` ≥6.21.0 | Client API d'embeddings compatible OpenAI |
| `@sinclair/typebox` 0.34.48 | Définitions de types JSON Schema |

---

## Contributeurs

Mainteneurs et contributeurs amont (voir la [liste complète](https://github.com/CortexReach/memory-lancedb-pro/graphs/contributors)) :

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
