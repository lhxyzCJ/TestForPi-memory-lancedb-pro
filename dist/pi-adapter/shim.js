import { Command } from "commander";
import { loadDeclaredAgents, loadPiSettings, loadPluginConfigFile } from "./config.js";
import { expandEnvVars, expandHomeDir, getDefaultWorkspaceDir } from "./paths.js";
import { runEmbeddedPiViaCli } from "./pi-runner.js";
const AGENT_ID = "pi";
const CHANNEL_ID = "cli";
function resolvePathImpl(path) {
    const expanded = expandEnvVars(path.trim());
    return expandHomeDir(expanded);
}
function sessionKeyOf(ctx) {
    const cwd = ctx.cwd || "default";
    return `agent:${AGENT_ID}:${CHANNEL_ID}:${cwd}`;
}
function openClawCtx(ctx) {
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
function messageContentToText(content) {
    if (typeof content === "string")
        return content;
    if (Array.isArray(content)) {
        return content
            .map((block) => {
            if (block && typeof block === "object") {
                const b = block;
                if (b.type === "text" && typeof b.text === "string")
                    return b.text;
            }
            return "";
        })
            .join("\n");
    }
    return "";
}
export function createOpenClawApiFromPi(pi, options) {
    const pluginConfig = options?.pluginConfig ?? loadPluginConfigFile();
    const settings = loadPiSettings();
    const declaredAgents = loadDeclaredAgents(settings);
    const globalConfig = {
        ...settings,
        agents: { list: declaredAgents },
    };
    const logger = {
        debug: (message) => console.debug(`[memory-lancedb-pro] ${message}`),
        info: (message) => console.log(`[memory-lancedb-pro] ${message}`),
        warn: (message) => console.warn(`[memory-lancedb-pro] ${message}`),
        error: (message) => console.error(`[memory-lancedb-pro] ${message}`),
    };
    const oncePerProcess = new Set();
    function wrapOnce(key, handler) {
        return (event, ctx) => {
            if (oncePerProcess.has(key))
                return undefined;
            oncePerProcess.add(key);
            return handler(event, ctx);
        };
    }
    /** before_prompt_build → before_agent_start: prependContext → 尾部 custom message(缓存友好)。
     *  记忆块不再拼进 systemPrompt:system+全部历史成为稳定前缀,DeepSeek 前缀缓存可命中到上一轮;
     *  记忆内容变化只影响尾部(记忆消息+本轮用户消息),不毒害历史缓存。 */
    function adaptBeforePromptBuild(handler) {
        return async (event, ctx) => {
            const oclEvent = {
                prompt: event.prompt ?? "",
                sessionKey: sessionKeyOf(ctx),
                images: event.images,
            };
            const result = await handler(oclEvent, openClawCtx(ctx));
            if (result && typeof result === "object") {
                const rec = result;
                const prepend = typeof rec.prependContext === "string" ? rec.prependContext : "";
                if (prepend) {
                    // Pi 的 before_agent_start 支持返回 message:注入为 custom 消息,
                    // 追加在 user 消息之后(消息序列尾部),不写回 systemPrompt。
                    return {
                        message: {
                            customType: "relevant-memories",
                            content: prepend,
                            display: prepend,
                        },
                    };
                }
            }
            return undefined;
        };
    }
    /** agent_end: normalize pi messages into the OpenClaw { role, content } shape. */
    function adaptAgentEnd(handler) {
        return async (event, ctx) => {
            const messages = Array.isArray(event.messages)
                ? event.messages.map((m) => ({
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
    function adaptAfterToolCall(handler) {
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
    function adaptBeforeReset(handler) {
        return async (event, ctx) => {
            if (event.reason !== "new")
                return undefined;
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
    function adaptSessionBoundaryCommand(actionForReason) {
        return (handler) => {
            return async (event, ctx) => {
                const action = actionForReason(event.reason);
                if (!action)
                    return undefined;
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
    function sessionMessagesOf(ctx) {
        const entries = ctx.sessionManager?.getEntries?.() ?? [];
        return entries
            .filter((e) => e?.type === "message" && e?.message)
            .map((e) => ({
            role: typeof e.message.role === "string" ? e.message.role : "unknown",
            content: e.message.content,
        }));
    }
    // ---------------------------------------------------------------------------
    // Service lifecycle
    // ---------------------------------------------------------------------------
    let service;
    let serviceStarted = false;
    // ---------------------------------------------------------------------------
    // Embedded runner wiring
    // ---------------------------------------------------------------------------
    const runEmbeddedPiAgent = async (params) => {
        const prompt = typeof params.prompt === "string" ? params.prompt : "";
        if (!prompt)
            throw new Error("runEmbeddedPiAgent: missing prompt");
        return runEmbeddedPiViaCli({
            prompt,
            timeoutMs: typeof params.timeoutMs === "number" ? params.timeoutMs : 60_000,
            thinkLevel: typeof params.thinkLevel === "string" ? params.thinkLevel : "off",
            sessionId: typeof params.sessionId === "string" ? params.sessionId : undefined,
            workspaceDir: typeof params.workspaceDir === "string" ? params.workspaceDir : undefined,
        });
    };
    const api = {
        logger,
        resolvePath: resolvePathImpl,
        pluginConfig,
        config: globalConfig,
        on(event, handler, _options) {
            switch (event) {
                case "message_received":
                case "before_message_write": {
                    pi.on("input", (async (piEvent, ctx) => {
                        const text = typeof piEvent.text === "string" ? piEvent.text : "";
                        if (!text)
                            return undefined;
                        const oclEvent = event === "message_received"
                            ? { content: text, from: "user" }
                            : { message: { role: "user", content: text } };
                        return handler(oclEvent, openClawCtx(ctx));
                    }));
                    break;
                }
                case "gateway_start": {
                    pi.on("session_start", wrapOnce("gateway_start", handler));
                    break;
                }
                case "before_prompt_build": {
                    pi.on("before_agent_start", adaptBeforePromptBuild(handler));
                    break;
                }
                case "agent_end": {
                    pi.on("agent_end", adaptAgentEnd(handler));
                    break;
                }
                case "session_end": {
                    pi.on("session_shutdown", (async (piEvent, ctx) => {
                        return handler(piEvent, openClawCtx(ctx));
                    }));
                    break;
                }
                case "after_tool_call": {
                    pi.on("tool_result", adaptAfterToolCall(handler));
                    break;
                }
                case "before_reset": {
                    pi.on("session_before_switch", adaptBeforeReset(handler));
                    break;
                }
                default:
                    logger.debug(`on("${event}"): no pi mapping; handler skipped`);
            }
        },
        registerHook(name, handler, _options) {
            switch (name) {
                case "agent:bootstrap": {
                    pi.on("session_start", (async (piEvent, ctx) => {
                        const oclEvent = {
                            context: { workspaceDir: ctx.cwd, bootstrapFiles: [] },
                            sessionKey: sessionKeyOf(ctx),
                        };
                        return handler(oclEvent, openClawCtx(ctx));
                    }));
                    break;
                }
                case "command:new": {
                    pi.on("session_before_switch", adaptSessionBoundaryCommand((reason) => (reason === "new" ? "new" : undefined))(handler));
                    break;
                }
                case "command:reset": {
                    // pi's /fork emits session_before_fork (session_before_switch never
                    // carries a "fork" reason in 0.83), so map both to the reset action.
                    pi.on("session_before_switch", adaptSessionBoundaryCommand((reason) => (reason === "fork" ? "reset" : undefined))(handler));
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
                    }));
                    break;
                }
                default:
                    logger.debug(`registerHook("${name}"): no pi mapping; handler skipped`);
            }
        },
        registerTool(factory, _options) {
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
                async execute(toolCallId, params, signal, onUpdate, ctx) {
                    const runtimeCtx = {
                        ...ctx,
                        agentId: AGENT_ID,
                        sessionKey: sessionKeyOf(ctx),
                        sessionId: ctx.sessionManager?.getSessionId?.() ?? "unknown",
                    };
                    const result = await def.execute(toolCallId, params, signal, onUpdate, runtimeCtx);
                    return { content: result?.content ?? [], details: result?.details ?? {} };
                },
            });
        },
        registerCli(factory, _options) {
            // The factory (createMemoryCLI) mutates the program it receives; a
            // commander program cannot be safely parseAsync()'d more than once, so
            // build a fresh program for every /memory-pro invocation.
            const names = _options?.commands;
            const commandName = Array.isArray(names) && names.length > 0 ? names[0] : "memory-pro";
            pi.registerCommand(commandName, {
                description: "memory-lancedb-pro management CLI",
                handler: async (args, _ctx) => {
                    const program = new Command();
                    factory({ program });
                    const argv = ["memory-pro", ...args.split(/\s+/).filter((s) => s.length > 0)];
                    await program.parseAsync(argv, { from: "user" });
                },
            });
        },
        registerService(svc) {
            service = svc;
        },
        registerMemoryCapability(_capability) {
            logger.debug("registerMemoryCapability: no pi equivalent; ignored");
        },
        registerMemoryRuntime(_runtime) {
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
        if (serviceStarted || !service)
            return;
        serviceStarted = true;
        try {
            await service.start?.();
        }
        catch (err) {
            logger.warn(`service start failed: ${String(err)}`);
        }
    }));
    pi.on("session_shutdown", (async (event) => {
        if (!serviceStarted || !service)
            return;
        const reason = typeof event?.reason === "string" ? event.reason : "";
        if (reason !== "quit" && reason !== "reload")
            return;
        serviceStarted = false;
        // Let in-flight auto-capture / reflection writes drain before destroying
        // the store (pi -p non-interactive runs exit right after shutdown).
        await new Promise((resolve) => setTimeout(resolve, stopGraceMs));
        try {
            await service.stop?.();
        }
        catch (err) {
            logger.warn(`service stop failed: ${String(err)}`);
        }
    }));
    return { api, pluginConfig, settings };
}
