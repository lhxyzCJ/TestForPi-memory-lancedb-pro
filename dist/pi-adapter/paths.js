/**
 * Pi agent home/path resolution for the memory-lancedb-pro Pi port.
 *
 * The original plugin stored everything under ~/.openclaw. In the Pi port the
 * equivalent base directory is ~/.pi/agent (PI_CODING_AGENT_DIR / PI_AGENT_DIR
 * override it), and workspace-scoped data lives inside the project cwd.
 */
import { homedir } from "node:os";
import { join } from "node:path";
export function getPiAgentHome() {
    const fromEnv = process.env.PI_CODING_AGENT_DIR?.trim() ||
        process.env.PI_AGENT_DIR?.trim();
    if (fromEnv)
        return fromEnv;
    return join(homedir(), ".pi", "agent");
}
export function getDefaultDbPath() {
    const fromEnv = process.env.MEMORY_LANCEDB_PRO_DB_PATH?.trim();
    if (fromEnv)
        return fromEnv;
    return join(getPiAgentHome(), "memory", "lancedb-pro");
}
/** Default "workspace" root: pi skills/context files live under ~/.pi/agent. */
export function getDefaultWorkspaceDir() {
    const fromEnv = process.env.MEMORY_LANCEDB_PRO_WORKSPACE_DIR?.trim();
    if (fromEnv)
        return fromEnv;
    return getPiAgentHome();
}
export function getDefaultMdMirrorDir() {
    const fromEnv = process.env.MEMORY_LANCEDB_PRO_MD_MIRROR_DIR?.trim();
    if (fromEnv)
        return fromEnv;
    return join(getPiAgentHome(), "memory", "md-mirror");
}
/** Pi session directory layout: ~/.pi/agent/sessions/--<cwd>--/*.jsonl */
export function getPiSessionsDir() {
    return join(getPiAgentHome(), "sessions");
}
/** Pi global skills directory (~/.pi/agent/skills). */
export function getPiSkillsDir() {
    return join(getPiAgentHome(), "skills");
}
export function expandHomeDir(path) {
    if (path === "~")
        return homedir();
    if (path.startsWith("~/") || path.startsWith("~\\")) {
        return join(homedir(), path.slice(2));
    }
    return path;
}
export function expandEnvVars(value) {
    return value.replace(/\$\{([^}]+)\}/g, (_, envVar) => {
        const envValue = process.env[envVar];
        if (!envValue)
            throw new Error(`Environment variable ${envVar} is not set`);
        return envValue;
    });
}
