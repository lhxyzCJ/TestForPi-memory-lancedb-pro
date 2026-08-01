import { dirname, join } from "node:path";
import { homedir } from "node:os";

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export function stripResetSuffix(fileName: string): string {
  const resetIndex = fileName.indexOf(".reset.");
  return resetIndex === -1 ? fileName : fileName.slice(0, resetIndex);
}

function defaultPiAgentHome(): string {
  return process.env.PI_CODING_AGENT_DIR?.trim()
    || process.env.PI_AGENT_DIR?.trim()
    || join(homedir(), ".pi", "agent");
}

function derivePiAgentHomeFromWorkspacePath(workspacePath: string): string | undefined {
  const normalized = workspacePath.trim().replace(/[\\/]+$/, "");
  if (!normalized) return undefined;
  // Exact agent home or inside it: ~/.pi/agent[/...]
  const agentHome = normalized.match(/^(.*?[\\/]\.pi[\\/]agent)(?:[\\/].*)?$/);
  if (agentHome) return agentHome[1];
  // Project-local .pi dir: <proj>/.pi → its sessions live at <proj>/.pi/sessions
  if (/[\\/]\.pi$/.test(normalized)) return normalized;
  return undefined;
}

function derivePiAgentHomeFromSessionFilePath(sessionFilePath: string): string | undefined {
  const normalized = sessionFilePath.trim();
  if (!normalized) return undefined;
  // ~/.pi/agent/sessions/.../xxx.jsonl
  const matched = normalized.match(/^(.*?)[\\/]\.pi[\\/]agent[\\/]sessions(?:[\\/][^\\/]+)?$/);
  if (!matched || !matched[1]) return undefined;
  const home = matched[1].trim();
  return home.length ? home : undefined;
}

function listConfiguredAgentIds(cfg: unknown): string[] {
  try {
    const root = cfg as Record<string, unknown>;
    const agents = root.agents as Record<string, unknown> | undefined;
    const list = agents?.list as unknown;
    if (!Array.isArray(list)) return [];

    const ids: string[] = [];
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const id = asNonEmptyString((item as Record<string, unknown>).id);
      if (id) ids.push(id);
    }
    return ids;
  } catch {
    return [];
  }
}

export function resolveReflectionSessionSearchDirs(params: {
  context: Record<string, unknown>;
  cfg: unknown;
  workspaceDir: string;
  currentSessionFile?: string;
  sourceAgentId?: string;
}): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const addDir = (value: string | undefined) => {
    const dir = asNonEmptyString(value);
    if (!dir || seen.has(dir)) return;
    seen.add(dir);
    out.push(dir);
  };
  const addHome = (homes: string[], value: string | undefined) => {
    const home = asNonEmptyString(value);
    if (!home || homes.includes(home)) return;
    homes.push(home);
  };
  const addAgentId = (agentIds: string[], value: string | undefined) => {
    const agentId = asNonEmptyString(value);
    if (!agentId || agentId.includes("/") || agentId.includes("\\") || agentIds.includes(agentId)) return;
    agentIds.push(agentId);
  };

  const previousSessionEntry = (params.context.previousSessionEntry || {}) as Record<string, unknown>;
  const sessionEntry = (params.context.sessionEntry || {}) as Record<string, unknown>;
  const sessionEntries = [previousSessionEntry, sessionEntry];

  if (params.currentSessionFile) addDir(dirname(params.currentSessionFile));
  for (const entry of sessionEntries) {
    const file = asNonEmptyString(entry.sessionFile);
    if (file) addDir(dirname(file));
    addDir(asNonEmptyString(entry.sessionsDir));
    addDir(asNonEmptyString(entry.sessionDir));
  }
  addDir(join(params.workspaceDir, "sessions"));

  const piHomes: string[] = [];
  addHome(piHomes, asNonEmptyString(process.env.PI_CODING_AGENT_DIR));
  addHome(piHomes, asNonEmptyString(process.env.PI_AGENT_DIR));
  addHome(piHomes, defaultPiAgentHome());
  addHome(piHomes, derivePiAgentHomeFromWorkspacePath(params.workspaceDir));
  if (params.currentSessionFile) {
    addHome(piHomes, derivePiAgentHomeFromSessionFilePath(params.currentSessionFile));
  }
  for (const entry of sessionEntries) {
    const entryFile = asNonEmptyString(entry.sessionFile);
    if (entryFile) addHome(piHomes, derivePiAgentHomeFromSessionFilePath(entryFile));
  }
  try {
    const root = params.cfg as Record<string, unknown>;
    const agents = root.agents as Record<string, unknown> | undefined;
    const defaults = agents?.defaults as Record<string, unknown> | undefined;
    const defaultWorkspace = asNonEmptyString(defaults?.workspace);
    if (defaultWorkspace) addHome(piHomes, derivePiAgentHomeFromWorkspacePath(defaultWorkspace));

    const list = agents?.list as unknown;
    if (Array.isArray(list)) {
      for (const item of list) {
        if (!item || typeof item !== "object") continue;
        const workspace = asNonEmptyString((item as Record<string, unknown>).workspace);
        if (workspace) addHome(piHomes, derivePiAgentHomeFromWorkspacePath(workspace));
      }
    }
  } catch {
    // ignore
  }

  const agentIds: string[] = [];
  addAgentId(agentIds, params.sourceAgentId);
  addAgentId(agentIds, asNonEmptyString(params.context.agentId));
  for (const entry of sessionEntries) {
    addAgentId(agentIds, asNonEmptyString(entry.agentId));
  }
  for (const configuredId of listConfiguredAgentIds(params.cfg)) {
    addAgentId(agentIds, configuredId);
  }
  addAgentId(agentIds, "main");

  for (const home of piHomes) {
    addDir(join(home, "sessions"));
  }

  return out;
}
