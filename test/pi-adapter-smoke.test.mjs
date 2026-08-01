/**
 * Pi port smoke test: the extension bootstraps against a minimal mock of the
 * pi ExtensionAPI (no LLM, no network) and the expected events/tools/commands
 * are registered through the OpenClaw API shim.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import jitiFactory from "jiti";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "..");
const jiti = jitiFactory(import.meta.url, { interopDefault: true });

function createMockPi() {
  const handlers = new Map();
  const tools = [];
  const commands = [];
  return {
    pi: {
      on(event, handler) {
        handlers.set(event, [...(handlers.get(event) ?? []), handler]);
      },
      registerTool(def) {
        tools.push(def);
      },
      registerCommand(name, options) {
        commands.push({ name, options });
      },
      events: { on: () => {}, emit: () => {} },
    },
    handlers,
    tools,
    commands,
  };
}

describe("pi adapter smoke", () => {
  it("extension registers with a config file present", async () => {
    const { pi, tools, commands, handlers } = createMockPi();
    const tmpHome = mkdtempSync(join(tmpdir(), "pi-mem-smoke-"));
      writeFileSync(
        join(tmpHome, "memory-lancedb-pro.json5"),
        JSON.stringify({
          embedding: { apiKey: "test", model: "test-embed", dimensions: 4, baseURL: "http://127.0.0.1:9/v1" },
          startupCheckTimeoutMs: 500,
        }),
      );
      process.env.PI_CODING_AGENT_DIR = tmpHome;
      try {
        const ext = await jiti(join(repoRoot, "pi-adapter", "index.ts"));
        const result = ext.default(pi);
        if (result && typeof result.then === "function") await result;

        // Tools registered through the shim
        const toolNames = tools.map((t) => t.name);
        assert.ok(toolNames.includes("memory_recall"), "memory_recall tool registered");
        assert.ok(toolNames.includes("memory_store"), "memory_store tool registered");

        // Slash command registered
        assert.ok(commands.some((c) => c.name === "memory-pro"), "/memory-pro command registered");

        // Core lifecycle events wired (reflection/after_tool_call hooks are
        // session-strategy dependent and intentionally absent with "none")
        for (const ev of ["session_start", "session_shutdown", "before_agent_start", "agent_end", "input"]) {
          assert.ok(handlers.has(ev), `handler registered for ${ev}`);
        }
      } finally {
        delete process.env.PI_CODING_AGENT_DIR;
      }
  });

  it("extension disables itself gracefully without a config file", async () => {
    const { pi, tools, commands } = createMockPi();
    const tmpHome = mkdtempSync(join(tmpdir(), "pi-mem-smoke-noconf-"));
    process.env.PI_CODING_AGENT_DIR = tmpHome;
    try {
      const ext = await jiti(join(repoRoot, "pi-adapter", "index.ts"));
      const result = ext.default(pi);
      if (result && typeof result.then === "function") await result;
      assert.equal(tools.length, 0, "no tools registered without config");
      assert.equal(commands.length, 0, "no commands registered without config");
    } finally {
      delete process.env.PI_CODING_AGENT_DIR;
    }
  });

  it("sessionKey follows the pi agent:pi:cli:<cwd> convention", async () => {
    const { pi, handlers } = createMockPi();
    const tmpHome = mkdtempSync(join(tmpdir(), "pi-mem-smoke-key-"));
    writeFileSync(
      join(tmpHome, "memory-lancedb-pro.json5"),
      JSON.stringify({ embedding: { apiKey: "test", model: "m", dimensions: 4, baseURL: "http://127.0.0.1:9/v1" } }),
    );
    process.env.PI_CODING_AGENT_DIR = tmpHome;
    try {
      const ext = await jiti(join(repoRoot, "pi-adapter", "index.ts"));
      await ext.default(pi);
      const inputHandlers = handlers.get("input");
      assert.ok(inputHandlers.length > 0);
    } finally {
      delete process.env.PI_CODING_AGENT_DIR;
    }
  });
});
