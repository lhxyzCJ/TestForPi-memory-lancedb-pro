import memoryLanceDBProPlugin from "../index.js";
import { createOpenClawApiFromPi } from "./shim.js";
import { loadPluginConfigFile } from "./config.js";
export default function (pi) {
    const pluginConfig = loadPluginConfigFile();
    if (pluginConfig === undefined) {
        console.warn("[memory-lancedb-pro] no config file found; memory extension disabled.\n" +
            "  Create ~/.pi/agent/memory-lancedb-pro.json5 (or set $MEMORY_LANCEDB_PRO_CONFIG) with:\n" +
            "  {\n" +
            '    "embedding": { "provider": "openai-compatible", "apiKey": "${JINA_API_KEY}", "model": "jina-embeddings-v5-text-small", "baseURL": "https://api.jina.ai/v1", "dimensions": 1024 }\n' +
            "  }\n" +
            "  See README.md for the full configuration reference.");
        return;
    }
    const { api } = createOpenClawApiFromPi(pi, { pluginConfig });
    try {
        memoryLanceDBProPlugin.register(api);
        pi.events.emit("memory-lancedb-pro:registered", { configHint: "config file loaded" });
    }
    catch (err) {
        // A broken memory config must never take down the pi session.
        console.error(`[memory-lancedb-pro] registration failed; memory disabled: ${err instanceof Error ? err.message : String(err)}`);
    }
}
