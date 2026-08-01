import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import jitiFactory from "jiti";

const jiti = jitiFactory(import.meta.url, { interopDefault: true });

const { resolveReflectionSessionSearchDirs } = jiti("../src/session-recovery.ts");

describe("memory-reflection session recovery search dirs", () => {
  it("includes pi agent session dirs derived from config and keeps workspace/sessions fallback", () => {
    const cfg = {
      agents: {
        defaults: { workspace: "/root/.pi/agent" },
        list: [
          { id: "main" },
          { id: "theia", workspace: "/root/.pi/agent/workspaces/theia" },
        ],
      },
    };

    const dirs = resolveReflectionSessionSearchDirs({
      context: { sessionEntry: { sessionId: "s-1" } },
      cfg,
      workspaceDir: "/root/.pi/agent",
      currentSessionFile: undefined,
      sourceAgentId: "theia",
    });

    assert.ok(
      dirs.includes(path.join("/root/.pi/agent", "sessions")),
      "expected pi agent sessions dir to be searched",
    );
    assert.ok(
      dirs.includes(path.join("/root/.pi/agent", "sessions")),
      "expected workspace/sessions fallback to stay enabled",
    );
  });

  it("can derive OpenClaw home from sessionFile layout when workspaceDir is unrelated", () => {
    const dirs = resolveReflectionSessionSearchDirs({
      context: {
        previousSessionEntry: {
          sessionFile: "/root/.openclaw/agents/main/sessions/abc123.jsonl.reset.1730000000",
        },
      },
      cfg: {},
      workspaceDir: "/tmp/custom-workspace",
      currentSessionFile: undefined,
      sourceAgentId: "main",
    });

    assert.ok(
      dirs.includes(path.join("/root/.openclaw", "agents", "main", "sessions")),
      "expected main agent sessions dir from sessionFile-derived home",
    );
  });
});
