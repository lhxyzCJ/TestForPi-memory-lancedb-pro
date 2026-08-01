/**
 * OpenClaw → Pi API shim.
 *
 * The plugin core (index.ts, src/tools.ts, src/*.ts) was written against the
 * OpenClaw plugin SDK. This module implements that SDK surface on top of the
 * pi coding agent extension API, translating:
 *
 *   - api.on / api.registerHook   → pi.on with event/context adaptation
 *   - api.registerTool            → pi.registerTool
 *   - api.registerCli             → pi /memory-pro slash command (+ standalone bin)
 *   - api.registerService         → session_start / session_shutdown lifecycle
 *   - api.resolvePath             → home/env expansion
 *   - api.pluginConfig / api.config → pi config file + settings
 *   - api.runtime.agent.runEmbeddedPiAgent → pi CLI subprocess runner
 *
 * Event mapping (OpenClaw → Pi):
 *   message_received / before_message_write → input
 *   gateway_start / agent:bootstrap        → session_start
 *   before_prompt_build                    → before_agent_start
 *   agent_end                              → agent_end
 *   session_end                            → session_shutdown
 *   after_tool_call                        → tool_result
 *   command:new / command:reset / before_reset → session_before_switch
 */
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Command } from "commander";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { loadDeclaredAgents, loadPiSettings, loadPluginConfigFile } from "./config.js";
import { expandEnvVars, expandHomeDir, getDefaultWorkspaceDir } from "./paths.js";
import { runEmbeddedPiViaCli } from "./pi-runner.js";

const AGENT_ID = "pi";
const CHANNEL_ID = "cli";

function resolvePathImpl(path: string): string {
  const expanded = expandEnvVars(path.trim());
  return expandHomeDir(expanded);
}

function sessionKeyOf(ctx: ExtensionContext): string {
  const cwd = ctx.cwd || "default";
  return `agent:${AGENT_ID}:${CHANNEL_ID}:${cwd}`;
}

function openClawCtx(ctx: ExtensionContext): Record<string, unknown> {
  return {
    sessionKey: sessionKeyOf(ctx),
    agentId: AGENT_ID,
    sessionId: ctx.sessionManager?.getSessionId?.() ?? "unknown",
    channelId: CHANNEL_ID,
    conversationId: ctx.cwd,
    accountId: AGENT_ID,
    cwd: ctx.cwd,
    sessionManager: ctx.sessionManager,
  };
}

function messageContentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (block && typeof block === "object") {
          const b = block as Record<string, unknown>;
          if (b.type === "text" && typeof b.text === "string") return b.text;
        }
        return "";
      })
      .join("\n");
  }
  return "";
}

export interface PiShim {
  api: OpenClawPluginApi;
  pluginConfig: unknown;
  settings: Record<string, unknown>;
}

export function createOpenClawApiFromPi(pi: ExtensionAPI, options?: { pluginConfig?: unknown }): PiShim {
  const pluginConfig = options?.pluginConfig ?? loadPluginConfigFile();
  const settings = loadPiSettings();
  const declaredAgents = loadDeclaredAgents(settings);

  const globalConfig = {
    ...settings,
    agents: { list: declaredAgents },
  };

  const logger = {
    debug: (message: string) => console.debug(`[memory-lancedb-pro] ${message}`),
    info: (message: string) => console.log(`[memory-lancedb-pro] ${message}`),
    warn: (message: string) => console.warn(`[memory-lancedb-pro] ${message}`),
    error: (message: string) => console.error(`[memory-lancedb-pro] ${message}`),
  };

  // ---------------------------------------------------------------------------
  // Event mapping helpers
  // ---------------------------------------------------------------------------

  type OpenClawEventHandler = (event: any, ctx: any) => unknown;

  const oncePerProcess = new Set<string>();

  function wrapOnce(key: string, handler: OpenClawEventHandler): OpenClawEventHandler {
    return (event: any, ctx: any) => {
      if (oncePerProcess.has(key)) return undefined;
      oncePerProcess.add(key);
      return handler(event, ctx);
    };
  }

  /** before_prompt_build → before_agent_start: prependContext → systemPrompt append. */
  function adaptBeforePromptBuild(handler: OpenClawEventHandler): (event: any, ctx: ExtensionContext) => unknown {
    return async (event, ctx) => {
      const oclEvent = {
        prompt: event.prompt ?? "",
        sessionKey: sessionKeyOf(ctx),
        images: event.images,
      };
      const result = await handler(oclEvent, openClawCtx(ctx));
      if (result && typeof result === "object") {
        const rec = result as Record<string, unknown>;
        const prepend = typeof rec.prependContext === "string" ? rec.prependContext : "";
        if (prepend) {
          // Pi has no ephemeral context injection; appending to the system
          // prompt gives the same per-turn visibility without persisting
          // injected blocks into the session transcript.
          return { systemPrompt: `${event.systemPrompt ?? ""}\n\n${prepend}` };
        }
      }
      return undefined;
    };
  }

  /** agent_end: normalize pi messages into the OpenClaw { role, content } shape. */
  function adaptAgentEnd(handler: OpenClawEventHandler): (event: any, ctx: ExtensionContext) => unknown {
    return async (event, ctx) => {
      const messages = Array.isArray(event.messages)
        ? event.messages.map((m: any) => ({
            role: typeof m?.role === "string" ? m.role : "unknown",
            content: m?.content,
          }))
        : [];
      const oclEvent = {
        messages,
        success: true,
        sessionKey: sessionKeyOf(ctx),
      };
      return handler(oclEvent, openClawCtx(ctx));
    };
  }

  /** after_tool_call → tool_result. */
  function adaptAfterToolCall(handler: OpenClawEventHandler): (event: any, ctx: ExtensionContext) => unknown {
    return async (event, ctx) => {
      const toolName = typeof event.toolName === "string" ? event.toolName : "";
      const isError = event.isError === true;
      const oclEvent = {
        toolName: toolName === "bash" ? "exec" : toolName,
        result: messageContentToText(event.content),
        error: isError ? "tool execution failed" : undefined,
        sessionKey: sessionKeyOf(ctx),
      };
      return handler(oclEvent, openClawCtx(ctx));
    };
  }

  /** before_reset → session_before_switch. */
  function adaptBeforeReset(handler: OpenClawEventHandler): (event: any, ctx: ExtensionContext) => unknown {
    return async (event, ctx) => {
      if (event.reason !== "new") return undefined;
      const messages = sessionMessagesOf(ctx);
      const oclEvent = {
        reason: "new",
        messages,
        sessionFile: ctx.sessionManager?.getSessionFile?.(),
        sessionKey: sessionKeyOf(ctx),
      };
      return handler(oclEvent, openClawCtx(ctx));
    };
  }

  /** command:new / command:reset → session_before_switch. */
  function adaptSessionBoundaryCommand(actionForReason: (reason: string) => string | undefined) {
    return (handler: OpenClawEventHandler): (event: any, ctx: ExtensionContext) => unknown => {
      return async (event, ctx) => {
        const action = actionForReason(event.reason);
        if (!action) return undefined;
        const sessionFile = ctx.sessionManager?.getSessionFile?.();
        const sessionId = ctx.sessionManager?.getSessionId?.() ?? "unknown";
        const sessionEntry = { sessionId, sessionFile, Provider: "", threadId: undefined };
        const oclEvent = {
          action,
          sessionKey: sessionKeyOf(ctx),
          context: {
            commandSource: "pi",
            sessionEntry,
            previousSessionEntry: sessionEntry,
            cfg: globalConfig,
            workspaceDir: ctx.cwd,
          },
        };
        return handler(oclEvent, openClawCtx(ctx));
      };
    };
  }

  function sessionMessagesOf(ctx: ExtensionContext): Array<{ role: string; content: unknown }> {
    const entries = ctx.sessionManager?.getEntries?.() ?? [];
    return entries
      .filter((e: any) => e?.type === "message" && e?.message)
      .map((e: any) => ({
        role: typeof e.message.role === "string" ? e.message.role : "unknown",
        content: e.message.content,
      }));
  }

  // ---------------------------------------------------------------------------
  // Service lifecycle
  // ---------------------------------------------------------------------------
  let service: { start?: () => Promise<void>; stop?: () => Promise<void> } | undefined;
  let serviceStarted = false;

  // ---------------------------------------------------------------------------
  // Embedded runner wiring
  // ---------------------------------------------------------------------------
  const runEmbeddedPiAgent = async (params: Record<string, unknown>) => {
    const prompt = typeof params.prompt === "string" ? params.prompt : "";
    if (!prompt) throw new Error("runEmbeddedPiAgent: missing prompt");
    return runEmbeddedPiViaCli({
      prompt,
      timeoutMs: typeof params.timeoutMs === "number" ? params.timeoutMs : 60_000,
      thinkLevel: typeof params.thinkLevel === "string" ? params.thinkLevel : "off",
      sessionId: typeof params.sessionId === "string" ? params.sessionId : undefined,
      workspaceDir: typeof params.workspaceDir === "string" ? params.workspaceDir : undefined,
    });
  };

  const api: OpenClawPluginApi = {
    logger,
    resolvePath: resolvePathImpl,
    pluginConfig,
    config: globalConfig,

    on(event: string, handler: any, _options?: Record<string, unknown>) {
      switch (event) {
        case "message_received":
        case "before_message_write": {
          pi.on("input", (async (piEvent, ctx) => {
            const text = typeof piEvent.text === "string" ? piEvent.text : "";
            if (!text) return undefined;
            const oclEvent = event === "message_received"
              ? { content: text, from: "user" }
              : { message: { role: "user", content: text } };
            return handler(oclEvent, openClawCtx(ctx));
          }) as any);
          break;
        }
        case "gateway_start": {
          pi.on("session_start", wrapOnce("gateway_start", handler) as any);
          break;
        }
        case "before_prompt_build": {
          pi.on("before_agent_start", adaptBeforePromptBuild(handler) as any);
          break;
        }
        case "agent_end": {
          pi.on("agent_end", adaptAgentEnd(handler) as any);
          break;
        }
        case "session_end": {
          pi.on("session_shutdown", (async (piEvent, ctx) => {
            return handler(piEvent, openClawCtx(ctx));
          }) as any);
          break;
        }
        case "after_tool_call": {
          pi.on("tool_result", adaptAfterToolCall(handler) as any);
          break;
        }
        case "before_reset": {
          pi.on("session_before_switch", adaptBeforeReset(handler) as any);
          break;
        }
        default:
          logger.debug(`on("${event}"): no pi mapping; handler skipped`);
      }
    },

    registerHook(name: string, handler: any, _options?: Record<string, unknown>) {
      switch (name) {
        case "agent:bootstrap": {
          pi.on("session_start", (async (piEvent, ctx) => {
            const oclEvent = {
              context: { workspaceDir: ctx.cwd, bootstrapFiles: [] },
              sessionKey: sessionKeyOf(ctx),
            };
            return handler(oclEvent, openClawCtx(ctx));
          }) as any);
          break;
        }
        case "command:new": {
          pi.on("session_before_switch", adaptSessionBoundaryCommand((reason) => (reason === "new" ? "new" : undefined))(handler) as any);
          break;
        }
        case "command:reset": {
          // pi's /fork emits session_before_fork (session_before_switch never
          // carries a "fork" reason in 0.83), so map both to the reset action.
          pi.on("session_before_switch", adaptSessionBoundaryCommand((reason) => (reason === "fork" ? "reset" : undefined))(handler) as any);
          pi.on("session_before_fork", (async (_event, ctx) => {
            const sessionFile = ctx.sessionManager?.getSessionFile?.();
            const sessionId = ctx.sessionManager?.getSessionId?.() ?? "unknown";
            const sessionEntry = { sessionId, sessionFile, Provider: "", threadId: undefined };
            const oclEvent = {
              action: "reset",
              sessionKey: sessionKeyOf(ctx),
              context: {
                commandSource: "pi",
                sessionEntry,
                previousSessionEntry: sessionEntry,
                cfg: globalConfig,
                workspaceDir: ctx.cwd,
              },
            };
            return handler(oclEvent, openClawCtx(ctx));
          }) as any);
          break;
        }
        default:
          logger.debug(`registerHook("${name}"): no pi mapping; handler skipped`);
      }
    },

    registerTool(factory: any, _options?: Record<string, unknown>) {
      // toolCtx is consumed at factory time: tools that only read the static
      // context (e.g. memory_store's runtimeContext.agentId) must see the pi
      // agent identity here, not the OpenClaw "main" default.
      const def = factory({
        workspaceDir: getDefaultWorkspaceDir(),
        agentId: AGENT_ID,
        sessionKey: `agent:${AGENT_ID}:${CHANNEL_ID}:default`,
      });
      if (!def || typeof def.name !== "string") {
        logger.warn("registerTool: factory returned no tool definition");
        return;
      }
      pi.registerTool({
        name: def.name,
        label: def.label ?? def.name,
        description: def.description ?? "",
        parameters: def.parameters,
        promptSnippet: def.promptSnippet,
        promptGuidelines: def.promptGuidelines,
        async execute(toolCallId: string, params: unknown, signal: AbortSignal | undefined, onUpdate: any, ctx: ExtensionContext) {
          const runtimeCtx = {
            ...ctx,
            agentId: AGENT_ID,
            sessionKey: sessionKeyOf(ctx),
            sessionId: ctx.sessionManager?.getSessionId?.() ?? "unknown",
          };
          const result = await def.execute(toolCallId, params, signal, onUpdate, runtimeCtx);
          return { content: result?.content ?? [], details: result?.details ?? {} };
        },
      } as any);
    },

    registerCli(factory: any, _options?: Record<string, unknown>) {
      // The factory (createMemoryCLI) mutates the program it receives; a
      // commander program cannot be safely parseAsync()'d more than once, so
      // build a fresh program for every /memory-pro invocation.
      const names = _options?.commands as string[] | undefined;
      const commandName = Array.isArray(names) && names.length > 0 ? names[0] : "memory-pro";
      pi.registerCommand(commandName, {
        description: "memory-lancedb-pro management CLI",
        handler: async (args: string, _ctx) => {
          const program = new Command();
          factory({ program });
          const argv = ["memory-pro", ...args.split(/\s+/).filter((s) => s.length > 0)];
          await program.parseAsync(argv, { from: "user" });
        },
      });
    },

    registerService(svc: { id: string; start: () => Promise<void>; stop?: () => Promise<void> }) {
      service = svc;
    },

    registerMemoryCapability(_capability: unknown) {
      logger.debug("registerMemoryCapability: no pi equivalent; ignored");
    },

    registerMemoryRuntime(_runtime: unknown) {
      logger.debug("registerMemoryRuntime: no pi equivalent; ignored");
    },

    runtime: {
      agent: { runEmbeddedPiAgent },
    },
  };

  // ---------------------------------------------------------------------------
  // Service lifecycle wiring
  //
  // The OpenClaw plugin service runs for the whole gateway lifetime. In pi the
  // equivalent is the process lifetime: session switches (/new, /resume, /fork)
  // must NOT stop the service (that would destroy the LanceDB store and lose
  // in-flight async captures). We stop only on process exit ("quit"/"reload")
  // and wait a grace period so pending smart-extraction writes finish first.
  // ---------------------------------------------------------------------------
  const stopGraceMs = (() => {
    const raw = Number(process.env.MEMORY_LANCEDB_PRO_STOP_GRACE_MS);
    return Number.isFinite(raw) && raw > 0 ? raw : 6000;
  })();

  pi.on("session_start", (async () => {
    if (serviceStarted || !service) return;
    serviceStarted = true;
    try {
      await service.start?.();
    } catch (err) {
      logger.warn(`service start failed: ${String(err)}`);
    }
  }) as any);

  pi.on("session_shutdown", (async (event) => {
    if (!serviceStarted || !service) return;
    const reason = typeof event?.reason === "string" ? event.reason : "";
    if (reason !== "quit" && reason !== "reload") return;
    serviceStarted = false;
    // Let in-flight auto-capture / reflection writes drain before destroying
    // the store (pi -p non-interactive runs exit right after shutdown).
    await new Promise((resolve) => setTimeout(resolve, stopGraceMs));
    try {
      await service.stop?.();
    } catch (err) {
      logger.warn(`service stop failed: ${String(err)}`);
    }
  }) as any);

  return { api, pluginConfig, settings };
}
