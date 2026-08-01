/**
 * Standalone `memory-pro` CLI entry — Pi port.
 *
 * The original plugin CLI was mounted by OpenClaw (`openclaw memory-pro …`).
 * In the Pi port it runs standalone:
 *
 *   memory-pro list --scope global
 *   memory-pro search "query"
 *   memory-pro stats
 *
 * It reuses the plugin's own config document (~/.pi/agent/memory-lancedb-pro.json5)
 * and the same store/embedder/retriever stack as the extension.
 */
import { Command } from "commander";
import { readFileSync } from "node:fs";
import { parsePluginConfig } from "../index.js";
import { loadPluginConfigFile } from "./config.js";
import { expandEnvVars, expandHomeDir, getDefaultDbPath } from "./paths.js";
import { MemoryStore, normalizeStoragePath } from "../src/store.js";
import { createEmbedder, getEffectiveVectorDimensions } from "../src/embedder.js";
import { createRetriever, normalizeRetrievalConfig } from "../src/retriever.js";
import { createScopeManager } from "../src/scopes.js";
import { createMigrator } from "../src/migrate.js";
import { createLlmClient } from "../src/llm-client.js";
import { createMemoryCLI } from "../cli.js";
process.env.MEMORY_LANCEDB_PRO_CLI = "1";
const resolvePathImpl = (value) => expandHomeDir(expandEnvVars(value.trim()));
function resolveSecret(value, label) {
    if (typeof value === "string" && value.trim().length > 0)
        return expandEnvVars(value.trim());
    if (value && typeof value === "object" && !Array.isArray(value)) {
        const ref = value;
        const source = typeof ref.source === "string" ? ref.source : "";
        const id = typeof ref.id === "string" ? ref.id : "";
        if (source === "env") {
            const v = process.env[id];
            if (!v)
                throw new Error(`environment variable ${id} is not set`);
            return v;
        }
        if (source === "file") {
            return readFileSync(resolvePathImpl(id), "utf8").trimEnd();
        }
        throw new Error(`unsupported SecretRef source "${source}" for ${label}`);
    }
    throw new Error(`${label} is empty`);
}
export async function main(argv = process.argv) {
    const pluginConfig = loadPluginConfigFile();
    if (pluginConfig === undefined) {
        console.error("[memory-lancedb-pro] no config file found.\n" +
            "  Create ~/.pi/agent/memory-lancedb-pro.json5 (or set $MEMORY_LANCEDB_PRO_CONFIG) before running the CLI.\n" +
            "  See README.md for the configuration reference.");
        process.exit(1);
    }
    const config = parsePluginConfig(pluginConfig);
    const resolvedDbPath = normalizeStoragePath(resolvePathImpl(config.dbPath || getDefaultDbPath()));
    const vectorDim = getEffectiveVectorDimensions(config.embedding.model || "text-embedding-3-small", config.embedding.dimensions, config.embedding.requestDimensions);
    const embeddingApiKey = Array.isArray(config.embedding.apiKey)
        ? resolveSecret(config.embedding.apiKey[0], "embedding.apiKey")
        : resolveSecret(config.embedding.apiKey, "embedding.apiKey");
    const store = new MemoryStore({
        dbPath: resolvedDbPath,
        vectorDim,
        disableNativeCosine: config.retrieval?.disableNativeCosine === true,
        readConsistencyInterval: config.storageMaintenance?.readConsistencyIntervalSeconds ?? 0,
    });
    await store.ensureInitialized();
    const embedder = createEmbedder({
        provider: "openai-compatible",
        apiKey: embeddingApiKey,
        model: config.embedding.model || "text-embedding-3-small",
        baseURL: config.embedding.baseURL,
        dimensions: config.embedding.dimensions,
        requestDimensions: config.embedding.requestDimensions,
        maxInputChars: config.embedding.maxInputChars,
        omitDimensions: config.embedding.omitDimensions,
        taskQuery: config.embedding.taskQuery,
        taskPassage: config.embedding.taskPassage,
        normalized: config.embedding.normalized,
        chunking: config.embedding.chunking,
        astChunking: config.embedding.astChunking,
        clientTimeoutMs: config.embedding.clientTimeoutMs,
    });
    const retrievalConfig = normalizeRetrievalConfig(config.retrieval);
    const retriever = createRetriever(store, embedder, retrievalConfig);
    const scopeManager = createScopeManager(config.scopes);
    const migrator = createMigrator(store);
    let llmClient;
    try {
        const llmAuth = config.llm?.auth || "api-key";
        const llmApiKey = llmAuth === "oauth"
            ? undefined
            : config.llm?.apiKey
                ? resolveSecret(config.llm.apiKey, "llm.apiKey")
                : embeddingApiKey;
        const llmBaseURL = config.llm?.baseURL ? expandEnvVars(config.llm.baseURL) : config.embedding.baseURL;
        llmClient = createLlmClient({
            auth: llmAuth,
            apiKey: llmApiKey,
            model: config.llm?.model || "openai/gpt-oss-120b",
            baseURL: llmBaseURL,
            oauthProvider: config.llm?.oauthProvider,
            oauthPath: config.llm?.oauthPath,
            timeoutMs: config.llm?.timeoutMs ?? 30000,
            log: (msg) => console.debug(msg),
        });
    }
    catch (err) {
        console.warn(`[memory-lancedb-pro] llm client init failed: ${String(err)}`);
    }
    const program = new Command();
    createMemoryCLI({
        store,
        retriever,
        scopeManager,
        onMemoriesDeleted: () => { },
        migrator,
        embedder,
        llmClient,
    })({ program });
    // registerMemoryCLI nests every command under "memory-pro"; the standalone
    // bin is invoked as `memory-pro list`, so argv[0] is the bin path and the
    // "memory-pro" prefix must be injected.
    const rest = argv.length > 2 ? argv.slice(2) : [];
    const cliArgv = rest[0] === "memory-pro" ? rest : ["memory-pro", ...rest];
    await program.parseAsync(cliArgv, { from: "user" });
}
if (import.meta.url === `file://${process.argv[1]}`) {
    void main();
}
