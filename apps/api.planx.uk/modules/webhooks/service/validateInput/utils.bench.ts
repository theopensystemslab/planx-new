import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { bench, describe } from "vitest";
import { isCleanHTML, isObjectValid } from "./utils.js";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "__fixtures__");

const loadFlowData = (filename: string): unknown | null => {
  const path = join(fixturesDir, filename);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf-8")) : null;
};

const FLOWS = [
  { name: "A4", file: "a4.data.json" },
  { name: "GDPO", file: "gdpo.data.json" },
];

const isCleanHTMLWithPrecheck = (input: unknown): boolean => {
  // Narrow down list of strings to run through DOMPurify
  if (typeof input === "string" && !input.includes("<") && !input.includes("&"))
    return true;
  return isCleanHTML(input);
};

const countStrings = (
  input: unknown,
): { strings: number; htmlCandidates: number } => {
  let strings = 0;
  let htmlCandidates = 0;
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) {
      v.forEach(walk);
    } else if (v !== null && typeof v === "object") {
      for (const k in v) walk((v as Record<string, unknown>)[k]);
    } else if (typeof v === "string") {
      strings++;
      if (v.includes("<") || v.includes("&")) htmlCandidates++;
    }
  };
  walk(input);
  return { strings, htmlCandidates };
};

for (const { name, file } of FLOWS) {
  const data = loadFlowData(file);

  describe(`clean-html: ${name}`, () => {
    const { strings, htmlCandidates } = countStrings(data);

    console.log(`[gpdo-timing] ${name} fixture`, {
      strings,
      htmlCandidates,
      precheckSkips: strings - htmlCandidates,
    });

    bench("current", () => {
      isObjectValid(data, isCleanHTML);
    });

    bench("with precheck", () => {
      isObjectValid(data, isCleanHTMLWithPrecheck);
    });
  });
}
