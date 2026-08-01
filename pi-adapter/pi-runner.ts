/**
 * Embedded pi agent runner — Pi port.
 *
 * OpenClaw ran reflection/dreaming sub-agents through
 * `api.runtime.agent.runEmbeddedPiAgent`. Pi has no in-process equivalent
 * exposed to extensions, so the port shells out to the `pi` CLI in
 * non-interactive JSON mode:
 *
 *   pi --mode json --no-tools -p --session-dir <tmp> --session-id <id> "<prompt>"
 *
 * stdout is a JSONL event stream; assistant text blocks are extracted and
 * returned as `{ payloads: [{ text }] }` to match the OpenClaw contract.
 */
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface EmbeddedPiRunParams {
  prompt: string;
  timeoutMs: number;
  thinkLevel?: string;
  sessionId?: string;
  workspaceDir?: string;
}

export interface EmbeddedPiRunResult {
  payloads: Array<{ text: string }>;
}

function parseJsonlPayloads(stdout: string): Array<{ text: string }> {
  const payloads: Array<{ text: string }> = [];
  const seen = new Set<string>();
  const pushText = (text: unknown) => {
    if (typeof text !== "string" || text.trim().length === 0) return;
    const key = text.slice(0, 80);
    if (seen.has(key)) return;
    seen.add(key);
    payloads.push({ text });
  };

  const extractFromMessage = (obj: Record<string, unknown>): void => {
    const message = obj.message;
    if (!message || typeof message !== "object") return;
    const m = message as Record<string, unknown>;
    const role = typeof m.role === "string" ? m.role : "";
    if (role !== "assistant") return;
    const content = m.content;
    if (typeof content === "string") {
      pushText(content);
      return;
    }
    if (Array.isArray(content)) {
      for (const block of content) {
        if (block && typeof block === "object") {
          const b = block as Record<string, unknown>;
          if (b.type === "text" && typeof b.text === "string") pushText(b.text);
        }
      }
    }
  };

  for (const line of stdout.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (!parsed || typeof parsed !== "object") continue;
    const obj = parsed as Record<string, unknown>;
    extractFromMessage(obj);
    // Some modes emit plain message objects without a wrapping "message" key.
    if (obj.role === "assistant" && typeof obj.content !== "undefined") {
      const content = obj.content;
      if (typeof content === "string") pushText(content);
      else if (Array.isArray(content)) {
        for (const block of content) {
          if (block && typeof block === "object") {
            const b = block as Record<string, unknown>;
            if (b.type === "text" && typeof b.text === "string") pushText(b.text);
          }
        }
      }
    }
  }
  return payloads;
}

export async function runEmbeddedPiViaCli(params: EmbeddedPiRunParams): Promise<EmbeddedPiRunResult> {
  const cliBin = process.env.PI_CLI_BIN?.trim() || "pi";
  const sessionDir = mkdtempSync(join(tmpdir(), "pi-reflection-"));
  const sessionId = params.sessionId ?? `memory-reflection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const outerTimeoutMs = Math.max(params.timeoutMs + 8000, 20000);
  const thinkLevel = params.thinkLevel ?? "off";

  const args = [
    "--mode", "json",
    "--no-tools",
    "--no-skills",
    "--no-context-files",
    "--no-extensions",
    "--thinking", thinkLevel,
    "--session-dir", sessionDir,
    "--session-id", sessionId,
    "-p",
    params.prompt,
  ];

  return await new Promise<EmbeddedPiRunResult>((resolve, reject) => {
    const child = spawn(cliBin, args, {
      cwd: params.workspaceDir ?? process.cwd(),
      env: { ...process.env, NO_COLOR: "1", PI_OFFLINE: "0" },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 1500).unref();
    }, outerTimeoutMs);

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => { stderr += chunk; });

    child.once("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(`spawn ${cliBin} failed: ${err.message}`));
    });

    child.once("close", (code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      if (timedOut) {
        reject(new Error(`${cliBin} timed out after ${outerTimeoutMs}ms`));
        return;
      }
      if (signal) {
        reject(new Error(`${cliBin} exited by signal ${signal}. stderr=${stderr.slice(0, 400)}`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`${cliBin} exited with code ${code}. stderr=${stderr.slice(0, 400)}`));
        return;
      }

      const payloads = parseJsonlPayloads(stdout);
      if (payloads.length === 0) {
        reject(new Error(`pi JSON stream returned no assistant text. stdout=${stdout.slice(0, 400)}`));
        return;
      }
      resolve({ payloads });
    });
  });
}

export function piCliBinName(): string {
  return process.env.PI_CLI_BIN?.trim() || "pi";
}
