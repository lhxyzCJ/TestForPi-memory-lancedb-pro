/**
 * Plugin config loading for the Pi port.
 *
 * OpenClaw injected plugin configuration via `api.pluginConfig` /
 * `api.config` from openclaw.json. Pi has no plugin config registry, so the
 * port reads the same config document from a file:
 *
 *   1. $MEMORY_LANCEDB_PRO_CONFIG        (explicit path)
 *   2. ~/.pi/agent/memory-lancedb-pro.json5
 *   3. ~/.pi/agent/memory-lancedb-pro.json
 *
 * The document shape is identical to the OpenClaw plugin entry config:
 *
 *   { "config": { "embedding": { ... }, "autoCapture": true, ... } }
 *   or the bare inner object:            { "embedding": { ... }, ... }
 *
 * `parsePluginConfig` in index.ts accepts both shapes.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import JSON5 from "json5";
import { getPiAgentHome } from "./paths.js";
function tryParseJson5(raw) {
    try {
        return JSON5.parse(raw);
    }
    catch {
        return undefined;
    }
}
function readConfigFile(path) {
    if (!existsSync(path))
        return undefined;
    const raw = readFileSync(path, "utf8");
    if (!raw.trim())
        return undefined;
    const parsed = tryParseJson5(raw);
    if (parsed !== undefined)
        return parsed;
    return undefined;
}
export function loadPluginConfigFile() {
    const explicit = process.env.MEMORY_LANCEDB_PRO_CONFIG?.trim();
    if (explicit) {
        const cfg = readConfigFile(explicit);
        if (cfg !== undefined)
            return cfg;
    }
    const home = getPiAgentHome();
    for (const name of ["memory-lancedb-pro.json5", "memory-lancedb-pro.json"]) {
        const cfg = readConfigFile(join(home, name));
        if (cfg !== undefined)
            return cfg;
    }
    return undefined;
}
/** Minimal global config surface read from pi settings (~/.pi/agent/settings.json). */
export function loadPiSettings() {
    try {
        const raw = readFileSync(join(getPiAgentHome(), "settings.json"), "utf8");
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? parsed
            : {};
    }
    catch {
        return {};
    }
}
/** Agents declared in pi's settings (no OpenClaw agents.list equivalent). */
export function loadDeclaredAgents(settings) {
    const agents = settings.agents;
    if (Array.isArray(agents)) {
        return agents.filter((a) => {
            if (!a || typeof a !== "object")
                return false;
            const rec = a;
            return typeof rec.id === "string" && rec.id.trim().length > 0;
        }).map((a) => ({ id: a.id, workspace: a.workspace }));
    }
    return [];
}
