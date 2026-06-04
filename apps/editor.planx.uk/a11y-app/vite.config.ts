import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import type { ChildProcess } from "node:child_process";
import type { ServerResponse } from "node:http";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const EDITOR_ROOT = path.resolve(dirname, "..");
const RESULTS_JSON = path.join(EDITOR_ROOT, "a11y-app/vitest-results.json");

let activeProcess: ChildProcess | null = null;
const sseClients = new Set<ServerResponse>();

function broadcast(line: string) {
  for (const res of sseClients) {
    res.write(`data: ${JSON.stringify(line)}\n\n`);
  }
}

export default defineConfig({
  // root must point at a11y-app/ so Vite finds index.html here, not at editor root
  root: dirname,
  server: { port: 3001 },
  plugins: [
    react(),
    tsconfigPaths({ root: EDITOR_ROOT }),
    {
      name: "a11y-api",
      configureServer(server) {
        // GET /api/results — serve current vitest-results.json
        server.middlewares.use("/api/results", (req, res, next) => {
          if (req.method !== "GET") return next();
          try {
            res.setHeader("Content-Type", "application/json");
            res.end(readFileSync(RESULTS_JSON, "utf-8"));
          } catch {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "no results yet" }));
          }
        });

        // POST /api/run — spawn pnpm test-storybook
        server.middlewares.use("/api/run", (req, res, next) => {
          if (req.method !== "POST") return next();
          if (activeProcess) {
            res.statusCode = 409;
            res.end(JSON.stringify({ error: "already running" }));
            return;
          }
          // cwd must be EDITOR_ROOT so vitest-results.json lands in the right place
          activeProcess = spawn("pnpm", ["test-storybook"], {
            cwd: EDITOR_ROOT,
            env: { ...process.env },
          });
          activeProcess.stdout?.on("data", (c: Buffer) =>
            broadcast(c.toString()),
          );
          activeProcess.stderr?.on("data", (c: Buffer) =>
            broadcast(c.toString()),
          );
          activeProcess.on("close", (code: number | null) => {
            broadcast(`__done__:${code ?? 1}`);
            activeProcess = null;
            sseClients.clear();
          });
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ started: true }));
        });

        // GET /api/stream — SSE endpoint for live test output
        server.middlewares.use("/api/stream", (req, res, next) => {
          if (req.method !== "GET") return next();
          res.setHeader("Content-Type", "text/event-stream");
          res.setHeader("Cache-Control", "no-cache");
          res.setHeader("Connection", "keep-alive");
          res.setHeader("X-Accel-Buffering", "no");
          res.flushHeaders();
          sseClients.add(res);
          req.on("close", () => sseClients.delete(res));
        });
      },
    },
  ],
});
