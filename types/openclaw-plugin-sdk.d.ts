/**
 * OpenClaw plugin SDK type stub — Pi adaptation.
 *
 * This repository was originally an OpenClaw plugin. The pi-agent port keeps
 * the internal plugin API surface (index.ts, src/tools.ts) unchanged and
 * provides a runtime implementation of this interface in `pi-adapter/`.
 * The types below describe the subset of the OpenClaw plugin SDK that the
 * ported code actually consumes.
 */
declare module "openclaw/plugin-sdk" {
  export interface OpenClawLogger {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
  }

  export interface OpenClawToolDefinition {
    name: string;
    label: string;
    description: string;
    parameters: unknown;
    promptSnippet?: string;
    promptGuidelines?: string[];
    execute(
      toolCallId: string,
      params: unknown,
      signal?: AbortSignal,
      onUpdate?: (partial: unknown) => void,
      ctx?: unknown,
    ): Promise<{ content: Array<{ type: string; text?: string; [k: string]: unknown }>; details: unknown }>;
  }

  export interface OpenClawRuntimeAgent {
    runEmbeddedPiAgent(params: Record<string, unknown>): Promise<unknown>;
  }

  export interface OpenClawPluginApi {
    logger: OpenClawLogger;
    resolvePath(path: string): string;
    registerTool(factory: (toolCtx: Record<string, unknown>) => OpenClawToolDefinition, options?: Record<string, unknown>): void;
    registerHook?(name: string, handler: (event: any, ctx: any) => any, options?: Record<string, unknown>): void;
    registerCli?(factory: (host: { program: unknown }) => unknown, options?: Record<string, unknown>): void;
    registerService?(service: { id: string; start: () => Promise<void>; stop?: () => Promise<void> }): void;
    registerMemoryCapability?(capability: unknown): void;
    registerMemoryRuntime?(runtime: unknown): void;
    on(event: string, handler: (event: any, ctx: any) => any, options?: Record<string, unknown>): void;
    runtime?: { agent?: OpenClawRuntimeAgent };
    pluginConfig?: unknown;
    config?: unknown;
    [key: string]: any;
  }
}
